import axiosURL from "./axiosURL";

export const getProducto = async () => {
  const res = await axiosURL.get("/producto");
  return res.data;
};

export const createProducto = (producto) => {
  return axiosURL.post("/producto", producto);
};

export const updateProducto = (producto) => {
  const productoCopy = { ...producto };
  delete productoCopy.id;
  return axiosURL.put(`/producto/${producto.id}`, productoCopy);
};

export const deleteProducto = (id) => {
  return axiosURL.delete(`/producto/${id}`);
};
