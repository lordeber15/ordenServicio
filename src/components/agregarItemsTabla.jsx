import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import ModalEditaritem from "./modalEditaritem";

export default function AgregarItemsTabla({ setItems }) {
  const [openModalI, setOpenModalI] = useState(false);

  const handleOpenModal = () => setOpenModalI(true);
  const handleCloseModal = () => setOpenModalI(false);

  return (
    <div className="w-full flex flex-row items-center justify-center my-2">
      <button
        onClick={handleOpenModal}
        className="w-full md:w-1/3 flex justify-center items-center  cursor-pointer"
      >
        <div className="flex items-center gap-2 border border-dashed p-1 w-full justify-center border-gray-400 hover:border-sky-700 text-gray-400 hover:text-sky-700">
          <FaPlus />
          Agregar un item
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
