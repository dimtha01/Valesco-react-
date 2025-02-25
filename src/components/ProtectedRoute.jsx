import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);

  // Si el usuario no está autenticado, redirigir al formulario de inicio de sesión
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si el usuario está autenticado, renderizar el contenido protegido
  return children;
};

export default ProtectedRoute;