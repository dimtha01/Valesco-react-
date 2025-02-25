"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import * as XLSX from "xlsx" // Importar la biblioteca xlsx
import showNotification, { formatearFechaUTC, UrlApi } from "../utils/utils"
import LoadingBar from "./LoadingBar"

const GestionAvanceFinacieros = () => {
  const params = useParams()
  const [avancesFinancieros, setAvancesFinancieros] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5 // Máximo de filas por página

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(avancesFinancieros.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Datos paginados
  const paginatedData =
    avancesFinancieros && avancesFinancieros.length > 0
      ? avancesFinancieros.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      : []

  // Función para cargar los avances financieros
  const fetchAvancesFinancieros = useCallback(async () => {
    try {
      const response = await fetch(`${UrlApi}/api/avanceFinanciero/${params.id}`)

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json() // Obtener el cuerpo de la respuesta de error
        throw new Error(errorData.message || "Error al cargar los avances financieros")
      }

      const data = await response.json()

      // Verificar si la API devuelve un array vacío
      if (Array.isArray(data) && data.length === 0) {
        showNotification("info", "Sin datos", "No se encontraron avances financieros para este proyecto.")
        setAvancesFinancieros([]) // Asegurarse de limpiar los avances financieros
      } else {
        // Actualizar el estado con los datos obtenidos
        setAvancesFinancieros(data)
      }
    } catch (error) {
      console.error("Error al cargar los avances financieros:", error)
      showNotification(
        "error",
        "Error",
        error.message || "Ocurrió un problema al cargar los avances financieros. Por favor, inténtalo de nuevo.",
      )
      setAvancesFinancieros([]) // Asegurarse de limpiar los avances financieros en caso de error
    } finally {
      // Asegurarse de que isLoading se establezca en false incluso si hay un error
      setIsLoading(false)
    }
  }, [params.id])

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    fetchAvancesFinancieros()
  }, [fetchAvancesFinancieros])

  // Función para exportar la tabla como XLSX
  const exportToXLSX = () => {
    // Verificar si hay datos para exportar
    if (avancesFinancieros.length === 0) {
      showNotification("warning", "Sin datos", "No hay datos disponibles para exportar.")
      return
    }

    // Preparar los datos para la exportación
    const worksheetData = [
      ["Fecha", "N° Valuación", "Monto (USD)", "Fecha Inicio", "Fecha Fin", "Número de Factura", "Estatus"], // Encabezados
      ...avancesFinancieros.map((avance) => [
        formatearFechaUTC(avance.fecha),
        avance.numero_valuacion,
        avance.monto_usd,
        formatearFechaUTC(avance.fecha_inicio),
        formatearFechaUTC(avance.fecha_fin),
        avance.numero_factura || "No hay factura",
        avance.estatus_proceso_nombre,
      ]),
    ]

    // Crear una hoja de trabajo
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Avances Financieros")

    // Exportar el archivo XLSX
    XLSX.writeFile(workbook, "avances_financieros.xlsx")

    showNotification("success", "Éxito", "Los datos han sido exportados exitosamente.")
  }

  return (
    <div className="text-[#141313] xl:mx-20 mt-2">
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Registro de Avances Financieros</h2>
            <button
              onClick={exportToXLSX}
              disabled={isLoading || avancesFinancieros.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Exportar a XLSX
            </button>
          </div>

          <div className="overflow-x-auto min-h-[310px]">
            {isLoading ? (
              <LoadingBar />
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Valuación
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto (USD)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Inicio
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Fin
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Número de Factura
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estatus
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-gray-500">
                        {isLoading ? "Cargando datos..." : "No hay datos disponibles."}
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((avance) => (
                      <tr key={avance.id} className="hover:bg-gray-100 transition duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center hidden md:table-cell">
                          {formatearFechaUTC(avance.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {avance.numero_valuacion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          ${avance.monto_usd}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatearFechaUTC(avance.fecha_inicio)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {formatearFechaUTC(avance.fecha_fin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center hidden md:table-cell">
                          {avance.numero_factura || "No hay factura"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                          {avance.estatus_proceso_nombre}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(avancesFinancieros.length / rowsPerPage)}
              className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">
                  {avancesFinancieros.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
                </span>{" "}
                a <span className="font-medium">{Math.min(currentPage * rowsPerPage, avancesFinancieros.length)}</span>{" "}
                de <span className="font-medium">{avancesFinancieros.length}</span> resultados
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
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(avancesFinancieros.length / rowsPerPage)}
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
      </div>
    </div>
  )
}

export default GestionAvanceFinacieros

