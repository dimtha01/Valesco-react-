"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import showNotification, { formatearFechaUTC, formatMontoConSeparador, UrlApi } from "../utils/utils"
import Swal from "sweetalert2"
import LoadingBar from "./LoadingBar"
import {
  FiDollarSign,
  FiShoppingCart,
  FiCreditCard,
  FiTrendingUp,
  FiBarChart2,
  FiEdit3,
  FiCalendar,
  FiFileText,
} from "react-icons/fi"

const Costos = () => {
  const params = useParams()
  const [costos, setCostos] = useState([])
  const [costoOfertado, setCostoOfertado] = useState(0)
  const [costoOrdenesCompra, setCostoOrdenesCompra] = useState(0)
  const [totalAmortizacion, setTotalAmortizacion] = useState(0)
  const [costoTotal, setCostoTotal] = useState(0)
  const [montoAnticipo, setMontoAnticipo] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(7)
  const [error, setError] = useState(null)

  // Estados para el modal de cambio de estatus
  const [mostrarModalEstatus, setMostrarModalEstatus] = useState(false)
  const [costoSeleccionado, setCostoSeleccionado] = useState(null)

  // Estados para el modal de edición de monto
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false)
  const [montoEditado, setMontoEditado] = useState("")

  // Estado para el modal de edición de amortización
  const [mostrarModalAmortizacion, setMostrarModalAmortizacion] = useState(false)
  const [amortizacionEditada, setAmortizacionEditada] = useState("")

  const [estatusOptions, setEstatusOptions] = useState([
    { id: 4, nombre: "Por Valuar" },
    { id: 5, nombre: "Por Facturar" },
    { id: 6, nombre: "Facturado" },
  ])

  const [nuevoCosto, setNuevoCosto] = useState({
    costo: "",
    fecha_inicio: "",
    fecha_fin: "",
    numero_valuacion: "",
    amortizacion: "",
  })

  const [nuevaAmortizacion, setNuevaAmortizacion] = useState({
    id_costo: "",
    amortizacion: "",
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

  const getEstatusColor = (estatusNombre) => {
    if (!estatusNombre) return "bg-gray-100 text-gray-800"

    const nombreLower = estatusNombre.toLowerCase()
    if (nombreLower.includes("por valuar")) return "bg-blue-100 text-blue-800"
    if (nombreLower.includes("por facturar")) return "bg-yellow-100 text-yellow-800"
    if (nombreLower.includes("facturado")) return "bg-green-100 text-green-800"

    return "bg-gray-100 text-gray-800"
  }

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
      setMontoAnticipo(Number(data.totalMontoAnticipo) || 0)
      setCostoOrdenesCompra(Number(data.CostoOrdenesCompra) || 0)
      setTotalAmortizacion(Number(data.totalAmortizacion) || 0)

      const total = data.costos.reduce((sum, costo) => sum + Number(costo.costo), 0)
      setCostoTotal(total)

      if (data.costos.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin datos",
          text: "No se encontraron costos para este proyecto.",
          timer: 3000,
          timerProgressBar: true,
        })
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
      setNuevoCosto({ ...nuevoCosto, [e.target.name]: value })
    }
  }

  const handleChangeAmortizacion = (e) => {
    const value = e.target.value
    if (!isNaN(value)) {
      setNuevaAmortizacion({ ...nuevaAmortizacion, [e.target.name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nuevoCosto.costo || !nuevoCosto.fecha_inicio || !nuevoCosto.fecha_fin || !nuevoCosto.numero_valuacion) {
      showNotification("warning", "Campos incompletos", "Por favor, completa todos los campos antes de agregar.")
      return
    }

    if (new Date(nuevoCosto.fecha_fin) < new Date(nuevoCosto.fecha_inicio)) {
      showNotification("error", "Fechas inválidas", "La fecha de fin no puede ser anterior a la fecha de inicio.")
      return
    }

    const nuevoCostoNumerico = Number(nuevoCosto.costo)
    const nuevoTotal = costoTotal + nuevoCostoNumerico
    const montoSobrepasado = 0
    const amortizacionNumerica = Number(nuevoCosto.amortizacion || 0)

    const totalAmortizacionesExistentes = costos.reduce((sum, costo) => sum + Number(costo.amortizacion || 0), 0)

    if (totalAmortizacionesExistentes + amortizacionNumerica > montoAnticipo) {
      showNotification(
        "error",
        "Amortización excedida",
        `La suma de amortizaciones (${formatMontoConSeparador(totalAmortizacionesExistentes + amortizacionNumerica)}) superaría el monto de anticipo total (${formatMontoConSeparador(montoAnticipo)}).`,
      )
      return
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
          numero_valuacion: nuevoCosto.numero_valuacion,
          amortizacion: amortizacionNumerica,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar el costo")
      }

      setNuevoCosto({
        costo: "",
        fecha_inicio: "",
        fecha_fin: "",
        numero_valuacion: "",
        amortizacion: "",
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

  const handleSubmitAmortizacion = async (e) => {
    e.preventDefault()

    if (!nuevaAmortizacion.id_costo || !nuevaAmortizacion.amortizacion) {
      showNotification("warning", "Campos incompletos", "Por favor, completa todos los campos antes de agregar.")
      return
    }

    const amortizacionNumerica = Number(nuevaAmortizacion.amortizacion)
    if (amortizacionNumerica <= 0) {
      showNotification("error", "Valor inválido", "La amortización debe ser mayor que cero.")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${UrlApi}/api/costos/amortizacion/${nuevaAmortizacion.id_costo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amortizacion: amortizacionNumerica,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar la amortización")
      }

      setNuevaAmortizacion({
        id_costo: "",
        amortizacion: "",
      })
      fetchCostos()
      showNotification("success", "Éxito", "La amortización ha sido agregada exitosamente.")
    } catch (error) {
      console.error("Error al agregar la amortización:", error)
      showNotification(
        "error",
        "Error",
        "Ocurrió un problema al agregar la amortización. Por favor, inténtalo de nuevo.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleRowClick = (costo) => {
    if (costo.nombre_estatus === "Facturado") {
      showNotification(
        "warning",
        "No permitido",
        "No se puede cambiar el estatus porque 'Facturado' es el último estatus posible.",
      )
      return
    }

    setCostoSeleccionado(costo)
    setMostrarModalEstatus(true)
  }

  const handleEditarMonto = (costo, e) => {
    e.stopPropagation()
    setCostoSeleccionado(costo)
    setMontoEditado(costo.costo)
    setMostrarModalEdicion(true)
  }

  const handleEditarAmortizacion = (costo, e) => {
    e.stopPropagation()
    setCostoSeleccionado(costo)
    setAmortizacionEditada(costo.amortizacion || "0")
    setMostrarModalAmortizacion(true)
  }

  const handleActualizarMonto = async () => {
    if (!montoEditado || isNaN(montoEditado) || Number(montoEditado) <= 0) {
      showNotification("error", "Monto inválido", "Por favor, ingrese un monto válido mayor que cero.")
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/costos/monto/${costoSeleccionado.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ costo: Number(montoEditado) }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el monto")
      }

      fetchCostos()
      setMostrarModalEdicion(false)
      showNotification("success", "Éxito", "El monto ha sido actualizado exitosamente.")
    } catch (error) {
      console.error("Error al actualizar el monto:", error)
      showNotification("error", "Error", "Ocurrió un problema al actualizar el monto. Por favor, inténtalo de nuevo.")
    }
  }

  const handleActualizarAmortizacion = async () => {
    if (!amortizacionEditada || isNaN(amortizacionEditada) || Number(amortizacionEditada) < 0) {
      showNotification("error", "Amortización inválida", "Por favor, ingrese un valor válido para la amortización.")
      return
    }

    const totalAmortizacionesExistentes = costos.reduce((sum, costo) => {
      if (costo.id !== costoSeleccionado.id) {
        return sum + Number(costo.amortizacion || 0)
      }
      return sum
    }, 0)

    const nuevaAmortizacion = Number(amortizacionEditada)

    if (totalAmortizacionesExistentes + nuevaAmortizacion > montoAnticipo) {
      showNotification(
        "error",
        "Amortización excedida",
        `La suma de amortizaciones (${formatMontoConSeparador(totalAmortizacionesExistentes + nuevaAmortizacion)}) superaría el monto de anticipo total (${formatMontoConSeparador(montoAnticipo)}).`,
      )
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/costos/${costoSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amortizacion: Number(amortizacionEditada) }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la amortización")
      }

      fetchCostos()
      setMostrarModalAmortizacion(false)
      showNotification("success", "Éxito", "La amortización ha sido actualizada exitosamente.")
    } catch (error) {
      console.error("Error al actualizar la amortización:", error)
      showNotification(
        "error",
        "Error",
        "Ocurrió un problema al actualizar la amortización. Por favor, inténtalo de nuevo.",
      )
    }
  }

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

      fetchCostos()
      setMostrarModalEstatus(false)

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

  // Métricas para las tarjetas
  const metrics = [
    {
      id: "planificado",
      title: "Costo Planificado",
      value: costoOfertado,
      icon: FiBarChart2,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200/50",
      titleColor: "text-blue-600",
      valueColor: "text-blue-900",
      iconBgColor: "blue-500",
    },
    {
      id: "ordenCompra",
      title: "Costo por Orden de Compra",
      value: costoOrdenesCompra,
      icon: FiShoppingCart,
      bgColor: "bg-red-50",
      borderColor: "border-red-200/50",
      titleColor: "text-red-600",
      valueColor: "text-red-900",
      iconBgColor: "red-500",
    },
    {
      id: "anticipo",
      title: "Monto Anticipo a Proveedores",
      value: montoAnticipo,
      icon: FiCreditCard,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200/50",
      titleColor: "text-purple-600",
      valueColor: "text-purple-900",
      iconBgColor: "purple-500",
    },
    {
      id: "pendiente",
      title: "Pendiente Por Amortizar",
      value: montoAnticipo - totalAmortizacion,
      icon: FiTrendingUp,
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200/50",
      titleColor: "text-amber-600",
      valueColor: "text-amber-900",
      iconBgColor: "amber-500",
    },
    {
      id: "real",
      title: "Costo Real",
      value: costoTotal,
      icon: FiDollarSign,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200/50",
      titleColor: "text-emerald-600",
      valueColor: "text-emerald-900",
      iconBgColor: "emerald-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">


      {/* Header */}
      <div className="mb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-4 rounded-2xl mr-4 shadow-lg">
              <FiDollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Costos</h1>
              <p className="text-gray-600 mt-1">Control financiero y seguimiento de gastos del proyecto</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
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
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Metrics Cards */}
          {costoOfertado > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium mb-1 ">Costo Planificado</p>
                    <p className="text-2xl font-bold text-blue-900">${formatMontoConSeparador(costoOfertado)}</p>
                    <p className="text-blue-500 text-xs mt-1">Presupuesto estimado</p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-xl">
                    <FiBarChart2 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium mb-1 ">Costo por Orden de Compra</p>
                    <p className="text-2xl font-bold text-red-900">${formatMontoConSeparador(costoOrdenesCompra)}</p>
                    <p className="text-red-500 text-xs mt-1">Órdenes procesadas</p>
                  </div>
                  <div className="bg-red-500 p-3 rounded-xl">
                    <FiShoppingCart className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium mb-1 ">Monto Anticipo a Proveedores</p>
                    <p className="text-2xl font-bold text-purple-900">${formatMontoConSeparador(montoAnticipo)}</p>
                    <p className="text-purple-500 text-xs mt-1">Anticipos otorgados</p>
                  </div>
                  <div className="bg-purple-500 p-3 rounded-xl">
                    <FiCreditCard className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-amber-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium mb-1 ">Pendiente Por Amortizar</p>
                    <p className="text-2xl font-bold text-amber-900">
                      ${formatMontoConSeparador(montoAnticipo - totalAmortizacion)}
                    </p>
                    <p className="text-amber-500 text-xs mt-1">Saldo pendiente</p>
                  </div>
                  <div className="bg-amber-500 p-3 rounded-xl">
                    <FiTrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-600 text-sm font-medium mb-1 ">Costo Real</p>
                    <p className="text-2xl font-bold text-emerald-900">${formatMontoConSeparador(costoTotal)}</p>
                    <p className="text-emerald-500 text-xs mt-1">Gasto ejecutado</p>
                  </div>
                  <div className="bg-emerald-500 p-3 rounded-xl">
                    <FiDollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Registrar Nuevo Costo</h2>
              <p className="text-sm text-gray-500">Ingrese los detalles del nuevo costo</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* N° Valuación del Proveedor */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FiFileText className="h-4 w-4 mr-2 text-gray-500" />
                      N° Valuación del Proveedor
                    </label>
                    <input
                      type="text"
                      name="numero_valuacion"
                      placeholder="Ingrese el número de valuación"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      value={nuevoCosto.numero_valuacion}
                      onChange={(e) => setNuevoCosto({ ...nuevoCosto, numero_valuacion: e.target.value })}
                      required
                    />
                  </div>

                  {/* Monto (USD) */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FiDollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      Monto (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        name="costo"
                        placeholder="0.00"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        value={nuevoCosto.costo}
                        onChange={handleChangeNumero}
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {/* Monto de Amortización (USD) */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FiCreditCard className="h-4 w-4 mr-2 text-gray-500" />
                      Monto de Amortización (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        name="amortizacion"
                        placeholder="0.00"
                        className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                        value={nuevoCosto.amortizacion}
                        onChange={handleChangeNumero}
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Fecha de Inicio */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FiCalendar className="h-4 w-4 mr-2 text-gray-500" />
                      Fecha de Inicio
                    </label>
                    <input
                      type="date"
                      name="fecha_inicio"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      value={nuevoCosto.fecha_inicio}
                      onChange={(e) => setNuevoCosto({ ...nuevoCosto, fecha_inicio: e.target.value })}
                      required
                    />
                  </div>

                  {/* Fecha de Fin */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FiCalendar className="h-4 w-4 mr-2 text-gray-500" />
                      Fecha de Fin
                    </label>
                    <input
                      type="date"
                      name="fecha_fin"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      value={nuevoCosto.fecha_fin}
                      onChange={(e) => setNuevoCosto({ ...nuevoCosto, fecha_fin: e.target.value })}
                      min={nuevoCosto.fecha_inicio}
                      required
                    />
                  </div>
                </div>

                {/* Botón de Agregar */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Agregar Costo
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Table Section */}
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
              <div className="flex justify-center items-center">
                <LoadingBar />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Registro de Costos</h2>
                <p className="text-sm text-gray-500">Detalle de costos del proyecto</p>
              </div>

              <div className="overflow-x-auto">
                <div className="h-[500px] overflow-y-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          N° Valuación del Proveedor
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Monto USD
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Amortización
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fecha Inicio
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fecha Fin
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Estatus
                        </th>
                        <th className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <FiDollarSign className="w-16 h-16 text-gray-300 mb-4" />
                              <p className="text-gray-500 text-lg font-medium">No hay costos registrados</p>
                              <p className="text-gray-400 text-sm">Agrega el primer costo para comenzar</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((costo) => (
                          <tr
                            key={costo.id}
                            className={`hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-300 group ${costo.nombre_estatus !== "Facturado" ? "cursor-pointer" : ""
                              }`}
                            onClick={() => handleRowClick(costo)}
                          >
                            <td className="py-4 px-4 text-sm text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {formatearFechaUTC(costo.fecha)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {costo.numero_valuacion || "-"}
                            </td>
                            <td className="py-4 px-4 text-sm font-medium text-gray-900 ">
                              ${formatMontoConSeparador(costo.costo)}
                            </td>
                            <td className="py-4 px-4 text-sm font-medium text-gray-900 ">
                              ${formatMontoConSeparador(costo.amortizacion || 0)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha_inicio)}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha_fin)}</td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstatusColor(
                                  costo.nombre_estatus,
                                )}`}
                              >
                                {costo.nombre_estatus || "-"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm" onClick={(e) => e.stopPropagation()}>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => handleEditarMonto(costo, e)}
                                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-300"
                                  title="Editar Monto"
                                >
                                  <FiEdit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => handleEditarAmortizacion(costo, e)}
                                  className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors duration-300"
                                  title="Editar Amortización"
                                >
                                  <FiCreditCard className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando{" "}
                  <span className="font-medium">{costos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> a{" "}
                  <span className="font-medium">{Math.min(currentPage * rowsPerPage, costos.length)}</span> de{" "}
                  <span className="font-medium">{costos.length}</span> resultados
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Anterior
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 shadow-sm">
                    {currentPage} de {totalPages || 1}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-white hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* Modal para cambiar estatus */}
      {mostrarModalEstatus && costoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Gestionar Estatus de Valuación</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong> {formatearFechaUTC(costoSeleccionado.fecha)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>N° Valuación:</strong> {costoSeleccionado.numero_valuacion || "-"}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Monto:</strong> ${formatMontoConSeparador(costoSeleccionado.costo)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estado actual:</strong>{" "}
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstatusColor(
                      costoSeleccionado.nombre_estatus,
                    )}`}
                  >
                    {costoSeleccionado.nombre_estatus || "No definido"}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nuevo estatus:</label>
                <select
                  id="nuevoEstatus"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
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
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setMostrarModalEstatus(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300"
                onClick={handleChangeEstado}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar monto */}
      {mostrarModalEdicion && costoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Editar Monto USD</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>N° Valuación:</strong> {costoSeleccionado.numero_valuacion}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estado actual:</strong> {costoSeleccionado.nombre_estatus}
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Monto USD:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    value={montoEditado}
                    onChange={(e) => setMontoEditado(e.target.value)}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setMostrarModalEdicion(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleActualizarMonto}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
              >
                Actualizar Monto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar amortización */}
      {mostrarModalAmortizacion && costoSeleccionado && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Editar Amortización</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>N° Valuación:</strong> {costoSeleccionado.numero_valuacion}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estado actual:</strong> {costoSeleccionado.nombre_estatus}
                </p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Amortización USD:</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                    value={amortizacionEditada}
                    onChange={(e) => setAmortizacionEditada(e.target.value)}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setMostrarModalAmortizacion(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleActualizarAmortizacion}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                Actualizar Amortización
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Costos
