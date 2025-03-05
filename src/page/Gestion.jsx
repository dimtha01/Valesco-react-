"use client"

import { useEffect, useState, useContext, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UrlApi } from "../utils/utils"
import LoadingBar from "../components/LoadingBar"
import { AuthContext } from "../components/AuthContext"
import ExcelExport from "../components/ExcelExport"

// Configuración para la exportación a Excel con múltiples hojas


const Gestion = () => {
  const [proyectos, setProyectos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 8
  const navigate = useNavigate()
  const { region } = useContext(AuthContext)
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(region || "all")

  // Función para asegurar que las fechas se formateen correctamente para Excel
  const formatExcelDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? "" : date
  }

  // Función para cargar los proyectos desde la API
  const fetchProyectos = useCallback(async () => {
    try {
      const response = await fetch(`${UrlApi}/api/proyectos`)
      if (!response.ok) {
        throw new Error("Error al cargar los proyectos")
      }
      const data = await response.json()

      // Extract unique regions for the filter
      const uniqueRegions = [...new Set(data.map((proyecto) => proyecto.nombre_region))].filter(Boolean)
      setRegions(uniqueRegions)

      // Filter by region if selected
      const filteredData =
        selectedRegion && selectedRegion !== "all"
          ? data.filter((proyecto) => proyecto.nombre_region === selectedRegion)
          : data

      setProyectos(filteredData)
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

  // Función para manejar el cambio de región
  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value)
    setCurrentPage(1) // Reset to first page when changing filter
  }

  // Calcular los datos paginados
  const paginatedData = proyectos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Configuración para la exportación a Excel
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
        v: proyecto.nombre_proyecto,
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
        v: proyecto.nombre_cliente || "",
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
        v: proyecto.costo_estimado || "",
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
        v: proyecto.monto_ofertado || "",
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
        v: formatExcelDate(proyecto.fecha_inicio),
        t: proyecto.fecha_inicio ? "d" : "s",
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: "dd/mm/yyyy",
        },
      },
      {
        v: formatExcelDate(proyecto.fecha_final),
        t: proyecto.fecha_final ? "d" : "s",
        s: {
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          numFmt: "dd/mm/yyyy",
        },
      },
    ])
  }

  // Crear una segunda hoja con resumen
  const createResumenSheet = () => {
    // Preparar datos para el resumen
    const totalProyectos = proyectos.length
    const totalMontoOfertado = proyectos.reduce(
      (sum, proyecto) => sum + (Number.parseFloat(proyecto.monto_ofertado) || 0),
      0,
    )
    const totalCostoEstimado = proyectos.reduce(
      (sum, proyecto) => sum + (Number.parseFloat(proyecto.costo_estimado) || 0),
      0,
    )

    // Agrupar por región
    const proyectosPorRegion = {}
    proyectos.forEach((proyecto) => {
      const region = proyecto.nombre_region || "Sin región"
      if (!proyectosPorRegion[region]) {
        proyectosPorRegion[region] = 0
      }
      proyectosPorRegion[region]++
    })

    // Crear datos para la hoja de resumen
    const resumenData = [
      // Título
      [
        {
          v: "Resumen de Proyectos",
          s: {
            font: { bold: true, color: { rgb: "FF0000" }, sz: 14 },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
      ],
      [""], // Fila vacía
      // Datos generales
      [
        {
          v: "Estadísticas Generales",
          s: {
            font: { bold: true },
            fill: { fgColor: { rgb: "DDDDDD" } },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
      ],
      [""], // Fila vacía
      [
        { v: "Total de Proyectos", s: { font: { bold: true }, alignment: { horizontal: "center" } } },
        { v: totalProyectos, s: { alignment: { horizontal: "center" } } },
      ],
      [
        { v: "Monto Total Ofertado", s: { font: { bold: true }, alignment: { horizontal: "center" } } },
        {
          v: totalMontoOfertado,
          s: {
            alignment: { horizontal: "center" },
            numFmt: '"$"#,##0.00',
          },
        },
      ],
      [
        { v: "Costo Total Estimado", s: { font: { bold: true }, alignment: { horizontal: "center" } } },
        {
          v: totalCostoEstimado,
          s: {
            alignment: { horizontal: "center" },
            numFmt: '"$"#,##0.00',
          },
        },
      ],
      [""], // Fila vacía
      // Distribución por región
      [
        {
          v: "Distribución por Región",
          s: {
            font: { bold: true },
            fill: { fgColor: { rgb: "DDDDDD" } },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
      ],
      [""], // Fila vacía
      [
        {
          v: "Región",
          s: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
        {
          v: "Cantidad de Proyectos",
          s: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
      ],
      // Filas de regiones
      ...Object.entries(proyectosPorRegion).map(([region, cantidad]) => [
        {
          v: region,
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
          v: cantidad,
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
      ]),
    ]

    return resumenData
  }
  const exportToXLSX = ExcelExport({
    data: proyectos,
    fileName: "proyectos",
    sheetName: "Proyectos",
    title: "Datos de la Creación de Proyectos",
    headers: [
      "N°",
      "Nombre del Contrato",
      "Cliente",
      "Costo Estimado (Planificado)",
      "Monto Ofertado (Cliente)",
      "Fecha Inicio",
      "Fecha Fin",
    ],
    columnWidths: [8, 40, 20, 25, 25, 15, 15],
    formatData: formatProyectosData,
    additionalSheets: [
      {
        name: "Resumen",
        data: createResumenSheet(),
        cols: [
          { wch: 25 }, // Primera columna
          { wch: 25 }, // Segunda columna
        ],
        merges: [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Título
          { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // Estadísticas Generales
          { s: { r: 8, c: 0 }, e: { r: 8, c: 1 } }, // Distribución por Región
        ],
      },
    ],
  })

  useEffect(() => {
    fetchProyectos()
  }, [fetchProyectos])

  return (
    <>
      <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul className="flex items-center space-x-2">
          <li>
            <Link to="/InicioGestion" className="flex items-center hover:text-blue-500 transition-colors duration-300">
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
              Gestion
            </Link>
          </li>
          <li>
            <Link to="/Gestion" className="flex items-center hover:text-blue-500 transition-colors duration-300">
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
              Proyectos
            </Link>
          </li>
        </ul>
      </div>
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden mx-4">
        {/* Botones de exportar */}
        <div className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-gray-50 border-b">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-700">Registro de Proyectos</h2>
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
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
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

        {/* Tabla */}
        <div className="overflow-x-auto min-h-[465px]">
          {isLoading ? (
            <LoadingBar />
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              {/* Encabezado */}
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre Proyecto
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Región
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Monto Ofertado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Fecha Fin
                  </th>
                </tr>
              </thead>
              {/* Cuerpo */}
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      {proyectos === null ? "Cargando datos..." : "No hay proyectos disponibles"}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((proyecto) => (
                    <tr
                      key={proyecto.id}
                      onClick={() => handleRowClick(proyecto.id, proyecto.nombre_proyecto)}
                      className="cursor-pointer hover:bg-gray-200 transition duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {proyecto.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {proyecto.nombre_proyecto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell text-center">
                        {proyecto.nombre_cliente || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell text-center">
                        {proyecto.nombre_region || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell text-center">
                        ${proyecto.monto_ofertado || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell text-center">
                        {formatDate(proyecto.fecha_inicio) || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell text-center">
                        {formatDate(proyecto.fecha_final) || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginador */}
        {!isLoading && proyectos.length > 0 && (
          <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> a{" "}
                  <span className="font-medium">{Math.min(currentPage * rowsPerPage, proyectos.length)}</span> de{" "}
                  <span className="font-medium">{proyectos.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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

                  {/* Números de página */}
                  {Array.from({ length: Math.min(5, Math.ceil(proyectos.length / rowsPerPage)) }, (_, i) => {
                    // Mostrar 5 páginas como máximo
                    let pageNum
                    const totalPages = Math.ceil(proyectos.length / rowsPerPage)

                    if (totalPages <= 5) {
                      // Si hay 5 o menos páginas, mostrar todas
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      // Si estamos en las primeras páginas
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      // Si estamos en las últimas páginas
                      pageNum = totalPages - 4 + i
                    } else {
                      // Si estamos en el medio
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(proyectos.length / rowsPerPage)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
        )}
      </div>
    </>
  )
  
}


export default Gestion

