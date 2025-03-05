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
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./components/AuthContext";
import DetallesProyecto from "./page/DetallesProyecto";
import Gestion from "./page/Gestion";
import GestionProyectos from "./page/GestionProyectos";
import InicioGestion from "./page/InicioGestion";

const App = () => {
  return (
    <AuthProvider> {/* Envolver la aplicación con el proveedor de autenticación */}
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Ruta pública: Inicio de sesión */}
          <Route path="/" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/InicioPlanificador"
            element={
              <ProtectedRoute>
                <InicioPlanificador />
              </ProtectedRoute>
            }
          />
          <Route
            path="/InicioPlanificador/Proyecto"
            element={
              <ProtectedRoute>
                <Proyecto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/GestionGerencia"
            element={
              <ProtectedRoute>
                <GestionGerencia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/InicioPlanificador/Cliente"
            element={
              <ProtectedRoute>
                <Cliente />
              </ProtectedRoute>
            }
          />
          <Route
            path="/InicioPlanificador/CrearProyecto"
            element={
              <ProtectedRoute>
                <CrearProyecto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/InicioPlanificador/CrearProyecto/crearCliente"
            element={
              <ProtectedRoute>
                <NuevoCliente />
              </ProtectedRoute>
            }
          />
          <Route
            path="/InicioGestion"
            element={
              <ProtectedRoute>
                <InicioGestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Gestion"
            element={
              <ProtectedRoute>
                <Gestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/InicioPlanificador/Proyecto/ActualizarProyecto/:Proyecto/:id"
            element={
              <ProtectedRoute>
                <ActualizarProyecto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/GestionProyectos/:Proyecto/:id"
            element={
              <ProtectedRoute>
                <GestionProyectos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/GestionGerencia/:region"
            element={
              <ProtectedRoute>
                <ReginDetalles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proyecto/:id"
            element={
              <ProtectedRoute>
                <DetallesProyecto />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;