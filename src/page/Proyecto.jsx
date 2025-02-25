"use client"

import { useState, useEffect, useContext, useCallback } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UrlApi } from "../utils/utils"
import { AuthContext } from "../components/AuthContext"

const Proyecto = () => {
  const [proyectos, setProyectos] = useState([])
  const [filteredProyectos, setFilteredProyectos] = useState([])
  const [regions, setRegions] = useState([])
  const { region } = useContext(AuthContext) // Get region from AuthContext
  const rowsPerPage = 7
  const [currentPage, setCurrentPage] = useState(1)

  const navigate = useNavigate()

  const filterProyectosByRegion = useCallback(
    (data) => {
      if (!region || region === "all") {
        setFilteredProyectos(data)
      } else {
        const filtered = data.filter((proyecto) => proyecto.nombre_region === region)
        setFilteredProyectos(filtered)
      }
      setCurrentPage(1)
    },
    [region],
  )

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const response = await fetch(`${UrlApi}/api/proyectos`)
        const data = await response.json()
        setProyectos(data)

        // Extract unique regions
        const uniqueRegions = [...new Set(data.map((proyecto) => proyecto.nombre_region))]
        setRegions(uniqueRegions)

        // Filter projects based on user's region from context
        filterProyectosByRegion(data)
      } catch (error) {
        console.error("Error al cargar los proyectos:", error)
      }
    }

    fetchProyectos()
  }, [filterProyectosByRegion]) // Removed region as dependency and added filterProyectosByRegion

  // Update filter when projects or region changes
  useEffect(() => {
    filterProyectosByRegion(proyectos)
  }, [region, proyectos, filterProyectosByRegion])

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredProyectos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  const handleRowClick = (id, nombre) => {
    navigate(`/InicioPlanificador/Proyecto/ActualizarProyecto/${nombre}/${id}`)
  }

  const paginatedData = filteredProyectos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <>
      <div className="breadcrumbs text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul>
          <li>
            <Link to="/InicioPlanificador" className="flex items-center hover:text-blue-500">
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
            <Link to="/InicioPlanificador/Proyecto" className="flex items-center hover:text-blue-500">
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
              Actualización de Proyecto
            </Link>
          </li>
        </ul>
      </div>

      {/* Región actual */}
      <div className="mb-4 mx-20 mt-4">
        <span className="text-gray-700 font-medium">
          Región actual: {region === "all" ? "Todas las Regiones" : region || "Todas las Regiones"}
        </span>
      </div>

      {/* Tabla */}
      <div className="text-[#141313] xl:mx-20 mt-4">
        {/* Contenedor principal */}
        <div className="min-h-[500px] flex flex-col justify-between border rounded-lg">
          {/* Contenedor de la tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Encabezado */}
              <thead className="bg-gray-50 sticky top-0">
                <tr>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                    Nombre Proyecto
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                    Región
                  </th>
                 
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                    Avance Real
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
                      className="cursor-pointer hover:bg-gray-100 transition duration-200"
                    >

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {proyecto.numero}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {proyecto.nombre_proyecto}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                        {proyecto.nombre_region}
                      </td>
                     
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                        {proyecto.avance_real_maximo || 0}%
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginador al final del contenedor padre */}
          <div className="flex justify-center mt-4 pb-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-l-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-gray-200 text-gray-700">
              {currentPage} / {Math.ceil(filteredProyectos.length / rowsPerPage)}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredProyectos.length / rowsPerPage)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Proyecto

