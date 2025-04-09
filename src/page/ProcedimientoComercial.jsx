"use client"

import { useState, useContext, useEffect } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../components/AuthContext"
import Swal from "sweetalert2"
import { UrlApi } from "../utils/utils"

const ProcedimientoComercial = () => {
  const { region } = useContext(AuthContext)

  // Estados para los datos
  const [datos, setDatos] = useState([])
  const [estatusOptions, setEstatusOptions] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    id_region: "",
    nombre_contrato: "",
    nombre_corto: "",
    oferta_Proveedor: "",
    monto_estimado_oferta_cerrado_sdo: "",
    monto_estimado_oferta_cliente: "",
    fecha_inicio_proceso: "",
    fecha_adjudicacion: "",
    observaciones: "",
    id_estatus_comercial: "",
  })

  // Estados para el modal de cambio de estatus
  const [mostrarModalEstatus, setMostrarModalEstatus] = useState(false)
  const [procedimientoSeleccionado, setProcedimientoSeleccionado] = useState(null)

  // Función para obtener el color según el estatus
  const getEstatusColor = (estatusId, estatusNombre) => {
    // Si tenemos el ID del estatus, usamos eso para determinar el color
    if (estatusId) {
      switch (Number(estatusId)) {
        case 1:
          return "bg-blue-100 text-blue-800" // En Proceso
        case 2:
          return "bg-yellow-100 text-yellow-800" // Pendiente
        case 3:
          return "bg-green-100 text-green-800" // Completado
        case 4:
          return "bg-purple-100 text-purple-800" // En Revisión
        case 5:
          return "bg-red-100 text-red-800" // Rechazado
        case 6:
          return "bg-indigo-100 text-indigo-800" // Aprobado
        case 7:
          return "bg-pink-100 text-pink-800" // En Espera
        case 8:
          return "bg-orange-100 text-orange-800" // Suspendido
        default:
          return "bg-gray-100 text-gray-800" // Desconocido
      }
    }

    // Si no tenemos el ID pero tenemos el nombre, usamos el nombre para determinar el color
    if (estatusNombre) {
      const nombreLower = estatusNombre.toLowerCase()
      if (nombreLower.includes("proceso")) return "bg-blue-100 text-blue-800"
      if (nombreLower.includes("pendiente")) return "bg-yellow-100 text-yellow-800"
      if (nombreLower.includes("completado") || nombreLower.includes("terminado")) return "bg-green-100 text-green-800"
      if (nombreLower.includes("revisión") || nombreLower.includes("revision")) return "bg-purple-100 text-purple-800"
      if (nombreLower.includes("rechazado")) return "bg-red-100 text-red-800"
      if (nombreLower.includes("aprobado")) return "bg-indigo-100 text-indigo-800"
      if (nombreLower.includes("espera")) return "bg-pink-100 text-pink-800"
      if (nombreLower.includes("suspendido")) return "bg-orange-100 text-orange-800"
      if (nombreLower.includes("alcance")) return "bg-teal-100 text-teal-800"
    }

    // Color por defecto
    return "bg-gray-100 text-gray-800"
  }

  // Add a function to convert region name to ID after the formData useState
  const getRegionId = (regionName) => {
    if (regionName === "Occidente") return 2
    if (regionName === "Oriente") return 3
    return null // Return null if region is not recognized
  }

  // Asegurar que la región se actualice cuando cambie el contexto
  useEffect(() => {
    if (region) {
      const regionId = getRegionId(region)
      if (regionId) {
        setFormData((prevState) => ({
          ...prevState,
          id_region: regionId,
        }))
      }
    }
  }, [region])

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 9
  const [filteredDatos, setFilteredDatos] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedData, setPaginatedData] = useState([])

  // Cargar datos iniciales
  const fetchData = async () => {
    setLoading(true)
    try {
      // Cargar estatus comerciales
      const estatusResponse = await fetch(`${UrlApi}/api/estatusComercial`)
      if (estatusResponse.ok) {
        const estatusData = await estatusResponse.json()
        setEstatusOptions(estatusData)
      } else {
        console.error("Error al cargar estatus comerciales")
      }

      // Cargar procedimientos comerciales según la región
      let procedimientosUrl = `${UrlApi}/api/procedimientosComerciales`
      if (region) {
        procedimientosUrl = `${UrlApi}/api/procedimientosComerciales/region/${region}`
      }

      const procedimientosResponse = await fetch(procedimientosUrl)
      if (procedimientosResponse.ok) {
        const procedimientosData = await procedimientosResponse.json()
        setDatos(procedimientosData)
      } else {
        console.error("Error al cargar procedimientos comerciales")
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos. Por favor, intente nuevamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Formatear montos con separador de miles
  const formatMontoConSeparador = (monto) => {
    return new Intl.NumberFormat("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(monto || 0)
  }

  // Format dates from ISO to local date string
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  // Efecto para filtrar y paginar datos
  useEffect(() => {
    setFilteredDatos(datos)
    setTotalPages(Math.ceil(datos.length / rowsPerPage))
  }, [datos])

  useEffect(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    setPaginatedData(filteredDatos.slice(startIndex, endIndex))
  }, [filteredDatos, currentPage])

  // Manejar cambio de página
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target

    // Special handling for estatus field to map to id_estatus_comercial
    if (name === "estatus") {
      setFormData({
        ...formData,
        id_estatus_comercial: value,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Verify that we have a region ID
    if (!formData.id_region) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo determinar la región del usuario. Por favor, contacte al administrador.",
      })
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/procedimientosComerciales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_region: formData.id_region,
          nombre_contrato: formData.nombre_contrato,
          nombre_corto: formData.nombre_corto,
          oferta_Proveedor: Number.parseFloat(formData.oferta_Proveedor) || 0,
          monto_estimado_oferta_cerrado_sdo: Number.parseFloat(formData.monto_estimado_oferta_cerrado_sdo) || 0,
          monto_estimado_oferta_cliente: Number.parseFloat(formData.monto_estimado_oferta_cliente) || 0,
          fecha_inicio_proceso: formData.fecha_inicio_proceso,
          fecha_adjudicacion: formData.fecha_adjudicacion || null,
          observaciones: formData.observaciones,
          id_estatus_comercial: formData.id_estatus_comercial,
        }),
      })

      if (response.ok) {
        const nuevoRegistro = await response.json()

        // Actualizar la lista de procedimientos
        // Ensure the new record has the proper structure with region name and status name
        const regionName = region
        const estatusName = estatusOptions.find((e) => e.id.toString() === formData.id_estatus_comercial)?.nombre || "-"
        const formattedNewRecord = {
          ...nuevoRegistro,
          nombreRegion: regionName,
          nombreEstatus: estatusName,
        }
        setDatos([...datos, formattedNewRecord])

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Procedimiento agregado",
          text: "El procedimiento comercial ha sido agregado exitosamente.",
          showConfirmButton: false,
          timer: 1500,
        })

        // Limpiar formulario pero mantener la región
        setFormData({
          id_region: getRegionId(region),
          nombre_contrato: "",
          nombre_corto: "",
          oferta_Proveedor: "",
          monto_estimado_oferta_cerrado_sdo: "",
          monto_estimado_oferta_cliente: "",
          fecha_inicio_proceso: "",
          fecha_adjudicacion: "",
          observaciones: "",
          id_estatus_comercial: "",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear el procedimiento comercial")
      }
    } catch (error) {
      console.error("Error al crear procedimiento:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado al intentar crear el procedimiento.",
      })
    }
  }

  // Función para recargar los datos
  const recargarDatos = async () => {
    setLoading(true)
    try {
      let procedimientosUrl = `${UrlApi}/api/procedimientosComerciales`
      if (region) {
        procedimientosUrl = `${UrlApi}/api/procedimientosComerciales/region/${region}`
      }

      const procedimientosResponse = await fetch(procedimientosUrl)
      if (procedimientosResponse.ok) {
        const procedimientosData = await procedimientosResponse.json()
        setDatos(procedimientosData)
      } else {
        throw new Error("Error al cargar procedimientos comerciales")
      }
    } catch (error) {
      console.error("Error al recargar datos:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron recargar los datos. Por favor, intente nuevamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para manejar el clic en una fila y abrir el modal de cambio de estatus
  const handleRowClick = (procedimiento) => {
    setProcedimientoSeleccionado(procedimiento)
    setMostrarModalEstatus(true)
  }

  // Función para obtener las opciones válidas de estatus según el estatus actual
  const getValidOptions = (estatusActualId) => {
    // Convertir a número si es string
    const estatusId = Number(estatusActualId)

    // Mapeo de transiciones permitidas (ajustar según las reglas de negocio)
    const transicionesPermitidas = {
      1: [2, 3, 4], // Desde "En Proceso" puede ir a "Pendiente", "Completado", etc.
      2: [1, 3], // Desde "Pendiente" puede ir a "En Proceso" o "Completado"
      3: [4], // Desde "Completado" solo puede ir a otro estado específico
      4: [1, 2, 3], // Desde otro estado puede ir a varios estados
    }

    // Si no hay transiciones definidas para este estatus, permitir todos excepto el actual
    if (!transicionesPermitidas[estatusId]) {
      return estatusOptions.filter((e) => e.id !== estatusId)
    }

    // Filtrar las opciones según las transiciones permitidas
    return estatusOptions.filter((e) => transicionesPermitidas[estatusId].includes(e.id))
  }

  // Función para cambiar el estatus de un procedimiento comercial
  const handleChangeEstado = async () => {
    if (!procedimientoSeleccionado) return

    const nuevoEstatusId = document.getElementById("nuevoEstatus").value

    if (!nuevoEstatusId) {
      Swal.fire({
        icon: "warning",
        title: "Selección requerida",
        text: "Por favor, seleccione un nuevo estatus.",
      })
      return
    }

    try {
      // Crear el objeto con solo el campo que queremos actualizar
      const datosActualizacion = {
        id_estatus_comercial: Number(nuevoEstatusId),
      }

      // Usar la API específica para actualizar el estatus comercial
      const apiUrl = `${UrlApi}/api/procedimientosComerciales/estatusComercial/${procedimientoSeleccionado.id}`

      // Realizar la solicitud PUT
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosActualizacion),
      })

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorText = await response.text()

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { message: "Error desconocido en la respuesta" }
        }

        throw new Error(errorData.message || `Error al actualizar el estatus: ${response.status}`)
      }

      // Mostrar la respuesta para depuración
      const responseData = await response.json()

      // Actualizar la lista de procedimientos
      await recargarDatos()
      setMostrarModalEstatus(false) // Cerrar el modal

      Swal.fire({
        icon: "success",
        title: "Estatus actualizado",
        text: "El estatus del procedimiento comercial ha sido actualizado exitosamente.",
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      console.error("Error al actualizar el estatus:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          "Ocurrió un problema al actualizar el estatus del procedimiento comercial. Por favor, inténtalo de nuevo.",
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, [region])

  return (
    <>
      <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul className="flex items-center space-x-2">
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
              Procedimiento Comercial
            </span>
          </li>
        </ul>
      </div>

      {/* Modificar la estructura del contenedor principal para dar más espacio */}
      <div className="w-full max-w-7xl mx-auto px-4 mt-6">
        {/* Display current region */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-700 text-lg">
            <span className="font-medium">Región actual:</span> {region || "No definida"}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            {region
              ? `Se muestran los procedimientos comerciales de la región ${region}.`
              : "Se muestran todos los procedimientos comerciales."}
          </p>
        </div>

        {/* Estructura vertical: formulario arriba, tabla abajo */}
        <div className="flex flex-col gap-8">
          {/* PRIMERO: Formulario para agregar nuevo procedimiento */}
          <div className="bg-white rounded-lg shadow-xl w-full">
            <div className="px-8 py-5 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">Agregar Nuevo Procedimiento</h2>
              <p className="text-sm text-gray-500 mt-1">
                Complete el formulario para registrar un nuevo procedimiento comercial
              </p>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Sección de información básica */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Información Básica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Región */}
                    <div className="form-control w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                      <input
                        type="text"
                        value={region || "No definida"}
                        className="input input-bordered w-full bg-gray-100 h-12 rounded-md"
                        disabled
                      />
                      {!region && (
                        <p className="text-xs text-red-500 mt-1">
                          No se ha detectado una región. Por favor, contacte al administrador.
                        </p>
                      )}
                    </div>

                    {/* Nombre del Contrato */}
                    <div className="form-control w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Contrato</label>
                      <input
                        type="text"
                        name="nombre_contrato"
                        value={formData.nombre_contrato}
                        onChange={handleChange}
                        className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Nombre Corto */}
                    <div className="form-control w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Corto</label>
                      <input
                        type="text"
                        name="nombre_corto"
                        value={formData.nombre_corto}
                        onChange={handleChange}
                        className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Estatus */}
                    <div className="form-control w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estatus</label>
                      <select
                        name="id_estatus_comercial"
                        value={formData.id_estatus_comercial}
                        onChange={handleChange}
                        className="select select-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccionar estatus</option>
                        {estatusOptions.length > 0 ? (
                          estatusOptions.map((estatus) => (
                            <option key={estatus.id} value={estatus.id}>
                              {estatus.nombre}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="">No Hay Estatus</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección de información financiera */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Información Financiera</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Oferta del Proveedor */}
                    <div className="form-control w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Oferta del Proveedor (USD)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="oferta_Proveedor"
                          value={formData.oferta_Proveedor}
                          onChange={handleChange}
                          className="input input-bordered w-full h-12 pl-8 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Monto Estimado Oferta Sobre Cerrado USD */}
                    <div className="form-control w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto Estimado Oferta Sobre Cerrado (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="monto_estimado_oferta_cerrado_sdo"
                          value={formData.monto_estimado_oferta_cerrado_sdo}
                          onChange={handleChange}
                          className="input input-bordered w-full h-12 pl-8 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Monto Estimado Oferta al Cliente */}
                    <div className="form-control w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto Estimado Oferta al Cliente (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          name="monto_estimado_oferta_cliente"
                          value={formData.monto_estimado_oferta_cliente}
                          onChange={handleChange}
                          className="input input-bordered w-full h-12 pl-8 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección de fechas */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Fechas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Fecha de Inicio del Proceso */}
                    <div className="form-control w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Inicio del Proceso
                      </label>
                      <input
                        type="date"
                        name="fecha_inicio_proceso"
                        value={formData.fecha_inicio_proceso}
                        onChange={handleChange}
                        className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Fecha de Adjudicación */}
                    <div className="form-control w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Adjudicación</label>
                      <input
                        type="date"
                        name="fecha_adjudicacion"
                        value={formData.fecha_adjudicacion}
                        onChange={handleChange}
                        className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Observaciones</h3>
                  <div className="form-control w-full">
                    <textarea
                      name="observaciones"
                      value={formData.observaciones}
                      onChange={handleChange}
                      rows="4"
                      className="textarea textarea-bordered w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ingrese observaciones adicionales aquí..."
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button type="submit" className="btn btn-primary px-16 py-3 text-lg rounded-md">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* SEGUNDO: Tabla de procedimientos con nuevo diseño */}
          <div className="bg-white rounded-lg shadow-xl w-full">
            <div className="px-8 py-5 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800">Listado de Procedimientos Comerciales</h2>
              <p className="text-sm text-gray-500 mt-1">Gestión y seguimiento de procedimientos comerciales</p>
            </div>

            <div className="overflow-x-auto">
              <div className="h-[600px] overflow-hidden">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="border-b border-gray-200">
                        <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          No.
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Región
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Contrato
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Oferta
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Inicio
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                          Estatus
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-6 text-center text-base text-gray-500">
                            No hay procedimientos comerciales disponibles.
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleRowClick(item)}
                          >
                            <td className="py-4 px-4 text-base text-gray-900">{item.id}</td>
                            <td className="py-4 px-4 text-base text-gray-900">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${!item.nombreRegion
                                  ? "bg-gray-100 text-gray-800"
                                  : item.nombreRegion === "Occidente"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {item.nombreRegion || "-"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-base text-gray-900">
                              <div className="truncate max-w-[180px]" title={item.nombre_contrato}>
                                {item.nombre_contrato}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-base text-gray-900">
                              {formatMontoConSeparador(Number.parseFloat(item.oferta_Proveedor))}
                            </td>
                            <td className="py-4 px-4 text-base text-gray-900">
                              {item.fecha_inicio_proceso
                                ? new Date(item.fecha_inicio_proceso).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="py-4 px-4 text-base text-gray-900">
                              <span
                                className={`px-3 py-1.5 inline-flex text-xs leading-4 font-medium rounded-full ${getEstatusColor(
                                  item.id_estatus_comercial,
                                  item.nombreEstatus,
                                )}`}
                              >
                                {item.nombreEstatus || "-"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Paginador */}
            <div className="px-8 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="text-base text-gray-500">
                Mostrando {filteredDatos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                {Math.min(currentPage * rowsPerPage, filteredDatos.length)} de {filteredDatos.length} resultados
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-base text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  &lt;
                </button>
                <span className="px-4 py-2 text-base text-gray-700 bg-gray-100 rounded-md">{currentPage}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 border border-gray-300 rounded-md text-base text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para cambiar estatus */}
      {mostrarModalEstatus && procedimientoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Cambiar estatus del procedimiento comercial</h2>
            <p>
              <strong>Nombre del Contrato:</strong> {procedimientoSeleccionado.nombre_contrato}
            </p>
            <p>
              <strong>Nombre Corto:</strong> {procedimientoSeleccionado.nombre_corto}
            </p>
            <p>
              <strong>Estado actual:</strong>{" "}
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstatusColor(
                  procedimientoSeleccionado.id_estatus_comercial,
                  procedimientoSeleccionado.nombreEstatus,
                )}`}
              >
                {procedimientoSeleccionado.nombreEstatus || "No definido"}
              </span>
            </p>

            <label className="block mt-4">
              <span className="font-semibold">Nuevo estatus:</span>
              <select
                id="nuevoEstatus"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                defaultValue=""
              >
                <option value="" disabled>
                  Seleccione un nuevo estatus
                </option>
                {estatusOptions
                  .filter(
                    (estatus) => estatus.id.toString() !== procedimientoSeleccionado.id_estatus_comercial?.toString(),
                  )
                  .map((estatus) => (
                    <option key={estatus.id} value={estatus.id}>
                      {estatus.nombre}
                    </option>
                  ))}
              </select>
            </label>

            <div className="flex justify-end mt-6 space-x-3">
              <button
                type="button"
                onClick={() => setMostrarModalEstatus(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                onClick={handleChangeEstado}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProcedimientoComercial
