import axiosURL from "../../core/api/axiosURL";

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

/**
 * Busca un cliente por DNI (8 dígitos) o RUC (11 dígitos).
 * El backend busca primero en BD, luego en API DeColecta.
 * @returns {{ source, tipo_documento_id, nrodoc, razon_social, direccion }}
 */
export const buscarClientePorDoc = async (nrodoc) => {
  const res = await axiosURL.get(`/cliente/buscar/${nrodoc}`);
  return res.data;
};
