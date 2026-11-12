import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getPagos, getResumen, formatoSoles } from "../services/pagos";
import { usePagosEnVivo } from "../services/usePagosEnVivo";
import TablaPagos from "./TablaPagos";
import { Tarjeta } from "./PagoUi";
import { sonarAviso } from "./estilos";

const hoyLima = () => new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);

/** Pagos de hoy (Lima) que llegan en tiempo real por Socket.IO. */
export default function EnVivo() {
  const queryClient = useQueryClient();
  const [nuevos, setNuevos] = useState(() => new Set());
  const [sonido, setSonido] = useState(true);
  const fecha = hoyLima();
  const claveLista = ["pagos-hoy", fecha];

  const { data: resumen } = useQuery({ queryKey: ["pagos-resumen"], queryFn: getResumen });
  const { data: lista, isLoading } = useQuery({
    queryKey: claveLista,
    queryFn: () => getPagos({ from: `${fecha}T00:00:00-05:00`, pageSize: 200 }),
  });

  const conexion = usePagosEnVivo({
    onPago: (p) => {
      queryClient.setQueryData(claveLista, (prev) =>
        prev && !prev.items.some((x) => x.id === p.id) ? { ...prev, total: prev.total + 1, items: [p, ...prev.items] } : prev);
      queryClient.invalidateQueries({ queryKey: ["pagos-resumen"] });
      setNuevos((s) => new Set(s).add(p.id));
      if (sonido) sonarAviso();
      toast.success(`${p.provider === "YAPE" ? "Yape" : "Plin"}: ${formatoSoles(p.amount)} de ${p.senderName}`);
    },
    onNoReconocida: () => queryClient.invalidateQueries({ queryKey: ["pagos-resumen"] }),
    onReconectar: () => {
      queryClient.invalidateQueries({ queryKey: claveLista });
      queryClient.invalidateQueries({ queryKey: ["pagos-resumen"] });
    },
  });

  const porProveedor = (prov) => resumen?.providers?.find((x) => x.provider === prov);
  const indicador = {
    conectado: ["bg-emerald-500", "En vivo"],
    conectando: ["bg-amber-400", "Conectando…"],
    desconectado: ["bg-red-500", "Sin conexión, reintentando…"],
  }[conexion];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm dark:text-slate-200">
          <span className={`inline-block w-3 h-3 rounded-full ${indicador[0]}`} />
          {indicador[1]}
        </div>
        <label className="flex items-center gap-2 text-sm dark:text-slate-200 cursor-pointer">
          <input type="checkbox" checked={sonido} onChange={(e) => setSonido(e.target.checked)} />
          Sonido al llegar un pago
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Tarjeta titulo="Total de hoy" valor={formatoSoles(resumen?.overall?.total)} detalle={`${resumen?.overall?.count ?? 0} pagos`} borde="border-emerald-500" />
        <Tarjeta titulo="Yape" valor={formatoSoles(porProveedor("YAPE")?.total)} detalle={`${porProveedor("YAPE")?.count ?? 0} pagos`} borde="border-purple-500" />
        <Tarjeta titulo="Plin" valor={formatoSoles(porProveedor("PLIN")?.total)} detalle={`${porProveedor("PLIN")?.count ?? 0} pagos`} borde="border-teal-500" />
        <Tarjeta titulo="No reconocidas hoy" valor={resumen?.unparsed ?? 0} detalle="Revisar en su pestaña" borde="border-amber-500" />
      </div>

      {isLoading
        ? <div className="text-center py-10 dark:text-white">Cargando…</div>
        : <TablaPagos pagos={lista?.items ?? []} nuevos={nuevos} vacio="Aún no llegan pagos hoy" />}
    </div>
  );
}
