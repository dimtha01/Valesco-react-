import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación
  const [userRole, setUserRole] = useState(null); // Rol del usuario (planificador o administrador)

  // Función para iniciar sesión
  const login = (role) => {
    setIsAuthenticated(true);
    setUserRole(role);
  };

  // Función para cerrar sesión
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};