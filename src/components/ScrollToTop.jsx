import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Desplazamiento suave al inicio
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Efecto de desplazamiento suave
    });
  }, [pathname]); // Se ejecuta cada vez que cambia la ruta

  return null; // Este componente no renderiza nada
};

export default ScrollToTop;