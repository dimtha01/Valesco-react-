"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { formatCurrency, UrlApi } from "../utils/utils"
import { FiDollarSign, FiShoppingCart, FiCheckCircle, FiUsers, FiBarChart2 } from "react-icons/fi"

const ReginDetalles = () => {
  const { region } = useParams() // Obtiene la región desde los parámetros de la URL
  const [data, setData] = useState([]) // Estado para almacenar los datos de la API
  const [loading, setLoading] = useState(true) // Estado para manejar la carga
  const [error, setError] = useState(null) // Estado para manejar errores
  const navigate = useNavigate() // Hook para navegar programáticamente
  const rowsPerPage = 5 // Máximo de filas por página
  const [currentPage, setCurrentPage] = useState(1) // Estado para la página actual
  const [costoTotal, setCostoTotal] = useState(0)
  const [rentabilidad, setRentabilidad] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${UrlApi}/api/dashdoard/${region}`)
        if (!response.ok) {
          throw new Error("No se pudieron cargar los datos")
        }
        const result = await response.json()
        setData(result)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    fetchData()
  }, [region]) // Se ejecuta cuando cambia la región

  if (loading) {
    return <p>Cargando...</p>
  }

  

  // Función para manejar el clic en una fila
  const handleRowClick = (idProyecto) => {
    navigate(`/proyecto/${idProyecto}`) // Redirige a la página del proyecto
  }

  // Datos paginados
  const paginatedData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(2)}%`
  }
  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(data.length / rowsPerPage)) {
      setCurrentPage(newPage)
    }
  }

  return (
    <div className="flex flex-col h-auto overflow-hidden">
      {/* Breadcrumbs */}
      <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul className="flex items-center space-x-2">
          <li>
            <Link
              to="/GestionGerencia"
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
              Gestion de Gerencia
            </Link>
          </li>
          <li>
            <Link to="/" className="flex items-center hover:text-blue-500 transition-colors duration-300">
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
              {region}
            </Link>
          </li>
        </ul>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-hidden p-2 space-y-3">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              title: "Ofertado",
              value: data.reduce((sum, item) => sum + Number.parseFloat(item.monto_ofertado), 0),
              icon: FiDollarSign,
              color: "bg-green-100 text-green-600",
            },
            {
              title: "Costo Planificado",
              value: data.reduce((sum, item) => sum + Number.parseFloat(item.costo_planificado), 0),
              icon: FiBarChart2,
              color: "bg-blue-100 text-blue-600",
            },
            {
              title: "Facturado",
              value: data.reduce((sum, item) => sum + Number.parseFloat(item.monto_facturado), 0),
              icon: FiCheckCircle,
              color: "bg-purple-100 text-purple-600",
            },
            {
              title: "Por Facturar",
              value: data.reduce((sum, item) => sum + Number.parseFloat(item.monto_por_facturar), 0),
              icon: FiShoppingCart,
              color: "bg-yellow-100 text-yellow-600",
            },
            {
              title: "Por Valuar",
              value: data.reduce((sum, item) => sum + Number.parseFloat(item.monto_por_valuar), 0),
              icon: FiUsers,
              color: "bg-pink-100 text-pink-600",
            },
          ].map((metric, index) => (
            <div key={index} className="p-4 bg-white shadow rounded-lg hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">$ {metric.value.toLocaleString()}</p>
                </div>
                <div className={`h-10 w-10 rounded-full ${metric.color} flex items-center justify-center`}>
                  <metric.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="min-h-[300px] flex flex-col justify-between border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre del proyecto
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facturado
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Por facturar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No hay proyectos disponibles
                  </td>
                </tr>
              ) : (
                paginatedData.map((project) => (
                  <>
                    <tr
                      key={project.id_proyecto}
                      onClick={() => handleRowClick(project.id_proyecto)} // Manejador de clic
                      className="hover:bg-gray-50 cursor-pointer" // Estilo para indicar que es cliclable
                    >
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.id_proyecto}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base text-gray-900">
                        {project.nombre_proyecto}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $ {Number.parseFloat(project.monto_por_facturar).toLocaleString()}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        $ {Number.parseFloat(project.monto_facturado).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm md:text-base">
                        <ProgressIndicator
                          progress={{
                            real: Number.parseFloat(project.avance_real),
                            planned: Number.parseFloat(project.avance_planificado),
                            completed: 100, // Asumimos que el avance completado es siempre 100%
                          }}
                        />
                      </td>
                    </tr>
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador */}
        <div className="flex justify-center mt-1 pb-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-indigo-500 text-white rounded-l-md hover:bg-indigo-600 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="px-4 py-2 bg-white text-gray-700 border-t border-b">
            Página {currentPage} de {Math.ceil(data.length / rowsPerPage)}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === Math.ceil(data.length / rowsPerPage)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-r-md hover:bg-indigo-600 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
      {/* <div className="fixed bottom-4 right-4 flex gap-4">
        <div className="bg-white rounded-lg p-4 shadow-lg w-48 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Total</h3>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(costoTotal)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-lg w-48 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Rentabilidad</h3>
          <p className="text-2xl font-bold text-green-600">{formatPercentage(rentabilidad)}</p>
        </div>
      </div> */}
    </div>
  )
}

function ProgressIndicator({ progress }) {
  // Asegurarse de que los valores sean números válidos o 0 si son null/undefined
  const real = progress.real || 0;
  const planned = progress.planned || 0;
  const completed = progress.completed || 0;

  // Determinar si el avance real supera el planificado
  const isRealOverPlanned = real > planned;

  return (
    <div className="space-y-1">
      {/* Barra de progreso */}
      <div className="h-2  bg-blue-100 rounded-full relative">
        {/* Barra de progreso completado */}
        <div
          className="absolute h-full bg-blue-200 rounded-full"
          style={{
            left: `${planned}%`,
            width: `${completed - planned}%`,
            display: completed > planned ? "block" : "none", // Ocultar si no hay diferencia entre completado y planificado
          }}
        />

        {/* Barra de progreso planificado */}
        <div
          className="absolute h-full bg-blue-400 rounded-full"
          style={{
            left: `${real}%`,
            width: `${planned - real}%`,
            display: planned > real ? "block" : "none", // Ocultar si no hay diferencia entre planificado y real
            zIndex: isRealOverPlanned ? 1 : 3, // Ajustar z-index según la condición
          }}
        />

        {/* Barra de progreso real */}
        <div
          className={`absolute h-full rounded-full ${isRealOverPlanned ? "bg-red-600" : "bg-blue-700"
            }`}
          style={{
            width: `${real}%`,
            zIndex: isRealOverPlanned ? 3 : 1, // Ajustar z-index según la condición
          }}
        />
      </div>

      {/* Etiquetas de porcentaje */}
      <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
        <span>{real}%</span>
        <span>{planned}%</span>
        <span>{completed}%</span>
      </div>

      {/* Bloque de etiquetas adicionales */}
      <div className="flex justify-between mt-2 text-sm">
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-1 ${isRealOverPlanned ? "bg-red-600" : "bg-blue-700"}`}
          />
          <span>Real</span>
          <span className="font-medium">{real}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-400" />
          <span>Planificado</span>
          <span className="font-medium">{planned}%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-200" />
          <span>Proyecto</span>
          <span className="font-medium">{completed}%</span>
        </div>
      </div>
    </div>
  );
}


export default ReginDetalles

