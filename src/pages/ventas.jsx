import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVentasDia } from "../request/caja";
import { getTicketPdf } from "../request/ticket";
import { getPdfUrl } from "../request/comprobantes";
import Drawer from "../components/drawer";
import { FaReceipt, FaFileInvoice, FaFileLines, FaFilter } from "react-icons/fa6";

function Ventas() {
  const hoy = new Date().toISOString().split("T")[0];
  const [fecha, setFecha] = useState(hoy);
  const [tipo, setTipo] = useState("all");
  const [openPdfMenu, setOpenPdfMenu] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["ventasDia", fecha, tipo],
    queryFn: () => getVentasDia(fecha, tipo),
  });

  const ventas = data?.ventas || [];
  const totales = data?.totales || { tickets: 0, boletas: 0, facturas: 0, general: 0 };

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
      window.open(getPdfUrl(venta.id), "_blank");
    }
    setOpenPdfMenu(null);
  };

  const badgeClasses = {
    ticket: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    boleta: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200",
    factura: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  };

  const estadoLabel = {
    PE: "Pendiente",
    EN: "En proceso",
    AC: "Aceptado",
    RR: "Rechazado",
    AN: "Anulado",
  };

  const estadoColor = {
    PE: "text-yellow-600",
    EN: "text-blue-600",
    AC: "text-green-600",
    RR: "text-red-600",
    AN: "text-gray-500",
  };

  return (
    <div className="h-full dark:bg-slate-900">
      <div className="flex justify-between items-center px-10 py-4">
        <Drawer />
        <div className="text-2xl font-bold dark:text-white">Ventas del Día</div>
        <div></div>
      </div>

      {/* Filtros */}
      <div className="px-10 flex flex-wrap gap-4 items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium dark:text-gray-300">Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500 dark:text-gray-400" />
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
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
      <div className="px-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
      <div className="px-10">
        {isLoading ? (
          <div className="text-center py-10 text-sky-700 text-sm">Cargando ventas...</div>
        ) : ventas.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            No hay ventas para esta fecha
          </div>
        ) : (
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
                {ventas.map((v, i) => (
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
                      {v.estado ? (
                        <span className={`text-xs font-medium ${estadoColor[v.estado] || "text-gray-500"}`}>
                          {estadoLabel[v.estado] || v.estado}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {v.tipo === "ticket" ? (
                        <div className="relative inline-block">
                          <button
                            onClick={() => setOpenPdfMenu(openPdfMenu === `${v.tipo}-${v.id}` ? null : `${v.tipo}-${v.id}`)}
                            className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 text-xs font-medium cursor-pointer"
                          >
                            Reimprimir ▾
                          </button>
                          {openPdfMenu === `${v.tipo}-${v.id}` && (
                            <div className="absolute right-0 mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-20 min-w-28 overflow-hidden">
                              <button
                                onClick={() => handleVerPdf(v, "80mm")}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 cursor-pointer transition-colors"
                              >
                                Ticket 80mm
                              </button>
                              <button
                                onClick={() => handleVerPdf(v, "a5")}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-sky-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 cursor-pointer border-t border-gray-100 dark:border-slate-700 transition-colors"
                              >
                                Ticket A5
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleVerPdf(v)}
                          className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 text-xs font-medium cursor-pointer"
                        >
                          Ver PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Ventas;
