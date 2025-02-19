"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FiDollarSign, FiShoppingCart, FiCheckCircle, FiUsers } from "react-icons/fi"
import { UrlApi } from "../utils/utils"

const GestionGerencia = () => {
  const [regiones, setRegiones] = useState([])
  const [estatus, setEstatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [costoTotal, setCostoTotal] = useState(0)
  const [rentabilidad, setRentabilidad] = useState(0)

  const fetchRegiones = async () => {
    try {
      const response = await fetch(`${UrlApi}/api/regiones`)
      if (!response.ok) {
        throw new Error(`Error al cargar las regiones: ${response.statusText}`)
      }
      const data = await response.json()
      setRegiones(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEstatus = async () => {
    try {
      const response = await fetch(`${UrlApi}/api/estatus`)
      if (!response.ok) {
        throw new Error(`Error al cargar los estatus: ${response.statusText}`)
      }
      const data = await response.json()
      setEstatus(data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchRegiones()
    fetchEstatus()
    fetchCostoYRentabilidad()
  }, [])

  const fetchCostoYRentabilidad = async () => {
    try {
      const response = await fetch(`${UrlApi}/api/costo-rentabilidad`)
      if (!response.ok) {
        throw new Error(`Error al cargar costo y rentabilidad: ${response.statusText}`)
      }
      const data = await response.json()
      setCostoTotal(data.costo_total)
      setRentabilidad(data.rentabilidad)
    } catch (error) {
      console.error(error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount)
  }
  const Card = ({ title, amount, icon: Icon, color, percentage, link, total_proyectos }) => (
    <Link to={link} className="group">
      <div className="bg-gray-50 rounded-lg p-5 shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300 w-full max-w-sm border border-gray-200">
        <div
          className={`w-10 h-10 ${color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-5 h-5 text-gray-800" />
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900">{formatCurrency(amount)}</h3>
          <p className="text-base font-medium text-gray-600">{title}</p>
          {percentage && (
            <p className={`text-sm font-medium ${percentage >= 0 ? "text-green-600" : "text-red-600"}`}>
              {percentage >= 0 ? "↑" : "↓"} {Math.abs(percentage)}% desde ayer
            </p>
          )}
          {total_proyectos && <p className="text-sm font-medium text-gray-600">{total_proyectos} proyectos</p>}
        </div>
      </div>
    </Link>
  )

  return (
    <>
      <div className="breadcrumbs text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul>
          <li>
            <Link to="/GestionGerencia" className="flex items-center hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="h-6 w-6 stroke-current mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Gestion Gerencial
            </Link>
          </li>
        </ul>
      </div>

      <main className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8">
        <div className="px-4 py-1 sm:px-0">
          {/* <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Gerencia</h1> */}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Resumen de Estados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
              <Link to="" className="flex justify-center">
                <div className="bg-gray-50 rounded-lg p-5 shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300 w-full max-w-sm border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FiDollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                      {formatCurrency(estatus.find((e) => e.nombre_estatus === "Facturado")?.suma_montos || 0)}
                    </h3>
                    <p className="text-base font-medium text-gray-600">Facturado</p>
                    <p className="text-sm font-medium text-green-600">
                      {estatus.find((e) => e.nombre_estatus === "Facturado")?.porcentaje_cambio || 0}% desde ayer
                    </p>
                  </div>
                </div>
              </Link>
              <Link to="" className="flex justify-center">
                <div className="bg-gray-50 rounded-lg p-5 shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300 w-full max-w-sm border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FiShoppingCart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                      {formatCurrency(estatus.find((e) => e.nombre_estatus === "Por Facturar")?.suma_montos || 0)}
                    </h3>
                    <p className="text-base font-medium text-gray-600">Por Facturar</p>
                    <p className="text-sm font-medium text-blue-600">
                      {estatus.find((e) => e.nombre_estatus === "Por Facturar")?.porcentaje_cambio || 0}% desde ayer
                    </p>
                  </div>
                </div>
              </Link>
              <Link to="" className="flex justify-center">
                <div className="bg-gray-50 rounded-lg p-5 shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300 w-full max-w-sm border border-gray-200">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                    <FiCheckCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                      {formatCurrency(estatus.find((e) => e.nombre_estatus === "Por Valuar")?.suma_montos || 0)}
                    </h3>
                    <p className="text-base font-medium text-gray-600">Por Valuar</p>
                    <p className="text-sm font-medium text-yellow-600">
                      {estatus.find((e) => e.nombre_estatus === "Por Valuar")?.porcentaje_cambio || 0}% desde ayer
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Regiones</h2>
            {loading ? (
              <p className="text-center col-span-full text-gray-600 text-base">Cargando regiones...</p>
            ) : regiones.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                {regiones.map((region) => (
                  <Link key={region.id} to={`/GestionGerencia/${region.nombre_region}`} className="flex justify-center">
                    <div className="bg-gray-50 rounded-lg p-5 shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-300 w-full max-w-sm border border-gray-200">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <FiUsers className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                          {formatCurrency(region.total_monto_ofertado)}
                        </h3>
                        <p className="text-base font-medium text-gray-600">{region.nombre_region}</p>
                        <p className="text-sm font-medium text-indigo-600">{region.total_proyectos} proyectos</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center col-span-full text-gray-600 text-base">No hay regiones disponibles.</p>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 flex gap-4">
        <div className="bg-white rounded-lg p-4 shadow-lg w-40 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Plan</h3>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(costoTotal)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-lg w-40 border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Real</h3>
          <p className="text-lg font-bold text-green-600">{formatCurrency(rentabilidad)}</p>
        </div>
      </div>
    </>
  )
}

export default GestionGerencia

