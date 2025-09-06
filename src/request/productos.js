import axios from "axios";

const productoApi = axios.create({
  baseURL: "https://impalexander.store/api/",
});
export const getProducto = async () => {
  const res = await productoApi.get("/producto");
  return res.data;
};

export const createProducto = (producto) => {
  return productoApi.post("/producto", producto);
};

export const updateProducto = (producto) => {
  const productoCopy = { ...producto };
  delete productoCopy.id;
  return productoApi.put(`/producto/${producto.id}`, productoCopy);
};

export const deleteProducto = (id) => {
  return productoApi.delete(`/producto/${id}`);
};
