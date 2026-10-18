/**
 * ESTADO DE SESIÓN
 *
 * - El access token vive SOLO en memoria (esta variable de módulo). Nunca se
 *   guarda en localStorage: un script inyectado (XSS) podría leerlo.
 * - La sesión larga es una cookie httpOnly (refresh token) que JavaScript no
 *   puede ver; al recargar la página se recupera el access token con
 *   POST /auth/refresh.
 * - En localStorage("userData") solo quedan datos de presentación
 *   (nombre, cargo, foto, formatos) que leen navbar, drawer, etc.
 *
 * estado: "cargando" (restaurando al abrir la app) | "autenticado" | "anonimo"
 */

const CLAVE_USUARIO = "userData";

let accessToken = null;
let timerRenovacion = null;
let snapshot = { estado: "cargando", usuario: null };
const suscriptores = new Set();

function emitir(nuevo) {
  snapshot = nuevo;
  suscriptores.forEach((fn) => fn());
}

export const getAccessToken = () => accessToken;
export const getSnapshot = () => snapshot;
export const subscribe = (fn) => {
  suscriptores.add(fn);
  return () => suscriptores.delete(fn);
};

/** Datos de presentación guardados (sin token). */
export function leerUsuarioGuardado() {
  try {
    const raw = JSON.parse(localStorage.getItem(CLAVE_USUARIO) || "null");
    if (raw && "token" in raw) {
      // Sesiones de versiones anteriores guardaban el JWT aquí: se elimina.
      delete raw.token;
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(raw));
    }
    return raw;
  } catch {
    return null;
  }
}

/**
 * Guarda una sesión recibida de /auth/login o /auth/refresh y programa la
 * renovación un minuto antes de que venza el access token.
 * @param {{access_token: string, expires_in: number, usuario: object}} datos
 * @param {() => Promise<unknown>} renovar  función que llama a /auth/refresh
 */
export function establecerSesion({ access_token, expires_in, usuario }, renovar) {
  accessToken = access_token;
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  clearTimeout(timerRenovacion);
  if (renovar && expires_in > 0) {
    const ms = Math.max(10, expires_in - 60) * 1000;
    timerRenovacion = setTimeout(() => renovar().catch(() => {}), ms);
  }
  emitir({ estado: "autenticado", usuario });
}

/** Actualiza datos de presentación (p. ej. la foto) sin tocar el token. */
export function actualizarUsuario(cambios) {
  const usuario = { ...(snapshot.usuario || leerUsuarioGuardado() || {}), ...cambios };
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
  emitir({ ...snapshot, usuario });
}

export function limpiarSesion() {
  accessToken = null;
  clearTimeout(timerRenovacion);
  localStorage.removeItem(CLAVE_USUARIO);
  emitir({ estado: "anonimo", usuario: null });
}
