/**
 * PÁGINA DE LOGIN
 * 
 * Página de autenticación de la aplicación.
 * 
 * Funcionalidades:
 * - Formulario de login con usuario y contraseña
 * - Validación de campos obligatorios
 * - Autenticación con React Query (useMutation)
 * - Sesión: token en memoria + cookie httpOnly (ver core/auth/session.js)
 * - Redirección automática al dashboard tras login exitoso
 * - Notificaciones toast para éxito y errores
 * - Soporte para Enter key en campo de contraseña
 * - Estado de carga durante autenticación
 * 
 * Flujo:
 * 1. Usuario ingresa credenciales
 * 2. Click en "Ingresar" o Enter en contraseña
 * 3. Validación de campos
 * 4. Petición POST /auth/login
 * 5. Si exitoso: Guardar token y redirigir a /dashboard
 * 6. Si error: Mostrar mensaje de error
 */

import { useState } from "react";
import logo from "../../../assets/ALEXANDER.webp";
import { Navigate, useNavigate } from "react-router";
import { useSesion } from "../../../core/auth/useSesion";
import { useMutation } from "@tanstack/react-query";
import { authLogin } from "../services/loginrequest";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

function Login() {
  /**
   * ESTADO DEL COMPONENTE
   * 
   * - usuario: Nombre de usuario ingresado
   * - contrasena: Contraseña ingresada
   * - navigate: Hook para navegación programática
   */
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { estado } = useSesion();

  /**
   * MUTACIÓN DE LOGIN CON REACT QUERY
   * 
   * useMutation maneja el estado de la petición HTTP:
   * - isPending: true mientras la petición está en curso
   * - isError: true si hubo un error
   * - isSuccess: true si fue exitosa
   * 
   * Callbacks:
   * - onSuccess: Se ejecuta cuando la petición es exitosa
   * - onError: Se ejecuta cuando hay un error
   */
  const loginMutation = useMutation({
    mutationFn: (credentials) => authLogin(credentials),
    
    /**
     * CALLBACK: Login exitoso
     * 
     * La sesión ya quedó guardada por authLogin (core/api/axiosURL.js).
     */
    onSuccess: () => {
      toast.success("¡Acceso correcto!");
      navigate("/dashboard");
    },
    
    /**
     * CALLBACK: Error en login
     * 
     * Muestra el mensaje de error del servidor o un mensaje genérico.
     * Posibles errores:
     * - 400: Campos faltantes
     * - 401: Credenciales incorrectas
     * - 500: Error del servidor
     */
    onError: (err) => {
      const msg = err.response?.data?.message || "Error al conectar con el servidor";
      toast.error(msg);
    },
  });

  /**
   * HANDLER: Enviar formulario de login
   * 
   * Valida que ambos campos estén completos antes de enviar.
   * Ejecuta la mutación de login con las credenciales.
   */
  const handleIngresar = () => {
    // Validar campos obligatorios
    if (!usuario || !contrasena) {
      toast.error("Debes completar usuario y contraseña");
      return;
    }
    
    // Ejecutar mutación de login
    loginMutation.mutate({ usuario, password: contrasena });
  };

  // Con sesión vigente (cookie de refresh válida) no tiene sentido mostrar el login.
  if (estado === "autenticado" && !loginMutation.isPending) return <Navigate to="/dashboard" replace />;

  return (
    // Contenedor principal con gradiente de fondo
    <div className="flex justify-center bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-slate-900 dark:to-sky-900 transition-colors duration-500">
      <div className="flex flex-col p-4 gap-4 justify-center items-center max-w-2xl h-screen">
        {/* Logo de la empresa con animación */}
        <img
          src={logo}
          className="w-7/12 animate-fade-down animate-once animate-duration-1000 animate-ease-in-out"
          alt="logo"
        />
        
        {/* INPUT: Usuario */}
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="p-2 w-11/12 sm:w-8/12 border rounded-md font-bold px-4 text-amber-50 bg-transparent placeholder:text-amber-100"
          placeholder="Nombre"
        />
        {/* INPUT: Contraseña con soporte para Enter */}
        <div className="relative w-11/12 sm:w-8/12">
          <input
            type={showPassword ? "text" : "password"}
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleIngresar()}
            className="p-2 w-full border rounded-md font-bold px-4 pr-12 text-amber-50 bg-transparent placeholder:text-amber-100"
            placeholder="Contraseña"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-200 hover:text-white transition cursor-pointer"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {/* BOTÓN: Ingresar con estado de carga */}
        <button
          onClick={handleIngresar}
          disabled={loginMutation.isPending}
          className={`w-11/12 sm:w-8/12 bg-cyan-500 rounded-md p-2 text-white font-bold flex justify-center cursor-pointer ${
            loginMutation.isPending
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-cyan-400"
          }`}
        >
          {/* Texto condicional según estado de carga */}
          {loginMutation.isPending ? "Ingresando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}

export default Login;
