import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getVentasDia } from "../../../shared/services/caja";
import { getTicketPdf } from "../../../shared/services/ticket";
import { getComprobantePdf, getXmlUrl, reenviarComprobante } from "../../Billing/services/comprobantes";
import Drawer from "../../../shared/components/drawer";
import EstadoSunatBadge from "../../../shared/components/EstadoSunatBadge";
import { ESTADOS_PENDIENTES, ESTADOS_REENVIABLES } from "../../../shared/utils/sunatEstados";
import { printPdfBlob } from "../../../shared/utils/printPdfBlob";
import {
  FaReceipt, FaFileInvoice, FaFileLines,
  FaFilter, FaFileCode, FaRotateRight,
} from "react-icons/fa6";

function Ventas() {
  const hoy = new Date().toLocaleDateString("en-CA");
  const [fecha, setFecha] = useState(hoy);
  const [tipo, setTipo] = useState("all");
  const [openPdfMenu, setOpenPdfMenu] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["ventasDia", fecha, tipo],
    queryFn: () => getVentasDia(fecha, tipo),
    // Polling activo mientras haya comprobantes en estado transitorio
    refetchInterval: (query) => {
      const ventas = query.state.data?.ventas ?? [];
      const hayPendientes = ventas.some((v) => ESTADOS_PENDIENTES.includes(v.estado));
      return hayPendientes ? 8_000 : false;
    },
  });

  const ventas = data?.ventas || [];
  const totales = data?.totales || { tickets: 0, boletas: 0, facturas: 0, general: 0 };
  const totalPages = Math.ceil(ventas.length / PER_PAGE);
  const paginatedVentas = ventas.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Mutation para reenvío manual
  const reenviarMutation = useMutation({
    mutationFn: (id) => reenviarComprobante(id),
    onMutate: () => {
      toast.loading("Reenviando a SUNAT…", { id: "reenvio" });
    },
    onSuccess: () => {
      toast.success("En cola de envío ✓", { id: "reenvio" });
      queryClient.invalidateQueries({ queryKey: ["ventasDia", fecha, tipo] });
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Error al reenviar";
      toast.error(msg, { id: "reenvio" });
    },
  });

  const handleVerPdf = async (venta, format = "80mm") => {
    try {
      if (venta.tipo === "ticket") {
        const res = await getTicketPdf(venta.id, format);
        printPdfBlob(res.data);
      } else {
        const res = await getComprobantePdf(venta.id, format);
        printPdfBlob(res.data);
      }
    } catch {
      toast.error("PDF no disponible");
    }
    setOpenPdfMenu(null);
  };

  const badgeClasses = {
    ticket:  "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    boleta:  "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200",
    factura: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  };

  return (
    <div className="h-full dark:bg-slate-900">
      <div className="flex justify-between items-center px-4 md:px-10 py-4">
        <Drawer />
        <div className="text-2xl font-bold dark:text-white">Ventas del Día</div>
        <div></div>
      </div>

      {/* Filtros */}
      <div className="px-4 md:px-10 flex flex-wrap gap-4 items-center mb-4">
        <div className="flex items-center gap-2">
          <label htmlFor="sales-fecha" className="text-sm font-medium dark:text-gray-300">Fecha:</label>
          <input
            id="sales-fecha"
            type="date"
            value={fecha}
            onChange={(e) => { setFecha(e.target.value); setPage(1); }}
            className="border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500 dark:text-gray-400" />
          <select
            value={tipo}
            onChange={(e) => { setTipo(e.target.value); setPage(1); }}
            className="border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-sky-500"
          >
            <option value="all">Todos</option>
            <option value="ticket">Tickets</option>
            <option value="boleta">Boletas</option>
            <option value="factura">Facturas</option>
          </select>
        </div>
      </div>

      {/* Cards resumen */}
      <div className="px-4 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border-l-4 border-slate-400">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-medium">
            <FaReceipt /> Tickets
          </div>
          <div className="text-xl font-bold mt-1 dark:text-white">S/ {totales.tickets.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border-l-4 border-sky-500">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300 text-sm font-medium">
            <FaFileLines /> Boletas
          </div>
          <div className="text-xl font-bold mt-1 dark:text-white">S/ {totales.boletas.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border-l-4 border-emerald-500">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-300 text-sm font-medium">
            <FaFileInvoice /> Facturas
          </div>
          <div className="text-xl font-bold mt-1 dark:text-white">S/ {totales.facturas.toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border-l-4 border-sky-700">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-200 text-sm font-bold">
            Total General
          </div>
          <div className="text-xl font-bold mt-1 dark:text-white">S/ {totales.general.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="px-4 md:px-10">
        {isLoading ? (
          <div className="text-center py-10 text-sky-700 text-sm">Cargando ventas...</div>
        ) : ventas.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            No hay ventas para esta fecha
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg shadow dark:shadow-slate-950/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sky-700 dark:bg-slate-950 text-white">
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">N° Documento</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Doc. Identidad</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Estado SUNAT</th>
                    <th className="px-4 py-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVentas.map((v, i) => {
                    const esComprobante = v.tipo !== "ticket";
                    const puedeReenviar = esComprobante && ESTADOS_REENVIABLES.includes(v.estado) && !v.es_terminal;
                    const reenviando = reenviarMutation.isPending && reenviarMutation.variables === v.id;

                    return (
                      <tr
                        key={`${v.tipo}-${v.id}`}
                        className={`border-b dark:border-slate-700 ${i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-gray-50 dark:bg-slate-900"}`}
                      >
                        {/* Tipo */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[v.tipo]}`}>
                            {v.tipo.charAt(0).toUpperCase() + v.tipo.slice(1)}
                          </span>
                        </td>

                        {/* N° Documento */}
                        <td className="px-4 py-3 font-mono dark:text-gray-200">{v.numero}</td>

                        {/* Cliente */}
                        <td className="px-4 py-3 dark:text-gray-200">{v.cliente}</td>

                        {/* Doc. Identidad */}
                        <td className="px-4 py-3 dark:text-gray-300">{v.documento || "—"}</td>

                        {/* Total */}
                        <td className="px-4 py-3 text-right font-semibold dark:text-white">
                          S/ {v.total.toFixed(2)}
                        </td>

                        {/* Estado SUNAT */}
                        <td className="px-4 py-3 text-center">
                          {esComprobante
                            ? <EstadoSunatBadge estado={v.estado} mensaje={v.mensaje_sunat} />
                            : <span className="text-xs text-gray-400">—</span>
                          }
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Menú imprimir */}
                            <div className="relative inline-block">
                              <button
                                onClick={() => setOpenPdfMenu(openPdfMenu === `${v.tipo}-${v.id}` ? null : `${v.tipo}-${v.id}`)}
                                className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 text-xs font-medium cursor-pointer"
                              >
                                Imprimir ▾
                              </button>
                              {openPdfMenu === `${v.tipo}-${v.id}` && (
                                <div className={`absolute right-0 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-20 min-w-28 overflow-hidden ${i >= 4 ? "bottom-full mb-1" : "top-full mt-1"}`}>
                                  <button
                                    onClick={() => handleVerPdf(v, v.tipo === "ticket" ? "80mm" : "ticket")}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 cursor-pointer transition-colors"
                                  >
                                    Ticket 80mm
                                  </button>
                                  <button
                                    onClick={() => handleVerPdf(v, "a5")}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 cursor-pointer border-t border-gray-100 dark:border-slate-700 transition-colors"
                                  >
                                    A5
                                  </button>
                                  {esComprobante && (
                                    <a
                                      href={getXmlUrl(v.id)}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={() => setOpenPdfMenu(null)}
                                      className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 cursor-pointer border-t border-gray-100 dark:border-slate-700 transition-colors flex items-center gap-1.5"
                                    >
                                      <FaFileCode /> XML
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Botón Reenviar — solo si el estado lo permite */}
                            {puedeReenviar && (
                              <button
                                onClick={() => reenviarMutation.mutate(v.id)}
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
                  {ventas.length} ventas en total
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

export default Ventas;
