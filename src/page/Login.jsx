"use client"

import { useState, useContext, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import img from "../assets/image 3.png"
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa" // Añadido íconos adicionales
import { ClipLoader } from "react-spinners"
import { AuthContext } from "../components/AuthContext"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  // Efecto para validación en tiempo real después del primer envío
  useEffect(() => {
    if (formSubmitted) {
      validateForm()
    }
  }, [formSubmitted])

  // Función de validación
  const validateForm = () => {
    if (!email) {
      setError("El correo electrónico es obligatorio")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Ingrese un correo electrónico válido")
      return false
    }

    if (!password) {
      setError("La contraseña es obligatoria")
      return false
    }

    setError("")
    return true
  }

  // Simulación de usuarios en la base de datos
  const users = [
    {
      email: "manuelviera-oriente@business.com",
      password: "manuel2025",
      role: "planificador",
      permissionEdit: false,
      region: "Oriente",
    },
    {
      email: "Luisvasquez-occidente@business.com",
      password: "luis2025",
      role: "planificador",
      permissionEdit: false,
      region: "Occidente",

    },
    {
      email: "direccion@business.com",
      password: "direccion123",
      role: "direccion",
      permissionEdit: false,
    },
    {
      email: "mauricioesteves-gestion@business.com",
      password: "mauricio123",
      role: "gestion",
      permissionEdit: false,
    },
    {
      email: "israelnunez-gestion@business.com",
      password: "israel123",
      role: "gestion",
      permissionEdit: false,
    },
    {
      email: "jesusgarcia-administrador@business.com",
      password: "jesus123",
      role: "administrador",
      permissionEdit: true,
    },
    {
      email: "procura@business.com",
      password: "procura123",
      role: "procura",
      permissionEdit: true,
    },
    {
      email: "procura@business.com",
      password: "procura123",
      role: "procura",
      permissionEdit: true,
    },
  ]

  // Función para manejar el inicio de sesión
  const handleLogin = async (e) => {
    e.preventDefault()
    setFormSubmitted(true)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simular una demora en la validación
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Buscar al usuario en la lista simulada
      const user = users.find((u) => u.email === email && u.password === password)

      if (user) {
        // Iniciar sesión y pasar el rol, permiso de edición y región del usuario
        login(user.role, user.permissionEdit, user.region)

        // Redirigir según el rol del usuario
        if (user.role === "planificador") {
          navigate(`/InicioPlanificador/`)
        } else if (user.role === "direccion") {
          navigate("/GestionGerencia")
        } else if (user.role === "gestion") {
          navigate("/InicioGestion")
        } else if (user.role === "administrador") {
          navigate("/InicioAdministrador")
        }else if (user.role === "procura") {
          navigate("/InicioProcura")
        }
      } else {
        setError("Correo electrónico o contraseña incorrectos.")
      }
    } catch (err) {
      setError("Ocurrió un error al iniciar sesión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row">
        {/* Imagen - Oculta en móvil, visible en md y superior */}
        <div className="md:w-1/2 hidden md:block relative">
          <img className="w-full h-full object-cover" src={img || "/placeholder.svg"} alt="Login" />
          <div className="absolute inset-0 bg-blue-900/20 flex items-center justify-center">
            <div className="text-white text-center p-6 bg-blue-900/60 backdrop-blur-sm rounded-lg">
              <h1 className="text-3xl font-bold mb-2">Bienvenido a Valesco</h1>
              <p className="text-lg">Sistema de gestión de proyectos</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col justify-center">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900">Iniciar sesión</h2>
            <p className="text-sm text-gray-600 mt-2">Ingresa tus credenciales para acceder al sistema</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded animate-pulse">
              <p className="text-sm flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  className={`pl-10 w-full p-3 border ${formSubmitted && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } rounded-lg transition-all duration-200`}
                  type="email"
                  name="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-invalid={formSubmitted && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))}
                  aria-describedby="email-error"
                />
              </div>
              {formSubmitted && !email && (
                <p id="email-error" className="text-red-500 text-xs mt-1">
                  El correo electrónico es obligatorio
                </p>
              )}
              {formSubmitted && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                <p id="email-error" className="text-red-500 text-xs mt-1">
                  Ingrese un correo electrónico válido
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  className={`pl-10 w-full p-3 border ${formSubmitted && !password
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } rounded-lg transition-all duration-200`}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-invalid={formSubmitted && !password}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {formSubmitted && !password && (
                <p id="password-error" className="text-red-500 text-xs mt-1">
                  La contraseña es obligatoria
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 text-white font-medium rounded-lg p-3 text-center flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ClipLoader color="#ffffff" size={20} className="mr-2" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Problemas para iniciar sesión?{" "}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Contactar soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login

