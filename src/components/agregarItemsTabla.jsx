import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import ModalEditaritem from "./modalEditaritem";

export default function AgregarItemsTabla({ setItems }) {
  const [openModalI, setOpenModalI] = useState(false);

  const handleOpenModal = () => setOpenModalI(true);
  const handleCloseModal = () => setOpenModalI(false);

  return (
    <div className="w-full flex flex-row items-center justify-center my-4">
      <button
        onClick={handleOpenModal}
        className="w-full md:w-1/2 flex justify-center items-center cursor-pointer group transition-all"
      >
        <div className="flex items-center gap-3 w-full justify-center px-6 py-3 bg-white dark:bg-slate-900 border-2 border-dashed border-sky-300 dark:border-slate-800 rounded-xl group-hover:border-sky-600 dark:group-hover:border-slate-500 text-sky-700 dark:text-slate-400 group-hover:text-sky-800 dark:group-hover:text-slate-200 transition-all shadow-sm">
          <FaPlus className="text-sm" />
          <span className="font-black uppercase tracking-widest text-xs">Agregar otro ítem</span>
        </div>
      </button>
      <ModalEditaritem
        isOpen={openModalI}
        onClose={handleCloseModal}
        setItems={setItems}
      />
    </div>
  );
}
