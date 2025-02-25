"use client"

import { useEffect, useState, useContext, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import * as XLSX from "xlsx" // Importar la biblioteca xlsx
import { UrlApi } from "../utils/utils"
import LoadingBar from "../components/LoadingBar"
import { AuthContext } from "../components/AuthContext"

const Gestion = () => {
  const [proyectos, setProyectos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 8 // Tamaño de página fijo de 10
  const navigate = useNavigate()
  const { region } = useContext(AuthContext) // Obtener región del contexto si es necesario

  // Función para cargar los proyectos desde la API
  const fetchProyectos = useCallback(async () => {
    try {
      const response = await fetch(`${UrlApi}/api/proyectos`)
      if (!response.ok) {
        throw new Error("Error al cargar los proyectos")
      }
      const data = await response.json()

      // Filtrar por región si es necesario
      const filteredData =
        region && region !== "all" ? data.filter((proyecto) => proyecto.nombre_region === region) : data

      setProyectos(filteredData)
    } catch (error) {
      console.error("Error al cargar los proyectos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [region])

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

  // Calcular los datos paginados
  const paginatedData = proyectos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Función para exportar la tabla como XLSX
  const exportToXLSX = () => {
    const worksheetData = [
      ["Número", "Nombre Proyecto", "Región", "Monto Ofertado", "Avance Real Máximo", "Avance Planificado Máximo"], // Encabezados
      ...proyectos.map((proyecto) => [
        proyecto.numero,
        proyecto.nombre_proyecto,
        proyecto.nombre_region,
        proyecto.monto_ofertado,
        `${proyecto.avance_real_maximo || 0}%`, // Agregar el símbolo %
        `${proyecto.avance_planificado_maximo || 0}%`, // Agregar el símbolo %
      ]),
    ]

    // Crear una hoja de trabajo
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proyectos")

    // Exportar el archivo XLSX
    XLSX.writeFile(workbook, "proyectos.xlsx")
  }

  useEffect(() => {
    fetchProyectos()
  }, [fetchProyectos]) // Añadir region como dependencia si es necesario

  return (
    <>
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden mx-4">
        {/* Botones de exportar */}
        <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-700">Registro de Proyectos</h2>
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
                    Región
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Monto Ofertado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Avance Real Máximo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Avance Planificado Máximo
                  </th>
                </tr>
              </thead>
              {/* Cuerpo */}
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
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
                        {proyecto.nombre_region}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell text-center">
                        ${proyecto.monto_ofertado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell text-center">
                        {proyecto.avance_real_maximo || 0}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell text-center">
                        {proyecto.avance_planificado_maximo || 0}%
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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
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

