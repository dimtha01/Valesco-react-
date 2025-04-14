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

const EditarCosto = () => {
  const params = useParams()
  const [costos, setCostos] = useState([])
  const [costoOfertado, setCostoOfertado] = useState(0)
  const [costoTotal, setCostoTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [costoSeleccionado, setCostoSeleccionado] = useState(null)
  const [error, setError] = useState(null)

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    costo: "",
    fecha_inicio: "",
    fecha_fin: "",
    numero_valuacion: "", // Add numero_valuacion field
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

  // Función para abrir el modal de edición
  const handleEditarCosto = (costo) => {
    setCostoSeleccionado(costo)

    // Formatear fechas para el input date
    const formatDate = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    }

    setFormData({
      costo: costo.costo.toString(),
      fecha_inicio: formatDate(costo.fecha_inicio),
      fecha_fin: formatDate(costo.fecha_fin),
      numero_valuacion: costo.numero_valuacion || "", // Add numero_valuacion
    })

    setMostrarModal(true)
  }

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Función para actualizar el costo
  const handleActualizarCosto = async (e) => {
    e.preventDefault()

    if (!formData.costo || !formData.fecha_inicio || !formData.fecha_fin) {
      showNotification("warning", "Campos incompletos", "Por favor, completa todos los campos antes de actualizar.")
      return
    }

    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
      showNotification("error", "Fechas inválidas", "La fecha de fin no puede ser anterior a la fecha de inicio.")
      return
    }

    const costoNumerico = Number(formData.costo)

    // Calcular el nuevo costo total (restando el costo anterior y sumando el nuevo)
    const nuevoTotal = costoTotal - Number(costoSeleccionado.costo) + costoNumerico
    const montoSobrepasado = nuevoTotal > costoOfertado ? nuevoTotal - costoOfertado : 0

    if (montoSobrepasado > 0) {
      const result = await Swal.fire({
        title: "¡Atención!",
        text: `Este costo sobrepasa el costo ofertado por ${formatMontoConSeparador(montoSobrepasado)}. ¿Desea actualizarlo de todos modos?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, actualizar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) {
        return
      }
    }

    try {
      const response = await fetch(`${UrlApi}/api/costos/${costoSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          costo: costoNumerico,
          monto_sobrepasado: montoSobrepasado,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
          numero_valuacion: formData.numero_valuacion, // Add numero_valuacion
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el costo")
      }

      setMostrarModal(false)
      fetchCostos()
      showNotification("success", "Éxito", "El costo ha sido actualizado exitosamente.")
    } catch (error) {
      console.error("Error al actualizar el costo:", error)
      showNotification("error", "Error", "Ocurrió un problema al actualizar el costo. Por favor, inténtalo de nuevo.")
    }
  }

  return (
    <div className="flex flex-col h-auto overflow-hidden p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar Costos</h1>
      {costoOfertado > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Planificado</h3>
            <p className="text-lg font-bold text-gray-900">{formatMontoConSeparador(costoOfertado)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Real</h3>
            <p className="text-lg font-bold text-green-600">{formatMontoConSeparador(costoTotal)}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <LoadingBar />
      ) : (
        <div className="flex flex-col">
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
                        N° Valuación del Proveedor
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Costo (USD)
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto Sobrepasado
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Inicio
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Fin
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
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
                        <tr key={costo.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha)}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{costo.numero_valuacion || "-"}</td>
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">
                            {formatMontoConSeparador(costo.costo)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {formatMontoConSeparador(costo.monto_sobrepasado)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha_inicio)}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha_fin)}</td>
                          <td className="py-4 px-4 text-sm">
                            <button
                              onClick={() => handleEditarCosto(costo)}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition-colors"
                            >
                              Editar
                            </button>
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
        </div>
      )}

      {/* Información de costos totales */}

      {/* Modal para editar costo */}
      {mostrarModal && costoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Costo</h2>

            <form onSubmit={handleActualizarCosto} className="space-y-4">
              {/* Costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  name="costo"
                  value={formData.costo}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              {/* N° Valuación del Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N° Valuación del Proveedor</label>
                <input
                  type="text"
                  name="numero_valuacion"
                  value={formData.numero_valuacion}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Fecha Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Final</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={formData.fecha_inicio}
                  required
                />
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EditarCosto
