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
 * Agrega automáticamente el token JWT al header Authorization.
 * Usa cache en memoria para evitar JSON.parse en cada petición.
 */
let cachedToken = null;
let lastRaw = null;

egresosoApi.interceptors.request.use((config) => {
  const raw = localStorage.getItem("userData");
  if (raw !== lastRaw) {
    lastRaw = raw;
    cachedToken = raw ? JSON.parse(raw)?.token : null;
  }
  if (cachedToken) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
  }
  return config;
});

// Exportar instancia configurada para usar en otros módulos
export default egresosoApi;
