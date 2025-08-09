import axios from "axios";

const ingresoApi = axios.create({
  baseURL: "https://impalexander.store/api/",
});
export const getIngresos = async () => {
  const res = await ingresoApi.get("/ingresos");
  return res.data;
};

export const createIngresos = (ingresos) => {
  return ingresoApi.post("/ingresos", ingresos);
};

export const updateIngresos = (ingresos) => {
  const ingresosCopy = { ...ingresos };
  delete ingresosCopy.id;
  return ingresoApi.put(`/ingresos/${ingresos.id}`, ingresosCopy);
};

export const deleteIngresos = (id) => {
  return ingresoApi.delete(`/ingresos/${id}`);
};
