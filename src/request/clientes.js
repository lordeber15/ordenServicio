import axiosURL from "./axiosURL";

export const getClientes = async () => {
  const res = await axiosURL.get("/cliente");
  return res.data;
};

/**
 * Busca un cliente por nro de documento.
 * Retorna el cliente si existe, null si no.
 */
export const findClienteByDoc = async (nrodoc) => {
  const clientes = await getClientes();
  return clientes.find((c) => c.nrodoc === nrodoc) || null;
};

/**
 * Crea un cliente en la BD.
 * @param {{ tipo_documento_id, nrodoc, razon_social, direccion }} data
 */
export const createCliente = (data) => axiosURL.post("/cliente", data);

export const updateCliente = (id, data) => axiosURL.put(`/cliente/${id}`, data);

export const deleteCliente = (id) => axiosURL.delete(`/cliente/${id}`);
