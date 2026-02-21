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

import { lazy, Suspense } from "react";
import "./App.css";

// Páginas (Lazy Loaded) - Modulares
const Login = lazy(() => import("./modules/Auth/pages/LoginPage"));
const Dashboard = lazy(() => import("./modules/Dashboard/pages/DashboardPage"));
const Perfil = lazy(() => import("./modules/Auth/pages/ProfilePage"));
const Inventario = lazy(() => import("./modules/Inventory/pages/InventoryPage"));
const Reportes = lazy(() => import("./modules/Reports/pages/ReportsPage"));
const Ventas = lazy(() => import("./modules/Sales/pages/SalesPage"));

// Páginas de Facturación (Lazy Loaded)
const Boleta = lazy(() => import("./modules/Billing/pages/boleta"));
const Factura = lazy(() => import("./modules/Billing/pages/factura"));
const Guiarem = lazy(() => import("./modules/Billing/pages/guiaremision"));
const Notacredito = lazy(() => import("./modules/Billing/pages/notadecredito"));
const Ticket = lazy(() => import("./modules/Billing/pages/ticket"));

// Páginas de Almanaques (Lazy Loaded)
const Almanaque = lazy(() => import("./modules/Almanaque/pages/almanaques"));
const ListaAlmanaque = lazy(() => import("./shared/components/almanaque/listaAlmanaque"));
const DetallesAlmanaque = lazy(() => import("./shared/components/almanaque/detallesAlmanaque"));

// Componentes
import NavBar from "./shared/components/navbar";
import Ingresos from "./shared/components/ingresosEgresos/ingresos";
import ProtectedRoutes from "./shared/components/protectedRoutes";

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
  const storedUserData = JSON.parse(localStorage.getItem("userData") || "null");
  
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
