import { useState } from "react";
import { useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaPlus, FaTrash, FaFileCode, FaPrint, FaTruckFast } from "react-icons/fa6";
import Drawer from "../../../shared/components/drawer";
import DatosEmpresa from "../../../shared/components/datosEmpresa";
import { getEmisores } from "../services/emisores";
import { getSeriesByTipo } from "../services/series";
import { findClienteByDoc, createCliente } from "../../../shared/services/clientes";
import axiosURL from "../../../core/api/axiosURL";
import { getGuiaPdf } from "../services/comprobantes";

const HOY = new Date().toLocaleDateString('en-CA');

/**
 * PÁGINA: GUÍA DE REMISIÓN
 * Formulario completo para emitir Guías de Remisión (Remitente y Transportista)
 */
function GuiaRemision() {
  const { state } = useLocation();
  const facturaData = state?.facturaData || null;

  // Querys básicos
  const { data: emisores = [] } = useQuery({ queryKey: ["emisores"], queryFn: getEmisores });
  const { data: series = [] } = useQuery({ queryKey: ["series", "09"], queryFn: () => getSeriesByTipo("09") });

  const emisor = emisores[0] || null;
  const serie = series[0] || null;

  // Estados del Formulario
  const [tipoGuia] = useState("09"); // 09: Remitente, 31: Transportista
  const [fechaEmision, setFechaEmision] = useState(HOY);
  const [fechaTraslado, setFechaTraslado] = useState(HOY);
  
  // Cliente Destinatario
  const [clienteDoc, setClienteDoc] = useState(facturaData?.clienteRuc || "");
  const [clienteNombre, setClienteNombre] = useState(facturaData?.clienteNombre || "");

  // Motivo de Traslado
  const [motivoId, setMotivoId] = useState("01"); // 01: Venta
  const [descripcionMotivo, setDescripcionMotivo] = useState("");
  
  // Pesos y Bultos
  const [pesoTotal, setPesoTotal] = useState("1.000");
  const [unidadPeso, setUnidadPeso] = useState("KGM");
  const [numeroBultos, setNumeroBultos] = useState(1);

  // Puntos de Partida / Llegada
  const [ubigeoPartida, setUbigeoPartida] = useState("");
  const [direccionPartida, setDireccionPartida] = useState("");
  const [ubigeoLlegada, setUbigeoLlegada] = useState("");
  const [direccionLlegada, setDireccionLlegada] = useState(facturaData?.direccion || "");

  // Modalidad Traslado
  const [modalidadTraslado, setModalidadTraslado] = useState("01"); // 01: Público, 02: Privado
  
  // Transp. Público (01)
  const [transpRuc, setTranspRuc] = useState("");
  const [transpNombre, setTranspNombre] = useState("");

  // Transp. Privado (02)
  const [vehiculoPlaca, setVehiculoPlaca] = useState("");
  const [conductorDoc, setConductorDoc] = useState("");
  const [conductorNombre, setConductorNombre] = useState("");
  const [conductorLicencia, setConductorLicencia] = useState("");

  // Detalle (Ítems)
  const [items, setItems] = useState(() => {
    if (facturaData && facturaData.items) {
      return facturaData.items.map(it => ({
        cantidad: it.cantidad,
        unidad_id: it.unidad_id,
        descripcion: it.descripcion,
        codigo: "",
      }));
    }
    return [];
  });
  const [showItemForm, setShowItemForm] = useState(false);

  // Estado de Emisión
  const [emitiendo, setEmitiendo] = useState(false);
  const [resultado, setResultado] = useState(null);

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

  const handlePrintGuia = async (id) => {
    try {
      const res = await getGuiaPdf(id);
      printPdfBlob(res.data);
    } catch {
      toast.error("Error al generar PDF de la guía");
    }
  };

  const handleBuscarDestinatario = async () => {
    if (!clienteDoc.trim()) return toast.error("Ingresa el RUC/DNI");
    try {
      const cliente = await findClienteByDoc(clienteDoc.trim());
      if (cliente) {
        setClienteNombre(cliente.razon_social);
        toast.success("Destinatario encontrado");
        // Autocompletar dirección de llegada si no hay
        if (cliente.direccion && !direccionLlegada) {
          setDireccionLlegada(cliente.direccion);
        }
      } else {
        toast("No encontrado. Ingresa Razón Social manualmente.");
      }
    } catch {
      toast.error("Error al buscar");
    }
  };

  const handleEmitirGuia = async () => {
    if (!emisor) return toast.error("No hay emisor");
    if (!serie) return toast.error("No hay serie 09/31 configurada");
    if (!clienteDoc || !clienteNombre) return toast.error("Faltan datos del destinatario");
    if (!ubigeoPartida || !direccionPartida) return toast.error("Requiere Ubigeo y Dirección de partida");
    if (!ubigeoLlegada || !direccionLlegada) return toast.error("Requiere Ubigeo y Dirección de llegada");
    if (items.length === 0) return toast.error("Agrega al menos un ítem a la guía");
    if (modalidadTraslado === "01" && (!transpRuc || !transpNombre)) {
      return toast.error("Modalidad Pública requiere RUC y Nombre del Transportista");
    }
    if (modalidadTraslado === "02" && (!vehiculoPlaca || !conductorDoc)) {
      return toast.error("Modalidad Privada requiere Placa y Doc. Conductor");
    }

    setEmitiendo(true);
    setResultado(null);

    try {
      // 1. Verificar/Crear Cliente
      let cliente = await findClienteByDoc(clienteDoc.trim());
      if (!cliente) {
        const res = await createCliente({
          tipo_documento_id: clienteDoc.length === 11 ? "6" : "1",
          nrodoc: clienteDoc.trim(),
          razon_social: clienteNombre.trim()
        });
        cliente = res.data;
      }
      
      // 2. Aquí tocaría crear la Guía en la base de datos (Backend CRUD de Guías)
      // Como esto es un desarrollo nuevo en frontend, adaptamos la llamada.
      // Primero creamos la cabecera /guia
      const cabGuia = await axiosURL.post("/guia", {
        emisor_id: emisor.id,
        tipo_guia: tipoGuia,
        serie_id: serie.id,
        serie: serie.serie,
        correlativo: serie.correlativo,
        fecha_emision: fechaEmision,
        fecha_traslado: fechaTraslado,
        destinatario_id: cliente.id,
        motivo_traslado_id: motivoId,
        descripcion_motivo: descripcionMotivo || "Venta",
        peso_bruto_total: pesoTotal,
        unidad_peso_id: unidadPeso,
        numero_bultos: numeroBultos,
        modalidad_traslado: modalidadTraslado,
        // Domicilios
        ubigeo_partida: ubigeoPartida,
        direccion_partida: direccionPartida,
        ubigeo_llegada: ubigeoLlegada,
        direccion_llegada: direccionLlegada,
        // Publico
        transportista_ruc: modalidadTraslado === "01" ? transpRuc : null,
        transportista_razon_social: modalidadTraslado === "01" ? transpNombre : null,
        // Privado
        vehiculo_placa: modalidadTraslado === "02" ? vehiculoPlaca : null,
        conductor_tipo_doc: modalidadTraslado === "02" ? "1" : null,
        conductor_nrodoc: modalidadTraslado === "02" ? conductorDoc : null,
        conductor_nombres: modalidadTraslado === "02" ? conductorNombre : null,
        conductor_licencia: modalidadTraslado === "02" ? conductorLicencia : null,
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
          loading: "Enviando Guía a SUNAT...",
          success: "Guía enviada a SUNAT",
          error: (e) => `Error SUNAT: ${e?.response?.data?.message || e.message}`
        }
      );

      setResultado(emitRes.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error general al emitir guía");
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
        <div className="text-xl md:text-3xl font-black text-emerald-700 dark:text-emerald-500 transition-colors tracking-tight">
          Emitir Guía de Remisión
        </div>
        {facturaData && (
          <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/50 shadow-sm transition-colors">
            Autocompletado desde Factura ✓
          </span>
        )}
      </div>

      <div className="flex justify-center items-center w-full p-2 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-6">
          <DatosEmpresa />
          <div className="p-6 flex justify-center items-center flex-col border-2 border-dashed border-gray-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 transition-colors shadow-sm">
            <div className="text-xl font-black text-gray-800 dark:text-slate-100">{emisor ? `RUC: ${emisor.ruc}` : "Cargando emisor..."}</div>
            <div className="font-black text-2xl text-center text-emerald-700 dark:text-emerald-500 uppercase tracking-tighter mt-1">
              Guía de Remisión {tipoGuia === '31' ? 'Transportista' : 'Remitente'}
            </div>
            <div className="flex px-4 py-2 bg-slate-100 dark:bg-slate-950 rounded-lg items-center mt-3 border dark:border-slate-800">
              {serie
                ? <span className="text-emerald-700 dark:text-emerald-500 font-mono font-bold tracking-widest">{serie.serie} — {String(serie.correlativo).padStart(8, "0")}</span>
                : <span className="text-red-500 text-sm font-bold">Sin serie "T001" configurada</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 mt-6">
        {/* BLOQUE 1: Fechas y Motivo */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl">
          <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest mb-4">1. Datos del Traslado</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Motivo</label>
               <select value={motivoId} onChange={e => setMotivoId(e.target.value)} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200">
                 <option value="01">Venta</option>
                 <option value="02">Compra</option>
                 <option value="04">Traslado entre est. de la misma empresa</option>
                 <option value="08">Importación</option>
                 <option value="09">Exportación</option>
                 <option value="13">Otros</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Descripción (Si es Otros)</label>
               <input type="text" value={descripcionMotivo} onChange={e => setDescripcionMotivo(e.target.value)} disabled={motivoId !== '13'} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Especifique..." />
            </div>
            <div className="flex gap-2">
               <div className="flex-1">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Emisión</label>
                 <input type="date" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 font-bold" />
               </div>
               <div className="flex-1">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Traslado</label>
                 <input type="date" value={fechaTraslado} onChange={e => setFechaTraslado(e.target.value)} className="w-full p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 font-bold" />
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
            <div>
               <label className="block text-xs font-bold text-gray-500 mb-1">Destinatario (RUC/DNI)</label>
               <div className="flex gap-2">
                 <input type="text" value={clienteDoc} onChange={e => setClienteDoc(e.target.value)} onBlur={handleBuscarDestinatario} className="w-1/3 p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 font-mono font-bold dark:text-slate-200" placeholder="Documento" />
                 <input type="text" value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} className="w-2/3 p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 font-bold dark:text-slate-200" placeholder="Razón Social / Nombre" />
               </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: Modalidad y Puntos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl">
             <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest mb-4">2. Direcciones</h3>
             
             <div className="mb-4">
               <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1">PUNTO DE PARTIDA</label>
               <div className="flex gap-2 mb-2">
                 <input type="text" value={ubigeoPartida} onChange={e => setUbigeoPartida(e.target.value)} className="w-1/3 p-2 text-sm border rounded-lg font-mono placeholder:text-gray-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Ubigeo (6 dig)" maxLength={6} />
                 <input type="text" value={direccionPartida} onChange={e => setDireccionPartida(e.target.value)} className="w-2/3 p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Dirección completa exacta" />
               </div>
             </div>

             <div>
               <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1">PUNTO DE LLEGADA</label>
               <div className="flex gap-2">
                 <input type="text" value={ubigeoLlegada} onChange={e => setUbigeoLlegada(e.target.value)} className="w-1/3 p-2 text-sm border rounded-lg font-mono placeholder:text-gray-400 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Ubigeo (6 dig)" maxLength={6}/>
                 <input type="text" value={direccionLlegada} onChange={e => setDireccionLlegada(e.target.value)} className="w-2/3 p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Dirección completa exacta" />
               </div>
             </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl flex flex-col justify-between">
             <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest mb-4">3. Transporte</h3>
             
             <div className="mb-4">
               <label className="block text-xs font-bold text-gray-500 mb-1">Modalidad de Traslado</label>
               <select value={modalidadTraslado} onChange={e => setModalidadTraslado(e.target.value)} className="w-full p-2 text-sm border rounded-lg font-bold dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200">
                 <option value="01">01 - Transporte Público (Terceros)</option>
                 <option value="02">02 - Transporte Privado (Propio)</option>
               </select>
             </div>

             {modalidadTraslado === '01' ? (
               <div className="animate-fade animate-duration-300">
                 <label className="block text-xs font-bold text-gray-500 mb-1">Datos Empresa Transportista</label>
                 <div className="flex gap-2 mb-2">
                   <input type="text" value={transpRuc} onChange={e => setTranspRuc(e.target.value)} className="w-1/3 p-2 text-sm border rounded-lg font-mono dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="RUC Transporte" />
                   <input type="text" value={transpNombre} onChange={e => setTranspNombre(e.target.value)} className="w-2/3 p-2 text-sm border rounded-lg dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200" placeholder="Razón Social" />
                 </div>
               </div>
             ) : (
               <div className="animate-fade animate-duration-300">
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
             )}
          </div>
        </div>

        {/* BLOQUE 3: Tabla Bienes a Trasladar */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-xl">
             <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest mb-4">4. Bienes a trasladar</h3>
             
             <div className="overflow-x-auto rounded-xl border border-emerald-700 dark:border-slate-800 shadow-sm">
                <table className="min-w-full divide-y divide-emerald-700 dark:divide-slate-800">
                  <thead className="bg-emerald-700 dark:bg-slate-900 text-white">
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
                          Sin ítems — añade los bienes que se van a trasladar.
                        </td>
                      </tr>
                    )}
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50 dark:hover:bg-slate-900 transition-colors">
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
                  className="mt-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-500 border-2 border-dashed border-emerald-700 dark:border-slate-800 rounded-xl p-3 hover:bg-emerald-50 dark:hover:bg-slate-900 w-full justify-center text-sm font-black uppercase tracking-widest transition-all">
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
            {resultado.success && (
              <div className="flex gap-3 mt-4 flex-wrap">
                <button onClick={() => handlePrintGuia(resultado.guia_id)}
                  className="flex items-center gap-2 bg-sky-700 hover:bg-sky-600 text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-md cursor-pointer">
                  <FaPrint className="text-base" /> Imprimir A5
                </button>
                <a href={`${import.meta.env.VITE_API_URL || "http://localhost:3000/"}guia/${resultado.guia_id}/xml`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-md">
                  <FaFileCode className="text-base" /> XML
                </a>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center md:justify-end mt-4 mb-10">
          <button onClick={handleEmitirGuia} disabled={emitiendo || items.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-4 w-full md:w-1/4 text-white cursor-pointer font-black uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100 flex justify-center gap-3">
            <FaTruckFast className="text-xl" />
            {emitiendo ? "Enviando..." : "Emitir Guía"}
          </button>
        </div>

      </div>
    </div>
  );
}

// Subcomponente de Item adaptado sin importes
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
    <tr className="bg-emerald-50/50 dark:bg-slate-900/50">
      <td className="px-2 py-2">
        <input type="number" min="0.1" step="0.1" value={cantidad} onChange={e => setCantidad(e.target.value)} className="w-16 bg-white dark:bg-slate-950 border border-emerald-300 dark:border-slate-800 text-center rounded p-1.5 text-sm dark:text-slate-200" />
      </td>
      <td className="px-2 py-2">
        <select value={unidadId} onChange={e => setUnidadId(e.target.value)} className="w-20 bg-white dark:bg-slate-950 border border-emerald-300 dark:border-slate-800 rounded p-1.5 text-sm dark:text-slate-200">
          <option value="NIU">Unidad (NIU)</option>
          <option value="KGM">Kilos (KGM)</option>
          <option value="MTR">Metros (MTR)</option>
          <option value="BX">Cajas (BX)</option>
        </select>
      </td>
      <td className="px-2 py-2">
        <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Tubos PVC..." className="w-full bg-white dark:bg-slate-950 border border-emerald-300 dark:border-slate-800 rounded p-1.5 text-sm dark:text-slate-200" />
      </td>
      <td className="px-2 py-2">
        <input type="text" value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Opcional" className="w-20 bg-white dark:bg-slate-950 border border-emerald-300 dark:border-slate-800 rounded p-1.5 text-sm font-mono dark:text-slate-200 text-center" />
      </td>
      <td className="px-2 py-2 flex justify-center gap-1">
        <button onClick={handleOK} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">✓</button>
        <button onClick={onCancelar} className="bg-gray-300 dark:bg-slate-800 hover:bg-gray-400 text-gray-700 dark:text-slate-300 px-3 py-1.5 rounded text-xs transition-colors">✕</button>
      </td>
    </tr>
  );
}

export default GuiaRemision;
