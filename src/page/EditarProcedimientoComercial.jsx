"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import Swal from "sweetalert2"
import { UrlApi } from "../utils/utils"

const EditarProcedimientoComercial = () => {
  // Estados para los datos
  const [datos, setDatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState("")
  const [clientes, setClientes] = useState([])
  const [loadingClientes, setLoadingClientes] = useState(false)

  // Definir regiones como constante
  const regiones = [
    { id: 2, nombre: "Occidente" },
    { id: 3, nombre: "Oriente" },
  ]

  // Estados para el modal de edición
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false)
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null)

  // Estado para el formulario de edición
  const [formDataEdicion, setFormDataEdicion] = useState({
    id_region: "",
    id_cliente: "",
    numero: "",
    nombre: "",
    nombre_corto: "",
    codigo_contrato_cliente: "",
    monto_estimado_oferta_cerrado_sdo: "",
    monto_estimado_oferta_cliente: "",
    ofertaDelProveedor: "",
    fecha_inicio: "",
    fecha_final: "",
    observaciones: "",
    id_estatus_comercial: "",
  })

  // Estados para el modal de cambio de estatus
  const [mostrarModalEstatus, setMostrarModalEstatus] = useState(false)
  const [procedimientoSeleccionado, setProcedimientoSeleccionado] = useState(null)

  // Añadir un nuevo estado para manejar los estatus disponibles
  const [estatusOptions, setEstatusOptions] = useState([])

  // Añadir un estado para el nuevo estatus seleccionado
  const [nuevoEstatus, setNuevoEstatus] = useState("")

  // Añadir estado para el checklist de monto ofertado
  const [montoOfertadoSeleccionado, setMontoOfertadoSeleccionado] = useState("")

  // Añadir estado para el costo estimado
  const [costoEstimado, setCostoEstimado] = useState("")

  // Añadir estado para el checklist de costo estimado
  const [costoEstimadoSeleccionado, setCostoEstimadoSeleccionado] = useState("")

  // Estados para filtros de la tabla
  const [filtroRegionTabla, setFiltroRegionTabla] = useState("")
  const [ocultarActaInicio, setOcultarActaInicio] = useState(false)

  // Constante para identificar el estatus de "acta de inicio" por ID
  const ESTATUS_ACTA_INICIO_ID = 8

  // Función para verificar si un estatus es "acta de inicio" por ID
  const esEstatusActaInicio = (estatusId) => {
    if (!estatusId) return false
    return Number(estatusId) === ESTATUS_ACTA_INICIO_ID
  }

  // Función para obtener el color según el estatus
  const getEstatusColor = (estatusNombre) => {
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
      if (nombreLower.includes("acta")) return "bg-emerald-100 text-emerald-800"
    }
    return "bg-gray-100 text-gray-800"
  }

  // Función para cargar los estatus comerciales
  const fetchEstatusComerciales = async () => {
    try {
      const estatusResponse = await fetch(`${UrlApi}/api/estatusComercial`)
      if (estatusResponse.ok) {
        const estatusData = await estatusResponse.json()
        setEstatusOptions(estatusData)
      } else {
        console.error("Error al cargar estatus comerciales")
      }
    } catch (error) {
      console.error("Error al cargar estatus:", error)
    }
  }

  // Función para manejar el cambio de región
  const handleRegionChange = (e) => {
    const regionId = e.target.value
    setSelectedRegion(regionId)

    if (regionId) {
      fetchClientesByRegion(regionId)
    } else {
      setClientes([])
    }
  }

  // Función para obtener el nombre de la región por ID
  const getRegionNameById = (regionId) => {
    const region = regiones.find((r) => r.id.toString() === regionId.toString())
    return region ? region.nombre : ""
  }

  // Función para cargar clientes por región
  const fetchClientesByRegion = useCallback(async (regionId) => {
    if (!regionId) return

    setLoadingClientes(true)
    try {
      const regionName = getRegionNameById(regionId)
      const url = `${UrlApi}/api/clientes?region=${encodeURIComponent(regionName)}`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Error al cargar los clientes: ${response.statusText}`)
      }

      const data = await response.json()
      setClientes(data || [])
    } catch (error) {
      console.error("Error al cargar clientes:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los clientes. Por favor, intente nuevamente.",
      })
      setClientes([])
    } finally {
      setLoadingClientes(false)
    }
  }, [])

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 7
  const [filteredDatos, setFilteredDatos] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [paginatedData, setPaginatedData] = useState([])

  // Función para cargar datos
  const fetchData = async () => {
    setLoading(true)
    try {
      await fetchEstatusComerciales()

      const proyectosUrl = `${UrlApi}/api/proyectos/requisition`
      const proyectosResponse = await fetch(proyectosUrl)
      if (proyectosResponse.ok) {
        const proyectosData = await proyectosResponse.json()
        if (proyectosData.proyectos) {
          setDatos(proyectosData.proyectos)
        } else {
          setDatos(Array.isArray(proyectosData) ? proyectosData : [])
        }
      } else {
        console.error("Error al cargar proyectos")
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

  // Función para formatear fecha para input
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    } catch (error) {
      console.error("Error formatting date for input:", error)
      return ""
    }
  }

  // Efecto para filtrar y paginar datos
  useEffect(() => {
    let datosFiltrados = Array.isArray(datos) ? datos : []

    if (filtroRegionTabla) {
      const nombreRegionFiltro = getRegionNameById(filtroRegionTabla)
      datosFiltrados = datosFiltrados.filter((item) => item.nombre_region === nombreRegionFiltro)
    }

    if (ocultarActaInicio) {
      datosFiltrados = datosFiltrados.filter((item) => item.estatus_comercial !== "Acta Inicio.")
    }

    setFilteredDatos(datosFiltrados)
    setTotalPages(Math.ceil(datosFiltrados.length / rowsPerPage))
    setCurrentPage(1)
  }, [datos, filtroRegionTabla, ocultarActaInicio])

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

  // Función para abrir modal de edición
  const handleEditarProyecto = async (proyecto) => {
    setProyectoSeleccionado(proyecto)

    // Cargar clientes de la región del proyecto
    if (proyecto.id_region) {
      await fetchClientesByRegion(proyecto.id_region)
    }

    setFormDataEdicion({
      id_region: proyecto.id_region?.toString() || "",
      id_cliente: proyecto.id_cliente?.toString() || "",
      numero: proyecto.numero || "",
      nombre: proyecto.nombre_proyecto || "",
      nombre_corto: proyecto.nombre_cortos || "",
      codigo_contrato_cliente: proyecto.codigo_contrato_cliente || "",
      monto_estimado_oferta_cerrado_sdo: proyecto.monto_estimado_oferta_cerrado_sdo || "",
      monto_estimado_oferta_cliente: proyecto.monto_estimado_oferta_cliente || "",
      oferta_del_proveedor: proyecto.oferta_del_proveedor || "",
      fecha_inicio: formatDateForInput(proyecto.fecha_inicio),
      fecha_final: formatDateForInput(proyecto.fecha_final),
      observaciones: proyecto.observaciones || "",
      id_estatus_comercial: proyecto.id_estatus_comercial?.toString() || "",
    })
    setMostrarModalEdicion(true)
  }

  // Manejar cambios en el formulario de edición
  const handleChangeEdicion = async (e) => {
    const { name, value } = e.target
    setFormDataEdicion({
      ...formDataEdicion,
      [name]: value,
    })

    // Si cambia la región, cargar clientes
    if (name === "id_region" && value) {
      await fetchClientesByRegion(value)
    }
  }

  // Función para actualizar proyecto
  const handleActualizarProyecto = async (e) => {
    e.preventDefault()

    if (!formDataEdicion.id_region || !formDataEdicion.id_cliente) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe seleccionar una región y un cliente.",
      })
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/proyectos/${proyectoSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero: formDataEdicion.numero,
          nombre: formDataEdicion.nombre,
          nombre_cortos: formDataEdicion.nombre_corto,
          id_cliente: Number.parseInt(formDataEdicion.id_cliente),
          id_region: Number.parseInt(formDataEdicion.id_region),
          codigo_contrato_cliente: formDataEdicion.codigo_contrato_cliente,
          monto_estimado_oferta_cliente: Number.parseFloat(formDataEdicion.monto_estimado_oferta_cliente) || 0,
          monto_estimado_oferta_cerrado_sdo: Number.parseFloat(formDataEdicion.monto_estimado_oferta_cerrado_sdo) || 0,
          costo_estimado: Number.parseFloat(formDataEdicion.ofertaDelProveedor) || 0,
          fecha_inicio: formDataEdicion.fecha_inicio,
          fecha_final: formDataEdicion.fecha_final,
          observaciones: formDataEdicion.observaciones,
          id_estatus_comercial: formDataEdicion.id_estatus_comercial
            ? Number.parseInt(formDataEdicion.id_estatus_comercial)
            : null,
        }),
      })

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Proyecto actualizado",
          text: "El proyecto ha sido actualizado exitosamente.",
          showConfirmButton: false,
          timer: 1500,
        })

        setMostrarModalEdicion(false)
        await fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el proyecto")
      }
    } catch (error) {
      console.error("Error al actualizar proyecto:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado al intentar actualizar el proyecto.",
      })
    }
  }

  // Función para eliminar proyecto
  const handleEliminarProyecto = async (proyecto) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Deseas eliminar el proyecto "${proyecto.nombre_proyecto}"? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${UrlApi}/api/proyectos/${proyecto.id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Proyecto eliminado",
            text: "El proyecto ha sido eliminado exitosamente.",
            showConfirmButton: false,
            timer: 1500,
          })

          await fetchData()
        } else {
          throw new Error("Error al eliminar el proyecto")
        }
      } catch (error) {
        console.error("Error al eliminar proyecto:", error)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al intentar eliminar el proyecto.",
        })
      }
    }
  }

  // Función para manejar el cambio de estatus
  const handleEstatusChange = (e) => {
    const estatusId = e.target.value
    setNuevoEstatus(estatusId)

    if (esEstatusActaInicio(estatusId)) {
      setMontoOfertadoSeleccionado("")
      setCostoEstimadoSeleccionado("")
    } else {
      setMontoOfertadoSeleccionado("")
      setCostoEstimadoSeleccionado("")
    }
  }

  // Función para manejar el cambio en el checklist de monto ofertado
  const handleMontoOfertadoChange = (e) => {
    setMontoOfertadoSeleccionado(e.target.value)
  }

  // Función para manejar el cambio en el costo estimado
  const handleCostoEstimadoChange = (e) => {
    setCostoEstimadoSeleccionado(e.target.value)
  }

  // Función para actualizar el estatus del proyecto
  const actualizarEstatusProyecto = async () => {
    if (!nuevoEstatus) {
      Swal.fire({
        icon: "warning",
        title: "Selección requerida",
        text: "Por favor, seleccione un nuevo estatus.",
      })
      return
    }

    const esActaInicio = esEstatusActaInicio(nuevoEstatus)

    if (esActaInicio) {
      if (!montoOfertadoSeleccionado) {
        Swal.fire({
          icon: "warning",
          title: "Selección requerida",
          text: "Para cambiar a Acta de Inicio, debe seleccionar el monto ofertado.",
        })
        return
      }

      if (!costoEstimadoSeleccionado) {
        Swal.fire({
          icon: "warning",
          title: "Selección requerida",
          text: "Para cambiar a Acta de Inicio, debe seleccionar el costo estimado.",
        })
        return
      }
    }

    try {
      const requestBody = {
        id_estatus_comercial: nuevoEstatus,
      }

      if (esActaInicio) {
        let montoOfertado = 0
        if (montoOfertadoSeleccionado === "cerrado") {
          montoOfertado = Number.parseFloat(procedimientoSeleccionado.monto_estimado_oferta_cerrado_sdo) || 0
        } else if (montoOfertadoSeleccionado === "cliente") {
          montoOfertado = Number.parseFloat(procedimientoSeleccionado.monto_estimado_oferta_cliente) || 0
        }

        let costoEstimado = 0
        if (costoEstimadoSeleccionado === "proveedor") {
          costoEstimado = Number.parseFloat(procedimientoSeleccionado.oferta_del_proveedor) || 0
        }

        requestBody.monto_ofertado = montoOfertado
        requestBody.costo_estimado = costoEstimado
      }

      const response = await fetch(`${UrlApi}/api/proyectos/${procedimientoSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        await fetchData()

        Swal.fire({
          icon: "success",
          title: "Estatus actualizado",
          text: esActaInicio
            ? "El estatus del proyecto ha sido actualizado a Acta de Inicio y se han registrado el monto ofertado y costo estimado."
            : "El estatus del proyecto ha sido actualizado exitosamente.",
          showConfirmButton: false,
          timer: 2000,
        })

        setMostrarModalEstatus(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el estatus del proyecto")
      }
    } catch (error) {
      console.error("Error al actualizar estatus:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado al intentar actualizar el estatus.",
      })
    }
  }

  // Función para abrir modal de estatus
  const handleRowClick = (procedimiento) => {
    setProcedimientoSeleccionado(procedimiento)
    setNuevoEstatus("")
    setMontoOfertadoSeleccionado("")
    setCostoEstimadoSeleccionado("")
    setMostrarModalEstatus(true)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      {/* Fondo con gradiente sutil */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Breadcrumbs */}
        <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f]">
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
            <li   >Editar Procedimiento Comercial</li>
          </ul>
        </div>

        {/* Contenedor principal */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-2">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Editar Procedimiento Comercial</h1>
                <p className="text-gray-600 mt-1">Administra y edita todos los aspectos de los proyectos comerciales</p>
              </div>
            </div>
          </div>

          {/* Tabla de proyectos */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
              <h2 className="text-2xl font-bold text-white">Listado de Proyectos</h2>
              <p className="text-indigo-100 mt-1">Gestión completa de proyectos comerciales</p>
            </div>

            {/* Filtros */}
            <div className="px-8 py-6 bg-white border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                  {/* Filtro por región */}
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200 shadow-sm">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                        Filtrar por región
                      </label>
                      <select
                        value={filtroRegionTabla}
                        onChange={(e) => setFiltroRegionTabla(e.target.value)}
                        className="select select-bordered select-sm w-44 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm border-blue-200"
                      >
                        <option value="">Todas las regiones</option>
                        {regiones.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Checkbox para ocultar Acta Inicio */}
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 rounded-xl border border-emerald-200 shadow-sm">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-600"
                      >
                        <path d="M9 11H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h5m0-6v6m0-6V9a2 2 0 0 1 2-2h2m-2 8h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-2 8V9"></path>
                        <path d="M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"></path>
                      </svg>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="ocultarActaInicio"
                        checked={ocultarActaInicio}
                        onChange={(e) => setOcultarActaInicio(e.target.checked)}
                        className="checkbox checkbox-sm checkbox-success w-5 h-5"
                      />
                      <label
                        htmlFor="ocultarActaInicio"
                        className="text-sm font-semibold text-emerald-700 cursor-pointer"
                      >
                        Ocultar proyectos en Acta Inicio
                      </label>
                    </div>
                  </div>
                </div>

                {/* Contador de resultados */}
                <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 rounded-xl border border-purple-200 shadow-sm">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-purple-600"
                    >
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"></path>
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">{filteredDatos.length}</div>
                    <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                      {filteredDatos.length === 1 ? "Proyecto" : "Proyectos"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
                      <p className="mt-4 text-gray-600">Cargando proyectos...</p>
                    </div>
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                      <tr className="border-b border-gray-200">
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          No.
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Región
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Proyecto
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Inicio
                        </th>
                        <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Estatus
                        </th>
                        <th className="py-4 px-4 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-6 py-10 text-center text-base text-gray-500">
                            <div className="flex flex-col items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="40"
                                height="40"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-gray-400 mb-3"
                              >
                                <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"></path>
                                <path d="M10 7H9"></path>
                                <rect width="12" height="12" x="9" y="3" rx="2"></rect>
                              </svg>
                              <p className="text-lg font-medium">No hay proyectos disponibles.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((item) => (
                          <tr key={item.id} className="hover:bg-blue-50 transition-colors duration-150">
                            <td className="py-4 px-4 text-sm text-gray-900 font-medium">{item.numero}</td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${!item.nombre_region
                                  ? "bg-gray-100 text-gray-800"
                                  : item.nombre_region === "Occidente"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                  }`}
                              >
                                {item.nombre_region || "-"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              <div className="truncate max-w-[150px]" title={item.nombre_cliente || "-"}>
                                {item.nombre_cliente || "-"}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              <div className="truncate max-w-[180px]" title={item.nombre_proyecto}>
                                {item.nombre_proyecto}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{item.nombre_cortos}</div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                              USD {formatMontoConSeparador(Number.parseFloat(item.monto_ofertado))}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              {item.fecha_inicio ? formatDate(item.fecha_inicio) : "-"}
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-900">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getEstatusColor(
                                  item.estatus_comercial,
                                )}`}
                              >
                                {item.estatus_comercial || "-"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleEditarProyecto(item)}
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                  title="Editar proyecto"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                                  </svg>
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleRowClick(item)}
                                  className="inline-flex items-center px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                  title="Cambiar estatus"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                                  </svg>
                                  Estatus
                                </button>
                                <button
                                  onClick={() => handleEliminarProyecto(item)}
                                  className="inline-flex items-center px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                  title="Eliminar proyecto"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-1"
                                  >
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                  </svg>
                                  Eliminar
                                </button>
                              </div>
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
            <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex items-center justify-between">
              <div className="text-base text-gray-600 font-medium">
                Mostrando {filteredDatos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                {Math.min(currentPage * rowsPerPage, filteredDatos.length)} de {filteredDatos.length} resultados
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-base text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="m15 18-6-6 6-6"></path>
                  </svg>
                  Anterior
                </button>
                <span className="px-4 py-2 text-base text-white font-medium bg-indigo-600 rounded-md shadow-sm">
                  {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 border border-gray-300 rounded-md text-base text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors duration-200 flex items-center"
                >
                  Siguiente
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-1"
                  >
                    <path d="m9 18 6-6-6-6"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar proyecto */}
      {mostrarModalEdicion && proyectoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                    >
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Editar Proyecto</h2>
                    <p className="text-blue-100 text-sm">Modifica todos los aspectos del proyecto</p>
                  </div>
                </div>
                <button
                  onClick={() => setMostrarModalEdicion(false)}
                  className="text-white hover:text-blue-200 transition-colors duration-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
              <form onSubmit={handleActualizarProyecto} className="space-y-6">
                {/* Información básica */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600"
                      >
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Región */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Región</label>
                      <select
                        name="id_region"
                        value={formDataEdicion.id_region}
                        onChange={handleChangeEdicion}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        required
                      >
                        <option value="">Seleccionar región</option>
                        {regiones.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cliente */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                      <select
                        name="id_cliente"
                        value={formDataEdicion.id_cliente}
                        onChange={handleChangeEdicion}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        required
                        disabled={!formDataEdicion.id_region || loadingClientes}
                      >
                        <option value="">Seleccionar cliente</option>
                        {clientes.map((cliente) => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Número */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                      <input
                        type="text"
                        name="numero"
                        value={formDataEdicion.numero}
                        onChange={handleChangeEdicion}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        required
                      />
                    </div>

                    {/* Código Contrato Cliente */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código Contrato Cliente</label>
                      <input
                        type="text"
                        name="codigo_contrato_cliente"
                        value={formDataEdicion.codigo_contrato_cliente}
                        onChange={handleChangeEdicion}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                      />
                    </div>

                    {/* Nombre del Contrato */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Contrato</label>
                      <input
                        type="text"
                        name="nombre"
                        value={formDataEdicion.nombre}
                        onChange={handleChangeEdicion}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        required
                      />
                    </div>

                    {/* Nombre Corto */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Corto</label>
                      <input
                        type="text"
                        name="nombre_corto"
                        value={formDataEdicion.nombre_corto}
                        onChange={handleChangeEdicion}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Información financiera */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-green-600"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"></path>
                        <path d="M12 18v2"></path>
                        <path d="M12 6V4"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Información Financiera</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Monto Estimado Oferta Sobre Cerrado USD */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto Estimado Oferta Sobre Cerrado (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium">
                          USD
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          name="monto_estimado_oferta_cerrado_sdo"
                          value={formDataEdicion.monto_estimado_oferta_cerrado_sdo}
                          onChange={handleChangeEdicion}
                          className="w-full p-3 pl-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Costo Planificado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Costo Planificado (USD)</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium">
                          USD
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          name="ofertaDelProveedor"
                          value={formDataEdicion.ofertaDelProveedor}
                          onChange={handleChangeEdicion}
                          className="w-full p-3 pl-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                          
                        />
                      </div>
                    </div>

                    {/* Monto Estimado Oferta al Cliente */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto Estimado Oferta al Cliente (USD)
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium">
                          USD
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          name="monto_estimado_oferta_cliente"
                          value={formDataEdicion.monto_estimado_oferta_cliente}
                          onChange={handleChangeEdicion}
                          className="w-full p-3 pl-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fechas y estatus */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-600"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Fechas y Estatus</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fecha de Inicio */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
                      <input
                        type="date"
                        name="fecha_inicio"
                        value={formDataEdicion.fecha_inicio}
                        onChange={handleChangeEdicion}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
                        required
                      />
                    </div>

                    {/* Fecha Final */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Final</label>
                      <input
                        type="date"
                        name="fecha_final"
                        value={formDataEdicion.fecha_final}
                        onChange={handleChangeEdicion}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
                        required
                      />
                    </div>

                    {/* Estatus Comercial */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estatus Comercial</label>
                      <select
                        name="id_estatus_comercial"
                        value={formDataEdicion.id_estatus_comercial}
                        onChange={handleChangeEdicion}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"
                      >
                        <option value="">Seleccionar estatus</option>
                        {estatusOptions.map((estatus) => (
                          <option key={estatus.id} value={estatus.id}>
                            {estatus.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Observaciones */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-amber-600"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Observaciones</h3>
                  </div>
                  <div>
                    <textarea
                      name="observaciones"
                      value={formDataEdicion.observaciones}
                      onChange={handleChangeEdicion}
                      rows="4"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-sm"
                      placeholder="Ingrese observaciones adicionales aquí..."
                    ></textarea>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setMostrarModalEdicion(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    Actualizar Proyecto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cambio de estatus (igual al original) */}
      {mostrarModalEstatus && procedimientoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300 animate-fadeIn p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl overflow-hidden transform transition-all duration-300 animate-scaleIn">
            {/* Cabecera del modal */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-4 py-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                  </svg>
                  Cambiar Estatus del Proyecto
                </h2>
              </div>
              <button
                onClick={() => setMostrarModalEstatus(false)}
                className="text-white hover:text-indigo-200 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4 max-h-[80vh] overflow-y-auto">
              {/* Información básica en tarjetas compactas */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-600 mr-1"
                      >
                        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z"></path>
                      </svg>
                      <span className="text-sm text-blue-600 font-medium">Número:</span>
                    </div>
                    <span className="text-base font-bold text-gray-800">{procedimientoSeleccionado.numero || "-"}</span>
                  </div>
                </div>
                <div className="bg-purple-50 p-2 rounded border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-purple-600 mr-1"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span className="text-sm text-purple-600 font-medium">Región:</span>
                    </div>
                    <span className="text-base font-bold text-gray-800">
                      {procedimientoSeleccionado.nombre_region || "-"}
                    </span>
                  </div>
                </div>
                <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-emerald-600 mr-1"
                      >
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                      </svg>
                      <span className="text-sm text-emerald-600 font-medium">Estado:</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-xs leading-5 font-semibold rounded-full ${getEstatusColor(
                        procedimientoSeleccionado.estatus_comercial,
                      )}`}
                    >
                      {procedimientoSeleccionado.estatus_comercial || "No definido"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido principal en dos columnas */}
              <div className="grid grid-cols-2 gap-3">
                {/* Columna izquierda */}
                <div className="space-y-3">
                  {/* Cliente */}
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1 text-indigo-500"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Cliente
                    </h3>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Nombre:</span>
                      <span className="text-base font-medium text-gray-800">
                        {procedimientoSeleccionado.nombre_cliente || "-"}
                      </span>
                    </div>
                  </div>

                  {/* Información del proyecto */}
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1 text-indigo-500"
                      >
                        <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                        <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                      </svg>
                      Información del Proyecto
                    </h3>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Nombre:</span>
                        <span
                          className="text-base font-medium text-gray-800 text-right max-w-[200px] truncate"
                          title={procedimientoSeleccionado.nombre_proyecto}
                        >
                          {procedimientoSeleccionado.nombre_proyecto}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Nombre Corto:</span>
                        <span className="text-base font-medium text-gray-800">
                          {procedimientoSeleccionado.nombre_cortos}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Código Contrato:</span>
                        <span className="text-base font-medium text-gray-800">
                          {procedimientoSeleccionado.codigo_contrato_cliente || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información financiera */}
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1 text-green-500"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"></path>
                        <path d="M12 18v2"></path>
                        <path d="M12 6V4"></path>
                      </svg>
                      Información Financiera
                    </h3>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Monto Ofertado:</span>
                        <span className="text-base font-bold text-blue-600">
                          USD{" "}
                          {formatMontoConSeparador(Number.parseFloat(procedimientoSeleccionado.monto_ofertado) || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Costo Estimado:</span>
                        <span className="text-base font-bold text-orange-600">
                          USD{" "}
                          {formatMontoConSeparador(Number.parseFloat(procedimientoSeleccionado.costo_estimado) || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna derecha - Gestión de estatus */}
                <div className="space-y-3">
                  {/* Estado del proyecto y actualización */}
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1 text-indigo-500"
                      >
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                      </svg>
                      Estado del Proyecto
                    </h3>

                    {/* Estado actual */}
                    <div className="mb-2 p-2 bg-gray-50 rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Estatus Actual:</span>
                        <span
                          className={`px-2 py-0.5 text-sm leading-5 font-semibold rounded-full ${getEstatusColor(
                            procedimientoSeleccionado.estatus_comercial,
                          )}`}
                        >
                          {procedimientoSeleccionado.estatus_comercial || "No definido"}
                        </span>
                      </div>
                    </div>

                    {/* Verificación de estatus */}
                    {procedimientoSeleccionado.estatus_comercial === "Acta Inicio." ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded p-2">
                        <div className="flex items-start text-emerald-700">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1 flex-shrink-0 mt-0.5"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          <div>
                            <p className="text-sm font-medium">Proyecto Iniciado</p>
                            <p className="text-sm">
                              Este proyecto ya está en estado de Acta de Inicio y no se puede modificar su estatus.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          <span className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="mr-1 text-indigo-500"
                            >
                              <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"></path>
                              <circle cx="17" cy="7" r="5"></circle>
                            </svg>
                            Actualizar estatus
                          </span>
                        </label>
                        <select
                          value={nuevoEstatus}
                          onChange={handleEstatusChange}
                          className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                          <option value="">Seleccione un nuevo estatus</option>
                          {estatusOptions.map((estatus) => (
                            <option key={estatus.id} value={estatus.id}>
                              {estatus.nombre}
                            </option>
                          ))}
                        </select>

                        {/* Configuración para Acta de Inicio */}
                        {nuevoEstatus && esEstatusActaInicio(nuevoEstatus) && (
                          <div className="mt-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                            <h4 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-1"
                              >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                              Configuración para Acta de Inicio
                            </h4>

                            {/* Selección de monto ofertado */}
                            <div className="mb-2">
                              <p className="text-sm font-medium text-emerald-800 mb-1">Seleccione el monto ofertado:</p>
                              <div className="space-y-2">
                                <div className="flex items-start p-2 border border-emerald-200 rounded bg-white">
                                  <input
                                    type="radio"
                                    id="monto-cerrado"
                                    name="monto-ofertado"
                                    value="cerrado"
                                    checked={montoOfertadoSeleccionado === "cerrado"}
                                    onChange={handleMontoOfertadoChange}
                                    className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-0.5 mr-1"
                                  />
                                  <label htmlFor="monto-cerrado" className="block text-sm text-gray-700">
                                    <span className="font-medium">Monto Estimado Oferta Sobre Cerrado:</span>
                                    <span className="text-sm font-bold text-green-600 ml-1">
                                      USD{" "}
                                      {formatMontoConSeparador(
                                        Number.parseFloat(
                                          procedimientoSeleccionado.monto_estimado_oferta_cerrado_sdo,
                                        ) || 0,
                                      )}
                                    </span>
                                  </label>
                                </div>
                                <div className="flex items-start p-2 border border-emerald-200 rounded bg-white">
                                  <input
                                    type="radio"
                                    id="monto-cliente"
                                    name="monto-ofertado"
                                    value="cliente"
                                    checked={montoOfertadoSeleccionado === "cliente"}
                                    onChange={handleMontoOfertadoChange}
                                    className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-0.5 mr-1"
                                  />
                                  <label htmlFor="monto-cliente" className="block text-sm text-gray-700">
                                    <span className="font-medium">Monto Estimado Oferta al Cliente:</span>
                                    <span className="text-sm font-bold text-green-600 ml-1">
                                      USD{" "}
                                      {formatMontoConSeparador(
                                        Number.parseFloat(procedimientoSeleccionado.monto_estimado_oferta_cliente) || 0,
                                      )}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            {/* Selección de costo estimado */}
                            <div className="mb-2">
                              <p className="text-sm font-medium text-emerald-800 mb-1">Seleccione el costo estimado:</p>
                              <div className="space-y-2">
                                <div className="flex items-start p-2 border border-emerald-200 rounded bg-white">
                                  <input
                                    type="radio"
                                    id="costo-proveedor"
                                    name="costo-estimado"
                                    value="proveedor"
                                    checked={costoEstimadoSeleccionado === "proveedor"}
                                    onChange={handleCostoEstimadoChange}
                                    className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 mt-0.5 mr-1"
                                  />
                                  <label htmlFor="costo-proveedor" className="block text-sm text-gray-700">
                                    <span className="font-medium">Costo Planificado:</span>
                                    <span className="text-sm font-bold text-orange-600 ml-1">
                                      USD{" "}
                                      {formatMontoConSeparador(
                                        Number.parseFloat(procedimientoSeleccionado.oferta_del_proveedor) || 0,
                                      )}
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </div>

                            <div className="bg-emerald-100 p-1 rounded text-sm text-emerald-700 flex items-start">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-1 mt-0.5 flex-shrink-0"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" x2="12" y1="8" y2="12"></line>
                                <line x1="12" x2="12.01" y1="16" y2="16"></line>
                              </svg>
                              Debe seleccionar un monto ofertado y un costo estimado.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
                    {nuevoEstatus && !(procedimientoSeleccionado.estatus_comercial === "Acta Inicio.") && (
                      <button
                        type="button"
                        onClick={actualizarEstatusProyecto}
                        className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded hover:from-indigo-700 hover:to-purple-700 transition-colors duration-200 flex items-center text-sm font-medium"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-1"
                        >
                          <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                        Actualizar Estatus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EditarProcedimientoComercial
