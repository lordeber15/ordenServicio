import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGuias, getGuiaPdf } from "../services/comprobantes";
import Drawer from "../../../shared/components/drawer";
import { FaPrint, FaFileCode, FaTruckFast, FaCircleCheck, FaCircleXmark, FaClock } from "react-icons/fa6";

const printPdfBlob = (blob) => {
  const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow.print();
    setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 1000);
  };
};

const PER_PAGE = 8;

function ListaGuias() {
  const hoy = new Date().toLocaleDateString("en-CA");
  const [fecha, setFecha] = useState(hoy);
  const [page, setPage] = useState(1);

  const { data: guias = [], isLoading } = useQuery({
    queryKey: ["guias", fecha],
    queryFn: () => getGuias(fecha),
  });

  const totalPages = Math.ceil(guias.length / PER_PAGE);
  const paginatedGuias = guias.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handlePrint = async (id) => {
    try {
      const res = await getGuiaPdf(id);
      printPdfBlob(res.data);
    } catch {
      // PDF no disponible
    }
  };

  const estadoConfig = {
    AC: { icon: FaCircleCheck, label: "Aceptado", color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
    RR: { icon: FaCircleXmark, label: "Rechazado", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
    PE: { icon: FaClock, label: "Pendiente", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  };

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/";

  return (
    <div className="h-full dark:bg-slate-900">
      <div className="flex justify-between items-center px-4 md:px-10 py-4">
        <Drawer />
        <div className="flex items-center gap-3">
          <FaTruckFast className="text-emerald-600 dark:text-emerald-500 text-xl" />
          <div className="text-2xl font-bold dark:text-white">Guías Emitidas</div>
        </div>
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
            className="border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {guias.length} guía{guias.length !== 1 ? "s" : ""} encontrada{guias.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabla */}
      <div className="px-4 md:px-10">
        {isLoading ? (
          <div className="text-center py-10 text-emerald-700 text-sm">Cargando guías...</div>
        ) : guias.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            No hay guías emitidas para esta fecha
          </div>
        ) : (
          <>
          <div className="overflow-x-auto rounded-lg shadow dark:shadow-slate-950/50">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-700 dark:bg-slate-950 text-white">
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">N° Documento</th>
                  <th className="px-4 py-3 text-left">Destinatario</th>
                  <th className="px-4 py-3 text-left">F. Traslado</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedGuias.map((g, i) => {
                  const correlativo = String(g.correlativo).padStart(8, "0");
                  const cfg = estadoConfig[g.estado_sunat] || estadoConfig.PE;
                  const Icon = cfg.icon;
                  return (
                    <tr
                      key={g.id}
                      className={`border-b dark:border-slate-700 ${i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-gray-50 dark:bg-slate-900"}`}
                    >
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${g.tipo_guia === "09" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200"}`}>
                          {g.tipo_guia === "09" ? "Remitente" : "Transportista"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono dark:text-gray-200">{g.serie}-{correlativo}</td>
                      <td className="px-4 py-3 dark:text-gray-200">{g.Destinatario?.razon_social || "—"}</td>
                      <td className="px-4 py-3 dark:text-gray-300">{g.fecha_traslado || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`} title={cfg.label}>
                          <Icon className="text-sm" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          {g.nombre_xml && (
                            <>
                              <button
                                onClick={() => handlePrint(g.id)}
                                className="flex items-center gap-1 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 text-xs font-medium cursor-pointer"
                                title="Imprimir A5"
                              >
                                <FaPrint /> A5
                              </button>
                              <a
                                href={`${baseUrl}guia/${g.id}/xml`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium"
                                title="Descargar XML"
                              >
                                <FaFileCode /> XML
                              </a>
                            </>
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
                {guias.length} guías en total
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

export default ListaGuias;
