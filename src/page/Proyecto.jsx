"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { formatMontoConSeparador, UrlApi } from "../utils/utils"
import { AuthContext } from "../components/AuthContext"
import LoadingComponent from "../components/LoadingComponent"
import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiCreditCard,
} from "react-icons/fi"
import { ProgressIndicator } from "./RegionDetalles"

const Proyecto = () => {
  const [proyectos, setProyectos] = useState([])
  const [totales, setTotales] = useState({
    total_ofertado: 0,
    total_costo_planificado: 0,
    total_costo_real: 0,
    total_facturado: 0,
    total_por_facturar: 0,
    total_por_valuar: 0,
    total_amortizacion: 0,
    total_monto_anticipo: 0,
  }) // Initialize with default values
  const [filteredProyectos, setFilteredProyectos] = useState([])
  const [regions, setRegions] = useState([])
  const { userRegion, user } = useContext(AuthContext) // Changed from region to userRegion to avoid confusion
  const region = userRegion // Default to "all" if userRegion is undefined
  const rowsPerPage = 7
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("all")
  const [hoveredMetric, setHoveredMetric] = useState(null)
  const [error, setError] = useState(null);
  console.log(user);


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
            // Buscar también en el nombre del cliente si está disponible
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

        // Check if data has the expected structure
        if (!data || !data.proyectos) {
          console.error("API response missing proyectos:", data)
          setProyectos([])
          setTotales({
            total_ofertado: 0,
            total_costo_planificado: 0,
            total_costo_real: 0,
            total_facturado: 0,
            total_por_facturar: 0,
            total_por_valuar: 0,
            total_amortizacion: 0,
            total_monto_anticipo: 0,
          })
        } else {
          setProyectos(data.proyectos)

          // Safely set totales with default values if missing
          setTotales({
            total_ofertado: data.totales?.total_ofertado || 0,
            total_costo_planificado: data.totales?.total_costo_planificado || 0,
            total_costo_real: data.totales?.total_costo_real || 0,
            total_facturado: data.totales?.total_facturado || 0,
            total_por_facturar: data.totales?.total_por_facturar || 0,
            total_por_valuar: data.totales?.total_por_valuar || 0,
            total_amortizacion: data.totales?.total_amortizacion || 0,
            total_monto_anticipo: data.totales?.total_monto_anticipo || 0,
          })

          // Extract unique regions safely
          const uniqueRegions = [...new Set(data.proyectos.map((proyecto) => proyecto.nombre_region).filter(Boolean))]
          setRegions(uniqueRegions)

          // Filter projects
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

  // Update filter when projects or region changes
  useEffect(() => {
    filterProyectosByRegion(proyectos)
  }, [proyectos, searchText, filterProyectosByRegion])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredProyectos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  const handleRowClick = (id, nombre) => {
    navigate(`/InicioPlanificador/Proyecto/ActualizarProyecto/${nombre}/${id}`)
  }

  // Función para manejar el cambio de filtro de región
  const handleRegionFilterChange = (e) => {
    setSelectedRegionFilter(e.target.value)
  }

  const paginatedData = filteredProyectos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(filteredProyectos.length / rowsPerPage)

  // Métricas para mostrar en las tarjetas - using safe access with default values
  const metrics = [
    {
      id: "ofertado",
      title: "Ofertado",
      value: totales.total_ofertado || 0,
      icon: FiDollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "costoPlanificado",
      title: "Costo Planificado",
      value: totales.total_costo_planificado || 0,
      icon: FiBarChart2,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "costoReal",
      title: "Costo Real",
      value: totales.total_costo_real || 0,
      icon: FiActivity,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      id: "facturado",
      title: "Facturado",
      value: totales.total_facturado || 0,
      icon: FiCheckCircle,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "porFacturar",
      title: "Por Facturar",
      value: totales.total_por_facturar || 0,
      icon: FiShoppingCart,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: "porValuar",
      title: "Por Valuar",
      value: totales.total_por_valuar || 0,
      icon: FiUsers,
      color: "bg-pink-100 text-pink-600",
    },
    {
      id: "amortizacion",
      title: "Total Amortización",
      value: totales.total_amortizacion || 0,
      icon: FiCreditCard,
      color: "bg-orange-100 text-orange-600",
    },
    {
      id: "anticipoTotal",
      title: "Monto Anticipo Total",
      value: totales.total_monto_anticipo || 0,
      icon: FiCreditCard,
      color: "bg-teal-100 text-teal-600",
    },
  ]

  return (
    <>
      {/* Breadcrumbs */}
      <div className="breadcrumbs text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul>
          <li>
            <Link to="/InicioPlanificador" className="flex items-center hover:text-blue-500">
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
              Sistema Gerencial
            </Link>
          </li>
          <li>
            <Link to="/InicioPlanificador/Proyecto" className="flex items-center hover:text-blue-500">
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
              Actualización de Proyecto
            </Link>
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="flex flex-col h-auto overflow-hidden p-4">
        <div className="text-sm text-gray-500 flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Proyectos</h1>
        </div>

        {/* Display error message if there is one */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Metrics cards - first row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {metrics.slice(0, 4).map((metric) => (
            <div
              key={metric.id}
              className="p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              onMouseEnter={() => setHoveredMetric(metric.id)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-xl font-bold text-gray-900" title={formatMontoConSeparador(metric.value)}>
                    {formatMontoConSeparador(metric.value)}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-full ${metric.color} flex items-center justify-center`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics cards - second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {metrics.slice(4).map((metric) => (
            <div
              key={metric.id}
              className="p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              onMouseEnter={() => setHoveredMetric(metric.id)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-xl font-bold text-gray-900" title={formatMontoConSeparador(metric.value)}>
                    {formatMontoConSeparador(metric.value)}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-full ${metric.color} flex items-center justify-center`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar proyecto..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button onClick={() => setSearchText("")} className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-4 h-4 text-gray-500 hover:text-gray-700"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 12 12M1 13 13 1"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading state or table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingComponent />
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Listado de Proyectos</h2>
                <p className="text-sm text-gray-500">Gestión y edición de proyectos</p>
              </div>

              <div className="overflow-x-auto">
                <div className="h-[500px] overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre Corto
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Región
                        </th>
                        <th className="py-3 px-4  text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell text-center">
                          Avance Real(%) / Plan(%)
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Ofertado(USD)
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Costo Planificado(USD)
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Por Valuar
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Por Facturar
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Facturado
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Amortización
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Monto Anticipo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="11" className="px-6 py-4 text-center text-sm text-gray-500">
                            No hay proyectos disponibles.
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((proyecto) => (
                          <tr
                            key={proyecto.id}
                            onClick={() => handleRowClick(proyecto.id, proyecto.nombre_proyecto)}
                            className="hover:bg-gray-50 cursor-pointer"
                          >
                            <td className="py-4 px-4 text-sm text-gray-900 text-center">{proyecto.numero || "N/A"}</td>

                            <td className="py-4 px-4 text-sm text-gray-900 text-left">
                              <div className="truncate max-w-[150px]" title={proyecto.nombre_proyecto || "N/A"}>
                                {proyecto.nombre_cortos || proyecto.nombre_corto || "N/A"}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full  ${proyecto.nombre_region === "Centro"
                                  ? "bg-blue-100 text-blue-800"
                                  : proyecto.nombre_region === "Occidente"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {proyecto.nombre_region || "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              <ProgressIndicator
                                progress={{
                                  real: Number.parseFloat(proyecto.avance_real_maximo) || 0,
                                  planned: Number.parseFloat(proyecto.avance_planificado_maximo) || 0,
                                  completed: 100, // Asumimos que el avance completado es siempre 100%
                                }}
                              />
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              {formatMontoConSeparador(proyecto.monto_ofertado || 0)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              {formatMontoConSeparador(proyecto.costo_estimado || 0)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              {formatMontoConSeparador(proyecto.por_valuar || 0)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              {formatMontoConSeparador(proyecto.por_factura || 0)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              {formatMontoConSeparador(proyecto.facturado || 0)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              {formatMontoConSeparador(proyecto.total_amortizacion || 0)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              {formatMontoConSeparador(proyecto.monto_anticipo_total || 0)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Mostrando {filteredProyectos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                  {Math.min(currentPage * rowsPerPage, filteredProyectos.length)} de {filteredProyectos.length}{" "}
                  resultados
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
      </div>
    </>
  )
}

export default Proyecto
