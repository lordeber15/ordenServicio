import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { listComprobantes, getComprobantePdf, getXmlUrl, reenviarComprobante } from "../services/comprobantes";
import Drawer from "../../../shared/components/drawer";
import EstadoSunatBadge from "../../../shared/components/EstadoSunatBadge";
import { ESTADOS_PENDIENTES, ESTADOS_REENVIABLES } from "../../../shared/utils/sunatEstados";
import { printPdfBlob } from "../../../shared/utils/printPdfBlob";
import { FaPrint, FaFileCode, FaFileCircleMinus, FaFilter, FaRotateRight } from "react-icons/fa6";

const PER_PAGE = 8;

function ListaNotasCredito() {
  const [fecha, setFecha] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: notas = [], isLoading, error } = useQuery({
    queryKey: ["notascredito", fecha],
    queryFn: () => listComprobantes("07", fecha || null),
    refetchInterval: (query) => {
      const items = query.state.data ?? [];
      return items.some((c) => ESTADOS_PENDIENTES.includes(c.estado_sunat)) ? 8_000 : false;
    },
  });

  const totalPages = Math.ceil(notas.length / PER_PAGE);
  const paginatedNotas = notas.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const reenviarMutation = useMutation({
    mutationFn: (id) => reenviarComprobante(id),
    onMutate: () => toast.loading("Reenviando a SUNAT…", { id: "reenvio-nc" }),
    onSuccess: () => {
      toast.success("En cola de envío ✓", { id: "reenvio-nc" });
      queryClient.invalidateQueries({ queryKey: ["notascredito", fecha] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Error al reenviar", { id: "reenvio-nc" });
    },
  });

  const handlePrint = async (id, format) => {
    try {
      const res = await getComprobantePdf(id, format);
      printPdfBlob(res.data);
    } catch {
      toast.error("Error al generar PDF");
    }
  };

  return (
    <div className="h-full dark:bg-slate-900">
      <div className="flex justify-between items-center px-4 md:px-10 py-4">
        <Drawer />
        <div className="flex items-center gap-3">
          <FaFileCircleMinus className="text-amber-600 dark:text-amber-500 text-xl" />
          <div className="text-2xl font-bold dark:text-white">Notas de Crédito Emitidas</div>
        </div>
        <div></div>
      </div>

      {/* Filtros */}
      <div className="px-4 md:px-10 flex flex-wrap gap-4 items-center mb-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500 dark:text-gray-400" />
          <label htmlFor="nc-fecha" className="text-sm font-medium dark:text-gray-300">Fecha:</label>
          <input
            id="nc-fecha"
            type="date"
            value={fecha}
            onChange={(e) => { setFecha(e.target.value); setPage(1); }}
            className="border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-amber-500"
          />
          {fecha && (
            <button
              onClick={() => { setFecha(""); setPage(1); }}
              className="text-xs text-red-500 hover:text-red-700 cursor-pointer font-medium"
            >
              Limpiar
            </button>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {notas.length} nota{notas.length !== 1 ? "s" : ""} encontrada{notas.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabla */}
      <div className="px-4 md:px-10">
        {isLoading ? (
          <div className="text-center py-10 text-amber-700 text-sm">Cargando notas de crédito...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 text-sm">
            Error al cargar: {error?.response?.data?.message || error.message}
          </div>
        ) : notas.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            {fecha ? "No hay notas de crédito para esta fecha" : "No hay notas de crédito emitidas"}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg shadow dark:shadow-slate-950/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-amber-700 dark:bg-slate-950 text-white">
                    <th className="px-4 py-3 text-left">N° Documento</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Doc. Ref.</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Estado SUNAT</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedNotas.map((c, i) => {
                    const correlativo = String(c.correlativo).padStart(8, "0");
                    const ref = c.comprobanteRef
                      ? `${c.comprobanteRef.serie}-${String(c.comprobanteRef.correlativo).padStart(8, "0")}`
                      : "—";
                    const puedeReenviar = ESTADOS_REENVIABLES.includes(c.estado_sunat) && !c.es_terminal;
                    const reenviando = reenviarMutation.isPending && reenviarMutation.variables === c.id;

                    return (
                      <tr
                        key={c.id}
                        className={`border-b dark:border-slate-700 ${i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-gray-50 dark:bg-slate-900"}`}
                      >
                        <td className="px-4 py-3 font-mono dark:text-gray-200">{c.serie}-{correlativo}</td>
                        <td className="px-4 py-3 dark:text-gray-200">{c.Cliente?.razon_social || "—"}</td>
                        <td className="px-4 py-3 dark:text-gray-300 font-mono text-xs">{ref}</td>
                        <td className="px-4 py-3 text-right font-semibold dark:text-white">
                          S/ {parseFloat(c.total || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <EstadoSunatBadge estado={c.estado_sunat} mensaje={c.mensaje_sunat} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            {c.nombre_xml && (
                              <>
                                <button
                                  onClick={() => handlePrint(c.id, "a5")}
                                  className="flex items-center gap-1 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 text-xs font-medium cursor-pointer"
                                  title="Imprimir A5"
                                >
                                  <FaPrint /> A5
                                </button>
                                <a
                                  href={getXmlUrl(c.id)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium"
                                  title="Descargar XML"
                                >
                                  <FaFileCode /> XML
                                </a>
                              </>
                            )}
                            {puedeReenviar && (
                              <button
                                onClick={() => reenviarMutation.mutate(c.id)}
                                disabled={reenviando}
                                title="Reenviar a SUNAT manualmente"
                                className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md text-orange-600 hover:text-white hover:bg-orange-500 dark:text-orange-400 dark:hover:text-white dark:hover:bg-orange-600 border border-orange-300 dark:border-orange-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FaRotateRight className={reenviando ? "animate-spin" : ""} />
                                Reenviar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {notas.length} notas en total
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ListaNotasCredito;
