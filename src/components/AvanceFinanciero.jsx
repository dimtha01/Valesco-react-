"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import showNotification, { formatearFechaUTC, formatMontoConSeparador, UrlApi } from "../utils/utils"
import LoadingBar from "./LoadingBar"

const AvanceFinanciero = () => {
  const params = useParams()
  const [avancesFinancieros, setAvancesFinancieros] = useState([])
  const [proyecto, setProyecto] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")

  const [nuevoAvance, setNuevoAvance] = useState({
    numero_valuacion: "",
    monto_usd: "",
    fecha_inicio: "",
    fecha_fin: "",
  })
  const [valuacionSeleccionada, setValuacionSeleccionada] = useState(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false)
  const [montoEditado, setMontoEditado] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredData.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Filtrar datos por estado
  const filteredData = avancesFinancieros.filter(
    (avance) => filterStatus === "all" || avance.estatus_proceso_nombre.toLowerCase() === filterStatus,
  )

  // Datos paginados
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)

  // Función para manejar el cambio de filtro
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value)
    setCurrentPage(1)
  }

  // Función para cargar los avances financieros
  const fetchAvancesFinancieros = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${UrlApi}/api/avanceFinanciero/${params.id}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al cargar los avances financieros")
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length === 0) {
        showNotification("info", "Sin datos", "No se encontraron avances financieros para este proyecto.")
        setAvancesFinancieros([])
      } else {
        setAvancesFinancieros(data)
      }
      setError(null)
    } catch (error) {
      console.error("Error al cargar los avances financieros:", error)
      setError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.")
      setAvancesFinancieros([])
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  // Función para cargar el proyecto por ID
  const fetchProyectoById = useCallback(async () => {
    try {
      const response = await fetch(`${UrlApi}/api/proyectos/id/${params.id}`)
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
      setError("Ocurrió un problema al cargar el proyecto. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
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
        "Por favor, completa todos los campos antes de agregar el Administración de Contratos.",
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
        "Por favor, completa todos los campos antes de agregar el Administración de Contratos.",
      )
      return
    }

    if (!proyecto) {
      showNotification("error", "Error", "No se ha cargado la información del proyecto.")
      return
    }

    const sumaMontos = avancesFinancieros.reduce((total, avance) => total + Number.parseFloat(avance.monto_usd || 0), 0)
    const nuevoMonto = Number.parseFloat(nuevoAvance.monto_usd)
    if (sumaMontos + nuevoMonto > proyecto.monto_ofertado) {
      showNotification("error", "Monto excedido", "El monto ingresado supera el monto ofertado del proyecto.")
      return
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
      setIsLoading(true)
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
        throw new Error("Error al agregar el Administración de Contratos")
      }

      setNuevoAvance({
        numero_valuacion: "",
        monto_usd: "",
        fecha_inicio: "",
        fecha_fin: "",
      })
      fetchAvancesFinancieros()
      showNotification("success", "Éxito", "El Administración de Contratos ha sido agregado exitosamente.")
    } catch (error) {
      console.error("Error al agregar el Administración de Contratos:", error)
      showNotification(
        "error",
        "Error",
        "Ocurrió un problema al agregar el Administración de Contratos. Por favor, inténtalo de nuevo.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar clic en una fila
  const handleRowClick = (avance) => {
    setValuacionSeleccionada(avance)
    setMostrarModal(true)
  }

  // Función para abrir el modal de edición de monto
  const handleEditarMonto = (avance, e) => {
    e.stopPropagation() // Evitar que se propague al handleRowClick
    setValuacionSeleccionada(avance)
    setMontoEditado(avance.monto_usd)
    setMostrarModalEdicion(true)
    // if (avance.estatus_proceso_nombre === "Por Valuar") {

    // } else {
    //   showNotification("warning", "No permitido", "Solo se puede editar el monto cuando el estado es 'Por Valuar'.")
    // }
  }

  // Función para actualizar el monto
  const handleActualizarMonto = async () => {
    if (!montoEditado || isNaN(montoEditado) || Number(montoEditado) <= 0) {
      showNotification("error", "Monto inválido", "Por favor, ingrese un monto válido mayor que cero.")
      return
    }

    // Calcular la suma total de los montos excluyendo la valuación actual
    const sumaMontos = avancesFinancieros.reduce((total, avance) => {
      // Excluir la valuación que se está editando
      if (avance.id !== valuacionSeleccionada.id) {
        return total + Number.parseFloat(avance.monto_usd || 0)
      }
      return total
    }, 0)

    // Verificar que el nuevo monto + la suma de los demás no exceda el monto ofertado
    const nuevoMontoTotal = sumaMontos + Number.parseFloat(montoEditado)
    if (nuevoMontoTotal > proyecto.monto_ofertado) {
      showNotification(
        "error",
        "Monto excedido",
        `El monto total (${formatMontoConSeparador(nuevoMontoTotal)}) superaría el monto ofertado del proyecto (${formatMontoConSeparador(proyecto.monto_ofertado)}).`,
      )
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/avanceFinanciero/monto/${valuacionSeleccionada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monto_usd: Number(montoEditado) }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el monto")
      }

      fetchAvancesFinancieros()
      setMostrarModalEdicion(false)
      showNotification("success", "Éxito", "El monto ha sido actualizado exitosamente.")
    } catch (error) {
      console.error("Error al actualizar el monto:", error)
      showNotification("error", "Error", "Ocurrió un problema al actualizar el monto. Por favor, inténtalo de nuevo.")
    }
  }

  // Modificar la función handleChangeEstado para establecer el número de factura en null cuando el estatus sea "Por Facturar" o "Por Valuar"
  const handleChangeEstado = async (id, nuevoEstado, numeroFactura = null) => {
    try {
      // Si el nuevo estado es "Facturado", se requiere un número de factura
      if (nuevoEstado === "Facturado" && !numeroFactura) {
        showNotification("error", "Error", "Debe ingresar un número de factura para cambiar el estado a Facturado.")
        return
      }

      const body = {
        id_estatus_proceso: obtenerIdEstatus(nuevoEstado),
      }

      // Asignar número de factura solo si el estado es "Facturado"
      if (nuevoEstado === "Facturado") {
        body.numero_factura = numeroFactura
      } else {
        // Para "Por Facturar" o "Por Valuar", establecer explícitamente en null
        body.numero_factura = null
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
    <div className="flex flex-col h-auto overflow-hidden p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Administración de Contratos</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col">
        {proyecto && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Monto Ofertado (USD)</h3>
              <p className="text-lg font-bold text-gray-900">{formatMontoConSeparador(proyecto.monto_ofertado || 0)}</p>
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <div className="px-0 py-2 border-b border-gray-200 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Registrar Nuevo Administración de Contratos</h2>
            <p className="text-sm text-gray-500">Ingrese los detalles del nuevo Administración de Contratos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número de Valuación */}
              <div className="form-control w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1"> N° de Valuación del Cliente</label>
                <input
                  type="text"
                  name="numero_valuacion"
                  placeholder="Ingrese el número de valuación"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoAvance.numero_valuacion}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, numero_valuacion: e.target.value })}
                  required
                />
              </div>

              {/* Monto (USD) */}
              <div className="form-control w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto USD</label>
                <input
                  type="number"
                  step="0.01"
                  name="monto_usd"
                  placeholder="Ingrese el monto en USD"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoAvance.monto_usd}
                  onChange={(e) => handleChangeNumero(e, "monto_usd")}
                  min="0"
                  required
                />
              </div>

              {/* Fecha de Inicio */}
              <div className="form-control w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoAvance.fecha_inicio}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_inicio: e.target.value })}
                  required
                />
              </div>

              {/* Fecha de Fin */}
              <div className="form-control w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoAvance.fecha_fin}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_fin: e.target.value })}
                  min={nuevoAvance.fecha_inicio}
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
                Agregar Avance
              </button>
            </div>
          </form>
        </div>

        <div className="mb-4">
          <select
            value={filterStatus}
            onChange={handleFilterChange}
            className="bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="por valuar">Por Valuar</option>
            <option value="por facturar">Por Facturar</option>
            <option value="facturado">Facturado</option>
          </select>
        </div>

        {isLoading ? (
          <LoadingBar />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Administración de Contratos</h2>

              <p className="text-sm text-gray-500">Detalle de valuaciones y facturación del proyecto</p>
            </div>

            {/* Modificar la sección de la tabla para tener altura fija */}
            <div className="overflow-x-auto">
              <div className="h-[500px] overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        ID
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número de Valuación del Cliente
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto USD
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Inicio
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Fin
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Número de Factura
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estatus del Proceso
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center py-4 text-gray-500">
                          No hay datos disponibles
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((avance) => (
                        <tr
                          key={avance.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleRowClick(avance)}
                        >
                          <td className="py-4 px-4 text-sm text-gray-500 hidden md:table-cell">{avance.id}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha)}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{avance.numero_valuacion || "-"}</td>
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">
                            {formatMontoConSeparador(avance.monto_usd)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha_inicio)}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha_fin)}</td>
                          <td className="py-4 px-4 text-sm text-gray-500 hidden md:table-cell">
                            {avance.numero_factura || "-"}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${avance.estatus_proceso_nombre.toLowerCase() === "facturado"
                                ? "bg-green-100 text-green-800"
                                : avance.estatus_proceso_nombre.toLowerCase() === "por facturar"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {avance.estatus_proceso_nombre}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleEditarMonto(avance, e)}
                              className={`bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition-colors `}

                            >
                              Editar Monto
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
                Mostrando {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                {Math.min(currentPage * rowsPerPage, filteredData.length)} de {filteredData.length} resultados
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

        {/* Información del proyecto */}
      </div>

      {/* Modal para cambiar estado */}
      {mostrarModal && valuacionSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
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
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                        required
                      />
                    </label>
                  </div>
                )}
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    onClick={() => {
                      const nuevoEstado = document.getElementById("nuevoEstado").value
                      const numeroFactura = document.getElementById("numeroFactura")?.value
                      handleChangeEstado(valuacionSeleccionada.id, nuevoEstado, numeroFactura)
                    }}
                  >
                    Guardar Cambios
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
                <div className="flex justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
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

      {/* Modal para editar monto */}
      {mostrarModalEdicion && valuacionSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Monto USD</h2>
            <p>
              <strong>Número de Valuación:</strong> {valuacionSeleccionada.numero_valuacion}
            </p>
            <p>
              <strong>Estado actual:</strong> {valuacionSeleccionada.estatus_proceso_nombre}
            </p>
            <div className="mt-4">
              <label className="block">
                <span className="font-semibold">Monto USD:</span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                  value={montoEditado}
                  onChange={(e) => setMontoEditado(e.target.value)}
                  min="0"
                  required
                />
              </label>
            </div>
            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => setMostrarModalEdicion(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleActualizarMonto}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Actualizar Monto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AvanceFinanciero

