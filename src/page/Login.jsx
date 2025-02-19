import { useState } from "react";
import { useNavigate } from "react-router-dom";
import img from "../assets/image 3.png";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importar íconos de react-icons

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Estado para mostrar errores
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar la visibilidad de la contraseña
  const navigate = useNavigate();

  // Simulación de usuarios en la base de datos
  const users = [
    { email: "planificador@example.com", password: "plan123", role: "planificador" },
    { email: "admin@example.com", password: "admin123", role: "administrador" },
  ];

  // Función para manejar el inicio de sesión
  const handleLogin = (e) => {
    e.preventDefault();
    // Buscar si existe un usuario con el correo y contraseña ingresados
    const user = users.find((u) => u.email === email && u.password === password);
    if (user) {
      // Redirigir según el rol del usuario
      if (user.role === "planificador") {
        navigate("/InicioPlanificador");
      } else if (user.role === "administrador") {
        navigate("/GestionGerencia");
      }
    } else {
      // Mostrar mensaje de error si las credenciales son incorrectas
      setError("Correo electrónico o contraseña incorrectos.");
    }
  };

  return (
    <>
      <section className="bg-[#fafafa] flex items-center justify-center mt-5">
        <div className="bg-[#ffffff] flex rounded-2xl shadow-lg max-w-3xl p-5 items-center">
          {/* Formulario */}
          <div className="md:w-1/2 px-8 md:px-16">
            <h2 className="font-bold text-2xl text-[#002D74]">Iniciar sesión</h2>
            <p className="text-xs mt-4 text-[#002D74]">
              Inicia sesión para continuar en Valesco.
            </p>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <input
                className="p-2 mt-8 rounded-xl border bg-white"
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="relative">
                <input
                  className="p-2 rounded-xl border w-full bg-[#ffff]"
                  type={showPassword ? "text" : "password"} // Cambiar el tipo según el estado
                  name="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* Ícono de react-icons */}
                <span
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                  onClick={() => setShowPassword(!showPassword)} // Alternar la visibilidad de la contraseña
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Cambiar ícono según el estado */}
                </span>
              </div>
              <button
                type="submit"
                className="bg-[#002D74] rounded-xl text-white py-2 hover:scale-105 duration-300"
              >
                Iniciar sesión
              </button>
            </form>
          </div>
          {/* Imagen */}
          <div className="md:block hidden w-1/2">
            <img className="rounded-2xl" src={img} alt="Login" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;