"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "react-router-dom"
import Swal from "sweetalert2"
import { formatearFechaUTC, UrlApi } from "../utils/utils"

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
  const [formularioDeshabilitado, setFormularioDeshabilitado] = useState(false)
  const [ultimoAvanceReal, setUltimoAvanceReal] = useState(0)
  const [ultimoAvancePlanificado, setUltimoAvancePlanificado] = useState(0)
  const rowsPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(avancesFisicos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Datos paginados
  const paginatedData = avancesFisicos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Función para cargar los avances físicos
  const fetchAvancesFisicos = useCallback(async () => {
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
    } catch (error) {
      console.error("Error al cargar los avances físicos:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un problema al cargar los avances físicos. Por favor, inténtalo de nuevo.",
      })
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
    <>
      <h1 className="ml-4 text-3xl mt-3 text-center">Informe de Avance Físico</h1>
      <div className="p-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center justify-center p-6 bg-[#ffffff] rounded-xl w-full max-w-4xl mx-auto"
        >
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#000000]">Avance Real (%)</span>
              </div>
              <input
                type="number"
                name="avanceReal"
                placeholder="Ingrese el avance real %"
                className="input input-bordered w-full bg-[#f0f0f0]"
                value={nuevoAvance.avanceReal}
                onChange={(e) => handleChangeNumero(e, "avanceReal")}
                min="1"
                max="100"
                disabled={formularioDeshabilitado}
                required
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#000000]">Avance Planificado (%)</span>
              </div>
              <input
                type="number"
                name="avancePlanificado"
                placeholder="Ingrese el avance planificado %"
                className="input input-bordered w-full bg-[#f0f0f0]"
                value={nuevoAvance.avancePlanificado}
                onChange={(e) => handleChangeNumero(e, "avancePlanificado")}
                min="1"
                max="100"
                disabled={formularioDeshabilitado}
                required
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#000000]">Fecha de Inicio</span>
              </div>
              <input
                type="date"
                name="fecha_inicio"
                className="input input-bordered w-full bg-[#f0f0f0]"
                value={nuevoAvance.fecha_inicio}
                onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_inicio: e.target.value })}
                disabled={formularioDeshabilitado}
                required
              />
            </label>

            <label className="form-control w-full">
              <div className="label">
                <span className="label-text text-[#000000]">Fecha de Fin</span>
              </div>
              <input
                type="date"
                name="fecha_fin"
                className="input input-bordered w-full bg-[#f0f0f0]"
                value={nuevoAvance.fecha_fin}
                onChange={(e) => setNuevoAvance({ ...nuevoAvance, fecha_fin: e.target.value })}
                min={nuevoAvance.fecha_inicio}
                disabled={formularioDeshabilitado}
                required
              />
            </label>

            <label className="form-control w-full md:col-span-2">
              <div className="label">
                <span className="label-text text-[#000000]">Punto de Atención</span>
              </div>
              <input
                type="text"
                name="puntoAtencion"
                placeholder="Ingrese el punto de atención"
                className="input input-bordered w-full bg-[#f0f0f0]"
                value={nuevoAvance.puntoAtencion}
                onChange={(e) => setNuevoAvance({ ...nuevoAvance, puntoAtencion: e.target.value })}
                disabled={formularioDeshabilitado}
                required
              />
            </label>
          </div>

          <div className="flex justify-center mt-6 w-full">
            <button
              type="submit"
              className="btn btn-primary w-full md:w-auto md:px-12"
              disabled={formularioDeshabilitado}
              aria-label="Agregar avance físico"
            >
              Agregar
            </button>
          </div>
        </form>

        <div className="text-[#141313] xl:mx-20 mt-2">
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
                <h2 className="text-lg font-semibold text-gray-700">Registro de Avances Físicos</h2>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[310px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avance Real (%)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avance Planificado (%)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntos de Atención
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Inicio
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Fin
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                        No hay datos disponibles.
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((avance, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {formatearFechaUTC(avance.fecha)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {avance.avance_real}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {avance.avance_planificado}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {avance.puntos_atencion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {formatearFechaUTC(avance.fecha_inicio)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {formatearFechaUTC(avance.fecha_fin)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === Math.ceil(avancesFisicos.length / rowsPerPage)}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> a{" "}
                  <span className="font-medium">{Math.min(currentPage * rowsPerPage, avancesFisicos.length)}</span> de{" "}
                  <span className="font-medium">{avancesFisicos.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Anterior</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === Math.ceil(avancesFisicos.length / rowsPerPage)}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AvanceFisico

