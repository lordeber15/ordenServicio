/**
 * Dispara la descarga de un blob con el nombre indicado.
 *
 * Se usa para archivos que llegan por axios (y por tanto ya viajaron con el
 * token de autenticación), en lugar de enlazarlos con <a href>: un enlace
 * directo es una navegación del navegador y no puede llevar la cabecera
 * Authorization, así que el backend lo rechazaría con 401.
 *
 * @param {Blob|ArrayBuffer} blob - Contenido del archivo.
 * @param {string} filename - Nombre con el que se guarda.
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(new Blob([blob]));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Descarga la respuesta de axios usando el nombre que envía el backend en
 * Content-Disposition (formato SUNAT, p.ej. 20123456789-03-B001-00000014.xml).
 * Si la cabecera no está disponible, usa el nombre de respaldo.
 *
 * @param {import("axios").AxiosResponse} response - Respuesta con responseType "blob".
 * @param {string} fallbackName - Nombre a usar si el backend no envía uno.
 */
export const downloadBlobResponse = (response, fallbackName) => {
  const disposition = response.headers?.["content-disposition"];
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  downloadBlob(response.data, match?.[1] || fallbackName);
};
