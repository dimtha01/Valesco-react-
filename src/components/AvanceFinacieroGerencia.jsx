"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { formatCurrency, UrlApi } from "../utils/utils"
import { FiDollarSign, FiBarChart2, FiShoppingCart, FiCheckCircle, FiUsers, FiTrendingUp, FiInfo } from "react-icons/fi"
import LoadingBar from "./LoadingBar"

const AvanceFinancieroGerencial = () => {
  const params = useParams()
  const [avancesFinancieros, setAvancesFinancieros] = useState([])
  const [proyectoDetails, setProyectoDetails] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [showUnitsInfo, setShowUnitsInfo] = useState(false)
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
        const response = await fetch(`${UrlApi}/api/proyectos/${params.id}`)
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
    setCurrentPage(newPage)
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
        title: "Ofertado",
        value: proyectoDetails ? Number.parseFloat(proyectoDetails.monto_ofertado) : 0,
        icon: "FiDollarSign",
        color: "bg-green-100 text-green-600",
      },
      {
        title: "Costo Estimado",
        value: proyectoDetails ? Number.parseFloat(proyectoDetails.costo_estimado) : 0,
        icon: "FiBarChart2",
        color: "bg-blue-100 text-blue-600",
      },
      {
        title: "Costo Real",
        value: proyectoDetails ? Number.parseFloat(proyectoDetails.costo_real_total) : 0,
        icon: "FiTrendingUp",
        color: "bg-red-100 text-red-600",
      },
      {
        title: "Por Facturar",
        value: porFacturar,
        icon: "FiShoppingCart",
        color: "bg-yellow-100 text-yellow-600",
      },
      {
        title: "Facturado",
        value: facturado,
        icon: "FiCheckCircle",
        color: "bg-purple-100 text-purple-600",
      },
      {
        title: "Por Valuar",
        value: porValuar,
        icon: "FiUsers",
        color: "bg-pink-100 text-pink-600",
      },
    ]
  }

  return (
    <div className="flex flex-col h-auto overflow-hidden">
      {/* Breadcrumbs */}
      <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f]">
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
      <div className="mx-2 mt-2">
        <button
          onClick={() => setShowUnitsInfo(!showUnitsInfo)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <FiInfo className="mr-1" />
          {showUnitsInfo ? "Ocultar leyenda de unidades" : "Mostrar leyenda de unidades"}
        </button>

        {showUnitsInfo && (
          <div className="mt-2 p-2 bg-blue-50 rounded-md text-sm">
            <div className="flex space-x-4">
              <div className="flex items-center">
                <span className="font-medium text-gray-900 mr-1">K</span>
                <span className="text-gray-600">= Miles</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-900 mr-1">M</span>
                <span className="text-gray-600">= Millones</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-gray-900 mr-1">MM</span>
                <span className="text-gray-600">= Miles de millones</span>
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
      <div className="flex-1 overflow-hidden p-2 space-y-3 flex flex-col">
        {/* Eliminar o reemplazar esta línea */}
        {/* <h1 className="text-center text-lg font-semibold">Administración de Contratos</h1> */}

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          {calculateMetrics().map((metric, index) => (
            <div key={index} className="p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(metric.value)}</p>
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
          <LoadingBar />
        ) : (
          <div className="flex flex-col">
            {/* Nueva tabla con el diseño de la imagen */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Título y descripción */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Avance Financiero</h2>
                <p className="text-sm text-gray-500">Detalle de valuaciones y facturación del proyecto</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        ID
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Número de Valuación
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto (USD)
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Número de Factura
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estatus del Proceso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500">
                          No hay datos disponibles
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((avance) => (
                        <tr key={avance.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-500 hidden md:table-cell">{avance.id}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {new Date(avance.fecha).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500 hidden md:table-cell">
                            {avance.numero_valuacion || "-"}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">
                            {formatCurrency(avance.monto_usd)}
                          </td>
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginador */}
              <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Mostrando {(currentPage - 1) * rowsPerPage + 1} a{" "}
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
                    disabled={currentPage === totalPages}
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
    </div>
  )
}

export default AvanceFinancieroGerencial

