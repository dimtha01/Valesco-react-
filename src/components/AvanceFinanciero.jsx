"use client"

import { useState, useEffect, useCallback } from "react"
import { Link, useParams } from "react-router-dom"
import showNotification, { formatearFechaUTC, formatMontoConSeparador, UrlApi } from "../utils/utils"
import LoadingBar from "./LoadingBar"
import { FiDollarSign, FiCalendar, FiFileText, FiTrendingUp } from "react-icons/fi"

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

  // Calcular métricas
  const calcularMetricas = () => {
    const totalValuaciones = avancesFinancieros.length
    const totalMonto = avancesFinancieros.reduce((sum, avance) => sum + Number.parseFloat(avance.monto_usd || 0), 0)
    const porValuar = avancesFinancieros.filter((avance) => avance.estatus_proceso_nombre === "Por Valuar").length
    const facturado = avancesFinancieros.filter((avance) => avance.estatus_proceso_nombre === "Facturado").length

    return { totalValuaciones, totalMonto, porValuar, facturado }
  }

  const metricas = calcularMetricas()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Breadcrumbs */}
      <div className="breadcrumbs text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul>
          <li>
            <Link to="/InicioAdministraciónContratos" className="flex items-center hover:text-blue-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 stroke-current mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Administración de Contratos
            </Link>
          </li>
          <li>
            <Link
              to="/InicioAdministraciónContratos/AdministracionContratos"
              className="flex items-center hover:text-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-6 w-6 stroke-current mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Gestión de Contratos
            </Link>
          </li>
          <li>{params.nombre}</li>
        </ul>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl mr-4 shadow-lg">
              <FiTrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Avance Financiero</h1>
              <p className="text-gray-600 mt-1">Gestión de valuaciones y facturación del proyecto</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded-lg shadow-sm" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium mb-1">Total Valuaciones</p>
                <p className="text-2xl font-bold text-blue-900">{metricas.totalValuaciones}</p>
                <p className="text-blue-500 text-xs mt-1">Registros totales</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <FiFileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium mb-1">Monto Total</p>
                <p className="text-2xl font-bold text-green-900">${formatMontoConSeparador(metricas.totalMonto)}</p>
                <p className="text-green-500 text-xs mt-1">USD acumulado</p>
              </div>
              <div className="bg-green-500 p-3 rounded-xl">
                <FiDollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium mb-1">Por Valuar</p>
                <p className="text-2xl font-bold text-yellow-900">{metricas.porValuar}</p>
                <p className="text-yellow-500 text-xs mt-1">Pendientes</p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-xl">
                <FiCalendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium mb-1">Facturado</p>
                <p className="text-2xl font-bold text-purple-900">{metricas.facturado}</p>
                <p className="text-purple-500 text-xs mt-1">Completados</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-xl">
                <FiTrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Información del proyecto */}
        {proyecto && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-indigo-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 mb-2">Monto Ofertado del Proyecto</h3>
                  <p className="text-3xl font-bold text-indigo-700">
                    ${formatMontoConSeparador(proyecto.monto_ofertado || 0)}
                  </p>
                  <p className="text-indigo-500 text-sm mt-1">Límite máximo disponible</p>
                </div>
                <div className="bg-indigo-500 p-4 rounded-xl">
                  <FiDollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Avance Financiero</h2>
            <p className="text-gray-600 mt-1">Ingrese los detalles del nuevo avance financiero</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Número de Valuación */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">N° de Valuación del Cliente</label>
                <input
                  type="text"
                  name="numero_valuacion"
                  placeholder="Ingrese el número de valuación"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  value={nuevoAvance.numero_valuacion}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, numero_valuacion: e.target.value })}
                  required
                />
              </div>

              {/* Monto (USD) */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Monto USD</label>
                <input
                  type="number"
                  step="0.01"
                  name="monto_usd"
                  placeholder="Ingrese el monto en USD"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  value={nuevoAvance.monto_usd}
                  onChange={(e) => handleChangeNumero(e, "monto_usd")}
                  min="0"
                  required
                />
              </div>

              {/* Fecha de Inicio */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Fecha de Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  value={nuevoAvance.fecha_inicio}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_inicio: e.target.value })}
                  required
                />
              </div>

              {/* Fecha de Fin */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Fecha de Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  value={nuevoAvance.fecha_fin}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_fin: e.target.value })}
                  min={nuevoAvance.fecha_inicio}
                  required
                />
              </div>
            </div>

            {/* Botón de Agregar */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Agregar Avance
              </button>
            </div>
          </form>
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <select
              value={filterStatus}
              onChange={handleFilterChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="por valuar">Por Valuar</option>
              <option value="por facturar">Por Facturar</option>
              <option value="facturado">Facturado</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingBar />
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Avances Financieros</h2>
              <p className="text-gray-600 text-sm mt-1">Detalle de valuaciones y facturación del proyecto</p>
            </div>

            <div className="overflow-x-auto">
              <div className="h-[500px] overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        N° Valuación
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Monto USD
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Fecha Inicio
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Fecha Fin
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        N° Factura
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white/50">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <FiFileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">No hay datos disponibles</p>
                            <p className="text-gray-400 text-sm mt-1">
                              Agregue un nuevo avance financiero para comenzar
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((avance, index) => (
                        <tr
                          key={avance.id}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200"
                          onClick={() => handleRowClick(avance)}
                        >
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">{avance.id}</td>
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                            {formatearFechaUTC(avance.fecha)}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                            {avance.numero_valuacion || "-"}
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-green-600">
                            ${formatMontoConSeparador(avance.monto_usd)}
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">{formatearFechaUTC(avance.fecha_inicio)}</td>
                          <td className="py-4 px-6 text-sm text-gray-900">{formatearFechaUTC(avance.fecha_fin)}</td>
                          <td className="py-4 px-6 text-sm text-gray-500">{avance.numero_factura || "-"}</td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${avance.estatus_proceso_nombre.toLowerCase() === "facturado"
                                  ? "bg-green-100 text-green-800"
                                  : avance.estatus_proceso_nombre.toLowerCase() === "por facturar"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {avance.estatus_proceso_nombre}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-sm" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleEditarMonto(avance, e)}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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

            {/* Paginación */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                {Math.min(currentPage * rowsPerPage, filteredData.length)} de {filteredData.length} resultados
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg shadow-sm border border-gray-200">
                  {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para cambiar estado */}
        {mostrarModal && valuacionSeleccionada && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">Cambiar Estado de Valuación</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Número de Valuación:</span>
                    <p className="text-lg font-semibold text-gray-900">{valuacionSeleccionada.numero_valuacion}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estado actual:</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {valuacionSeleccionada.estatus_proceso_nombre}
                    </p>
                  </div>
                </div>

                {valuacionSeleccionada.estatus_proceso_nombre !== "Facturado" && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nuevo estado:</label>
                        <select
                          id="nuevoEstado"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          defaultValue={valuacionSeleccionada.estatus_proceso_nombre}
                        >
                          {getValidOptions(valuacionSeleccionada.estatus_proceso_nombre).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      {valuacionSeleccionada.estatus_proceso_nombre === "Por Facturar" && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Factura:</label>
                          <input
                            type="text"
                            id="numeroFactura"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ingrese el número de factura"
                            required
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 mt-8">
                      <button
                        type="button"
                        onClick={() => setMostrarModal(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
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
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                      <p className="text-green-800">
                        El estado de esta valuación ya es <strong>Facturado</strong>. No se permite realizar cambios
                        adicionales.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setMostrarModal(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                      >
                        Cerrar
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar monto */}
        {mostrarModalEdicion && valuacionSeleccionada && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">Editar Monto USD</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Número de Valuación:</span>
                    <p className="text-lg font-semibold text-gray-900">{valuacionSeleccionada.numero_valuacion}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estado actual:</span>
                    <p className="text-lg font-semibold text-gray-900">
                      {valuacionSeleccionada.estatus_proceso_nombre}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <label className="block text-sm font-semibold text-gray-700">Monto USD:</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={montoEditado}
                    onChange={(e) => setMontoEditado(e.target.value)}
                    min="0"
                    placeholder="Ingrese el nuevo monto"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setMostrarModalEdicion(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleActualizarMonto}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                  >
                    Actualizar Monto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvanceFinanciero
