"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { UrlApi } from "../utils/utils"

const NuevoCliente = () => {
  const navigate = useNavigate()

  // Definir regiones como constante en lugar de obtenerlas del contexto
  const regiones = [
    { id: 2, nombre: "Occidente" },
    { id: 3, nombre: "Oriente" },
  ]

  const [selectedRegion, setSelectedRegion] = useState("")

  const [formData, setFormData] = useState({
    nombre: "",
    razon_social: "",
    nombre_comercial: "",
    direccion_fiscal: "",
    pais: "",
    id_region: "",
    unidad_negocio: "",
    email: "",
    telefono: "",
    direccion: "",
  })

  // Función para manejar el cambio de región
  const handleRegionChange = (e) => {
    const regionId = e.target.value
    setSelectedRegion(regionId)

    // Actualizar el id_region en el formulario
    setFormData((prev) => ({
      ...prev,
      id_region: regionId,
    }))
  }

  // Función para obtener el nombre de la región por ID
  const getRegionNameById = (regionId) => {
    const region = regiones.find((r) => r.id.toString() === regionId.toString())
    return region ? region.nombre : ""
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const requiredFields = ["nombre", "razon_social", "direccion_fiscal", "pais", "unidad_negocio"]
    const emptyFields = requiredFields.filter((field) => !formData[field])

    if (emptyFields.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: `Por favor, completa los siguientes campos obligatorios: ${emptyFields.join(", ")}`,
      })
      return
    }

    // Validate that we have a region
    if (!formData.id_region) {
      Swal.fire({
        icon: "error",
        title: "Error de región",
        text: "Por favor, seleccione una región para continuar.",
      })
      return
    }

    try {
      const response = await fetch(`${UrlApi}/api/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id_region: Number.parseInt(formData.id_region),
          nombre_comercial: formData.nombre_comercial || null,
          email: formData.email || null,
          telefono: formData.telefono || null,
          direccion: formData.direccion || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Cliente agregado:", formData)
        Swal.fire({
          icon: "success",
          title: "Cliente creado",
          text: "El cliente ha sido creado exitosamente.",
          showConfirmButton: false,
          timer: 1500,
        })
        // Redirect to create project page
        navigate("/InicioProcedimientoComercial/ProcedimientoComercial")
      } else {
        throw new Error(data.message || "Error al crear el cliente")
      }
    } catch (error) {
      console.error("Error al crear el cliente:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado al intentar crear el cliente.",
      })
    }
  }

  return (
    <>
      <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul className="flex items-center space-x-2">
          <li>
            <Link
              to="/InicioProcedimientoComercial"
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
              Comercialización
            </Link>
          </li>
          <li>
            <Link
              to="/InicioProcedimientoComercial/ProcedimientoComercial"
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
              Procedimiento Comercial
            </Link>
          </li>
          <li>Nuevo Cliente</li>
        </ul>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tarjeta de región seleccionada con diseño mejorado */}
        <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Región seleccionada</h2>
              <p className="text-blue-700 font-medium mt-1">
                {getRegionNameById(selectedRegion) || "Seleccione una región"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto p-6">
          <h3 className="font-bold text-2xl mb-6">Registrar Nuevo Cliente</h3>

          <form onSubmit={handleSubmit}>
            {/* Región - Como selector */}
            <div className="form-control w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-blue-500"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  Región
                </span>
              </label>
              <select
                name="id_region"
                value={formData.id_region}
                onChange={(e) => {
                  handleChange(e)
                  handleRegionChange(e)
                }}
                className="select select-bordered w-full h-12 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                required
              >
                <option value="">Seleccionar región</option>
                {regiones.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.nombre}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-2">Seleccione la región a la que pertenecerá este cliente.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Nombre</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  className="input input-bordered w-full"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Razón Social</span>
                </label>
                <input
                  type="text"
                  name="razon_social"
                  placeholder="Razón Social"
                  className="input input-bordered w-full"
                  value={formData.razon_social}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Nombre Comercial</span>
                </label>
                <input
                  type="text"
                  name="nombre_comercial"
                  placeholder="Nombre Comercial"
                  className="input input-bordered w-full"
                  value={formData.nombre_comercial}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Dirección Fiscal</span>
                </label>
                <input
                  type="text"
                  name="direccion_fiscal"
                  placeholder="Dirección Fiscal"
                  className="input input-bordered w-full"
                  value={formData.direccion_fiscal}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">País</span>
                </label>
                <input
                  type="text"
                  name="pais"
                  placeholder="País"
                  className="input input-bordered w-full"
                  value={formData.pais}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Unidad de Negocio</span>
                </label>
                <input
                  type="text"
                  name="unidad_negocio"
                  placeholder="Unidad de Negocio"
                  className="input input-bordered w-full"
                  value={formData.unidad_negocio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="input input-bordered w-full"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Teléfono</span>
                </label>
                <input
                  type="text"
                  name="telefono"
                  placeholder="Teléfono"
                  className="input input-bordered w-full"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Dirección</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Dirección"
                  className="input input-bordered w-full"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className="btn px-16 py-3 text-lg rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Crear Cliente
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default NuevoCliente
