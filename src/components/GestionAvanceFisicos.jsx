"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import { formatearFechaUTC, UrlApi } from "../utils/utils"
import LoadingBar from "./LoadingBar"
import ExcelExport from "../components/ExcelExport"

const GestionAvanceFisico = () => {
  const params = useParams()
  const [avancesFisicos, setAvancesFisicos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ultimoAvanceReal, setUltimoAvanceReal] = useState(0)
  const [ultimoAvancePlanificado, setUltimoAvancePlanificado] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 7

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(avancesFisicos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Datos paginados
  const paginatedData = avancesFisicos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(avancesFisicos.length / rowsPerPage)

  // Función para cargar los avances físicos
  const fetchAvancesFisicos = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${UrlApi}/api/avanceFisico/${params.id}`)
      if (!response.ok) {
        throw new Error("Error al cargar los avances físicos")
      }
      const data = await response.json()
      setAvancesFisicos(data)

      // Encontrar el máximo avance real y planificado registrado
      const maxAvanceReal = Math.max(...data.map((avance) => Number.parseFloat(avance.avance_real)), 0)
      const maxAvancePlanificado = Math.max(...data.map((avance) => Number.parseFloat(avance.avance_planificado)), 0)
      setUltimoAvanceReal(maxAvanceReal)
      setUltimoAvancePlanificado(maxAvancePlanificado)

      setError(null)
    } catch (error) {
      console.error("Error al cargar los avances físicos:", error)
      setError("Ocurrió un problema al cargar los avances físicos. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    fetchAvancesFisicos()
  }, [fetchAvancesFisicos])

  // Función para formatear los datos para Excel
  const formatAvancesFisicosData = (data) => {
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
        v: Number(avance.avance_real),
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
        v: Number(avance.avance_planificado),
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
        v: avance.puntos_atencion || "",
        s: {
          alignment: { horizontal: "left", vertical: "center" },
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
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
    ])
  }

  // Crear una hoja con resumen
  const createResumenSheet = () => {
    // Crear datos para la hoja de resumen
    const resumenData = [
      // Título
      [
        {
          v: "Resumen de Avance Fisico",
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
          v: "Metrica",
          s: {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "000000" } },
            alignment: { horizontal: "center", vertical: "center" },
          },
        },
        {
          v: "Valor",
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
          v: "Ultimo Avance Real",
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
          v: ultimoAvanceReal,
          s: {
            alignment: { horizontal: "center" },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
            numFmt: '0.00"%"',
          },
        },
      ],
      [
        {
          v: "Ultimo Avance Planificado",
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
          v: ultimoAvancePlanificado,
          s: {
            alignment: { horizontal: "center" },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
            numFmt: '0.00"%"',
          },
        },
      ],
      // Diferencia entre avance real y planificado
      [
        {
          v: "Diferencia (Real - Planificado)",
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
          v: ultimoAvanceReal - ultimoAvancePlanificado,
          s: {
            alignment: { horizontal: "center" },
            border: {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            },
            numFmt: '0.00"%"',
          },
        },
      ],
    ]

    return resumenData
  }

  // Configuración para la exportación a Excel
  const exportToXLSX = ExcelExport({
    data: avancesFisicos,
    fileName: "AvanceFisico",
    sheetName: "Avance",
    title: "Registro de Avance Fisico",
    headers: ["Fecha", "Avance Real (%)", "Avance Planificado (%)", "Puntos de Atencion", "Fecha Inicio", "Fecha Fin"],
    columnWidths: [15, 15, 20, 40, 15, 15],
    formatData: formatAvancesFisicosData,
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
        ],
      },
    ],
  })

  return (
    <div className="flex flex-col h-auto overflow-hidden p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Informe de Avance Físico</h1>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Último Avance Real</h3>
          <p className="text-lg font-bold text-blue-600">{ultimoAvanceReal}%</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Último Avance Planificado</h3>
          <p className="text-lg font-bold text-green-600">{ultimoAvancePlanificado}%</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Registro de Avances Físicos</h2>
            <p className="text-sm text-gray-500">Detalle de avances físicos del proyecto</p>
          </div>
          <button
            onClick={exportToXLSX}
            disabled={isLoading || avancesFisicos.length === 0}
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
                      Registrado
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avance Real (%)
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avance Planificado (%)
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntos de Atención
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Inicio
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Fin
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
                    paginatedData.map((avance, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha)}</td>
                        <td className="py-4 px-4 text-sm font-medium text-blue-600">{avance.avance_real}%</td>
                        <td className="py-4 px-4 text-sm font-medium text-green-600">{avance.avance_planificado}%</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{avance.puntos_atencion}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha_inicio)}</td>
                        <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha_fin)}</td>
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
            Mostrando {avancesFisicos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
            {Math.min(currentPage * rowsPerPage, avancesFisicos.length)} de {avancesFisicos.length} resultados
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

export default GestionAvanceFisico
