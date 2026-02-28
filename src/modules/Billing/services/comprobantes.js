import axiosURL from "../../../core/api/axiosURL";

// ── CRUD Comprobante ────────────────────────────────────────────────────────

export const getComprobantes = async () => {
  const res = await axiosURL.get("/comprobante");
  return res.data;
};

export const createComprobante = (data) => axiosURL.post("/comprobante", data);

export const deleteComprobante = (id) => axiosURL.delete(`/comprobante/${id}`);

// ── Detalle (líneas del comprobante) ───────────────────────────────────────

export const createDetalle = (data) => axiosURL.post("/detalle", data);

export const deleteDetalle = (id) => axiosURL.delete(`/detalle/${id}`);

// ── SUNAT — Emisión electrónica ─────────────────────────────────────────────

/**
 * Emite el comprobante ante SUNAT.
 * @param {number} comprobante_id
 * @returns {{ success, codigo_sunat, mensaje_sunat, hash_cpe, pdf_url, xml_url }}
 */
export const emitirComprobante = (comprobante_id) =>
  axiosURL.post("/comprobante/emitir", { comprobante_id });

/**
 * Reintenta enviar un comprobante rechazado (estado RR).
 */
export const reenviarComprobante = (id) =>
  axiosURL.post(`/comprobante/${id}/reenviar`);

/**
 * Consulta el estado SUNAT del comprobante desde la BD.
 */
export const getEstadoComprobante = async (id) => {
  const res = await axiosURL.get(`/comprobante/${id}/estado`);
  return res.data;
};

/**
 * Retorna la URL para descarga del PDF.
 * El backend responde con res.download(), así que se abre en nueva pestaña.
 */
export const getPdfUrl = (id) => {
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000/";
  return `${base}comprobante/${id}/pdf`;
};

/**
 * Retorna la URL para descarga del XML firmado.
 */
export const getXmlUrl = (id) => {
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000/";
  return `${base}comprobante/${id}/xml`;
};

/**
 * Obtiene el PDF del comprobante como blob (para impresión directa via iframe).
 */
export const getComprobantePdf = (id, format = "a5") =>
  axiosURL.get(`/comprobante/${id}/pdf?format=${format}`, { responseType: "blob" });

/**
 * Lista comprobantes con filtro por tipo (07=NC, 01=Factura, etc.) y fecha opcional.
 */
export const listComprobantes = async (tipo, fecha) => {
  const params = new URLSearchParams();
  if (tipo) params.set("tipo", tipo);
  if (fecha) params.set("fecha", fecha);
  const qs = params.toString();
  const res = await axiosURL.get(`/comprobante/lista${qs ? `?${qs}` : ""}`);
  return res.data;
};

/**
 * Lista guías de remisión con filtro opcional por fecha.
 */
export const getGuias = async (fecha) => {
  const params = fecha ? `?fecha=${fecha}` : "";
  const res = await axiosURL.get(`/guia${params}`);
  return res.data;
};

/**
 * Obtiene el PDF de la guía de remisión como blob (para impresión directa via iframe).
 */
export const getGuiaPdf = (id) =>
  axiosURL.get(`/guia/${id}/pdf`, { responseType: "blob" });
