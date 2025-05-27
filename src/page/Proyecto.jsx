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
  FiSearch,
  FiX,
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
  })
  const [filteredProyectos, setFilteredProyectos] = useState([])
  const [regions, setRegions] = useState([])
  const { userRegion, user } = useContext(AuthContext)
  const region = userRegion

  const rowsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState("")
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("all")
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const filterProyectosByRegion = useCallback(
    (data) => {
      if (!data || !Array.isArray(data)) {
        setFilteredProyectos([])
        return
      }

      let filtered = data.filter((proyecto) => proyecto.nombre_region !== "Centro")

      if (region && region !== "all") {
        filtered = filtered.filter((proyecto) => proyecto.nombre_region === region)
      }

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
    navigate(`/InicioPlanificador/Proyecto/ActualizarProyecto/${nombre}/${id}`)
  }

  const paginatedData = filteredProyectos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(filteredProyectos.length / rowsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Breadcrumbs */}
      <div className="breadcrumbs text-lg mx-6 pt-6 text-[#0f0f0f]">
        <ul>
          <li>
            <Link
              to="/InicioPlanificador"
              className="flex items-center hover:text-blue-500 transition-colors duration-300"
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Sistema Gerencial
            </Link>
          </li>
          <li>
            <Link
              to="/InicioPlanificador/Proyecto"
              className="flex items-center hover:text-blue-500 transition-colors duration-300"
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
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Gestión de Proyectos
            </Link>
          </li>
        </ul>
      </div>

      {/* Header */}
      <div className="mb-8 my-5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-4 rounded-2xl mr-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="h-8 w-8 stroke-current text-white"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Proyectos</h1>
              <p className="text-gray-600 mt-1">Monitoreo financiero y operativo en tiempo real</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium mb-1">Monto Ofertado</p>
                  <p className="text-2xl font-bold text-blue-900">${formatMontoConSeparador(totales.total_ofertado)}</p>
                  <p className="text-blue-500 text-xs mt-1">Total contratado</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-xl">
                  <FiDollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium mb-1">Costo Planificado</p>
                  <p className="text-2xl font-bold text-green-900">
                    ${formatMontoConSeparador(totales.total_costo_planificado)}
                  </p>
                  <p className="text-green-500 text-xs mt-1">Presupuesto estimado</p>
                </div>
                <div className="bg-green-500 p-3 rounded-xl">
                  <FiBarChart2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium mb-1">Costo Real</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${formatMontoConSeparador(totales.total_costo_real)}
                  </p>
                  <p className="text-purple-500 text-xs mt-1">Gasto ejecutado</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-xl">
                  <FiActivity className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-teal-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-600 text-sm font-medium mb-1">Total Facturado</p>
                  <p className="text-2xl font-bold text-teal-900">
                    ${formatMontoConSeparador(totales.total_facturado)}
                  </p>
                  <p className="text-teal-500 text-xs mt-1">Ingresos confirmados</p>
                </div>
                <div className="bg-teal-500 p-3 rounded-xl">
                  <FiCheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium mb-1">Por Facturar</p>
                  <p className="text-2xl font-bold text-orange-900">
                    ${formatMontoConSeparador(totales.total_por_facturar)}
                  </p>
                  <p className="text-orange-500 text-xs mt-1">Pendiente facturación</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-xl">
                  <FiShoppingCart className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-600 text-sm font-medium mb-1">Por Valuar</p>
                  <p className="text-2xl font-bold text-pink-900">
                    ${formatMontoConSeparador(totales.total_por_valuar)}
                  </p>
                  <p className="text-pink-500 text-xs mt-1">En proceso evaluación</p>
                </div>
                <div className="bg-pink-500 p-3 rounded-xl">
                  <FiUsers className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium mb-1">Total Amortización</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${formatMontoConSeparador(totales.total_amortizacion)}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">Amortización acumulada</p>
                </div>
                <div className="bg-slate-500 p-3 rounded-xl">
                  <FiCreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-600 text-sm font-medium mb-1">Monto Anticipo Total</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    ${formatMontoConSeparador(totales.total_monto_anticipo)}
                  </p>
                  <p className="text-indigo-500 text-xs mt-1">Anticipos recibidos</p>
                </div>
                <div className="bg-indigo-500 p-3 rounded-xl">
                  <FiCreditCard className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}


          {/* Projects Table */}
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
              <div className="flex justify-center items-center">
                <LoadingComponent />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Listado de Proyectos</h2>
                <p className="text-sm text-gray-500">Gestión y seguimiento detallado</p>
              </div>

              <div className="h-[500px] overflow-hidden">
                <div className="flex h-full">
                  {/* Columnas fijas */}
                  <div className="sticky left-0 z-20 bg-white">
                    <div className="overflow-y-auto h-full">
                      <table className="border-collapse">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-30">
                          <tr>
                            <th className="py-4 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-[100px]">
                              Número
                            </th>
                            <th
                              className="py-4 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200"
                              style={{ width: "200px" }}
                            >
                              Nombre Corto
                            </th>
                            <th className="py-4 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap border-r border-gray-200 w-[120px]">
                              Código Contrato Cliente
                            </th>
                            <th className="py-4 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 w-[120px]">
                              Región
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {paginatedData.length === 0 ? (
                            <tr>
                              <td colSpan="3" className="px-6 py-12 text-center border-r border-gray-200">
                                <div className="flex flex-col items-center">
                                  <svg
                                    className="w-16 h-16 text-gray-300 mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  <p className="text-gray-500 text-lg font-medium">No hay proyectos disponibles</p>
                                  <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            paginatedData.map((proyecto) => (
                              <tr
                                key={`fixed-${proyecto.id}`}
                                onClick={() => handleRowClick(proyecto.id, proyecto.nombre_proyecto)}
                                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-300 group"
                                title="Haga clic para ver detalles y actualizar este proyecto"
                              >
                                <td className="py-7 px-4 text-sm font-medium text-gray-900 text-center border-r border-gray-200 w-[100px] group-hover:text-blue-600 transition-colors uppercase tracking-wider whitespace-nowrap">
                                  {proyecto.numero || "N/A"}
                                </td>
                                <td
                                  className="py-7 px-4 text-sm text-gray-900 text-left border-r border-gray-200"
                                  style={{ width: "250px" }}
                                >
                                  <div
                                    className="truncate max-w-[250px] font-medium group-hover:text-blue-600 transition-colors"
                                    title={proyecto.nombre_proyecto || "N/A"}
                                  >
                                    {proyecto.nombre_cortos || proyecto.nombre_corto || "N/A"}
                                  </div>
                                </td>
                                <td
                                  className="py-7 px-4 text-sm text-gray-900 text-left border-r border-gray-200 text-center"
                                  style={{ width: "250px" }}
                                >
                                  <div
                                    className="truncate max-w-[250px] font-medium group-hover:text-blue-600 transition-colors "

                                  >
                                    {proyecto.codigo_contrato_cliente || "N/A"}
                                  </div>
                                </td>
                                <td className="py-7 px-4 text-sm text-gray-900 text-center border-r border-gray-200 w-[120px]">
                                  <span
                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${proyecto.nombre_region === "Centro"
                                      ? "bg-blue-100 text-blue-800"
                                      : proyecto.nombre_region === "Occidente"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                      }`}
                                  >
                                    {proyecto.nombre_region || "N/A"}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Columnas con scroll */}
                  <div className="overflow-x-auto overflow-y-auto h-full">
                    <table className="border-collapse">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="py-4 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[200px]">
                            Avance Real(%) / Plan(%)
                          </th>
                          <th className="py-4 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[150px]">
                            Ofertado(USD)
                          </th>
                          <th className="py-4 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[180px]">
                            Costo Planificado(USD)
                          </th>
                          <th className="py-4 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[150px]">
                            Por Valuar
                          </th>
                          <th className="py-4 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[150px]">
                            Por Facturar
                          </th>
                          <th className="py-4 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[150px]">
                            Facturado
                          </th>
                          <th className="py-4 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[150px]">
                            Amortización
                          </th>
                          <th className="py-4 px-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[150px]">
                            Monto Anticipo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {paginatedData.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-12 text-center text-sm text-gray-500">
                              No hay proyectos disponibles.
                            </td>
                          </tr>
                        ) : (
                          paginatedData.map((proyecto) => (
                            <tr
                              key={`scroll-${proyecto.id}`}
                              onClick={() => handleRowClick(proyecto.id, proyecto.nombre_proyecto)}
                              className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-300 group"
                              title="Haga clic para ver detalles y actualizar este proyecto"
                            >
                              <td className="py-4 px-4 text-sm text-gray-900 w-[200px]">
                                <ProgressIndicator
                                  progress={{
                                    real: Number.parseFloat(proyecto.avance_real_maximo) || 0,
                                    planned: Number.parseFloat(proyecto.avance_planificado_maximo) || 0,
                                    completed: 100,
                                  }}
                                />
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 text-center whitespace-nowrap w-[150px] ">
                                {formatMontoConSeparador(proyecto.monto_ofertado || 0)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 text-center whitespace-nowrap w-[180px] ">
                                {formatMontoConSeparador(proyecto.costo_estimado || 0)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 text-center whitespace-nowrap w-[150px] ">
                                {formatMontoConSeparador(proyecto.por_valuar || 0)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 text-center whitespace-nowrap w-[150px] ">
                                {formatMontoConSeparador(proyecto.por_factura || 0)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 text-center whitespace-nowrap w-[150px] ">
                                {formatMontoConSeparador(proyecto.facturado || 0)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 text-center whitespace-nowrap w-[150px] ">
                                {formatMontoConSeparador(proyecto.total_amortizacion || 0)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900 text-center whitespace-nowrap w-[150px] ">
                                {formatMontoConSeparador(proyecto.monto_anticipo_total || 0)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando{" "}
                  <span className="font-medium">
                    {filteredProyectos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
                  </span>{" "}
                  a <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredProyectos.length)}</span>{" "}
                  de <span className="font-medium">{filteredProyectos.length}</span> resultados
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
    </div>
  )
}

export default Proyecto
