/**
 * COMPONENTE DE RUTAS PROTEGIDAS
 *
 * Guardia de rutas según el estado de sesión (core/auth/session.js):
 * - "cargando": la app está restaurando la sesión con la cookie de refresh
 *   (recién abierta o recargada) → indicador de carga.
 * - "anonimo": sin sesión → redirige al login.
 * - "autenticado": renderiza las rutas hijas (Outlet).
 *
 * Uso en App.jsx:
 * <Route element={<ProtectedRoutes />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 */

import { Navigate, Outlet } from "react-router";
import { useSesion } from "../../core/auth/useSesion";

function ProtectedRoutes({ redirecTo = "/" }) {
  const { estado } = useSesion();

  if (estado === "cargando") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-700"></div>
      </div>
    );
  }
  if (estado !== "autenticado") return <Navigate to={redirecTo} replace />;
  return <Outlet />;
}

export default ProtectedRoutes;
