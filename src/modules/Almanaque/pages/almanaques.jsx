import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  FaTrash, FaPrint, FaBarcode, FaPlus, FaRotateLeft,
} from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import toast from "react-hot-toast";
import { getProducto } from "../../Inventory/services/productos";
import { getReniec } from "../../../shared/services/reniec";
import { createAlmanaque, getCotizacionPdf } from "../services/almanaques";
import { getUnidades } from "../../Billing/services/unidades";
import logo from "../../../assets/ALEXANDER.webp";

// ─── Constantes ───────────────────────────────────────────────────────────────
const today = new Date().toLocaleDateString('en-CA');

// ─── Helper: impresión directa via iframe oculto ─────────────────────────────
const printPdfBlob = (blob) => {
  const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = () => {
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 1000);
  };
};

// ─────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────
function Cotizacion() {
  // ── Estado del formulario ──
  const [cliente, setCliente] = useState("");
  const [tipoDoc, setTipoDoc] = useState("Sin Documento");
  const [nroDoc, setNroDoc] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fechaEmision, setFechaEmision] = useState(today);
  const [items, setItems] = useState([]);

  // ── Estado del lector de barras ──
  const [barcodeInput, setBarcodeInput] = useState("");

  // ── Estado de la fila manual ──
  const [showManualRow, setShowManualRow] = useState(false);
  const [manualDesc, setManualDesc] = useState("");
  const [manualCant, setManualCant] = useState(1);
  const [manualPrecio, setManualPrecio] = useState("");
  const [manualPid, setManualPid] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // ── Estado de guardado ──
  const [savedCotizacion, setSavedCotizacion] = useState(null);

  const barcodeRef = useRef(null);
  const manualDescRef = useRef(null);
  const manualPrecioRef = useRef(null);

  // ── Queries ──
  const { data: productos = [] } = useQuery({
    queryKey: ["productos"],
    queryFn: getProducto,
  });
  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades"],
    queryFn: getUnidades,
  });
  const unidadMap = useMemo(() => Object.fromEntries(unidades.map((u) => [u.id, u.descripcion || u.nombre || u.id])), [unidades]);

  // ── RENIEC ──
  const { data: reniecData, refetch: buscarReniec } = useQuery({
    queryKey: ["reniec", nroDoc],
    queryFn: () => getReniec(nroDoc),
    enabled: false,
  });
  useEffect(() => {
    if (reniecData) {
      setCliente([reniecData.nombres, reniecData.apellidoPaterno, reniecData.apellidoMaterno].filter(Boolean).join(" "));
    }
  }, [reniecData]);

  // ── Mutación ──
  const cotizacionMutation = useMutation({ mutationFn: createAlmanaque });

  // ── Totales ──
  const total = items.reduce((s, i) => s + i.subtotal, 0);
  const opGravada = total / 1.18;
  const igv = total - opGravada;

  // ── Sugerencias de inventario para ítem manual ──
  const suggestions = useMemo(() => {
    if (!manualDesc.trim() || manualDesc.length < 2) return [];
    return productos
      .filter((p) => p.nombre.toLowerCase().includes(manualDesc.toLowerCase()))
      .slice(0, 6);
  }, [manualDesc, productos]);

  // ── Helper: agregar/incrementar producto ──
  const addProductToItems = useCallback((p) => {
    const precio = parseFloat(p.valor_unitario || p.precio || 0);
    setItems((prev) => {
      const exists = prev.findIndex((i) => i._pid === p.id);
      if (exists >= 0) {
        return prev.map((i, idx) =>
          idx === exists
            ? { ...i, cantidad: i.cantidad + 1, subtotal: parseFloat(((i.cantidad + 1) * i.precioUnitario).toFixed(2)) }
            : i
        );
      }
      return [...prev, {
        _pid: p.id,
        descripcion: p.nombre,
        cantidad: 1,
        precioUnitario: parseFloat(precio.toFixed(2)),
        subtotal: parseFloat(precio.toFixed(2)),
        _unidad: unidadMap[p.unidad_id] || p.unidad_id || "",
      }];
    });
  }, [unidadMap]);

  // ── Lector de barras ──
  const handleBarcodeKey = (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;
    const found = productos.find(
      (p) => p.codigo_sunat === code || p.nombre?.toLowerCase() === code.toLowerCase()
    );
    if (found) { addProductToItems(found); toast.success(`"${found.nombre}" agregado`); }
    else toast.error(`Producto "${code}" no encontrado`);
    setBarcodeInput("");
    barcodeRef.current?.focus();
  };

  // ── Seleccionar sugerencia en ítem manual ──
  const handleSelectSuggestion = (p) => {
    const precio = parseFloat(parseFloat(p.valor_unitario || 0).toFixed(2));
    const cant = parseInt(manualCant) || 1;
    setItems((prev) => [...prev, {
      _pid: p.id,
      descripcion: p.nombre,
      cantidad: cant,
      precioUnitario: precio,
      subtotal: parseFloat((cant * precio).toFixed(2)),
      _unidad: unidadMap[p.unidad_id] || p.unidad_id || "",
    }]);
    setManualDesc(""); setManualCant(1); setManualPrecio(""); setManualPid(null);
    setShowManualRow(false); setShowSuggestions(false);
    barcodeRef.current?.focus();
    toast.success(`"${p.nombre}" agregado`);
  };

  // ── Agregar ítem manual ──
  const handleAddManual = () => {
    if (!manualDesc.trim()) return toast.error("Ingrese una descripción");
    const precio = parseFloat(manualPrecio);
    if (isNaN(precio) || precio <= 0) return toast.error("Precio inválido");
    const cant = parseInt(manualCant) || 1;
    const prod = manualPid ? productos.find((p) => p.id === manualPid) : null;
    setItems((prev) => [...prev, {
      _pid: manualPid,
      descripcion: manualDesc.trim(),
      cantidad: cant,
      precioUnitario: parseFloat(precio.toFixed(2)),
      subtotal: parseFloat((cant * precio).toFixed(2)),
      _unidad: prod ? (unidadMap[prod.unidad_id] || prod.unidad_id || "") : "",
    }]);
    setManualDesc(""); setManualCant(1); setManualPrecio(""); setManualPid(null);
    setShowManualRow(false); setShowSuggestions(false);
    barcodeRef.current?.focus();
  };

  // ── Editar cantidad inline ──
  const handleCantChange = (idx, val) => {
    const cant = parseInt(val) || 1;
    setItems((prev) => prev.map((i, k) =>
      k === idx ? { ...i, cantidad: cant, subtotal: parseFloat((cant * i.precioUnitario).toFixed(2)) } : i
    ));
  };

  // ── Eliminar ítem ──
  const handleRemoveItem = (idx) => setItems((prev) => prev.filter((_, k) => k !== idx));

  // ── Construir payload ──
  const buildPayload = () => ({
    cliente: cliente || "Sin nombre",
    tipoDocumento: tipoDoc,
    numeroDocumento: nroDoc || "00000000",
    direccion,
    fechaEmision,
    precioTotal: parseFloat(total.toFixed(2)),
    aCuenta: 0,
    detalles: items.map(({ _pid, descripcion, cantidad, precioUnitario, _unidad }) => ({
      descripcion, cantidad, precioUnitario,
      unidad: _unidad || "UND",
    })),
  });

  // ── Guardar + imprimir (PDF directo) ──
  const handleSaveAndPrint = async (format) => {
    if (items.length === 0) { toast.error("Agrega al menos un ítem"); return; }

    if (savedCotizacion) {
      try {
        const res = await getCotizacionPdf(savedCotizacion.id, format);
        printPdfBlob(res.data);
      } catch (err) {
        toast.error("Error al generar PDF");
      }
      return;
    }

    toast.promise(cotizacionMutation.mutateAsync(buildPayload()), {
      loading: "Guardando cotización...",
      success: async (res) => {
        setSavedCotizacion(res.data);
        try {
          const pdfRes = await getCotizacionPdf(res.data.id, format);
          printPdfBlob(pdfRes.data);
        } catch (_) { /* PDF opcional */ }
        handleNuevaCotizacion();
        return `Cotización N° ${String(res.data.id).padStart(6, "0")} guardada`;
      },
      error: (err) => `Error: ${err?.response?.data?.message || err.message}`,
    });
  };

  // ── Nueva Cotización ──
  const handleNuevaCotizacion = () => {
    setCliente(""); setTipoDoc("Sin Documento"); setNroDoc(""); setDireccion(""); setTelefono("");
    setFechaEmision(today); setItems([]); setBarcodeInput("");
    setShowManualRow(false); setSavedCotizacion(null);
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  // ── Autofoco al montar ──
  useEffect(() => { barcodeRef.current?.focus(); }, []);

  return (
    <div className="px-4 md:px-12 py-4 w-full max-w-screen-xl mx-auto">

      {/* ── Header empresa + cotización ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 mb-6 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Izquierda: Logo + Datos empresa */}
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-20 w-20 object-contain" />
            <div className="flex flex-col">
              <h2 className="text-lg font-black text-gray-800 dark:text-slate-100 leading-tight">Distribuidora Imprenta Alexander E.I.R.L.</h2>
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400">Jr.Bellido 579 Huamanga - Ayacucho - Huamanga</p>
              <p className="text-[11px] text-gray-400 dark:text-slate-500">Impresiones Offet, Diseño Publicitario, Afiches, Revistas, Tripticos, Etiquetas, Almanaques.</p>
              <p className="text-xs font-black text-gray-600 dark:text-slate-300">CEL: 927840716</p>
            </div>
          </div>

          {/* Derecha: Bloque RUC + Cotización + Correlativo */}
          <div className="flex flex-col items-center border-2 border-sky-700 dark:border-slate-700 rounded-xl px-8 py-4 min-w-[200px]">
            <span className="text-sm font-black text-gray-800 dark:text-slate-100">RUC: 20608582011</span>
            <span className="text-xl font-black text-sky-800 dark:text-sky-400 uppercase tracking-wider mt-1">Cotización</span>
            <div className="flex items-center gap-2 mt-2 bg-slate-100 dark:bg-slate-950 rounded-lg px-4 py-1.5 border dark:border-slate-800">
              <span className="text-sky-800 dark:text-slate-300 font-mono font-bold tracking-widest text-sm">COT -</span>
              <span className="font-mono font-black text-lg text-slate-700 dark:text-slate-200">
                {savedCotizacion ? String(savedCotizacion.id).padStart(6, "0") : "------"}
              </span>
            </div>
            {savedCotizacion && (
              <span className="mt-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                Guardada
              </span>
            )}
          </div>
        </div>

        {/* Botón nueva cotización */}
        <div className="flex justify-end mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={handleNuevaCotizacion}
            className="flex items-center gap-2 bg-sky-700 dark:bg-slate-800 hover:bg-sky-600 dark:hover:bg-slate-700 text-white rounded-lg px-5 py-2.5 cursor-pointer transition-all text-xs font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95"
          >
            <FaRotateLeft className="text-sm" />
            <span className="hidden md:inline">Nueva Cotización</span>
          </button>
        </div>
      </div>

      {/* ── Datos del cliente ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 mb-6 flex flex-col gap-4 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            className="w-full md:w-1/2 bg-gray-50 dark:bg-slate-950 rounded-lg p-3 border border-gray-200 dark:border-slate-800 text-gray-800 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-all font-bold"
            placeholder="Nombre o Razón Social del cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
          <div className="w-full md:w-1/2 flex gap-3">
            <select
              value={tipoDoc}
              onChange={(e) => { setTipoDoc(e.target.value); setNroDoc(""); }}
              className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg w-2/5 text-gray-800 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-all font-bold"
            >
              <option value="Sin Documento">Sin Documento</option>
              <option value="DNI">DNI</option>
              <option value="RUC">RUC</option>
              <option value="Pasaporte">Pasaporte</option>
              <option value="Carnet de Extranjería">Carnet de Extranjería</option>
              <option value="Cédula Diplomática">Cédula Diplomática</option>
            </select>
            <div className="relative flex-1">
              <input
                type="text"
                disabled={tipoDoc === "Sin Documento"}
                className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-3 w-full text-gray-800 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-all disabled:opacity-50 font-mono font-bold"
                placeholder="Nro. Documento"
                value={nroDoc}
                onChange={(e) => setNroDoc(e.target.value)}
                maxLength={tipoDoc === "DNI" ? 8 : tipoDoc === "RUC" ? 11 : 20}
              />
              {tipoDoc === "DNI" ? (
                <button
                  onClick={() => nroDoc.length === 8 && buscarReniec()}
                  className="absolute right-2 top-2 p-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-md cursor-pointer transition-colors shadow-sm"
                  title="Buscar en RENIEC"
                >
                  <CiSearch className="w-5 h-5" />
                </button>
              ) : (
                <span className="absolute right-2 top-2 p-1.5 opacity-30 text-gray-500">
                  <CiSearch />
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            className="w-full md:w-1/3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-3 text-gray-800 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-all font-bold"
            placeholder="Dirección (opcional)"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          <input
            type="text"
            className="w-full md:w-1/3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-3 text-gray-800 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-all font-bold font-mono"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
          <div className="w-full md:w-1/3 flex items-center gap-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-1 px-3 shadow-sm transition-colors">
            <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-slate-500 whitespace-nowrap">Emisión</label>
            <input
              type="date"
              className="p-2 bg-transparent text-gray-700 dark:text-slate-200 text-sm focus:outline-none font-bold w-full"
              value={fechaEmision}
              onChange={(e) => setFechaEmision(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Lector de barras ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4 mb-6 shadow-sm transition-colors">
        <div className="flex items-center gap-4">
          <div className="bg-sky-50 dark:bg-slate-800 p-2.5 rounded-lg border dark:border-slate-700">
            <FaBarcode className="text-sky-700 dark:text-slate-300 text-2xl" />
          </div>
          <input
            ref={barcodeRef}
            type="text"
            className="flex-1 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-3 text-gray-800 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-all font-mono font-bold"
            placeholder="Escanea el código de barras o escribe para buscar producto..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleBarcodeKey}
          />
          <button
            onClick={() => { setShowManualRow(true); setTimeout(() => manualDescRef.current?.focus(), 50); }}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-dashed border-sky-700 dark:border-slate-800 text-sky-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg px-5 py-2.5 cursor-pointer transition-all text-xs font-black uppercase tracking-widest whitespace-nowrap"
          >
            <FaPlus className="text-sm" />
            <span className="hidden md:inline">Ítem manual</span>
          </button>
        </div>
      </div>

      {/* ── Tabla de ítems ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 mb-6 overflow-visible shadow-lg transition-colors">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sky-700 dark:bg-slate-950 text-white font-black uppercase tracking-widest text-xs">
              <th className="p-4 text-left">Descripción</th>
              <th className="p-4 text-center w-28">Unidad</th>
              <th className="p-4 text-center w-28">Cantidad</th>
              <th className="p-4 text-right w-32">P. Unit.</th>
              <th className="p-4 text-right w-32">Subtotal</th>
              <th className="p-4 w-14"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {items.length === 0 && !showManualRow && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-gray-400 dark:text-slate-600 font-bold italic">
                  Sin ítems — escanea un producto o agrégalo manualmente
                </td>
              </tr>
            )}
            {items.map((item, idx) => (
              <tr key={idx} className="hover:bg-sky-50 dark:hover:bg-slate-950 transition-colors">
                <td className="p-4 font-bold text-gray-800 dark:text-slate-200">{item.descripcion}</td>
                <td className="p-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{item._unidad || "—"}</td>
                <td className="p-4 text-center">
                  <input
                    type="number" min={1} value={item.cantidad}
                    onChange={(e) => handleCantChange(idx, e.target.value)}
                    className="w-20 text-center bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-1.5 text-gray-800 dark:text-slate-100 font-bold focus:outline-none focus:border-sky-500 transition-all font-mono"
                  />
                </td>
                <td className="p-4 text-right dark:text-slate-300 font-mono">S/ {item.precioUnitario.toFixed(2)}</td>
                <td className="p-4 text-right font-black text-sky-800 dark:text-slate-100 font-mono">S/ {item.subtotal.toFixed(2)}</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleRemoveItem(idx)} className="text-rose-500 hover:text-rose-400 hover:scale-110 transition-all cursor-pointer">
                    <FaTrash className="text-base" />
                  </button>
                </td>
              </tr>
            ))}

            {/* Fila de ítem manual con autocomplete de inventario */}
            {showManualRow && (
              <tr className="bg-sky-50/50 dark:bg-slate-800/20 animate-fade-down animate-duration-300">
                <td className="p-3">
                  <div className="relative">
                    <input
                      ref={manualDescRef}
                      type="text"
                      className="w-full bg-white dark:bg-slate-950 border border-sky-300 dark:border-sky-800/50 rounded-lg p-2 text-sm font-bold text-gray-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-all"
                      placeholder="Descripción — escribe para buscar producto"
                      value={manualDesc}
                      onChange={(e) => { setManualDesc(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter") return;
                        if (showSuggestions && suggestions.length > 0) {
                          handleSelectSuggestion(suggestions[0]);
                        } else {
                          manualPrecioRef.current?.focus();
                        }
                      }}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-sky-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 max-h-56 overflow-hidden overflow-y-auto animate-fade-down animate-duration-200">
                        {suggestions.map((p) => (
                          <li
                            key={p.id}
                            onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(p); }}
                            className="px-5 py-3 hover:bg-sky-50 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors border-b last:border-0 border-gray-50 dark:border-slate-800"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-800 dark:text-slate-200 text-sm">{p.nombre}</span>
                              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
                                {p.es_servicio ? "Servicio" : `Stock: ${p.stock ?? 0}`}
                              </span>
                            </div>
                            <span className="text-sky-700 dark:text-sky-400 font-mono font-black text-sm">S/ {parseFloat(p.valor_unitario || 0).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </td>
                <td className="p-3 text-center text-xs text-slate-400 italic">auto</td>
                <td className="p-3">
                  <input
                    type="number" min={1}
                    className="w-full text-center bg-white dark:bg-slate-950 border border-sky-300 dark:border-sky-800/50 rounded-lg p-2 text-sm font-bold text-gray-800 dark:text-slate-100 font-mono"
                    value={manualCant}
                    onChange={(e) => setManualCant(e.target.value)}
                  />
                </td>
                <td className="p-3">
                  <input
                    ref={manualPrecioRef}
                    type="number" min={0} step="0.01"
                    className="w-full text-right bg-white dark:bg-slate-950 border border-sky-300 dark:border-sky-800/50 rounded-lg p-2 text-sm font-bold text-gray-800 dark:text-slate-100 font-mono"
                    placeholder="0.00"
                    value={manualPrecio}
                    onChange={(e) => setManualPrecio(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
                  />
                </td>
                <td className="p-3 text-right text-gray-400 dark:text-slate-500 font-mono italic text-[11px]">
                  S/ {(parseFloat(manualPrecio || 0) * (parseInt(manualCant) || 1)).toFixed(2)}
                </td>
                <td className="p-3">
                  <div className="flex gap-2 justify-center">
                    <button onClick={handleAddManual} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-1.5 cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all">OK</button>
                    <button
                      onClick={() => { setShowManualRow(false); setManualDesc(""); setManualCant(1); setManualPrecio(""); setShowSuggestions(false); }}
                      className="bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-300 dark:hover:bg-slate-700 text-[10px] font-black transition-all"
                    >✕</button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Totales ── */}
      <div className="flex justify-end mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-5 w-full md:w-72 shadow-lg transition-colors">
          <div className="flex justify-between text-xs py-1.5 font-black uppercase tracking-widest text-slate-500">
            <span>Op. Gravada</span>
            <span className="font-mono text-sm text-slate-700 dark:text-slate-400">S/ {opGravada.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs py-1.5 font-black uppercase tracking-widest text-slate-500">
            <span>IGV (18%)</span>
            <span className="font-mono text-sm text-slate-700 dark:text-slate-400">S/ {igv.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-black border-t-2 border-gray-100 dark:border-slate-800 pt-4 mt-2">
            <span className="text-slate-800 dark:text-slate-100 uppercase tracking-[0.1em]">Total</span>
            <span className="text-sky-800 dark:text-sky-400 text-2xl font-mono">S/ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* ── Botones de acción ── */}
      <div className="flex flex-col md:flex-row gap-4 justify-end mb-10">
        <button
          onClick={() => handleSaveAndPrint("a5")}
          disabled={cotizacionMutation.isPending}
          className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl px-8 py-4 cursor-pointer transition-all font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 text-xs"
        >
          <FaPrint className="text-lg" />
          {savedCotizacion ? "Reimprimir A5" : "Emitir Cotización A5"}
        </button>
        <button
          onClick={() => handleSaveAndPrint("a4")}
          disabled={cotizacionMutation.isPending}
          className="flex items-center justify-center gap-3 bg-sky-800 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl px-8 py-4 cursor-pointer transition-all font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 text-xs"
        >
          <FaPrint className="text-lg" />
          {savedCotizacion ? "Reimprimir A4" : "Emitir Cotización A4"}
        </button>
      </div>
    </div>
  );
}

export default Cotizacion;
