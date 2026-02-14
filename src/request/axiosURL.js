/**
 * CONFIGURACIÓN BASE DE AXIOS
 * 
 * Este archivo crea y configura la instancia principal de Axios
 * que se usa en todos los módulos de request de la aplicación.
 * 
 * Características:
 * - Base URL configurada desde variables de entorno
 * - Interceptor para agregar token JWT automáticamente
 * - Manejo centralizado de autenticación
 * 
 * Uso:
 * import axiosURL from './axiosURL';
 * axiosURL.get('/servicios');
 */

import axios from "axios";

/**
 * Instancia de Axios configurada
 * 
 * baseURL: URL base del backend API
 * - Producción: Desde VITE_API_URL en .env
 * - Desarrollo: http://localhost:3000/ por defecto
 * 
 * Todas las peticiones usarán esta URL base:
 * Ejemplo: axiosURL.get('/servicios') → GET http://localhost:3000/servicios
 */
const egresosoApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/",
});

/**
 * INTERCEPTOR DE REQUEST
 * 
 * Este interceptor se ejecuta ANTES de cada petición HTTP.
 * Agrega automáticamente el token JWT al header Authorization
 * si el usuario está autenticado.
 * 
 * Flujo:
 * 1. Lee userData desde localStorage
 * 2. Si existe token, lo agrega al header Authorization
 * 3. Formato: "Bearer <token>"
 * 
 * Esto permite que el backend verifique la autenticación
 * en rutas protegidas sin tener que agregar el token manualmente
 * en cada petición.
 * 
 * @param {Object} config - Configuración de la petición Axios
 * @returns {Object} Configuración modificada con token
 */
egresosoApi.interceptors.request.use((config) => {
  // Obtener datos del usuario desde localStorage
  const raw = localStorage.getItem("userData");
  
  if (raw) {
    const userData = JSON.parse(raw);
    
    // Si existe token, agregarlo al header Authorization
    if (userData.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
  }
  
  // Retornar configuración (con o sin token)
  return config;
});

// Exportar instancia configurada para usar en otros módulos
export default egresosoApi;
