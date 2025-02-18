
import { useState } from "react"

const ProgressBar = ({ initialReal = 30, initialPlanificado = 50 }) => {
  const [real, setReal] = useState(initialReal)
  const [planificado, setPlanificado] = useState(initialPlanificado)
  const proyecto = 100 // Proyecto siempre es 100%

  // Validar y actualizar Real
  const handleRealChange = (value) => {
    const newReal = Math.min(Math.max(0, Number(value)), planificado)
    setReal(newReal)
  }

  // Validar y actualizar Planificado
  const handlePlanificadoChange = (value) => {
    const newPlanificado = Math.min(Math.max(real, Number(value)), proyecto)
    setPlanificado(newPlanificado)
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Controles de entrada */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="real" className="block text-sm font-medium text-gray-700">
            Real (%)
          </label>
          <input
            id="real"
            type="number"
            min={0}
            max={planificado}
            value={real}
            onChange={(e) => handleRealChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="planificado" className="block text-sm font-medium text-gray-700">
            Planificado (%)
          </label>
          <input
            id="planificado"
            type="number"
            min={real}
            max={100}
            value={planificado}
            onChange={(e) => handlePlanificadoChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="relative h-4 bg-blue-100 rounded-full">
        {/* Proyecto bar (full width) */}
        <div className="absolute inset-0 bg-blue-200 rounded-full" />

        {/* Planificado bar */}
        <div
          className="absolute inset-0 bg-blue-400 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${planificado}%` }}
        />

        {/* Real bar */}
        <div
          className="absolute inset-0 bg-blue-700 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${real}%` }}
        />
      </div>

      {/* Etiquetas */}
      <div className="flex justify-between mt-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-700" />
          <span>Real</span>
          <span className="font-medium">{real}%</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-400" />
          <span>Planificado</span>
          <span className="font-medium">{planificado}%</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-200" />
          <span>Proyecto</span>
          <span className="font-medium">{proyecto}%</span>
        </div>
      </div>
    </div>
  )
}

export default ProgressBar

