import axiosURL from "../../../core/api/axiosURL";

/**
 * Espera el resultado de SUNAT para una guía enviada.
 *
 * La API de guías es asíncrona: /guia/emitir devuelve un ticket (estado "EN")
 * y el backend consulta ese ticket en segundo plano hasta obtener el CDR.
 * Aquí solo se lee /guia/:id/estado hasta que pase a AC (aceptada) o RR
 * (rechazada), o hasta agotar el tiempo (sigue "EN": se resolverá sola y se
 * verá en Lista de Guías).
 *
 * @returns {Promise<object>} estado de la guía + { success, en_proceso, guia_id }
 */
export async function esperarResultadoGuia(guiaId, { timeout = 60000, intervalo = 3000 } = {}) {
  const inicio = Date.now();
  let estado = { estado_sunat: "EN" };
  while (Date.now() - inicio < timeout) {
    await new Promise((r) => setTimeout(r, intervalo));
    try {
      estado = (await axiosURL.get(`/guia/${guiaId}/estado`)).data;
      if (["AC", "RR"].includes(estado.estado_sunat)) break;
    } catch {
      // error de red puntual: se sigue intentando hasta el timeout
    }
  }
  return {
    ...estado,
    guia_id: guiaId,
    success: estado.estado_sunat === "AC",
    en_proceso: !["AC", "RR"].includes(estado.estado_sunat),
  };
}
