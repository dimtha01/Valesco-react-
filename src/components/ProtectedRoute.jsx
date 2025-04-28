"use client"

import { useContext } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { AuthContext } from "./AuthContext"

// Componente para proteger rutas que requieren autenticación
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext)
  const location = useLocation()

  // Guardar la ruta actual para redirigir después del login
  if (!isAuthenticated && !loading) {
    localStorage.setItem("lastPath", location.pathname)
  }

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Si está autenticado, mostrar el contenido protegido
  return children
}

export default ProtectedRoute
