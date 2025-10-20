import axiosURL from "./axiosURL";

export const getEgresos = async () => {
  const res = await axiosURL.get("/egresos");
  return res.data;
};

export const createEgresos = (egresos) => {
  return axiosURL.post("/egresos", egresos);
};

export const updateEgresos = (egresos) => {
  const egresosCopy = { ...egresos };
  delete egresosCopy.id;
  return axiosURL.put(`/egresos/${egresos.id}`, egresosCopy);
};

export const deleteEgresos = (id) => {
  return axiosURL.delete(`/egresos/${id}`);
};
