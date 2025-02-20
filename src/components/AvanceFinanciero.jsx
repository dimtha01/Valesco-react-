"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import showNotification, { formatearFechaUTC, UrlApi } from "../utils/utils"

const AvanceFinanciero = () => {
  const params = useParams()
  const [avancesFinancieros, setAvancesFinancieros] = useState([])
  const [proyecto, setProyecto] = useState(null)
  const [nuevoAvance, setNuevoAvance] = useState({
    numero_valuacion: "",
    monto_usd: "",
    fecha_inicio: "",
    fecha_fin: "",
  })
  const [valuacionSeleccionada, setValuacionSeleccionada] = useState(null) // Estado para la valuación seleccionada
  const [mostrarModal, setMostrarModal] = useState(false) // Estado para controlar el modal
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5 // Máximo de filas por página

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(avancesFinancieros.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Datos paginados
  const paginatedData = avancesFinancieros.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Función para cargar los avances financieros
  const fetchAvancesFinancieros = useCallback(async () => {
    try {
      const response = await fetch(`${UrlApi}/api/avanceFinanciero/${params.id}`)

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json() // Obtener el cuerpo de la respuesta de error
        throw new Error(errorData.message || "Error al cargar los avances financieros")
      }

      const data = await response.json()

      // Verificar si la API devuelve un mensaje cuando no hay datos
      if (data.length === 0) {
        const apiMessage = data.message || "No se encontraron avances financieros para este proyecto."
        showNotification("info", "Sin datos", apiMessage)
        setAvancesFinancieros([]) // Asegurarse de limpiar los avances financieros
        return
      }

      // Actualizar el estado con los datos obtenidos
      setAvancesFinancieros(data)
    } catch (error) {
      console.error("Error al cargar los avances financieros:", error)
      showNotification(
        "error",
        "Error",
        error.message || "Ocurrió un problema al cargar los avances financieros. Por favor, inténtalo de nuevo.",
      )
    }
  }, [params.id])

  // Función para cargar el proyecto por ID
  const fetchProyectoById = useCallback(async () => {
    try {
      const response = await fetch(`${UrlApi}/api/proyectos/${params.id}`)
      if (!response.ok) {
        throw new Error("Error al cargar el proyecto")
      }
      const data = await response.json()

      if (!data || Object.keys(data).length === 0) {
        showNotification("info", "Sin datos", "No se encontró información para este proyecto.")
        setProyecto(null)
        return
      }

      setProyecto(data)
    } catch (error) {
      console.error("Error al cargar el proyecto:", error)
      showNotification("error", "Error", "Ocurrió un problema al cargar el proyecto. Por favor, inténtalo de nuevo.")
    }
  }, [params.id])

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    fetchAvancesFinancieros()
    fetchProyectoById()
  }, [fetchAvancesFinancieros, fetchProyectoById])

  // Manejar cambios en los campos numéricos
  const handleChangeNumero = (e, campo) => {
    const value = e.target.value
    if (!isNaN(value)) {
      setNuevoAvance({ ...nuevoAvance, [campo]: value })
    }
  }

  const isNumeroValuacionUnico = (numeroValuacion) => {
    return !avancesFinancieros.some((avance) => avance.numero_valuacion === numeroValuacion)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nuevoAvance.fecha_inicio || !nuevoAvance.fecha_fin) {
      showNotification(
        "warning",
        "Campos incompletos",
        "Por favor, completa todos los campos antes de agregar el avance financiero.",
      )
      return
    }

    if (new Date(nuevoAvance.fecha_fin) < new Date(nuevoAvance.fecha_inicio)) {
      showNotification("error", "Fechas inválidas", "La fecha de fin no puede ser anterior a la fecha de inicio.")
      return
    }

    if (!nuevoAvance.numero_valuacion || !nuevoAvance.monto_usd) {
      showNotification(
        "warning",
        "Campos incompletos",
        "Por favor, completa todos los campos antes de agregar el avance financiero.",
      )
      return
    }
    const sumaMontos = avancesFinancieros.reduce((total, avance) => total + Number.parseFloat(avance.monto_usd || 0), 0)
    const nuevoMonto = Number.parseFloat(nuevoAvance.monto_usd)
    if (sumaMontos + nuevoMonto > proyecto.monto_ofertado) {
      showNotification("error", "Monto excedido", "El monto ingresado supera el monto ofertado del proyecto.")
      return // Prevenir el envío del formulario
    }
    // Validar que el Número de Valuación sea único
    if (!isNumeroValuacionUnico(nuevoAvance.numero_valuacion.trim())) {
      showNotification(
        "error",
        "Número de Valuación duplicado",
        "El Número de Valuación ya existe. Por favor, ingresa uno diferente.",
      )
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/avanceFinanciero`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_proyecto: Number.parseInt(params.id),
          fecha: new Date().toISOString().split("T")[0],
          numero_valuacion: nuevoAvance.numero_valuacion.trim(),
          monto_usd: Number.parseFloat(nuevoAvance.monto_usd),
          fecha_inicio: nuevoAvance.fecha_inicio,
          fecha_fin: nuevoAvance.fecha_fin,
          id_estatus_proceso: obtenerIdEstatus("Por Valuar"),
        }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar el avance financiero")
      }

      setNuevoAvance({
        numero_valuacion: "",
        monto_usd: "",
        fecha_inicio: "",
        fecha_fin: "",
      })
      fetchAvancesFinancieros()
      showNotification("success", "Éxito", "El avance financiero ha sido agregado exitosamente.")
    } catch (error) {
      console.error("Error al agregar el avance financiero:", error)
      showNotification(
        "error",
        "Error",
        "Ocurrió un problema al agregar el avance financiero. Por favor, inténtalo de nuevo.",
      )
    }
  }

  // Manejar clic en una fila
  const handleRowClick = (avance) => {
    setValuacionSeleccionada(avance) // Guardar la valuación seleccionada
    setMostrarModal(true) // Mostrar el modal
  }

  const handleChangeEstado = async (id, nuevoEstado, numeroFactura = null) => {
    try {
      if (nuevoEstado === "Facturado" && !numeroFactura) {
        showNotification("error", "Error", "Debe ingresar un número de factura para cambiar el estado a Facturado.")
        return
      }

      const body = {
        id_estatus_proceso: obtenerIdEstatus(nuevoEstado),
      }

      if (nuevoEstado === "Facturado") {
        body.numero_factura = numeroFactura
      }

      const response = await fetch(`${UrlApi}/api/avanceFinanciero/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de la valuación")
      }

      // Actualizar la lista de avances financieros
      fetchAvancesFinancieros()
      setMostrarModal(false) // Cerrar el modal
      showNotification("success", "Éxito", "El estado de la valuación ha sido actualizado exitosamente.")
    } catch (error) {
      console.error("Error al actualizar el estado de la valuación:", error)
      showNotification(
        "error",
        "Error",
        "Ocurrió un problema al actualizar el estado de la valuación. Por favor, inténtalo de nuevo.",
      )
    }
  }

  const getValidOptions = (estadoActual) => {
    switch (estadoActual) {
      case "Por Valuar":
        return ["Por Facturar"]
      case "Por Facturar":
        return ["Facturado"]
      case "Facturado":
        return []
      default:
        return []
    }
  }
  // Función para mapear el estatus del proceso a un ID entero
  const obtenerIdEstatus = (estatus) => {
    const estatusMap = {
      "En Elaboración de Valuación": 1,
      "En Revisión por el Cliente": 2,
      "Valuación Aprobada": 3,
      "Por Valuar": 4,
      "Por Facturar": 5,
      Facturado: 6,
    }
    return estatusMap[estatus] || null
  }

 

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Administración de Contratos</h1>
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl">
            {/* Campo: Número de Valuación */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#000000]">Número de Valuación</span>
              </div>
              <input
                type="text"
                name="numero_valuacion"
                placeholder="Ingrese el número de valuación"
                className="input input-bordered w-full bg-[#f0f0f0]"
                value={nuevoAvance.numero_valuacion}
                onChange={(e) => setNuevoAvance({ ...nuevoAvance, numero_valuacion: e.target.value })}
                required
              />
            </label>

            {/* Campo: Monto (USD) */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#000000]">Monto (USD)</span>
              </div>
              <input
                type="number"
                step="0.01"
                name="monto_usd"
                placeholder="Ingrese el monto en USD"
                className="input input-bordered w-full bg-[#f0f0f0]"
                value={nuevoAvance.monto_usd}
                onChange={(e) => handleChangeNumero(e, "monto_usd")}
                min="0"
                required
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#000000]">Fecha de Inicio</span>
              </div>
              <input
                type="date"
                name="fecha_inicio"
                className="input input-bordered w-full bg-[#f0f0f0]"
                value={nuevoAvance.fecha_inicio}
                onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_inicio: e.target.value })}
                required
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#000000]">Fecha de Fin</span>
              </div>
              <input
                type="date"
                name="fecha_fin"
                className="input input-bordered w-full bg-[#f0f0f0]"
                value={nuevoAvance.fecha_fin}
                onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_fin: e.target.value })}
                min={nuevoAvance.fecha_inicio}
                required
              />
            </label>
          </div>

          {/* Botón de envío */}
          <div className="flex justify-center mt-6 w-full">
            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto px-6"
              aria-label="Agregar avance financiero"
            >
              Agregar
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de avances financieros */}
      <div className="text-[#141313] xl:mx-20 mt-2">
        <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-700">Registro de Avances Financieros</h2>
            </div>

            <div className="overflow-x-auto min-h-[310px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider  hidden md:table-cell">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider  hidden md:table-cell">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                      Número de Valuación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                      Monto (USD)
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Fecha Inicio
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                      Fecha Fin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider  hidden md:table-cell">
                      Número de Factura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">
                      Estatus
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-gray-500">
                        No hay datos disponibles.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((avance) => (
                      <tr
                        key={avance.id}
                        onClick={() => handleRowClick(avance)}
                        className="cursor-pointer hover:bg-gray-200 transition duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900  hidden md:table-cell">
                          {avance.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900  hidden md:table-cell">
                          {new Date(avance.fecha).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ">
                          {avance.numero_valuacion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ">
                          ${avance.monto_usd}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 borde text-center">
                          {formatearFechaUTC(avance.fecha_inicio)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 borde text-center">
                          {formatearFechaUTC(avance.fecha_fin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900  hidden md:table-cell">
                          {avance.numero_factura || "No hay factura"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ">
                          {avance.estatus_proceso_nombre}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2  text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(avancesFinancieros.length / rowsPerPage)}
                className="ml-3 relative inline-flex items-center px-4 py-2  text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> a{" "}
                  <span className="font-medium">{Math.min(currentPage * rowsPerPage, avancesFinancieros.length)}</span>{" "}
                  de <span className="font-medium">{avancesFinancieros.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md  bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(avancesFinancieros.length / rowsPerPage)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md  bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {mostrarModal && valuacionSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Cambiar estado de la valuación</h2>
            <p>
              <strong>Número de Valuación:</strong> {valuacionSeleccionada.numero_valuacion}
            </p>
            <p>
              <strong>Estado actual:</strong> {valuacionSeleccionada.estatus_proceso_nombre}
            </p>
            {valuacionSeleccionada.estatus_proceso_nombre !== "Facturado" && (
              <>
                <label className="block mt-4">
                  <span className="font-semibold">Nuevo estado:</span>
                  <select
                    id="nuevoEstado"
                    className="mt-1 block w-full border border-gray-950 rounded-md p-2"
                    defaultValue={valuacionSeleccionada.estatus_proceso_nombre}
                  >
                    {getValidOptions(valuacionSeleccionada.estatus_proceso_nombre).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                {valuacionSeleccionada.estatus_proceso_nombre === "Por Facturar" && (
                  <div className="mt-4">
                    <label className="block">
                      <span className="font-semibold">Número de Factura:</span>
                      <input
                        type="text"
                        id="numeroFactura"
                        className="mt-1 block w-full border border-gray-950 rounded-md p-2"
                        required
                      />
                    </label>
                  </div>
                )}
                <div className="flex justify-end mt-4">
                  <button className="mr-2 px-4 py-2 bg-gray-300 rounded" onClick={() => setMostrarModal(false)}>
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => {
                      const nuevoEstado = document.getElementById("nuevoEstado").value
                      const numeroFactura = document.getElementById("numeroFactura")?.value
                      handleChangeEstado(valuacionSeleccionada.id, nuevoEstado, numeroFactura)
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </>
            )}
            {valuacionSeleccionada.estatus_proceso_nombre === "Facturado" && (
              <>
                <p className="mt-4">
                  El estado de esta valuación ya es <strong>Facturado</strong>. No se permite realizar cambios
                  adicionales.
                </p>
                <div className="flex justify-end mt-4">
                  <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setMostrarModal(false)}>
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AvanceFinanciero

