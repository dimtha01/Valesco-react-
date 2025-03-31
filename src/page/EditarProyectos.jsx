"use client"

import { useState, useEffect, useCallback, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import showNotification, { formatearFechaUTC, UrlApi } from "../utils/utils"
import { AuthContext } from "../components/AuthContext"

// Función local para formatear montos con separador de miles
const formatMontoConSeparador = (amount) => {
  if (amount === null || amount === undefined) return "0.00"

  // Formatea con el estilo en-US (comas para miles, punto para decimales) y sin símbolo de moneda
  const numericValue = Number(amount)
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true, // Esto asegura que se use el separador de miles
  }).format(numericValue)
}

const EditarProyectos = () => {
  const [proyectos, setProyectos] = useState([])
  const [filteredProyectos, setFilteredProyectos] = useState([])
  const [clientes, setClientes] = useState([])
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingClientes, setIsLoadingClientes] = useState(false)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5
  const { region } = useContext(AuthContext)
  const navigate = useNavigate()

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    numero: "",
    nombre: "",
    nombreCorto: "",
    idCliente: "",
    idResponsable: 2, // Fijo como 2
    idRegion: "",
    costoEstimado: "",
    montoOfertado: "",
    fechaInicio: "",
    fechaFinal: "",
  })

  // Agregar un nuevo estado para el filtro de región seleccionado por el usuario
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("all")
  const [searchText, setSearchText] = useState("")

  // Función para obtener el ID de la región por su nombre
  const getRegionIdByName = useCallback((regionName) => {
    if (!regionName) return null

    // Normalizar el nombre de la región (minúsculas y sin espacios extra)
    const normalizedName = regionName.toLowerCase().trim()

    if (normalizedName === "centro" || normalizedName.includes("centro")) {
      return "1"
    } else if (normalizedName === "occidente" || normalizedName.includes("occidente")) {
      return "2"
    } else if (normalizedName === "oriente" || normalizedName.includes("oriente")) {
      return "3"
    } else {
      console.warn("Región no reconocida:", regionName)
      return null
    }
  }, [])

  // Función para cargar los proyectos
  const fetchProyectos = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${UrlApi}/api/proyectos`)
      if (!response.ok) {
        throw new Error("Error al cargar los proyectos")
      }
      const data = await response.json()
      console.log("Proyectos cargados:", data)
      setProyectos(data)

      // Filtrar proyectos por región si es necesario
      filterProyectosByRegion(data)
    } catch (error) {
      console.error("Error al cargar los proyectos:", error)
      showNotification("error", "Error", "Ocurrió un problema al cargar los proyectos. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Modificar la función filterProyectosByRegion para considerar el filtro seleccionado por el usuario
  const filterProyectosByRegion = useCallback(
    (data) => {
      // Primero filtrar para excluir proyectos de la región Centro
      let filtered = data.filter((proyecto) => proyecto.nombre_region !== "Centro")

      // Aplicar filtro de región
      if (selectedRegionFilter && selectedRegionFilter !== "all") {
        filtered = filtered.filter((proyecto) => proyecto.nombre_region === selectedRegionFilter)
      } else if (region && region !== "all") {
        filtered = filtered.filter((proyecto) => proyecto.nombre_region === region)
      }

      // Aplicar filtro de búsqueda
      if (searchText) {
        const searchLower = searchText.toLowerCase()
        filtered = filtered.filter(
          (proyecto) =>
            proyecto.nombre_proyecto?.toLowerCase().includes(searchLower) ||
            proyecto.nombre_corto?.toLowerCase().includes(searchLower) ||
            proyecto.numero?.toLowerCase().includes(searchLower) ||
            // Buscar también en el nombre del cliente si está disponible
            (proyecto.nombre_cliente && proyecto.nombre_cliente.toLowerCase().includes(searchLower)),
        )
      }

      setFilteredProyectos(filtered)
      setCurrentPage(1)
    },
    [region, selectedRegionFilter, searchText],
  )

  // Función para cargar los clientes
  const fetchClientes = useCallback(async () => {
    setIsLoadingClientes(true)
    try {
      // Usar el endpoint con filtro por región si hay una región seleccionada
      const url =
        region && region !== "all"
          ? `${UrlApi}/api/clientes?region=${encodeURIComponent(region)}`
          : `${UrlApi}/api/clientes`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error al cargar los datos: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Clientes cargados:", data)
      setClientes(data || [])
    } catch (err) {
      console.error("Error al cargar clientes:", err)
      showNotification("error", "Error", "Ocurrió un error al cargar los clientes.")
      setClientes([])
    } finally {
      setIsLoadingClientes(false)
    }
  }, [region])

  // Cargar proyectos y clientes al montar el componente
  useEffect(() => {
    fetchProyectos()
    fetchClientes()
  }, [fetchProyectos, fetchClientes])

  // Función para manejar el cambio de filtro de región
  const handleRegionFilterChange = (e) => {
    setSelectedRegionFilter(e.target.value)
  }

  // Actualizar filtro cuando cambia la región o el texto de búsqueda
  useEffect(() => {
    filterProyectosByRegion(proyectos)
  }, [region, proyectos, selectedRegionFilter, searchText, filterProyectosByRegion])

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredProyectos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Datos paginados
  const paginatedData = filteredProyectos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(filteredProyectos.length / rowsPerPage)

  // Función para abrir el modal de edición
  const handleEditarProyecto = (proyecto) => {
    setProyectoSeleccionado(proyecto)

    // Formatear fechas para el input date
    const formatDate = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    }

    // Asegurarse de que el cliente esté seleccionado correctamente
    const clienteId = proyecto.id_cliente?.toString() || ""
    console.log("ID del cliente del proyecto:", clienteId)

    setFormData({
      numero: proyecto.numero || "",
      nombre: proyecto.nombre_proyecto || "",
      nombreCorto: proyecto.nombre_corto,
      idCliente: clienteId,
      idResponsable: "2", // Fijo como 2
      idRegion: getRegionIdByName(proyecto.nombre_region) || "",
      costoEstimado: proyecto.costo_estimado?.toString() || "",
      montoOfertado: proyecto.monto_ofertado?.toString() || "",
      fechaInicio: formatDate(proyecto.fecha_inicio) || "",
      fechaFinal: formatDate(proyecto.fecha_final) || "",
    })

    // Asegurarse de que los clientes estén cargados antes de abrir el modal
    if (clientes.length === 0) {
      fetchClientes().then(() => {
        setMostrarModal(true)
      })
    } else {
      setMostrarModal(true)
    }
  }

  // Función para navegar a la página de edición de avance financiero
  const handleNavigateToAvanceProyectos = (proyecto) => {
    navigate(
      `/InicioAdministrador/EditarProyectos/EditarAvanceProyectos/${encodeURIComponent(proyecto.nombre_proyecto)}/${proyecto.id}`,
    )
  }

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Función para actualizar el proyecto
  const handleActualizarProyecto = async (e) => {
    e.preventDefault()

    // Validar que todos los campos estén completos
    if (
      !formData.numero ||
      !formData.nombre ||
      !formData.idCliente ||
      !formData.costoEstimado ||
      !formData.montoOfertado ||
      !formData.fechaInicio ||
      !formData.fechaFinal
    ) {
      showNotification("warning", "Campos Incompletos", "Por favor, completa todos los campos.")
      return
    }

    // Validar que la fecha de inicio sea menor que la fecha de finalización
    if (new Date(formData.fechaInicio) >= new Date(formData.fechaFinal)) {
      showNotification("error", "Fechas Inválidas", "La fecha de inicio debe ser menor que la fecha de finalización.")
      return
    }

    // Validar que los valores numéricos sean válidos
    if (isNaN(Number.parseInt(formData.idCliente))) {
      showNotification("error", "Cliente Inválido", "El ID del cliente debe ser un número válido.")
      return
    }
    if (isNaN(Number.parseFloat(formData.costoEstimado)) || Number.parseFloat(formData.costoEstimado) <= 0) {
      showNotification("error", "Costo Estimado Inválido", "El costo estimado debe ser un número positivo.")
      return
    }
    if (isNaN(Number.parseFloat(formData.montoOfertado)) || Number.parseFloat(formData.montoOfertado) <= 0) {
      showNotification("error", "Monto Ofertado Inválido", "El monto ofertado debe ser un número positivo.")
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/proyectos/${proyectoSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero: formData.numero,
          nombre: formData.nombre,
          nombreCorto: formData.nombreCorto,
          idCliente: Number.parseInt(formData.idCliente),
          idResponsable: Number.parseInt(formData.idResponsable),
          idRegion: Number.parseInt(formData.idRegion),
          costoEstimado: Number.parseFloat(formData.costoEstimado),
          montoOfertado: Number.parseFloat(formData.montoOfertado),
          fechaInicio: formData.fechaInicio,
          fechaFinal: formData.fechaFinal,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el proyecto")
      }

      // Actualizar la lista de proyectos
      fetchProyectos()
      setMostrarModal(false)
      showNotification("success", "Éxito", "El proyecto ha sido actualizado exitosamente.")
    } catch (error) {
      console.error("Error al actualizar el proyecto:", error)
      showNotification(
        "error",
        "Error",
        error.message || "Ocurrió un problema al actualizar el proyecto. Por favor, inténtalo de nuevo.",
      )
    }
  }

  return (
    <>
      <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f] mb-4">
        <ul className="flex items-center space-x-2">
          <li>
            <Link
              to="/InicioAdministrador"
              className="flex items-center hover:text-blue-500 transition-colors duration-300"
            >
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
              Sistema administrativo
            </Link>
          </li>
          <li>
            <Link
              to="/InicioAdministrador/EditarProyectos"
              className="flex items-center hover:text-blue-500 transition-colors duration-300"
            >
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
              Editar Proyectos
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col h-auto overflow-hidden p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar Proyectos</h1>

        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, número o cliente..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value)
                  setCurrentPage(1) // Resetear a la primera página al buscar
                }}
                className="bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchText && (
                <button onClick={() => setSearchText("")} className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-4 h-4 text-gray-500 hover:text-gray-700"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 12 12M1 13 13 1"
                    />
                  </svg>
                </button>
              )}
            </div>

            <select
              value={selectedRegionFilter}
              onChange={handleRegionFilterChange}
              className="bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las regiones</option>
              <option value="Occidente">Occidente</option>
              <option value="Oriente">Oriente</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 flex items-center">
            {searchText && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full mr-2">Búsqueda: "{searchText}"</span>
            )}
            {selectedRegionFilter !== "all" ? (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Región: {selectedRegionFilter}</span>
            ) : (
              <span>Mostrando todas las regiones</span>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="ml-4 text-gray-600">Cargando datos...</p>
          </div>
        ) : (
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
                          Fecha Final
                        </th>
                        <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                            No hay proyectos disponibles.
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((proyecto) => (
                          <tr key={proyecto.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm text-gray-900">{proyecto.numero}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              <div className="truncate max-w-[200px]" title={proyecto.nombre_proyecto}>
                                {proyecto.nombre_proyecto}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              <div className="truncate max-w-[150px]" title={proyecto.nombre_cortos || "N/A"}>
                                {proyecto.nombre_cortos || "N/A"}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${proyecto.nombre_region === "Centro"
                                  ? "bg-blue-100 text-blue-800"
                                  : proyecto.nombre_region === "Occidente"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {proyecto.nombre_region}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                              {formatMontoConSeparador(proyecto.monto_ofertado)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                              {formatMontoConSeparador(proyecto.costo_estimado)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                              {formatearFechaUTC(proyecto.fecha_inicio)}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                              {formatearFechaUTC(proyecto.fecha_final)}
                            </td>
                            <td className="py-4 px-4 text-sm text-center">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleEditarProyecto(proyecto)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition-colors"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleNavigateToAvanceProyectos(proyecto)}
                                  className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded transition-colors"
                                >
                                  Editar Avance
                                </button>
                              </div>
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
                  Mostrando {filteredProyectos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                  {Math.min(currentPage * rowsPerPage, filteredProyectos.length)} de {filteredProyectos.length} resultados
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
        )}

        {/* Modal para editar proyecto */}
        {mostrarModal && proyectoSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
              <h2 className="text-xl font-bold mb-4">Editar Proyecto</h2>

              <form onSubmit={handleActualizarProyecto} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Número */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                    <input
                      type="text"
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Contrato</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Nombre Corto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Corto</label>
                    <input
                      type="text"
                      name="nombreCorto"
                      value={formData.nombreCorto}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Cliente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <select
                      name="idCliente"
                      value={formData.idCliente}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={isLoadingClientes}
                    >
                      <option value="">Seleccionar Cliente</option>
                      {clientes.map((cliente) => (
                        <option
                          key={cliente.id}
                          value={cliente.id.toString()}
                          selected={cliente.id.toString() === formData.idCliente}
                        >
                          {cliente.nombre}
                        </option>
                      ))}
                    </select>
                    {isLoadingClientes && <div className="mt-1 text-sm text-gray-500">Cargando clientes...</div>}
                    {!isLoadingClientes && formData.idCliente && (
                      <div className="mt-1 text-sm text-blue-500">
                        Cliente seleccionado:{" "}
                        {clientes.find((c) => c.id.toString() === formData.idCliente)?.nombre || "No encontrado"}
                      </div>
                    )}
                  </div>

                  {/* Costo Estimado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Costo Estimado(USD)</label>
                    <input
                      type="number"
                      name="costoEstimado"
                      value={formData.costoEstimado}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Monto Ofertado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Ofertado</label>
                    <input
                      type="number"
                      name="montoOfertado"
                      value={formData.montoOfertado}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Fecha Inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                    <input
                      type="date"
                      name="fechaInicio"
                      value={formData.fechaInicio}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Fecha Final */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Final</label>
                    <input
                      type="date"
                      name="fechaFinal"
                      value={formData.fechaFinal}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Región */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                    <select
                      name="idRegion"
                      value={formData.idRegion}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar Región</option>
                      <option value="2">Occidente</option>
                      <option value="3">Oriente</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default EditarProyectos

