"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import * as XLSX from "xlsx" // Importar la biblioteca xlsx
import showNotification, { formatearFechaUTC, UrlApi } from "../utils/utils"
import LoadingBar from "./LoadingBar"

const GestionCostos = () => {
  const params = useParams()
  const [costos, setCostos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(costos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }
  const paginatedData = costos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const fetchCostos = useCallback(async () => {
    try {
      const response = await fetch(`${UrlApi}/api/costos/${params.id}`)
      if (!response.ok) {
        throw new Error("Error al cargar los costos")
      }
      const data = await response.json()
      setCostos(data.costos || [])
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

  const exportToXLSX = () => {
    if (costos.length === 0) {
      showNotification("warning", "Sin datos", "No hay datos disponibles para exportar.")
      return
    }

    const worksheetData = [
      ["Registrado", "Costo (USD)", "Monto Sobrepasado", "Fecha Inicio", "Fecha Fin"], // Encabezados
      ...costos.map((costo) => [
        formatearFechaUTC(costo.fecha),
        `$${Number(costo.costo).toFixed(2)}`,
        `$${Number(costo.monto_sobrepasado).toFixed(2)}`,
        formatearFechaUTC(costo.fecha_inicio),
        formatearFechaUTC(costo.fecha_fin),
      ]),
    ]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Costos")

    XLSX.writeFile(workbook, "costos.xlsx")

    showNotification("success", "Éxito", "Los datos han sido exportados exitosamente.")
  }

  return (
    <div className="text-[#141313] xl:mx-20 mt-2">
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Registro de Costos</h2>
            <button
              onClick={exportToXLSX}
              disabled={isLoading || costos.length === 0}
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
                    Costo (USD)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Sobrepasado
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
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay datos disponibles.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((costo) => (
                    <tr key={costo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {formatearFechaUTC(costo.fecha)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        ${Number(costo.costo).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        ${Number(costo.monto_sobrepasado).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {formatearFechaUTC(costo.fecha_inicio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {formatearFechaUTC(costo.fecha_fin)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginador */}
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
              disabled={currentPage === Math.ceil(costos.length / rowsPerPage)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">{costos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> a{" "}
                <span className="font-medium">{Math.min(currentPage * rowsPerPage, costos.length)}</span> de{" "}
                <span className="font-medium">{costos.length}</span> resultados
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
                  disabled={currentPage === Math.ceil(costos.length / rowsPerPage)}
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

export default GestionCostos

