"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { formatCurrency, UrlApi } from "../utils/utils"
import Swal from "sweetalert2"
import LoadingBar from "./LoadingBar"

const EditarAvanceFinanciero = () => {
  const params = useParams()
  const [avancesFinancieros, setAvancesFinancieros] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [mostrarModal, setMostrarModal] = useState(false)
  const [avanceSeleccionado, setAvanceSeleccionado] = useState(null)
  const rowsPerPage = 5

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    numero_valuacion: "",
    monto_usd: "",
    numero_factura: "",
    id_estatus_proceso: "",
  })

  useEffect(() => {
    const fetchAvancesFinancieros = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${UrlApi}/api/avanceFinanciero/${params.id}`)
        if (!response.ok) {
          throw new Error("Error al cargar los avances financieros")
        }
        const data = await response.json()
        setAvancesFinancieros(data || [])
        setError(null)
      } catch (error) {
        console.error("Error al cargar los avances financieros:", error)
        setError("No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAvancesFinancieros()
  }, [params.id])

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const filteredData = avancesFinancieros.filter(
    (avance) => filterStatus === "all" || avance.estatus_proceso_nombre.toLowerCase() === filterStatus,
  )

  const paginatedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const totalPages = Math.ceil(filteredData.length / rowsPerPage)

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value)
    setCurrentPage(1)
  }

  // Función para abrir el modal de edición
  const handleEditarAvance = (avance) => {
    setAvanceSeleccionado(avance)

    setFormData({
      numero_valuacion: avance.numero_valuacion || "",
      monto_usd: avance.monto_usd?.toString() || "",
      numero_factura: avance.numero_factura || "",
      id_estatus_proceso: avance.id_estatus_proceso?.toString() || "",
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

  // Función para actualizar el avance financiero
  const handleActualizarAvance = async (e) => {
    e.preventDefault()

    // Validar campos requeridos
    if (!formData.numero_valuacion || !formData.monto_usd) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa al menos el número de valuación y el monto.",
      })
      return
    }

    // Validar que el monto sea un número positivo
    const monto = Number.parseFloat(formData.monto_usd)
    if (isNaN(monto) || monto <= 0) {
      Swal.fire({
        icon: "error",
        title: "Monto inválido",
        text: "El monto debe ser un número positivo.",
      })
      return
    }

    // Validar que si el estatus es "Facturado", se proporcione un número de factura
    if (formData.id_estatus_proceso === "6" && !formData.numero_factura) {
      Swal.fire({
        icon: "error",
        title: "Número de factura requerido",
        text: "Debe proporcionar un número de factura cuando el estado es 'Facturado'.",
      })
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/avanceFinanciero/${avanceSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numero_valuacion: formData.numero_valuacion,
          monto_usd: monto,
          numero_factura: formData.numero_factura,
          id_estatus_proceso: Number.parseInt(formData.id_estatus_proceso),
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el avance financiero")
      }

      // Actualizar la lista de avances financieros
      const fetchAvancesFinancieros = async () => {
        try {
          const response = await fetch(`${UrlApi}/api/avanceFinanciero/${params.id}`)
          if (!response.ok) {
            throw new Error("Error al cargar los avances financieros")
          }
          const data = await response.json()
          setAvancesFinancieros(data || [])
        } catch (error) {
          console.error("Error al recargar los avances financieros:", error)
        }
      }

      await fetchAvancesFinancieros()
      setMostrarModal(false)

      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "El avance financiero ha sido actualizado exitosamente.",
      })
    } catch (error) {
      console.error("Error al actualizar el avance financiero:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al actualizar el avance financiero. Por favor, inténtalo de nuevo.",
      })
    }
  }

  return (
    <div className="flex flex-col h-auto overflow-hidden p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar Avance Financiero</h1>

      <div className="mb-4">
        <select
          value={filterStatus}
          onChange={handleFilterChange}
          className="bg-white border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="por valuar">Por Valuar</option>
          <option value="por facturar">Por Facturar</option>
          <option value="facturado">Facturado</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <LoadingBar />
      ) : (
        <div className="flex flex-col">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Avance Financiero</h2>
              <p className="text-sm text-gray-500">Detalle de valuaciones y facturación del proyecto</p>
            </div>

            {/* Modificar la sección de la tabla para tener altura fija */}
            <div className="overflow-x-auto">
              <div className="h-[500px] overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        ID
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Número de Valuación
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto (USD)
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Número de Factura
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estatus del Proceso
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-gray-500">
                          No hay datos disponibles
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((avance) => (
                        <tr key={avance.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-500 hidden md:table-cell">{avance.id}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">
                            {new Date(avance.fecha).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500 hidden md:table-cell">
                            {avance.numero_valuacion || "-"}
                          </td>
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">
                            {formatCurrency(avance.monto_usd)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-500 hidden md:table-cell">
                            {avance.numero_factura || "-"}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${avance.estatus_proceso_nombre.toLowerCase() === "facturado"
                                  ? "bg-green-100 text-green-800"
                                  : avance.estatus_proceso_nombre.toLowerCase() === "por facturar"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                            >
                              {avance.estatus_proceso_nombre}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <button
                              onClick={() => handleEditarAvance(avance)}
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
                Mostrando {filteredData.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                {Math.min(currentPage * rowsPerPage, filteredData.length)} de {filteredData.length} resultados
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

      {/* Modal para editar avance financiero */}
      {mostrarModal && avanceSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Avance Financiero</h2>

            <form onSubmit={handleActualizarAvance} className="space-y-4">
              {/* Número de Valuación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Valuación</label>
                <input
                  type="text"
                  name="numero_valuacion"
                  value={formData.numero_valuacion}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  name="monto_usd"
                  value={formData.monto_usd}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0.01"
                  required
                />
              </div>

              {/* Estado del Proceso */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Proceso</label>
                <select
                  name="id_estatus_proceso"
                  value={formData.id_estatus_proceso}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar Estado</option>
                  <option value="4">Por Valuar</option>
                  <option value="5">Por Facturar</option>
                  <option value="6">Facturado</option>
                </select>
              </div>

              {/* Número de Factura (solo visible si el estado es "Facturado") */}
              {formData.id_estatus_proceso === "6" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Factura</label>
                  <input
                    type="text"
                    name="numero_factura"
                    value={formData.numero_factura}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

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
  )
}

export default EditarAvanceFinanciero

