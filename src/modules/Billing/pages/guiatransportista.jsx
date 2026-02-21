import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaPlus, FaTrash, FaTruckFast } from "react-icons/fa6";
import Drawer from "../../../shared/components/drawer";
import DatosEmpresa from "../../../shared/components/datosEmpresa";
import { getEmisores } from "../services/emisores";
import { getSeriesByTipo } from "../services/series";
import { findClienteByDoc, createCliente } from "../../../shared/services/clientes";
import axiosURL from "../../../core/api/axiosURL";

const HOY = new Date().toLocaleDateString('en-CA');

/**
 * PÁGINA: GUÍA DE TRANSPORTISTA
 * Formulario para emitir Guías de Transportista (Tipo 31)
 */
function GuiaTransportista() {
  // Querys básicos
  const { data: emisores = [] } = useQuery({ queryKey: ["emisores"], queryFn: getEmisores });
  // La serie 31 suele ser V001 según SUNAT para Transportistas, buscamos 31
  const { data: series = [] } = useQuery({ queryKey: ["series", "31"], queryFn: () => getSeriesByTipo("31") });

  const emisor = emisores[0] || null;
  const serie = series[0] || null;

  // Estados del Formulario
  const [fechaEmision, setFechaEmision] = useState(HOY);
  const [fechaTraslado, setFechaTraslado] = useState(HOY);
  const [pesoTotal, setPesoTotal] = useState("1.000");
  const [unidadPeso, setUnidadPeso] = useState("KGM");
  const [numeroBultos, setNumeroBultos] = useState(1);
  
  // Sujetos
  const [remitenteDoc, setRemitenteDoc] = useState("");
  const [remitenteNombre, setRemitenteNombre] = useState("");
  const [destinatarioDoc, setDestinatarioDoc] = useState("");
  const [destinatarioNombre, setDestinatarioNombre] = useState("");

  // Placa y Conductor
  const [vehiculoPlaca, setVehiculoPlaca] = useState("");
  const [conductorDoc, setConductorDoc] = useState("");
  const [conductorNombre, setConductorNombre] = useState("");
  const [conductorLicencia, setConductorLicencia] = useState("");

  // Puntos de Partida / Llegada
  const [ubigeoPartida, setUbigeoPartida] = useState("");
  const [direccionPartida, setDireccionPartida] = useState("");
  const [ubigeoLlegada, setUbigeoLlegada] = useState("");
  const [direccionLlegada, setDireccionLlegada] = useState("");

  // Referencia
  const [docRefSerie, setDocRefSerie] = useState(""); // Ej: T001
  const [docRefCorrelativo, setDocRefCorrelativo] = useState(""); // Ej: 123

  // Detalle (Ítems)
  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);

  // Estado de Emisión
  const [emitiendo, setEmitiendo] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleBuscarPersona = async (doc, setNombre) => {
    if (!doc.trim()) return toast.error("Ingresa el RUC/DNI");
    try {
      const cliente = await findClienteByDoc(doc.trim());
      if (cliente) {
        setNombre(cliente.razon_social);
        toast.success("Encontrado");
      } else {
        toast("No encontrado. Ingresa Razón Social manualmente.");
      }
    } catch {
      toast.error("Error al buscar");
    }
  };

  const handleEmitirGuia = async () => {
    if (!emisor) return toast.error("No hay emisor");
    if (!serie) return toast.error("No hay serie 31 configurada");
    if (!remitenteDoc || !remitenteNombre) return toast.error("Faltan datos del Remitente");
    if (!destinatarioDoc || !destinatarioNombre) return toast.error("Faltan datos del Destinatario");
    if (!vehiculoPlaca || !conductorDoc) return toast.error("Falta Placa o DNI del Conductor");
    if (!ubigeoPartida || !direccionPartida) return toast.error("Requiere Ubigeo y Dirección de partida");
    if (!ubigeoLlegada || !direccionLlegada) return toast.error("Requiere Ubigeo y Dirección de llegada");
    if (items.length === 0) return toast.error("Agrega al menos un ítem a la guía");

    setEmitiendo(true);
    setResultado(null);

    try {
      // 1. Asegurar creación de clientes (Remitente y Destinatario)
      const garantizarCliente = async (doc, nombre) => {
        let cl = await findClienteByDoc(doc.trim());
        if (!cl) {
          const res = await createCliente({
            tipo_documento_id: doc.length === 11 ? "6" : "1",
            nrodoc: doc.trim(),
            razon_social: nombre.trim()
          });
          cl = res.data;
        }
        return cl;
      };

      await garantizarCliente(remitenteDoc, remitenteNombre);
      const destinatario = await garantizarCliente(destinatarioDoc, destinatarioNombre);

      // 2. Crear cabecera (Adaptado para Transportista - 31)
      const cabGuia = await axiosURL.post("/guia", {
        emisor_id: emisor.id,
        tipo_guia: "31",
        serie_id: serie.id,
        serie: serie.serie,
        correlativo: serie.correlativo,
        fecha_emision: fechaEmision,
        fecha_traslado: fechaTraslado,
        destinatario_id: destinatario.id, // En DB el receptor del doc
        // En transportista no hay "motivo_traslado" como tal (siempre es "Traslado por Transportista"),
        // pero mapearemos lo básico apoyado por la DB.
        motivo_traslado_id: "01", 
        descripcion_motivo: "Venta", 
        peso_bruto_total: pesoTotal,
        unidad_peso_id: unidadPeso,
        numero_bultos: numeroBultos,
        modalidad_traslado: "01", // Por defecto Transportista es 01 (Publico) o se asume implícito en UBL
        
        // Direcciones
        ubigeo_partida: ubigeoPartida,
        direccion_partida: direccionPartida,
        ubigeo_llegada: ubigeoLlegada,
        direccion_llegada: direccionLlegada,
        
        // Transportista: Para el tipo 31, la empresa emisora ES el transportista.
        transportista_ruc: emisor.ruc,
        transportista_razon_social: emisor.razon_social,
        
        // Vehículo y chofer
        vehiculo_placa: vehiculoPlaca,
        conductor_tipo_doc: "1",
        conductor_nrodoc: conductorDoc,
        conductor_nombres: conductorNombre,
        conductor_licencia: conductorLicencia,

        // Adiciones para Guía Transportista
        remitente_nrodoc: remitenteDoc,
        remitente_razon_social: remitenteNombre,
        doc_referencia_serie: docRefSerie,
        doc_referencia_correlativo: docRefCorrelativo
      });

      const guiaId = cabGuia.data.id;

      // 3. Crear los detalles de la guía /guia/detalle
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        await axiosURL.post("/guia/detalle", {
          guia_id: guiaId,
          item: i + 1,
          descripcion: it.descripcion,
          unidad_id: it.unidad_id,
          cantidad: it.cantidad,
          codigo_sunat: it.codigo || "",
        });
      }

      // 4. Emitir a SUNAT
      const emitRes = await toast.promise(
        axiosURL.post("/guia/emitir", { guia_id: guiaId }),
        {
          loading: "Enviando Guía de Transportista a SUNAT...",
          success: "Guía enviada a SUNAT",
          error: (e) => `Error SUNAT: ${e?.response?.data?.message || e.message}`
        }
      );

      setResultado(emitRes.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error general al emitir guía transportista");
    } finally {
      setEmitiendo(false);
    }
  };

  const addItem = (item) => {
    setItems((p) => [...p, item]);
    setShowItemForm(false);
  };

  return (
    <div className="px-4 md:px-12 py-4 w-full">
      <div className="flex justify-start gap-5 items-center">
        <Drawer />
        <div className="text-xl md:text-3xl font-black text-indigo-700 dark:text-indigo-500 transition-colors tracking-tight">
          Emitir Guía de Transportista
        </div>
      </div>

      <div className="flex justify-center items-center w-full p-2 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6">
          <DatosEmpresa />
          <div className="p-6 flex justify-center items-center flex-col border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-colors shadow-sm">
            <div className="text-xl font-black text-gray-800 dark:text-slate-100">{emisor ? `RUC: ${emisor.ruc}` : "Cargando emisor..."}</div>
            <div className="font-black text-2xl text-center text-indigo-700 dark:text-indigo-500 uppercase tracking-tighter mt-1">
              Guía de Transportista
            </div>
            <div className="flex px-4 py-2 bg-slate-100 dark:bg-slate-950 rounded-lg items-center mt-3 border dark:border-slate-800">
              {serie
                ? <span className="text-indigo-700 dark:text-indigo-500 font-mono font-bold tracking-widest">{serie.serie} — {String(serie.correlativo).padStart(8, "0")}</span>
                : <span className="text-red-500 text-sm font-bold">Sin serie "V001" configurada para Tipo 31</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 mt-6">
        {/* BLOQUE 1: Fechas y Pesos */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl">
          <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-500 uppercase tracking-widest mb-4">1. Datos del Traslado</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Emisión</label>
               <input type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 font-bold" />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Traslado</label>
               <input type="date" value={fechaTraslado} onChange={e => setFechaTraslado(e.target.value)} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Peso Bruto Total</label>
              <div className="flex">
                <input type="number" step="0.1" value={pesoTotal} onChange={e => setPesoTotal(e.target.value)} className="w-full p-2 text-sm border rounded-l-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Ej. 50.5" />
                <select value={unidadPeso} onChange={e => setUnidadPeso(e.target.value)} className="p-2 border border-l-0 rounded-r-lg bg-gray-100 dark:bg-slate-800 text-sm font-bold dark:border-slate-800 dark:text-slate-200">
                  <option value="KGM">KGs</option>
                  <option value="TNE">Ton</option>
                </select>
              </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Nro de Bultos</label>
               <input type="number" value={numeroBultos} onChange={e => setNumeroBultos(e.target.value)} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" min="1" />
            </div>
          </div>
        </div>

        {/* BLOQUE 2: Sujetos Intervinientes */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl">
          <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-500 uppercase tracking-widest mb-4">2. Sujetos (Quién entrega y Quién recibe)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-950">
               <label className="block text-xs font-black uppercase tracking-widest text-indigo-800 dark:text-indigo-400 mb-2">REMITENTE (Quien te contrata)</label>
               <div className="flex gap-2 mb-2">
                 <input type="text" value={remitenteDoc} onChange={e => setRemitenteDoc(e.target.value)} onBlur={() => handleBuscarPersona(remitenteDoc, setRemitenteNombre)} className="w-1/3 p-2 text-sm border rounded-lg font-mono font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" placeholder="RUC" />
                 <input type="text" value={remitenteNombre} onChange={e => setRemitenteNombre(e.target.value)} className="w-2/3 p-2 text-sm border rounded-lg font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" placeholder="Razón Social" />
               </div>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-950">
               <label className="block text-xs font-black uppercase tracking-widest text-indigo-800 dark:text-indigo-400 mb-2">DESTINATARIO (Quien recibe)</label>
               <div className="flex gap-2 mb-2">
                 <input type="text" value={destinatarioDoc} onChange={e => setDestinatarioDoc(e.target.value)} onBlur={() => handleBuscarPersona(destinatarioDoc, setDestinatarioNombre)} className="w-1/3 p-2 text-sm border rounded-lg font-mono font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" placeholder="RUC/DNI" />
                 <input type="text" value={destinatarioNombre} onChange={e => setDestinatarioNombre(e.target.value)} className="w-2/3 p-2 text-sm border rounded-lg font-bold dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200" placeholder="Razón Social / Nombre" />
               </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: Direcciones, Vehículo y Referencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl">
             <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-500 uppercase tracking-widest mb-4">3. Direcciones</h3>
             
             <div className="mb-4">
               <label className="block text-xs font-bold text-indigo-800 dark:text-indigo-400 mb-1">ORIGEN (Punto de Partida)</label>
               <div className="flex gap-2 mb-2">
                 <input type="text" value={ubigeoPartida} onChange={e => setUbigeoPartida(e.target.value)} className="w-1/3 p-2 text-sm border rounded-lg font-mono placeholder:text-gray-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Ubigeo (6 dig)" maxLength={6} />
                 <input type="text" value={direccionPartida} onChange={e => setDireccionPartida(e.target.value)} className="w-2/3 p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Dirección completa exacta" />
               </div>
             </div>

             <div>
               <label className="block text-xs font-bold text-indigo-800 dark:text-indigo-400 mb-1">DESTINO (Punto de Llegada)</label>
               <div className="flex gap-2">
                 <input type="text" value={ubigeoLlegada} onChange={e => setUbigeoLlegada(e.target.value)} className="w-1/3 p-2 text-sm border rounded-lg font-mono placeholder:text-gray-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Ubigeo (6 dig)" maxLength={6}/>
                 <input type="text" value={direccionLlegada} onChange={e => setDireccionLlegada(e.target.value)} className="w-2/3 p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Dirección completa exacta" />
               </div>
             </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-start">
             <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-500 uppercase tracking-widest mb-4">4. Vehículo y Referencia</h3>
             
             {/* Doc Referencia */}
             <div className="mb-4 pb-4 border-b border-gray-200 dark:border-slate-800">
               <label className="block text-xs font-bold text-indigo-800 dark:text-indigo-400 mb-1">Guía Remitente de Referencia (Opcional)</label>
               <div className="flex gap-2">
                 <input type="text" value={docRefSerie} onChange={e => setDocRefSerie(e.target.value.toUpperCase())} className="w-1/3 p-2 text-sm border rounded-lg font-mono font-bold dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Serie Ej. T001" maxLength={4} />
                 <input type="text" value={docRefCorrelativo} onChange={e => setDocRefCorrelativo(e.target.value)} className="w-2/3 p-2 text-sm border rounded-lg font-mono dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Correlativo Ej. 1290" />
               </div>
             </div>

             <div className="flex gap-2 mb-2">
               <div className="w-1/2">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Placa Vehículo</label>
                 <input type="text" value={vehiculoPlaca} onChange={e => setVehiculoPlaca(e.target.value.toUpperCase())} className="w-full p-2 text-sm border rounded-lg font-mono font-bold dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="ABC-123" />
               </div>
               <div className="w-1/2">
                 <label className="block text-xs font-bold text-gray-500 mb-1">DNI Conductor</label>
                 <input type="text" value={conductorDoc} onChange={e => setConductorDoc(e.target.value)} className="w-full p-2 text-sm border rounded-lg font-mono dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Nro Doc." />
               </div>
             </div>
             <div className="flex gap-2">
               <input type="text" value={conductorNombre} onChange={e => setConductorNombre(e.target.value)} className="w-1/2 p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Nombres del Chofer" />
               <input type="text" value={conductorLicencia} onChange={e => setConductorLicencia(e.target.value.toUpperCase())} className="w-1/2 p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Nro Licencia Brevete" />
             </div>
          </div>
        </div>

        {/* BLOQUE 4: Tabla Bienes a Trasladar */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl">
             <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-500 uppercase tracking-widest mb-4">5. Bienes a trasladar</h3>
             
             <div className="overflow-x-auto rounded-xl border border-indigo-700 dark:border-slate-800 shadow-sm">
                <table className="min-w-full divide-y divide-indigo-700 dark:divide-slate-800">
                  <thead className="bg-indigo-700 dark:bg-slate-900 text-white">
                    <tr>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Cant.</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">U.M.</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Descripción del Bien</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Cód</th>
                      <th className="px-4 py-2 text-center text-sm font-semibold">Accición</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-950">
                    {items.length === 0 && !showItemForm && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-gray-400 text-sm">
                          Sin ítems — añade los bienes amparados por la carga.
                        </td>
                      </tr>
                    )}
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50 dark:hover:bg-slate-900 transition-colors">
                        <td className="text-center px-4 py-2 text-sm dark:text-slate-200 font-bold">{item.cantidad}</td>
                        <td className="px-4 py-2 text-sm dark:text-slate-300 italic">{item.unidad_id}</td>
                        <td className="px-4 py-2 text-sm dark:text-slate-200 font-medium">{item.descripcion}</td>
                        <td className="text-center px-4 py-2 text-sm dark:text-slate-400 font-mono text-xs">{item.codigo || '-'}</td>
                        <td className="flex justify-center p-2">
                          <button onClick={() => { if (window.confirm("¿Quitar bien?")) setItems(p => p.filter((_, i) => i !== idx)) }}
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded text-xs transition-colors">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {showItemForm && (
                      <ItemFormGuia onAgregar={addItem} onCancelar={() => setShowItemForm(false)} />
                    )}
                  </tbody>
                </table>
             </div>

             {!showItemForm && (
                <button onClick={() => setShowItemForm(true)}
                  className="mt-3 flex items-center gap-2 text-indigo-700 dark:text-indigo-500 border-2 border-dashed border-indigo-700 dark:border-slate-800 rounded-xl p-3 hover:bg-indigo-50 dark:hover:bg-slate-900 w-full justify-center text-sm font-black uppercase tracking-widest transition-all">
                  <FaPlus /> Agregar Bien al Traslado
                </button>
             )}
        </div>

        {/* Alerta SUNAT */}
        {resultado && (
          <div className={`rounded-xl p-5 text-sm my-2 shadow-lg border-2 animate-jump-in ${resultado.success ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/50" : "bg-rose-50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/50"}`}>
            <div className={`font-black uppercase tracking-widest mb-2 flex items-center gap-2 ${resultado.success ? "text-emerald-800 dark:text-emerald-400" : "text-rose-800 dark:text-rose-400"}`}>
              {resultado.success ? "✓ Guía Aceptada" : "✗ Guía Rechazada"}
            </div>
            <div className="text-gray-600 dark:text-slate-400 font-medium">SUNAT: <span className="font-bold">{resultado.codigo_sunat}</span> — {resultado.mensaje_sunat}</div>
          </div>
        )}

        <div className="flex justify-center md:justify-end mt-4 mb-10">
          <button onClick={handleEmitirGuia} disabled={emitiendo || items.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-4 w-full md:w-1/4 text-white cursor-pointer font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 flex justify-center gap-3">
            <FaTruckFast className="text-xl" />
            {emitiendo ? "Enviando..." : "Emitir Guía"}
          </button>
        </div>

      </div>
    </div>
  );
}

// Subcomponente de Item
function ItemFormGuia({ onAgregar, onCancelar }) {
  const [desc, setDesc] = useState("");
  const [unidadId, setUnidadId] = useState("NIU");
  const [cantidad, setCantidad] = useState("1");
  const [codigo, setCodigo] = useState("");

  const handleOK = () => {
    if(!desc.trim()) return toast.error("La descripción es obligatoria");
    onAgregar({
      cantidad: parseFloat(cantidad) || 1,
      unidad_id: unidadId,
      descripcion: desc.trim(),
      codigo: codigo.trim()
    });
  };

  return (
    <tr className="bg-indigo-50/50 dark:bg-slate-900/50">
      <td className="px-2 py-2">
        <input type="number" min="0.1" step="0.1" value={cantidad} onChange={e => setCantidad(e.target.value)} className="w-16 bg-white dark:bg-slate-950 border border-indigo-300 dark:border-slate-800 text-center rounded p-1.5 text-sm dark:text-slate-200" />
      </td>
      <td className="px-2 py-2">
        <select value={unidadId} onChange={e => setUnidadId(e.target.value)} className="w-20 bg-white dark:bg-slate-950 border border-indigo-300 dark:border-slate-800 rounded p-1.5 text-sm dark:text-slate-200">
          <option value="NIU">Unidad (NIU)</option>
          <option value="KGM">Kilos (KGM)</option>
          <option value="MTR">Metros (MTR)</option>
          <option value="BX">Cajas (BX)</option>
        </select>
      </td>
      <td className="px-2 py-2">
        <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Tubos PVC..." className="w-full bg-white dark:bg-slate-950 border border-indigo-300 dark:border-slate-800 rounded p-1.5 text-sm dark:text-slate-200" />
      </td>
      <td className="px-2 py-2">
        <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Opcional" className="w-20 bg-white dark:bg-slate-950 border border-indigo-300 dark:border-slate-800 rounded p-1.5 text-sm font-mono dark:text-slate-200 text-center" />
      </td>
      <td className="px-2 py-2 flex justify-center gap-1">
        <button onClick={handleOK} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">✓</button>
        <button onClick={onCancelar} className="bg-gray-300 dark:bg-slate-800 hover:bg-gray-400 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded text-xs transition-colors">✕</button>
      </td>
    </tr>
  );
}

export default GuiaTransportista;
