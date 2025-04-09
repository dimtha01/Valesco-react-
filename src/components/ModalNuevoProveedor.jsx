"use client"

import { useState } from "react"
import Swal from "sweetalert2"

const ModalNuevoProveedor = ({ onClose, onProveedorCreado, urlApi }) => {
  const [formData, setFormData] = useState({
    nombre_comercial: "",
    direccion_fiscal: "",
    pais: "",
    telefono: "",
    email: "",
    RIF: "",
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))

    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar nombre comercial
    if (!formData.nombre_comercial.trim()) {
      newErrors.nombre_comercial = "El nombre comercial es obligatorio"
    }

    // Validar dirección fiscal
    if (!formData.direccion_fiscal.trim()) {
      newErrors.direccion_fiscal = "La dirección fiscal es obligatoria"
    }

    // Validar país
    if (!formData.pais.trim()) {
      newErrors.pais = "El país es obligatorio"
    }

    // Validar teléfono (formato básico)
    if (formData.telefono && !/^[+]?[\d\s()-]{8,15}$/.test(formData.telefono)) {
      newErrors.telefono = "Formato de teléfono inválido"
    }

    // Validar email (si se proporciona)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de email inválido"
    }

    // Validar RIF (formato venezolano: J-12345678-9)
    if (!formData.RIF.trim()) {
      newErrors.RIF = "El RIF es obligatorio"
    } else if (!/^[JGVEP]-\d{8}-\d{1}$/.test(formData.RIF)) {
      newErrors.RIF = "Formato de RIF inválido (ej: J-12345678-9)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const response = await fetch(`${urlApi}/api/proveedores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Proveedor creado",
          text: "El proveedor ha sido creado exitosamente.",
          showConfirmButton: false,
          timer: 1500,
        })

        // Notificar al componente padre sobre el nuevo proveedor
        onProveedorCreado(data)
      } else {
        throw new Error(data.message || "Error al crear el proveedor")
      }
    } catch (error) {
      console.error("Error al crear el proveedor:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado al intentar crear el proveedor.",
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-2xl">Creación de Proveedores</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre Comercial */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Nombre Empresa</span>
                </label>
                <input
                  type="text"
                  name="nombre_comercial"
                  placeholder="Nombre Comercial"
                  className={`input input-bordered w-full ${errors.nombre_comercial ? "input-error" : ""}`}
                  value={formData.nombre_comercial}
                  onChange={handleChange}
                />
                {errors.nombre_comercial && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.nombre_comercial}</span>
                  </label>
                )}
              </div>

              {/* Dirección Fiscal */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Dirección Fiscal</span>
                </label>
                <input
                  type="text"
                  name="direccion_fiscal"
                  placeholder="Dirección Fiscal"
                  className={`input input-bordered w-full ${errors.direccion_fiscal ? "input-error" : ""}`}
                  value={formData.direccion_fiscal}
                  onChange={handleChange}
                />
                {errors.direccion_fiscal && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.direccion_fiscal}</span>
                  </label>
                )}
              </div>

              {/* País */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">País</span>
                </label>
                <input
                  type="text"
                  name="pais"
                  placeholder="País"
                  className={`input input-bordered w-full ${errors.pais ? "input-error" : ""}`}
                  value={formData.pais}
                  onChange={handleChange}
                />
                {errors.pais && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.pais}</span>
                  </label>
                )}
              </div>

              {/* Teléfono */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Teléfono</span>
                </label>
                <input
                  type="text"
                  name="telefono"
                  placeholder="Teléfono"
                  className={`input input-bordered w-full ${errors.telefono ? "input-error" : ""}`}
                  value={formData.telefono}
                  onChange={handleChange}
                />
                {errors.telefono && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.telefono}</span>
                  </label>
                )}
              </div>

              {/* Email */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={`input input-bordered w-full ${errors.email ? "input-error" : ""}`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.email}</span>
                  </label>
                )}
              </div>

              {/* RIF */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">RIF</span>
                </label>
                <input
                  type="text"
                  name="RIF"
                  placeholder="J-12345678-9"
                  className={`input input-bordered w-full ${errors.RIF ? "input-error" : ""}`}
                  value={formData.RIF}
                  onChange={handleChange}
                />
                {errors.RIF && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.RIF}</span>
                  </label>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button type="button" className="btn btn-outline mr-2" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary px-12">
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModalNuevoProveedor

