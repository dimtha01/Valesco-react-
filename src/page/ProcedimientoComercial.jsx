"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import Swal from "sweetalert2"
import { UrlApi } from "../utils/utils"

const ProcedimientoComercial = () => {
  // Estados para los datos
  const [datos, setDatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState("")
  const [clientes, setClientes] = useState([])
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false);


  // Definir regiones como constante en lugar de estado
  const regiones = [
    { id: 2, nombre: "Occidente" },
    { id: 3, nombre: "Oriente" },
  ]

  // Estado para el formulario
  const [formData, setFormData] = useState({
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
    // Si tenemos el nombre, usamos el nombre para determinar el color
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

    // Color por defecto
    return "bg-gray-100 text-gray-800"
  }

  // Añadir esta función para cargar los estatus comerciales
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

    // Actualizar el id_region en el formulario
    setFormData((prev) => ({
      ...prev,
      id_region: regionId,
    }))

    // Cargar clientes de la región seleccionada
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

  // Modificar la función fetchData para incluir la carga de estatus
  const fetchData = async () => {
    setLoading(true)
    try {
      // Cargar estatus comerciales
      await fetchEstatusComerciales()

      // Cargar proyectos (todos)
      const proyectosUrl = `${UrlApi}/api/proyectos/requisition`
      const proyectosResponse = await fetch(proyectosUrl)
      if (proyectosResponse.ok) {
        const proyectosData = await proyectosResponse.json()
        // Verificar si la respuesta tiene una propiedad 'proyectos'
        if (proyectosData.proyectos) {
          setDatos(proyectosData.proyectos)
        } else {
          // Si no tiene la propiedad 'proyectos', asumimos que es un array directamente
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

  // Cargar datos por región
  const fetchDataByRegion = async (regionId) => {
    setLoading(true)
    try {
      // Cargar proyectos según la región seleccionada
      const regionName = getRegionNameById(regionId)
      const proyectosUrl = `${UrlApi}/api/proyectos/all?region=${encodeURIComponent(regionName)}`

      const proyectosResponse = await fetch(proyectosUrl)
      if (proyectosResponse.ok) {
        const proyectosData = await proyectosResponse.json()
        // Verificar si la respuesta tiene una propiedad 'proyectos'
        if (proyectosData.proyectos) {
          setDatos(proyectosData.proyectos)
        } else {
          // Si no tiene la propiedad 'proyectos', asumimos que es un array directamente
          setDatos(Array.isArray(proyectosData) ? proyectosData : [])
        }
      } else {
        console.error("Error al cargar proyectos")
      }
    } catch (error) {
      console.error("Error al cargar datos por región:", error)
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
    let datosFiltrados = Array.isArray(datos) ? datos : []

    // Filtrar por región si está seleccionada
    if (filtroRegionTabla) {
      const nombreRegionFiltro = getRegionNameById(filtroRegionTabla)
      datosFiltrados = datosFiltrados.filter((item) => item.nombre_region === nombreRegionFiltro)
    }

    // Filtrar proyectos en Acta Inicio si el checkbox está marcado
    if (ocultarActaInicio) {
      datosFiltrados = datosFiltrados.filter((item) => item.estatus_comercial !== "Acta Inicio.")
    }

    setFilteredDatos(datosFiltrados)
    setTotalPages(Math.ceil(datosFiltrados.length / rowsPerPage))
    setCurrentPage(1) // Resetear a la primera página cuando se aplican filtros
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

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Verify that we have a region ID
    if (!formData.id_region) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe seleccionar una región para continuar.",
      })
      return
    }

    // Verify that we have a client ID
    if (!formData.id_cliente) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe seleccionar un cliente para continuar.",
      })
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/proyectos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero: formData.numero,
          nombre: formData.nombre,
          nombreCorto: formData.nombre_corto,
          codigoContratoCliente: formData.codigo_contrato_cliente || null,
          idCliente: Number.parseInt(formData.id_cliente),
          idRegion: Number.parseInt(formData.id_region),
          fechaInicio: formData.fecha_inicio,
          fechaFinal: formData.fecha_final,
          observaciones: formData.observaciones,
          montoEstimadoOfertaCliente: Number.parseFloat(formData.monto_estimado_oferta_cliente) || 0,
          montoEstimadoOfertaCerradoSdo: Number.parseFloat(formData.monto_estimado_oferta_cerrado_sdo) || 0,
          ofertaDelProveedor: Number.parseFloat(formData.ofertaDelProveedor) || 0,
        }),
      })

      if (response.ok) {
        const nuevoRegistro = await response.json()

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Proyecto agregado",
          text: "El proyecto ha sido agregado exitosamente.",
          showConfirmButton: false,
          timer: 1500,
        })

        // Limpiar formulario pero mantener la región y cliente
        setFormData({
          id_region: formData.id_region,
          id_cliente: formData.id_cliente,
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
        })

        // Recargar datos
        await fetchData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear el proyecto")
      }
    } catch (error) {
      console.error("Error al crear proyecto:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado al intentar crear el proyecto.",
      })
    }
  }

  // Función para recargar los datos
  const recargarDatos = async () => {
    if (selectedRegion) {
      await fetchDataByRegion(selectedRegion)
    } else {
      await fetchData()
    }
  }

  // Añadir esta función para manejar el cambio de estatus
  const handleEstatusChange = (e) => {
    const estatusId = e.target.value
    setNuevoEstatus(estatusId)

    // Si el estatus seleccionado es ID 8, resetear los valores
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

  // Añadir esta función para actualizar el estatus del proyecto
  const actualizarEstatusProyecto = async () => {
    if (!nuevoEstatus) {
      Swal.fire({
        icon: "warning",
        title: "Selección requerida",
        text: "Por favor, seleccione un nuevo estatus.",
      })
      return
    }

    // Verificar si el estatus seleccionado es ID 8
    const esActaInicio = esEstatusActaInicio(nuevoEstatus)

    // Si es estatus ID 8, verificar que se haya seleccionado un monto ofertado y un costo estimado
    if (esActaInicio) {
      if (!montoOfertadoSeleccionado) {
        Swal.fire({
          icon: "warning",
          title: "Selección requerida",
          text: "Para cambiar a Acta de Inicio, debe seleccionar el monto ofertado.",
        })
        return
      }
      if (!procedimientoSeleccionado.codigo_contrato_cliente) {
        Swal.fire({
          icon: "warning",
          title: "Selección requerida",
          text: "Para cambiar a Acta de Inicio, debe ingresar el Codigo Contrato Cliente",
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
      // Preparar el cuerpo de la solicitud
      const requestBody = {
        id_estatus_comercial: nuevoEstatus,
      }

      // Si es estatus ID 8, añadir el monto ofertado y costo estimado
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
        // Actualizar la lista de proyectos
        await recargarDatos()

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Estatus actualizado",
          text: esActaInicio
            ? "El estatus del proyecto ha sido actualizado a Acta de Inicio y se han registrado el monto ofertado y costo estimado."
            : "El estatus del proyecto ha sido actualizado exitosamente.",
          showConfirmButton: false,
          timer: 2000,
        })

        // Cerrar el modal
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

  // Remover estas líneas de estado:
  // const [editandoCodigoContrato, setEditandoCodigoContrato] = useState(false)
  // const [nuevoCodigoContrato, setNuevoCodigoContrato] = useState("")

  // Añadir un estado para controlar el modo de edición del código de contrato:
  // const [editandoCodigoContrato, setEditandoCodigoContrato] = useState(false)
  // const [nuevoCodigoContrato, setNuevoCodigoContrato] = useState("")

  // Modificar la función actualizarCodigoContrato para usar el nuevo estado:
  const actualizarCodigoContrato = async () => {
    try {
      const response = await fetch(`${UrlApi}/api/proyectos/${procedimientoSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo_contrato_cliente: procedimientoSeleccionado.codigo_contrato_cliente,
        }),
      })

      if (response.ok) {
        // Actualizar el objeto local
        // setProcedimientoSeleccionado({
        //   ...procedimientoSeleccionado,
        //   codigo_contrato_cliente: nuevoCodigoContrato,
        // })

        // Actualizar la lista de proyectos
        await recargarDatos()

        // Mostrar mensaje de éxito
        Swal.fire({
          icon: "success",
          title: "Código actualizado",
          text: "El código de contrato del cliente ha sido actualizado exitosamente.",
          showConfirmButton: false,
          timer: 1500,
        })

        // Salir del modo edición
        // setEditandoCodigoContrato(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar el código de contrato")
      }
    } catch (error) {
      console.error("Error al actualizar código de contrato:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado al intentar actualizar el código de contrato.",
      })
    }
  }

  // Añadir una función para iniciar la edición del código:
  // const iniciarEdicionCodigo = () => {
  //   setNuevoCodigoContrato(procedimientoSeleccionado.codigo_contrato_cliente || "")
  //   setEditandoCodigoContrato(true)
  // }

  // Añadir una función para cancelar la edición:
  // const cancelarEdicionCodigo = () => {
  //   setEditandoCodigoContrato(false)
  // }

  // Y remover estas funciones:
  // const iniciarEdicionCodigo = () => { ... }
  // const cancelarEdicionCodigo = () => { ... }

  // Modificar la función handleRowClick para verificar el estatus al abrir el modal
  const handleRowClick = (procedimiento) => {
    setProcedimientoSeleccionado(procedimiento)
    setNuevoEstatus("")
    setMontoOfertadoSeleccionado("")
    setCostoEstimadoSeleccionado("")

    // Verificar si el proyecto ya tiene estatus ID 8
    if (procedimiento.id_estatus_comercial && Number(procedimiento.id_estatus_comercial) === ESTATUS_ACTA_INICIO_ID) {
      console.log("Proyecto con estatus Acta de Inicio (ID 8). No se puede modificar.")
    }

    setMostrarModalEstatus(true)
  }

  // Function to handle cancel edit
  const handleCancelEdit = () => {
    setFormData({
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
    })
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      {/* Fondo con gradiente sutil */}
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Breadcrumbs con dos niveles */}
        <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f]">
          <ul className="flex items-center space-x-2">
            <li>
              <Link
                to="/InicioProcedimientoComercial"
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
                Comercialización
              </Link>
            </li>
            <li>ProcedimientoComercial</li>
          </ul>
        </div>

        {/* Contenedor principal con márgenes mejorados */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Tarjeta de región seleccionada con diseño mejorado */}
          <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
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
                  className="text-blue-600"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Región seleccionada</h2>
                <p className="text-blue-700 font-medium mt-1">
                  {getRegionNameById(selectedRegion) || "Todas las regiones"}
                </p>
              </div>
            </div>
          </div>

          {/* Estructura vertical: formulario arriba, tabla abajo */}
          <div className="flex flex-col gap-10">
            {/* PRIMERO: Formulario para agregar nuevo procedimiento con diseño mejorado */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Agregar Nuevo Proyecto</h2>
                    <p className="text-blue-100 mt-1">Complete el formulario para registrar un nuevo proyecto</p>
                  </div>

                  {/* Botón de cancelar edición */}
                  {formData.nombre && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn btn-outline border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
                    >
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
                        className="mr-1"
                      >
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                      Cancelar Edición
                    </button>
                  )}
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Sección de información básica */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-inner">
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
                      {/* Región - Ahora como selector */}
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-blue-500"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            Región
                          </span>
                        </label>
                        <select
                          name="id_region"
                          value={formData.id_region}
                          onChange={(e) => {
                            handleChange(e)
                            handleRegionChange(e)
                          }}
                          className="select select-bordered w-full h-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
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

                      {/* Cliente - Nuevo campo */}
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-blue-500"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Cliente
                          </span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <select
                            name="id_cliente"
                            value={formData.id_cliente}
                            onChange={handleChange}
                            className="select select-bordered w-full h-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                            required
                            disabled={!formData.id_region || loadingClientes}
                          >
                            <option value="">Seleccionar cliente</option>
                            {clientes.map((cliente) => (
                              <option key={cliente.id} value={cliente.id}>
                                {cliente.nombre}
                              </option>
                            ))}
                          </select>
                          <Link
                            to="/InicioPlanificador/CrearProyecto/crearCliente"
                            className="btn bg-blue-500 hover:bg-blue-600 text-white border-0 h-12 w-12 rounded-lg flex items-center justify-center"
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
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                          </Link>
                        </div>
                        {loadingClientes && (
                          <div className="mt-2 text-sm text-gray-500 flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Cargando clientes...
                          </div>
                        )}
                        {!loadingClientes && formData.id_region && clientes.length === 0 && (
                          <div className="mt-2 text-sm text-amber-600">
                            No hay clientes disponibles para esta región. Puede crear uno nuevo con el botón +
                          </div>
                        )}
                        {!formData.id_region && (
                          <div className="mt-2 text-sm text-gray-500">
                            Seleccione una región para ver los clientes disponibles
                          </div>
                        )}
                      </div>

                      {/* Número */}
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-blue-500"
                            >
                              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                              <path d="M18 14h-8"></path>
                              <path d="M15 18h-5"></path>
                              <path d="M10 6h8v4h-8V6Z"></path>
                            </svg>
                            Número
                          </span>
                        </label>
                        <input
                          type="text"
                          name="numero"
                          value={formData.numero}
                          onChange={handleChange}
                          className="input input-bordered w-full h-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                          required
                        />
                      </div>

                      {/* Código Contrato Cliente */}
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-blue-500"
                            >
                              <path d="M9 12l2 2 4-4"></path>
                              <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"></path>
                              <path d="M3 10h18"></path>
                            </svg>
                            Código Contrato Cliente
                          </span>
                        </label>
                        <input
                          type="text"
                          name="codigo_contrato_cliente"
                          value={formData.codigo_contrato_cliente}
                          onChange={handleChange}
                          className="input input-bordered w-full h-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                          placeholder="Ingrese el código del contrato del cliente"
                        />
                      </div>

                      {/* Nombre del Contrato */}
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-blue-500"
                            >
                              <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                              <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                              <path d="M9 9h1"></path>
                              <path d="M9 13h6"></path>
                              <path d="M9 17h6"></path>
                            </svg>
                            Nombre del Contrato
                          </span>
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          className="input input-bordered w-full h-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                          required
                        />
                      </div>

                      {/* Nombre Corto */}
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-blue-500"
                            >
                              <path d="M12 5v14"></path>
                              <path d="M18 13l-6 6"></path>
                              <path d="M6 13l6 6"></path>
                            </svg>
                            Nombre del Contrato Corto
                          </span>
                        </label>
                        <input
                          type="text"
                          name="nombre_corto"
                          value={formData.nombre_corto}
                          onChange={handleChange}
                          className="input input-bordered w-full h-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección de información financiera */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-inner">
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
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-green-500"
                            >
                              <rect width="20" height="14" x="2" y="7" rx="2"></rect>
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                            </svg>
                            Monto Estimado Oferta Sobre Cerrado (USD)
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium">
                            USD
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            name="monto_estimado_oferta_cerrado_sdo"
                            value={formData.monto_estimado_oferta_cerrado_sdo}
                            onChange={handleChange}
                            className="input input-bordered w-full h-12 pl-14 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"

                          />
                        </div>
                      </div>

                      {/* Oferta del Proveedor */}
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-green-500"
                            >
                              <path d="M16 3h5v5"></path>
                              <path d="M8 3H3v5"></path>
                              <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"></path>
                              <path d="m15 9 6-6"></path>
                            </svg>
                            Oferta del Proveedor (USD)
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium">
                            USD
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            name="ofertaDelProveedor"
                            value={formData.ofertaDelProveedor}
                            onChange={handleChange}
                            className="input input-bordered w-full h-12 pl-14 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"

                          />
                        </div>
                      </div>

                      {/* Monto Estimado Oferta al Cliente */}
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-green-500"
                            >
                              <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
                              <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path>
                              <line x1="12" x2="12" y1="22" y2="13"></line>
                              <path d="M20 13.5v3.37a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13.5"></path>
                            </svg>
                            Monto Estimado Oferta al Cliente (USD)
                          </span>
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium">
                            USD
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            name="monto_estimado_oferta_cliente"
                            value={formData.monto_estimado_oferta_cliente}
                            onChange={handleChange}
                            className="input input-bordered w-full h-12 pl-14 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"

                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección de fechas */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-inner">
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
                          <path d="M8 14h.01"></path>
                          <path d="M12 14h.01"></path>
                          <path d="M16 14h.01"></path>
                          <path d="M8 18h.01"></path>
                          <path d="M12 18h.01"></path>
                          <path d="M16 18h.01"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Fechas</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Fecha de Inicio del Proceso */}
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-purple-500"
                            >
                              <path d="M21 7v6h-6"></path>
                              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
                            </svg>
                            Fecha de Inicio
                          </span>
                        </label>
                        <input
                          type="date"
                          name="fecha_inicio"
                          value={formData.fecha_inicio}
                          onChange={handleChange}
                          className="input input-bordered w-full h-12 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"

                        />
                      </div>

                      {/* Fecha Final */}
                      <div className="form-control w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <span className="flex items-center">
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
                              className="mr-2 text-purple-500"
                            >
                              <path d="M21 17a9 9 0 0 1-9 9 9 9 0 0 1-6-2.3l-3-2.7"></path>
                              <path d="M3 7v6h6"></path>
                            </svg>
                            Fecha Final
                          </span>
                        </label>
                        <input
                          type="date"
                          name="fecha_final"
                          value={formData.fecha_final}
                          onChange={handleChange}
                          className="input input-bordered w-full h-12 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white shadow-sm"

                        />
                      </div>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 shadow-inner">
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
                    <div className="form-control w-full">
                      <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleChange}
                        rows="4"
                        className="textarea textarea-bordered w-full rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-sm"
                        placeholder="Ingrese observaciones adicionales aquí..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <button
                      type="submit"
                      className="btn px-16 py-3 text-lg rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
                        className="mr-2"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      Guardar Proyecto
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* SEGUNDO: Tabla de proyectos con nuevo diseño */}
            <div className=" bg-whiterounded-xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl">
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
                <h2 className="text-2xl font-bold text-white">Listado de Proyectos</h2>
                {/* Sección de filtros */}
                {/* Sección de filtros mejorada */}
                <div className="px-8 py-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    {/* Controles de filtros */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                      {/* Filtro por región */}
                      <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
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
                            className="select select-bordered select-sm w-44 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm border-blue-200 text-gray-700 font-medium"
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
                      <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-3 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
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
                            className="text-sm font-semibold text-emerald-700 cursor-pointer select-none"
                          >
                            Ocultar proyectos en Acta Inicio
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Contador de resultados mejorado */}
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
                          <path d="M12 11h4"></path>
                          <path d="M12 16h4"></path>
                          <path d="M8 11h.01"></path>
                          <path d="M8 16h.01"></path>
                        </svg>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700">{filteredDatos.length}</div>
                        <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                          {filteredDatos.length === 1 ? "Proyecto" : "Proyectos"}
                          {(filtroRegionTabla || ocultarActaInicio) && (
                            <span className="text-purple-500 ml-1">(Filtrados)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Indicadores de filtros activos mejorados */}
                  {(filtroRegionTabla || ocultarActaInicio) && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-gray-100 rounded-lg">
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
                              className="text-gray-600"
                            >
                              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">Filtros activos:</span>
                        </div>

                        {/* Botón para limpiar todos los filtros */}
                        <button
                          onClick={() => {
                            setFiltroRegionTabla("")
                            setOcultarActaInicio(false)
                          }}
                          className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors duration-200 flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-red-50 bg-white"
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
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                          <span >Limpiar todo</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-3">
                        {filtroRegionTabla && (
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-200">
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
                              className="mr-2"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span className="mr-2">Región: {getRegionNameById(filtroRegionTabla)}</span>
                            <button
                              onClick={() => setFiltroRegionTabla("")}
                              className="ml-1 p-1 hover:bg-blue-200 rounded-full transition-colors duration-200"
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
                              >
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                            </button>
                          </span>
                        )}
                        {ocultarActaInicio && (
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-200">
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
                              className="mr-2"
                            >
                              <path d="M9 11H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h5m0-6v6m0-6V9a2 2 0 0 1 2-2h2m-2 8h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-2 8V9"></path>
                              <path d="M9 7V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3"></path>
                            </svg>
                            <span className="mr-2">Sin Acta Inicio</span>
                            <button
                              onClick={() => setOcultarActaInicio(false)}
                              className="ml-1 p-1 hover:bg-emerald-200 rounded-full transition-colors duration-200"
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
                              >
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-indigo-100 mt-1">Gestión y seguimiento de proyectos</p>
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
                            <span className="flex items-center">
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
                                className="mr-2 text-indigo-500"
                              >
                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                                <path d="M18 14h-8"></path>
                                <path d="M15 18h-5"></path>
                                <path d="M10 6h8v4h-8V6Z"></path>
                              </svg>
                              No.
                            </span>
                          </th>


                          <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            <span className="flex items-center">
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
                                className="mr-2 text-indigo-500"
                              >
                                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
                                <path d="M9 9h1"></path>
                                <path d="M9 13h6"></path>
                                <path d="M9 17h6"></path>
                              </svg>
                              Proyecto
                            </span>
                          </th>
                          <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                            <span className="flex items-center">
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
                                className="mr-2 text-indigo-500"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"></path>
                                <path d="M12 18v2"></path>
                                <path d="M12 6V4"></path>
                              </svg>
                              Costo Planificado
                            </span>
                          </th>
                          <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                            <span className="flex items-center">
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
                                className="mr-2 text-indigo-500"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M16 8h-6.5a2.5 2.5 0 0 0 0 5h3a2.5 2.5 0 0 1 0 5H6"></path>
                                <path d="M12 18v2"></path>
                                <path d="M12 6V4"></path>
                              </svg>
                              Oferta al Cliente
                            </span>
                          </th>


                          <th className="py-4 px-4  text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">
                            <span className="flex items-center">
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
                                className="mr-2 text-indigo-500"
                              >
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                              </svg>
                              Estatus
                            </span>
                          </th>
                          <th className="py-4 px-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                            <span className="flex items-center">
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
                                className="mr-2 text-indigo-500"
                              >
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                              </svg>
                              Observaciones
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedData.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-10 text-center text-base text-gray-500">
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
                                <p className="text-sm text-gray-400 mt-1">
                                  Seleccione una región o agregue un nuevo proyecto.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedData.map((item) => (
                            <tr
                              key={item.id}
                              className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                              onClick={() => handleRowClick(item)}
                            >

                              <td className="py-4 px-4 text-base text-gray-900">
                                <div className="truncate max-w-[180px]" >
                                  {item.numero}
                                </div>
                                <div className={`text-xs text-gray-500 mt-1{!item.nombre_region
                                    ? "bg-gray-100 text-gray-800"
                                    : item.nombre_region === "Occidente"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                    }`}>{item.nombre_region || "-"} </div>
                              </td>


                              <td className="py-4 px-4 text-base text-gray-900">
                                <div className="truncate max-w-[180px]" title={item.nombre_proyecto}>
                                  {item.nombre_proyecto}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">{item.nombre_cortos}</div>
                              </td>
                              <td className="py-4 px-4 text-base text-end text-gray-900 font-medium">
                                {formatMontoConSeparador(Number.parseFloat(item.oferta_del_proveedor))}
                              </td>
                              <td className="py-4 px-4 text-base text-end  text-gray-900 font-medium">
                                {formatMontoConSeparador(Number.parseFloat(item.monto_estimado_oferta_cliente))}
                              </td>

                              <td className="py-4 px-4 text-base text-gray- tracking-wider whitespace-nowrap text-center">
                                <span
                                  className={`px-3 py-1.5 inline-flex text-xs leading-4 font-medium rounded-full ${getEstatusColor(
                                    item.estatus_comercial,
                                  )}`}
                                >
                                  {item.estatus_comercial || "-"}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-base text-gray-900">
                                <div className="max-w-[400px] overflow-auto">
                                  {item.observaciones}
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

              {/* Paginador mejorado */}
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
      </div>

      {/* Modal compacto con menos espacios en blanco */}
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
                  Detalles del Proyecto
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
                      {/* Reemplazar la línea que muestra el código de contrato en la sección "Información del Proyecto" con: */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Código Contrato Cliente:</span>
                        <div className="flex items-center space-x-2 flex-1 justify-end">
                          <input
                            type="text"
                            value={procedimientoSeleccionado.codigo_contrato_cliente || ""}
                            onChange={(e) => {
                              setProcedimientoSeleccionado({
                                ...procedimientoSeleccionado,
                                codigo_contrato_cliente: e.target.value,
                              })
                            }}
                            className="text-sm font-medium text-gray-800 border border-gray-300 rounded px-3 py-1.5 w-[180px] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
                            placeholder="Ingrese código..."
                          />
                          <button
                            type="button"
                            onClick={actualizarCodigoContrato}
                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200 flex items-center text-sm font-medium shadow-sm"
                            title="Guardar código"
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
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                              <polyline points="17 21 17 13 7 13 7 21"></polyline>
                              <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Guardar
                          </button>
                        </div>
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
                        <span className="text-sm text-gray-500">Monto Estimado Oferta Sobre Cerrado:</span>
                        <span className="text-base font-medium text-green-600">
                          USD{" "}
                          {formatMontoConSeparador(
                            Number.parseFloat(procedimientoSeleccionado.monto_estimado_oferta_cerrado_sdo) || 0,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Monto Estimado Oferta al Cliente:</span>
                        <span className="text-base font-medium text-green-600">
                          USD{" "}
                          {formatMontoConSeparador(
                            Number.parseFloat(procedimientoSeleccionado.monto_estimado_oferta_cliente) || 0,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Monto Ofertado Actual:</span>
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Oferta del Proveedor:</span>
                        <span className="text-base font-bold text-purple-600">
                          USD{" "}
                          {formatMontoConSeparador(
                            Number.parseFloat(procedimientoSeleccionado.oferta_del_proveedor) || 0,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fechas y duración */}
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
                        className="mr-1 text-purple-500"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                      Fechas y Duración
                    </h3>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Fecha de Inicio:</span>
                        <span className="text-base font-medium text-gray-800">
                          {formatDate(procedimientoSeleccionado.fecha_inicio)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Fecha Final:</span>
                        <span className="text-base font-medium text-gray-800">
                          {formatDate(procedimientoSeleccionado.fecha_final)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Duración:</span>
                        <span className="text-base font-medium text-gray-800">
                          {procedimientoSeleccionado.duracion || "-"} días
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna derecha - Gestión de estatus */}
                <div className="space-y-3">
                  {/* Observaciones */}
                  {procedimientoSeleccionado.observaciones && (
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
                          className="mr-1 text-amber-500"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        Observaciones
                      </h3>
                      <p className="text-sm text-gray-700 max-h-20 overflow-y-auto">
                        {procedimientoSeleccionado.observaciones}
                      </p>
                    </div>
                  )}

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
                                    <span className="font-medium">Oferta del Proveedor:</span>
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

export default ProcedimientoComercial
