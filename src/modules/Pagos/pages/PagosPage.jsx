import { useState } from "react";
import { Navigate } from "react-router";
import Drawer from "../../../shared/components/drawer";
import { useSesion } from "../../../core/auth/useSesion";
import EnVivo from "../components/EnVivo";
import Historial from "../components/Historial";
import NoReconocidas from "../components/NoReconocidas";
import Dispositivos from "../components/Dispositivos";

const PESTANAS = [
  { id: "vivo", label: "En vivo", Componente: EnVivo },
  { id: "historial", label: "Historial", Componente: Historial },
  { id: "no-reconocidas", label: "No reconocidas", Componente: NoReconocidas },
  { id: "dispositivo", label: "Dispositivo", Componente: Dispositivos },
];

/**
 * PAGOS YAPE/PLIN — solo Administrador.
 *
 * El backend es la barrera real (permisos.js y el handshake de Socket.IO
 * rechazan a cualquier otro cargo); aquí solo se evita mostrar la pantalla.
 */
export default function PagosPage() {
  const { usuario } = useSesion();
  const [pestana, setPestana] = useState("vivo");

  if (usuario?.cargo !== "Administrador") return <Navigate to="/dashboard" replace />;
  const { Componente } = PESTANAS.find((p) => p.id === pestana);

  return (
    <div className="min-h-full dark:bg-slate-900 pb-10">
      <div className="flex justify-between items-center px-4 md:px-10 py-4">
        <Drawer />
        <div className="text-2xl font-bold dark:text-white">Pagos Yape / Plin</div>
        <div></div>
      </div>

      <div className="px-4 md:px-10">
        <div role="tablist" className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-700 mb-4">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={pestana === p.id}
              onClick={() => setPestana(p.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg cursor-pointer transition-colors ${
                pestana === p.id
                  ? "bg-sky-700 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Componente />
      </div>
    </div>
  );
}
