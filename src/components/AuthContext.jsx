import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estados para manejar la autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación
  const [userRole, setUserRole] = useState(null); // Rol del usuario (planificador, administrador, gestión)
  const [email, setEmail] = useState(null); // Email del usuario
  const [permissionEdit, setPermissionEdit] = useState(null); // Permiso de edición del usuario
  const [region, setRegion] = useState(null); // Región del usuario (solo para planificadores)

  // Función para iniciar sesión
  const login = (role, permissionEdit, region) => {
    setIsAuthenticated(true); // Marcar al usuario como autenticado
    setUserRole(role); // Establecer el rol del usuario
    setPermissionEdit(permissionEdit); // Establecer el permiso de edición
    setRegion(region); // Establecer la región del usuario (si aplica)
  };

  // Función para cerrar sesión
  const logout = () => {
    setIsAuthenticated(false); // Marcar al usuario como no autenticado
    setUserRole(null); // Limpiar el rol del usuario
    setEmail(null); // Limpiar el email del usuario
    setPermissionEdit(null); // Limpiar el permiso de edición
    setRegion(null); // Limpiar la región del usuario
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userRole,
        email,
        permissionEdit,
        region, // Añadir la región al contexto
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

