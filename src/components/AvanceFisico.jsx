"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
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

  // Función para crear barra de progreso
  const ProgressBar = ({ value, max = 100, color = "blue" }) => {
    const percentage = Math.min((value / max) * 100, 100)
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
    }

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">


      <div className="mx-auto max-w-7xl px-4 py-2 ">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-4 rounded-2xl mr-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Avance Físico</h1>
              <p className="text-gray-600 text-lg">Monitoreo y registro del progreso del proyecto</p>              </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl px-4 py-5 space-y-8">


        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Último Avance Real */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <h3 className="text-sm font-semibold opacity-90">Último Avance Real</h3>
                </div>
                <p className="text-3xl font-bold">{ultimoAvanceReal}%</p>
                <div className="mt-3">
                  <ProgressBar value={ultimoAvanceReal} color="blue" />
                </div>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Último Avance Planificado */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <h3 className="text-sm font-semibold opacity-90">Último Avance Planificado</h3>
                </div>
                <p className="text-3xl font-bold">{ultimoAvancePlanificado}%</p>
                <div className="mt-3">
                  <ProgressBar value={ultimoAvancePlanificado} color="green" />
                </div>
              </div>
              <div className="rounded-full bg-white/20 p-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mensaje de proyecto completado */}
        {formularioDeshabilitado && (
          <div className="rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-500 p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">¡Proyecto Completado!</h3>
                <p className="text-green-700">
                  El proyecto ha alcanzado el 100% de avance real. No se pueden agregar más registros.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-500 p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="border-b border-gray-200 pb-6 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Avance</h2>
            </div>
            <p className="text-gray-600">Ingrese los detalles del nuevo avance físico del proyecto</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avance Real */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  Avance Real (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="avanceReal"
                  placeholder="Ingrese el avance real %"
                  className={`w-full p-3 border-2 rounded-xl transition-all duration-200 ${formularioDeshabilitado
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  value={nuevoAvance.avanceReal}
                  onChange={(e) => handleChangeNumero(e, "avanceReal")}
                  min="1"
                  max="100"
                  disabled={formularioDeshabilitado}
                  required
                />
              </div>

              {/* Avance Planificado */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                  Avance Planificado (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="avancePlanificado"
                  placeholder="Ingrese el avance planificado %"
                  className={`w-full p-3 border-2 rounded-xl transition-all duration-200 ${formularioDeshabilitado
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  value={nuevoAvance.avancePlanificado}
                  onChange={(e) => handleChangeNumero(e, "avancePlanificado")}
                  min="1"
                  max="100"
                  disabled={formularioDeshabilitado}
                  required
                />
              </div>

              {/* Fecha Inicio */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  name="fecha_inicio"
                  className={`w-full p-3 border-2 rounded-xl transition-all duration-200 ${formularioDeshabilitado
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  value={nuevoAvance.fecha_inicio}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_inicio: e.target.value })}
                  disabled={formularioDeshabilitado}
                  required
                />
              </div>

              {/* Fecha Fin */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  name="fecha_fin"
                  className={`w-full p-3 border-2 rounded-xl transition-all duration-200 ${formularioDeshabilitado
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  value={nuevoAvance.fecha_fin}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_fin: e.target.value })}
                  min={nuevoAvance.fecha_inicio}
                  disabled={formularioDeshabilitado}
                  required
                />
              </div>

              {/* Punto de Atención */}
              <div className="md:col-span-2 space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Punto de Atención
                </label>
                <input
                  type="text"
                  name="puntoAtencion"
                  placeholder="Ingrese el punto de atención"
                  className={`w-full p-3 border-2 rounded-xl transition-all duration-200 ${formularioDeshabilitado
                    ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    }`}
                  value={nuevoAvance.puntoAtencion}
                  onChange={(e) => setNuevoAvance({ ...nuevoAvance, puntoAtencion: e.target.value })}
                  disabled={formularioDeshabilitado}
                  required
                />
              </div>
            </div>

            {/* Botón de Agregar */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={formularioDeshabilitado}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${formularioDeshabilitado
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl"
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Avance
              </button>
            </div>
          </form>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingBar />
          </div>
        ) : (
          <div className="rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Registro de Avances Físicos</h2>
              <p className="text-blue-100">Historial detallado de avances del proyecto</p>
            </div>

            <div className="overflow-x-auto">
              <div className="h-[500px] overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50 sticky top-0 z-10">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Registrado
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Avance Real (%)
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Avance Planificado (%)
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Puntos de Atención
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Fecha Inicio
                      </th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Fecha Fin
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="rounded-full bg-gray-100 p-4">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                            <p className="text-gray-500 font-medium">No hay avances físicos registrados</p>
                            <p className="text-gray-400 text-sm">
                              Los avances aparecerán aquí una vez que sean agregados
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((avance, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                        >
                          <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                            {formatearFechaUTC(avance.fecha)}
                          </td>
                          <td className="py-4 px-6 text-sm">
                            <div className="flex items-center gap-3">
                              <span className=" text-blue-600">{avance.avance_real}%</span>
                              <div className="flex-1">
                                <ProgressBar value={Number.parseFloat(avance.avance_real)} color="blue" />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm">
                            <div className="flex items-center gap-3">
                              <span className=" text-green-600">{avance.avance_planificado}%</span>
                              <div className="flex-1">
                                <ProgressBar value={Number.parseFloat(avance.avance_planificado)} color="green" />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-gray-900">{avance.puntos_atencion}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{formatearFechaUTC(avance.fecha_inicio)}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">{formatearFechaUTC(avance.fecha_fin)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginador */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {avancesFisicos.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} a{" "}
                {Math.min(currentPage * rowsPerPage, avancesFisicos.length)} de {avancesFisicos.length} resultados
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                  {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvanceFisico
