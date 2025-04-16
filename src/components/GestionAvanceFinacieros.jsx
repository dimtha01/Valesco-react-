"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import showNotification, { formatearFechaUTC, formatMontoConSeparador, UrlApi } from "../utils/utils"
import LoadingBar from "./LoadingBar"
import ExcelExport from "../components/ExcelExport"

const GestionAvanceFinancieros = () => {
  const params = useParams()
  const [avancesFinancieros, setAvancesFinancieros] = useState([])
  const [proyecto, setProyecto] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 7

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredData.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Filtrar datos por estado
  const filteredData = avancesFinancieros.filter(
    (avance) => filterStatus === "all" || avance.estatus_proceso_nombre.toLowerCase() === filterStatus,
  )

  // Datos paginados
  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)

  // Función para manejar el cambio de filtro
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value)
    setCurrentPage(1)
  }

  // Función para cargar los avances financieros
  const fetchAvancesFinancieros = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${UrlApi}/api/avanceFinanciero/${params.id}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al cargar los avances financieros")
      }

      const data = await response.json()

      if (Array.isArray(data) && data.length === 0) {
        showNotification("info", "Sin datos", "No se encontraron avances financieros para este proyecto.")
        setAvancesFinancieros([])
      } else {
        setAvancesFinancieros(data)
      }
      setError(null)
    } catch (error) {
      console.error("Error al cargar los avances financieros:", error)
      setError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.")
      setAvancesFinancieros([])
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  // Función para cargar el proyecto por ID
  const fetchProyectoById = useCallback(async () => {
    try {
      const response = await fetch(`${UrlApi}/api/proyectos/id/${params.id}`)
      if (!response.ok) {
        throw new Error("Error al cargar el proyecto")
      }
      const data = await response.json()

      if (!data || Object.keys(data).length === 0) {
        showNotification("info", "Sin datos", "No se encontró información para este proyecto.")
        setProyecto(null)
        return
      }

      setProyecto(data)
    } catch (error) {
      console.error("Error al cargar el proyecto:", error)
      setError("Ocurrió un problema al cargar el proyecto. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    fetchAvancesFinancieros()
    fetchProyectoById()
  }, [fetchAvancesFinancieros, fetchProyectoById])

  // Función para formatear los datos para Excel
  const formatAvancesFinancierosData = (data) => {
    return data.map((avance) => [
      {
        v: formatearFechaUTC(avance.fecha),
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
        v: avance.numero_valuacion || "",
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
        v: Number(avance.monto_usd),
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
        v: formatearFechaUTC(avance.fecha_inicio),
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
        v: formatearFechaUTC(avance.fecha_fin),
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
        v: avance.numero_factura || "No hay factura",
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
        v: avance.estatus_proceso_nombre || "",
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
    ])
  }

  // Crear una hoja con totales
  const createResumenSheet = () => {
    // Calcular el total de montos
    const totalMonto = avancesFinancieros.reduce((sum, avance) => sum + Number(avance.monto_usd || 0), 0)

    // Crear datos para la hoja de resumen
    const resumenData = [
      // Título
      [
        {
          v: "Resumen de Administración de Contratos",
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
      [
        {
          v: "Monto Ofertado",
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
          v: proyecto ? Number(proyecto.monto_ofertado || 0) : 0,
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
      ],
      [
        {
          v: "Total Valuaciones",
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
          v: totalMonto,
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
      ],
      // Agregar estadísticas por estatus
      [""], // Fila vacía
      [
        {
          v: "Estadísticas por Estatus",
          s: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
        {
          v: "Monto Total",
          s: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
      ],
      // Por Valuar
      [
        {
          v: "Por Valuar",
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
          v: avancesFinancieros
            .filter((avance) => avance.estatus_proceso_nombre === "Por Valuar")
            .reduce((sum, avance) => sum + Number(avance.monto_usd || 0), 0),
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
      ],
      // Por Facturar
      [
        {
          v: "Por Facturar",
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
          v: avancesFinancieros
            .filter((avance) => avance.estatus_proceso_nombre === "Por Facturar")
            .reduce((sum, avance) => sum + Number(avance.monto_usd || 0), 0),
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
      ],
      // Facturado
      [
        {
          v: "Facturado",
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
          v: avancesFinancieros
            .filter((avance) => avance.estatus_proceso_nombre === "Facturado")
            .reduce((sum, avance) => sum + Number(avance.monto_usd || 0), 0),
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
      ],
    ]

    return resumenData
  }

  // Configuración para la exportación a Excel
  const exportToXLSX = ExcelExport({
    data: avancesFinancieros,
    fileName: `Administracion_Contratos`,
    sheetName: `Contratos`,
    title: `Registro de Administración de Contratos`,
    headers: [
      "Fecha",
      "N° Valuación del Cliente",
      "Monto USD",
      "Fecha Inicio",
      "Fecha Fin",
      "Número de Factura",
      "Estatus del Proceso",
    ],
    columnWidths: [15, 25, 15, 15, 15, 20, 20],
    formatData: formatAvancesFinancierosData,
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
          { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } }, // Estadísticas por Estatus
        ],
      },
    ],
  })

  return (
    <div className="flex flex-col h-auto overflow-hidden p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Administración de Contratos</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col">
        {proyecto && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Monto Ofertado (USD)</h3>
              <p className="text-lg font-bold text-gray-900">{formatMontoConSeparador(proyecto.monto_ofertado || 0)}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Administración de Contratos</h2>
              <p className="text-sm text-gray-500">Detalle de valuaciones y facturación del proyecto</p>
            </div>
            <div className="flex items-center space-x-4">
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
              <button
                onClick={exportToXLSX}
                disabled={isLoading || avancesFinancieros.length === 0}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Exportar a XLSX
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="h-[500px] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingBar />
                </div>
              ) : (
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        ID
                      </th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número de Valuación del Cliente
                      </th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto USD
                      </th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Inicio
                      </th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Fin
                      </th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Número de Factura
                      </th>
                      <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estatus del Proceso
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-gray-500">
                          No hay datos disponibles
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((avance) => (
                        <tr key={avance.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-500 hidden md:table-cell text-center">
                            {avance.id}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900 text-center">
                            {formatearFechaUTC(avance.fecha)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900 text-center">
                            {avance.numero_valuacion || "-"}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-gray-900 text-center">
                            {formatMontoConSeparador(avance.monto_usd)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900 text-center">
                            {formatearFechaUTC(avance.fecha_inicio)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-900 text-center">
                            {formatearFechaUTC(avance.fecha_fin)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500 hidden md:table-cell text-center">
                            {avance.numero_factura || "-"}
                          </td>
                          <td className="py-4 px-4 text-center">
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
              )}
            </div>
          </div>

          {/* Paginador */}
          <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
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
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GestionAvanceFinancieros
