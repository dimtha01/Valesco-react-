"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import showNotification, { UrlApi } from "../utils/utils"
import NuevoCliente from "./NuevoCliente"

const CrearProyecto = () => {
  const [numero, setNumero] = useState("")
  const [nombre, setNombre] = useState("")
  const [idCliente, setIdCliente] = useState("")
  const [idResponsable, setIdResponsable] = useState(2) // Fijo como 2
  const [idRegion, setIdRegion] = useState("")
  const [costoEstimado, setCostoEstimado] = useState("")
  const [montoOfertado, setMontoOfertado] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFinal, setFechaFinal] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const navigate = useNavigate()

  const closeModal = () => setIsModalOpen(false)

  // Estado para los clientes cargados desde la API
  const [clientes, setClientes] = useState([])

  // Función para cargar los clientes desde la API
  const fetchClientes = async () => {
    try {
      const response = await fetch(`${UrlApi}/api/clientes`)
      if (!response.ok) {
        throw new Error(`Error al cargar los datos: ${response.statusText}`)
      }
      const data = await response.json()
      setClientes(data || []) // Asegúrate de que sea un array
    } catch (err) {
      console.error(err)
      showNotification("error", "Error", "Ocurrió un error al cargar los clientes.")
    }
  }

  // Usar useEffect para cargar los datos cuando el componente se monta
  useEffect(() => {
    fetchClientes()
  }, []) // Removed UrlApi as a dependency

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault() // Evitar el comportamiento predeterminado del formulario

    // Validar que todos los campos estén completos
    if (
      !numero ||
      !nombre ||
      !idCliente ||
      !idRegion ||
      !costoEstimado ||
      !montoOfertado ||
      !fechaInicio ||
      !fechaFinal
    ) {
      showNotification("warning", "Campos Incompletos", "Por favor, completa todos los campos.")
      return
    }

    // Validar que la fecha de inicio sea menor que la fecha de finalización
    if (new Date(fechaInicio) >= new Date(fechaFinal)) {
      showNotification("error", "Fechas Inválidas", "La fecha de inicio debe ser menor que la fecha de finalización.")
      return
    }

    // Validar que los valores numéricos sean válidos
    if (isNaN(Number.parseInt(idCliente))) {
      showNotification("error", "Cliente Inválido", "El ID del cliente debe ser un número válido.")
      return
    }
    if (isNaN(Number.parseInt(idRegion))) {
      showNotification("error", "Región Inválida", "El ID de la región debe ser un número válido.")
      return
    }
    if (isNaN(Number.parseFloat(costoEstimado)) || Number.parseFloat(costoEstimado) <= 0) {
      showNotification("error", "Costo Estimado Inválido", "El costo estimado debe ser un número positivo.")
      return
    }
    if (isNaN(Number.parseFloat(montoOfertado)) || Number.parseFloat(montoOfertado) <= 0) {
      showNotification("error", "Monto Ofertado Inválido", "El monto ofertado debe ser un número positivo.")
      return
    }

    // Crear el objeto con los datos del formulario
    const nuevoProyecto = {
      numero,
      nombre,
      idCliente: Number.parseInt(idCliente),
      idResponsable: Number.parseInt(idResponsable),
      idRegion: Number.parseInt(idRegion),
      costoEstimado: Number.parseFloat(costoEstimado),
      montoOfertado: Number.parseFloat(montoOfertado),
      fechaInicio,
      fechaFinal,
    }

    console.log("Datos enviados:", nuevoProyecto) // Depuración

    try {
      // Enviar los datos a la API
      const response = await fetch(`${UrlApi}/api/proyectos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoProyecto),
      })

      // Verificar si la respuesta no es exitosa
      if (!response.ok) {
        const errorData = await response.json() // Obtener detalles del error desde la API
        throw new Error(errorData.message || "Ocurrió un error desconocido al crear el proyecto.")
      }

      const data = await response.json()

      // Mostrar notificación de éxito
      showNotification("success", "Proyecto Creado", "El proyecto ha sido creado correctamente.")
      navigate("/InicioPlanificador")

      // Limpiar los campos del formulario
      setNumero("")
      setNombre("")
      setIdCliente("")
      setIdRegion("")
      setCostoEstimado("")
      setMontoOfertado("")
      setFechaInicio("")
      setFechaFinal("")

      console.log("Proyecto creado:", data)
    } catch (error) {
      console.error(error)

      // Mostrar el mensaje de error específico de la API
      showNotification("error", "Error al Crear el Proyecto", error.message)
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
        </ul>
      </div>

      <div className="flex justify-center mt-3">
        <div className="p-6 rounded-lg w-full max-w-4xl bg-white shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título del formulario */}
            <h2 className="text-2xl font-bold text-center text-gray-800">Crear Proyecto</h2>

            {/* Grid de campos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Campo: Número */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-700">Número</span>
                </label>
                <input
                  type="text"
                  name="numero"
                  placeholder="Número"
                  className="input input-bordered w-full bg-gray-100 text-gray-800 focus:bg-white focus:border-blue-500 transition-colors"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                />
              </div>

              {/* Campo: Nombre */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-700">Nombre</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  className="input input-bordered w-full bg-gray-100 text-gray-800 focus:bg-white focus:border-blue-500 transition-colors"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              {/* Campo: Cliente */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-700">Cliente</span>
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    name="idCliente"
                    className="select select-bordered w-full bg-gray-100 text-gray-800 focus:bg-white focus:border-blue-500 transition-colors"
                    value={idCliente}
                    onChange={(e) => setIdCliente(e.target.value)}
                  >
                    <option value="">Seleccionar Cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre}
                      </option>
                    ))}
                  </select>
                  <Link type="button" to="/InicioPlanificador/CrearProyecto/crearCliente" className="btn btn-primary">
                    +
                  </Link>
                </div>
              </div>

              {/* Campo: Región */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-700">Región</span>
                </label>
                <select
                  name="idRegion"
                  className="select select-bordered w-full bg-gray-100 text-gray-800 focus:bg-white focus:border-blue-500 transition-colors"
                  value={idRegion}
                  onChange={(e) => setIdRegion(e.target.value)}
                >
                  <option value="">Seleccionar Región</option>
                  <option value="1">Centro</option>
                  <option value="2">Occidente</option>
                  <option value="3">Oriente</option>
                </select>
              </div>

              {/* Campo: Costo Estimado */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-700">Costo Estimado</span>
                </label>
                <input
                  type="number"
                  name="costoEstimado"
                  placeholder="Costo Estimado"
                  className="input input-bordered w-full bg-gray-100 text-gray-800 focus:bg-white focus:border-blue-500 transition-colors"
                  value={costoEstimado}
                  onChange={(e) => setCostoEstimado(e.target.value)}
                />
              </div>

              {/* Campo: Monto Ofertado */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-700">Monto Ofertado</span>
                </label>
                <input
                  type="number"
                  name="montoOfertado"
                  placeholder="Monto Ofertado"
                  className="input input-bordered w-full bg-gray-100 text-gray-800 focus:bg-white focus:border-blue-500 transition-colors"
                  value={montoOfertado}
                  onChange={(e) => setMontoOfertado(e.target.value)}
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-700">Fecha de Inicio</span>
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  className="input input-bordered w-full bg-gray-100 text-gray-800 focus:bg-white focus:border-blue-500 transition-colors"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-gray-700">Fecha Final</span>
                </label>
                <input
                  type="date"
                  name="fechaFinal"
                  className="input input-bordered w-full bg-gray-100 text-gray-800 focus:bg-white focus:border-blue-500 transition-colors"
                  value={fechaFinal}
                  onChange={(e) => setFechaFinal(e.target.value)}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <button
                type="submit"
                className="btn btn-primary w-full sm:w-auto px-6 py-2 rounded-md text-white font-medium transition-colors hover:bg-blue-600"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default CrearProyecto

