"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { UrlApi } from "../utils/utils"
import { FiDollarSign, FiBarChart2, FiShoppingCart, FiCheckCircle, FiUsers, FiTrendingUp, FiInfo } from "react-icons/fi"

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

const AvanceFinancieroGerencial = () => {
  const params = useParams()
  const [avancesFinancieros, setAvancesFinancieros] = useState([])
  const [proyectoDetails, setProyectoDetails] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [showUnitsInfo, setShowUnitsInfo] = useState(false)
  const [hoveredMetric, setHoveredMetric] = useState(null)
  const rowsPerPage = 5

  useEffect(() => {
    const fetchAvancesFinancieros = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${UrlApi}/api/avanceFinanciero/${params.id}`)
        if (!response.ok) {
          throw new Error("Error al cargar los avances financieros")
        }
        const data = await response.json()
        setAvancesFinancieros(data || [])
        setError(null)
      } catch (error) {
        console.error("Error al cargar los avances financieros:", error)
        setError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAvancesFinancieros()
  }, [params.id])

  useEffect(() => {
    const fetchProyectoDetails = async () => {
      try {
        const response = await fetch(`${UrlApi}/api/proyectos/id/${params.id}`)
        if (!response.ok) {
          throw new Error("Error al cargar los detalles del proyecto")
        }
        const data = await response.json()
        setProyectoDetails(data)
      } catch (error) {
        console.error("Error al cargar los detalles del proyecto:", error)
        setError("No se pudieron cargar los detalles del proyecto. Por favor, intente de nuevo más tarde.")
      }
    }
    fetchProyectoDetails()
  }, [params.id])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredData.length / rowsPerPage)) {
      setCurrentPage(newPage)
      // Hacer scroll al inicio cuando se cambia de página
      window.scrollTo(0, 0)
    }
  }

  const filteredData = avancesFinancieros.filter(
    (avance) => filterStatus === "all" || avance.estatus_proceso_nombre.toLowerCase() === filterStatus,
  )

  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const totalPages = Math.ceil(filteredData.length / rowsPerPage)

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value)
    setCurrentPage(1)
  }

  const calculateMetrics = () => {
    const porValuar = avancesFinancieros.reduce(
      (sum, item) =>
        item.estatus_proceso_nombre.toLowerCase() === "por valuar" ? sum + Number.parseFloat(item.monto_usd || 0) : sum,
      0,
    )
    const porFacturar = avancesFinancieros.reduce(
      (sum, item) =>
        item.estatus_proceso_nombre.toLowerCase() === "por facturar"
          ? sum + Number.parseFloat(item.monto_usd || 0)
          : sum,
      0,
    )
    const facturado = avancesFinancieros.reduce(
      (sum, item) =>
        item.estatus_proceso_nombre.toLowerCase() === "facturado" ? sum + Number.parseFloat(item.monto_usd || 0) : sum,
      0,
    )

    return [
      {
        id: "ofertado",
        title: "Ofertado",
        value: proyectoDetails ? Number.parseFloat(proyectoDetails.monto_ofertado) : 0,
        icon: "FiDollarSign",
        color: "bg-green-100 text-green-600",
      },
      {
        id: "costoPlanificado",
        title: "Costo Planificado",
        value: proyectoDetails ? Number.parseFloat(proyectoDetails.costo_estimado) : 0,
        icon: "FiBarChart2",
        color: "bg-blue-100 text-blue-600",
      },
      {
        id: "costoReal",
        title: "Costo Real",
        value: proyectoDetails ? Number.parseFloat(proyectoDetails.costo_real_total) : 0,
        icon: "FiTrendingUp",
        color: "bg-red-100 text-red-600",
      },
      {
        id: "porFacturar",
        title: "Por Facturar",
        value: porFacturar,
        icon: "FiShoppingCart",
        color: "bg-yellow-100 text-yellow-600",
      },
      {
        id: "facturado",
        title: "Facturado",
        value: facturado,
        icon: "FiCheckCircle",
        color: "bg-purple-100 text-purple-600",
      },
      {
        id: "porValuar",
        title: "Por Valuar",
        value: porValuar,
        icon: "FiUsers",
        color: "bg-pink-100 text-pink-600",
      },
    ]
  }

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
              Gestion Gerencial
            </Link>
          </li>
          {proyectoDetails && (
            <>
              <li>
                <Link
                  to={`/GestionGerencia/${proyectoDetails.nombre_region}`}
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
                  {proyectoDetails.nombre_region}
                </Link>
              </li>
              <li>
                <span className="flex items-center text-gray-500">
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
                  {proyectoDetails.nombre_proyecto}
                </span>
              </li>
            </>
          )}
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {proyectoDetails?.nombre_proyecto || "Cargando proyecto..."}
        </h1>
        <p className="text-gray-600 mt-1">Detalle de proyectos y métricas financieras</p>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-hidden p-4 space-y-6">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {calculateMetrics().map((metric) => (
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
                  {metric.icon === "FiDollarSign" && <FiDollarSign className="h-5 w-5" />}
                  {metric.icon === "FiBarChart2" && <FiBarChart2 className="h-5 w-5" />}
                  {metric.icon === "FiTrendingUp" && <FiTrendingUp className="h-5 w-5" />}
                  {metric.icon === "FiShoppingCart" && <FiShoppingCart className="h-5 w-5" />}
                  {metric.icon === "FiCheckCircle" && <FiCheckCircle className="h-5 w-5" />}
                  {metric.icon === "FiUsers" && <FiUsers className="h-5 w-5" />}
                </div>
              </div>
            </div>
          ))}
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

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-3 text-gray-600 text-base">Cargando datos...</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Administración de Contratos</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Detalle de valuaciones y facturación del proyecto</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número de Valuación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número de Factura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estatus
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">
                        No hay datos disponibles
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((avance) => (
                      <tr key={avance.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-150">
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {avance.id}
                        </td>
                        <td className="px-6 py-4 text-sm md:text-base text-gray-900">
                          {new Date(avance.fecha).toLocaleDateString()}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {avance.numero_valuacion || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span title={getFullFormattedValue(avance.monto_usd)}>
                            {formatCurrency(avance.monto_usd)}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {avance.numero_factura || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              avance.estatus_proceso_nombre.toLowerCase() === "facturado"
                                ? "bg-green-100 text-green-800"
                                : avance.estatus_proceso_nombre.toLowerCase() === "por facturar"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {avance.estatus_proceso_nombre}
                          </span>
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
                  disabled={currentPage === Math.ceil(filteredData.length / rowsPerPage)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> a{" "}
                    <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> de{" "}
                    <span className="font-medium">{filteredData.length}</span> resultados
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
                    {Array.from({ length: Math.min(5, Math.ceil(filteredData.length / rowsPerPage)) }, (_, i) => {
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
                      disabled={currentPage === Math.ceil(filteredData.length / rowsPerPage)}
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
        )}
      </div>
    </div>
  )
}

export default AvanceFinancieroGerencial

