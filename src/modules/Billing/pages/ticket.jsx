import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  FaTrash, FaPrint, FaBarcode, FaPlus, FaRotateLeft,
  FaChevronDown, FaBoxOpen, FaCashRegister,
} from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import toast from "react-hot-toast";
import { getProducto } from "../../Inventory/services/productos";
import { getReniec } from "../../../shared/services/reniec";
import { createTicket, getTicketPdf } from "../../../shared/services/ticket";
import { getCajaActual, abrirCaja, cerrarCaja } from "../../../shared/services/caja";
import { getUnidades } from "../services/unidades";

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
    setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 1000);
  };
};

const TIPO_DOC_MAP = {
  "Sin Documento": "0",
  "DNI": "1",
  "Carnet de Extranjería": "4",
  "RUC": "6",
  "Pasaporte": "7",
  "Cédula Diplomática": "A",
};

// ─────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────
function Ticket() {
  const navigate = useNavigate();

  // ── Rol del usuario ──
  const userData = useMemo(() => JSON.parse(localStorage.getItem("userData") || "null"), []);
  const isAdmin = userData?.cargo === "Administrador";

  // ── Estado del formulario ──
  const [cliente, setCliente] = useState("");
  const [tipoDoc, setTipoDoc] = useState("Sin Documento");
  const [nroDoc, setNroDoc] = useState("");
  const [direccion, setDireccion] = useState("");
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

  // ── Estado de impresión / guardado ──
  const [savedTicket, setSavedTicket] = useState(null);

  // ── Estado de la caja ──
  const [showAbrirModal, setShowAbrirModal] = useState(false);
  const [showCerrarModal, setShowCerrarModal] = useState(false);
  const [montoApertura, setMontoApertura] = useState("");
  const [montoCierre, setMontoCierre] = useState("");
  const [observacionCierre, setObservacionCierre] = useState("");

  // ── Menú Convertir a ──
  const [showConvertMenu, setShowConvertMenu] = useState(false);

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

  const { data: cajaData, refetch: refetchCaja } = useQuery({
    queryKey: ["cajaActual"],
    queryFn: getCajaActual,
    refetchInterval: 30000,
  });
  const caja = cajaData?.caja || null;
  const ventasPreview = {
    tickets: cajaData?.ventas_tickets || 0,
    comprobantes: cajaData?.ventas_comprobantes || 0,
    total: cajaData?.total_ventas_preview || 0,
  };

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

  // ── Mutaciones ──
  const ticketMutation = useMutation({ mutationFn: createTicket });
  const cajaAbrirMutation = useMutation({ mutationFn: abrirCaja });
  const cajaCerrarMutation = useMutation({ mutationFn: ({ id, payload }) => cerrarCaja(id, payload) });

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
        _unidad_id: p.unidad_id || "NIU",
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
      (p) => 
        (p.codigo_barras && p.codigo_barras === code) || 
        p.codigo_sunat === code || 
        (p.nombre && p.nombre.toLowerCase() === code.toLowerCase())
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
      _unidad_id: prod?.unidad_id || "NIU",
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
    detalles: items.map(({ _pid, descripcion, cantidad, precioUnitario, subtotal }) => ({
      descripcion, cantidad, precioUnitario, subtotal,
      producto_id: _pid || null,
    })),
  });

  // ── Guardar + imprimir (PDF desde backend) ──
  const handleSaveAndPrint = async (mode) => {
    if (items.length === 0) { toast.error("Agrega al menos un ítem"); return; }
    if (!caja) { toast.error("Debe abrir la caja antes de generar tickets"); return; }

    const format = mode === "ticket" ? "80mm" : "a5";

    if (savedTicket) {
      try {
        const res = await getTicketPdf(savedTicket.id, format);
        printPdfBlob(res.data);
        openCashDrawerWebUSB(); // Intento de abrir gaveta
      } catch (err) {
        toast.error("Error al generar PDF");
      }
      return;
    }

    toast.promise(ticketMutation.mutateAsync(buildPayload()), {
      loading: "Guardando ticket...",
      success: async (res) => {
        setSavedTicket(res.data);
        refetchCaja();
        try {
          const pdfRes = await getTicketPdf(res.data.id, format);
          printPdfBlob(pdfRes.data);
          openCashDrawerWebUSB(); // Intento de abrir gaveta
        } catch (_) { /* PDF opcional */ }
        handleNuevaVenta();
        return `Ticket N° ${String(res.data.id).padStart(6, "0")} guardado`;
      },
      error: (err) => `Error: ${err?.response?.data?.message || err.message}`,
    });
  };

  // ── Nueva Venta ──
  const handleNuevaVenta = () => {
    setCliente(""); setTipoDoc("Sin Documento"); setNroDoc(""); setDireccion("");
    setFechaEmision(today); setItems([]); setBarcodeInput("");
    setShowManualRow(false); setSavedTicket(null);
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  // ── Convertir a Boleta/Factura ──
  const handleConvertir = (destino) => {
    if (destino === "factura" && tipoDoc !== "RUC") {
      toast.error("Para emitir Factura el cliente debe tener RUC");
      return;
    }
    navigate(`/${destino}`, {
      state: {
        fromTicket: {
          cliente,
          doc: nroDoc,
          tipoDocCodigo: TIPO_DOC_MAP[tipoDoc] || "0",
          direccion,
          items: items.map(({ _pid, descripcion, cantidad, precioUnitario, _unidad_id }) => ({
            descripcion, cantidad, precioConIgv: precioUnitario, unidad_id: _unidad_id || "NIU",
          })),
        },
      },
    });
  };

  // ── Abrir caja ──
  const handleAbrirCaja = () => {
    if (!montoApertura || isNaN(parseFloat(montoApertura))) {
      toast.error("Ingrese un monto de apertura válido"); return;
    }
    const ahora = new Date();
    toast.promise(
      cajaAbrirMutation.mutateAsync({
        monto_apertura: parseFloat(montoApertura),
        fecha_apertura: today,
        hora_apertura: ahora.toTimeString().split(" ")[0],
      }),
      {
        loading: "Abriendo caja...",
        success: () => {
          setShowAbrirModal(false); setMontoApertura(""); refetchCaja();
          return "Caja abierta correctamente";
        },
        error: (err) => err?.response?.data?.message || "Error al abrir caja",
      }
    );
  };

  // ── Cerrar caja ──
  const handleCerrarCaja = () => {
    if (!montoCierre || isNaN(parseFloat(montoCierre))) {
      toast.error("Ingrese el monto de cierre"); return;
    }
    toast.promise(
      cajaCerrarMutation.mutateAsync({
        id: caja.id,
        payload: { monto_cierre_fisico: parseFloat(montoCierre), observacion: observacionCierre },
      }),
      {
        loading: "Cerrando caja...",
        success: () => {
          setShowCerrarModal(false); setMontoCierre(""); setObservacionCierre(""); refetchCaja();
          handleNuevaVenta();
          return "Caja cerrada correctamente";
        },
        error: (err) => err?.response?.data?.message || "Error al cerrar caja",
      }
    );
  };

  // ── Autofoco al montar ──
  useEffect(() => { barcodeRef.current?.focus(); }, []);

  // ── Cálculo diferencia en modal cierre ──
  const montoEsperado = caja ? parseFloat(caja.monto_apertura) + ventasPreview.total : 0;
  const diferenciaPreview = montoCierre !== "" ? parseFloat(montoCierre || 0) - montoEsperado : null;

  return (
    <>
      {/* ── UI principal ── */}
      <div className="px-4 md:px-12 py-4 w-full max-w-screen-xl mx-auto">

        {/* ── Banner Caja ── */}
        {caja ? (
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl px-4 py-3 mb-6 shadow-sm flex-wrap gap-4 transition-colors">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <FaCashRegister className="text-emerald-700 dark:text-emerald-400 text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-emerald-800 dark:text-emerald-300 text-sm uppercase tracking-wider">
                  Caja Abierta{caja.hora_apertura ? ` · ${caja.hora_apertura.slice(0, 5)}` : ""}
                </span>
                <div className="flex gap-4 items-center mt-1">
                  <span className="text-emerald-700 dark:text-emerald-400/80 text-xs">Apertura: <strong className="font-mono">S/ {parseFloat(caja.monto_apertura).toFixed(2)}</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-300 text-xs font-black">Ventas: <strong className="font-mono text-sm underline decoration-emerald-500/30">S/ {ventasPreview.total.toFixed(2)}</strong></span>
                </div>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => { refetchCaja(); setShowCerrarModal(true); }}
                className="bg-rose-600 hover:bg-rose-500 text-white rounded-lg px-4 py-2 cursor-pointer transition-all text-xs font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95"
              >
                Cerrar Caja
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 mb-6 shadow-sm transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
                <FaCashRegister className="text-slate-500 dark:text-slate-400 text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-800 dark:text-slate-200 font-black uppercase tracking-widest text-sm">Caja Cerrada</span>
                <span className="text-slate-500 dark:text-slate-500 text-xs font-bold">
                  {isAdmin ? "Abra la caja para iniciar operaciones" : "Solicite al administrador abrir la caja"}
                </span>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAbrirModal(true)}
                className="bg-sky-700 hover:bg-sky-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg px-4 py-2 cursor-pointer transition-all text-xs font-black uppercase tracking-widest shadow-md hover:scale-105"
              >
                Abrir Caja
              </button>
            )}
          </div>
        )
}

        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-5">
            <h1 className="text-3xl font-black text-sky-800 dark:text-slate-100 transition-colors tracking-tight">Ticket de Venta</h1>
            {savedTicket && (
              <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 shadow-sm transition-colors">
                N° {String(savedTicket.id).padStart(6, "0")} · Guardado ✓
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {/* Botón Convertir a */}
            {items.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowConvertMenu((v) => !v)}
                  className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-sky-700 dark:border-slate-800 text-sky-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg px-4 py-2.5 cursor-pointer transition-all text-xs font-black uppercase tracking-widest shadow-sm"
                >
                  <FaBoxOpen className="text-sm" />
                  <span className="hidden md:inline">Convertir a</span>
                  <FaChevronDown className="text-[10px]" />
                </button>
                {showConvertMenu && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl z-20 min-w-48 overflow-hidden animate-fade-down animate-duration-200">
                    <button
                      onClick={() => { setShowConvertMenu(false); handleConvertir("boleta"); }}
                      className="w-full text-left px-5 py-3 hover:bg-sky-50 dark:hover:bg-slate-800 text-xs font-black uppercase tracking-widest text-gray-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      Boleta de Venta
                    </button>
                    <button
                      onClick={() => { setShowConvertMenu(false); handleConvertir("factura"); }}
                      className="w-full text-left px-5 py-3 hover:bg-sky-50 dark:hover:bg-slate-800 text-xs font-black uppercase tracking-widest text-gray-700 dark:text-slate-200 cursor-pointer border-t border-gray-100 dark:border-slate-800 transition-colors"
                    >
                      Factura (requiere RUC)
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleNuevaVenta}
              className="flex items-center gap-2 bg-sky-700 dark:bg-slate-800 hover:bg-sky-600 dark:hover:bg-slate-700 text-white rounded-lg px-5 py-2.5 cursor-pointer transition-all text-xs font-black uppercase tracking-widest shadow-md hover:scale-105 active:scale-95"
            >
              <FaRotateLeft className="text-sm" />
              <span className="hidden md:inline">Nueva Venta</span>
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
              className="w-full md:w-1/2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-3 text-gray-800 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-all font-bold"
              placeholder="Dirección (opcional)"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
            <div className="w-full md:w-1/2 flex items-center gap-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg p-1 px-3 shadow-sm transition-colors">
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
            onClick={() => handleSaveAndPrint("ticket")}
            disabled={ticketMutation.isPending}
            className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl px-8 py-4 cursor-pointer transition-all font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 text-xs"
          >
            <FaPrint className="text-lg" />
            {savedTicket ? "Reimprimir Ticket (80mm)" : "Emitir Ticket (80mm)"}
          </button>
          <button
            onClick={() => handleSaveAndPrint("a5")}
            disabled={ticketMutation.isPending}
            className="flex items-center justify-center gap-3 bg-sky-800 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl px-8 py-4 cursor-pointer transition-all font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 text-xs"
          >
            <FaPrint className="text-lg" />
            {savedTicket ? "Reimprimir A5" : "Emitir Ticket A5"}
          </button>
        </div>
      </div>

      {/* ── Modal Abrir Caja (solo Admin) ── */}
      {isAdmin && showAbrirModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade animate-duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm border dark:border-slate-800">
            <div className="flex flex-col items-center mb-6">
              <div className="p-4 bg-sky-50 dark:bg-slate-800 rounded-2xl mb-4 border dark:border-slate-700">
                <FaCashRegister className="text-sky-700 dark:text-sky-400 text-4xl" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Caja Inicial</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Configuración del turno</p>
            </div>

            <div className="mb-8">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">Monto de apertura</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 dark:text-slate-500 text-lg">S/</span>
                <input
                  type="number" min="0" step="0.01"
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-2xl font-mono font-black text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-all shadow-inner"
                  placeholder="0.00"
                  value={montoApertura}
                  onChange={(e) => setMontoApertura(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleAbrirCaja()}
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAbrirCaja}
                disabled={cajaAbrirMutation.isPending}
                className="w-full py-4 bg-sky-700 hover:bg-sky-600 text-white rounded-2xl transition-all cursor-pointer disabled:opacity-50 font-black uppercase tracking-widest shadow-xl hover:scale-105"
              >Abrir Turno</button>
              <button
                onClick={() => { setShowAbrirModal(false); setMontoApertura(""); }}
                className="w-full py-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase text-[10px] font-black tracking-widest cursor-pointer"
              >Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Cerrar Caja (solo Admin) ── */}
      {isAdmin && showCerrarModal && caja && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade animate-duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-md border dark:border-slate-800">
            <div className="flex flex-col items-center mb-6">
              <div className="p-4 bg-rose-50 dark:bg-slate-800 rounded-2xl mb-4 border dark:border-slate-700">
                <FaCashRegister className="text-rose-600 dark:text-rose-400 text-4xl" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Cierre de Caja</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Reporte final del turno</p>
            </div>

            {/* Resumen de ventas */}
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 mb-6 border dark:border-slate-800 space-y-3">
              {[
                ["Apertura inicial", `S/ ${parseFloat(caja.monto_apertura).toFixed(2)}`, "text-slate-500"],
                ["Ventas en tickets", `S/ ${ventasPreview.tickets.toFixed(2)}`, "text-slate-500"],
                ["Boletas / Facturas", `S/ ${ventasPreview.comprobantes.toFixed(2)}`, "text-slate-500"],
              ].map(([label, val, color]) => (
                <div key={label} className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                  <span className={color}>{label}</span>
                  <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{val}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t dark:border-slate-800">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Total ventas del turno</span>
                <span className="font-mono text-sm font-black text-slate-800 dark:text-slate-200">S/ {ventasPreview.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-widest text-sky-800 dark:text-sky-400">Efectivo esperado</span>
                <span className="text-xl font-mono font-black text-sky-800 dark:text-sky-100">S/ {montoEsperado.toFixed(2)}</span>
              </div>
            </div>

            {/* Monto físico */}
            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">Efectivo contado (Cierre)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 dark:text-slate-500 text-lg">S/</span>
                <input
                  type="number" min="0" step="0.01"
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-xl font-mono font-black text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-all shadow-inner"
                  placeholder="0.00"
                  value={montoCierre}
                  onChange={(e) => setMontoCierre(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* Diferencia en tiempo real */}
            {diferenciaPreview !== null && (
              <div className={`rounded-xl p-4 mb-6 text-xs font-black uppercase tracking-widest flex justify-between items-center animate-jump-in ${diferenciaPreview < 0 ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800" : diferenciaPreview > 0 ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800" : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"}`}>
                <span>{diferenciaPreview > 0 ? "Sobrante" : diferenciaPreview < 0 ? "Faltante" : "¡Caja Cuadrada! ✓"}</span>
                <span className="font-mono text-base">S/ {Math.abs(diferenciaPreview).toFixed(2)}</span>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">Observaciones</label>
              <textarea
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-sky-500 transition-all shadow-inner h-20 resize-none"
                placeholder="Escriba aquí cualquier incidencia o nota del turno..."
                value={observacionCierre}
                onChange={(e) => setObservacionCierre(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCerrarCaja}
                disabled={cajaCerrarMutation.isPending}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl transition-all cursor-pointer disabled:opacity-50 font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95"
              >Cerrar Turno</button>
              <button
                onClick={() => { setShowCerrarModal(false); setMontoCierre(""); setObservacionCierre(""); }}
                className="w-full py-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase text-[10px] font-black tracking-widest cursor-pointer"
              >Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Ticket;
