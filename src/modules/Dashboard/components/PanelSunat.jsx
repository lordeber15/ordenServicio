import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaCheckCircle, FaExclamationTriangle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { getPendientesSunat } from "../services/sunat";
import { getEstadoConfig } from "../../../shared/utils/sunatEstados";

/**
 * Estado de la facturación electrónica de un vistazo: comprobantes que aún
 * no llegan a SUNAT (con su plazo), rechazados, bajas y guías en curso,
 * worker de envíos y vigencia del certificado. Se refresca cada minuto.
 * El vigilante del worker reintenta solo; esto es para que nadie se entere
 * tarde de algo que necesita una persona (rechazos, plazo, certificado).
 */
const plazoTexto = (d) => (d < 0 ? "vencido" : d === 0 ? "vence hoy" : d === 1 ? "vence mañana" : `${d} días`);

function Chip({ valor, etiqueta, alerta }) {
  return (
    <div className={`rounded-xl px-3 py-2 border ${alerta && valor > 0
      ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-700 dark:text-red-400"
      : "bg-gray-50 dark:bg-slate-950 border-gray-100 dark:border-slate-800 text-gray-700 dark:text-slate-200"}`}>
      <p className="text-lg font-black leading-none">{valor}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mt-1">{etiqueta}</p>
    </div>
  );
}

export default function PanelSunat() {
  const [abierto, setAbierto] = useState(false);
  const { data, isError } = useQuery({
    queryKey: ["sunat-pendientes"],
    queryFn: getPendientesSunat,
    refetchInterval: 60_000,
  });

  if (isError) return null;
  if (!data) return null;

  const p = data.pendientes;
  const avisos = [];
  if (!data.worker?.activo) avisos.push("El servicio de envío a SUNAT no responde: los comprobantes se acumulan sin enviarse.");
  if (data.certificado?.estado === "vencido") avisos.push("El certificado digital VENCIÓ: no se pueden firmar comprobantes.");
  if (data.certificado?.estado === "por_vencer") avisos.push(`El certificado digital vence en ${data.certificado.dias_restantes} días (${data.certificado.vence}). Renuévelo a tiempo.`);
  if (data.certificado?.estado === "error") avisos.push(`Certificado digital: ${data.certificado.error}.`);
  if (data.vigilante?.sin_reintento?.length) avisos.push(`Sin más reintentos automáticos: ${data.vigilante.sin_reintento.join(", ")}.`);

  const hayAlgo = p.total || data.rechazados.total || data.bajas_pendientes || data.guias.en_proceso || data.guias.rechazadas || avisos.length;
  if (!hayAlgo) {
    return (
      <div className="flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-2xl px-4 py-3">
        <FaCheckCircle /> Todo al día con SUNAT
      </div>
    );
  }

  const items = [...p.items, ...data.rechazados.items.map((r) => ({ ...r, rechazado: true }))];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm space-y-3 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-slate-400">Facturación electrónica</h2>
        {items.length > 0 && (
          <button type="button" onClick={() => setAbierto(!abierto)}
            className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1 cursor-pointer">
            {abierto ? <>Ocultar <FaChevronUp /></> : <>Ver detalle <FaChevronDown /></>}
          </button>
        )}
      </div>

      {avisos.map((a) => (
        <p key={a} className="flex items-start gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-3 py-2">
          <FaExclamationTriangle className="mt-0.5 shrink-0" /> {a}
        </p>
      ))}

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <Chip valor={p.total} etiqueta="Por enviar" />
        <Chip valor={p.vencen_hoy} etiqueta="Vencen hoy" alerta />
        <Chip valor={data.rechazados.total} etiqueta="Rechazados" alerta />
        <Chip valor={data.fuera_plazo_30_dias} etiqueta="Fuera plazo (30 d)" alerta />
        <Chip valor={data.bajas_pendientes} etiqueta="Bajas en curso" />
        <Chip valor={data.guias.en_proceso + data.guias.rechazadas} etiqueta="Guías pendientes" alerta={data.guias.rechazadas > 0} />
      </div>

      {abierto && (
        <ul className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
          {items.map((c) => {
            const e = getEstadoConfig(c.estado);
            return (
              <li key={c.id} className="py-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono font-bold text-gray-700 dark:text-slate-200">{c.numero}</span>
                <span className={`text-xs font-bold ${e.color}`}>{e.label}</span>
                <span className="text-xs text-gray-500 dark:text-slate-400">S/ {c.total.toFixed(2)}</span>
                <span className={`text-xs font-bold ${!c.rechazado && c.dias_restantes <= 0 ? "text-red-600" : "text-gray-500 dark:text-slate-400"}`}>
                  {c.rechazado ? "corregir y reenviar o anular" : plazoTexto(c.dias_restantes)}
                </span>
                {c.mensaje && <span className="w-full text-xs text-gray-400 dark:text-slate-500 truncate" title={c.mensaje}>{c.mensaje}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
