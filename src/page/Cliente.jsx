import { CiLogin } from "react-icons/ci";
import { Link } from "react-router-dom";

const Cliente = () => {
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
            ProcedimientoComercial
          </li>
        </ul>
      </div>

      {/* Contenedor de tarjetas */}
      <div className="container mx-auto mt-8 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Tarjeta 1: Nuevo Cliente */}
          <div className="card bg-[#fafafa] shadow-md rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <figure className="h-48 overflow-hidden">
              <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                alt="Nuevo Cliente"
                className="w-full h-full object-cover"
              />
            </figure>
            <div className="card-body p-4 text-center">
              <h2 className="card-title text-sm md:text-lg font-semibold text-gray-800">
                Nuevo Cliente
              </h2>
              <div className="card-actions mt-4">
                <Link
                  to="/InicioPlanificador/Cliente/NuevoCliente"
                  className="btn btn-primary w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md transition-colors duration-300"
                >
                  <CiLogin className="text-xl" /> Ingresar
                </Link>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Base de Datos de Clientes */}
          <div className="card bg-white shadow-md rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
            <figure className="h-48 overflow-hidden">
              <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                alt="Base de Datos de Clientes"
                className="w-full h-full object-cover"
              />
            </figure>
            <div className="card-body p-4 text-center">
              <h2 className="card-title text-sm md:text-lg font-semibold text-gray-800">
                Base de Datos de Clientes
              </h2>
              <div className="card-actions mt-4">
                <Link
                  to="/InicioPlanificador/Cliente/BaseDatasCliente"
                  className="btn btn-primary w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md transition-colors duration-300"
                >
                  <CiLogin className="text-xl" /> Ingresar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cliente;