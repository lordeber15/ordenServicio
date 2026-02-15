import Drawer from "../../../shared/components/drawer";
import { FaPlus } from "react-icons/fa6";

/**
 * PÁGINA: NOTA DE CRÉDITO
 * 
 * Interfaz para la emisión de Notas de Crédito, permitiendo anular o corregir
 * facturas y boletas previamente emitidas.
 */
function notadecredito() {
  return (
    <div className="w-full bg-white dark:bg-slate-950 min-h-screen transition-colors">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-12 py-6 gap-6">
        <div className="flex items-center gap-5">
          <Drawer />
          <h1 className="text-3xl font-black text-sky-800 dark:text-slate-100 tracking-tight transition-colors">Nota de Crédito</h1>
        </div>
        <button className="flex items-center gap-3 bg-sky-700 hover:bg-sky-600 dark:bg-slate-800 dark:hover:bg-slate-700 font-black text-white py-3 px-6 rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest text-xs cursor-pointer">
          <FaPlus className="text-sm" />
          Nueva Nota
        </button>
      </div>
      <div className="px-4 md:px-12 py-20 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
        <div className="p-8 border-4 border-dashed border-slate-200 dark:border-slate-900 rounded-3xl mb-4">
          <FaPlus className="text-6xl" />
        </div>
        <p className="font-black uppercase tracking-[0.3em] text-[10px]">Módulo en Desarrollo</p>
      </div>
    </div>
  );
}

export default notadecredito;
