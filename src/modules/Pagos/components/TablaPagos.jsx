import { formatoSoles, horaLima } from "../services/pagos";
import { ProveedorBadge } from "./PagoUi";

/** Tabla de pagos: hora (Lima), proveedor, nombre, monto, código y avisos. */
export default function TablaPagos({ pagos, nuevos = new Set(), vacio = "Sin pagos" }) {
  if (!pagos.length) {
    return <div className="text-center py-10 text-slate-500 dark:text-slate-400">{vacio}</div>;
  }
  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          <tr>
            <th className="text-left px-3 py-2">Hora</th>
            <th className="text-left px-3 py-2">Medio</th>
            <th className="text-left px-3 py-2">Nombre</th>
            <th className="text-right px-3 py-2">Monto</th>
            <th className="text-left px-3 py-2">Código</th>
            <th className="text-left px-3 py-2">Avisos</th>
          </tr>
        </thead>
        <tbody>
          {pagos.map((p) => (
            <tr
              key={p.id}
              className={`border-t border-slate-100 dark:border-slate-700 dark:text-white ${nuevos.has(p.id) ? "bg-emerald-50 dark:bg-emerald-950" : ""}`}
            >
              <td className="px-3 py-2 whitespace-nowrap">{horaLima(p.paidAt)}</td>
              <td className="px-3 py-2"><ProveedorBadge provider={p.provider} /></td>
              <td className="px-3 py-2">
                {p.senderName}
                {p.nameMasked && <span className="ml-1 text-xs text-slate-500" title="La app solo muestra parte del nombre">(parcial)</span>}
              </td>
              <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">{formatoSoles(p.amount)}</td>
              <td className="px-3 py-2 font-mono">{p.securityCode || "—"}</td>
              <td className="px-3 py-2 text-xs space-x-1">
                {p.possibleDuplicateOf && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">¿Repetido?</span>}
                {p.late && <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200">Llegó tarde</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
