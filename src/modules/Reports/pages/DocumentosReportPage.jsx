import { useState, useEffect, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getReporteDocumentos, FORMATOS, esGuia } from "../services/reportes";
import {
  getComprobantePdf,
  getComprobanteXml,
  getGuiaPdf,
  getGuiaXml,
} from "../../Billing/services/comprobantes";
import Drawer from "../../../shared/components/drawer";
import { printPdfBlob } from "../../../shared/utils/printPdfBlob";
import { downloadBlob, downloadBlobResponse } from "../../../shared/utils/downloadBlob";
import {
  FaFilter, FaPrint, FaFileCode, FaFileCsv, FaTriangleExclamation, FaBan,
} from "react-icons/fa6";

const PER_PAGE = 25;
const CSV_PAGE = 200; // filas por petición al exportar
const CSV_MAX_PAGINAS = 25; // tope de seguridad: 5000 filas, igual que el backend

/** Fecha local en formato YYYY-MM-DD (en-CA lo devuelve así, sin corrimiento de zona). */
const toISO = (d) => d.toLocaleDateString("en-CA");

/** Rangos rápidos. Cada uno devuelve [desde, hasta]. */
const PRESETS = {
  hoy: () => {
    const d = new Date();
    return [toISO(d), toISO(d)];
  },
  semana: () => {
    const d = new Date();
    const lunes = new Date(d);
    lunes.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return [toISO(lunes), toISO(d)];
  },
  mes: () => {
    const d = new Date();
    return [toISO(new Date(d.getFullYear(), d.getMonth(), 1)), toISO(d)];
  },
  mesAnterior: () => {
    const d = new Date();
    return [
      toISO(new Date(d.getFullYear(), d.getMonth() - 1, 1)),
      toISO(new Date(d.getFullYear(), d.getMonth(), 0)), // día 0 = último del mes previo
    ];
  },
};

/** Color del badge de tipo, por código SUNAT. */
const COLOR_TIPO = {
  "01": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
  "03": "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-200",
  "07": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  "08": "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200",
  "09": "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200",
  "31": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
};

