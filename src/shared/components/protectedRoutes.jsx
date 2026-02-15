/**
 * COMPONENTE DE RUTAS PROTEGIDAS
 * 
 * Este componente actúa como un "guard" (guardia) de rutas.
 * Verifica si el usuario está autenticado antes de permitir
 * el acceso a rutas protegidas.
 * 
 * Flujo:
 * 1. Verifica si existe user.token
 * 2. Si NO hay token → Redirige al login
 * 3. Si SÍ hay token → Renderiza las rutas hijas (Outlet)
 * 
 * Uso en App.jsx:
 * <Route element={<ProtectedRoutes user={userData} />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 *   <Route path="/perfil" element={<Perfil />} />
 * </Route>
 */

import { Navigate, Outlet } from "react-router";

/**
 * Componente ProtectedRoutes
 * 
 * @param {Object} props - Props del componente
 * @param {Object} props.user - Datos del usuario desde localStorage
 * @param {string} props.user.token - Token JWT de autenticación
 * @param {string} [props.redirecTo="/"] - Ruta de redirección si no está autenticado
 * @returns {JSX.Element} Navigate (si no autenticado) u Outlet (si autenticado)
 */
function ProtectedRoutes({ user, redirecTo = "/" }) {
  /**
   * VERIFICACIÓN DE AUTENTICACIÓN
   * 
   * Verifica si existe el token en el objeto user.
   * Si no existe token, el usuario no está autenticado.
   * 
   * Operador ?. (optional chaining):
   * - user?.token → Retorna undefined si user es null/undefined
   * - Evita errores "Cannot read property 'token' of null"
   */
  if (!user?.token) {
    // Usuario NO autenticado → Redirigir al login
    return <Navigate to={redirecTo} />;
  }
  
  /**
   * RENDERIZAR RUTAS HIJAS
   * 
   * Outlet es un componente de react-router que renderiza
   * las rutas hijas definidas en el Route padre.
   * 
   * Si llegamos aquí, el usuario está autenticado y puede
   * acceder a las rutas protegidas.
   */
  return <Outlet />;
}

export default ProtectedRoutes;
