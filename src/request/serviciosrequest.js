import axiosURL from "./axiosURL";

export const getServicios = async () => {
  const res = await axiosURL.get("/servicios");
  return res.data;
};

export const createServicios = (servicios) => {
  return axiosURL.post("/servicios", servicios);
};

export const updateServicios = (servicios) => {
  const serviciosCopy = { ...servicios };
  delete serviciosCopy.id;
  return axiosURL.put(`/servicios/${servicios.id}`, serviciosCopy);
};

export const deleteServicios = (id) => {
  return axiosURL.delete(`/servicios/${id}`);
};
