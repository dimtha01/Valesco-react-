  "use client"

  import { useState, useEffect } from "react"
  import { Link } from "react-router-dom"
  import { formatMontoConSeparador, UrlApi } from "../utils/utils"
  import LoadingComponent from "../components/LoadingComponent"
  import {
    FiUsers,
    FiUserPlus,
    FiSettings,
    FiSearch,
    FiEdit3,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiUser,
    FiMail,
    FiShield,
    FiBriefcase,
  } from "react-icons/fi"
  import Swal from "sweetalert2"

  const GestionUsuariosAdministracionContratos = () => {
    const [usuarios, setUsuarios] = useState([])
    const [proyectos, setProyectos] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchText, setSearchText] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [showModalUsuario, setShowModalUsuario] = useState(false)
    const [showModalAsignacion, setShowModalAsignacion] = useState(false)
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
    const [proyectosAsignados, setProyectosAsignados] = useState([])
    const [editingUser, setEditingUser] = useState(null)

    const rowsPerPage = 8

    const [formData, setFormData] = useState({
      nombre: "",
      email: "",
      password: "",
      rol: "",
      telefono: "",
      departamento: "",
      activo: true,
    })

    const roles = [
      { value: "administrador", label: "Administrador" },
      { value: "gerente", label: "Gerente de Contratos" },
      { value: "analista", label: "Analista Financiero" },
      { value: "coordinador", label: "Coordinador de Proyectos" },
      { value: "usuario", label: "Usuario" },
    ]

    // Filtrar usuarios
    const filteredUsuarios = usuarios.filter(
      (usuario) =>
        usuario.nombre?.toLowerCase().includes(searchText.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        usuario.rol?.toLowerCase().includes(searchText.toLowerCase()),
    )

    const paginatedData = filteredUsuarios.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
    const totalPages = Math.ceil(filteredUsuarios.length / rowsPerPage)

    // Cargar datos iniciales
    useEffect(() => {
      fetchUsuarios()
      fetchProyectos()
    }, [])

    const fetchUsuarios = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${UrlApi}/api/usuarios-contratos`)
        if (!response.ok) throw new Error("Error al cargar usuarios")
        const data = await response.json()
        setUsuarios(data)
      } catch (error) {
        console.error("Error:", error)
        setError("Error al cargar los usuarios")
      } finally {
        setIsLoading(false)
      }
    }

    const fetchProyectos = async () => {
      try {
        const response = await fetch(`${UrlApi}/api/proyectos/all`)
        if (!response.ok) throw new Error("Error al cargar proyectos")
        const data = await response.json()
        setProyectos(data.proyectos || [])
      } catch (error) {
        console.error("Error:", error)
      }
    }

    const fetchProyectosUsuario = async (usuarioId) => {
      try {
        const response = await fetch(`${UrlApi}/api/usuarios-contratos/${usuarioId}/proyectos`)
        if (!response.ok) throw new Error("Error al cargar proyectos del usuario")
        const data = await response.json()
        setProyectosAsignados(data)
      } catch (error) {
        console.error("Error:", error)
      }
    }

    const handleSubmit = async (e) => {
      e.preventDefault()

      if (!formData.nombre || !formData.email || !formData.rol) {
        Swal.fire({
          icon: "error",
          title: "Campos requeridos",
          text: "Por favor, completa todos los campos obligatorios.",
        })
        return
      }

      try {
        const url = editingUser
          ? `${UrlApi}/api/usuarios-contratos/${editingUser.id}`
          : `${UrlApi}/api/usuarios-contratos`
        const method = editingUser ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        if (!response.ok) throw new Error("Error al guardar usuario")

        Swal.fire({
          icon: "success",
          title: editingUser ? "Usuario actualizado" : "Usuario creado",
          text: `El usuario ha sido ${editingUser ? "actualizado" : "creado"} exitosamente.`,
          timer: 2000,
          showConfirmButton: false,
        })

        setShowModalUsuario(false)
        setEditingUser(null)
        setFormData({
          nombre: "",
          email: "",
          password: "",
          rol: "",
          telefono: "",
          departamento: "",
          activo: true,
        })
        fetchUsuarios()
      } catch (error) {
        console.error("Error:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al guardar el usuario.",
        })
      }
    }

    const handleEdit = (usuario) => {
      setEditingUser(usuario)
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: "",
        rol: usuario.rol,
        telefono: usuario.telefono || "",
        departamento: usuario.departamento || "",
        activo: usuario.activo,
      })
      setShowModalUsuario(true)
    }

    const handleDelete = async (usuarioId) => {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      })

      if (result.isConfirmed) {
        try {
          const response = await fetch(`${UrlApi}/api/usuarios-contratos/${usuarioId}`, {
            method: "DELETE",
          })

          if (!response.ok) throw new Error("Error al eliminar usuario")

          Swal.fire({
            icon: "success",
            title: "Usuario eliminado",
            text: "El usuario ha sido eliminado exitosamente.",
            timer: 2000,
            showConfirmButton: false,
          })

          fetchUsuarios()
        } catch (error) {
          console.error("Error:", error)
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Ocurrió un error al eliminar el usuario.",
          })
        }
      }
    }

    const handleAsignarProyectos = (usuario) => {
      setUsuarioSeleccionado(usuario)
      fetchProyectosUsuario(usuario.id)
      setShowModalAsignacion(true)
    }

    const handleToggleProyecto = async (proyectoId, asignado) => {
      try {
        const url = `${UrlApi}/api/usuarios-contratos/${usuarioSeleccionado.id}/proyectos`
        const method = asignado ? "DELETE" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proyecto_id: proyectoId }),
        })

        if (!response.ok) throw new Error("Error al actualizar asignación")

        fetchProyectosUsuario(usuarioSeleccionado.id)
      } catch (error) {
        console.error("Error:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al actualizar la asignación.",
        })
      }
    }

    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage)
      }
    }

    const getRoleBadgeColor = (rol) => {
      switch (rol?.toLowerCase()) {
        case "administrador":
          return "bg-red-100 text-red-800 border-red-200"
        case "gerente":
          return "bg-blue-100 text-blue-800 border-blue-200"
        case "analista":
          return "bg-green-100 text-green-800 border-green-200"
        case "coordinador":
          return "bg-purple-100 text-purple-800 border-purple-200"
        default:
          return "bg-gray-100 text-gray-800 border-gray-200"
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Breadcrumbs */}
        <div className="breadcrumbs text-lg mx-2 mt-2 text-[#0f0f0f]">
          <ul>
            <li>
              <Link
                to="/InicioPlanificador"
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
                Sistema Gerencial
              </Link>
            </li>
            <li>
              <Link to="/InicioPlanificador/GestionUsuariosAdministracionContratos" className="flex items-center hover:text-blue-500">
                Gestión de Usuarios
              </Link>
            </li>
          </ul>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg">
                  <FiUsers className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                  <p className="text-gray-600 mt-1">Administración de usuarios y asignación de proyectos</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingUser(null)
                  setFormData({
                    nombre: "",
                    email: "",
                    password: "",
                    rol: "",
                    telefono: "",
                    departamento: "",
                    activo: true,
                  })
                  setShowModalUsuario(true)
                }}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FiUserPlus className="h-5 w-5 mr-2" />
                Nuevo Usuario
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-white/80 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200"
                placeholder="Buscar usuarios..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText && (
                <button
                  onClick={() => setSearchText("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Loading state or table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-lg">
              <LoadingComponent />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              {/* Table header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Lista de Usuarios</h2>
                    <p className="text-sm text-gray-600 mt-1">Gestión de usuarios del sistema de contratos</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {filteredUsuarios.length} usuarios
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[500px] overflow-x-auto">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                          Departamento
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <FiUsers className="h-12 w-12 text-gray-300 mb-4" />
                              <p className="text-gray-500 text-lg font-medium">No hay usuarios disponibles</p>
                              <p className="text-gray-400 text-sm mt-1">Crea un nuevo usuario para comenzar</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((usuario, index) => (
                          <tr
                            key={usuario.id}
                            className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group"
                            style={{
                              animationDelay: `${index * 50}ms`,
                              animation: "fadeInUp 0.4s ease-out forwards",
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow duration-200">
                                  {usuario.nombre?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                                  <div className="text-sm text-gray-500">{usuario.telefono || "Sin teléfono"}</div>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{usuario.email}</div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(
                                  usuario.rol,
                                )}`}
                              >
                                {usuario.rol}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900 hidden md:table-cell">
                              {usuario.departamento || "No asignado"}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${usuario.activo
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                                  }`}
                              >
                                {usuario.activo ? "Activo" : "Inactivo"}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleAsignarProyectos(usuario)}
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                  title="Asignar proyectos"
                                >
                                  <FiBriefcase className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(usuario)}
                                  className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors duration-200"
                                  title="Editar usuario"
                                >
                                  <FiEdit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(usuario.id)}
                                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                  title="Eliminar usuario"
                                >
                                  <FiTrash2 className="h-4 w-4" />
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

              {/* Pagination */}
              {filteredUsuarios.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando{" "}
                    <span className="font-medium">
                      {filteredUsuarios.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
                    </span>{" "}
                    a <span className="font-medium">{Math.min(currentPage * rowsPerPage, filteredUsuarios.length)}</span>{" "}
                    de <span className="font-medium">{filteredUsuarios.length}</span> resultados
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Anterior
                    </button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${currentPage === pageNum
                              ? "bg-blue-600 text-white shadow-sm"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                              }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal para crear/editar usuario */}
        {showModalUsuario && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <FiUserPlus className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl">{editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}</h3>
                      <p className="text-sm text-purple-100">
                        {editingUser ? "Actualiza la información del usuario" : "Completa los datos del nuevo usuario"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModalUsuario(false)}
                    className="text-white hover:text-purple-200 transition-colors duration-200 bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiUser className="inline h-4 w-4 mr-1" />
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ingrese el nombre completo"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiMail className="inline h-4 w-4 mr-1" />
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="usuario@empresa.com"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiShield className="inline h-4 w-4 mr-1" />
                        Contraseña {!editingUser && "*"}
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder={editingUser ? "Dejar vacío para mantener actual" : "Ingrese la contraseña"}
                        required={!editingUser}
                      />
                    </div>

                    {/* Rol */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiSettings className="inline h-4 w-4 mr-1" />
                        Rol *
                      </label>
                      <select
                        value={formData.rol}
                        onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        required
                      >
                        <option value="">Seleccionar rol</option>
                        {roles.map((rol) => (
                          <option key={rol.value} value={rol.value}>
                            {rol.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="+58 412 123 4567"
                      />
                    </div>

                    {/* Departamento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                      <input
                        type="text"
                        value={formData.departamento}
                        onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Ej: Administración de Contratos"
                      />
                    </div>
                  </div>

                  {/* Estado activo */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="activo"
                      checked={formData.activo}
                      onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="activo" className="text-sm font-medium text-gray-700">
                      Usuario activo
                    </label>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModalUsuario(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editingUser ? "Actualizar" : "Crear"} Usuario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para asignar proyectos */}
        {showModalAsignacion && usuarioSeleccionado && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      <FiBriefcase className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl">Asignar Proyectos</h3>
                      <p className="text-sm text-blue-100">Usuario: {usuarioSeleccionado.nombre}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModalAsignacion(false)}
                    className="text-white hover:text-blue-200 transition-colors duration-200 bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="grid grid-cols-1 gap-4">
                  {proyectos.map((proyecto) => {
                    const isAsignado = proyectosAsignados.some((p) => p.id === proyecto.id)
                    return (
                      <div
                        key={proyecto.id}
                        className={`p-4 border-2 rounded-xl transition-all duration-200 cursor-pointer ${isAsignado
                          ? "border-green-300 bg-green-50 hover:bg-green-100"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        onClick={() => handleToggleProyecto(proyecto.id, isAsignado)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${isAsignado ? "bg-green-500" : "bg-gray-300"
                                  }`}
                              >
                                {isAsignado ? (
                                  <FiCheckCircle className="h-4 w-4 text-white" />
                                ) : (
                                  <FiXCircle className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {proyecto.nombre_cortos || proyecto.nombre_corto}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Monto: ${formatMontoConSeparador(proyecto.monto_ofertado || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${isAsignado ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {isAsignado ? "Asignado" : "No asignado"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowModalAsignacion(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CSS para animaciones */}
        <style jsx>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    )
  }

  export default GestionUsuariosAdministracionContratos
