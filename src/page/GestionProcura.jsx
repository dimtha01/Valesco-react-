"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { UrlApi } from "../utils/utils"
import ModalNuevoProveedor from "../components/ModalNuevoProveedor"

const GestionProcura = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    tipo: "",
    id_proyecto: "",
    numero_requisicion: "",
    id_proveedor: "",
    fecha_elaboracion: "",
    monto_total: "",
    numero_renglones: "",
    monto_anticipo: "",
    nro_odc: "", // Nuevo campo para número de orden de compra
  })

  const [proyectos, setProyectos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [modalVisible, setModalVisible] = useState(false)

  // Estado para las requisiciones
  const [requisiciones, setRequisiciones] = useState([])
  const [loadingRequisiciones, setLoadingRequisiciones] = useState(false)

  // Estados para paginación de requisiciones
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 6
  const [totalPages, setTotalPages] = useState(1)

  // Estado para controlar si estamos editando una requisición existente
  const [editingRequisicion, setEditingRequisicion] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  // Estado para el modal de detalles
  const [modalDetallesVisible, setModalDetallesVisible] = useState(false)
  const [requisicionSeleccionada, setRequisicionSeleccionada] = useState(null)

  // Cargar datos iniciales cuando el componente se monta
  useEffect(() => {
    // Fetch projects
    fetchProyectos()

    // Fetch all providers
    fetchProveedores()

    // Fetch requisiciones
    fetchRequisiciones()
  }, [])

  const fetchProyectos = async () => {
    try {
      const response = await fetch(`${UrlApi}/api/proyectos/all`)
      if (response.ok) {
        const data = await response.json()
        setProyectos(data.proyectos)

        // Mostrar alerta de información si no hay datos
        if (data.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin proyectos",
            text: "No hay proyectos disponibles en este momento.",
            timer: 3000,
            timerProgressBar: true,
          })
        }
      }
    } catch (error) {
      console.error("Error al cargar proyectos:", error)
    }
  }

  // Modificar la función fetchProveedores para mostrar una alerta de información en lugar de error cuando no hay datos
  const fetchProveedores = async () => {
    try {
      const response = await fetch(`${UrlApi}/api/proveedores`)
      if (response.ok) {
        const data = await response.json()
        setProveedores(data)

        // Mostrar alerta de información si no hay datos
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error)
    }
  }

  // Modificar la función fetchRequisiciones para mostrar una alerta de información en lugar de error cuando no hay datos
  const fetchRequisiciones = async () => {
    setLoadingRequisiciones(true)
    try {
      const response = await fetch(`${UrlApi}/api/requisiciones`)
      if (response.ok) {
        const data = await response.json()
        setRequisiciones(data)
        setTotalPages(Math.ceil(data.length / rowsPerPage))

        // Mostrar alerta de información si no hay datos
        if (data.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin requisiciones",
            text: "No hay requisiciones disponibles en este momento.",
            timer: 3000,
            timerProgressBar: true,
          })
        }
      } else {
        throw new Error("Error al cargar requisiciones")
      }
    } catch (error) {
      console.error("Error al cargar requisiciones:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las requisiciones. Por favor, intente nuevamente.",
      })
    } finally {
      setLoadingRequisiciones(false)
    }
  }

  // Función básica para manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleTipoChange = (tipo) => {
    setFormData((prevState) => ({
      ...prevState,
      tipo,
    }))
  }

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (error) {
      return dateString
    }
  }

  // Función para formatear montos
  const formatMonto = (monto) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(monto || 0)
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
    return requisiciones.slice(startIndex, endIndex)
  }

  // Función para abrir el modal con los detalles de la requisición
  const handleOpenModal = (requisicion) => {
    setRequisicionSeleccionada(requisicion)
    setModalDetallesVisible(true)
  }

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalDetallesVisible(false)
    setRequisicionSeleccionada(null)
  }

  // Modificar la función handleSelectRequisicion para asegurar que los IDs se manejen correctamente y se añadan logs de depuración:
  const handleSelectRequisicion = (requisicion) => {
    // Convertir el tipo de requisición a formato para el formulario
    const tipo = requisicion.tipo_requisition === "producto" ? "producto" : "servicio"

    // Formatear la fecha para el input date
    let fechaFormateada = requisicion.fecha_elaboracion
    if (fechaFormateada) {
      try {
        const fecha = new Date(fechaFormateada)
        fechaFormateada = fecha.toISOString().split("T")[0]
      } catch (error) {
        console.error("Error al formatear la fecha:", error)
      }
    }

    // Asegurarse de que los IDs sean strings y existan
    const proyectoId = requisicion.id_proyecto
    const proveedorId = requisicion.id_proveedores

    console.log("Proyecto ID:", proyectoId)
    console.log("Proveedor ID:", proveedorId)
    console.log("Requisición completa:", requisicion)

    // Llenar el formulario con los datos de la requisición seleccionada
    setFormData({
      tipo: tipo,
      id_proyecto: requisicion.id_proyecto,
      numero_requisicion: requisicion.nro_requisicion || "",
      id_proveedor: requisicion.id_proveedores,
      fecha_elaboracion: fechaFormateada,
      monto_total: requisicion.monto_total?.toString() || "",
      numero_renglones: requisicion.nro_renglones?.toString() || "",
      monto_anticipo: requisicion.monto_anticipo?.toString() || "",
      nro_odc: requisicion.nro_odc || "",
    })
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
    // Guardar el ID de la requisición que estamos editando
    setEditingRequisicion(requisicion.id)
    setIsEditing(true)

    // Desplazar la página hacia arriba para mostrar el formulario


    // Mostrar mensaje informativo



  }

  // Modificar también la función handleSelectFromModal para asegurar la misma funcionalidad
  const handleSelectFromModal = () => {
    if (requisicionSeleccionada) {
      handleSelectRequisicion(requisicionSeleccionada)
      handleCloseModal()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const requiredFields = [
      "tipo",
      "id_proyecto",
      "numero_requisicion",
      "id_proveedor",
      "fecha_elaboracion",
      "monto_total",
      "numero_renglones",
    ]
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
      // Convertir tipo a id_tipo (ejemplo: "producto" -> 1, "servicio" -> 2)
      const id_tipo = formData.tipo === "producto" ? 1 : 2

      // Preparar los datos para enviar
      const requisicionData = {
        id_tipo: id_tipo,
        id_proyecto: Number.parseInt(formData.id_proyecto),
        nro_requisicion: formData.numero_requisicion,
        id_proveedores: Number.parseInt(formData.id_proveedor),
        fecha_elaboracion: formData.fecha_elaboracion,
        monto_total: Number.parseFloat(formData.monto_total),
        nro_renglones: Number.parseInt(formData.numero_renglones),
        monto_anticipo: Number.parseFloat(formData.monto_anticipo || 0),
        nro_odc: formData.nro_odc || null,
      }

      let response

      // Si estamos editando, hacer un PUT, si no, hacer un POST
      if (isEditing && editingRequisicion) {
        response = await fetch(`${UrlApi}/api/requisiciones/${editingRequisicion}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requisicionData),
        })
      } else {
        response = await fetch(`${UrlApi}/api/requisiciones`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requisicionData),
        })
      }

      const data = await response.json()

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: isEditing ? "Requisición actualizada" : "Requisición creada",
          text: isEditing
            ? "La requisición ha sido actualizada exitosamente."
            : "La requisición ha sido creada exitosamente.",
          showConfirmButton: false,
          timer: 1500,
        })

        // Recargar las requisiciones para mostrar los cambios
        fetchRequisiciones()

        // Limpiar el formulario y resetear el estado de edición
        setFormData({
          tipo: "",
          id_proyecto: "",
          numero_requisicion: "",
          id_proveedor: "",
          fecha_elaboracion: "",
          monto_total: "",
          numero_renglones: "",
          monto_anticipo: "",
          nro_odc: "",
        })
        setIsEditing(false)
        setEditingRequisicion(null)
      } else {
        throw new Error(data.message || `Error al ${isEditing ? "actualizar" : "crear"} la requisición`)
      }
    } catch (error) {
      console.error(`Error al ${isEditing ? "actualizar" : "crear"} la requisición:`, error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          `Ocurrió un error inesperado al intentar ${isEditing ? "actualizar" : "crear"} la requisición.`,
      })
    }
  }

  const handleProveedorCreado = (nuevoProveedor) => {
    // Actualizar la lista de proveedores
    setProveedores([...proveedores, nuevoProveedor])
    // Cerrar el modal
    setModalVisible(false)
    // Opcionalmente, seleccionar el nuevo proveedor
    setFormData({
      ...formData,
      id_proveedor: nuevoProveedor.id,
    })
  }

  const handleCancelEdit = () => {
    // Limpiar el formulario y resetear el estado de edición
    setFormData({
      tipo: "",
      id_proyecto: "",
      numero_requisicion: "",
      id_proveedor: "",
      fecha_elaboracion: "",
      monto_total: "",
      numero_renglones: "",
      monto_anticipo: "",
      nro_odc: "",
    })
    setIsEditing(false)
    setEditingRequisicion(null)
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
              Gestión Procura
            </span>
          </li>
        </ul>
      </div>
      <div className="w-full max-w-7xl mx-auto px-4 mt-6">
        {/* Estructura vertical: formulario arriba, tabla abajo */}
        <div className="flex flex-col gap-8">
          {/* Formulario de Requisición */}
          <div className="bg-white rounded-lg shadow-xl p-6 w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-2xl">
                {isEditing ? "Actualizar Orden de Compra" : "Base de Datos de Orden de Compra"}
              </h3>

              {isEditing && (
                <button onClick={handleCancelEdit} className="btn btn-outline btn-error">
                  Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Requisición */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Tipo de Orden de Compra</h4>
                <div className="flex space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="tipo"
                      className="radio radio-primary mr-2"
                      checked={formData.tipo === "producto"}
                      onChange={() => handleTipoChange("producto")}
                    />
                    <span>Producto</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="tipo"
                      className="radio radio-primary mr-2"
                      checked={formData.tipo === "servicio"}
                      onChange={() => handleTipoChange("servicio")}
                    />
                    <span>Servicio</span>
                  </label>
                </div>
              </div>

              {/* Información de la Requisición */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Información de la Orden de Compra</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Selección Proyecto */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selección Proyecto</label>
                    <select
                      name="id_proyecto"
                      className="select select-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.id_proyecto}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Lista de los Proyectos</option>
                      {proyectos.map((proyecto) => (
                        <option key={proyecto.id} value={String(proyecto.id)}>
                          {proyecto.nombre_cortos}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* N° requisición */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">N° requisición</label>
                    <input
                      type="text"
                      name="numero_requisicion"
                      placeholder="Ingrese número de requisición"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.numero_requisicion}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Selección Proveedor */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Selección Proveedor</label>
                    <div className="flex">
                      <select
                        name="id_proveedor"
                        className="select select-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.id_proveedor}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Lista de los proveedores</option>
                        {proveedores.map((proveedor) => (
                          <option key={proveedor.id} value={String(proveedor.id)}>
                            {proveedor.nombre_comercial}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="btn btn-primary ml-2 px-3 h-12 rounded-md"
                        onClick={() => setModalVisible(true)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Fecha de Elaboración */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Elaboración de la Orden de Compra
                    </label>
                    <input
                      type="date"
                      name="fecha_elaboracion"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.fecha_elaboracion}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Número de ODC */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">N° ODC</label>
                    <input
                      type="text"
                      name="nro_odc"
                      placeholder="Ingrese número de orden de compra"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.nro_odc}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Información Financiera</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Monto Total USD */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total USD (Sin IVA)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <input
                        type="text"
                        name="monto_total"
                        placeholder="0.00"
                        className="input input-bordered w-full h-12 pl-8 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.monto_total}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Monto Anticipo USD */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Anticipo USD</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <input
                        type="text"
                        name="monto_anticipo"
                        placeholder="0.00"
                        className="input input-bordered w-full h-12 pl-8 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.monto_anticipo}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* N° Renglones */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">N° Renglones</label>
                    <input
                      type="text"
                      name="numero_renglones"
                      placeholder="0"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.numero_renglones}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button type="submit" className="btn btn-primary px-16 py-3 text-lg rounded-md">
                  {isEditing ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de Requisiciones */}
          <div className="bg-white rounded-lg shadow-xl p-6 w-full">
            <h3 className="font-bold text-2xl mb-6">Listado de Orden de Compra</h3>

            {loadingRequisiciones ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div className="h-[575px] overflow-y-auto">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            N° O/C
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            N° ODC
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            N° Requisición
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Proyecto
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Proveedor
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Anticipo
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Renglones
                          </th>

                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getPaginatedData().length === 0 ? (
                          <tr>
                            <td colSpan="11" className="px-6 py-4 text-center text-sm text-gray-500">
                              No hay requisiciones disponibles
                            </td>
                          </tr>
                        ) : (
                          getPaginatedData().map((requisicion) => (
                            <tr
                              key={requisicion.id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleOpenModal(requisicion)}
                            >
                              <td className="py-4 px-4 text-sm text-gray-900">{requisicion.id}</td>
                              <td className="py-4 px-4 text-sm text-gray-900">{requisicion.nro_odc || "-"}</td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${requisicion.tipo_requisition === "producto"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                                    }`}
                                >
                                  {requisicion.tipo_requisition === "producto" ? "Producto" : "Servicio"}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">{requisicion.nro_requisicion}</td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {requisicion.nombre_corto_proyecto || "-"}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {requisicion.nombre_comercial_proveedor}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {formatDate(requisicion.fecha_elaboracion)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {formatMonto(requisicion.monto_total)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {formatMonto(requisicion.monto_anticipo)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">{requisicion.nro_renglones}</td>

                              <td className="py-4 px-4 text-sm text-gray-900">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation() // Evitar que se abra el modal
                                    handleSelectRequisicion(requisicion)
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
                {requisiciones.length > 0 && (
                  <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 mt-4">
                    <div className="text-sm text-gray-500">
                      Mostrando {requisiciones.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                      {Math.min(currentPage * rowsPerPage, requisiciones.length)} de {requisiciones.length} resultados
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

      {/* Modal para crear nuevo proveedor */}
      {modalVisible && (
        <ModalNuevoProveedor
          onClose={() => setModalVisible(false)}
          onProveedorCreado={handleProveedorCreado}
          urlApi={UrlApi}
        />
      )}

      {/* Modal de Detalles de la Requisición */}
      {modalDetallesVisible && requisicionSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-2xl">Detalles de la Orden de Compra</h3>
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
                      <p className="text-base">{requisicionSeleccionada.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tipo</p>
                      <p className="text-base">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${requisicionSeleccionada.tipo_requisition === "producto"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                            }`}
                        >
                          {requisicionSeleccionada.tipo_requisition === "producto" ? "Producto" : "Servicio"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">N° Requisición</p>
                      <p className="text-base">{requisicionSeleccionada.nro_requisicion}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">N° ODC</p>
                      <p className="text-base">{requisicionSeleccionada.nro_odc || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Proyecto y Proveedor */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-700 mb-3">Proyecto y Proveedor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Proyecto</p>
                      <p className="text-base">{requisicionSeleccionada.nombre_corto_proyecto || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Proveedor</p>
                      <p className="text-base">{requisicionSeleccionada.nombre_comercial_proveedor}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Fecha de Elaboración</p>
                      <p className="text-base">{formatDate(requisicionSeleccionada.fecha_elaboracion)}</p>
                    </div>
                  </div>
                </div>

                {/* Información Financiera */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 md:col-span-2">
                  <h4 className="text-lg font-medium text-gray-700 mb-3">Información Financiera</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Monto Total</p>
                      <p className="text-base">${formatMonto(requisicionSeleccionada.monto_total)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Monto Anticipo</p>
                      <p className="text-base">${formatMonto(requisicionSeleccionada.monto_anticipo)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">N° Renglones</p>
                      <p className="text-base">{requisicionSeleccionada.nro_renglones}</p>
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

export default GestionProcura
