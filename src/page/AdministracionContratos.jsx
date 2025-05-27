"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { formatMontoConSeparador, UrlApi } from "../utils/utils"
import { AuthContext } from "../components/AuthContext"
import LoadingComponent from "../components/LoadingComponent"
import {
  FiDollarSign,
  FiCheckCircle,
  FiShoppingCart,
  FiSearch,
  FiFileText,
  FiTrendingUp,
  FiSettings,
} from "react-icons/fi"

const AdministracionContratos = () => {
  const [proyectos, setProyectos] = useState([])
  const [totales, setTotales] = useState({
    total_ofertado: 0,
    total_facturado: 0,
    total_por_facturar: 0,
    total_por_valuar: 0,
  })
  const [filteredProyectos, setFilteredProyectos] = useState([])
  const [regions, setRegions] = useState([])
  const { userRegion, user } = useContext(AuthContext)
  const region = userRegion
  const rowsPerPage = 7
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("all")
  const [hoveredMetric, setHoveredMetric] = useState(null)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const filterProyectosByRegion = useCallback(
    (data) => {
      if (!data || !Array.isArray(data)) {
        setFilteredProyectos([])
        return
      }

      // Primero filtrar para excluir proyectos de la región Centro
      let filtered = data.filter((proyecto) => proyecto.nombre_region !== "Centro")

      // Aplicar filtro de región basado en el contexto del usuario
      if (region && region !== "all") {
        filtered = filtered.filter((proyecto) => proyecto.nombre_region === region)
      }

      // Aplicar filtro de búsqueda
      if (searchText) {
        const searchLower = searchText.toLowerCase()
        filtered = filtered.filter(
          (proyecto) =>
            proyecto.nombre_proyecto?.toLowerCase().includes(searchLower) ||
            proyecto.nombre_corto?.toLowerCase().includes(searchLower) ||
            proyecto.numero?.toLowerCase().includes(searchLower) ||
            (proyecto.nombre_cliente && proyecto.nombre_cliente.toLowerCase().includes(searchLower)),
        )
      }

      setFilteredProyectos(filtered)
      setCurrentPage(1)
    },
    [region, searchText],
  )

  useEffect(() => {
    const fetchProyectos = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`${UrlApi}/api/proyectos/${region}`)

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (!data || !data.proyectos) {
          console.error("API response missing proyectos:", data)
          setProyectos([])
          setTotales({
            total_ofertado: 0,
            total_facturado: 0,
            total_por_facturar: 0,
            total_por_valuar: 0,
          })
        } else {
          setProyectos(data.proyectos)

          // Solo mantener las métricas relevantes para administración de contratos
          setTotales({
            total_ofertado: data.totales?.total_ofertado || 0,
            total_facturado: data.totales?.total_facturado || 0,
            total_por_facturar: data.totales?.total_por_facturar || 0,
            total_por_valuar: data.totales?.total_por_valuar || 0,
          })

          const uniqueRegions = [...new Set(data.proyectos.map((proyecto) => proyecto.nombre_region).filter(Boolean))]
          setRegions(uniqueRegions)

          filterProyectosByRegion(data.proyectos)
        }
      } catch (error) {
        console.error("Error al cargar los proyectos:", error)
        setError("Error al cargar los proyectos. Por favor, intente de nuevo más tarde.")
        setProyectos([])
        setFilteredProyectos([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProyectos()
  }, [region, filterProyectosByRegion])

  useEffect(() => {
    filterProyectosByRegion(proyectos)
  }, [proyectos, searchText, filterProyectosByRegion])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredProyectos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  const handleRowClick = (id, nombre) => {
    navigate(`/InicioAdministraciónContratos/AdministracionContratos/${nombre}/${id}`)
  }

  const paginatedData = filteredProyectos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(filteredProyectos.length / rowsPerPage)

  // Métricas relevantes para administración de contratos con diseño mejorado
  const metrics = [
    {
      id: "ofertado",
      title: "Total Ofertado",
      value: totales.total_ofertado || 0,
      icon: FiDollarSign,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-50 to-green-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      description: "Valor total de contratos",
    },
    {
      id: "facturado",
      title: "Total Facturado",
      value: totales.total_facturado || 0,
      icon: FiCheckCircle,
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      description: "Ingresos confirmados",
    },
    {
      id: "porFacturar",
      title: "Por Facturar",
      value: totales.total_por_facturar || 0,
      icon: FiShoppingCart,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      description: "Pendiente de facturación",
    },
    {
      id: "porValuar",
      title: "Por Valuar",
      value: totales.total_por_valuar || 0,
      icon: FiTrendingUp,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      description: "En proceso de evaluación",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
        </ul>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
              <FiSettings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Administración de Contratos</h1>
              <p className="text-gray-600 mt-1">Gestión integral de contratos y facturación</p>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
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
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Metrics cards mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={metric.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${metric.bgGradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50`}
              onMouseEnter={() => setHoveredMetric(metric.id)}
              onMouseLeave={() => setHoveredMetric(null)}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1" title={formatMontoConSeparador(metric.value)}>
                    ${formatMontoConSeparador(metric.value)}
                  </p>
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
                <div className={`${metric.iconBg} p-3 rounded-xl shadow-sm`}>
                  <metric.icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>

              {/* Decorative gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${metric.gradient} opacity-0 hover:opacity-5 transition-opacity duration-300 rounded-2xl`}
              />
            </div>
          ))}
        </div>

        {/* Search bar mejorada */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white/80 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
              placeholder="Buscar contratos..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Loading state or table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-lg">
            <LoadingComponent />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Table header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Listado de Contratos</h2>
                  <p className="text-sm text-gray-600 mt-1">Gestión y administración de contratos activos</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {filteredProyectos.length} contratos
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contrato
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                        Región
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                        Ofertado
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                        Facturado
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                        Por Facturar
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                        Por Valuar
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <FiFileText className="h-12 w-12 text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg font-medium">No hay contratos disponibles</p>
                            <p className="text-gray-400 text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((proyecto, index) => (
                        <tr
                          key={proyecto.id}
                          onClick={() => handleRowClick(proyecto.id, proyecto.nombre_proyecto)}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 group"
                          style={{
                            animationDelay: `${index * 50}ms`,
                            animation: "fadeInUp 0.4s ease-out forwards",
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                {proyecto.numero?.slice(-2) || "N/A"}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{proyecto.numero || "N/A"}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div
                                className="text-sm font-medium text-gray-900 truncate"
                                title={proyecto.nombre_proyecto || "N/A"}
                              >
                                {proyecto.nombre_cortos || proyecto.nombre_corto || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {proyecto.nombre_cliente || "Cliente no especificado"}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center hidden md:table-cell">
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${proyecto.nombre_region === "Centro"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : proyecto.nombre_region === "Occidente"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}
                            >
                              {proyecto.nombre_region || "N/A"}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm hidden md:table-cell">
                            <div className="font-semibold text-gray-900">
                              ${formatMontoConSeparador(proyecto.monto_ofertado || 0)}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm hidden md:table-cell">
                            <div className="font-medium text-emerald-600">
                              ${formatMontoConSeparador(proyecto.facturado || 0)}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm hidden md:table-cell">
                            <div className="font-medium text-amber-600">
                              ${formatMontoConSeparador(proyecto.por_factura || 0)}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm hidden md:table-cell">
                            <div className="font-medium text-purple-600">
                              ${formatMontoConSeparador(proyecto.por_valuar || 0)}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination mejorada */}
            {filteredProyectos.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando{" "}
                  <span className="font-medium">
                    {filteredProyectos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
                  </span>{" "}
                  a <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredProyectos.length)}</span>{" "}
                  de <span className="font-medium">{filteredProyectos.length}</span> resultados
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${currentPage === pageNum
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                            }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSS para animaciones */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default AdministracionContratos
