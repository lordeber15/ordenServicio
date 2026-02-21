import axiosURL from "../../core/api/axiosURL";

export const getIngresos = async () => {
  const res = await axiosURL.get("/ingresos");
  return res.data;
};

export const createIngresos = (ingresos) => {
  return axiosURL.post("/ingresos", ingresos);
};

export const updateIngresos = (ingresos) => {
  const ingresosCopy = { ...ingresos };
  delete ingresosCopy.id;
  return axiosURL.put(`/ingresos/${ingresos.id}`, ingresosCopy);
};

export const deleteIngresos = (id) => {
  return axiosURL.delete(`/ingresos/${id}`);
};
