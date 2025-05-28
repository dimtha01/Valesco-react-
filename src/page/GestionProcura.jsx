"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { formatearFechaUTC, UrlApi } from "../utils/utils"
import ModalNuevoProveedor from "../components/ModalNuevoProveedor"

const GestionProcura = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    tipo: "",
    tipoGasto: "", // Nuevo campo para tipo de gasto
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
  const rowsPerPage = 8
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

  const handleTipoGastoChange = (tipoGasto) => {
    setFormData((prevState) => ({
      ...prevState,
      tipoGasto,
      // Si es gasto administrativo, limpiar el proyecto
      id_proyecto: tipoGasto === "administrativo" ? "" : prevState.id_proyecto,
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
      tipoGasto: requisicion.tipo_gasto || "",
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
      "tipoGasto",
      "numero_requisicion",
      "id_proveedor",
      "fecha_elaboracion",
      "monto_total",
      "numero_renglones",
    ]

    // Solo requerir proyecto si es gasto de proyecto
    if (formData.tipoGasto === "proyecto") {
      requiredFields.push("id_proyecto")
    }

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
        id_proyecto: formData.tipoGasto === "administrativo" ? null : Number.parseInt(formData.id_proyecto),
        nro_requisicion: formData.numero_requisicion,
        id_proveedores: Number.parseInt(formData.id_proveedor),
        fecha_elaboracion: formData.fecha_elaboracion,
        monto_total: Number.parseFloat(formData.monto_total),
        nro_renglones: Number.parseInt(formData.numero_renglones),
        monto_anticipo: Number.parseFloat(formData.monto_anticipo || 0),
        nro_odc: formData.nro_odc || null,
        tipo_gasto: formData.tipoGasto, // Agregar el tipo de gasto
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
          tipoGasto: "", // Agregar este campo
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
    fetchProveedores()
  }

  const handleCancelEdit = () => {
    // Limpiar el formulario y resetear el estado de edición
    setFormData({
      tipo: "",
      tipoGasto: "", // Agregar este campo
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

              {/* Tipo de Gasto */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Tipo de Gasto</h4>
                <div className="flex space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="tipoGasto"
                      className="radio radio-primary mr-2"
                      checked={formData.tipoGasto === "administrativo"}
                      onChange={() => handleTipoGastoChange("administrativo")}
                    />
                    <span>Gasto Administrativo</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="tipoGasto"
                      className="radio radio-primary mr-2"
                      checked={formData.tipoGasto === "proyecto"}
                      onChange={() => handleTipoGastoChange("proyecto")}
                    />
                    <span>Gasto de Proyecto</span>
                  </label>
                </div>
              </div>

              {/* Información de la Requisición */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Información de la Orden de Compra</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Selección Proyecto */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selección Proyecto
                      {formData.tipoGasto === "administrativo" && (
                        <span className="text-xs text-gray-500 ml-2">(Deshabilitado para gasto administrativo)</span>
                      )}
                    </label>
                    <select
                      name="id_proyecto"
                      className={`select select-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formData.tipoGasto === "administrativo" ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      value={formData.id_proyecto}
                      onChange={handleChange}
                      required={formData.tipoGasto === "proyecto"}
                      disabled={formData.tipoGasto === "administrativo"}
                    >
                      <option value="">
                        {formData.tipoGasto === "administrativo"
                          ? "No aplica para gasto administrativo"
                          : "Lista de los Proyectos"}
                      </option>
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
                <div className="w-full overflow-x-hidden">
                  <div className="h-[550px]">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="border-b border-gray-200">
                          {/* Columna: N° O/C */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            ID
                          </th>

                          {/* Columna: N° ODC */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            N° ODC
                          </th>

                          {/* Columna: Tipo */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            Tipo
                          </th>

                          {/* Columna: N° Requisición */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                            N° Requisición
                          </th>

                          {/* Columna: Proyecto */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                            Proyecto
                          </th>

                          {/* Columna: Proveedor */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                            Proveedor
                          </th>

                          {/* Columna: Fecha */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            Fecha
                          </th>

                          {/* Columna: Monto */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            Monto
                          </th>

                          {/* Columna: Anticipo */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            Anticipo
                          </th>

                          {/* Columna: Renglones */}
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            Renglones
                          </th>

                          {/* Columna: Acciones */}
                          {/* <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            Acciones
                          </th> */}
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
                              {/* Columna: N° O/C */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {requisicion.id}
                              </td>

                              {/* Columna: N° ODC */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {requisicion.nro_odc || "-"}
                              </td>

                              {/* Columna: Tipo */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                <span
                                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${requisicion.tipo_requisition === "producto"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-green-100 text-green-800"
                                    }`}
                                >
                                  {requisicion.tipo_requisition === "producto" ? "Producto" : "Servicio"}
                                </span>
                              </td>

                              {/* Columna: N° Requisición */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {requisicion.nro_requisicion}
                              </td>

                              {/* Columna: Proyecto */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                {requisicion.nombre_corto_proyecto || (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                    Gasto Administrativo
                                  </span>
                                )}
                              </td>

                              {/* Columna: Proveedor */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">
                                {requisicion.nombre_comercial_proveedor}
                              </td>

                              {/* Columna: Fecha */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {formatearFechaUTC(requisicion.fecha_elaboracion)}
                              </td>

                              {/* Columna: Monto */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {formatMonto(requisicion.monto_total)}
                              </td>

                              {/* Columna: Anticipo */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {formatMonto(requisicion.monto_anticipo)}
                              </td>

                              {/* Columna: Renglones */}
                              <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                {requisicion.nro_renglones}
                              </td>

                              {/* Columna: Acciones */}
                              {/* <td className="py-4 px-4 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Evitar que se abra el modal
                                    handleSelectRequisicion(requisicion);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                  Seleccionar
                                </button>
                              </td> */}
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl">Orden de Compra {requisicionSeleccionada.nro_odc}</h3>
                    <p className="text-sm text-blue-100">Detalles completos de la orden</p>
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
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-medium">Tipo</span>
                    <span
                      className={`mt-1 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${requisicionSeleccionada.tipo_requisition === "producto"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                        }`}
                    >
                      {requisicionSeleccionada.tipo_requisition === "producto" ? "Producto" : "Servicio"}
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-medium">N° Requisición</span>
                    <span className="mt-1 text-lg font-semibold text-gray-800">
                      {requisicionSeleccionada.nro_requisicion}
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-medium">Fecha</span>
                    <span className="mt-1 text-lg font-semibold text-gray-800">
                      {formatearFechaUTC(requisicionSeleccionada.fecha_elaboracion)}
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-medium">N° ODC</span>
                    <span className="mt-1 text-lg font-semibold text-gray-800">
                      {requisicionSeleccionada.nro_odc || "-"}
                    </span>
                  </div>
                </div>

                {/* Secciones principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Proyecto */}
                  <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div
                        className={`p-2 rounded-lg mr-3 ${requisicionSeleccionada.nombre_corto_proyecto ? "bg-blue-100" : "bg-orange-100"}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-6 w-6 ${requisicionSeleccionada.nombre_corto_proyecto ? "text-blue-600" : "text-orange-600"}`}
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
                      <h4 className="text-lg font-semibold text-gray-800">
                        {requisicionSeleccionada.nombre_corto_proyecto ? "Información del Proyecto" : "Tipo de Gasto"}
                      </h4>
                    </div>
                    <div
                      className={`pl-2 border-l-4 ${requisicionSeleccionada.nombre_corto_proyecto ? "border-blue-200" : "border-orange-200"}`}
                    >
                      {requisicionSeleccionada.nombre_corto_proyecto ? (
                        <>
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-500">Nombre del Proyecto</p>
                            <p className="text-base font-semibold text-gray-800">
                              {requisicionSeleccionada.nombre_corto_proyecto}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">ID del Proyecto</p>
                            <p className="text-base font-semibold text-gray-800">
                              {requisicionSeleccionada.id_proyecto}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-orange-600 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="text-base font-semibold text-orange-800">Gasto Administrativo</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Esta orden de compra no está asociada a un proyecto específico
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proveedor */}
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">Información del Proveedor</h4>
                    </div>
                    <div className="pl-2 border-l-4 border-green-200">
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-500">Nombre Comercial</p>
                        <p className="text-base font-semibold text-gray-800">
                          {requisicionSeleccionada.nombre_comercial_proveedor || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID del Proveedor</p>
                        <p className="text-base font-semibold text-gray-800">
                          {requisicionSeleccionada.id_proveedores || "No especificado"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Financiera */}
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
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Información Financiera</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 shadow-sm border border-purple-100">
                      <p className="text-sm font-medium text-gray-500 mb-1">Monto Total</p>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-purple-700">$</span>
                        <span className="text-2xl font-bold text-gray-800 ml-1">
                          {formatMonto(requisicionSeleccionada.monto_total)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Sin IVA incluido</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm border border-blue-100">
                      <p className="text-sm font-medium text-gray-500 mb-1">Monto Anticipo</p>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-blue-700">$</span>
                        <span className="text-2xl font-bold text-gray-800 ml-1">
                          {formatMonto(requisicionSeleccionada.monto_anticipo)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {requisicionSeleccionada.monto_anticipo && requisicionSeleccionada.monto_total
                          ? `${Math.round((requisicionSeleccionada.monto_anticipo / requisicionSeleccionada.monto_total) * 100)}% del total`
                          : "0% del total"}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 shadow-sm border border-indigo-100">
                      <p className="text-sm font-medium text-gray-500 mb-1">N° Renglones</p>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-indigo-700">
                          {requisicionSeleccionada.nro_renglones}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Elementos incluidos</p>
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

export default GestionProcura
