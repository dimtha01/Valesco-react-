"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import Swal from "sweetalert2"
import { formatearFechaUTC, UrlApi } from "../utils/utils"
import LoadingBar from "./LoadingBar"

const AvanceFisico = () => {
  const params = useParams()
  const [avancesFisicos, setAvancesFisicos] = useState([])
  const [nuevoAvance, setNuevoAvance] = useState({
    avanceReal: "",
    avancePlanificado: "",
    puntoAtencion: "",
    fecha_inicio: "",
    fecha_fin: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formularioDeshabilitado, setFormularioDeshabilitado] = useState(false)
  const [ultimoAvanceReal, setUltimoAvanceReal] = useState(0)
  const [ultimoAvancePlanificado, setUltimoAvancePlanificado] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

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
      // Verificar si algún avance real ya alcanzó el 100%
      const algunAvanceCompleto = data.some((avance) => Number.parseFloat(avance.avance_real) >= 100)
      if (algunAvanceCompleto) {
        setFormularioDeshabilitado(true)
      }
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

  // Manejar cambios en los campos numéricos
  const handleChangeNumero = (e, campo) => {
    const valor = e.target.value
    if (/^\d*\.?\d*$/.test(valor)) {
      if (valor === "" || validarRango(valor)) {
        setNuevoAvance({ ...nuevoAvance, [campo]: valor })
      } else {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "El valor debe estar entre 1 y 100.",
        })
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !nuevoAvance.avanceReal ||
      !nuevoAvance.avancePlanificado ||
      !nuevoAvance.puntoAtencion ||
      !nuevoAvance.fecha_inicio ||
      !nuevoAvance.fecha_fin
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos antes de agregar el avance físico.",
      })
      return
    }

    if (new Date(nuevoAvance.fecha_fin) < new Date(nuevoAvance.fecha_inicio)) {
      Swal.fire({
        icon: "error",
        title: "Fechas inválidas",
        text: "La fecha de fin no puede ser anterior a la fecha de inicio.",
      })
      return
    }

    const avanceRealNumerico = Number.parseFloat(nuevoAvance.avanceReal)
    const avancePlanificadoNumerico = Number.parseFloat(nuevoAvance.avancePlanificado)

    if (!validarRango(avanceRealNumerico) || !validarRango(avancePlanificadoNumerico)) {
      Swal.fire({
        icon: "error",
        title: "Valor inválido",
        text: "El avance real y planificado deben estar entre 1 y 100.",
      })
      return
    }

    // Validar que el avance real sea mayor o igual al último registrado
    if (avanceRealNumerico < ultimoAvanceReal) {
      Swal.fire({
        icon: "error",
        title: "Valor inválido",
        text: `El avance real debe ser mayor o igual al último registrado (${ultimoAvanceReal}%).`,
      })
      return
    }

    // Validar que el avance planificado sea mayor o igual al último registrado
    if (avancePlanificadoNumerico < ultimoAvancePlanificado) {
      Swal.fire({
        icon: "error",
        title: "Valor inválido",
        text: `El avance planificado debe ser mayor o igual al último registrado (${ultimoAvancePlanificado}%).`,
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`${UrlApi}/api/avanceFisico`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_proyecto: params.id,
          fecha: new Date().toISOString().split("T")[0],
          avance_real: avanceRealNumerico,
          avance_planificado: avancePlanificadoNumerico,
          puntos_atencion: nuevoAvance.puntoAtencion,
          fecha_inicio: nuevoAvance.fecha_inicio,
          fecha_fin: nuevoAvance.fecha_fin,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar el avance físico")
      }

      setNuevoAvance({
        avanceReal: "",
        avancePlanificado: "",
        puntoAtencion: "",
        fecha_inicio: "",
        fecha_fin: "",
      })
      fetchAvancesFisicos()
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "El avance físico ha sido agregado exitosamente.",
      })
    } catch (error) {
      console.error("Error al agregar el avance físico:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al agregar el avance físico. Por favor, inténtalo de nuevo.",
      })
    }
  }

  return (
    <div className="flex flex-col h-auto overflow-hidden p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Informe de Avance Físico</h1>
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

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col">
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <div className="px-0 py-2 border-b border-gray-200 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Registrar Nuevo Avance</h2>
            <p className="text-sm text-gray-500">Ingrese los detalles del nuevo avance físico</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Avance Real */}
              <div className="form-control w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Avance Real (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="avanceReal"
                  placeholder="Ingrese el avance real %"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoAvance.avanceReal}
                  onChange={(e) => handleChangeNumero(e, "avanceReal")}
                  min="1"
                  max="100"
                  disabled={formularioDeshabilitado}
                  required
                />
              </div>

              {/* Avance Planificado */}
              <div className="form-control w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Avance Planificado (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="avancePlanificado"
                  placeholder="Ingrese el avance planificado %"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoAvance.avancePlanificado}
                  onChange={(e) => handleChangeNumero(e, "avancePlanificado")}
                  min="1"
                  max="100"
                  disabled={formularioDeshabilitado}
                  required
                />
              </div>

              {/* Fecha Inicio */}
              <div className="form-control w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoAvance.fecha_inicio}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_inicio: e.target.value })}
                  disabled={formularioDeshabilitado}
                  required
                />
              </div>

              {/* Fecha Fin */}
              <div className="form-control w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoAvance.fecha_fin}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_fin: e.target.value })}
                  min={nuevoAvance.fecha_inicio}
                  disabled={formularioDeshabilitado}
                  required
                />
              </div>

              {/* Punto de Atención - Abarca dos columnas en pantallas medianas y grandes */}
              <div className="form-control w-full md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Punto de Atención</label>
                <input
                  type="text"
                  name="puntoAtencion"
                  placeholder="Ingrese el punto de atención"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={nuevoAvance.puntoAtencion}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, puntoAtencion: e.target.value })}
                  disabled={formularioDeshabilitado}
                  required
                />
              </div>
            </div>

            {/* Botón de Agregar */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                disabled={formularioDeshabilitado}
              >
                Agregar Avance
              </button>
            </div>
          </form>
        </div>

        {isLoading ? (
          <LoadingBar />
        ) : (
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500">
                          No hay datos disponibles.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((avance, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha)}</td>
                          <td className="py-4 px-4 text-sm font-medium text-gray-900">{avance.avance_real}%</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{avance.avance_planificado}%</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{avance.puntos_atencion}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha_inicio)}</td>
                          <td className="py-4 px-4 text-sm text-gray-900">{formatearFechaUTC(avance.fecha_fin)}</td>
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
        )}

        {/* Información de avance */}

      </div>
    </div>
  )
}

export default AvanceFisico

