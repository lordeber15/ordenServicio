import axiosURL from "./axiosURL";

/**
 * MÓDULO DE PETICIONES PARA UNIDADES DE MEDIDA
 * 
 * Encapsula las llamadas a la API para gestionar el catálogo de unidades.
 */

/**
 * Lista todas las unidades de medida
 */
export const getUnidades = async () => {
  const res = await axiosURL.get("/unidad");
  return res.data;
};

export const createUnidades = (unidades) => {
  return axiosURL.post("/unidad", unidades);
};

export const updateUnidades = (unidades) => {
  const unidadesCopy = { ...unidades };
  delete unidadesCopy.id;
  return axiosURL.put(`/unidad/${unidades.id}`, unidadesCopy);
};

export const deleteUnidades = (id) => {
  return axiosURL.delete(`/unidad/${id}`);
};
