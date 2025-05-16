"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { UrlApi } from "../utils/utils"

const ActualizarProveedor = () => {
  const navigate = useNavigate()

  // Estado para el formulario de actualización
  const [formData, setFormData] = useState({
    id: "",
    nombre_comercial: "",
    direccion_fiscal: "",
    pais: "",
    telefono: "",
    email: "",
    rif: "",
    estatus_id: "",
  })

  // Estado para la lista de proveedores
  const [proveedores, setProveedores] = useState([])
  const [loadingProveedores, setLoadingProveedores] = useState(false)
  const [estatusOptions, setEstatusOptions] = useState([
    { id: 1, nombre_completo: "Apto", nombre_abreviado: "APT", color: "#28a745" },
    { id: 2, nombre_completo: "No Apto", nombre_abreviado: "N-APT", color: "#dc3545" },
    { id: 3, nombre_completo: "Con Observaciones", nombre_abreviado: "OBS", color: "#ffc107" },
  ])
  const [observaciones, setObservaciones] = useState("")

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 8
  const [totalPages, setTotalPages] = useState(1)

  // Estados para el modal de detalles
  const [modalVisible, setModalVisible] = useState(false)
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null)

  // Cargar datos iniciales cuando el componente se monta
  useEffect(() => {
    fetchProveedores()
  }, [])

  const fetchProveedores = async () => {
    setLoadingProveedores(true)
    try {
      const response = await fetch(`${UrlApi}/api/proveedores`)
      if (response.ok) {
        const data = await response.json()
        setProveedores(data)
        setTotalPages(Math.ceil(data.length / rowsPerPage))

        // Mostrar alerta de información si no hay datos
        if (data.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin proveedores",
            text: "No hay proveedores disponibles en este momento.",
            timer: 3000,
            timerProgressBar: true,
          })
        }
      } else {
        throw new Error("Error al cargar proveedores")
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los proveedores. Por favor, intente nuevamente.",
      })
    } finally {
      setLoadingProveedores(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleObservacionesChange = (e) => {
    setObservaciones(e.target.value)
  }

  // Función para formatear fechas con hora
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      const formattedDate = date.toLocaleDateString()
      const formattedTime = date.toLocaleTimeString()
      return `${formattedDate} ${formattedTime}`
    } catch (error) {
      return dateString
    }
  }

  // Función para manejar el cambio de página
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Obtener los datos paginados
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return proveedores.slice(startIndex, endIndex)
  }

  const handleSelectProveedor = (proveedor) => {
    setFormData({
      id: proveedor.id,
      nombre_comercial: proveedor.nombre_comercial,
      direccion_fiscal: proveedor.direccion_fiscal,
      pais: proveedor.pais,
      telefono: proveedor.telefono,
      email: proveedor.email,
      rif: proveedor.RIF || proveedor.rif, // Usar RIF o rif según lo que esté disponible
      estatus_id: proveedor.estatus_id,
    })

    // Scroll hacia el formulario
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Función para abrir el modal con los detalles del proveedor
  const handleOpenModal = (proveedor) => {
    setProveedorSeleccionado(proveedor)
    setModalVisible(true)
  }

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalVisible(false)
    setProveedorSeleccionado(null)
  }

  // Función para seleccionar el proveedor desde el modal y cerrar el modal
  const handleSelectFromModal = () => {
    if (proveedorSeleccionado) {
      handleSelectProveedor(proveedorSeleccionado)
      handleCloseModal()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const requiredFields = ["nombre_comercial", "direccion_fiscal", "pais", "telefono", "email", "rif", "estatus_id"]
    const emptyFields = requiredFields.filter((field) => !formData[field])

    if (emptyFields.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: `Por favor, completa los siguientes campos obligatorios: ${emptyFields.join(", ")}`,
      })
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/proveedores/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre_comercial: formData.nombre_comercial,
          direccion_fiscal: formData.direccion_fiscal,
          pais: formData.pais,
          telefono: formData.telefono,
          email: formData.email,
          rif: formData.rif,
          estatus_id: Number(formData.estatus_id),
        }),
      })

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Proveedor actualizado",
          text: "El proveedor ha sido actualizado exitosamente.",
          showConfirmButton: false,
          timer: 1500,
        })

        // Si hay observaciones y el estatus es "Con Observaciones", actualizar el estatus
        if (formData.estatus_id === "3" && observaciones) {
          await fetch(`${UrlApi}/api/proveedores/${formData.id}/estatus`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              estatus_id: 3,
              observaciones: observaciones,
            }),
          })
        }

        // Recargar los proveedores para mostrar los cambios
        fetchProveedores()

        // Limpiar el formulario
        setFormData({
          id: "",
          nombre_comercial: "",
          direccion_fiscal: "",
          pais: "",
          telefono: "",
          email: "",
          rif: "",
          estatus_id: "",
        })
        setObservaciones("")
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el proveedor")
      }
    } catch (error) {
      console.error("Error al actualizar el proveedor:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado al intentar actualizar el proveedor.",
      })
    }
  }

  const handleCambiarEstatus = async () => {
    if (!formData.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe seleccionar un proveedor para cambiar su estatus.",
      })
      return
    }

    if (!formData.estatus_id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe seleccionar un estatus.",
      })
      return
    }

    // Si el estatus es "Con Observaciones" y no hay observaciones
    if (formData.estatus_id === "3" && !observaciones) {
      Swal.fire({
        icon: "error",
        title: "Observaciones requeridas",
        text: "Debe ingresar observaciones cuando el estatus es 'Con Observaciones'.",
      })
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/proveedores/${formData.id}/estatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estatus_id: Number(formData.estatus_id),
          observaciones: observaciones || "",
        }),
      })

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Estatus actualizado",
          text: "El estatus del proveedor ha sido actualizado exitosamente.",
          showConfirmButton: false,
          timer: 1500,
        })

        // Recargar los proveedores para mostrar los cambios
        fetchProveedores()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el estatus")
      }
    } catch (error) {
      console.error("Error al actualizar el estatus:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado al intentar actualizar el estatus.",
      })
    }
  }

  const handleCancelEdit = () => {
    // Limpiar el formulario
    setFormData({
      id: "",
      nombre_comercial: "",
      direccion_fiscal: "",
      pais: "",
      telefono: "",
      email: "",
      rif: "",
      estatus_id: "",
    })
    setObservaciones("")

    // Mostrar notificación
    Swal.fire({
      icon: "info",
      title: "Edición cancelada",
      text: "Se ha cancelado la edición del proveedor.",
      showConfirmButton: false,
      timer: 1500,
    })
  }

  // Obtener el nombre del estatus según el ID
  const getEstatusNombre = (id) => {
    const estatus = estatusOptions.find((est) => est.id === Number(id))
    return estatus ? estatus.nombre_completo : "Desconocido"
  }

  // Obtener el color del estatus según el ID
  const getEstatusColor = (id) => {
    const estatus = estatusOptions.find((est) => est.id === Number(id))
    return estatus ? estatus.color : "#CCCCCC"
  }

  return (
    <>
      <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul className="flex items-center space-x-2">
          <li>
            <Link to="/InicioProcura" className="flex items-center hover:text-blue-500 transition-colors duration-300">
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
              Sistema Procura
            </Link>
          </li>

          <li>
            <span className="flex items-center">
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
              Actualizar Proveedor
            </span>
          </li>
        </ul>
      </div>
      <div className="w-full max-w-7xl mx-auto px-4 mt-6">
        {/* Estructura vertical: formulario arriba, tabla abajo */}
        <div className="flex flex-col gap-8">
          {/* Formulario de Actualización de Proveedor */}
          <div className="bg-white rounded-lg shadow-xl p-6 w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl">Actualizar Proveedor</h3>

              {formData.id && (
                <button onClick={handleCancelEdit} className="btn btn-outline btn-error">
                  Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del Proveedor */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Información del Proveedor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nombre Comercial */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                    <input
                      type="text"
                      name="nombre_comercial"
                      placeholder="Ingrese nombre comercial"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.nombre_comercial}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* RIF */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">RIF</label>
                    <input
                      type="text"
                      name="rif"
                      placeholder="Formato: J-123456789"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.rif}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Dirección Fiscal */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Fiscal</label>
                    <input
                      type="text"
                      name="direccion_fiscal"
                      placeholder="Ingrese dirección fiscal"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.direccion_fiscal}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* País */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                    <input
                      type="text"
                      name="pais"
                      placeholder="Ingrese país"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.pais}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      placeholder="Ingrese teléfono"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="text"
                      name="email"
                      placeholder="Ingrese email"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Estatus del Proveedor */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Estatus del Proveedor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Selección de Estatus */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estatus</label>
                    <select
                      name="estatus_id"
                      className="select select-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.estatus_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccione un estatus</option>
                      {estatusOptions.map((estatus) => (
                        <option key={estatus.id} value={estatus.id}>
                          {estatus.nombre_completo} ({estatus.nombre_abreviado})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Observaciones (solo visible si el estatus es "Con Observaciones") */}
                  {formData.estatus_id === "3" && (
                    <div className="form-control w-full md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                      <textarea
                        name="observaciones"
                        placeholder="Ingrese observaciones"
                        className="textarea textarea-bordered w-full h-24 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={observaciones}
                        onChange={handleObservacionesChange}
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  className="btn btn-secondary px-8 py-3 text-lg rounded-md flex items-center"
                  onClick={handleCambiarEstatus}
                  disabled={!formData.id}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Actualizar Estatus
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-8 py-3 text-lg rounded-md flex items-center"
                  disabled={!formData.id}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  Actualizar Proveedor
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de Proveedores */}
          <div className="bg-white rounded-lg shadow-xl p-6 w-full">
            <h3 className="font-bold text-2xl mb-6">Listado de Proveedores</h3>

            {loadingProveedores ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div className="h-[525px] overflow-y-hidden">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="border-b border-gray-200">
                          {/* Columna: ID */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                            ID
                          </th>

                          {/* Columna: Nombre Comercial */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                            Nombre Comercial
                          </th>

                          {/* Columna: RIF */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            RIF
                          </th>

                          {/* Columna: País */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            País
                          </th>

                          {/* Columna: Teléfono */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            Teléfono
                          </th>

                          {/* Columna: Email */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                            Email
                          </th>

                          {/* Columna: Estatus */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            Estatus
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getPaginatedData().length === 0 ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                              No hay proveedores disponibles
                            </td>
                          </tr>
                        ) : (
                          getPaginatedData().map((proveedor) => (
                            <tr
                              key={proveedor.id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleOpenModal(proveedor)}
                            >
                              {/* Columna: ID */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                                {proveedor.id}
                              </td>

                              {/* Columna: Nombre Comercial */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                {proveedor.nombre_comercial}
                              </td>

                              {/* Columna: RIF */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {proveedor.RIF || proveedor.rif}
                              </td>

                              {/* Columna: País */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {proveedor.pais}
                              </td>

                              {/* Columna: Teléfono */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {proveedor.telefono}
                              </td>

                              {/* Columna: Email */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                {proveedor.email}
                              </td>

                              {/* Columna: Estatus */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                <span
                                  className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                  style={{
                                    backgroundColor: proveedor.estatus_color
                                      ? `${proveedor.estatus_color}20`
                                      : "#cccccc20",
                                    color: proveedor.estatus_color || "#666666",
                                  }}
                                >
                                  {proveedor.estatus_nombre || "Desconocido"}
                                </span>
                              </td>                            
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Paginación */}
                {proveedores.length > 0 && (
                  <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 mt-4">
                    <div className="text-sm text-gray-500">
                      Mostrando {proveedores.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                      {Math.min(currentPage * rowsPerPage, proveedores.length)} de {proveedores.length} resultados
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
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalles del Proveedor */}
      {modalVisible && proveedorSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn"
            style={{
              animation: "fadeInScale 0.3s ease-out forwards",
            }}
          >
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl">Detalles del Proveedor</h3>
                    <p className="text-sm text-blue-100">{proveedorSeleccionado.nombre_comercial}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:text-blue-200 transition-colors duration-200 bg-white bg-opacity-10 p-2 rounded-full hover:bg-opacity-20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="grid grid-cols-1 gap-6">
                {/* Resumen de información clave */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-blue-100">
                    <div className="text-blue-500 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-medium">ID</span>
                    <span className="mt-1 text-lg font-semibold text-gray-800">{proveedorSeleccionado.id}</span>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-blue-100">
                    <div className="text-blue-500 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-medium">RIF</span>
                    <span className="mt-1 text-lg font-semibold text-gray-800">
                      {proveedorSeleccionado.RIF || proveedorSeleccionado.rif}
                    </span>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-blue-100">
                    <div className="text-blue-500 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-medium">País</span>
                    <span className="mt-1 text-lg font-semibold text-gray-800">{proveedorSeleccionado.pais}</span>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-blue-100">
                    <div className="text-blue-500 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-medium">Estatus</span>
                    <span
                      className="mt-1 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      style={{
                        backgroundColor: proveedorSeleccionado.estatus_color
                          ? `${proveedorSeleccionado.estatus_color}20`
                          : "#cccccc20",
                        color: proveedorSeleccionado.estatus_color || "#666666",
                      }}
                    >
                      {proveedorSeleccionado.estatus_nombre ||
                        getEstatusNombre(proveedorSeleccionado.estatus_id) ||
                        "Desconocido"}
                    </span>
                  </div>
                </div>

                {/* Información General */}
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Información General</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="pl-2 border-l-4 border-blue-200">
                      <p className="text-sm font-medium text-gray-500">Nombre Comercial</p>
                      <p className="text-base font-semibold text-gray-800">{proveedorSeleccionado.nombre_comercial}</p>
                    </div>
                    <div className="pl-2 border-l-4 border-blue-200">
                      <p className="text-sm font-medium text-gray-500">RIF</p>
                      <p className="text-base font-semibold text-gray-800">
                        {proveedorSeleccionado.RIF || proveedorSeleccionado.rif}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Información de Contacto</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="pl-2 border-l-4 border-green-200">
                      <p className="text-sm font-medium text-gray-500">Dirección Fiscal</p>
                      <p className="text-base font-semibold text-gray-800">{proveedorSeleccionado.direccion_fiscal}</p>
                    </div>
                    <div className="pl-2 border-l-4 border-green-200">
                      <p className="text-sm font-medium text-gray-500">País</p>
                      <p className="text-base font-semibold text-gray-800">{proveedorSeleccionado.pais}</p>
                    </div>
                    <div className="pl-2 border-l-4 border-green-200">
                      <p className="text-sm font-medium text-gray-500">Teléfono</p>
                      <p className="text-base font-semibold text-gray-800">{proveedorSeleccionado.telefono}</p>
                    </div>
                    <div className="pl-2 border-l-4 border-green-200">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base font-semibold text-gray-800">{proveedorSeleccionado.email}</p>
                    </div>
                  </div>
                </div>

                {/* Fechas */}
                <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Fechas</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 shadow-sm border border-purple-100">
                      <p className="text-sm font-medium text-gray-500 mb-1">Fecha de Creación</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatDate(proveedorSeleccionado.created_at)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100">
                      <p className="text-sm font-medium text-gray-500 mb-1">Última Actualización</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatDate(proveedorSeleccionado.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con acciones */}
            <div className="bg-gray-50 p-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleCloseModal}
                  className="btn btn-outline px-6 py-2 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-950 transition-colors duration-200 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cerrar
                </button>
                <button
                  onClick={handleSelectFromModal}
                  className="btn btn-primary px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Seleccionar para Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
  @keyframes fadeInScale {
    0% {
      opacity: 0;
      transform: scale(0.95);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`}</style>
    </>
  )
}

export default ActualizarProveedor
