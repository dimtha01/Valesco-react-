"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import showNotification, { formatearFechaUTC, formatMontoConSeparador, UrlApi } from "../utils/utils"
import LoadingBar from "./LoadingBar"
import ExcelExport from "../components/ExcelExport"

const GestionCostos = () => {
  const params = useParams()
  const [costos, setCostos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 7
  const [costoOfertado, setCostoOfertado] = useState(0)
  const [costoTotal, setCostoTotal] = useState(0)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(costos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  const paginatedData = costos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(costos.length / rowsPerPage)

  // Función para obtener el color del estatus
  const getEstatusColor = (estatusNombre) => {
    if (!estatusNombre) return "bg-gray-100 text-gray-800"

    const nombreLower = estatusNombre.toLowerCase()
    if (nombreLower.includes("por valuar")) return "bg-blue-100 text-blue-800"
    if (nombreLower.includes("por facturar")) return "bg-yellow-100 text-yellow-800"
    if (nombreLower.includes("facturado")) return "bg-green-100 text-green-800"

    // Color por defecto
    return "bg-gray-100 text-gray-800"
  }

  const fetchCostos = useCallback(async () => {
    try {
      const response = await fetch(`${UrlApi}/api/costos/${params.id}`)
      if (!response.ok) {
        throw new Error("Error al cargar los costos")
      }
      const data = await response.json()
      setCostos(data.costos || [])
      setCostoOfertado(Number(data.costosOfertado) || 0)

      // Calcular el costo total
      const total = data.costos.reduce((sum, costo) => sum + Number(costo.costo), 0)
      setCostoTotal(total)
    } catch (error) {
      console.error("Error al cargar los costos:", error)
      showNotification("error", "Error", "Ocurrió un problema al cargar los costos.")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchCostos()
  }, [fetchCostos])

  // Función para formatear los datos de costos para Excel
  const formatCostosData = (data) => {
    return data.map((costo) => [
      {
        v: formatearFechaUTC(costo.fecha),
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
        v: costo.numero_valuacion || "",
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
        v: Number(costo.costo),
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
        v: formatearFechaUTC(costo.fecha_inicio),
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
        v: formatearFechaUTC(costo.fecha_fin),
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
        v: costo.nombre_estatus || "",
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
  const createTotalesSheet = () => {
    // Crear datos para la hoja de totales
    const totalesData = [
      // Título
      [
        {
          v: "Resumen de Costos",
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
          v: "Costo Planificado",
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
          v: costoOfertado,
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
          v: "Costo Real",
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
          v: costoTotal,
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

    return totalesData
  }

  // Configuración para la exportación a Excel
  const exportToXLSX = ExcelExport({
    data: costos,
    fileName: `costos_${params.Proyecto || "proyecto"}`,
    sheetName: `Costos ${params.Proyecto || ""}`,
    title: `Registro de Costos de ${params.Proyecto || "Proyecto"}`,
    headers: ["Fecha", "N° Valuación del Proveedor", "Monto USD", "Fecha Inicio", "Fecha Fin", "Estatus"],
    columnWidths: [15, 25, 15, 15, 15, 15],
    formatData: formatCostosData,
    additionalSheets: [
      {
        name: "Resumen",
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

  return (
    <div className="flex flex-col h-auto overflow-hidden p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Costos</h1>

      {costoOfertado > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
          <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Planificado (USD)</h3>
            <p className="text-lg font-bold text-gray-900">{formatMontoConSeparador(costoOfertado)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Real (USD)</h3>
            <p className="text-lg font-bold text-green-600">{formatMontoConSeparador(costoTotal)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Registro de Costos</h2>
            <p className="text-sm text-gray-500">Detalle de costos del proyecto</p>
          </div>
          <button
            onClick={exportToXLSX}
            disabled={isLoading || costos.length === 0}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Exportar a XLSX
          </button>
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
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Valuación del Proveedor
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto USD
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Inicio
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Fin
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estatus
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500">
                        No hay datos disponibles.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((costo) => (
                      <tr key={costo.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha)}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{costo.numero_valuacion || "-"}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">
                          {formatMontoConSeparador(costo.costo)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha_inicio)}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(costo.fecha_fin)}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstatusColor(
                              costo.nombre_estatus,
                            )}`}
                          >
                            {costo.nombre_estatus || "-"}
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
            Mostrando {costos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
            {Math.min(currentPage * rowsPerPage, costos.length)} de {costos.length} resultados
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
  )
}

export default GestionCostos
