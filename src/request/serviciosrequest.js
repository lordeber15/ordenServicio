/**
 * API DE SERVICIOS/TRABAJOS
 * 
 * Este módulo contiene todas las funciones para interactuar
 * con los endpoints de órdenes de servicio/trabajos de la imprenta.
 * 
 * Endpoints del backend:
 * - GET /servicios - Listar todos los trabajos
 * - POST /servicios - Crear nuevo trabajo
 * - PUT /servicios/:id - Actualizar trabajo
 * - DELETE /servicios/:id - Eliminar trabajo
 * 
 * Los servicios/trabajos representan las órdenes de trabajo
 * que se gestionan en el dashboard principal.
 */

import axiosURL from "./axiosURL";

/**
 * Obtener todos los servicios/trabajos
 * 
 * Retorna la lista completa de trabajos registrados en el sistema.
 * 
 * @returns {Promise<Array>} Array de objetos de servicios
 * @returns {number} return[].id - ID del servicio
 * @returns {string} return[].nombre - Nombre del cliente
 * @returns {number} return[].cantidad - Cantidad de productos
 * @returns {string} return[].trabajo - Descripción del trabajo
 * @returns {string} return[].estado - Estado (Pendiente, Diseño, Impresión, Terminado, Entregado)
 * @returns {number} return[].total - Monto total
 * @returns {number} return[].acuenta - Monto a cuenta
 * 
 * Ejemplo de uso:
 * const servicios = await getServicios();
 * console.log(servicios); // [{ id: 1, nombre: "Juan", ... }, ...]
 */
export const getServicios = async () => {
  const res = await axiosURL.get("/servicios");
  return res.data;
};

/**
 * Crear nuevo servicio/trabajo
 * 
 * Registra un nuevo trabajo en el sistema.
 * 
 * @param {Object} servicios - Datos del nuevo servicio
 * @param {string} servicios.nombre - Nombre del cliente
 * @param {number} servicios.cantidad - Cantidad de productos
 * @param {string} servicios.trabajo - Descripción del trabajo
 * @param {string} servicios.estado - Estado inicial (ej: "Pendiente")
 * @param {number} servicios.total - Monto total
 * @param {number} servicios.acuenta - Monto a cuenta
 * @returns {Promise} Respuesta con el servicio creado
 * 
 * Ejemplo de uso:
 * await createServicios({
 *   nombre: "Juan Pérez",
 *   cantidad: 100,
 *   trabajo: "Tarjetas de presentación",
 *   estado: "Pendiente",
 *   total: 150,
 *   acuenta: 50
 * });
 */
export const createServicios = (servicios) => {
  return axiosURL.post("/servicios", servicios);
};

/**
 * Actualizar servicio/trabajo existente
 * 
 * Actualiza los datos de un trabajo.
 * El ID se extrae del objeto y se usa en la URL.
 * 
 * @param {Object} servicios - Datos del servicio a actualizar
 * @param {number} servicios.id - ID del servicio
 * @param {string} [servicios.nombre] - Nuevo nombre del cliente
 * @param {number} [servicios.cantidad] - Nueva cantidad
 * @param {string} [servicios.trabajo] - Nueva descripción
 * @param {string} [servicios.estado] - Nuevo estado
 * @param {number} [servicios.total] - Nuevo total
 * @param {number} [servicios.acuenta] - Nuevo monto a cuenta
 * @returns {Promise} Respuesta con el servicio actualizado
 * 
 * Ejemplo de uso:
 * await updateServicios({
 *   id: 1,
 *   estado: "Terminado",
 *   acuenta: 150
 * });
 */
export const updateServicios = (servicios) => {
  // Crear copia del objeto para no mutar el original
  const serviciosCopy = { ...servicios };
  
  // Eliminar ID del body (se usa en la URL)
  delete serviciosCopy.id;
  
  // PUT /servicios/:id con el resto de datos en el body
  return axiosURL.put(`/servicios/${servicios.id}`, serviciosCopy);
};

/**
 * Eliminar servicio/trabajo
 * 
 * Elimina un trabajo del sistema.
 * 
 * @param {number} id - ID del servicio a eliminar
 * @returns {Promise} Respuesta de confirmación
 * 
 * Ejemplo de uso:
 * await deleteServicios(5);
 */
export const deleteServicios = (id) => {
  return axiosURL.delete(`/servicios/${id}`);
};
