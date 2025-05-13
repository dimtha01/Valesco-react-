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
            <h3 className="font-bold text-2xl mb-6">Actualizar Proveedor</h3>

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

              <div className="mt-8 flex justify-center space-x-4">
                <button
                  type="button"
                  className="btn btn-secondary px-8 py-3 text-lg rounded-md"
                  onClick={handleCambiarEstatus}
                  disabled={!formData.id}
                >
                  Actualizar Estatus
                </button>
                <button type="submit" className="btn btn-primary px-8 py-3 text-lg rounded-md" disabled={!formData.id}>
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
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nombre Comercial
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            RIF
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            País
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Teléfono
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estatus
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
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
                              <td className="py-4 px-4 text-sm text-gray-900">{proveedor.id}</td>
                              <td className="py-4 px-4 text-sm text-gray-900">{proveedor.nombre_comercial}</td>
                              <td className="py-4 px-4 text-sm text-gray-900">{proveedor.RIF || proveedor.rif}</td>
                              <td className="py-4 px-4 text-sm text-gray-900">{proveedor.pais}</td>
                              <td className="py-4 px-4 text-sm text-gray-900">{proveedor.telefono}</td>
                              <td className="py-4 px-4 text-sm text-gray-900">{proveedor.email}</td>
                              <td className="py-4 px-4 text-sm text-gray-900">
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
                              <td className="py-4 px-4 text-sm text-gray-900">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation() // Evitar que se abra el modal
                                    handleSelectProveedor(proveedor)
                                  }}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  Seleccionar
                                </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-2xl">Detalles del Proveedor</h3>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información General */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-700 mb-3">Información General</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID</p>
                      <p className="text-base">{proveedorSeleccionado.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nombre Comercial</p>
                      <p className="text-base">{proveedorSeleccionado.nombre_comercial}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">RIF</p>
                      <p className="text-base">{proveedorSeleccionado.RIF}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Estatus</p>
                      <p className="flex items-center">
                        <span
                          className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full mr-2"
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
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-700 mb-3">Información de Contacto</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dirección Fiscal</p>
                      <p className="text-base">{proveedorSeleccionado.direccion_fiscal}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">País</p>
                      <p className="text-base">{proveedorSeleccionado.pais}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Teléfono</p>
                      <p className="text-base">{proveedorSeleccionado.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base">{proveedorSeleccionado.email}</p>
                    </div>
                  </div>
                </div>

                {/* Fechas */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-700 mb-3">Fechas</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Creación</p>
                      <p className="text-base">{formatDate(proveedorSeleccionado.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Última Actualización</p>
                      <p className="text-base">{formatDate(proveedorSeleccionado.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-8 space-x-4">
                <button onClick={handleCloseModal} className="btn btn-outline px-8 py-2 rounded-md">
                  Cerrar
                </button>
                <button onClick={handleSelectFromModal} className="btn btn-primary px-8 py-2 rounded-md">
                  Seleccionar para Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ActualizarProveedor
