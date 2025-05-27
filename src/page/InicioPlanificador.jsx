"use client"

import { useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../components/AuthContext"

const InicioPlanificador = () => {
  const { permissionEdit } = useContext(AuthContext)
  console.log(permissionEdit)

  return (
    <>
      {/* Breadcrumbs */}
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
        </ul>
      </div>

      {/* Contenedor principal */}
      <div className="container mt-8 px-4 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="grid grid-cols-4 gap-4 justify-items-start">

          {/* <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 w-full max-w-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="bg-green-500 rounded-2xl p-4 shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">Nuevo</span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Usuarios</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Administra usuarios del sistema y asigna proyectos de manera eficiente
            </p>

            <Link
              to="/InicioPlanificador/GestionUsuariosAdministracionContratos"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Gestionar Usuarios
            </Link>
          </div> */}

          {/* Gestión de Proyectos Card */}
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 w-full max-w-sm">
            {/* Header con icono y badge */}
            <div className="flex items-start justify-between mb-6">
              <div className="bg-blue-500 rounded-2xl p-4 shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span className="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">Activo</span>
            </div>

            {/* Contenido */}
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Proyectos</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">Administra y actualiza todos los proyectos del sistema</p>

            {/* Botón */}
            <Link
              to="/InicioPlanificador/Proyecto"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Gestionar Proyectos
            </Link>
          </div>

          {/* Módulo Especial (Solo para usuarios con permisos) */}
          {permissionEdit && (
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 w-full max-w-sm">
              {/* Header con icono y badge */}
              <div className="flex items-start justify-between mb-6">
                <div className="bg-purple-500 rounded-2xl p-4 shadow-md">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <span className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
                  Exclusivo
                </span>
              </div>

              {/* Contenido */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Módulo Avanzado</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Accede a funciones exclusivas y herramientas avanzadas del sistema
              </p>

              {/* Botón */}
              <Link
                to="/InicioPlanificador/TercerProyecto"
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Acceder al Módulo
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default InicioPlanificador
