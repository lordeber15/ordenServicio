import axios from "axios";

const unidadesApi = axios.create({
  baseURL: "https://impalexander.store/api/",
});
export const getUnidades = async () => {
  const res = await unidadesApi.get("/unidad");
  return res.data;
};

export const createUnidades = (unidades) => {
  return unidadesApi.post("/unidad", unidades);
};

export const updateUnidades = (unidades) => {
  const unidadesCopy = { ...unidades };
  delete unidadesCopy.id;
  return unidadesApi.put(`/unidad/${unidades.id}`, unidadesCopy);
};

export const deleteUnidades = (id) => {
  return unidadesApi.delete(`/unidad/${id}`);
};
