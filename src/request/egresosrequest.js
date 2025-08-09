import axios from "axios";

const egresosoApi = axios.create({
  baseURL: "https://impalexander.store/api/",
});
export const getLogin = async () => {
  const res = await egresosoApi.get("/egresos");
  return res.data;
};

export const createLogin = (egresos) => {
  return egresosoApi.post("/egresos", egresos);
};

export const updateLogin = (egresos) => {
  const egresosCopy = { ...egresos };
  delete egresosCopy.id;
  return egresosoApi.put(`/egresos/${egresos.id}`, egresosCopy);
};

export const deleteLogin = (id) => {
  return egresosoApi.delete(`/egresos/${id}`);
};
