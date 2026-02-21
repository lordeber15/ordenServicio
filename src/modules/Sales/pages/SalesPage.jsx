import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVentasDia } from "../../../shared/services/caja";
import { getTicketPdf } from "../../../shared/services/ticket";
import { getPdfUrl } from "../../Billing/services/comprobantes";
import Drawer from "../../../shared/components/drawer";
import { FaReceipt, FaFileInvoice, FaFileLines, FaFilter, FaCircleCheck, FaCircleXmark, FaClock, FaSpinner, FaBan } from "react-icons/fa6";

/**
 * Módulo de Gestión de Ventas y Servicios (Dashboard)
 * 
 * Este componente es el núcleo operativo de la imprenta. Permite:
 * - Visualizar órdenes de servicio filtradas por fecha y estado.
 * - Crear nuevas órdenes de trabajo.
 * - Cambiar el estado de las órdenes (Pendiente -> Diseño -> Impresión -> etc).
 * - Imprimir tickets y comprobantes asociados.
 */
function Ventas() {
  const hoy = new Date().toLocaleDateString("en-CA");
  const [fecha, setFecha] = useState(hoy);
  const [tipo, setTipo] = useState("all");
  const [openPdfMenu, setOpenPdfMenu] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const { data, isLoading } = useQuery({
    queryKey: ["ventasDia", fecha, tipo],
    queryFn: () => getVentasDia(fecha, tipo),
  });

  const ventas = data?.ventas || [];
  const totales = data?.totales || { tickets: 0, boletas: 0, facturas: 0, general: 0 };
  const totalPages = Math.ceil(ventas.length / PER_PAGE);
  const paginatedVentas = ventas.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  /**
   * Manejador para visualizar el PDF del comprobante/ticket.
   * 
   * @param {Object} venta - Objeto de la venta seleccionada.
   * @param {string} format - Formato de impresión ('80mm' o 'A4').
   */
  const handleVerPdf = async (venta, format = "80mm") => {
    if (venta.tipo === "ticket") {
      try {
        const res = await getTicketPdf(venta.id, format);
        const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
        window.open(url, "_blank");
      } catch {
        // PDF no disponible
      }
    } else {
      window.open(`${getPdfUrl(venta.id)}?format=${format}`, "_blank");
    }
    setOpenPdfMenu(null);
  };

  const badgeClasses = {
    ticket: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    boleta: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200",
    factura: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  };

  const estadoConfig = {
    AC: { icon: FaCircleCheck, label: "Aceptado SUNAT", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
    RR: { icon: FaCircleXmark, label: "Rechazado SUNAT", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
    PE: { icon: FaClock, label: "Pendiente envío", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
    EN: { icon: FaSpinner, label: "En proceso", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
    AN: { icon: FaBan, label: "Anulado", color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-800" },
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
          <label className="text-sm font-medium dark:text-gray-300">Fecha:</label>
          <input
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
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedVentas.map((v, i) => (
                  <tr
                    key={`${v.tipo}-${v.id}`}
                    className={`border-b dark:border-slate-700 ${i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-gray-50 dark:bg-slate-900"}`}
                  >
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[v.tipo]}`}>
                        {v.tipo.charAt(0).toUpperCase() + v.tipo.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono dark:text-gray-200">{v.numero}</td>
                    <td className="px-4 py-3 dark:text-gray-200">{v.cliente}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{v.documento || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold dark:text-white">S/ {v.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      {v.estado && estadoConfig[v.estado] ? (() => {
                        const cfg = estadoConfig[v.estado];
                        const Icon = cfg.icon;
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`} title={cfg.label}>
                            <Icon className="text-sm" />
                            {cfg.label}
                          </span>
                        );
                      })() : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
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
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
