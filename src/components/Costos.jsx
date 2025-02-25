"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import showNotification, { formatCurrency, formatearFechaUTC, UrlApi } from "../utils/utils"
import Swal from "sweetalert2"
import LoadingBar from "./LoadingBar"

const Costos = () => {
  const params = useParams()
  const [costos, setCostos] = useState([])
  const [costoOfertado, setCostoOfertado] = useState(0)
  const [costoTotal, setCostoTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [nuevoCosto, setNuevoCosto] = useState({
    costo: "",
    fecha_inicio: "",
    fecha_fin: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(costos.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  // Datos paginados
  const paginatedData = costos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Función para cargar los costos
  const fetchCostos = async () => {
    try {
      const response = await fetch(`${UrlApi}/api/costos/${params.id}`)
      if (!response.ok) {
        throw new Error("Error al cargar los costos")
      }
      const data = await response.json()
      setCostos(data.costos || [])
      setCostoOfertado(Number(data.costosOfertado) || 0)

      // Calcular el costo total
      const total = data.costos.reduce((sum, costo) => sum + Number(costo.costo), 0)
      setCostoTotal(total)

      if (data.costos.length === 0) {
        showNotification("info", "Sin datos", "No se encontraron costos para este proyecto.")
      }
    } catch (error) {
      console.error("Error al cargar los costos:", error)
      showNotification("error", "Error", "Ocurrió un problema al cargar los costos. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCostos()
  }, [params.id])

  const handleChangeNumero = (e) => {
    const value = e.target.value
    if (!isNaN(value)) {
      setNuevoCosto({ ...nuevoCosto, costo: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!nuevoCosto.costo || !nuevoCosto.fecha_inicio || !nuevoCosto.fecha_fin) {
      showNotification("warning", "Campos incompletos", "Por favor, completa todos los campos antes de agregar.")
      return
    }

    // Validar que la fecha de fin no sea anterior a la fecha de inicio
    if (new Date(nuevoCosto.fecha_fin) < new Date(nuevoCosto.fecha_inicio)) {
      showNotification("error", "Fechas inválidas", "La fecha de fin no puede ser anterior a la fecha de inicio.")
      return
    }

    const nuevoCostoNumerico = Number(nuevoCosto.costo)
    const nuevoTotal = costoTotal + nuevoCostoNumerico
    const montoSobrepasado = nuevoTotal > costoOfertado ? nuevoTotal - costoOfertado : 0

    if (montoSobrepasado > 0) {
      const result = await Swal.fire({
        title: "¡Atención!",
        text: `Este costo sobrepasa el costo ofertado por $${montoSobrepasado.toFixed(2)}. ¿Desea agregarlo de todos modos?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, agregar",
        cancelButtonText: "Cancelar",
      })

      if (!result.isConfirmed) {
        return
      }
    }

    try {
      const response = await fetch(`${UrlApi}/api/costos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_proyecto: Number.parseInt(params.id),
          fecha: new Date().toISOString().split("T")[0],
          costo: nuevoCostoNumerico,
          monto_sobrepasado: montoSobrepasado,
          fecha_inicio: nuevoCosto.fecha_inicio,
          fecha_fin: nuevoCosto.fecha_fin,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar el costo")
      }

      setNuevoCosto({
        costo: "",
        fecha_inicio: "",
        fecha_fin: "",
      })
      fetchCostos()
      showNotification("success", "Éxito", "El costo ha sido agregado exitosamente.")
    } catch (error) {
      console.error("Error al agregar el costo:", error)
      showNotification("error", "Error", "Ocurrió un problema al agregar el costo. Por favor, inténtalo de nuevo.")
    }
  }

  return (
    <>

      <div className="p-4">
        <h1 className="text-2xl text-center mb-4">Gestión de Costos</h1>
        {/* Formulario para agregar nuevos costos */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
            {/* Contenedor flex para los campos en línea */}
            <div className="flex flex-wrap gap-4 mb-4 items-center justify-center ">
              {/* Campo de Costo */}
              <div className="flex flex-col w-full md:w-auto">
                <label className="label">
                  <span className="label-text text-[#000000]">Costo (USD)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="costo"
                  name="costo"
                  placeholder="Ingrese el costo en USD"
                  className="input input-bordered w-full bg-[#f0f0f0]"
                  value={nuevoCosto.costo}
                  onChange={handleChangeNumero}
                  min="0"
                  required
                />
              </div>

              {/* Campo de Fecha de Inicio */}
              <div className="flex flex-col w-full md:w-auto">
                <label className="label">
                  <span className="label-text text-[#000000]">Fecha de Inicio</span>
                </label>
                <input
                  type="date"
                  name="fecha_inicio"
                  className="input input-bordered w-full bg-[#f0f0f0]"
                  value={nuevoCosto.fecha_inicio}
                  onChange={(e) => setNuevoCosto({ ...nuevoCosto, fecha_inicio: e.target.value })}
                  required
                />
              </div>

              {/* Campo de Fecha de Fin */}
              <div className="flex flex-col w-full md:w-auto">
                <label className="label">
                  <span className="label-text text-[#000000]">Fecha de Fin</span>
                </label>
                <input
                  type="date"
                  name="fecha_fin"
                  className="input input-bordered w-full bg-[#f0f0f0]"
                  value={nuevoCosto.fecha_fin}
                  onChange={(e) => setNuevoCosto({ ...nuevoCosto, fecha_fin: e.target.value })}
                  min={nuevoCosto.fecha_inicio}
                  required
                />
              </div>
            </div>

            {/* Botón de Agregar */}
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                aria-label="Agregar costo"
              >
                Agregar
              </button>
            </div>
          </form>
        </div>
        {/* Tabla de costos */}
        <div className="text-[#141313] xl:mx-20 mt-2">
          <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
                <h2 className="text-lg font-semibold text-gray-700">Registro de Costos</h2>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[310px]">
              {isLoading ? (

                <LoadingBar />
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-center   text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-center   text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Costo (USD)
                      </th>
                      <th className="px-6 py-3 text-center   text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto Sobrepasado
                      </th>
                      <th className="px-6 py-3 text-center   text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Inicio
                      </th>
                      <th className="px-6 py-3 text-center   text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Fin
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No hay datos disponibles.
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((costo) => (
                        <tr key={costo.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {formatearFechaUTC(costo.fecha)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            ${Number(costo.costo).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            ${Number(costo.monto_sobrepasado).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {formatearFechaUTC(costo.fecha_inicio)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                            {formatearFechaUTC(costo.fecha_fin)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

            </div>

            {/* Paginador */}
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
                  disabled={currentPage === Math.ceil(costos.length / rowsPerPage)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(currentPage - 1) * rowsPerPage + 1}</span> a{" "}
                    <span className="font-medium">{Math.min(currentPage * rowsPerPage, costos.length)}</span> de{" "}
                    <span className="font-medium">{costos.length}</span> resultados
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
                      {/* Chevron center   icon */}
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
                      disabled={currentPage === Math.ceil(costos.length / rowsPerPage)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Siguiente</span>
                      {/* Chevron right icon */}
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
      </div>
      {costoOfertado > 0 && (
        <div className="fixed bottom-4 right-4 flex gap-4">
          <div className="bg-white rounded-lg p-4 shadow-lg w-40 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2"> Costo Planificado</h3>
            <p className="text-lg font-bold text-gray-900">${costoOfertado.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-lg w-40 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Real</h3>
            <p className="text-lg font-bold text-green-600">${costoTotal.toFixed(2)}</p>
          </div>
        </div>
      )}


    </>
  )
}

export default Costos

