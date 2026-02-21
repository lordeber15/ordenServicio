import { useState } from "react";
import { HiOutlineArchive } from "react-icons/hi";
import { FaPlus } from "react-icons/fa";
import ModalAgregaritem from "./modalAgregaritem";

export default function AgregarItemTabla({ setItems }) {
  const [openModalI, setOpenModalI] = useState(false);

  const handleOpenModal = () => setOpenModalI(true);
  const handleCloseModal = () => setOpenModalI(false);

  return (
    <div className="w-full flex flex-col items-center justify-center p-10 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
      <button
        onClick={handleOpenModal}
        className="w-full md:w-1/2 flex justify-center items-center flex-col cursor-pointer group transition-all"
      >
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm mb-4 border dark:border-slate-800 group-hover:scale-110 transition-transform">
          <HiOutlineArchive className="text-4xl text-sky-700 dark:text-slate-400" />
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-sky-300 dark:border-slate-800 group-hover:border-sky-600 dark:group-hover:border-slate-500 text-sky-700 dark:text-slate-400 group-hover:text-sky-800 dark:group-hover:text-slate-200 transition-all shadow-sm">
          <FaPlus className="text-sm" />
          <span className="font-black uppercase tracking-widest text-xs">Agregar un ítem al pedido</span>
        </div>
      </button>
      <ModalAgregaritem
        isOpen={openModalI}
        onClose={handleCloseModal}
        setItems={setItems}
      />
    </div>
  );
}
