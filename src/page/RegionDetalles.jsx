"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { FiDollarSign, FiShoppingCart, FiCheckCircle, FiUsers, FiBarChart2, FiActivity, FiInfo } from "react-icons/fi"
import { UrlApi } from "../utils/utils"

// Utilidades para formateo de moneda
const formatCurrency = (value) => {
  if (value === null || value === undefined) return "$0.00 MM"

  // Convertir a número si es string
  const numValue = typeof value === "string" ? Number.parseFloat(value) : value

  // Siempre mostrar en millones (MM)
  const inMillions = numValue / 1000000
  return `$${inMillions.toFixed(2)} MM`
}

// Función para mostrar el valor completo con formato al pasar el cursor
const getFullFormattedValue = (amount) => {
  if (amount === undefined || amount === null) return "$0,00"

  // Formatear el número con separadores de miles (puntos) y decimales (coma)
  return `$${amount.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// Componente de indicador de progreso
function ProgressIndicator({ progress }) {
  // Asegurarse de que los valores sean números válidos o 0 si son null/undefined
  const real = progress.real || 0
  const planned = progress.planned || 0
  const completed = progress.completed || 0

  // Determinar si el avance real supera el planificado
  const isRealOverPlanned = real > planned

  return (
    <div className="space-y-1">
      {/* Barra de progreso */}
      <div className="h-2 bg-blue-100 rounded-full relative">
        {/* Barra de progreso completado */}
        <div
          className="absolute h-full bg-blue-200 rounded-full"
          style={{
            left: `${planned}%`,
            width: `${completed - planned}%`,
            display: completed > planned ? "block" : "none", // Ocultar si no hay diferencia entre completado y planificado
          }}
        />

        {/* Barra de progreso planificado */}
        <div
          className="absolute h-full bg-blue-400 rounded-full"
          style={{
            left: `${real}%`,
            width: `${planned - real}%`,
            display: planned > real ? "block" : "none", // Ocultar si no hay diferencia entre planificado y real
            zIndex: isRealOverPlanned ? 1 : 3, // Ajustar z-index según la condición
          }}
        />

        {/* Barra de progreso real */}
        <div
          className={`absolute h-full rounded-full ${isRealOverPlanned ? "bg-red-600" : "bg-blue-700"}`}
          style={{
            width: `${real}%`,
            zIndex: isRealOverPlanned ? 3 : 1, // Ajustar z-index según la condición
          }}
        />
      </div>

      {/* Etiquetas de porcentaje */}
      <div className="flex justify-between text-xs md:text-sm text-gray-500">
        <span>{real}%</span>
        <span>{planned}%</span>
        <span>{completed}%</span>
      </div>

      {/* Bloque de etiquetas adicionales */}
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1">
          <div className={`w-3 h-1 ${isRealOverPlanned ? "bg-red-600" : "bg-blue-700"}`} />
          <span>Real</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-blue-400" />
          <span>Plan</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1 bg-blue-200" />
          <span>Total</span>
        </div>
      </div>
    </div>
  )
}

const RegionDetalles = () => {
  const { region } = useParams() // Obtiene la región desde los parámetros de la URL
  const [data, setData] = useState([]) // Estado para almacenar los datos de la API
  const [loading, setLoading] = useState(true) // Estado para manejar la carga
  const [error, setError] = useState(null) // Estado para manejar errores
  const navigate = useNavigate() // Hook para navegar programáticamente
  const rowsPerPage = 5 // Máximo de filas por página
  const [currentPage, setCurrentPage] = useState(1) // Estado para la página actual
  const [showUnitsInfo, setShowUnitsInfo] = useState(false)
  const [hoveredMetric, setHoveredMetric] = useState(null) // Estado para controlar qué métrica tiene el cursor encima

  useEffect(() => {
    // Asegurarse de que el scroll esté siempre al inicio
    window.scrollTo(0, 0)

    // También podemos usar esta alternativa para navegadores más modernos
    // que proporciona un comportamiento de scroll más suave
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // 'auto' es instantáneo, 'smooth' sería con animación
    })

    // Función para asegurar que el scroll esté al inicio incluso después de que
    // el contenido se haya cargado completamente (imágenes, etc.)
    const ensureTopScroll = () => {
      setTimeout(() => {
        window.scrollTo(0, 0)
      }, 100)
    }

    // Ejecutar después de un breve retraso para asegurar que funcione
    ensureTopScroll()

    // Limpiar el timeout si el componente se desmonta
    return () => clearTimeout(ensureTopScroll)
  }, [region]) // Se ejecuta cuando cambia la región

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${UrlApi}/api/dashdoard/${region}`)
        if (!response.ok) {
          throw new Error("No se pudieron cargar los datos")
        }
        const result = await response.json()

        // Cargar los datos directamente desde la API, incluyendo el costo_real
        setData(result.proyectos)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchData()
  }, [region]) // Se ejecuta cuando cambia la región

  useEffect(() => {
    if (!loading && data.length > 0) {
      // Asegurarse de que el scroll esté al inicio cuando los datos se cargan
      window.scrollTo(0, 0)
    }
  }, [loading, data]) // Se ejecuta cuando cambia el estado de carga o los datos

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600 text-base">Cargando datos de la región...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  // Función para manejar el clic en una fila
  const handleRowClick = (idProyecto) => {
    navigate(`/proyecto/${idProyecto}`) // Redirige a la página del proyecto
  }

  // Datos paginados
  const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(data.length / rowsPerPage)) {
      setCurrentPage(newPage)
      // Hacer scroll al inicio cuando se cambia de página
      window.scrollTo(0, 0)
    }
  }

  // Calcular totales para las métricas
  const totalOfertado = data.reduce((sum, item) => sum + Number.parseFloat(item.monto_ofertado || 0), 0)
  const totalCostoPlanificado = data.reduce((sum, item) => sum + Number.parseFloat(item.costo_planificado || 0), 0)
  const totalCostoReal = data.reduce((sum, item) => {
    const costoReal = item.costo_real ? Number.parseFloat(item.costo_real) : 0
    return sum + costoReal
  }, 0)
  const totalFacturado = data.reduce((sum, item) => sum + Number.parseFloat(item.monto_facturado || 0), 0)
  const totalPorFacturar = data.reduce((sum, item) => sum + Number.parseFloat(item.monto_por_facturar || 0), 0)
  const totalPorValuar = data.reduce((sum, item) => sum + Number.parseFloat(item.monto_por_valuar || 0), 0)

  // Métricas para mostrar en las tarjetas
  const metrics = [
    {
      id: "ofertado",
      title: "Ofertado",
      value: totalOfertado,
      icon: FiDollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "costoPlanificado",
      title: "Costo Planificado",
      value: totalCostoPlanificado,
      icon: FiBarChart2,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "costoReal",
      title: "Costo Real",
      value: totalCostoReal,
      icon: FiActivity,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      id: "facturado",
      title: "Facturado",
      value: totalFacturado,
      icon: FiCheckCircle,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "porFacturar",
      title: "Por Facturar",
      value: totalPorFacturar,
      icon: FiShoppingCart,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: "porValuar",
      title: "Por Valuar",
      value: totalPorValuar,
      icon: FiUsers,
      color: "bg-pink-100 text-pink-600",
    },
  ]

  return (
    <div className="flex flex-col h-auto overflow-hidden bg-gray-50 min-h-screen mb-24">
      {/* Breadcrumbs */}
      <div className="breadcrumbs text-sm md:text-lg mx-4 mt-4 text-[#0f0f0f]">
        <ul className="flex items-center space-x-2">
          <li>
            <Link
              to="/GestionGerencia"
              className="flex items-center hover:text-blue-500 transition-colors duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-5 w-5 stroke-current mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Gestion de Gerencia
            </Link>
          </li>
          <li>
            <Link to="#" className="flex items-center hover:text-blue-500 transition-colors duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-5 w-5 stroke-current mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              {region}
            </Link>
          </li>
        </ul>
      </div>

      {/* Leyenda de unidades */}
      <div className="mx-4 mt-2">
        <button
          onClick={() => setShowUnitsInfo(!showUnitsInfo)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <FiInfo className="mr-1" />
          {showUnitsInfo ? "Ocultar leyenda de unidades" : "Mostrar leyenda de unidades"}
        </button>

        {showUnitsInfo && (
          <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm border border-blue-100">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <span className="font-medium text-gray-900 mr-1">MM</span>
                <span className="text-gray-600">= Millones</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Título de la página */}
      <div className="mx-4 mt-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Región {region}</h1>
        <p className="text-gray-600 mt-1">Detalle de proyectos y métricas financieras</p>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-hidden p-4 space-y-6">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              onMouseEnter={() => setHoveredMetric(metric.id)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-xl font-bold text-gray-900" title={getFullFormattedValue(metric.value)}>
                    {hoveredMetric === metric.id ? getFullFormattedValue(metric.value) : formatCurrency(metric.value)}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-full ${metric.color} flex items-center justify-center`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="bg-white shadow rounded-lg overflow-hidden ">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Proyectos de la región</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Lista de proyectos con sus detalles financieros y avance
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre del proyecto
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo Real
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facturado
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Por facturar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No hay proyectos disponibles
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((project) => (
                    <tr
                      key={project.id_proyecto}
                      onClick={() => handleRowClick(project.id_proyecto)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                    >
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.id_proyecto}
                      </td>
                      <td className="px-6 py-4 text-sm md:text-base text-gray-900">
                        <div className="max-w-md truncate uppercase">{project.nombre_proyecto}</div>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span title={getFullFormattedValue(project.costo_real)}>
                          {formatCurrency(project.costo_real)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span title={getFullFormattedValue(project.monto_facturado)}>
                          {formatCurrency(project.monto_facturado)}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span title={getFullFormattedValue(project.monto_por_facturar)}>
                          {formatCurrency(project.monto_por_facturar)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base">
                        <ProgressIndicator
                          progress={{
                            real: Number.parseFloat(project.avance_real) || 0,
                            planned: Number.parseFloat(project.avance_planificado) || 0,
                            completed: 100, // Asumimos que el avance completado es siempre 100%
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginador */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(data.length / rowsPerPage)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> a{" "}
                  <span className="font-medium">{Math.min(currentPage * rowsPerPage, data.length)}</span> de{" "}
                  <span className="font-medium">{data.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
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
                  {Array.from({ length: Math.min(5, Math.ceil(data.length / rowsPerPage)) }, (_, i) => {
                    const pageNumber = i + 1
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNumber
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(data.length / rowsPerPage)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
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
    </div>
  )
}

export default RegionDetalles

