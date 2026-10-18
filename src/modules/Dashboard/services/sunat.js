import axiosURL from "../../../core/api/axiosURL";

/** Lo que falta resolver con SUNAT (pendientes, rechazados, worker, certificado). */
export const getPendientesSunat = () => axiosURL.get("/sunat/pendientes").then((r) => r.data);
