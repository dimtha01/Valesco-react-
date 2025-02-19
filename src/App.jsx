import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./page/Login";
import Header from "./components/Header";
import InicioPlanificador from "./page/InicioPlanificador";
import Proyecto from "./page/Proyecto";
import GestionGerencia from "./page/GestionGerencia";
import NuevoCliente from "./page/NuevoCliente";
import Cliente from "./page/Cliente";
import CrearProyecto from "./page/CrearProyecto";
import ActualizarProyecto from "./page/ActualizarProyecto";
import ReginDetalles from "./page/RegionDetalles";
import { AuthProvider } from "./components/AuthContext";
import DetallesProyecto from "./page/DetallesProyecto";

const App = () => {
  return (
    <AuthProvider> {/* Envolver la aplicación con el proveedor de autenticación */}
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Ruta pública: Inicio de sesión */}
          <Route path="/" element={<Login />} />
          
          {/* Todas las demás rutas ahora son públicas */}
          <Route path="/InicioPlanificador" element={<InicioPlanificador />} />
          <Route path="/InicioPlanificador/Proyecto" element={<Proyecto />} />
          <Route path="/GestionGerencia" element={<GestionGerencia />} />
          <Route path="/InicioPlanificador/Cliente" element={<Cliente />} />
          <Route path="/InicioPlanificador/CrearProyecto" element={<CrearProyecto />} />
          <Route path="/InicioPlanificador/CrearProyecto/crearCliente" element={<NuevoCliente />} />
          <Route path="/InicioPlanificador/Proyecto/ActualizarProyecto/:Proyecto/:id" element={<ActualizarProyecto />} />
          <Route path="/GestionGerencia/:region" element={<ReginDetalles />} />
          <Route path="/proyecto/:id" element={<DetallesProyecto />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;