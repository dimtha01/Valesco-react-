import { BrowserRouter, Route, Routes } from "react-router-dom"
import Login from "./page/Login"
import Header from "./components/Header"
import InicioPlanificador from "./page/InicioPlanificador"
import Proyecto from "./page/Proyecto"
import GestionGerencia from "./page/GestionGerencia"
import NuevoCliente from "./page/NuevoCliente"
import Cliente from "./page/Cliente"
import CrearProyecto from "./page/CrearProyecto"
import ActualizarProyecto from "./page/ActualizarProyecto"
import ReginDetalles from "./page/RegionDetalles"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./components/AuthContext"
import DetallesProyecto from "./page/DetallesProyecto"
import Gestion from "./page/Gestion"
import GestionProyectos from "./page/GestionProyectos"
import InicioGestion from "./page/InicioGestion"
import InicioAdministrador from "./page/InicioAdministrador"
import EditarCliente from "./page/EditarCliente"
import EditarProyectos from "./page/EditarProyectos"
import EditarAvanceProyectos from "./page/EditarAvanceProyectos"
import GestionProcura from "./page/GestionProcura"
import ProcedimientoComercial from "./page/ProcedimientoComercial"
import InicioProcura from "./page/InicioProcura"
import Footer from "./components/Footer"
import ActualizarProveedor from "./page/ActualizarProveedor"
import InicionProcedimientoComercial from "./page/InicionProcedimientoComercial"
import InicioAdministraciónContratos from "./page/InicioAdministraciónContratos"
import AdministracionContratos from "./page/AdministracionContratos"
import AvanceFinanciero from "./components/AvanceFinanciero"
import GestionUsuariosAdministracionContratos from "./page/GestionUsuariosAdministraciónContratos"
import ScrollToTop from "./components/ScrollToTop"
import EditarProcedimientoComercial from "./page/EditarProcedimientoComercial"

const App = () => {
  return (
    // Move BrowserRouter outside of AuthProvider
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        {/* Contenedor principal con flexbox y eliminación del scroll horizontal */}
        <div className="flex flex-col min-h-screen overflow-x-hidden">
          {/* Header siempre visible */}
          <Header />

          {/* Contenido principal (crece para ocupar el espacio disponible) */}
          <main className="flex-grow">
            <Routes>
              {/* Ruta pública: Inicio de sesión */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />

              {/* Rutas protegidas */}
              <Route
                path="/InicioProcedimientoComercial"
                element={
                  <ProtectedRoute>
                    <InicionProcedimientoComercial />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/InicioPlanificador"
                element={
                  <ProtectedRoute>
                    <InicioPlanificador />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/InicioPlanificador/GestionUsuariosAdministracionContratos"
                element={
                  <ProtectedRoute>
                    <GestionUsuariosAdministracionContratos />
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
                path="/InicioProcura/GestionProcura"
                element={
                  <ProtectedRoute>
                    <GestionProcura />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/InicioProcura/ActualizarProveedor"
                element={
                  <ProtectedRoute>
                    <ActualizarProveedor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/InicioProcedimientoComercial/ProcedimientoComercial"
                element={
                  <ProtectedRoute>
                    <ProcedimientoComercial />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/InicioAdministrador"
                element={
                  <ProtectedRoute>
                    <InicioAdministrador />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/InicioAdministrador/EditarCliente"
                element={
                  <ProtectedRoute>
                    <EditarCliente />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/InicioAdministrador/EditarProcedimientoComercial"
                element={
                  <ProtectedRoute>
                    <EditarProcedimientoComercial  />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/InicioAdministrador/EditarProyectos"
                element={
                  <ProtectedRoute>
                    <EditarProyectos />
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
                path="/InicioProcura"
                element={
                  <ProtectedRoute>
                    <InicioProcura />
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
                path="/InicioAdministrador/EditarProyectos/EditarAvanceProyectos/:Proyecto/:id"
                element={
                  <ProtectedRoute>
                    <EditarAvanceProyectos />
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
              <Route
                path="/InicioAdministraciónContratos"
                element={
                  <ProtectedRoute>
                    <InicioAdministraciónContratos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/InicioAdministraciónContratos/AdministracionContratos"
                element={
                  <ProtectedRoute>
                    <AdministracionContratos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/InicioAdministraciónContratos/AdministracionContratos/:nombre/:id"
                element={
                  <ProtectedRoute>
                    <AvanceFinanciero />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* Footer siempre al final */}
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
