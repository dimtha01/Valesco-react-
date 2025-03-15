"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import Swal from "sweetalert2"
import { formatearFechaUTC, UrlApi } from "../utils/utils"
import LoadingBar from "./LoadingBar"

const EditarAvanceFisico = () => {
  const params = useParams()
  const [avancesFisicos, setAvancesFisicos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ultimoAvanceReal, setUltimoAvanceReal] = useState(0)
  const [ultimoAvancePlanificado, setUltimoAvancePlanificado] = useState(0)
  const rowsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [avanceSeleccionado, setAvanceSeleccionado] = useState(null)

  // Estado para el formulario de edición
  const [formData, setFormData] = useState({
    avanceReal: "",
    avancePlanificado: "",
    puntoAtencion: "",
    fecha_inicio: "",
    fecha_fin: "",
  })

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(avancesFisicos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Datos paginados
  const paginatedData = avancesFisicos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const totalPages = Math.ceil(avancesFisicos.length / rowsPerPage)

  // Función para cargar los avances físicos
  const fetchAvancesFisicos = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${UrlApi}/api/avanceFisico/${params.id}`)
      if (!response.ok) {
        throw new Error("Error al cargar los avances físicos")
      }
      const data = await response.json()
      setAvancesFisicos(data)
      // Encontrar el máximo avance real y planificado registrado
      const maxAvanceReal = Math.max(...data.map((avance) => Number.parseFloat(avance.avance_real)), 0)
      const maxAvancePlanificado = Math.max(...data.map((avance) => Number.parseFloat(avance.avance_planificado)), 0)
      setUltimoAvanceReal(maxAvanceReal)
      setUltimoAvancePlanificado(maxAvancePlanificado)

      if (data.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Sin datos",
          text: "No se encontraron avances físicos para este proyecto.",
        })
      }
      setError(null)
    } catch (error) {
      console.error("Error al cargar los avances físicos:", error)
      setError("Ocurrió un problema al cargar los avances físicos. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    fetchAvancesFisicos()
  }, [fetchAvancesFisicos])

  // Validar que el valor esté entre 1 y 100
  const validarRango = (valor) => {
    const numero = Number.parseFloat(valor)
    return !isNaN(numero) && numero >= 1 && numero <= 100
  }

  // Función para abrir el modal de edición
  const handleEditarAvance = (avance) => {
    setAvanceSeleccionado(avance)

    // Formatear fechas para el input date
    const formatDate = (dateString) => {
      if (!dateString) return ""
      const date = new Date(dateString)
      return date.toISOString().split("T")[0]
    }

    setFormData({
      avanceReal: avance.avance_real.toString(),
      avancePlanificado: avance.avance_planificado.toString(),
      puntoAtencion: avance.puntos_atencion || "",
      fecha_inicio: formatDate(avance.fecha_inicio),
      fecha_fin: formatDate(avance.fecha_fin),
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

  // Manejar cambios en los campos numéricos
  const handleChangeNumero = (e) => {
    const { name, value } = e.target
    if (/^\d*\.?\d*$/.test(value)) {
      if (value === "" || validarRango(value)) {
        setFormData({ ...formData, [name]: value })
      } else {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "El valor debe estar entre 1 y 100.",
        })
      }
    }
  }

  // Función para actualizar el avance físico
  const handleActualizarAvance = async (e) => {
    e.preventDefault()

    if (
      !formData.avanceReal ||
      !formData.avancePlanificado ||
      !formData.puntoAtencion ||
      !formData.fecha_inicio ||
      !formData.fecha_fin
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos antes de actualizar el avance físico.",
      })
      return
    }

    if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
      Swal.fire({
        icon: "error",
        title: "Fechas inválidas",
        text: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      })
      return
    }

    const avanceRealNumerico = Number.parseFloat(formData.avanceReal)
    const avancePlanificadoNumerico = Number.parseFloat(formData.avancePlanificado)

    if (!validarRango(avanceRealNumerico) || !validarRango(avancePlanificadoNumerico)) {
      Swal.fire({
        icon: "error",
        title: "Valor inválido",
        text: "El avance real y planificado deben estar entre 1 y 100.",
      })
      return
    }

    // Validar que el avance real sea mayor o igual al último registrado
    // Excluimos el avance actual de la validación si es el que estamos editando
    const otrosAvances = avancesFisicos.filter((a) => a.id !== avanceSeleccionado.id)
    const maxOtroAvanceReal = Math.max(...otrosAvances.map((a) => Number.parseFloat(a.avance_real)), 0)

    if (avanceRealNumerico < maxOtroAvanceReal) {
      Swal.fire({
        icon: "error",
        title: "Valor inválido",
        text: `El avance real debe ser mayor o igual al máximo registrado en otros avances (${maxOtroAvanceReal}%).`,
      })
      return
    }

    // Validar que el avance planificado sea mayor o igual al último registrado
    const maxOtroAvancePlanificado = Math.max(...otrosAvances.map((a) => Number.parseFloat(a.avance_planificado)), 0)

    if (avancePlanificadoNumerico < maxOtroAvancePlanificado) {
      Swal.fire({
        icon: "error",
        title: "Valor inválido",
        text: `El avance planificado debe ser mayor o igual al máximo registrado en otros avances (${maxOtroAvancePlanificado}%).`,
      })
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/avanceFisico/${avanceSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avance_real: avanceRealNumerico,
          avance_planificado: avancePlanificadoNumerico,
          puntos_atencion: formData.puntoAtencion,
          fecha_inicio: formData.fecha_inicio,
          fecha_fin: formData.fecha_fin,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el avance físico")
      }

      setMostrarModal(false)
      fetchAvancesFisicos()
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "El avance físico ha sido actualizado exitosamente.",
      })
    } catch (error) {
      console.error("Error al actualizar el avance físico:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al actualizar el avance físico. Por favor, inténtalo de nuevo.",
      })
    }
  }

  return (
    <div className="flex flex-col h-auto overflow-hidden p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar Avance Físico</h1>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <LoadingBar />
      ) : (
        <div className="flex flex-col">
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Último Avance Real</h3>
              <p className="text-lg font-bold text-blue-600">{ultimoAvanceReal}%</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Último Avance Planificado</h3>
              <p className="text-lg font-bold text-green-600">{ultimoAvancePlanificado}%</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">

            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Registro de Avances Físicos</h2>
              <p className="text-sm text-gray-500">Detalle de avances físicos del proyecto</p>
            </div>


            {/* Modificar la sección de la tabla para tener altura fija */}
            <div className="overflow-x-auto">
              <div className="h-[500px] overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registrado
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avance Real (%)
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avance Planificado (%)
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Puntos de Atención
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Inicio
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Fin
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
                          No hay datos disponibles.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((avance) => (
                        <tr key={avance.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha)}</td>
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">{avance.avance_real}%</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{avance.avance_planificado}%</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{avance.puntos_atencion}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha_inicio)}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha_fin)}</td>
                          <td className="py-4 px-4 text-sm">
                            <button
                              onClick={() => handleEditarAvance(avance)}
                              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded transition-colors"
                              disabled={Number.parseFloat(avance.avance_real) >= 100}
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
                Mostrando {avancesFisicos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                {Math.min(currentPage * rowsPerPage, avancesFisicos.length)} de {avancesFisicos.length} resultados
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

      {/* Información de avance */}


      {/* Modal para editar avance físico */}
      {mostrarModal && avanceSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Avance Físico</h2>

            <form onSubmit={handleActualizarAvance} className="space-y-4">
              {/* Avance Real */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avance Real (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="avanceReal"
                  value={formData.avanceReal}
                  onChange={handleChangeNumero}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                  required
                  disabled={Number.parseFloat(avanceSeleccionado.avance_real) >= 100}
                />
              </div>

              {/* Avance Planificado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avance Planificado (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="avancePlanificado"
                  value={formData.avancePlanificado}
                  onChange={handleChangeNumero}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="100"
                  required
                />
              </div>

              {/* Punto de Atención */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Punto de Atención</label>
                <input
                  type="text"
                  name="puntoAtencion"
                  value={formData.puntoAtencion}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Fecha Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Final</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={formData.fecha_inicio}
                  required
                />
              </div>

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
                  disabled={Number.parseFloat(avanceSeleccionado.avance_real) >= 100}
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

export default EditarAvanceFisico

