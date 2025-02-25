import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import GestionCostos from '../components/GestionCostos';
import GestionAvanceFisicos from '../components/GestionAvanceFisicos';
import GestionAvanceFinacieros from '../components/GestionAvanceFinacieros';

const GestionProyectos = () => {
  const params = useParams()
  const [activeComponent, setActiveComponent] = useState("costos");

  return (
    <>
    <div className="breadcrumbs text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul>
          
          <li>
            <Link to="/Gestion" className="flex items-center hover:text-blue-500">
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
              Proyecto
            </Link>
          </li>
          <li>{params.Proyecto}</li>
        </ul>
      </div>
      <div className="flex justify-center space-x-4 m-4">
        <button
          className={`px-4 py-2 rounded ${activeComponent === "costos" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          onClick={() => setActiveComponent("costos")}
        >
          Costos
        </button>
        <button
          className={`px-4 py-2 rounded ${activeComponent === "avanceFisico" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          onClick={() => setActiveComponent("avanceFisico")}
        >
          Avance Físico
        </button>
        <button
          className={`px-4 py-2 rounded ${activeComponent === "avanceFinanciero" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          onClick={() => setActiveComponent("avanceFinanciero")}
        >
          Administración de Contratos
        </button>
      </div>

      {/* Mostrar el componente seleccionado */}
      <div>
        {activeComponent === "costos" && <GestionCostos />}
        {activeComponent === "avanceFisico" && <GestionAvanceFisicos />}
        {activeComponent === "avanceFinanciero" && <GestionAvanceFinacieros />}
      </div>
    </>
  )
}

export default GestionProyectos