/** Escapa un valor para CSV con separador ";". */
const csvCell = (valor) => {
  const s = valor == null ? "" : String(valor);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * PÁGINA: REPORTE DE DOCUMENTOS ELECTRÓNICOS
 *
 * Lista los documentos aceptados por SUNAT (boletas, facturas, notas y guías)
 * dentro de un rango de fechas, filtrables por formato. Solo Administrador:
 * el backend rechaza con 403 a cualquier otro cargo.
 */
function DocumentosReport() {
  const [desdeInicial, hastaInicial] = PRESETS.mes();

  const [tipos, setTipos] = useState([]); // vacío = todos los formatos
  const [desde, setDesde] = useState(desdeInicial);
  const [hasta, setHasta] = useState(hastaInicial);
  const [clienteInput, setClienteInput] = useState("");
  const [cliente, setCliente] = useState("");
  const [serieInput, setSerieInput] = useState("");
  const [serie, setSerie] = useState("");
  const [incluirAnulados, setIncluirAnulados] = useState(false);
  const [page, setPage] = useState(1);
  const [exportando, setExportando] = useState(false);

  // Los campos de texto se aplican con retardo para no consultar en cada tecla.
  useEffect(() => {
    const id = setTimeout(() => {
      setCliente(clienteInput.trim());
      setSerie(serieInput.trim());
    }, 400);
    return () => clearTimeout(id);
  }, [clienteInput, serieInput]);

  const filtros = useMemo(
    () => ({ tipos, desde, hasta, cliente, serie, incluirAnulados }),
    [tipos, desde, hasta, cliente, serie, incluirAnulados]
  );

  // Cualquier cambio de filtro devuelve a la primera página.
  useEffect(() => setPage(1), [filtros]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["reporte-documentos", filtros, page],
    queryFn: () => getReporteDocumentos({ ...filtros, page, limit: PER_PAGE }),
    // Evita el parpadeo a "Cargando…" al pasar de página.
    placeholderData: keepPreviousData,
  });

  const documentos = data?.documentos ?? [];
  const paginacion = data?.paginacion ?? { page: 1, total_paginas: 1, total_registros: 0 };

  const toggleTipo = (codigo) =>
    setTipos((prev) =>
      prev.includes(codigo) ? prev.filter((t) => t !== codigo) : [...prev, codigo]
    );

  const aplicarPreset = (nombre) => {
    const [d, h] = PRESETS[nombre]();
    setDesde(d);
    setHasta(h);
  };

  const limpiarFiltros = () => {
    const [d, h] = PRESETS.mes();
    setTipos([]);
    setDesde(d);
    setHasta(h);
    setClienteInput("");
    setSerieInput("");
    setIncluirAnulados(false);
  };

  const handleImprimir = async (doc) => {
    try {
      const res = esGuia(doc.tipo)
        ? await getGuiaPdf(doc.id)
        : await getComprobantePdf(doc.id, "a5");
      printPdfBlob(res.data);
    } catch {
      toast.error("PDF no disponible");
    }
  };

  const handleDescargarXml = async (doc) => {
    try {
      const res = esGuia(doc.tipo) ? await getGuiaXml(doc.id) : await getComprobanteXml(doc.id);
      downloadBlobResponse(res, `${doc.nombre_xml || doc.numero}.xml`);
    } catch {
      toast.error("XML no disponible");
    }
  };

  /**
   * Exporta el reporte completo (no solo la página visible) recorriendo las
   * páginas del endpoint hasta agotarlas.
   */
  const handleExportarCsv = async () => {
    setExportando(true);
    toast.loading("Generando CSV…", { id: "csv" });
    try {
      const filas = [];
      let pagina = 1;
      let totalPaginas = 1;

      do {
        const res = await getReporteDocumentos({ ...filtros, page: pagina, limit: CSV_PAGE });
        filas.push(...res.documentos);
        totalPaginas = res.paginacion.total_paginas;
        pagina += 1;
      } while (pagina <= totalPaginas && pagina <= CSV_MAX_PAGINAS);

      if (!filas.length) {
        toast.error("No hay documentos para exportar", { id: "csv" });
        return;
      }

      const cabecera = [
        "Tipo", "N° Documento", "Fecha Emisión", "Cliente",
        "Doc. Identidad", "Moneda", "Total", "Anulado",
      ];
      const cuerpo = filas.map((d) =>
        [
          d.tipo_label,
          d.numero,
          d.fecha_emision,
          d.cliente,
          d.documento,
          d.moneda ?? "",
          d.total != null ? d.total.toFixed(2) : "",
          d.anulado ? "SÍ" : "NO",
        ].map(csvCell).join(";")
      );

      // El BOM hace que Excel reconozca UTF-8 y no rompa las tildes.
      const csv = "﻿" + [cabecera.map(csvCell).join(";"), ...cuerpo].join("\r\n");
      downloadBlob(
        new Blob([csv], { type: "text/csv;charset=utf-8;" }),
        `documentos-sunat-${desde}_${hasta}.csv`
      );
      toast.success(`${filas.length} documentos exportados ✓`, { id: "csv" });
    } catch {
      toast.error("Error al exportar", { id: "csv" });
    } finally {
      setExportando(false);
    }
  };

  const inputClass =
    "border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-sky-500";

  return (
    <div className="h-full dark:bg-slate-900 pb-10">
      <div className="flex justify-between items-center px-4 md:px-10 py-4">
        <Drawer />
        <div className="text-center">
          <div className="text-2xl font-bold dark:text-white">Reporte de Documentos</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Documentos aceptados por SUNAT
          </div>
        </div>
        <div></div>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-10 mb-4 flex flex-col gap-3">
        {/* Formatos */}
        <div className="flex flex-wrap items-center gap-2">
          <FaFilter className="text-gray-500 dark:text-gray-400" />
          <button
            onClick={() => setTipos([])}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              tipos.length === 0
                ? "bg-sky-700 text-white border-sky-700"
                : "border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            Todos
          </button>
          {FORMATOS.map((f) => (
            <button
              key={f.codigo}
              onClick={() => toggleTipo(f.codigo)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                tipos.includes(f.codigo)
                  ? "bg-sky-700 text-white border-sky-700"
                  : "border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Rango de fechas y presets */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="rep-desde" className="text-sm font-medium dark:text-gray-300">Desde:</label>
            <input
              id="rep-desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="rep-hasta" className="text-sm font-medium dark:text-gray-300">Hasta:</label>
            <input
              id="rep-hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-1">
            {[
              ["hoy", "Hoy"],
              ["semana", "Esta semana"],
              ["mes", "Este mes"],
              ["mesAnterior", "Mes anterior"],
            ].map(([clave, texto]) => (
              <button
                key={clave}
                onClick={() => aplicarPreset(clave)}
                className="px-2.5 py-1 text-xs rounded-md border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                {texto}
              </button>
            ))}
          </div>
        </div>

        {/* Búsqueda y opciones */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Cliente o N° documento"
            value={clienteInput}
            onChange={(e) => setClienteInput(e.target.value)}
            className={`${inputClass} w-56`}
          />
          <input
            type="text"
            placeholder="Serie (B001)"
            value={serieInput}
            onChange={(e) => setSerieInput(e.target.value)}
            className={`${inputClass} w-32`}
          />
          <label className="flex items-center gap-2 text-sm dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={incluirAnulados}
              onChange={(e) => setIncluirAnulados(e.target.checked)}
              className="accent-red-600 cursor-pointer"
            />
            Incluir anulados
          </label>
          <button
            onClick={limpiarFiltros}
            className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
          >
            Limpiar
          </button>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {paginacion.total_registros} documento{paginacion.total_registros !== 1 ? "s" : ""}
              {isFetching && " · actualizando…"}
            </span>
            <button
              onClick={handleExportarCsv}
              disabled={exportando || paginacion.total_registros === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <FaFileCsv /> Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Aviso de rango demasiado amplio */}
      {data?.truncado && (
        <div className="px-4 md:px-10 mb-3">
          <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            <FaTriangleExclamation />
            El rango supera el máximo de documentos que se muestran. Acota las fechas para ver el resto.
          </div>
        </div>
      )}

      {/* ── Tabla ───────────────────────────────────────────────────────── */}
      <div className="px-4 md:px-10">
        {isLoading ? (
          <div className="text-center py-10 text-sky-700 text-sm">Cargando documentos...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 text-sm">
            {error?.response?.status === 403
              ? "Este reporte es exclusivo del Administrador."
              : `Error al cargar: ${error?.response?.data?.message || error.message}`}
          </div>
        ) : documentos.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 text-sm">
            No hay documentos aceptados en este rango
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg shadow dark:shadow-slate-950/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sky-700 dark:bg-slate-950 text-white">
                    <th className="px-4 py-3 text-left rounded-tl-lg">Tipo</th>
                    <th className="px-4 py-3 text-left">N° Documento</th>
                    <th className="px-4 py-3 text-left">Fecha Emisión</th>
                    <th className="px-4 py-3 text-left">Cliente</th>
                    <th className="px-4 py-3 text-left">Doc. Identidad</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map((d, i) => (
                    <tr
                      key={`${d.tipo}-${d.id}`}
                      className={`border-b dark:border-slate-700 ${
                        d.anulado
                          ? "bg-red-50 dark:bg-red-950/20"
                          : i % 2 === 0
                            ? "bg-white dark:bg-slate-800"
                            : "bg-gray-50 dark:bg-slate-900"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${COLOR_TIPO[d.tipo] || ""}`}>
                          {d.tipo_label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono dark:text-gray-200">
                        <span className={d.anulado ? "line-through opacity-70" : ""}>{d.numero}</span>
                        {d.anulado && (
                          <span
                            title="Anulado ante SUNAT"
                            className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                          >
                            <FaBan /> Anulado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 dark:text-gray-300">{d.fecha_emision}</td>
                      <td className="px-4 py-3 dark:text-gray-200">{d.cliente}</td>
                      <td className="px-4 py-3 dark:text-gray-300">{d.documento || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold dark:text-white whitespace-nowrap">
                        {d.total != null ? `${d.moneda === "USD" ? "$" : "S/"} ${d.total.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-3">
                          {d.nombre_xml ? (
                            <>
                              <button
                                onClick={() => handleImprimir(d)}
                                title="Imprimir PDF"
                                className="flex items-center gap-1 text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 text-xs font-medium cursor-pointer"
                              >
                                <FaPrint /> PDF
                              </button>
                              <button
                                onClick={() => handleDescargarXml(d)}
                                title="Descargar XML firmado"
                                className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium cursor-pointer"
                              >
                                <FaFileCode /> XML
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación (servidor) */}
            {paginacion.total_paginas > 1 && (
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {paginacion.total_registros} documentos en total
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
                    {page} / {paginacion.total_paginas}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(paginacion.total_paginas, p + 1))}
                    disabled={page >= paginacion.total_paginas}
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

export default DocumentosReport;
