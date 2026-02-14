/**
 * COMPONENTE PRINCIPAL DE LA APLICACIÓN
 * 
 * Este componente define la estructura de rutas de la aplicación y maneja:
 * - Configuración de rutas públicas y protegidas
 * - Renderizado condicional del Navbar
 * - Sistema de notificaciones toast
 * 
 * Estructura de rutas:
 * - Ruta pública: "/" (Login)
 * - Rutas protegidas: Todas las demás (requieren autenticación)
 */

import { lazy, Suspense, useMemo } from "react";
import "./App.css";

// Páginas (Lazy Loaded)
const Login = lazy(() => import("./pages/login"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Perfil = lazy(() => import("./pages/perfil"));
const Inventario = lazy(() => import("./pages/inventario"));
const Reportes = lazy(() => import("./pages/reportes"));
const Ventas = lazy(() => import("./pages/ventas"));

// Páginas de Facturación (Lazy Loaded)
const Boleta = lazy(() => import("./pages/facturacion/boleta"));
const Factura = lazy(() => import("./pages/facturacion/factura"));
const Guiarem = lazy(() => import("./pages/facturacion/guiaremision"));
const Notacredito = lazy(() => import("./pages/facturacion/notadecredito"));
const Ticket = lazy(() => import("./pages/facturacion/ticket"));

// Páginas de Almanaques (Lazy Loaded)
const Almanaque = lazy(() => import("./pages/Almanaques/almanaques"));
const ListaAlmanaque = lazy(() => import("./components/almanaque/listaAlmanaque"));
const DetallesAlmanaque = lazy(() => import("./components/almanaque/detallesAlmanaque"));

// Componentes
import NavBar from "./components/navbar";
import Ingresos from "./components/ingresosEgresos/ingresos";
import ProtectedRoutes from "./components/protectedRoutes";

// Librerías
import { Route, Routes, useLocation } from "react-router";
import { Toaster } from "react-hot-toast";

/**
 * Componente de carga para Suspense
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
  </div>
);

/**
 * Componente App
 * 
 * @returns {JSX.Element} Estructura principal de la aplicación con rutas
 */
function App() {
  /**
   * Memoiza los datos del usuario para evitar parsear el JSON en cada renderizado
   */
  const storedUserData = useMemo(() => 
    JSON.parse(localStorage.getItem("userData") || "null"), 
  []);
  
  /**
   * Hook para obtener la ubicación actual (pathname)
   * Se usa para renderizar condicionalmente el Navbar
   */
  const locationNow = useLocation();

  return (
    <div>
      <Toaster position="bottom-right" reverseOrder={false} />
      
      {locationNow.pathname !== "/" && <NavBar />}
      
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* RUTA PÚBLICA - Login */}
          <Route path="/" element={<Login />} />
          
          {/* RUTAS PROTEGIDAS */}
          <Route element={<ProtectedRoutes user={storedUserData} />}>
            {/* Dashboard y Gestión */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/inventario" element={<Inventario />} />
            
            {/* Facturación Electrónica */}
            <Route path="/boleta" element={<Boleta />} />
            <Route path="/factura" element={<Factura />} />
            <Route path="/guiarem" element={<Guiarem />} />
            <Route path="/notacredito" element={<Notacredito />} />
            <Route path="/ticket" element={<Ticket />} />
            
            {/* Finanzas */}
            <Route path="/ingresos" element={<Ingresos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/ventas" element={<Ventas />} />

            {/* Almanaques */}
            <Route path="/almanaque/new" element={<Almanaque />} />
            <Route path="/almanaque" element={<ListaAlmanaque />} />
            <Route path="/almanaque/:id" element={<DetallesAlmanaque />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
