/**
 * CONFIGURACIÓN BASE DE AXIOS
 *
 * Instancia que usan todos los servicios de la aplicación.
 *
 * Sesión (ver core/auth/session.js):
 * - El access token (15 min) se agrega desde memoria al header Authorization.
 * - withCredentials: el navegador envía la cookie httpOnly del refresh token,
 *   que solo viaja a /auth/* (Path=/auth en el servidor).
 * - Ante un 401 se renueva la sesión UNA vez con /auth/refresh y se reintenta
 *   la petición. Si varias peticiones fallan a la vez, todas esperan la misma
 *   renovación. Si la renovación falla, se cierra la sesión y se vuelve al login.
 *
 * Uso:
 * import axiosURL from './axiosURL';
 * axiosURL.get('/servicios');
 */

import axios from "axios";
import { getAccessToken, establecerSesion, limpiarSesion } from "../auth/session";

const egresosoApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/",
  withCredentials: true,
});

// Rutas de sesión: nunca disparan una renovación ni llevan el access token.
const RUTAS_SESION = ["/auth/login", "/auth/refresh", "/auth/logout"];
const esRutaSesion = (url = "") => RUTAS_SESION.some((r) => url.replace(/^\/?/, "/").startsWith(r));

egresosoApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !esRutaSesion(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let renovacionEnCurso = null;

/**
 * Renueva el access token con la cookie de refresh.
 *
 * Entre pestañas se serializa con Web Locks: el servidor ROTA el refresh en
 * cada uso y, si dos pestañas enviaran el mismo token a la vez, la segunda
 * parecería un robo y se revocarían todas las sesiones. Con el lock, la
 * segunda pestaña espera y envía la cookie ya rotada.
 * @returns {Promise<object>} datos de la sesión
 */
export function renovarSesion() {
  if (!renovacionEnCurso) {
    const pedir = () => egresosoApi.post("/auth/refresh").then((r) => r.data);
    const conLock = navigator.locks?.request
      ? navigator.locks.request("imprenta-auth-refresh", pedir)
      : pedir();
    renovacionEnCurso = conLock
      .then((datos) => {
        establecerSesion(datos, renovarSesion);
        return datos;
      })
      .finally(() => {
        renovacionEnCurso = null;
      });
  }
  return renovacionEnCurso;
}

function irAlLogin() {
  limpiarSesion();
  if (window.location.pathname !== "/") window.location.href = "/"; // el login vive en "/"
}

egresosoApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || !original || esRutaSesion(original.url)) {
      return Promise.reject(error);
    }
    if (original._reintentado) {
      irAlLogin();
      return Promise.reject(error);
    }
    try {
      await renovarSesion();
    } catch {
      irAlLogin();
      return Promise.reject(error);
    }
    original._reintentado = true;
    return egresosoApi(original);
  }
);

/** Inicia sesión: guarda el token en memoria y los datos de presentación. */
export async function iniciarSesion(credenciales) {
  const { data } = await egresosoApi.post("/auth/login", credenciales);
  establecerSesion(data, renovarSesion);
  return data;
}

/** Cierra la sesión en el servidor (revoca el refresh) y localmente. */
export async function cerrarSesion() {
  try {
    await egresosoApi.post("/auth/logout");
  } catch {
    // Aunque el servidor no responda, la sesión local se cierra igual.
  }
  limpiarSesion();
}

export default egresosoApi;
