"use client"

import { createContext, useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

export const AuthContext = createContext()

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/login", "/register", "/forgot-password"]

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const [permissionEdit, setPermissionEdit] = useState(false)
  const [userRegion, setUserRegion] = useState(null)
  const [loading, setLoading] = useState(true) // Inicialmente en carga
  const [user, setUser] = useState(null)
  const [initialCheckDone, setInitialCheckDone] = useState(false) // Nueva bandera para controlar la verificación inicial
  const navigate = useNavigate()
  const location = useLocation()

  // API base URL
  const API_URL = "http://localhost:3000/api"

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      // Guardar la ruta actual antes de cualquier redirección
      const currentPath = location.pathname
      localStorage.setItem("lastPath", currentPath)

      const token = localStorage.getItem("authToken")

      if (token) {
        try {
          // Verificar si el token es válido haciendo una petición al endpoint de perfil
          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          })

          if (response.ok) {
            try {
              const data = await response.json()

              if (data.success && data.user) {
                // Si el token es válido, establecer el estado de autenticación
                setIsAuthenticated(true)
                setUserRole(data.user.role)
                setPermissionEdit(data.user.permissionEdit)
                setUserRegion(data.user.region || null)
                setUser(data.user)
              } else {
                // Si hay algún problema con la respuesta, limpiar el token
                handleAuthFailure()
              }
            } catch (jsonError) {
              console.error("Error parsing JSON:", jsonError)
              handleAuthFailure()
            }
          } else {
            // Si la respuesta no es exitosa, limpiar el token
            handleAuthFailure()
          }
        } catch (error) {
          console.error("Error verificando autenticación:", error)
          handleAuthFailure()
        } finally {
          // Siempre establecer loading a false al finalizar
          setLoading(false)
          setInitialCheckDone(true) // Marcar que la verificación inicial está completa
        }
      } else {
        // No hay token, el usuario no está autenticado
        setIsAuthenticated(false)
        setUserRole(null)
        setPermissionEdit(false)
        setUserRegion(null)
        setUser(null)
        setLoading(false)
        setInitialCheckDone(true) // Marcar que la verificación inicial está completa
      }
    }

    checkAuth()
  }, [location.pathname]) // Añadir location.pathname como dependencia para detectar cambios de ruta

  // Función para manejar fallos de autenticación
  const handleAuthFailure = () => {
    localStorage.removeItem("authToken")
    setIsAuthenticated(false)
    setUserRole(null)
    setPermissionEdit(false)
    setUserRegion(null)
    setUser(null)
  }

  // IMPORTANTE: Modificado para evitar redirecciones durante la carga y mantener la página actual
  useEffect(() => {
    // No hacer nada si todavía está cargando o si la verificación inicial no ha terminado
    if (loading || !initialCheckDone) {
      return
    }

    const isPublicRoute = publicRoutes.some((route) => location.pathname.startsWith(route))
    const isRootRoute = location.pathname === "/"

    // Solo redirigir si no está autenticado y no está en una ruta pública
    if (!isAuthenticated && !isPublicRoute && !isRootRoute) {
      // Guardar la ruta actual antes de redirigir al login
      localStorage.setItem("lastPath", location.pathname)
      navigate("/login", { replace: true })
      return
    }

    // Solo redirigir si está autenticado, está en una ruta pública o en la raíz,
    // y no es una recarga de página (verificamos si la ruta actual coincide con la última guardada)
    if (isAuthenticated && (isPublicRoute || isRootRoute)) {
      const lastPath = localStorage.getItem("lastPath")

      // Si hay una ruta guardada y no es una ruta pública, redirigir a esa ruta
      if (lastPath && !publicRoutes.some((route) => lastPath.startsWith(route)) && lastPath !== "/") {
        navigate(lastPath, { replace: true })
      } else {
        // Si no hay ruta guardada o es una ruta pública, redirigir a la página de inicio según el rol
        redirectToUserHomePage()
      }
    }
  }, [isAuthenticated, loading, initialCheckDone, location.pathname, navigate, userRole])

  // Función para redirigir al usuario a su página de inicio según su rol
  const redirectToUserHomePage = () => {
    if (!userRole) return

    switch (userRole) {
      case "planificador":
        navigate("/InicioPlanificador", { replace: true })
        break
      case "direccion":
        navigate("/GestionGerencia", { replace: true })
        break
      case "gestion":
        navigate("/InicioGestion", { replace: true })
        break
      case "administrador":
        navigate("/InicioAdministrador", { replace: true })
        break
      case "procura":
        navigate("/InicioProcura", { replace: true })
        break
      default:
        navigate("/", { replace: true })
    }
  }

  // Función para iniciar sesión
  const login = async (role, canEdit, region = null, userData = {}) => {
    setIsAuthenticated(true)
    setUserRole(role)
    setPermissionEdit(canEdit)
    setUserRegion(region)
    setUser(userData)

    // Verificar si hay una ruta guardada para redirigir después del login
    const lastPath = localStorage.getItem("lastPath")
    if (lastPath && !publicRoutes.some((route) => lastPath.startsWith(route)) && lastPath !== "/") {
      navigate(lastPath, { replace: true })
    } else {
      // Si no hay ruta guardada, redirigir a la página de inicio según el rol
      redirectToUserHomePage()
    }
  }

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("lastPath") // Limpiar la última ruta al cerrar sesión
    setIsAuthenticated(false)
    setUserRole(null)
    setPermissionEdit(false)
    setUserRegion(null)
    setUser(null)
    navigate("/login", { replace: true })
  }

  // Función para verificar si el token está por expirar y renovarlo si es necesario
  const checkTokenExpiration = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      // Decodificar el token para verificar su expiración
      const tokenParts = token.split(".")
      if (tokenParts.length !== 3) return

      const payload = JSON.parse(atob(tokenParts[1]))
      const expirationTime = payload.exp * 1000 // Convertir a milisegundos
      const currentTime = Date.now()

      // Si el token expira en menos de 5 minutos, intentar renovarlo
      if (expirationTime - currentTime < 5 * 60 * 1000) {
        console.log("Token por expirar, se debería renovar")
        // Aquí implementarías la lógica para renovar el token
      }
    } catch (error) {
      console.error("Error al verificar expiración del token:", error)
    }
  }

  // Verificar periódicamente si el token está por expirar
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(checkTokenExpiration, 60000) // Verificar cada minuto
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        permissionEdit,
        userRegion,
        loading, // Importante: exponer el estado de carga
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
