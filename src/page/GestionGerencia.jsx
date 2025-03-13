"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  FiDollarSign,
  FiShoppingCart,
  FiCheckCircle,
  FiUsers,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiMapPin,
  FiActivity,
  FiTarget,
  FiInfo,
} from "react-icons/fi"
import { UrlApi } from "../utils/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts"

const GestionGerencia = () => {
  const [regiones, setRegiones] = useState([])
  const [estatus, setEstatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [costoTotal, setCostoTotal] = useState(0)
  const [rentabilidad, setRentabilidad] = useState(0)
  const [viewMode, setViewMode] = useState("normal") // "normal" or "graph"
  const [animate, setAnimate] = useState(false)
  const [previousViewMode, setPreviousViewMode] = useState(null)
  const [showUnitsInfo, setShowUnitsInfo] = useState(false)

  // Colores exactos de la imagen
  const COLORS = {
    ofertado: "#1e5a7b", // Azul oscuro para "Ofertado"
    costoPlaneado: "#e67e22", // Naranja para "Costo Planificado"
    facturado: "#1e5a7b", // Azul oscuro para "Facturado"
    costoReal: "#e67e22", // Naranja para "Costo real"
    porValuar: "#4CAF50", // Verde para "Por valuar"
    porFacturar: "#e67e22", // Naranja para "Por facturar"
    facturadoMonto: "#1e5a7b", // Azul oscuro para "Facturado Monto"
    primary: "#015999", // Color primario corporativo
    secondary: "#e67e22", // Color secundario corporativo
    accent: "#4CAF50", // Color de acento
  }

  // Actualizar la función fetchRegiones para manejar correctamente la estructura de datos
  const fetchRegiones = async () => {
    try {
      const response = await fetch(`${UrlApi}/api/regiones`)
      if (!response.ok) {
        throw new Error(`Error al cargar las regiones: ${response.statusText}`)
      }
      const data = await response.json()
      setRegiones(data)
      console.log("Datos de regiones cargados:", data)
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

  // Efecto para animar cuando cambia el modo de vista
  useEffect(() => {
    if (previousViewMode !== null) {
      // Iniciar animación de salida
      setAnimate(true)

      // Dar tiempo para que la animación de salida se complete
      const timer = setTimeout(() => {
        setAnimate(false)
      }, 600) // Duración de la transición

      return () => clearTimeout(timer)
    } else {
      // Primera carga, no animar
      setPreviousViewMode(viewMode)
    }
  }, [viewMode])

  // Actualizar el modo de vista anterior cuando cambia el modo actual
  useEffect(() => {
    if (previousViewMode !== viewMode) {
      setPreviousViewMode(viewMode)
    }
  }, [viewMode, previousViewMode])

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
  const sumaTotal = estatus.reduce((acc, curr) => acc + Number.parseFloat(curr.suma_montos), 0)
  console.log(sumaTotal)

  // Función personalizada para formatear montos con unidades claras
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0"

    // Convertir a número si es string
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

    // Para números muy grandes (mil millones o más)
    if (Math.abs(numAmount) >= 1000000000) {
      const billions = (numAmount / 1000000000).toFixed(1)
      // Eliminar el .0 si es un número entero
      const formatted = billions.endsWith(".0") ? billions.slice(0, -2) : billions
      return `$${formatted} MM`
    }
    // Para millones
    else if (Math.abs(numAmount) >= 1000000) {
      const millions = (numAmount / 1000000).toFixed(1)
      // Eliminar el .0 si es un número entero
      const formatted = millions.endsWith(".0") ? millions.slice(0, -2) : millions
      return `$${formatted} M`
    }
    // Para miles
    else if (Math.abs(numAmount) >= 1000) {
      const thousands = (numAmount / 1000).toFixed(1)
      // Eliminar el .0 si es un número entero
      const formatted = thousands.endsWith(".0") ? thousands.slice(0, -2) : thousands
      return `$${formatted} K`
    }
    // Para números pequeños
    else {
      return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(numAmount)
    }
  }

  // Función para obtener el valor completo formateado (para tooltips)
  const getFullFormattedValue = (amount) => {
    if (amount === undefined || amount === null) return "$0"

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Preparar datos para gráficos
  // Actualizar la función getRegionData para usar correctamente los datos de la API
  const getRegionData = (regionName) => {
    if (!regiones.regiones)
      return {
        total_monto_ofertado: 0,
        total_costo_planificado: 0,
        total_costo_real: 0,
        total_proyectos: 0,
      }
    const region = regiones.regiones.find((r) => r.nombre_region === regionName)
    return (
      region || {
        total_monto_ofertado: 0,
        total_costo_planificado: 0,
        total_costo_real: 0,
        total_proyectos: 0,
      }
    )
  }

  // Actualizar la preparación de datos para los gráficos financieros
  const prepareFinancialPlanData = (title, region) => {
    const planValue = Number.parseFloat(region.total_costo_planificado || 0)
    const obtainedValue = Number.parseFloat(region.total_monto_ofertado || 0)
    const percentage = planValue > 0 ? ((obtainedValue / planValue) * 100).toFixed(2) : 0

    return {
      name: title,
      data: [
        { name: "Ofertado", value: obtainedValue, fill: COLORS.ofertado },
        { name: "Costo Planificado", value: planValue, fill: COLORS.costoPlaneado },
      ],
      percentage,
    }
  }

  // Update the prepareFinancialResultData function
  const prepareFinancialResultData = (title, region) => {
    const facturadoValue = estatus.find((e) => e.nombre_estatus === "Facturado")?.suma_montos || 0
    const realValue = Number.parseFloat(region.total_costo_real || 0)
    const percentage = realValue > 0 ? ((facturadoValue / realValue) * 100).toFixed(2) : 0

    return {
      name: title,
      data: [
        { name: "Facturado", value: facturadoValue, fill: COLORS.facturado },
        { name: "Costo real", value: realValue, fill: COLORS.costoReal },
      ],
      percentage,
    }
  }

  // Actualizar la función preparePieChartData para usar correctamente los datos de la API
  const preparePieChartData = () => {
    if (!estatus || estatus.length === 0) return []

    return estatus.map((item) => ({
      name:
        item.nombre_estatus === "Por Valuar"
          ? "Por valuar"
          : item.nombre_estatus === "Por Facturar"
            ? "Por facturar"
            : "Facturado",
      value: Number.parseFloat(item.suma_montos || 0),
      color:
        item.nombre_estatus === "Por Valuar"
          ? "#e67e22" // Naranja
          : item.nombre_estatus === "Por Facturar"
            ? "#4CAF50" // Verde
            : "#1e5a7b", // Azul oscuro
    }))
  }

  // Datos para gráficos financieros
  // Actualizar las variables que usan estos datos
  const orienteData = getRegionData("Oriente")
  const occidenteData = getRegionData("Occidente")
  const centroData = getRegionData("Centro")

  // Actualizar la preparación de datos para los gráficos
  const financialPlanTotal = {
    name: "Planificación financiera total",
    data: [
      {
        name: "Ofertado",
        value: regiones.regiones
          ? regiones.regiones.reduce((sum, region) => sum + Number.parseFloat(region.total_monto_ofertado || 0), 0)
          : 0,
        fill: COLORS.ofertado,
      },
      {
        name: "Costo Planificado",
        value: regiones.costo_planificado_total || 0,
        fill: COLORS.costoPlaneado,
      },
    ],
    percentage:
      regiones.costo_planificado_total > 0
        ? (
          ((regiones.regiones
            ? regiones.regiones.reduce((sum, region) => sum + Number.parseFloat(region.total_monto_ofertado || 0), 0)
            : 0) /
            regiones.costo_planificado_total) *
          100
        ).toFixed(2)
        : 0,
  }

  const financialPlanOriente = prepareFinancialPlanData("Planificación financiera Oriente", orienteData)
  const financialPlanOccidente = prepareFinancialPlanData("Planificación financiera Occidente", occidenteData)
  const financialPlanCentro = prepareFinancialPlanData("Planificación financiera Centro", centroData)

  // Update the financialResultTotal object to use estatus data for facturado
  const financialResultTotal = {
    name: "Resultado financiero total",
    data: [
      {
        name: "Facturado",
        value: estatus.find((e) => e.nombre_estatus === "Facturado")?.suma_montos || 0,
        fill: COLORS.facturado,
      },
      {
        name: "Costo real",
        value: regiones.costo_real_total || 0,
        fill: COLORS.costoReal,
      },
    ],
    percentage:
      regiones.costo_real_total > 0
        ? (
          ((estatus.find((e) => e.nombre_estatus === "Facturado")?.suma_montos || 0) / regiones.costo_real_total) *
          100
        ).toFixed(2)
        : 0,
  }

  const financialResultOriente = prepareFinancialResultData("Resultado financiero Oriente", orienteData)
  const financialResultOccidente = prepareFinancialResultData("Resultado financiero Occidente", occidenteData)
  const financialResultCentro = prepareFinancialResultData("Resultado financiero Centro", centroData)

  const pieChartData = preparePieChartData()

  // Toggle Switch Component
  const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  )

  // Función para obtener la clase de animación consistente para ambas transiciones
  const getAnimationClass = () => {
    if (animate) {
      return "scale-95 opacity-0 translate-y-4"
    }
    return "scale-100 opacity-100 translate-y-0"
  }

  // Función para obtener el retraso de transición consistente
  const getTransitionDelay = (index) => {
    // Usamos el mismo retraso base para ambas transiciones
    const baseDelay = 100
    const delay = baseDelay + index * 50
    return `${delay}ms`
  }

  // Componente de gráfico de barras
  const BarChartComponent = ({ title, data, percentage, index = 0 }) => (
    <div
      className={`bg-white rounded-xl p-6 shadow-md transition-all duration-700 transform ${getAnimationClass()} hover:shadow-lg`}
      style={{
        transitionDelay: getTransitionDelay(index),
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${Number.parseFloat(percentage) >= 100
            ? "bg-green-100 text-green-800"
            : Number.parseFloat(percentage) >= 75
              ? "bg-blue-100 text-blue-800"
              : "bg-amber-100 text-amber-800"
            }`}
        >
          {percentage}%
        </div>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 12 }} />
            <Tooltip
              formatter={(value) => getFullFormattedValue(value)}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            />
            {data.map((entry, idx) => (
              <Bar
                key={`bar-${idx}`}
                dataKey="value"
                fill={entry.fill}
                name={entry.name}
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
                isAnimationActive={true}
                animationBegin={idx * 200}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value) => formatCurrency(value)}
                  style={{
                    fill: "#666",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center">
          <FiActivity className="text-blue-600 mr-2" />
          <p className="text-sm text-gray-600">Costo Plan. vs Ofertado</p>
        </div>
      </div>
    </div>
  )

  // Modificar el componente PieChartComponent para aumentar la altura y mostrar la cantidad de proyectos
  const PieChartComponent = ({ data, index = 0 }) => (
    <div
      className={`bg-white rounded-xl p-6 shadow-md transition-all duration-700 transform ${getAnimationClass()} hover:shadow-lg`}
      style={{
        transitionDelay: getTransitionDelay(index + 3),
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Distribución de Montos por Estado</h3>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {data.length} estados
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="40%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-out"
              label={(entry) => formatCurrency(entry.value)}
              labelLine={false}
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => getFullFormattedValue(value)}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                padding: "8px",
              }}
            />
            <Legend
              align="right"
              verticalAlign="middle"
              layout="vertical"
              iconType="circle"
              wrapperStyle={{
                paddingLeft: "32px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // Componente de tarjeta de región
  const RegionCard = ({ region, amount, count, index = 0 }) => (
    <div
      className={`bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 w-full border border-gray-100 transform ${getAnimationClass()}`}
      style={{
        transitionDelay: getTransitionDelay(index + 5),
      }}
    >
      <div className="flex items-start">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 mr-4">
          <FiMapPin className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{region}</h3>
          <p className="text-sm text-gray-500 mb-3">Ofertado</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-indigo-600" title={getFullFormattedValue(amount)}>
              {formatCurrency(amount)}
            </p>
            <div className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full flex items-center">
              <FiUsers className="mr-1" /> {count} proyectos
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Título del informe - Versión moderna y atractiva */}
        <div className="mb-8 relative overflow-hidden rounded-lg shadow-lg">
          {/* Fondo con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#015999] to-[#1e88e5] opacity-90"></div>

          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            ></div>
          </div>

          {/* Contenido del título */}
          <div className="relative py-6 px-4 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white p-3 rounded-full mr-4 shadow-md">
                <FiBarChart2 className="h-8 w-8 text-[#015999]" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  INFORME EJECUTIVO DE PROYECTOS
                </h1>
                <p className="text-blue-100 mt-1 text-sm md:text-base">
                  Análisis financiero y seguimiento de proyectos
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <div className="bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full text-white text-sm flex items-center">
                <FiPieChart className="mr-2" /> Datos actualizados
              </div>
              <div className="bg-white/20 backdrop-blur-sm py-2 px-4 rounded-full text-white text-sm flex items-center">
                <FiTrendingUp className="mr-2" /> {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Línea decorativa inferior */}
          <div className="h-1 bg-gradient-to-r from-[#4CAF50] via-[#e67e22] to-[#1e88e5]"></div>
        </div>

        {/* Leyenda de unidades */}
        <div className="mb-6 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FiInfo className="text-blue-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-700">Leyenda de unidades:</h3>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-1">K</span>
                <span className="text-xs text-gray-500">= Miles</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-1">M</span>
                <span className="text-xs text-gray-500">= Millones</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900 mr-1">MM</span>
                <span className="text-xs text-gray-500">= Miles de millones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex justify-end mb-6">
          <label className="inline-flex items-center cursor-pointer bg-white px-4 py-2 rounded-full shadow-sm">
            <span className="mr-3 text-sm font-medium text-gray-900">
              {viewMode === "normal" ? "Vista Normal" : "Vista Gráficos"}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                value=""
                className="sr-only peer"
                checked={viewMode === "graph"}
                onChange={(e) => setViewMode(e.target.checked ? "graph" : "normal")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
        </div>

        <div className="relative">
          {/* Vista de gráficos */}
          {viewMode === "graph" ? (
            <div
              className={`transition-all duration-700 ease-in-out transform ${animate ? "scale-95 opacity-0 translate-y-4" : "scale-100 opacity-100 translate-y-0"
                }`}
            >
              <div className="space-y-6">
                {/* Primera fila - Planificación financiera */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <BarChartComponent
                    title="Planificación financiera total"
                    data={financialPlanTotal.data}
                    percentage={financialPlanTotal.percentage}
                    index={0}
                  />
                  <BarChartComponent
                    title="Planificación financiera Oriente"
                    data={financialPlanOriente.data}
                    percentage={financialPlanOriente.percentage}
                    index={1}
                  />
                  <BarChartComponent
                    title="Planificación financiera Occidente"
                    data={financialPlanOccidente.data}
                    percentage={financialPlanOccidente.percentage}
                    index={2}
                  />
                </div>

                {/* Segunda fila - Resultados financieros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BarChartComponent
                    title="Resultado financiero total"
                    data={financialResultTotal.data}
                    percentage={financialResultTotal.percentage}
                    index={3}
                  />
                  <PieChartComponent data={pieChartData} index={0} />
                </div>

                {/* Tercera fila - Resultados por región */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BarChartComponent
                    title="Resultado financiero Oriente"
                    data={financialResultOriente.data}
                    percentage={financialResultOriente.percentage}
                    index={4}
                  />
                  <BarChartComponent
                    title="Resultado financiero Occidente"
                    data={financialResultOccidente.data}
                    percentage={financialResultOccidente.percentage}
                    index={5}
                  />
                </div>

                {/* Cuarta fila - Tarjetas de región */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-52">
                  {regiones.regiones &&
                    regiones.regiones
                      .filter((region) => region.nombre_region !== "Centro")
                      .map((region, idx) => (
                        <RegionCard
                          key={region.nombre_region}
                          region={region.nombre_region}
                          amount={Number.parseFloat(region.total_monto_ofertado)}
                          count={region.total_proyectos.toString()}
                          index={idx}
                        />
                      ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`transition-all duration-700 ease-in-out transform ${animate ? "scale-95 opacity-0 translate-y-4" : "scale-100 opacity-100 translate-y-0"
                }`}
            >
              <div className="space-y-8">
                {/* Resumen de Estados */}
                <div>
                  <h2
                    className={`text-xl font-bold text-white mb-4 text-center bg-[#015999] rounded-xl p-3 transition-all duration-700 transform
                  ${getAnimationClass()}`}
                    style={{
                      transitionDelay: getTransitionDelay(0),
                      opacity: animate ? 0 : 0.9,
                    }}
                  >
                    RESUMEN DE ESTADOS
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                    <Link to="" className="flex justify-center">
                      <div
                        className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-sm border border-gray-100 transform ${getAnimationClass()}`}
                        style={{
                          transitionDelay: getTransitionDelay(1),
                        }}
                      >
                        <div className="flex items-start">
                          <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-4 mr-4">
                            <FiDollarSign className="w-7 h-7 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-base font-medium text-gray-600">Facturado</p>
                              <div className="bg-green-50 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                {(
                                  ((estatus.find((e) => e.nombre_estatus === "Facturado")?.suma_montos || 0) /
                                    sumaTotal) *
                                  100
                                ).toFixed(2) || 0}
                                %
                              </div>
                            </div>
                            <h3
                              className="text-2xl font-bold tracking-tight text-gray-900 mb-2"
                              title={getFullFormattedValue(
                                estatus.find((e) => e.nombre_estatus === "Facturado")?.suma_montos || 0,
                              )}
                            >
                              {formatCurrency(estatus.find((e) => e.nombre_estatus === "Facturado")?.suma_montos || 0)}
                            </h3>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{
                                  width: `${((estatus.find((e) => e.nombre_estatus === "Facturado")?.suma_montos || 0) / sumaTotal) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <Link to="" className="flex justify-center">
                      <div
                        className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-sm border border-gray-100 transform ${getAnimationClass()}`}
                        style={{
                          transitionDelay: getTransitionDelay(2),
                        }}
                      >
                        <div className="flex items-start">
                          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 mr-4">
                            <FiShoppingCart className="w-7 h-7 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-base font-medium text-gray-600">Por Facturar</p>
                              <div className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                {(
                                  ((estatus.find((e) => e.nombre_estatus === "Por Facturar")?.suma_montos || 0) /
                                    sumaTotal) *
                                  100
                                ).toFixed(2) || 0}
                                %
                              </div>
                            </div>
                            <h3
                              className="text-2xl font-bold tracking-tight text-gray-900 mb-2"
                              title={getFullFormattedValue(
                                estatus.find((e) => e.nombre_estatus === "Por Facturar")?.suma_montos || 0,
                              )}
                            >
                              {formatCurrency(
                                estatus.find((e) => e.nombre_estatus === "Por Facturar")?.suma_montos || 0,
                              )}
                            </h3>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{
                                  width: `${((estatus.find((e) => e.nombre_estatus === "Por Facturar")?.suma_montos || 0) / sumaTotal) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <Link to="" className="flex justify-center">
                      <div
                        className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 w-full max-w-sm border border-gray-100 transform ${getAnimationClass()}`}
                        style={{
                          transitionDelay: getTransitionDelay(3),
                        }}
                      >
                        <div className="flex items-start">
                          <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-4 mr-4">
                            <FiCheckCircle className="w-7 h-7 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-base font-medium text-gray-600">Por Valuar</p>
                              <div className="bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                {(
                                  ((estatus.find((e) => e.nombre_estatus === "Por Valuar")?.suma_montos || 0) /
                                    sumaTotal) *
                                  100
                                ).toFixed(2) || 0}
                                %
                              </div>
                            </div>
                            <h3
                              className="text-2xl font-bold tracking-tight text-gray-900 mb-2"
                              title={getFullFormattedValue(
                                estatus.find((e) => e.nombre_estatus === "Por Valuar")?.suma_montos || 0,
                              )}
                            >
                              {formatCurrency(estatus.find((e) => e.nombre_estatus === "Por Valuar")?.suma_montos || 0)}
                            </h3>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{
                                  width: `${((estatus.find((e) => e.nombre_estatus === "Por Valuar")?.suma_montos || 0) / sumaTotal) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Regiones */}
                <div>
                  <h2
                    className={`text-xl font-bold text-white mb-4 text-center bg-[#015999] rounded-xl p-3 transition-all duration-700 transform
                  ${getAnimationClass()}`}
                    style={{
                      transitionDelay: getTransitionDelay(4),
                      opacity: animate ? 0 : 0.9,
                    }}
                  >
                    REGIONES
                  </h2>
                  <div>
                    {loading ? (
                      <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="ml-3 text-gray-600 text-base">Cargando regiones...</p>
                      </div>
                    ) : regiones.regiones && regiones.regiones.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 justify-items-center mx-52 max-w-5xl">
                        {regiones.regiones
                          .filter((region) => region.nombre_region !== "Centro")
                          .map((region, index) => (
                            <Link
                              key={region.id}
                              to={`/GestionGerencia/${region.nombre_region}`}
                              className="w-full max-w-xs"
                            >
                              <div
                                className={`bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 w-full border border-gray-100 transform ${getAnimationClass()}`}
                                style={{
                                  transitionDelay: getTransitionDelay(index + 5),
                                }}
                              >
                                <div className="flex items-start">
                                  <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 mr-2">
                                    <FiMapPin className="w-7 h-7 text-indigo-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{region.nombre_region}</h3>
                                    <div className="flex items-center mb-3">
                                      <FiTarget className="text-gray-400 mr-1" />
                                      <p className="text-sm text-gray-500">Ofertado</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <p
                                        className="text-2xl font-bold text-indigo-600"
                                        title={getFullFormattedValue(region.total_monto_ofertado)}
                                      >
                                        {formatCurrency(region.total_monto_ofertado)}
                                      </p>
                                      <div className="bg-indigo-50 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                                        <FiUsers className="mr-1" /> {region.total_proyectos} proyectos
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl p-8 shadow-md text-center">
                        <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">No hay regiones disponibles.</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Intente actualizar los datos o contacte al administrador.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Panel fijo de costos en esquina inferior izquierda */}
        <div className="fixed bottom-4 left-4 flex gap-4 z-20">
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-2">
                <FiTarget className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Costo Plan</h3>
            </div>
            <p
              className="text-lg font-bold text-gray-900"
              title={getFullFormattedValue(regiones.costo_planificado_total || 0)}
            >
              {formatCurrency(regiones.costo_planificado_total || 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-2">
                <FiActivity className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Costo Real</h3>
            </div>
            <p
              className="text-lg font-bold text-green-600"
              title={getFullFormattedValue(regiones.costo_real_total || 0)}
            >
              {formatCurrency(regiones.costo_real_total || 0)}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default GestionGerencia

