import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { emitirComprobanteCompleto, pollEstadoHastaFinal } from "../services/comprobantes";

/**
 * Ítem de la UI → ítem que acepta POST /comprobante/emision.
 * precio_unitario va CON IGV; el servidor calcula valor, IGV y totales.
 */
export const itemParaEmision = (it) => ({
  descripcion: it.descripcion,
  unidad_id: it.unidad_id || "NIU",
  cantidad: Number(it.cantidad),
  precio_unitario: Number(it.precio_unitario),
  producto_id: it.producto_id ?? null,
});

/**
 * Totales tal como los calculará el servidor (calculoComprobante.js), para que
 * lo mostrado y lo cobrado coincidan al céntimo: manda lo que paga el cliente
 * (cantidad × precio con IGV) y el valor de venta e IGV se derivan por línea.
 */
export const totalesVista = (items) => {
  let importeC = 0;
  let valorC = 0;
  for (const it of items) {
    const imp = Math.round(Number(it.cantidad) * Number(it.precio_unitario) * 100);
    importeC += imp;
    valorC += Math.round(imp / 1.18);
  }
  return { opGravadas: valorC / 100, totalIgv: (importeC - valorC) / 100, total: importeC / 100 };
};

/**
 * Emisión de un comprobante y espera del resultado de SUNAT.
 *
 * Un solo POST /comprobante/emision (el servidor asigna número y montos) y
 * luego polling del estado hasta la respuesta de SUNAT (máx. 30 s).
 *
 * @param {string} etiqueta  "Boleta", "Factura", "Nota de crédito"… (para los mensajes)
 * @returns {{ emitir: (payload: object, extra?: object) => Promise<object|null>, emitiendo: boolean, resultado: object|null, setResultado: Function }}
 */
export function useEmisionComprobante(etiqueta) {
  const [emitiendo, setEmitiendo] = useState(false);
  const [resultado, setResultado] = useState(null);
  const queryClient = useQueryClient();

  const emitir = async (payload, extra = {}) => {
    setEmitiendo(true);
    setResultado(null);
    try {
      const { data } = await toast.promise(emitirComprobanteCompleto(payload), {
        loading: `Emitiendo ${etiqueta.toLowerCase()}…`,
        success: (res) => `${etiqueta} ${res.data.numero} en cola — esperando a SUNAT…`,
        error: (e) => e?.response?.data?.message || e.message || `Error al emitir ${etiqueta.toLowerCase()}`,
      });
      if (data.advertencia) toast(data.advertencia, { icon: "⚠️" });
      // El número lo reservó el servidor: refrescar series y listados.
      queryClient.invalidateQueries({ queryKey: ["series"] });
      queryClient.invalidateQueries({ queryKey: ["comprobantes"] });

      const base = { comprobante_id: data.comprobante_id, numero: data.numero, total: data.total, ...extra };
      setResultado({ ...base, esperando: true });

      const estadoFinal = await pollEstadoHastaFinal(data.comprobante_id, { timeout: 30000, intervalo: 2000 });
      const aceptado = ["ACEPTADO", "OBSERVADO"].includes(estadoFinal.estado_sunat);
      const observado = estadoFinal.estado_sunat === "OBSERVADO";
      const enProceso = ["GENERADO", "FIRMADO", "ENVIANDO"].includes(estadoFinal.estado_sunat);

      setResultado({
        ...base,
        success: aceptado,
        observado,
        en_proceso: enProceso,
        estado_sunat: estadoFinal.estado_sunat,
        codigo_sunat: estadoFinal.cdr_code || estadoFinal.codigo_sunat,
        mensaje_sunat: estadoFinal.mensaje_sunat,
      });

      if (observado) toast(`⚠ ${etiqueta} aceptada con observaciones de SUNAT`, { icon: "⚠️" });
      else if (aceptado) toast.success(`✓ ${etiqueta} ${data.numero} aceptada por SUNAT`);
      else if (enProceso) toast("SUNAT aún procesando — revisa en Ventas del Día", { icon: "⏳" });
      else toast.error(`SUNAT: ${estadoFinal.mensaje_sunat || estadoFinal.estado_sunat}`);

      return data;
    } catch {
      // El toast.promise ya mostró el error.
      return null;
    } finally {
      setEmitiendo(false);
    }
  };

  return { emitir, emitiendo, resultado, setResultado };
}
