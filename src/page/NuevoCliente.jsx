"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { UrlApi } from "../utils/utils"

const NuevoCliente = () => {
  const navigate = useNavigate()
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

  const regiones = [
    { id: 1, nombre: "Centro" },
    { id: 2, nombre: "Occidente" },
    { id: 3, nombre: "Oriente" },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const requiredFields = ["nombre", "razon_social", "direccion_fiscal", "pais", "id_region", "unidad_negocio"]
    const emptyFields = requiredFields.filter((field) => !formData[field])

    if (emptyFields.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Campos incompletos",
        text: `Por favor, completa los siguientes campos obligatorios: ${emptyFields.join(", ")}`,
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
        navigate("/InicioPlanificador/CrearProyecto")
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
          <li>
            <Link
              to="/InicioPlanificador/CrearProyecto"
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
              Crear Proyecto
            </Link>
          </li>
          <li>
            <span className="flex items-center">
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
              Nuevo Cliente
            </span>
          </li>
        </ul>
      </div>
      <div>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto mt-6 p-6">
          <h3 className="font-bold text-2xl mb-6">Registrar Nuevo Cliente</h3>
          <form onSubmit={handleSubmit}>
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
                  <span className="label-text">Región</span>
                </label>
                <select
                  name="id_region"
                  className="select select-bordered w-full"
                  value={formData.id_region}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una región</option>
                  {regiones.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.nombre}
                    </option>
                  ))}
                </select>
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
              <button type="submit" className="btn btn-primary w-full">
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

