import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getNoReconocidas, horaLima } from "../services/pagos";
import { ProveedorBadge } from "./PagoUi";
import { claseInput } from "./estilos";

const MOTIVOS = {
  "generic-text": "Texto genérico",
  outgoing: "Pago enviado (no recibido)",
  sensitive: "Contenía un código secreto",
  "not-plin": "Otra notificación del banco",
};

/**
 * Notificaciones que no se reconocieron como pago. Si aquí aparece un pago
 * real, el formato cambió: hay que pasar el texto para actualizar el parser.
 */
export default function NoReconocidas() {
  const [status, setStatus] = useState("UNPARSED");
  const { data, isLoading } = useQuery({
    queryKey: ["pagos-no-reconocidas", status],
    queryFn: () => getNoReconocidas(status),
  });
  const items = data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={claseInput}>
          <option value="UNPARSED">No reconocidas</option>
          <option value="IGNORED">Ignoradas</option>
        </select>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {status === "UNPARSED"
            ? "Mencionan Yape/Plin pero no se pudo leer el pago. Si es un pago real, el formato cambió."
            : "Descartadas a propósito (promociones, pagos enviados, códigos)."}
        </span>
      </div>

      {isLoading && <div className="text-center py-10 dark:text-white">Cargando…</div>}
      {!isLoading && !items.length && <div className="text-center py-10 text-slate-500 dark:text-slate-400">Nada por revisar</div>}
      <ul className="space-y-2">
        {items.map((n) => (
          <li key={n.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-3 text-sm dark:text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <ProveedorBadge provider={n.provider} />
              <span className="text-slate-500 dark:text-slate-400">{horaLima(n.receivedAt)}</span>
              {n.ignoreReason && <span className="text-xs text-slate-500">{MOTIVOS[n.ignoreReason] || n.ignoreReason}</span>}
            </div>
            {n.title && <div className="font-semibold">{n.title}</div>}
            <div className="whitespace-pre-wrap break-words">{n.bigText || n.text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
