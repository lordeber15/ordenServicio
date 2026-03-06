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

// Helper: reintenta el import dinámico recargando la página si el chunk no existe
const lazyRetry = (importFn) =>
  lazy(() =>
    importFn().catch(() => {
      const hasReloaded = sessionStorage.getItem("chunk-reload");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk-reload", "1");
        window.location.reload();
        return new Promise(() => {}); // nunca resuelve, la página se recarga
      }
      sessionStorage.removeItem("chunk-reload");
      return importFn(); // segundo intento real, deja que el error se propague
    })
  );

// Páginas (Lazy Loaded) - Modulares
const Login = lazyRetry(() => import("./modules/Auth/pages/LoginPage"));
const Dashboard = lazyRetry(() => import("./modules/Dashboard/pages/DashboardPage"));
const Perfil = lazyRetry(() => import("./modules/Auth/pages/ProfilePage"));
const Inventario = lazyRetry(() => import("./modules/Inventory/pages/InventoryPage"));
const Reportes = lazyRetry(() => import("./modules/Reports/pages/ReportsPage"));
const Ventas = lazyRetry(() => import("./modules/Sales/pages/SalesPage"));

// Páginas de Facturación (Lazy Loaded)
const Boleta = lazyRetry(() => import("./modules/Billing/pages/boleta"));
const Factura = lazyRetry(() => import("./modules/Billing/pages/factura"));
const Guiarem = lazyRetry(() => import("./modules/Billing/pages/guiaremision"));
const Guiatransp = lazyRetry(() => import("./modules/Billing/pages/guiatransportista"));
const Notacredito = lazyRetry(() => import("./modules/Billing/pages/notadecredito"));
const Ticket = lazyRetry(() => import("./modules/Billing/pages/ticket"));
const ListaGuias = lazyRetry(() => import("./modules/Billing/pages/listaGuias"));
const ListaNotasCredito = lazyRetry(() => import("./modules/Billing/pages/listaNotasCredito"));
const Clientes = lazyRetry(() => import("./modules/Billing/pages/clientes"));

// Páginas de Cotizaciones (Lazy Loaded)
const Cotizacion = lazyRetry(() => import("./modules/Almanaque/pages/almanaques"));
const ListaCotizacion = lazyRetry(() => import("./shared/components/almanaque/listaAlmanaque"));
const DetalleCotizacion = lazyRetry(() => import("./shared/components/almanaque/detallesAlmanaque"));

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
  const storedUserData = useMemo(() => JSON.parse(localStorage.getItem("userData") || "null"), []);
  
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
            <Route path="/guiatransp" element={<Guiatransp />} />
            <Route path="/notacredito" element={<Notacredito />} />
            <Route path="/ticket" element={<Ticket />} />
            <Route path="/guias" element={<ListaGuias />} />
            <Route path="/notascredito" element={<ListaNotasCredito />} />
            <Route path="/clientes" element={<Clientes />} />

            {/* Finanzas */}
            <Route path="/ingresos" element={<Ingresos />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/ventas" element={<Ventas />} />

            {/* Cotizaciones */}
            <Route path="/almanaque/new" element={<Cotizacion />} />
            <Route path="/almanaque" element={<ListaCotizacion />} />
            <Route path="/almanaque/:id" element={<DetalleCotizacion />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
