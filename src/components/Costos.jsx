"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import showNotification, { UrlApi } from "../utils/utils"
import Swal from "sweetalert2"

const Costos = () => {
  const params = useParams()
  const [costos, setCostos] = useState([])
  const [costoOfertado, setCostoOfertado] = useState(0)
  const [costoTotal, setCostoTotal] = useState(0)
  const [nuevoCosto, setNuevoCosto] = useState({
    costo: "",
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

    if (!nuevoCosto.costo) {
      showNotification("warning", "Campo incompleto", "Por favor, ingresa el costo antes de agregar.")
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
          fecha: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
          costo: nuevoCostoNumerico,
          monto_sobrepasado: montoSobrepasado,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al agregar el costo")
      }

      setNuevoCosto({ costo: "" })
      fetchCostos()
      showNotification("success", "Éxito", "El costo ha sido agregado exitosamente.")
    } catch (error) {
      console.error("Error al agregar el costo:", error)
      showNotification("error", "Error", "Ocurrió un problema al agregar el costo. Por favor, inténtalo de nuevo.")
    }
  }

  return (
    <>
      <div className="breadcrumbs text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul>
          <li>
            <Link to="/InicioPlanificador" className="flex items-center hover:text-blue-500">
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
              Sistema Gerencial
            </Link>
          </li>
          <li>
            <Link to="/InicioPlanificador/Proyecto" className="flex items-center hover:text-blue-500">
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
              Proyecto
            </Link>
          </li>
          <li>{params.Proyecto}</li>
        </ul>
      </div>
      <div className="p-4">


        <h1 className="text-2xl font-bold mb-4">Gestión de Costos</h1>

        {/* Formulario para agregar nuevos costos */}
        <div className="mb-8">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto">
            <div className="mb-4">
              <label className="form-control w-full">
                <div className="label">
                  <span className="label-text text-[#000000]"> Costo (USD)</span>
                </div>
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

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              aria-label="Agregar costo"
            >
              Agregar
            </button>
          </form>
        </div>

        {/* Tabla de costos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-700">Registro de Costos</h2>
            <div className="text-sm text-gray-600">
              <p>
                Costo Planificado: <span className="font-bold">${costoOfertado.toFixed(2)}</span>
              </p>
              <p>
                Costo Total: <span className="font-bold">${costoTotal.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Costo (USD)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Sobrepasado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                      No hay datos disponibles.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((costo) => (
                    <tr key={costo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(costo.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Number(costo.costo).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Number(costo.monto_sobrepasado).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                    {/* Chevron left icon */}
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
    </>
  )
}

export default Costos

