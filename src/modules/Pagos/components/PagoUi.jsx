/**
 * Piezas visuales comunes del panel de pagos Yape/Plin.
 * El proveedor siempre se muestra con texto (no solo color) y sin logos.
 */
export function ProveedorBadge({ provider }) {
  const clases = provider === "YAPE"
    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    : "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${clases}`}>{provider === "YAPE" ? "Yape" : "Plin"}</span>;
}

export function Tarjeta({ titulo, valor, detalle, borde = "border-sky-500" }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 border-l-4 ${borde}`}>
      <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{titulo}</div>
      <div className="text-xl font-bold mt-1 dark:text-white">{valor}</div>
      {detalle && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{detalle}</div>}
    </div>
  );
}
