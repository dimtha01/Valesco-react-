import { Link } from "react-router-dom"
import imgProyecto2 from "../assets/Crear proyecto.png";


const InicioGestion = () => {
  return (
    <>
      <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul className="flex items-center space-x-2">
          <li>
            <Link
              to="/InicioGestion"
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
              Gestion
            </Link>
          </li>
        </ul>
      </div>
      <div className="container mx-auto mt-8 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Tarjeta Crear Proyecto */}
          <div className="card bg-white shadow-md rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <figure className="h-48 overflow-hidden">
              <img
                src={imgProyecto2}
                alt="Crear Proyecto"
                className="w-full h-full object-cover transition-transform duration-300"
              />
            </figure>
            <div className="card-body p-4 text-center">
              <h2 className="card-title text-base md:text-lg font-semibold text-gray-800">
                Proyecto
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-2">
                Descarga de la infomacion de Proyectos
              </p>
              <div className="card-actions mt-4">
                <Link
                  to="/Gestion"
                  className="btn btn-primary w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-md transition-colors duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-5 w-5 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Crear
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InicioGestion