import { Link } from "react-router-dom";
import imgProyecto2 from "../assets/Crear proyecto.png";
import imgProyecto4 from "../assets/GestionProcura.jpg"; // Nueva imagen para la tercera tarjeta
import imgProyecto5 from "../assets/ProcedimientoComercial.jpg";

const InicioProcura = () => {
  return (
    <>
      <div className="breadcrumbs text-sm md:text-lg mx-2 mt-2 text-[#0f0f0f]">
        <ul className="flex items-center space-x-2">
          <li>
            <Link
              to=""
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
              Sistema Procura
            </Link>
          </li>
        </ul>
      </div>
      <div className="container mx-3 mt-8 px-4 min-h-vh">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

          <div className="card bg-white shadow-md rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <figure className="h-48 overflow-hidden">
              <img
                src={imgProyecto4}
                alt="Gestión procura"
                className="w-full h-full object-cover transition-transform duration-300"
              />
            </figure>
            <div className="card-body p-4 text-center">
              <h2 className="card-title text-base md:text-lg font-semibold text-gray-800">
                Gestión procura
              </h2>
              <p className="text-xs md:text-sm text-gray-600 mt-2">
                Gestión de Proveedores,
                Numero de Orden de Compra
              </p>
              <div className="card-actions mt-4">
                <Link
                  to="/InicioPlanificador/GestionProcura"
                  className="btn btn-primary w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md transition-colors duration-300"
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InicioProcura