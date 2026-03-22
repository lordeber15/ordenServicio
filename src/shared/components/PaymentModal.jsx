import { useState, useEffect, useRef } from "react";
import { FaMoneyBillWave, FaCoins } from "react-icons/fa6";

/**
 * Modal de cobro con cálculo de vuelto.
 *
 * @param {boolean}  open         - Controla visibilidad del modal
 * @param {function} onClose      - Cierra el modal sin emitir
 * @param {function} onConfirm    - Confirma emisión
 * @param {number}   montoCobrar  - Monto que debe pagar el cliente
 * @param {string}   label        - Tipo de documento ("Ticket", "Boleta", "Factura")
 * @param {boolean}  loading      - Deshabilita el botón mientras se procesa
 */
export default function PaymentModal({ open, onClose, onConfirm, montoCobrar, label = "Ticket", loading = false }) {
  const [montoRecibido, setMontoRecibido] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [pasoActual, setPasoActual] = useState(1); // 1 = selección método, 2 = ingreso monto
  const inputRef = useRef(null);

  // Reset y autofocus al abrir
  useEffect(() => {
    if (open) {
      setMontoRecibido("");
      setMetodoPago("Efectivo");
      setPasoActual(1); // Reset al paso 1
    }
  }, [open]);

  if (!open) return null;

  const recibido = metodoPago === "Yape" ? montoCobrar : (parseFloat(montoRecibido) || 0);
  const vuelto = recibido - montoCobrar;
  const puedeConfirmar = pasoActual === 2 && recibido >= montoCobrar && montoCobrar > 0 && !loading;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && puedeConfirmar) {
      onConfirm(metodoPago);
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade animate-duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 w-full max-w-sm border dark:border-slate-800">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl mb-4 border border-emerald-200 dark:border-emerald-800/50">
            <FaMoneyBillWave className="text-emerald-600 dark:text-emerald-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
            Cobro
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">
            {label}
          </p>
        </div>

        {/* Monto a cobrar */}
        <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-5 mb-6 border dark:border-slate-800">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2 text-center">
            Monto a cobrar
          </div>
          <div className="text-center">
            <span className="text-3xl font-mono font-black text-sky-800 dark:text-sky-400">
              S/ {montoCobrar.toFixed(2)}
            </span>
          </div>
        </div>

        {/* PASO 1: Selección de Método de Pago */}
        {pasoActual === 1 && (
          <div className="mb-6 animate-fade animate-duration-300">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
              Selecciona el Método de Pago
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setMetodoPago("Efectivo");
                  setPasoActual(2);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
                className="flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-700"
              >
                Efectivo
              </button>
              <button
                onClick={() => {
                  setMetodoPago("Yape");
                  setMontoRecibido(montoCobrar.toFixed(2));
                  setPasoActual(2);
                }}
                className="flex-1 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 bg-slate-50 border-slate-200 text-slate-600 hover:bg-violet-50 hover:border-violet-300 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-violet-950/30 dark:hover:border-violet-700"
              >
                Yape
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Método Seleccionado y Monto */}
        {pasoActual === 2 && (
          <>
            {/* Mostrar método seleccionado */}
            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 mb-4 border dark:border-slate-800 animate-fade animate-duration-300">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1">
                Método seleccionado
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-lg font-black ${
                  metodoPago === "Efectivo"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-violet-600 dark:text-violet-400"
                }`}>
                  {metodoPago}
                </span>
                <button
                  onClick={() => setPasoActual(1)}
                  className="text-xs font-black text-sky-600 dark:text-sky-400 hover:underline uppercase tracking-widest"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </>
        )}

        {/* Input monto recibido - Solo en paso 2 */}
        {pasoActual === 2 && metodoPago === "Efectivo" && (
          <div className="mb-6 animate-fade animate-duration-300">
            <label htmlFor="payment-modal-recibido" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-2">
              Monto recibido
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 dark:text-slate-500 text-lg">S/</span>
              <input
                ref={inputRef}
                id="payment-modal-recibido"
                type="number"
                min="0"
                step="0.01"
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-2xl font-mono font-black text-slate-800 dark:text-slate-100 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                placeholder="0.00"
                value={montoRecibido}
                onChange={(e) => setMontoRecibido(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        )}

        {/* Confirmación de monto exacto para Yape - Solo en paso 2 */}
        {pasoActual === 2 && metodoPago === "Yape" && (
          <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4 mb-6 animate-fade animate-duration-300">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400 mb-1">
              Monto a recibir
            </div>
            <div className="font-mono text-2xl font-black text-violet-700 dark:text-violet-300">
              S/ {montoCobrar.toFixed(2)}
            </div>
            <p className="text-xs text-violet-600 dark:text-violet-400 mt-2">
              El cliente pagará el monto exacto por Yape
            </p>
          </div>
        )}

        {/* Vuelto / Faltante - Solo para Efectivo en paso 2 */}
        {pasoActual === 2 && metodoPago === "Efectivo" && montoRecibido !== "" && (
          <div
            className={`rounded-xl p-4 mb-6 flex justify-between items-center animate-jump-in ${
              vuelto >= 0
                ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
                : "bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <FaCoins className={`text-sm ${vuelto >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`} />
              <span className={`text-xs font-black uppercase tracking-widest ${
                vuelto >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-rose-700 dark:text-rose-400"
              }`}>
                {vuelto >= 0 ? "Vuelto" : "Falta"}
              </span>
            </div>
            <span className={`font-mono text-xl font-black ${
              vuelto >= 0
                ? "text-emerald-700 dark:text-emerald-300"
                : "text-rose-700 dark:text-rose-300"
            }`}>
              S/ {Math.abs(vuelto).toFixed(2)}
            </span>
          </div>
        )}

        {/* Botones */}
        <div className="space-y-3">
          {pasoActual === 2 && (
            <button
              onClick={() => onConfirm(metodoPago)}
              disabled={!puedeConfirmar}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100 animate-fade animate-duration-300"
            >
              {loading ? "Procesando..." : "Confirmar y Emitir"}
            </button>
          )}

          {pasoActual === 2 ? (
            <button
              onClick={() => setPasoActual(1)}
              disabled={loading}
              className="w-full py-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase text-[10px] font-black tracking-widest cursor-pointer disabled:opacity-50"
            >
              Volver
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors uppercase text-[10px] font-black tracking-widest cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
