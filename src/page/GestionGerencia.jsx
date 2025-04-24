"use client"

import { useEffect, useState, useRef } from "react"
import { Link } from "react-router-dom"
import {
  FiUsers,
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
  FiMapPin,
  FiActivity,
  FiTarget,
  FiInfo,
  FiDollarSign,
  FiShoppingCart,
  FiCheckCircle,
  FiCreditCard,
} from "react-icons/fi"
import { decimalAEntero, UrlApi } from "../utils/utils"
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
  // Modificar el estado inicial para eliminar la dependencia de la API de regiones
  const [regiones, setRegiones] = useState({
    Oriente: null,
    Occidente: null,
  })
  const [estatus, setEstatus] = useState([])
  const [loading, setIsLoading] = useState(true)
  const [animate, setAnimate] = useState(false)
  // Add state for region data
  const [regionData, setRegionData] = useState({
    Oriente: null,
    Occidente: null,
  })

  // Colores exactos de la imagen
  const COLORS = {
    ofertado: "#1e5a7b", // Azul oscuro para "Ofertado"
    costoPlaneado: "#e67e22", // Naranja para "Costo Planificado"\
    facturado: "#1e5a7b", // Azul oscuro para "Facturado"
    costoReal: "#e67e22", // Naranja para "Costo real"
    porValuar: "#4CAF50", // Verde para "Por valuar"
    porFacturar: "#e67e22", // Naranja para "Por facturar"
    facturadoMonto: "#1e5a7b", // Azul oscuro para "Facturado Monto"
    primary: "#015999", // Color primario corporativo
    secondary: "#e67e22", // Color secundario corporativo
    accent: "#4CAF50", // Color de acento
    anticipoTotal: "#3498db", // Azul para "Anticipo Total"
    amortizacion: "#e74c3c", // Rojo para "Amortización"
    anticipoDisponible: "#2ecc71", // Verde para "Anticipo Disponible"
  }

  // Actualizar la función fetchRegiones para manejar correctamente la estructura de datos
  // Eliminar la función fetchRegiones y reemplazarla por una función que obtenga los datos de las regiones desde la API de dashboard
  const fetchAllRegionData = async () => {
    setIsLoading(true)
    try {
      // Obtener datos de Oriente
      await fetchRegionData("Oriente")

      // Obtener datos de Occidente
      await fetchRegionData("Occidente")

      console.log("Datos de todas las regiones cargados")
    } catch (error) {
      console.error("Error al cargar datos de regiones:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar la función fetchRegionData para manejar correctamente la estructura de datos
  const fetchRegionData = async (region) => {
    try {
      const response = await fetch(`${UrlApi}/api/proyectos/${region.toLowerCase()}`)
      if (!response.ok) {
        throw new Error(`Error al cargar datos de ${region}: ${response.statusText}`)
      }
      const data = await response.json()

      // Actualizar el estado de regiones con los datos obtenidos
      setRegiones((prevRegiones) => ({
        ...prevRegiones,
        [region]: data,
      }))

      console.log(`Datos de ${region} cargados:`, data)
    } catch (error) {
      console.error(`Error al cargar datos de ${region}:`, error)
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

  // Add function to fetch region data
  // Modificar la función fetchRegionData para usar la URL correcta

  // Configuración para la animación de scroll
  const sectionRefs = {
    header: useRef(null),
    estatus: useRef(null),
    planificacion: useRef(null),
    realEjecutado: useRef(null),
    administracion: useRef(null),
    regiones: useRef(null),
  }

  // Update useEffect to only fetch Oriente and Occidente data
  useEffect(() => {
    fetchAllRegionData()
    fetchEstatus()

    // Iniciar animación al cargar
    setAnimate(true)
    const timer = setTimeout(() => {
      setAnimate(false)
    }, 600)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  const sumaTotal = estatus.reduce((acc, curr) => acc + Number.parseFloat(curr.suma_montos), 0)
  console.log(sumaTotal)

  // Modificar la función formatCurrency para mostrar en millones (MM) o miles (M) según el tamaño del número
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0.00 MM"

    // Convertir a número si es string
    const numAmount = typeof amount === "string" ? Number.parseFloat(amount) : amount

    // Siempre mostrar en millones (MM)
    const inMillions = numAmount / 1000000
    return `$${inMillions.toFixed(2)} MM`
  }

  // Modificar la función getFullFormattedValue para mostrar en millones (MM) o miles (M) según el tamaño del número
  const getFullFormattedValue = (amount) => {
    if (amount === undefined || amount === null) return "$0,00"

    // Formatear el número con separadores de miles (puntos) y decimales (coma)
    return `$${amount.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  // Función para calcular totales a partir de los datos de las regiones
  // Actualizar la función calculateTotals para usar los datos de la API de dashboard
  const calculateTotals = () => {
    if (!regiones.Oriente || !regiones.Occidente) {
      return {
        total_ofertado: 0,
        total_costo_planificado: 0,
        total_costo_real: 0,
        total_facturado: 0,
        total_por_facturar: 0,
        total_por_valuar: 0,
        total_proyectos: 0,
        total_monto_anticipo: 0,
        total_amortizacion: 0,
      }
    }

    return {
      total_ofertado:
        Number.parseFloat(regiones.Oriente.totales.total_ofertado || 0) +
        Number.parseFloat(regiones.Occidente.totales.total_ofertado || 0),
      total_costo_planificado:
        Number.parseFloat(regiones.Oriente.totales.total_costo_planificado || 0) +
        Number.parseFloat(regiones.Occidente.totales.total_costo_planificado || 0),
      total_costo_real:
        Number.parseFloat(regiones.Oriente.totales.total_costo_real || 0) +
        Number.parseFloat(regiones.Occidente.totales.total_costo_real || 0),
      total_facturado:
        Number.parseFloat(regiones.Oriente.totales.total_facturado || 0) +
        Number.parseFloat(regiones.Occidente.totales.total_facturado || 0),
      total_por_facturar:
        Number.parseFloat(regiones.Oriente.totales.total_por_facturar || 0) +
        Number.parseFloat(regiones.Occidente.totales.total_por_facturar || 0),
      total_por_valuar:
        Number.parseFloat(regiones.Oriente.totales.total_por_valuar || 0) +
        Number.parseFloat(regiones.Occidente.totales.total_por_valuar || 0),
      total_proyectos: (regiones.Oriente.proyectos?.length || 0) + (regiones.Occidente.proyectos?.length || 0),
      total_monto_anticipo:
        Number.parseFloat(regiones.Oriente.totales.total_monto_anticipo || 0) +
        Number.parseFloat(regiones.Occidente.totales.total_monto_anticipo || 0),
      total_amortizacion:
        Number.parseFloat(regiones.Oriente.totales.total_amortizacion || 0) +
        Number.parseFloat(regiones.Occidente.totales.total_amortizacion || 0),
    }
  }

  // Obtener los totales calculados
  const totales = calculateTotals()

  // Update the prepareFinancialPlanData function to use API data
  // Actualizar la función prepareFinancialPlanData para usar los datos de la API de dashboard
  const prepareFinancialPlanData = (title, regionName) => {
    // Si es el total, calcular la suma de todas las regiones
    if (regionName === "Total") {
      const totales = calculateTotals()
      const planValue = totales.total_costo_planificado
      const obtainedValue = totales.total_ofertado
      const percentage = decimalAEntero(obtainedValue > 0 ? ((planValue / obtainedValue) * 100).toFixed(2) : 0)
      const difference = obtainedValue - planValue

      return {
        name: title,
        data: [
          { name: "Ofertado", value: obtainedValue, fill: COLORS.ofertado },
          { name: "Costo Planificado", value: planValue, fill: COLORS.costoPlaneado },
        ],
        percentage,
        difference,
      }
    }

    // Si es una región específica, usar los datos de esa región
    if (regiones[regionName]) {
      const planValue = Number.parseFloat(regiones[regionName].totales.total_costo_planificado || 0)
      const obtainedValue = Number.parseFloat(regiones[regionName].totales.total_ofertado || 0)
      const percentage = decimalAEntero(obtainedValue > 0 ? ((planValue / obtainedValue) * 100).toFixed(2) : 0)
      const difference = obtainedValue - planValue

      return {
        name: title,
        data: [
          { name: "Ofertado", value: obtainedValue, fill: COLORS.ofertado },
          { name: "Costo Planificado", value: planValue, fill: COLORS.costoPlaneado },
        ],
        percentage,
        difference,
      }
    }

    // Default empty data
    return {
      name: title,
      data: [
        { name: "Ofertado", value: 0, fill: COLORS.ofertado },
        { name: "Costo Planificado", value: 0, fill: COLORS.costoPlaneado },
      ],
      percentage: "0.00",
      difference: 0,
    }
  }

  // Update the prepareFinancialResultData function to use API data
  // Actualizar la función prepareFinancialResultData para usar los datos de la API de dashboard
  const prepareFinancialResultData = (title, regionName) => {
    // Si es el total, calcular la suma de todas las regiones
    if (regionName === "Total") {
      const totales = calculateTotals()
      const facturadoValue = totales.total_facturado
      const realValue = totales.total_costo_real

      // Calculate percentage safely (avoid division by zero)
      const percentage = decimalAEntero(facturadoValue > 0 ? ((realValue / facturadoValue) * 100).toFixed(2) : 0)

      // Calculate difference (Facturado - Costo Real)
      const difference = facturadoValue - realValue

      return {
        name: title,
        data: [
          { name: "Facturado", value: facturadoValue, fill: COLORS.facturado },
          { name: "Costo real", value: realValue, fill: COLORS.costoReal },
        ],
        percentage,
        difference,
      }
    }

    // Si es una región específica, usar los datos de esa región
    if (regiones[regionName]) {
      const facturadoValue = Number.parseFloat(regiones[regionName].totales.total_facturado || 0)
      const realValue = Number.parseFloat(regiones[regionName].totales.total_costo_real || 0)

      // Calculate percentage safely (avoid division by zero)
      const percentage = decimalAEntero(facturadoValue > 0 ? ((realValue / facturadoValue) * 100).toFixed(2) : 0)

      // Calculate difference (Facturado - Costo Real)
      const difference = facturadoValue - realValue

      return {
        name: title,
        data: [
          { name: "Facturado", value: facturadoValue, fill: COLORS.facturado },
          { name: "Costo real", value: realValue, fill: COLORS.costoReal },
        ],
        percentage,
        difference,
      }
    }

    // Default empty data
    return {
      name: title,
      data: [
        { name: "Facturado", value: 0, fill: COLORS.facturado },
        { name: "Costo real", value: 0, fill: COLORS.costoReal },
      ],
      percentage: "0.00",
      difference: 0,
    }
  }

  // Nueva función para preparar los datos de anticipo y amortización
  const prepareAnticipoAmortizacionData = (title, regionName) => {
    // Si es el total, calcular la suma de todas las regiones
    if (regionName === "Total") {
      const totales = calculateTotals()
      const anticipoValue = totales.total_monto_anticipo
      const amortizacionValue = totales.total_amortizacion
      const anticipoDisponibleValue = Math.max(0, anticipoValue - amortizacionValue)

      // Calcular el porcentaje de amortización respecto al anticipo
      const percentage = decimalAEntero(anticipoValue > 0 ? ((amortizacionValue / anticipoValue) * 100).toFixed(2) : 0)

      // Calcular la diferencia (Anticipo - Amortización)
      const difference = anticipoDisponibleValue

      return {
        name: title,
        data: [
          { name: "Anticipo Total", value: anticipoValue, fill: COLORS.anticipoTotal },
          { name: "Amortización", value: amortizacionValue, fill: COLORS.amortizacion },
          { name: "Por Amortizar", value: anticipoDisponibleValue, fill: COLORS.anticipoDisponible },
        ],
        percentage,
        difference,
      }
    }

    // Si es una región específica, usar los datos de esa región
    if (regiones[regionName]) {
      const anticipoValue = Number.parseFloat(regiones[regionName].totales.total_monto_anticipo || 0)
      const amortizacionValue = Number.parseFloat(regiones[regionName].totales.total_amortizacion || 0)
      const anticipoDisponibleValue = Math.max(0, anticipoValue - amortizacionValue)

      // Calcular el porcentaje de amortización respecto al anticipo
      const percentage = decimalAEntero(anticipoValue > 0 ? ((amortizacionValue / anticipoValue) * 100).toFixed(2) : 0)

      // Calcular la diferencia (Anticipo - Amortización)
      const difference = anticipoDisponibleValue

      return {
        name: title,
        data: [
          { name: "Anticipo Total", value: anticipoValue, fill: COLORS.anticipoTotal },
          { name: "Amortización", value: amortizacionValue, fill: COLORS.amortizacion },
          { name: "Por Amortizar", value: anticipoDisponibleValue, fill: COLORS.anticipoDisponible },
        ],
        percentage,
        difference,
      }
    }

    // Default empty data
    return {
      name: title,
      data: [
        { name: "Anticipo Total", value: 0, fill: COLORS.anticipoTotal },
        { name: "Amortización", value: 0, fill: COLORS.amortizacion },
        { name: "Por Amortizar", value: 0, fill: COLORS.anticipoDisponible },
      ],
      percentage: "0.00",
      difference: 0,
    }
  }

  // Update the prepareRegionPieChartData function to use API data
  // Actualizar la función prepareRegionPieChartData para usar los datos de la API de dashboard
  const prepareRegionPieChartData = (regionName) => {
    // Si es el total, calcular la suma de todas las regiones
    if (regionName === "Total") {
      const totales = calculateTotals()
      const facturadoValue = totales.total_facturado
      const porFacturarValue = totales.total_por_facturar
      const porValuarValue = totales.total_por_valuar

      const total = facturadoValue + porFacturarValue + porValuarValue

      // If total is zero, set default percentages to avoid NaN
      const facturadoPercentage = decimalAEntero(total > 0 ? ((facturadoValue / total) * 100).toFixed(2) : 0)
      const porFacturarPercentage = decimalAEntero(total > 0 ? ((porFacturarValue / total) * 100).toFixed(2) : 0)
      const porValuarPercentage = decimalAEntero(total > 0 ? ((porValuarValue / total) * 100).toFixed(2) : 0)

      return [
        {
          name: "Facturado",
          value: facturadoValue,
          color: "#1e5a7b", // Azul oscuro
          percentage: facturadoPercentage,
        },
        {
          name: "Por facturar",
          value: porFacturarValue,
          color: "#4CAF50", // Verde
          percentage: porFacturarPercentage,
        },
        {
          name: "Por valuar",
          value: porValuarValue,
          color: "#e67e22", // Naranja
          percentage: porValuarPercentage,
        },
      ]
    }

    // Si es una región específica, usar los datos de esa región
    if (regiones[regionName]) {
      const facturadoValue = Number.parseFloat(regiones[regionName].totales.total_facturado || 0)
      const porFacturarValue = Number.parseFloat(regiones[regionName].totales.total_por_facturar || 0)
      const porValuarValue = Number.parseFloat(regiones[regionName].totales.total_por_valuar || 0)

      const total = facturadoValue + porFacturarValue + porValuarValue

      // If total is zero, set default percentages to avoid NaN
      const facturadoPercentage = decimalAEntero(total > 0 ? ((facturadoValue / total) * 100).toFixed(2) : 0)
      const porFacturarPercentage = decimalAEntero(total > 0 ? ((porFacturarValue / total) * 100).toFixed(2) : 0)
      const porValuarPercentage = decimalAEntero(total > 0 ? ((porValuarValue / total) * 100).toFixed(2) : 0)

      return [
        {
          name: "Facturado",
          value: facturadoValue,
          color: "#1e5a7b", // Azul oscuro
          percentage: facturadoPercentage,
        },
        {
          name: "Por facturar",
          value: porFacturarValue,
          color: "#4CAF50", // Verde
          percentage: porFacturarPercentage,
        },
        {
          name: "Por valuar",
          value: porValuarValue,
          color: "#e67e22", // Naranja
          percentage: porValuarPercentage,
        },
      ]
    }

    // Default empty data
    return [
      {
        name: "Facturado",
        value: 0,
        color: "#1e5a7b",
        percentage: "0.00",
      },
      {
        name: "Por facturar",
        value: 0,
        color: "#4CAF50",
        percentage: "0.00",
      },
      {
        name: "Por valuar",
        value: 0,
        color: "#e67e22",
        percentage: "0.00",
      },
    ]
  }

  // Preparar datos para los gráficos usando los nuevos métodos
  const financialPlanTotal = prepareFinancialPlanData("Planificación financiera total", "Total")
  const financialPlanOriente = prepareFinancialPlanData("Planificación financiera Oriente", "Oriente")
  const financialPlanOccidente = prepareFinancialPlanData("Planificación financiera Occidente", "Occidente")

  const financialResultTotal = prepareFinancialResultData("Resultado financiero total", "Total")
  const financialResultOriente = prepareFinancialResultData("Resultado financiero Oriente", "Oriente")
  const financialResultOccidente = prepareFinancialResultData("Resultado financiero Occidente", "Occidente")

  // Preparar datos para los gráficos de anticipo y amortización
  const anticipoAmortizacionTotal = prepareAnticipoAmortizacionData("Anticipo y Amortización total", "Total")
  const anticipoAmortizacionOriente = prepareAnticipoAmortizacionData("Anticipo y Amortización Oriente", "Oriente")
  const anticipoAmortizacionOccidente = prepareAnticipoAmortizacionData(
    "Anticipo y Amortización Occidente",
    "Occidente",
  )

  const pieChartData = prepareRegionPieChartData("Total")
  const pieChartDataOriente = prepareRegionPieChartData("Oriente")
  const pieChartDataOccidente = prepareRegionPieChartData("Occidente")

  // Componente de gráfico de barras
  const BarChartComponent = ({ title, data, percentage, index = 0, difference }) => {
    // For financial plan charts, we need to handle differently
    const isFinancialPlan = data[0].name === "Ofertado" || data[1].name === "Ofertado"
    const isAnticipoAmortizacion = data.some(
      (item) => item.name === "Anticipo Total" || item.name === "Amortización" || item.name === "Perdiente Por Amortizar",
    )

    // Identificar correctamente los valores
    const ofertadoValue = data.find((d) => d.name === "Ofertado")?.value || 0
    const costoPlaneadoValue = data.find((d) => d.name === "Costo Planificado")?.value || 0
    const facturadoValue = data.find((d) => d.name === "Facturado")?.value || 0
    const costoRealValue = data.find((d) => d.name === "Costo real")?.value || 0
    const anticipoTotalValue = data.find((d) => d.name === "Anticipo Total")?.value || 0
    const amortizacionValue = data.find((d) => d.name === "Amortización")?.value || 0
    const anticipoDisponibleValue = data.find((d) => d.name === "Perdiente Por Amortizar")?.value || 0

    // Calcular la diferencia correctamente según el tipo de gráfico
    let calculatedDifference = 0
    if (isFinancialPlan) {
      calculatedDifference = ofertadoValue - costoPlaneadoValue
    } else if (isAnticipoAmortizacion) {
      calculatedDifference = anticipoTotalValue - amortizacionValue
    } else {
      calculatedDifference = facturadoValue - costoRealValue
    }

    // Usar la diferencia proporcionada o la calculada
    const finalDifference = difference !== undefined ? difference : calculatedDifference

    // Determinar las etiquetas según el tipo de gráfico
    let label1 = ""
    let label2 = ""

    if (isFinancialPlan) {
      label1 = "% Costo Planificado / Ofertado = "
      label2 = "Diferencia (Ofertado - Costo Planificado) = "
    } else if (isAnticipoAmortizacion) {
      label1 = "% Amortización / Anticipo Total = "
      label2 = "Perdiente Por Amortizar = "
    } else {
      label1 = "% Costo Real / Facturado = "
      label2 = "Diferencia (Facturado - Costo Real) = "
    }

    // Handle case where both values are zero
    const displayPercentage =
      percentage === "0.00" &&
      ((isFinancialPlan && ofertadoValue === 0 && costoPlaneadoValue === 0) ||
        (!isFinancialPlan && !isAnticipoAmortizacion && facturadoValue === 0 && costoRealValue === 0) ||
        (isAnticipoAmortizacion && anticipoTotalValue === 0 && amortizacionValue === 0))
        ? "0.00"
        : percentage

    // Formatear la diferencia para mostrar solo el número sin unidades en el caso de MM
    const formattedDifference = `$${(finalDifference / 1000000).toFixed(2).replace(".", ",")}`
    const differenceUnit = "MM"

    return (
      <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>

        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{label1}</span>
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-1 rounded-full ml-2">
              {displayPercentage}%
            </span>
          </div>
          <div className="flex items-center whitespace-nowrap">
            <span className="text-sm font-medium text-gray-700 mr-2">{label2}</span>
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-1 rounded-full">
              {formattedDifference} {differenceUnit}
            </span>
          </div>
        </div>

        <div className="h-[220px] sm:h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={false} />
              <Tooltip
                formatter={(value) => getFullFormattedValue(value)}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
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
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  // Modificar el componente PieChartComponent para aumentar la altura y mostrar la cantidad de proyectos
  const PieChartComponent = ({ data, title, index = 0 }) => (
    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <div className="h-[220px] sm:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
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
              formatter={(value, name, props) => {
                const item = data.find((d) => d.value === value)
                return [`${getFullFormattedValue(value)} (${item?.percentage || "0.00"}%)`, name]
              }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                padding: "8px",
              }}
            />
            <Legend align="center" verticalAlign="bottom" layout="horizontal" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // Componente de tarjeta de región
  const RegionCard = ({ region, amount, count, index = 0 }) => (
    <Link to={`/GestionGerencia/${region}`} className="w-full">
      <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 w-full border border-gray-100 hover:bg-gray-50">
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
    </Link>
  )

  // Componente de tarjeta de estado
  const StatusCard = ({ title, amount, icon: Icon, color, percentage, index = 0 }) => (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 w-full border border-gray-100">
      <div className="flex items-start">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 mr-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <div
              className={`${color.replace("bg-", "bg-").replace("-600", "-100")} ${color.replace("bg-", "text-")} text-xs font-medium px-2 py-0.5 rounded-full`}
            >
              {percentage}%
            </div>
          </div>
          <p
            className={`text-2xl font-bold ${color.replace("bg-", "text-")} mb-2`}
            title={getFullFormattedValue(amount)}
          >
            {formatCurrency(amount)}
          </p>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full`}
              style={{
                width: `${percentage}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )

  // Update the JSX structure to remove refs and data-section attributes
  return (
    <div className="min-h-screen bg-gray-50 pb-36">
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
          <div className="flex items-center">
            <FiInfo className="text-blue-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-700">Valores expresados en millones (MM)</h3>
          </div>
        </div>

        <div className="space-y-8">
          {/* 1. RESUMEN DE ESTATUS */}
          <div>
            <div className="w-full bg-[#1e5a7b] py-2 px-4 mb-4 text-center rounded-xl">
              <h2 className="text-xl font-bold text-white">RESUMEN DE ESTATUS</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 justify-center">
              <StatusCard
                title="Facturado"
                amount={estatus.find((e) => e.nombre_estatus === "Facturado")?.suma_montos || 0}
                icon={FiDollarSign}
                color="bg-green-600"
                percentage={
                  (
                    ((estatus.find((e) => e.nombre_estatus === "Facturado")?.suma_montos || 0) / sumaTotal) *
                    100
                  ).toFixed(2) || 0
                }
                index={0}
              />

              <StatusCard
                title="Por Facturar"
                amount={estatus.find((e) => e.nombre_estatus === "Por Facturar")?.suma_montos || 0}
                icon={FiShoppingCart}
                color="bg-blue-600"
                percentage={
                  (
                    ((estatus.find((e) => e.nombre_estatus === "Por Facturar")?.suma_montos || 0) / sumaTotal) *
                    100
                  ).toFixed(2) || 0
                }
                index={1}
              />

              <StatusCard
                title="Por Valuar"
                amount={estatus.find((e) => e.nombre_estatus === "Por Valuar")?.suma_montos || 0}
                icon={FiCheckCircle}
                color="bg-amber-600"
                percentage={
                  (
                    ((estatus.find((e) => e.nombre_estatus === "Por Valuar")?.suma_montos || 0) / sumaTotal) *
                    100
                  ).toFixed(2) || 0
                }
                index={2}
              />
            </div>
          </div>

          {/* 2. GRÁFICAS */}
          <div>
            {/* Planificación Financiera */}
            <div>
              <div className="w-full bg-[#1e5a7b] py-2 px-4 mb-4 text-center rounded-xl">
                <h2 className="text-lg font-bold text-white">PLANIFICACIÓN DE LA ADMINISTRACIÓN DE CONTRATOS</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
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
            </div>

            {/* Real Ejecutado */}
            <div>
              <div className="w-full bg-[#1e5a7b] py-2 px-4 mb-4 text-center rounded-xl">
                <h2 className="text-lg font-bold text-white">REAL EJECUTADO</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <BarChartComponent
                  title="Resultado financiero total"
                  data={financialResultTotal.data}
                  percentage={financialResultTotal.percentage}
                  difference={financialResultTotal.difference}
                  index={0}
                />
                <BarChartComponent
                  title="Resultado financiero Oriente"
                  data={financialResultOriente.data}
                  percentage={financialResultOriente.percentage}
                  difference={financialResultOriente.difference}
                  index={1}
                />
                <BarChartComponent
                  title="Resultado financiero Occidente"
                  data={financialResultOccidente.data}
                  percentage={financialResultOccidente.percentage}
                  difference={financialResultOccidente.difference}
                  index={2}
                />
              </div>
            </div>

            {/* Anticipo y Amortización */}
            <div>
              <div className="w-full bg-[#1e5a7b] py-2 px-4 mb-4 text-center rounded-xl">
                <h2 className="text-lg font-bold text-white">GESTION DE ANTICIPOS A PROVEEDORES</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <BarChartComponent
                  title="Anticipo y Amortización total"
                  data={anticipoAmortizacionTotal.data}
                  percentage={anticipoAmortizacionTotal.percentage}
                  difference={anticipoAmortizacionTotal.difference}
                  index={0}
                />
                <BarChartComponent
                  title="Anticipo y Amortización Oriente"
                  data={anticipoAmortizacionOriente.data}
                  percentage={anticipoAmortizacionOriente.percentage}
                  difference={anticipoAmortizacionOriente.difference}
                  index={1}
                />
                <BarChartComponent
                  title="Anticipo y Amortización Occidente"
                  data={anticipoAmortizacionOccidente.data}
                  percentage={anticipoAmortizacionOccidente.percentage}
                  difference={anticipoAmortizacionOccidente.difference}
                  index={2}
                />
              </div>
            </div>

            {/* Administración de Contratos */}
            <div>
              <div className="w-full bg-[#1e5a7b] py-2 px-4 mb-4 text-center rounded-xl">
                <h2 className="text-lg font-bold text-white">ADMINISTRACIÓN DE CONTRATOS</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <PieChartComponent data={pieChartData} title="Estatus General de Valuaciones" index={0} />
                <PieChartComponent data={pieChartDataOriente} title="Estatus de Valuaciones Oriente" index={1} />
                <PieChartComponent data={pieChartDataOccidente} title="Estatus de Valuaciones Occidente" index={2} />
              </div>
            </div>
          </div>

          {/* 3. REGIONES */}
          {/* Actualizar la sección de regiones en el JSX para usar los datos de la API de dashboard */}
          <div>
            <div className="w-full bg-[#1e5a7b] py-2 px-4 mb-4 text-center rounded-xl">
              <h2 className="text-xl font-bold text-white">REGIONES</h2>
            </div>
            <div>
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="ml-3 text-gray-600 text-base">Cargando regiones...</p>
                </div>
              ) : regiones.Oriente && regiones.Occidente ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 justify-items-center mx-auto">
                  <RegionCard
                    key="Oriente"
                    region="Oriente"
                    amount={Number.parseFloat(regiones.Oriente.totales.total_ofertado || 0)}
                    count={regiones.Oriente.proyectos?.length.toString() || "0"}
                    index={0}
                  />
                  <RegionCard
                    key="Occidente"
                    region="Occidente"
                    amount={Number.parseFloat(regiones.Occidente.totales.total_ofertado || 0)}
                    count={regiones.Occidente.proyectos?.length.toString() || "0"}
                    index={1}
                  />
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

        {/* Panel fijo de costos en esquina inferior izquierda */}
        <div className="fixed bottom-4 left-4 flex flex-col sm:flex-row gap-2 sm:gap-4 z-20">
          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-2">
                <FiTarget className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Costo Plan</h3>
            </div>
            <p
              className="text-sm sm:text-lg font-bold text-gray-900"
              title={getFullFormattedValue(totales.total_costo_planificado || 0)}
            >
              {formatCurrency(totales.total_costo_planificado || 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-50 rounded-lg flex items-center justify-center mr-2">
                <FiActivity className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Costo Real</h3>
            </div>
            <p
              className="text-sm sm:text-lg font-bold text-green-600"
              title={getFullFormattedValue(totales.total_costo_real || 0)}
            >
              {formatCurrency(totales.total_costo_real || 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-teal-50 rounded-lg flex items-center justify-center mr-2">
                <FiCreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-700">Perdiente Por Amortizar</h3>
            </div>
            <p
              className="text-sm sm:text-lg font-bold text-teal-600"
              title={getFullFormattedValue(Math.max(0, totales.total_monto_anticipo - totales.total_amortizacion) || 0)}
            >
              {formatCurrency(Math.max(0, totales.total_monto_anticipo - totales.total_amortizacion) || 0)}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default GestionGerencia
