import axios from "axios";

const egresosoApi = axios.create({
  baseURL: "https://api.impalexander.store/api/",
});
export const getEgresos = async () => {
  const res = await egresosoApi.get("/egresos");
  return res.data;
};

export const createEgresos = (egresos) => {
  return egresosoApi.post("/egresos", egresos);
};

export const updateEgresos = (egresos) => {
  const egresosCopy = { ...egresos };
  delete egresosCopy.id;
  return egresosoApi.put(`/egresos/${egresos.id}`, egresosCopy);
};

export const deleteEgresos = (id) => {
  return egresosoApi.delete(`/egresos/${id}`);
};
