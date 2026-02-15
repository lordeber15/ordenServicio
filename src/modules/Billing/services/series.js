import axiosURL from "../../../core/api/axiosURL";

export const getSeries = async () => {
  const res = await axiosURL.get("/serie");
  return res.data;
};

/**
 * Filtra las series por tipo de comprobante.
 * @param {"01"|"03"|"07"|"08"} tipo
 */
export const getSeriesByTipo = async (tipo) => {
  const series = await getSeries();
  return series.filter((s) => s.tipo_comprobante_id === tipo);
};

export const createSerie = (data) => axiosURL.post("/serie", data);
