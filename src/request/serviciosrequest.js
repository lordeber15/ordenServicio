import axios from "axios";

const serviciosApi = axios.create({
  baseURL: "https://impalexander.store/api/",
  //baseURL: "https://imprenta-imprenta-a2bsyh-c1440d-62-171-181-168.traefik.me/",
});
export const getServicios = async () => {
  const res = await serviciosApi.get("/servicios");
  return res.data;
};

export const createServicios = (servicios) => {
  return serviciosApi.post("/servicios", servicios);
};

export const updateServicios = (servicios) => {
  const serviciosCopy = { ...servicios };
  delete serviciosCopy.id;
  return serviciosApi.put(`/servicios/${servicios.id}`, serviciosCopy);
};

export const deleteServicios = (id) => {
  return serviciosApi.delete(`/servicios/${id}`);
};
