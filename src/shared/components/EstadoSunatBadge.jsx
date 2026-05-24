import { getEstadoConfig } from "../utils/sunatEstados";

/**
 * Badge reutilizable para mostrar el estado SUNAT de un comprobante.
 *
 * Props:
 *   estado   – string del estado (ej. "ACEPTADO", "RECHAZADO")
 *   mensaje  – texto del CDR para mostrar en tooltip (opcional)
 */
function EstadoSunatBadge({ estado, mensaje }) {
  if (!estado) return <span className="text-xs text-gray-400">—</span>;

  const cfg  = getEstadoConfig(estado);
  const Icon = cfg.icon;
  const tip  = mensaje || cfg.label;

  return (
    <span
      title={tip}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.bg} ${cfg.color}`}
    >
      <Icon className={`text-sm flex-shrink-0 ${cfg.spin ? "animate-spin" : ""}`} />
      {cfg.label}
    </span>
  );
}

export default EstadoSunatBadge;
