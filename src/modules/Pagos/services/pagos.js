import axiosURL from "../../../core/api/axiosURL";

/**
 * PAGOS YAPE/PLIN (solo Administrador)
 *
 * Los montos llegan como string con 2 decimales ("1250.50") y se muestran
 * tal cual: nunca se suman ni se convierten a number en el cliente; los
 * totales los calcula el backend.
 */

/** @param {{from?: string, to?: string, provider?: string, q?: string, page?: number, pageSize?: number}} filtros */
const params = (filtros = {}) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filtros)) if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  return p.toString();
};

export const getPagos = async (filtros) => (await axiosURL.get(`/api/v1/payments?${params(filtros)}`)).data;
export const getTotales = async (filtros) => (await axiosURL.get(`/api/v1/payments/totals?${params(filtros)}`)).data;
export const getResumen = async () => (await axiosURL.get("/api/v1/payments/summary")).data;
export const getPago = async (id) => (await axiosURL.get(`/api/v1/payments/${id}`)).data;
export const exportarCsv = (filtros) => axiosURL.get(`/api/v1/payments/export.csv?${params(filtros)}`, { responseType: "blob" });

export const getNoReconocidas = async (status = "UNPARSED", page = 1) =>
  (await axiosURL.get(`/api/v1/notifications/unparsed?${params({ status, page, pageSize: 50 })}`)).data;

export const getDispositivos = async () => (await axiosURL.get("/api/v1/devices")).data;
export const crearCodigoEnlace = async () => (await axiosURL.post("/api/v1/devices/enroll-tokens")).data;
export const revocarDispositivo = (id) => axiosURL.delete(`/api/v1/devices/${id}`);

/** "1250.50" → "S/ 1,250.50" sin pasar por number. */
export function formatoSoles(monto) {
  const [entero, dec = "00"] = String(monto ?? "0.00").split(".");
  return `S/ ${entero.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${dec.padEnd(2, "0")}`;
}

const formatoHora = new Intl.DateTimeFormat("es-PE", {
  timeZone: "America/Lima", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
});
export const horaLima = (iso) => (iso ? formatoHora.format(new Date(iso)) : "—");
