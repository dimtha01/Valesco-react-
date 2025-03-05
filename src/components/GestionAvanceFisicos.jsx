"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import showNotification, { formatearFechaUTC, UrlApi } from "../utils/utils"
import LoadingBar from "./LoadingBar"
import ExcelExport from "./ExcelExport"

const GestionAvanceFisicos = () => {
  const params = useParams()
  const [avancesFisicos, setAvancesFisicos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const rowsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(avancesFisicos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Datos paginados
  const paginatedData = avancesFisicos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Función para cargar los avances físicos
  const fetchAvancesFisicos = useCallback(async () => {
    try {
      const response = await fetch(`${UrlApi}/api/avanceFisico/${params.id}`)
      if (!response.ok) {
        throw new Error("Error al cargar los avances físicos")
      }
      const data = await response.json()
      setAvancesFisicos(data)
    } catch (error) {
      console.error("Error al cargar los avances físicos:", error)
      showNotification("error", "Error", "Ocurrió un problema al cargar los avances físicos.")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    fetchAvancesFisicos()
  }, [fetchAvancesFisicos])

  // Función para formatear los datos para Excel
  const formatAvancesData = (data) => {
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
        v: `${avance.avance_real}%`,
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
        v: `${avance.avance_planificado}%`,
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
        v: avance.puntos_atencion || "",
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

  // Configuración para la exportación a Excel
  const exportToXLSX = ExcelExport({
    data: avancesFisicos,
    fileName: `avances_fisicos_${params.Proyecto}`,
    sheetName: `Avances Físicos de ${params.Proyecto}`,
    title: `Registro de Avances Físicos de ${params.Proyecto}`,
    headers: [
      "Registrado",
      "Avance Real (%)",
      "Avance Planificado (%)",
      "Puntos de Atención",
      "Fecha Inicio",
      "Fecha Fin",
    ],
    columnWidths: [20, 15, 20, 30, 20, 20],
    formatData: formatAvancesData,
  })

  return (
    <div className="text-[#141313] xl:mx-20 mt-2">
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Registro de Avances Físicos</h2>
            <button
              onClick={exportToXLSX}
              disabled={isLoading || avancesFisicos.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Exportar a XLSX
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[310px]">
          {isLoading ? (
            <LoadingBar />
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registrado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avance Real (%)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avance Planificado (%)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntos de Atención
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Fin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay datos disponibles.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((avance, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {formatearFechaUTC(avance.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {avance.avance_real}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {avance.avance_planificado}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {avance.puntos_atencion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {formatearFechaUTC(avance.fecha_inicio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {formatearFechaUTC(avance.fecha_fin)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(avancesFisicos.length / rowsPerPage)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">
                  {avancesFisicos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
                </span>{" "}
                a <span className="font-medium">{Math.min(currentPage * rowsPerPage, avancesFisicos.length)}</span> de{" "}
                <span className="font-medium">{avancesFisicos.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(avancesFisicos.length / rowsPerPage)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
      </div>
    </div>
  )
}

export default GestionAvanceFisicos

