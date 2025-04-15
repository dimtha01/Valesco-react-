"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { decimalAEntero, formatMontoConSeparador, UrlApi } from "../utils/utils"
import { AuthContext } from "../components/AuthContext"
import LoadingComponent from "../components/LoadingComponent" // Import LoadingComponent
import { FiActivity, FiBarChart2, FiCheckCircle, FiDollarSign, FiShoppingCart, FiUsers } from "react-icons/fi"
import { ProgressIndicator } from "./RegionDetalles"

// Función local para formatear montos con separador de miles (formato: 1,234,567.89)


const Proyecto = () => {
  const [proyectos, setProyectos] = useState([])
  const [totales, setTotales] = useState([])
  const [filteredProyectos, setFilteredProyectos] = useState([])
  const [regions, setRegions] = useState([])
  const { region } = useContext(AuthContext) // Get region from AuthContext
  const rowsPerPage = 7
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("all")
  const [hoveredMetric, setHoveredMetric] = useState(null) // Estado para controlar qué métrica tiene el cursor encima


  const navigate = useNavigate()

  const filterProyectosByRegion = useCallback(
    (data) => {
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
      try {
        const response = await fetch(`${UrlApi}/api/proyectos/${region}`)
        const data = await response.json()
        setProyectos(data.proyectos)
        setTotales(data.totales);

        // Extract unique regions
        const uniqueRegions = [...new Set(data.map((proyecto) => proyecto.nombre_region))]
        setRegions(uniqueRegions)

        // Filter projects based on user's region from context
        filterProyectosByRegion(data.proyectos)
      } catch (error) {
        console.error("Error al cargar los proyectos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProyectos()
  }, [filterProyectosByRegion]) // Removed region as dependency and added filterProyectosByRegion

  // Update filter when projects or region changes
  useEffect(() => {
    filterProyectosByRegion(proyectos)
  }, [region, proyectos, searchText, filterProyectosByRegion])

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

  const totalOfertado = totales.total_ofertado;
  const totalCostoPlanificado = totales.total_costo_planificado;
  const totalCostoReal = totales.total_costo_real;
  const totalFacturado = totales.total_facturado;
  const totalPorFacturar = totales.total_por_facturar;
  const totalPorValuar = totales.total_por_valuar;

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
    <>
      {/* Mantener los breadcrumbs existentes */}
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

      {/* Aplicar los estilos de EditarProyectos */}
      <div className="flex flex-col h-auto overflow-hidden p-4">
        <div className="text-sm text-gray-500 flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Proyectos</h1>


        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
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
                  <p className="text-xl font-bold text-gray-900" title={formatMontoConSeparador(metric.value)}>
                    {hoveredMetric === metric.id ? formatMontoConSeparador(metric.value) : formatMontoConSeparador(metric.value)}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-full ${metric.color} flex items-center justify-center`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
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
                            <td className="py-4 px-4 text-sm text-gray-900 text-center">{proyecto.numero}</td>

                            <td className="py-4 px-4 text-sm text-gray-900 text-left">
                              <div className="truncate max-w-[150px]" title={proyecto.nombre_proyecto || "N/A"}>
                                {proyecto.nombre_cortos || "N/A"}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center   ">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full  ${proyecto.nombre_region === "Centro"
                                  ? "bg-blue-100 text-blue-800"
                                  : proyecto.nombre_region === "Occidente"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {proyecto.nombre_region}
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
                              {formatMontoConSeparador(proyecto.monto_ofertado)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              {formatMontoConSeparador(proyecto.costo_estimado)}
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

