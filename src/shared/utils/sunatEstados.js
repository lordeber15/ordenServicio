import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSpinner,
  FaBan,
  FaWifi,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaSignature,
} from "react-icons/fa";

/**
 * Config centralizada de los 9 estados SUNAT.
 * reenviable: true → muestra el botón "Reenviar" en la UI.
 * spin: true      → el icono rota (estado transitorio).
 */
export const SUNAT_ESTADOS = {
  GENERADO:    { label: "Generado",     color: "text-slate-500",  bg: "bg-slate-100  dark:bg-slate-800/60",   icon: FaSignature,           reenviable: false },
  FIRMADO:     { label: "Firmado",      color: "text-blue-500",   bg: "bg-blue-50    dark:bg-blue-950/30",    icon: FaSignature,           reenviable: false },
  ENVIANDO:    { label: "Enviando…",    color: "text-sky-500",    bg: "bg-sky-50     dark:bg-sky-950/30",     icon: FaSpinner,             reenviable: false, spin: true },
  ACEPTADO:    { label: "Aceptado",     color: "text-green-600",  bg: "bg-green-50   dark:bg-green-950/30",   icon: FaCheckCircle,         reenviable: false },
  OBSERVADO:   { label: "Observado",    color: "text-yellow-600", bg: "bg-yellow-50  dark:bg-yellow-950/30",  icon: FaExclamationTriangle, reenviable: true  },
  RECHAZADO:   { label: "Rechazado",    color: "text-red-600",    bg: "bg-red-50     dark:bg-red-950/30",     icon: FaTimesCircle,         reenviable: true  },
  ERROR_RED:   { label: "Error red",    color: "text-orange-600", bg: "bg-orange-50  dark:bg-orange-950/30",  icon: FaWifi,                reenviable: true  },
  FUERA_PLAZO: { label: "Fuera plazo",  color: "text-gray-400",   bg: "bg-gray-100   dark:bg-gray-800/60",    icon: FaClock,               reenviable: false },
  SIN_CDR:     { label: "Sin CDR",      color: "text-purple-600", bg: "bg-purple-50  dark:bg-purple-950/30",  icon: FaQuestionCircle,      reenviable: true  },
  // Fallback para estados no reconocidos
  _desconocido: { label: "Pendiente",   color: "text-yellow-500", bg: "bg-yellow-50  dark:bg-yellow-950/30",  icon: FaClock,               reenviable: false },
};

/** Devuelve la config del estado, con fallback seguro. */
export function getEstadoConfig(estado) {
  return SUNAT_ESTADOS[estado] ?? SUNAT_ESTADOS._desconocido;
}

/** Estados que indican procesamiento en curso (usados para activar polling). */
export const ESTADOS_PENDIENTES = ["GENERADO", "FIRMADO", "ENVIANDO"];

/** Estados desde los que el usuario puede reenviar manualmente. */
export const ESTADOS_REENVIABLES = ["RECHAZADO", "ERROR_RED", "SIN_CDR", "OBSERVADO"];
