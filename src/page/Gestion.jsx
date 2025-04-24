"use client"

import { useEffect, useState, useContext, useCallback } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { UrlApi, formatMontoConSeparador } from "../utils/utils"
import { AuthContext } from "../components/AuthContext"
import ExcelExport from "../components/ExcelExport"
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

const Gestion = () => {
  const [proyectos, setProyectos] = useState([])
  const [totales, setTotales] = useState({
    total_ofertado: 0,
    total_costo_planificado: 0,
    total_costo_real: 0,
    total_facturado: 0,
    total_por_facturar: 0,
    total_por_valuar: 0,
    total_amortizacion: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 7
  const navigate = useNavigate()
  const { region: urlRegion } = useParams() // Get region from URL params
  const { region: contextRegion } = useContext(AuthContext)
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(urlRegion || contextRegion || "all")
  const [hoveredMetric, setHoveredMetric] = useState(null)

  // Función para asegurar que las fechas se formateen correctamente para Excel
  const formatExcelDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? "" : date
  }

  // Función para cargar los proyectos desde la API
  const fetchProyectos = useCallback(async () => {
    setIsLoading(true)
    try {
      // Use the specific API endpoint format with regionName
      const endpoint =
        selectedRegion && selectedRegion !== "all"
          ? `${UrlApi}/api/proyectos/${selectedRegion}`
          : `${UrlApi}/api/proyectos/all`

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error("Error al cargar los proyectos")
      }
      const data = await response.json()

      // Set regions to the specific options
      setRegions(["Oriente", "Occidente"])
      setProyectos(data.proyectos)
      setTotales(
        data.totales || {
          total_ofertado: 0,
          total_costo_planificado: 0,
          total_costo_real: 0,
          total_facturado: 0,
          total_por_facturar: 0,
          total_por_valuar: 0,
          total_amortizacion: 0,
        },
      )
    } catch (error) {
      console.error("Error al cargar los proyectos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedRegion])

  // Función para manejar el clic en una fila
  const handleRowClick = (id, nombre) => {
    navigate(`/GestionProyectos/${nombre}/${id}`)
  }

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(proyectos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Update the handleRegionChange function to navigate with the correct URL format
  const handleRegionChange = (e) => {
    const newRegion = e.target.value
    setSelectedRegion(newRegion)
    setCurrentPage(1) // Reset to first page when changing filter
    // Remove the navigation line to prevent redirection
  }

  // Calcular los datos paginados
  const paginatedData = proyectos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(proyectos.length / rowsPerPage)

  // Métricas para mostrar en las tarjetas
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

  // Modificar la función formatProyectosData para incluir todos los campos necesarios
  const formatProyectosData = (data) => {
    return data.map((proyecto) => [
      {
        v: proyecto.numero,
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        },
      },
      {
        v: proyecto.nombre_proyecto ? proyecto.nombre_proyecto.toUpperCase() : "",
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        },
      },
      {
        v: proyecto.nombre_cortos || "",
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        },
      },
      {
        v: proyecto.nombre_region || "",
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
        },
      },
      {
        v: proyecto.avance_real_maximo || 0,
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: '0.00"%"',
        },
      },
      {
        v: proyecto.avance_planificado_maximo || 0,
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: '0.00"%"',
        },
      },
      {
        v: proyecto.monto_ofertado || 0,
        s: {
          alignment: { horizontal: "right", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: '"$"#,##0.00',
        },
      },
      {
        v: proyecto.costo_estimado || 0,
        s: {
          alignment: { horizontal: "right", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: '"$"#,##0.00',
        },
      },
      {
        v: proyecto.por_valuar || 0,
        s: {
          alignment: { horizontal: "right", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: '"$"#,##0.00',
        },
      },
      {
        v: proyecto.por_factura || 0,
        s: {
          alignment: { horizontal: "right", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: '"$"#,##0.00',
        },
      },
      {
        v: proyecto.facturado || 0,
        s: {
          alignment: { horizontal: "right", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: '"$"#,##0.00',
        },
      },
      {
        v: proyecto.total_amortizacion || 0,
        s: {
          alignment: { horizontal: "right", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: '"$"#,##0.00',
        },
      },
      {
        v: proyecto.monto_anticipo_total || 0,
        s: {
          alignment: { horizontal: "right", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: '"$"#,##0.00',
        },
      },
    ])
  }

  // Crear una hoja con totales
  const createTotalesSheet = () => {
    // Crear datos para la hoja de totales
    const totalesData = [
      // Título
      [
        {
          v: "Totales de Proyectos",
          s: {
            font: { bold: true, color: { rgb: "000000" }, sz: 14 },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
      ],
      [""], // Fila vacía
      // Datos de totales
      [
        {
          v: "Métrica",
          s: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
        {
          v: "Valor Total",
          s: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
      ],
      // Filas de métricas
      ...metrics.map((metric) => [
        {
          v: metric.title,
          s: {
            alignment: { horizontal: "center" },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
          },
        },
        {
          v: metric.value,
          s: {
            alignment: { horizontal: "right" },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
            numFmt: '"$"#,##0.00',
          },
        },
      ]),
    ]

    return totalesData
  }

  // Actualizar la configuración de exportación para incluir todos los campos necesarios
  const exportToXLSX = ExcelExport({
    data: proyectos,
    fileName: "proyectos",
    sheetName: "Proyectos",
    title: "Datos de Proyectos",
    headers: [
      "N°",
      "Nombre del Contrato",
      "Nombre Corto",
      "Región",
      "Avance Real (%)",
      "Avance Planificado (%)",
      "Monto Ofertado (USD)",
      "Costo Planificado (USD)",
      "Por Valuar (USD)",
      "Por Facturar (USD)",
      "Facturado (USD)",
      "Amortización (USD)",
      "Monto Anticipo (USD)",
    ],
    columnWidths: [8, 40, 20, 15, 15, 15, 20, 20, 20, 20, 20, 20, 20],
    formatData: formatProyectosData,
    additionalSheets: [
      {
        name: "Totales",
        data: createTotalesSheet(),
        cols: [
          { wch: 25 }, // Primera columna
          { wch: 25 }, // Segunda columna
        ],
        merges: [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Título
        ],
      },
    ],
  })

  useEffect(() => {
    fetchProyectos()
  }, [fetchProyectos])

  return (
    <>
      <div className="breadcrumbs text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul>
          <li>
            <Link to="/InicioGestion" className="flex items-center hover:text-blue-500">
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
            <Link to="/Gestion" className="flex items-center hover:text-blue-500">
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

      <div className="flex flex-col h-auto overflow-hidden p-4">
        <div className="text-sm text-gray-500 flex items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Proyectos</h1>
        </div>

        {/* Métricas en tarjetas */}
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

        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <div className="flex items-center">
                <label htmlFor="region-filter" className="mr-2 text-gray-700">
                  Filtrar por región:
                </label>
                <select
                  id="region-filter"
                  value={selectedRegion}
                  onChange={handleRegionChange}
                  className="border border-gray-300 rounded-md py-1 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas las regiones</option>
                  <option value="Oriente">Oriente</option>
                  <option value="Occidente">Occidente</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={exportToXLSX}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Exportar a XLSX
            </button>
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
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell text-center">
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
                          <td colSpan="10" className="px-6 py-4 text-center text-sm text-gray-500">
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
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell text-center">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  proyecto.nombre_region === "Centro"
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

              {/* Paginador */}
              <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Mostrando {proyectos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                  {Math.min(currentPage * rowsPerPage, proyectos.length)} de {proyectos.length} resultados
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

export default Gestion
