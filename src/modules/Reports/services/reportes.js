import axiosURL from "../../../core/api/axiosURL";

/**
 * Catálogo de formatos electrónicos que cubre el reporte.
 * El código es el mismo que usa SUNAT y con el que filtra el backend.
 */
export const FORMATOS = [
  { codigo: "01", label: "Facturas",              corto: "Factura" },
  { codigo: "03", label: "Boletas",               corto: "Boleta" },
  { codigo: "07", label: "Notas de Crédito",      corto: "N. Crédito" },
  { codigo: "08", label: "Notas de Débito",       corto: "N. Débito" },
  { codigo: "09", label: "Guías Remitente",       corto: "Guía Rem." },
  { codigo: "31", label: "Guías Transportista",   corto: "Guía Transp." },
];

/** Códigos que corresponden a guías de remisión (viven en otra tabla y otra ruta). */
export const CODIGOS_GUIA = ["09", "31"];

export const esGuia = (tipo) => CODIGOS_GUIA.includes(tipo);

/**
 * Reporte de documentos aceptados por SUNAT en un rango de fechas.
 *
 * @param {Object} filtros
 * @param {string[]} filtros.tipos            Códigos de formato; vacío = todos
 * @param {string}   filtros.desde            YYYY-MM-DD
 * @param {string}   filtros.hasta            YYYY-MM-DD
 * @param {string}   [filtros.cliente]        Razón social o nro. de documento
 * @param {string}   [filtros.serie]
 * @param {boolean}  [filtros.incluirAnulados]
 * @param {number}   [filtros.page]
 * @param {number}   [filtros.limit]
 * @returns {Promise<{documentos: Array, paginacion: Object, truncado: boolean}>}
 */
export const getReporteDocumentos = async ({
  tipos = [],
  desde,
  hasta,
  cliente,
  serie,
  incluirAnulados = false,
  page = 1,
  limit = 25,
}) => {
  const params = new URLSearchParams();
  if (tipos.length) params.set("tipos", tipos.join(","));
  if (desde) params.set("desde", desde);
  if (hasta) params.set("hasta", hasta);
  if (cliente) params.set("cliente", cliente);
  if (serie) params.set("serie", serie);
  if (incluirAnulados) params.set("incluir_anulados", "1");
  params.set("page", String(page));
  params.set("limit", String(limit));

  const res = await axiosURL.get(`/reportes/documentos?${params.toString()}`);
  return res.data;
};
