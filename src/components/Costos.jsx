"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import showNotification, { formatearFechaUTC, UrlApi } from "../utils/utils"
import Swal from "sweetalert2"
import LoadingBar from "./LoadingBar"

// Función local para formatear montos con separador de miles (formato: 1,234,567.89)
const formatMontoConSeparador = (amount) => {
  if (amount === null || amount === undefined) return "0.00"

  // Formatea con el estilo en-US (comas para miles, punto para decimales) y sin símbolo de moneda
  const numericValue = Number(amount)
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true, // Esto asegura que se use el separador de miles
  }).format(numericValue)
}

const Costos = () => {
  const params = useParams()
  const [costos, setCostos] = useState([])
  const [costoOfertado, setCostoOfertado] = useState(0)
  const [costoTotal, setCostoTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [error, setError] = useState(null)

  // Estados para el modal de cambio de estatus
  const [mostrarModalEstatus, setMostrarModalEstatus] = useState(false)
  const [costoSeleccionado, setCostoSeleccionado] = useState(null)
  // Actualizar el estado estatusOptions para que coincida con los estatus de AvanceFinanciero
  const [estatusOptions, setEstatusOptions] = useState([
    { id: 4, nombre: "Por Valuar" },
    { id: 5, nombre: "Por Facturar" },
    { id: 6, nombre: "Facturado" },
  ])

  // Estado para el formulario
  const [nuevoCosto, setNuevoCosto] = useState({
    costo: "",
    fecha_inicio: "",
    fecha_fin: "",
  })

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(costos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Datos paginados
  const paginatedData = costos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(costos.length / rowsPerPage)

  // Actualizar la función getEstatusColor para que coincida con los colores de AvanceFinanciero
  const getEstatusColor = (estatusNombre) => {
    if (!estatusNombre) return "bg-gray-100 text-gray-800"

    const nombreLower = estatusNombre.toLowerCase()
    if (nombreLower.includes("por valuar")) return "bg-blue-100 text-blue-800"
    if (nombreLower.includes("por facturar")) return "bg-yellow-100 text-yellow-800"
    if (nombreLower.includes("facturado")) return "bg-green-100 text-green-800"

    // Color por defecto
    return "bg-gray-100 text-gray-800"
  }

  // Actualizar la función getValidOptions para que coincida con las transiciones de AvanceFinanciero
  const getValidOptions = (estatusActual) => {
    switch (estatusActual) {
      case "Por Valuar":
        return estatusOptions.filter((e) => e.nombre === "Por Facturar")
      case "Por Facturar":
        return estatusOptions.filter((e) => e.nombre === "Facturado")
      case "Facturado":
        return []
      default:
        return estatusOptions
    }
  }

  // Función para cargar los costos
  const fetchCostos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${UrlApi}/api/costos/${params.id}`)
      if (!response.ok) {
        throw new Error("Error al cargar los costos")
      }
      const data = await response.json()
      setCostos(data.costos || [])
      setCostoOfertado(Number(data.costosOfertado) || 0)

      // Calcular el costo total
      const total = data.costos.reduce((sum, costo) => sum + Number(costo.costo), 0)
      setCostoTotal(total)

      if (data.costos.length === 0) {
        showNotification("info", "Sin datos", "No se encontraron costos para este proyecto.")
      }
      setError(null)
    } catch (error) {
      console.error("Error al cargar los costos:", error)
      setError("Ocurrió un problema al cargar los costos. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCostos()
  }, [params.id])

  const handleChangeNumero = (e) => {
    const value = e.target.value
    if (!isNaN(value)) {
      setNuevoCosto({ ...nuevoCosto, costo: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nuevoCosto.costo || !nuevoCosto.fecha_inicio || !nuevoCosto.fecha_fin) {
      showNotification("warning", "Campos incompletos", "Por favor, completa todos los campos antes de agregar.")
      return
    }

    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (new Date(nuevoCosto.fecha_fin) < new Date(nuevoCosto.fecha_inicio)) {
      showNotification("error", "Fechas inválidas", "La fecha de fin no puede ser anterior a la fecha de inicio.")
      return
    }

    const nuevoCostoNumerico = Number(nuevoCosto.costo)
    const nuevoTotal = costoTotal + nuevoCostoNumerico
    const montoSobrepasado = nuevoTotal > costoOfertado ? nuevoTotal - costoOfertado : 0

    if (montoSobrepasado > 0) {
      const result = await Swal.fire({
        title: "¡Atención!",
        text: `Este costo sobrepasa el costo ofertado por ${formatMontoConSeparador(montoSobrepasado)}. ¿Desea agregarlo de todos modos?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, agregar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) {
        return
      }
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${UrlApi}/api/costos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_proyecto: Number.parseInt(params.id),
          fecha: new Date().toISOString().split("T")[0],
          costo: nuevoCostoNumerico,
          monto_sobrepasado: montoSobrepasado,
          fecha_inicio: nuevoCosto.fecha_inicio,
          fecha_fin: nuevoCosto.fecha_fin,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar el costo")
      }

      setNuevoCosto({
        costo: "",
        fecha_inicio: "",
        fecha_fin: "",
      })
      fetchCostos()
      showNotification("success", "Éxito", "El costo ha sido agregado exitosamente.")
    } catch (error) {
      console.error("Error al agregar el costo:", error)
      showNotification("error", "Error", "Ocurrió un problema al agregar el costo. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para manejar el clic en una fila y abrir el modal de cambio de estatus
  const handleRowClick = (costo) => {
    setCostoSeleccionado(costo)
    setMostrarModalEstatus(true)
  }

  // Función para cambiar el estatus de un costo
  const handleChangeEstado = async () => {
    if (!costoSeleccionado) return

    const nuevoEstatusId = document.getElementById("nuevoEstatus").value

    if (!nuevoEstatusId) {
      Swal.fire({
        icon: "warning",
        title: "Selección requerida",
        text: "Por favor, seleccione un nuevo estatus.",
      })
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/costos/estatus/${costoSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_estatus: Number(nuevoEstatusId) }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estatus del costo")
      }

      // Actualizar la lista de costos
      fetchCostos()
      setMostrarModalEstatus(false) // Cerrar el modal

      Swal.fire({
        icon: "success",
        title: "Estatus actualizado",
        text: "El estatus del costo ha sido actualizado exitosamente.",
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error("Error al actualizar el estatus del costo:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al actualizar el estatus del costo. Por favor, inténtalo de nuevo.",
      })
    }
  }

  return (
    <>
      <div className="flex flex-col h-auto overflow-hidden p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Costos</h1>
        {costoOfertado > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Planificado (USD)</h3>
              <p className="text-lg font-bold text-gray-900">{formatMontoConSeparador(costoOfertado)}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Real (USD)</h3>
              <p className="text-lg font-bold text-green-600">{formatMontoConSeparador(costoTotal)}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col">
          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <div className="px-0 py-2 border-b border-gray-200 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Registrar Nuevo Costo</h2>
              <p className="text-sm text-gray-500">Ingrese los detalles del nuevo costo</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Campo de Costo */}
                <div className="form-control w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="costo"
                    placeholder="Ingrese el costo en USD"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={nuevoCosto.costo}
                    onChange={handleChangeNumero}
                    min="0"
                    required
                  />
                </div>

                {/* Campo de Fecha de Inicio */}
                <div className="form-control w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={nuevoCosto.fecha_inicio}
                    onChange={(e) => setNuevoCosto({ ...nuevoCosto, fecha_inicio: e.target.value })}
                    required
                  />
                </div>

                {/* Campo de Fecha de Fin */}
                <div className="form-control w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={nuevoCosto.fecha_fin}
                    onChange={(e) => setNuevoCosto({ ...nuevoCosto, fecha_fin: e.target.value })}
                    min={nuevoCosto.fecha_inicio}
                    required
                  />
                </div>
              </div>

              {/* Botón de Agregar */}
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Agregar Costo
                </button>
              </div>
            </form>
          </div>

          {isLoading ? (
            <LoadingBar />
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Registro de Costos</h2>
                <p className="text-sm text-gray-500">Detalle de costos del proyecto</p>
              </div>

              {/* Modificar la sección de la tabla para tener altura fija */}
              <div className="overflow-x-auto">
                <div className="h-[500px] overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Costo USD
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monto Sobrepasado USD
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Inicio
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Fin
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estatus
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4 text-gray-500">
                            No hay datos disponibles.
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((costo) => (
                          <tr
                            key={costo.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleRowClick(costo)}
                          >
                            <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha)}</td>
                            <td className="py-4 px-4 text-sm font-medium text-gray-900">
                              {formatMontoConSeparador(costo.costo)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              {formatMontoConSeparador(costo.monto_sobrepasado)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha_inicio)}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha_fin)}</td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstatusColor(costo.nombre_estatus)}`}
                              >
                                {costo.nombre_estatus || "-"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Paginador */}
              <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Mostrando {costos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                  {Math.min(currentPage * rowsPerPage, costos.length)} de {costos.length} resultados
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    &lt;
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md">{currentPage}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para cambiar estatus */}
      {mostrarModalEstatus && costoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Cambiar estatus del costo</h2>
            <p>
              <strong>Fecha:</strong> {formatearFechaUTC(costoSeleccionado.fecha)}
            </p>
            <p>
              <strong>Costo:</strong> {formatMontoConSeparador(costoSeleccionado.costo)} USD
            </p>
            <p>
              <strong>Estado actual:</strong>{" "}
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstatusColor(
                  costoSeleccionado.nombre_estatus,
                )}`}
              >
                {costoSeleccionado.nombre_estatus || "No definido"}
              </span>
            </p>

            {costoSeleccionado.nombre_estatus !== "Facturado" && (
              <>
                <label className="block mt-4">
                  <span className="font-semibold">Nuevo estatus:</span>
                  <select
                    id="nuevoEstatus"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Seleccione un nuevo estatus
                    </option>
                    {getValidOptions(costoSeleccionado.nombre_estatus).map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => setMostrarModalEstatus(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    onClick={handleChangeEstado}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </>
            )}

            {costoSeleccionado.nombre_estatus === "Facturado" && (
              <>
                <p className="mt-4">
                  El estado de este costo ya es <strong>Facturado</strong>. No se permite realizar cambios adicionales.
                </p>
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setMostrarModalEstatus(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Costos

