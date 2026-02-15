import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router";
import toast from "react-hot-toast";
import { CiSearch } from "react-icons/ci";
import { FaPlus, FaTrash, FaFilePdf, FaFileCode } from "react-icons/fa6";
import Drawer from "../../../shared/components/drawer";
import DatosEmpresa from "../../../shared/components/datosEmpresa";
import { getEmisores } from "../services/emisores";
import { getSeriesByTipo } from "../services/series";
import { getUnidades } from "../services/unidades";
import { findClienteByDoc, createCliente } from "../../../shared/services/clientes";
import {
  createComprobante,
  createDetalle,
  emitirComprobante,
  getPdfUrl,
  getXmlUrl,
} from "../services/comprobantes";
import { getReniec } from "../../../shared/services/reniec";

const IGV_RATE = 0.18;
const HOY = new Date().toLocaleDateString('en-CA');

/**
 * Convierte un monto numérico a su representación en letras (Soles).
 * Utilizado para la leyenda del comprobante fiscal.
 * 
 * @param {number} monto - El monto total a convertir.
 * @returns {string} Texto en mayúsculas (ej: "CIEN CON 00/100 SOLES").
 */
function numeroALetras(monto) {
  const entero = Math.floor(monto);
  const decimales = Math.round((monto - entero) * 100);
  const unidades = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const especiales = { 11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE", 16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE" };
  const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  function menorMil(n) {
    if (n === 0) return "";
    if (n === 100) return "CIEN";
    if (n < 10) return unidades[n];
    if (n < 20) return especiales[n] || ("DIECI" + unidades[n - 10]);
    if (n < 100) { const d = Math.floor(n / 10), u = n % 10; return decenas[d] + (u ? " Y " + unidades[u] : ""); }
    const c = Math.floor(n / 100), r = n % 100;
    return centenas[c] + (r ? " " + menorMil(r) : "");
  }

  function convertir(n) {
    if (n === 0) return "CERO";
    if (n < 1000) return menorMil(n);
    if (n < 1000000) {
      const m = Math.floor(n / 1000), r = n % 1000;
      return (m === 1 ? "MIL" : menorMil(m) + " MIL") + (r ? " " + menorMil(r) : "");
    }
    return n.toString();
  }

  return convertir(entero) + " CON " + String(decimales).padStart(2, "0") + "/100 SOLES";
}

function ItemForm({ unidades, onAgregar, onCancelar }) {
  const [desc, setDesc] = useState("");
  const [unidadId, setUnidadId] = useState(unidades[0]?.id || "NIU");
  const [cantidad, setCantidad] = useState("1");
  const [precio, setPrecio] = useState("");

  const handleAgregar = () => {
    if (!desc.trim() || !precio || parseFloat(precio) <= 0) {
      toast.error("Completa descripción y precio");
      return;
    }
    const p = parseFloat(precio);
    const q = parseFloat(cantidad) || 1;
    const valorUnit = p / (1 + IGV_RATE);
    onAgregar({
      descripcion: desc.trim(),
      unidad_id: unidadId,
      cantidad: q,
      precio_unitario: p,
      valor_unitario: valorUnit,
      igv: valorUnit * IGV_RATE,
      valor_total: valorUnit * q,
      importe_total: p * q,
    });
  };

  return (
    <tr className="bg-sky-50 dark:bg-slate-900/50">
      <td className="px-2 py-1">
        <input type="number" min="0.001" step="0.001" value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          className="w-16 bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded p-1 text-sm text-gray-800 dark:text-slate-100 transition-colors" />
      </td>
      <td className="px-2 py-1">
        <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)}
          placeholder="Descripción del producto/servicio"
          className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded p-1 text-sm text-gray-800 dark:text-slate-100 transition-colors" />
      </td>
      <td className="px-2 py-1">
        <select value={unidadId} onChange={(e) => setUnidadId(e.target.value)}
          className="bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded p-1 text-sm text-gray-800 dark:text-slate-100 transition-colors">
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>{u.id} — {u.nombre || u.descripcion}</option>
          ))}
        </select>
      </td>
      <td className="px-2 py-1">
        <input type="number" min="0" step="0.01" value={precio}
          onChange={(e) => setPrecio(e.target.value)} placeholder="0.00"
          className="w-24 bg-white dark:bg-slate-950 border border-sky-300 dark:border-slate-800 rounded p-1 text-sm text-gray-800 dark:text-slate-100 transition-colors" />
      </td>
      <td className="px-2 py-1 text-sm text-gray-500 dark:text-slate-400">
        {precio ? `S/ ${(parseFloat(precio) * (parseFloat(cantidad) || 1)).toFixed(2)}` : "—"}
      </td>
      <td className="px-2 py-1 flex gap-1">
        <button onClick={handleAgregar} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold transition-colors">OK</button>
        <button onClick={onCancelar} className="bg-gray-300 dark:bg-slate-800 hover:bg-gray-400 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 px-2 py-1 rounded text-xs transition-colors">✕</button>
      </td>
    </tr>
  );
}

