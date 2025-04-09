"use client"

import { useContext, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { UrlApi } from "../utils/utils"
import { AuthContext } from "../components/AuthContext"
import ModalNuevoProveedor from "../components/ModalNuevoProveedor"

const GestionProcura = () => {
  const { region } = useContext(AuthContext)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    tipo: "",
    id_proyecto: "",
    numero_requisicion: "",
    id_proveedor: "",
    fecha_elaboracion: new Date().toISOString().split("T")[0],
    monto_total: "",
    numero_renglones: "",
    id_region: "",
  })

  const [proyectos, setProyectos] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [modalVisible, setModalVisible] = useState(false)

  // Estado para las requisiciones
  const [requisiciones, setRequisiciones] = useState([])
  const [loadingRequisiciones, setLoadingRequisiciones] = useState(false)

  // Estados para paginación de requisiciones
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 9
  const [totalPages, setTotalPages] = useState(1)

  // Set the region when component mounts
  useEffect(() => {
    if (region) {
      setFormData((prevState) => ({
        ...prevState,
        id_region: region,
      }))

      // Fetch projects for the region using region name
      fetchProyectos(region)

      // Fetch all providers
      fetchProveedores()

      // Fetch requisiciones
      fetchRequisiciones()
    }
  }, [region])

  const fetchProyectos = async (regionName) => {
    try {
      const response = await fetch(`${UrlApi}/api/proyectos?region=${regionName}`)
      if (response.ok) {
        const data = await response.json()
        setProyectos(data)
      }
    } catch (error) {
      console.error("Error al cargar proyectos:", error)
    }
  }

  const fetchProveedores = async () => {
    try {
      const response = await fetch(`${UrlApi}/api/proveedores`)
      if (response.ok) {
        const data = await response.json()
        setProveedores(data)
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error)
    }
  }

  // Función para obtener las requisiciones
  const fetchRequisiciones = async () => {
    setLoadingRequisiciones(true)
    try {
      const response = await fetch(`${UrlApi}/api/requisiciones`)
      if (response.ok) {
        const data = await response.json()
        setRequisiciones(data)
        setTotalPages(Math.ceil(data.length / rowsPerPage))
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

    // Validate that we have a region
    if (!region) {
      Swal.fire({
        icon: "error",
        title: "Error de región",
        text: "No se pudo determinar la región del usuario. Por favor, contacte al administrador.",
      })
      return
    }

    try {
      // Convertir tipo a id_tipo (ejemplo: "producto" -> 1, "servicio" -> 2)
      const id_tipo = formData.tipo === "producto" ? 1 : 2

      const response = await fetch(`${UrlApi}/api/requisiciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_tipo: id_tipo,
          id_proyecto: Number.parseInt(formData.id_proyecto),
          nro_requisicion: formData.numero_requisicion,
          id_proveedores: Number.parseInt(formData.id_proveedor),
          fecha_elaboracion: formData.fecha_elaboracion,
          monto_total: Number.parseFloat(formData.monto_total),
          nro_renglones: Number.parseInt(formData.numero_renglones),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Requisición agregada:", formData)
        Swal.fire({
          icon: "success",
          title: "Requisición creada",
          text: "La requisición ha sido creada exitosamente.",
          showConfirmButton: false,
          timer: 1500,
        })

        // Recargar las requisiciones para mostrar la nueva
        fetchRequisiciones()

        // Limpiar el formulario pero mantener la región
        setFormData({
          tipo: "",
          id_proyecto: "",
          numero_requisicion: "",
          id_proveedor: "",
          fecha_elaboracion: new Date().toISOString().split("T")[0],
          monto_total: "",
          numero_renglones: "",
          id_region: region,
        })
      } else {
        throw new Error(data.message || "Error al crear la requisición")
      }
    } catch (error) {
      console.error("Error al crear la requisición:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado al intentar crear la requisición.",
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
            <Link
              to="/InicioPlanificador/Requisiciones"
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
              Requisiciones
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
            <h3 className="font-bold text-2xl mb-6">Formulario de Requisición</h3>

            {/* Display current region */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-700">
                <span className="font-medium">Región actual:</span> {region || "No definida"}
              </p>
              <p className="text-sm text-blue-600 mt-1">Solo se muestran los proyectos de esta región.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Requisición */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-lg font-medium text-gray-700 mb-3">Tipo de Requisición</h4>
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
                <h4 className="text-lg font-medium text-gray-700 mb-3">Información de la Requisición</h4>
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
                        <option key={proyecto.id} value={proyecto.id}>
                          {proyecto.nombre_proyecto}
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
                          <option key={proveedor.id} value={proveedor.id}>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Elaboración</label>
                    <input
                      type="date"
                      name="fecha_elaboracion"
                      className="input input-bordered w-full h-12 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.fecha_elaboracion}
                      onChange={handleChange}
                      required
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
                        type="number"
                        name="monto_total"
                        placeholder="0.00"
                        className="input input-bordered w-full h-12 pl-8 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.monto_total}
                        onChange={handleChange}
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  {/* N° Renglones */}
                  <div className="form-control w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">N° Renglones</label>
                    <input
                      type="number"
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
                  Guardar
                </button>
              </div>
            </form>
          </div>

          {/* Tabla de Requisiciones */}
          <div className="bg-white rounded-lg shadow-xl p-6 w-full">
            <h3 className="font-bold text-2xl mb-6">Listado de Requisiciones</h3>

            {loadingRequisiciones ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <div className="h-[600px] overflow-hidden">
                    <table className="min-w-full bg-white">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            N° Requisición
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
                            Renglones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getPaginatedData().length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                              No hay requisiciones disponibles
                            </td>
                          </tr>
                        ) : (
                          getPaginatedData().map((requisicion) => (
                            <tr key={requisicion.id} className="hover:bg-gray-50">
                              <td className="py-4 px-4 text-sm text-gray-900">{requisicion.id}</td>
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
                                {requisicion.nombre_comercial_provedore}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {formatDate(requisicion.fecha_elaboracion)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {formatMonto(requisicion.monto_total)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">{requisicion.nro_renglones}</td>
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
    </>
  )
}

export default GestionProcura
