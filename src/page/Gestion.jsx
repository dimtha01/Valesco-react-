"use client"

import { useEffect, useState, useContext, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UrlApi } from "../utils/utils"
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

  // Modificar la función formatProyectosData para incluir el nombre_corto en la exportación
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
        v: proyecto.nombre_corto || "",
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
  // Actualizar la configuración de exportación para incluir el nombre_corto en los encabezados
  const exportToXLSX = ExcelExport({
    data: proyectos,
    fileName: "proyectos",
    sheetName: "Proyectos",
    title: "Datos de la Creación de Proyectos",
    headers: [
      "N°",
      "Nombre del Contrato",
      "Nombre Corto",
      "Cliente",
      "Costo Estimado (Planificado)",
      "Monto Ofertado (Cliente)",
      "Fecha Inicio",
      "Fecha Fin",
    ],
    columnWidths: [8, 40, 20, 20, 25, 25, 15, 15],
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
      <div className="flex flex-col h-auto overflow-hidden p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Proyectos</h1>

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
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
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
      </div>

      {/* Tabla */}
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
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Proyecto
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Corto
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Región
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Monto Ofertado(USD)
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Costo Estimado(USD)
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Fecha Inicio
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Fecha Fin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
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
                        <td className="py-4 px-4 text-sm text-gray-900">{proyecto.numero}</td>
                        {/* Modificar la celda donde se muestra el nombre del proyecto para que aparezca en mayúsculas */}
                        <td className="py-4 px-4 text-sm text-gray-900">
                          <div className="truncate max-w-[200px]" title={proyecto.nombre_proyecto}>
                            {proyecto.nombre_proyecto ? proyecto.nombre_proyecto.toUpperCase() : ""}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">
                          <div className="truncate max-w-[150px]" title={proyecto.nombre_corto || "N/A"}>
                            {proyecto.nombre_corto || "N/A"}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              proyecto.nombre_region === "Centro"
                                ? "bg-blue-100 text-blue-800"
                                : proyecto.nombre_region === "Occidente"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {proyecto.nombre_region || "-"}
                          </span>
                        </td>
                        {/* Quitar el símbolo $ de los valores monetarios */}
                        <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                          {proyecto.monto_ofertado || "-"}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                          {proyecto.costo_estimado || "-"}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                          {formatDate(proyecto.fecha_inicio) || "-"}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                          {formatDate(proyecto.fecha_final) || "-"}
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
                disabled={
                  currentPage === Math.ceil(proyectos.length / rowsPerPage) ||
                  Math.ceil(proyectos.length / rowsPerPage) === 0
                }
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Gestion