/**
 * Página de Emisión de Boletas de Venta Electrónica.
 * 
 * Permite:
 * - Buscar clientes por DNI/RUC (integración RENIEC/SUNAT).
 * - Agregar ítems desde el inventario.
 * - Calcular totales (Gravada, IGV, Total).
 * - Emitir el comprobante y generar PDF/XML.
 */
function Boleta() {
  const { state } = useLocation();
  const fromTicket = state?.fromTicket || null;

  const { data: emisores = [] } = useQuery({ queryKey: ["emisores"], queryFn: getEmisores });
  const { data: series = [] } = useQuery({ queryKey: ["series", "03"], queryFn: () => getSeriesByTipo("03") });
  const { data: unidades = [] } = useQuery({ queryKey: ["unidades"], queryFn: getUnidades });

  const emisor = emisores[0] || null;
  const serie = series[0] || null;

  const [items, setItems] = useState(() => {
    if (!fromTicket) return [];
    return fromTicket.items.map((i) => {
      const valorUnit = i.precioConIgv / (1 + IGV_RATE);
      return {
        descripcion: i.descripcion,
        unidad_id: "NIU",
        cantidad: i.cantidad,
        precio_unitario: parseFloat(i.precioConIgv.toFixed(2)),
        valor_unitario: parseFloat(valorUnit.toFixed(6)),
        igv: parseFloat((valorUnit * IGV_RATE).toFixed(6)),
        valor_total: parseFloat((valorUnit * i.cantidad).toFixed(2)),
        importe_total: parseFloat((i.precioConIgv * i.cantidad).toFixed(2)),
      };
    });
  });
  const [showItemForm, setShowItemForm] = useState(false);
  const [clienteNombre, setClienteNombre] = useState(fromTicket?.cliente || "");
  const [clienteDoc, setClienteDoc] = useState(fromTicket?.doc || "");
  const [tipoDoc, setTipoDoc] = useState(fromTicket?.tipoDocCodigo || "0");
  const [direccion, setDireccion] = useState(fromTicket?.direccion || "");
  const [fechaEmision, setFechaEmision] = useState(HOY);
  const [buscando, setBuscando] = useState(false);
  const [emitiendo, setEmitiendo] = useState(false);
  const [resultado, setResultado] = useState(null);

  const opGravadas = useMemo(() => items.reduce((s, i) => s + i.valor_total, 0), [items]);
  const totalIgv = useMemo(() => opGravadas * IGV_RATE, [opGravadas]);
  const total = useMemo(() => opGravadas + totalIgv, [opGravadas, totalIgv]);

  const handleBuscar = async () => {
    if (!clienteDoc.trim()) return;
    setBuscando(true);
    try {
      if (tipoDoc === "1" && clienteDoc.length === 8) {
        const data = await getReniec(clienteDoc);
        if (data?.nombres) {
          setClienteNombre(`${data.nombres} ${data.apellidoPaterno} ${data.apellidoMaterno}`.trim());
        }
      } else {
        const cliente = await findClienteByDoc(clienteDoc.trim());
        if (cliente) setClienteNombre(cliente.razon_social);
        else toast("No encontrado — ingresa el nombre manualmente");
      }
    } catch {
      toast.error("Error al buscar cliente");
    } finally {
      setBuscando(false);
    }
  };

  const handleEmitir = async () => {
    if (!emisor) { toast.error("No hay emisor configurado"); return; }
    if (!serie) { toast.error("No hay serie B configurada. Crea una en Configuración > Series"); return; }
    if (items.length === 0) { toast.error("Agrega al menos un ítem"); return; }

    setEmitiendo(true);
    setResultado(null);

    try {
      // 1. Gestionar cliente
      let clienteId = null;
      if (tipoDoc !== "0" && clienteDoc.trim()) {
        let cliente = await findClienteByDoc(clienteDoc.trim());
        if (!cliente) {
          const res = await createCliente({
            tipo_documento_id: tipoDoc,
            nrodoc: clienteDoc.trim(),
            razon_social: clienteNombre || clienteDoc.trim(),
            direccion: direccion || null,
          });
          cliente = res.data;
        }
        clienteId = cliente.id;
      }

      // 2. Crear cabecera
      const cabRes = await createComprobante({
        emisor_id: emisor.id,
        tipo_comprobante_id: "03",
        serie_id: serie.id,
        serie: serie.serie,
        correlativo: serie.correlativo,
        fecha_emision: fechaEmision,
        moneda_id: "PEN",
        op_gravadas: opGravadas.toFixed(2),
        igv: totalIgv.toFixed(2),
        total: total.toFixed(2),
        cliente_id: clienteId,
        forma_pago: "Contado",
      });
      const comprobanteId = cabRes.data.id;

      // 3. Crear detalles
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        await createDetalle({
          comprobante_id: comprobanteId,
          item: i + 1,
          cantidad: it.cantidad,
          valor_unitario: it.valor_unitario.toFixed(6),
          precio_unitario: it.precio_unitario.toFixed(6),
          igv: it.igv.toFixed(6),
          porcentaje_igv: (IGV_RATE * 100).toFixed(6),
          valor_total: it.valor_total.toFixed(6),
          importe_total: it.importe_total.toFixed(6),
        });
      }

      // 4. Emitir a SUNAT
      const emitRes = await toast.promise(
        emitirComprobante(comprobanteId),
        {
          loading: "Enviando boleta a SUNAT...",
          success: "Boleta enviada a SUNAT",
          error: (e) => `Error SUNAT: ${e?.response?.data?.message || e.message}`,
        }
      );

      setResultado({ comprobante_id: comprobanteId, ...emitRes.data });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Error al emitir boleta");
    } finally {
      setEmitiendo(false);
    }
  };

  return (
    <div className="px-4 md:px-12 py-4 w-full">
      <div className="flex justify-start gap-5 items-center">
        <Drawer />
        <div className="text-xl md:text-3xl font-black text-sky-800 dark:text-slate-100 transition-colors tracking-tight">Emitir Boleta</div>
        {fromTicket && (
          <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 shadow-sm transition-colors">
            Proveniente de Ticket ✓
          </span>
        )}
      </div>

      {/* Encabezado del comprobante */}
      <div className="flex justify-center items-center w-full p-2 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6">
          <DatosEmpresa />
          <div className="p-6 flex justify-center items-center flex-col border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-colors shadow-sm">
            <div className="text-xl font-black text-gray-800 dark:text-slate-100">{emisor ? `RUC: ${emisor.ruc}` : "Cargando emisor..."}</div>
            <div className="font-black text-2xl text-center text-sky-800 dark:text-slate-100 uppercase tracking-tighter mt-1">Boleta Electrónica</div>
            <div className="flex px-4 py-2 bg-slate-100 dark:bg-slate-950 rounded-lg items-center mt-3 border dark:border-slate-800">
              {serie
                ? <span className="text-sky-800 dark:text-slate-300 font-mono font-bold tracking-widest">{serie.serie} — {String(serie.correlativo).padStart(8, "0")}</span>
                : <span className="text-red-500 text-sm font-bold">Sin serie B configurada</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="py-2 flex gap-2 flex-col">
        {/* Cliente */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-bold" placeholder="Nombre / Razón Social del cliente" />
          <div className="flex flex-row gap-2">
            <select value={tipoDoc} onChange={(e) => { setTipoDoc(e.target.value); setClienteDoc(""); setClienteNombre(""); }}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 p-3 rounded-lg text-sm focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-bold">
              <option value="0">Sin Documento</option>
              <option value="1">DNI</option>
              <option value="6">RUC</option>
              <option value="4">Carné Extranjería</option>
              <option value="7">Pasaporte</option>
            </select>
            <div className="relative flex-1">
              <input type="text" value={clienteDoc} onChange={(e) => setClienteDoc(e.target.value)}
                disabled={tipoDoc === "0"}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-lg p-3 w-full disabled:opacity-50 text-sm focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-mono font-bold" 
                placeholder="Nro Documento" />
              {tipoDoc !== "0" && (
                <button onClick={handleBuscar} disabled={buscando}
                  className="absolute right-2 top-2 p-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-md cursor-pointer disabled:opacity-50 transition-colors">
                  <CiSearch className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Dirección y Fecha */}
        <div className="flex flex-col md:flex-row gap-4 mt-2">
          <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 rounded-lg p-3 w-full md:w-1/2 text-sm focus:outline-none focus:border-sky-500 transition-colors shadow-sm font-bold" placeholder="Dirección (Opcional)" />
          <div className="flex w-full md:w-1/2 items-center gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1 px-3 shadow-sm">
            <label className="whitespace-nowrap text-xs font-black uppercase text-gray-500 dark:text-slate-500 tracking-widest">Emisión</label>
            <input type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)}
              className="p-2 bg-transparent w-full text-gray-700 dark:text-slate-200 text-sm focus:outline-none font-bold" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 px-1">
          <span className="text-xs font-black uppercase tracking-widest text-sky-800 dark:text-slate-500 opacity-80">Venta Interna</span>
          <span className="ml-auto text-xs font-black uppercase tracking-widest text-sky-800 dark:text-slate-500">Moneda: PEN (S/)</span>
        </div>

        {/* Tabla de ítems */}
        <div className="overflow-x-auto rounded-xl border border-sky-700 dark:border-slate-800 shadow-lg mt-1">
          <table className="min-w-full divide-y divide-sky-700 dark:divide-slate-800">
            <thead className="bg-sky-700 dark:bg-slate-900 text-white">
              <tr>
                <th className="px-4 py-2 text-center text-sm">Cant.</th>
                <th className="px-4 py-2 text-left text-sm">Descripción</th>
                <th className="px-4 py-2 text-left text-sm">Unidad</th>
                <th className="px-4 py-2 text-right text-sm">P. Unitario</th>
                <th className="px-4 py-2 text-right text-sm">Sub Total</th>
                <th className="px-4 py-2 text-center text-sm">Acc.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
              {items.length === 0 && !showItemForm && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400 text-sm">
                    Sin ítems — haz clic en "Agregar ítem" para comenzar
                  </td>
                </tr>
              )}
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-sky-50 dark:hover:bg-slate-900 transition-colors">
                  <td className="text-center px-4 py-3 text-sm dark:text-slate-200 font-bold">{item.cantidad}</td>
                  <td className="px-4 py-3 text-sm dark:text-slate-200">{item.descripcion}</td>
                  <td className="px-4 py-3 text-sm dark:text-slate-300 italic opacity-80">
                    {unidades.find((u) => u.id === item.unidad_id)?.nombre || item.unidad_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-right dark:text-slate-200 font-mono">S/ {Number(item.precio_unitario).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-right dark:text-slate-100 font-mono font-bold">S/ {Number(item.importe_total).toFixed(2)}</td>
                  <td className="flex justify-center p-2">
                    <button onClick={() => { if (window.confirm("¿Eliminar este ítem?")) { setItems((p) => p.filter((_, i) => i !== idx)); setResultado(null); } }}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {showItemForm && (
                <ItemForm unidades={unidades} onAgregar={(item) => { setItems((p) => [...p, item]); setResultado(null); setShowItemForm(false); }} onCancelar={() => setShowItemForm(false)} />
              )}
            </tbody>
          </table>
        </div>

        {!showItemForm && (
          <button onClick={() => setShowItemForm(true)}
            className="flex items-center gap-2 text-sky-700 dark:text-slate-300 border-2 border-dashed border-sky-700 dark:border-slate-800 rounded-xl p-3 hover:bg-sky-50 dark:hover:bg-slate-900 w-full justify-center text-sm font-black uppercase tracking-widest transition-all mt-2">
            <FaPlus /> Agregar ítem
          </button>
        )}

        {/* Totales */}
        <div className="flex flex-col gap-2 items-end mt-6">
          {[["Op. Gravada", opGravadas], ["IGV (18%)", totalIgv]].map(([label, val]) => (
            <div key={label} className="flex items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-500 w-32 text-right">{label}</span>
              <span className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-lg p-2.5 w-40 text-right text-sm font-mono font-bold text-gray-700 dark:text-slate-200 shadow-sm">
                S/ {val.toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs font-black uppercase tracking-widest text-sky-800 dark:text-slate-300 w-32 text-right">Importe Total</span>
            <span className="bg-sky-700 dark:bg-slate-800 border dark:border-slate-700 rounded-lg p-3 w-40 text-right text-lg font-mono font-black text-white shadow-md">
              S/ {total.toFixed(2)}
            </span>
          </div>
        </div>

        <hr className="bg-gray-200 my-1" />

        {/* Importe en letras */}
        <div className="flex flex-col md:flex-row py-4 gap-4 items-center bg-slate-50 dark:bg-slate-950/50 rounded-xl px-6 border dark:border-slate-900 mt-4">
          <div className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-500 w-full md:w-1/4">Importe en Letras</div>
          <input className="p-3 uppercase w-full text-sky-800 dark:text-slate-400 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-xs font-bold shadow-sm" disabled
            value={total > 0 ? numeroALetras(total) : "CERO CON 00/100 SOLES"} />
        </div>

        {/* Resultado de emisión */}
        {resultado && (
          <div className={`rounded-xl p-5 text-sm mt-4 shadow-lg border-2 animate-jump-in ${resultado.success ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50" : "bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/50"}`}>
            <div className={`font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${resultado.success ? "text-emerald-800 dark:text-emerald-400" : "text-rose-800 dark:text-rose-400"}`}>
              {resultado.success ? "✓ Boleta aceptada" : "✗ Boleta rechazada"}
            </div>
            <div className="text-gray-600 dark:text-slate-400 font-medium">SUNAT: <span className="font-bold">{resultado.codigo_sunat}</span> — {resultado.mensaje_sunat}</div>
            {resultado.success && (
              <div className="flex gap-3 mt-4">
                <a href={getPdfUrl(resultado.comprobante_id)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-md">
                  <FaFilePdf className="text-base" /> PDF
                </a>
                <a href={getXmlUrl(resultado.comprobante_id)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-sky-800 hover:bg-sky-700 text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-md">
                  <FaFileCode className="text-base" /> XML
                </a>
              </div>
            )}
          </div>
        )}

        {/* Botón emitir */}
        <div className="flex justify-center md:justify-end mt-8">
          <button onClick={handleEmitir} disabled={emitiendo || items.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-4 w-full md:w-1/4 text-white cursor-pointer font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100">
            {emitiendo ? "Enviando..." : "Emitir Boleta"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Boleta;
