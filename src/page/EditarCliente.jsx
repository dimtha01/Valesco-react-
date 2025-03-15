"use client"

import { useState, useEffect, useCallback } from "react"
import showNotification, { UrlApi } from "../utils/utils"
import { Link } from "react-router-dom"

const EditarCliente = () => {
  const [clientes, setClientes] = useState([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterText, setFilterText] = useState("")
  const rowsPerPage = 5

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    unidad_negocio: "",
    razon_social: "",
    nombre_comercial: "",
    region: "",
  })

  // Función para cargar los clientes
  const fetchClientes = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${UrlApi}/api/clientes`)
      if (!response.ok) {
        throw new Error("Error al cargar los clientes")
      }
      const data = await response.json()
      setClientes(data)
    } catch (error) {
      console.error("Error al cargar los clientes:", error)
      showNotification("error", "Error", "Ocurrió un problema al cargar los clientes. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClientes()
  }, [fetchClientes])

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(filteredClientes.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Modificar la función de filtrado para excluir clientes de Centro
  // Filtrar clientes por texto y excluir región Centro
  const filteredClientes = clientes.filter(
    (cliente) =>
      cliente.region !== "Centro" &&
      (filterText === "" ||
        cliente.nombre?.toLowerCase().includes(filterText.toLowerCase()) ||
        cliente.email?.toLowerCase().includes(filterText.toLowerCase()) ||
        cliente.region?.toLowerCase().includes(filterText.toLowerCase())),
  )

  // Datos paginados
  const paginatedData = filteredClientes.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(filteredClientes.length / rowsPerPage)

  // Función para abrir el modal de edición
  const handleEditarCliente = (cliente) => {
    setClienteSeleccionado(cliente)
    setFormData({
      nombre: cliente.nombre || "",
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
      unidad_negocio: cliente.unidad_negocio || "",
      razon_social: cliente.razon_social || "",
      nombre_comercial: cliente.nombre_comercial || "",
      region: cliente.region || "",
    })
    setMostrarModal(true)
  }

  // Función para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Función para actualizar el cliente
  const handleActualizarCliente = async (e) => {
    e.preventDefault()

    // Validar campos requeridos
    if (!formData.nombre || !formData.email) {
      showNotification("warning", "Campos incompletos", "Por favor, completa al menos el nombre y el email.")
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/clientes/${clienteSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el cliente")
      }

      // Actualizar la lista de clientes
      fetchClientes()
      setMostrarModal(false)
      showNotification("success", "Éxito", "El cliente ha sido actualizado exitosamente.")
    } catch (error) {
      console.error("Error al actualizar el cliente:", error)
      showNotification("error", "Error", "Ocurrió un problema al actualizar el cliente. Por favor, inténtalo de nuevo.")
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
              Editar Cliente
            </Link>
          </li>
        </ul>
      </div>
      <div className="flex flex-col h-auto overflow-hidden p-4">

        <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar Cliente</h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre, email o región..."
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-white border border-gray-300 rounded-md py-2 px-3 w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
                <h2 className="text-xl font-semibold text-gray-800">Listado de Clientes</h2>
                <p className="text-sm text-gray-500">Gestión y edición de información de clientes</p>
              </div>

              <div className="overflow-x-auto">
                <div className="h-[500px] overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Dirección
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Unidad de Negocio
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Razón Social
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Nombre Comercial
                        </th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Región
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
                            No hay clientes disponibles.
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((cliente) => (
                          <tr key={cliente.id} className="hover:bg-gray-50">
                            <td className="py-4 px-4 text-sm text-gray-900">{cliente.nombre}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{cliente.email}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">{cliente.telefono}</td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">{cliente.direccion}</td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                              {cliente.unidad_negocio}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                              {cliente.razon_social}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 hidden md:table-cell">
                              {cliente.nombre_comercial}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${cliente.region === "Centro"
                                  ? "bg-blue-100 text-blue-800"
                                  : cliente.region === "Occidente"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {cliente.region}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-center">
                              <button
                                onClick={() => handleEditarCliente(cliente)}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition-colors"
                              >
                                Editar
                              </button>
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
                  Mostrando {filteredClientes.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                  {Math.min(currentPage * rowsPerPage, filteredClientes.length)} de {filteredClientes.length} resultados
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

        {/* Modal para editar cliente */}
        {mostrarModal && clienteSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
              <h2 className="text-xl font-bold mb-4">Editar Cliente</h2>

              <form onSubmit={handleActualizarCliente} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Dirección */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Unidad de Negocio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Negocio</label>
                    <input
                      type="text"
                      name="unidad_negocio"
                      value={formData.unidad_negocio}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Razón Social */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                    <input
                      type="text"
                      name="razon_social"
                      value={formData.razon_social}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Nombre Comercial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                    <input
                      type="text"
                      name="nombre_comercial"
                      value={formData.nombre_comercial}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Región */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar Región</option>
                      <option value="Occidente">Occidente</option>
                      <option value="Oriente">Oriente</option>
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

export default EditarCliente

