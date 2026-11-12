import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { crearCodigoEnlace, getDispositivos, revocarDispositivo, horaLima } from "../services/pagos";
import { usePagosEnVivo } from "../services/usePagosEnVivo";
import { claseBoton } from "./estilos";

/** Sin latido en 15 min: el teléfono probablemente perdió conexión o cerró la app. */
const ONLINE_MS = 15 * 60 * 1000;

/** Teléfonos enlazados: QR de enlace de un solo uso, estado y revocación. */
export default function Dispositivos() {
  const queryClient = useQueryClient();
  const [codigo, setCodigo] = useState(null);
  const { data: dispositivos = [], isLoading } = useQuery({ queryKey: ["pagos-dispositivos"], queryFn: getDispositivos });

  usePagosEnVivo({
    onDispositivo: (d) => queryClient.setQueryData(["pagos-dispositivos"], (prev) =>
      prev?.map((x) => (x.id === d.id ? { ...x, lastSeenAt: d.lastSeenAt } : x))),
    onReconectar: () => queryClient.invalidateQueries({ queryKey: ["pagos-dispositivos"] }),
  });

  const generar = useMutation({
    mutationFn: crearCodigoEnlace,
    onSuccess: setCodigo,
    onError: (e) => toast.error(e?.response?.data?.message || "No se pudo generar el código"),
  });
  const revocar = useMutation({
    mutationFn: revocarDispositivo,
    onSuccess: () => {
      toast.success("Teléfono desvinculado");
      queryClient.invalidateQueries({ queryKey: ["pagos-dispositivos"] });
    },
    onError: (e) => toast.error(e?.response?.data?.message || "No se pudo desvincular"),
  });

  return (
    <div className="space-y-6">
      <section className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 dark:text-white">
        <h2 className="font-semibold mb-2">Enlazar un teléfono</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          Abre la app Pagos Alexander en el teléfono y escanea este código. Sirve una sola vez y vence en 10 minutos.
        </p>
        <button onClick={() => generar.mutate()} disabled={generar.isPending} className={claseBoton}>
          {generar.isPending ? "Generando…" : "Generar código QR"}
        </button>
        {codigo && (
          <div className="mt-4 flex flex-col items-start gap-2">
            <img src={codigo.qr} alt="Código QR para enlazar el teléfono" className="w-64 h-64 bg-white p-2 rounded" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Servidor: {codigo.apiUrl} · Vence: {horaLima(codigo.expiresAt)}
            </span>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2 dark:text-white">Teléfonos enlazados</h2>
        {isLoading && <div className="dark:text-white">Cargando…</div>}
        {!isLoading && !dispositivos.length && <div className="text-slate-500 dark:text-slate-400">Ningún teléfono enlazado todavía.</div>}
        <ul className="space-y-2">
          {dispositivos.map((d) => {
            const enLinea = !d.revokedAt && d.lastSeenAt && Date.now() - Date.parse(d.lastSeenAt) < ONLINE_MS;
            return (
              <li key={d.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-3 flex flex-wrap items-center justify-between gap-2 text-sm dark:text-white">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${d.revokedAt ? "bg-slate-400" : enLinea ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {d.name}
                    <span className="text-xs font-normal text-slate-500">
                      {d.revokedAt ? "Desvinculado" : enLinea ? "En línea" : "Sin señal reciente"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Última conexión: {horaLima(d.lastSeenAt)} · App {d.appVersion || "—"}
                  </div>
                </div>
                {!d.revokedAt && (
                  <button
                    onClick={() => window.confirm(`¿Desvincular "${d.name}"? Dejará de enviar pagos.`) && revocar.mutate(d.id)}
                    className="px-3 py-1.5 rounded-lg text-sm bg-red-600 text-white hover:bg-red-500 cursor-pointer"
                  >
                    Desvincular
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
