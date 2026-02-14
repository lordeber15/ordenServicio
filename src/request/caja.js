import axiosURL from "./axiosURL";

export const getCajaActual = () =>
  axiosURL.get("/caja/actual").then((r) => r.data);

export const abrirCaja = (payload) =>
  axiosURL.post("/caja/apertura", payload);

export const cerrarCaja = (id, payload) =>
  axiosURL.put(`/caja/${id}/cierre`, payload);

export const getHistorialCaja = () =>
  axiosURL.get("/caja/historial").then((r) => r.data);

export const getVentasDia = (fecha, tipo = "all") =>
  axiosURL.get(`/ventas/dia?fecha=${fecha}&tipo=${tipo}`).then((r) => r.data);
