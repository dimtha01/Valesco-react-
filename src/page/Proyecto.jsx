"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UrlApi } from "../utils/utils"

const Proyecto = () => {
  const [proyectos, setProyectos] = useState([])
  const [filteredProyectos, setFilteredProyectos] = useState([])
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState("all")
  const rowsPerPage = 7
  const [currentPage, setCurrentPage] = useState(1)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const response = await fetch(`${UrlApi}/api/proyectos`)
        const data = await response.json()
        setProyectos(data)
        setFilteredProyectos(data)

        // Extract unique regions
        const uniqueRegions = [...new Set(data.map((proyecto) => proyecto.nombre_region))]
        setRegions(uniqueRegions)
      } catch (error) {
        console.error("Error al cargar los proyectos:", error)
      }
    }

    fetchProyectos()
  }, [])

  useEffect(() => {
    filterProyectos()
  }, [selectedRegion]) //Fixed: Removed unnecessary dependency 'proyectos'

  const filterProyectos = () => {
    if (selectedRegion === "all") {
      setFilteredProyectos(proyectos)
    } else {
      const filtered = proyectos.filter((proyecto) => proyecto.nombre_region === selectedRegion)
      setFilteredProyectos(filtered)
    }
    setCurrentPage(1)
  }

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value)
  }

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
              Proyecto
            </Link>
          </li>
        </ul>
      </div>

      {/* Filtro de regiones */}
      <div className="mb-4 mx-20 mt-4">
        <label htmlFor="region-filter" className="mr-2 text-gray-700">
          Filtrar por Región:
        </label>
        <select
          id="region-filter"
          value={selectedRegion}
          onChange={handleRegionChange}
          className="border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Todas las Regiones</option>
          {regions.map((region, index) => (
            <option key={index} value={region}>
              {region}
            </option>
          ))}
        </select>
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
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                    ID
                  </th>
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
                    Monto Ofertado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                    Unidad Negocio
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
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-300">
                        {proyecto.id}
                      </td>
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
                        ${proyecto.monto_ofertado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                        {proyecto.unidad_negocio}
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

