/**
 * API DE PRODUCTOS/INVENTARIO
 * 
 * Este módulo contiene todas las funciones para interactuar
 * con los endpoints de gestión de productos del inventario.
 * 
 * Endpoints del backend:
 * - GET /producto - Listar todos los productos
 * - POST /producto - Crear nuevo producto
 * - PUT /producto/:id - Actualizar producto
 * - DELETE /producto/:id - Eliminar producto
 * 
 * Los productos son los artículos disponibles en el inventario
 * de la imprenta (papel, tintas, materiales, etc.).
 */

import axiosURL from "../../../core/api/axiosURL";

/**
 * Obtener todos los productos
 * 
 * Retorna la lista completa de productos en el inventario.
 * 
 * @returns {Promise<Array>} Array de objetos de productos
 * @returns {number} return[].id - ID del producto
 * @returns {string} return[].nombre - Nombre del producto
 * @returns {string} return[].descripcion - Descripción del producto
 * @returns {number} return[].precio - Precio unitario
 * @returns {number} return[].stock - Cantidad en stock
 * @returns {string} return[].unidad - Unidad de medida
 * 
 * Ejemplo de uso:
 * const productos = await getProducto();
 * console.log(productos); // [{ id: 1, nombre: "Papel A4", ... }, ...]
 */
export const getProducto = async () => {
  const res = await axiosURL.get("/producto");
  return res.data;
};

/**
 * Crear nuevo producto
 * 
 * Registra un nuevo producto en el inventario.
 * Solo accesible para usuarios con rol Administrador.
 * 
 * @param {Object} producto - Datos del nuevo producto
 * @param {string} producto.nombre - Nombre del producto
 * @param {string} producto.descripcion - Descripción del producto
 * @param {number} producto.precio - Precio unitario
 * @param {number} producto.stock - Cantidad inicial en stock
 * @param {string} producto.unidad - Unidad de medida (ej: "unidad", "kg", "litro")
 * @returns {Promise} Respuesta con el producto creado
 * 
 * Ejemplo de uso:
 * await createProducto({
 *   nombre: "Papel Bond A4",
 *   descripcion: "Papel bond blanco 75g",
 *   precio: 0.10,
 *   stock: 5000,
 *   unidad: "unidad"
 * });
 */
export const createProducto = (producto) => {
  return axiosURL.post("/producto", producto);
};

/**
 * Actualizar producto existente
 * 
 * Actualiza los datos de un producto en el inventario.
 * El ID se extrae del objeto y se usa en la URL.
 * 
 * @param {Object} producto - Datos del producto a actualizar
 * @param {number} producto.id - ID del producto
 * @param {string} [producto.nombre] - Nuevo nombre
 * @param {string} [producto.descripcion] - Nueva descripción
 * @param {number} [producto.precio] - Nuevo precio
 * @param {number} [producto.stock] - Nuevo stock
 * @param {string} [producto.unidad] - Nueva unidad de medida
 * @returns {Promise} Respuesta con el producto actualizado
 * 
 * Ejemplo de uso:
 * await updateProducto({
 *   id: 1,
 *   precio: 0.12,
 *   stock: 4500
 * });
 */
export const updateProducto = (producto) => {
  // Crear copia del objeto para no mutar el original
  const productoCopy = { ...producto };
  
  // Eliminar ID del body (se usa en la URL)
  delete productoCopy.id;
  
  // PUT /producto/:id con el resto de datos en el body
  return axiosURL.put(`/producto/${producto.id}`, productoCopy);
};

/**
 * Eliminar producto
 * 
 * Elimina un producto del inventario.
 * Solo accesible para usuarios con rol Administrador.
 * 
 * @param {number} id - ID del producto a eliminar
 * @returns {Promise} Respuesta de confirmación
 * 
 * Ejemplo de uso:
 * await deleteProducto(5);
 */
export const deleteProducto = (id) => {
  return axiosURL.delete(`/producto/${id}`);
};
