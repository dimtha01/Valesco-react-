"use client"

import { CiLogout } from "react-icons/ci"
import img from "../assets/mejora-removebg-preview 1.png"
import { useNavigate, useLocation } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "./AuthContext"

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useContext(AuthContext)

  const handleLogout = () => {
    logout()
    navigate("/", { replace: true })
  }

  return (
    <div className="flex items-center justify-between h-16 bg-[#f2f2f2] px-4 sm:px-6 lg:px-8 rounded-b-2xl shadow-md">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src={img || "/placeholder.svg"}
          alt="Logo"
          className="h-10 w-auto object-contain"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = "/placeholder.svg"
          }}
        />
      </div>

      {/* Botón de cierre de sesión */}
      {location.pathname !== "/" && (
        <button
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <CiLogout className="text-xl mr-2" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      )}
    </div>
  )
}

export default Header

