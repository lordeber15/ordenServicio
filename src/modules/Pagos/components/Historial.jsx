import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getPagos, getTotales, exportarCsv, formatoSoles } from "../services/pagos";
import { downloadBlobResponse } from "../../../shared/utils/downloadBlob";
import TablaPagos from "./TablaPagos";
import { Tarjeta } from "./PagoUi";
import { claseBoton, claseInput } from "./estilos";

const POR_PAGINA = 50;

/** Fechas del formulario (día de Lima) → rango ISO [from, to). */
function aRango({ desde, hasta, provider, q }) {
  const siguiente = (f) => new Date(Date.parse(`${f}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  return {
    from: desde ? `${desde}T00:00:00-05:00` : undefined,
    to: hasta ? `${siguiente(hasta)}T00:00:00-05:00` : undefined,
    provider: provider || undefined,
    q: q.trim() || undefined,
  };
}

/** Historial filtrable con totales calculados en el backend y exportación CSV. */
export default function Historial() {
  const [form, setForm] = useState({ desde: "", hasta: "", provider: "", q: "" });
  const [filtros, setFiltros] = useState(form);
  const [page, setPage] = useState(1);
  const rango = aRango(filtros);

  const { data, isFetching } = useQuery({
    queryKey: ["pagos-historial", rango, page],
    queryFn: () => getPagos({ ...rango, page, pageSize: POR_PAGINA }),
    placeholderData: keepPreviousData,
  });
  const { data: totales } = useQuery({ queryKey: ["pagos-totales", rango], queryFn: () => getTotales(rango) });

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const buscar = (e) => { e.preventDefault(); setFiltros(form); setPage(1); };
  const descargar = async () => {
    try {
      downloadBlobResponse(await exportarCsv(rango), "pagos.csv");
    } catch {
      toast.error("No se pudo exportar");
    }
  };
  const paginas = Math.max(1, Math.ceil((data?.total ?? 0) / POR_PAGINA));
  const porProveedor = (prov) => totales?.providers?.find((x) => x.provider === prov);

  return (
    <div className="space-y-4">
      <form onSubmit={buscar} className="flex flex-wrap gap-3 items-end">
        <label className="text-sm dark:text-slate-300 flex flex-col gap-1">Desde
          <input type="date" value={form.desde} onChange={cambiar("desde")} className={claseInput} />
        </label>
        <label className="text-sm dark:text-slate-300 flex flex-col gap-1">Hasta
          <input type="date" value={form.hasta} onChange={cambiar("hasta")} className={claseInput} />
        </label>
        <label className="text-sm dark:text-slate-300 flex flex-col gap-1">Medio
          <select value={form.provider} onChange={cambiar("provider")} className={claseInput}>
            <option value="">Todos</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
          </select>
        </label>
        <label className="text-sm dark:text-slate-300 flex flex-col gap-1">Nombre
          <input value={form.q} onChange={cambiar("q")} maxLength={80} placeholder="Buscar…" className={claseInput} />
        </label>
        <button type="submit" className={claseBoton}>Filtrar</button>
        <button type="button" onClick={descargar} className={`${claseBoton} bg-emerald-700 hover:bg-emerald-600`}>Exportar CSV</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Tarjeta titulo="Total filtrado" valor={formatoSoles(totales?.overall?.total)} detalle={`${totales?.overall?.count ?? 0} pagos`} borde="border-emerald-500" />
        <Tarjeta titulo="Yape" valor={formatoSoles(porProveedor("YAPE")?.total)} detalle={`${porProveedor("YAPE")?.count ?? 0} pagos`} borde="border-purple-500" />
        <Tarjeta titulo="Plin" valor={formatoSoles(porProveedor("PLIN")?.total)} detalle={`${porProveedor("PLIN")?.count ?? 0} pagos`} borde="border-teal-500" />
      </div>

      <div className={isFetching ? "opacity-60" : ""}>
        <TablaPagos pagos={data?.items ?? []} vacio="No hay pagos con esos filtros" />
      </div>

      <div className="flex justify-center items-center gap-3 dark:text-white text-sm">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={claseBoton}>Anterior</button>
        <span>Página {page} de {paginas}</span>
        <button disabled={page >= paginas} onClick={() => setPage((p) => p + 1)} className={claseBoton}>Siguiente</button>
      </div>
    </div>
  );
}
