/**
 * API DE CONSULTA RENIEC
 * 
 * Este módulo maneja la integración con la API de RENIEC
 * para consultar datos de personas por DNI.
 * 
 * RENIEC (Registro Nacional de Identificación y Estado Civil)
 * es la entidad peruana que gestiona la identidad de los ciudadanos.
 * 
 * Endpoint:
 * - GET /api/reniec/:dni - Consultar datos por DNI
 * 
 * Uso principal:
 * - Auto-completar datos del cliente en formularios de facturación
 * - Validar identidad de clientes
 */

import axios from "axios";

/**
 * Instancia de Axios para RENIEC
 * 
 * Se crea una instancia separada porque la API de RENIEC
 * puede tener una URL base diferente al backend principal.
 * 
 * baseURL:
 * - Producción: Desde RENIEC_API_URL en .env
 * - Desarrollo: https://localhost:3000/api/reniec/ por defecto
 */
const reniecApi = axios.create({
  baseURL:
    import.meta.env.RENIEC_API_URL || "https://localhost:3000/api/reniec/",
});

/**
 * Consultar datos de persona por DNI
 * 
 * Realiza una consulta a la API de RENIEC para obtener
 * los datos de una persona a partir de su DNI.
 * 
 * @param {string} dni - Número de DNI (8 dígitos)
 * @returns {Promise<Object>} Datos de la persona
 * @returns {string} return.nombres - Nombres de la persona
 * @returns {string} return.apellidoPaterno - Apellido paterno
 * @returns {string} return.apellidoMaterno - Apellido materno
 * @returns {string} return.dni - DNI consultado
 * @throws {Error} Si el DNI no existe o hay error en la consulta
 * 
 * Ejemplo de uso:
 * try {
 *   const persona = await getReniec("12345678");
 *   console.log(persona.nombres); // "JUAN"
 *   console.log(persona.apellidoPaterno); // "PEREZ"
 * } catch (error) {
 *   console.error("DNI no encontrado");
 * }
 * 
 * IMPORTANTE:
 * - El token debe mantenerse seguro y no exponerse en el código
 * - Idealmente debería estar en variables de entorno
 * - La API de RENIEC puede tener límites de consultas
 */
export const getReniec = async (dni) => {
  /**
   * TOKEN DE AUTENTICACIÓN
   * 
   * Token de acceso a la API de RENIEC.
   * 
   * ⚠️ ADVERTENCIA DE SEGURIDAD:
   * Este token NO debería estar hardcodeado en el código.
   * Debería estar en variables de entorno (.env):
   * VITE_RENIEC_TOKEN=apis-token-16299.1l9ndIMxkIIiHfeLTQiTF8cxGNvDoFkt
   * 
   * Y usarse así:
   * const token = import.meta.env.VITE_RENIEC_TOKEN;
   */
  const token = "apis-token-16299.1l9ndIMxkIIiHfeLTQiTF8cxGNvDoFkt";
  
  try {
    /**
     * PETICIÓN GET A RENIEC
     * 
     * GET /api/reniec/:dni
     * Header: Authorization: Bearer <token>
     * 
     * La API retorna los datos de la persona si el DNI existe.
     */
    const res = await reniecApi.get(`${dni}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Token en el header
      },
    });
    
    // Retornar solo los datos (res.data)
    return res.data;
  } catch (error) {
    /**
     * MANEJO DE ERRORES
     * 
     * Posibles errores:
     * - DNI no encontrado (404)
     * - Token inválido (401)
     * - Límite de consultas excedido (429)
     * - Error de red
     */
    console.error("Error al obtener Datos:", error);
    
    // Re-lanzar el error para que el componente lo maneje
    throw error;
  }
};
