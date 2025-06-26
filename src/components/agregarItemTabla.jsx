import { HiOutlineArchive } from "react-icons/hi";
import { FaPlus } from "react-icons/fa6";
import ModalAgregaritem from "../components/modalAgregaritem";
import { useState } from "react";
function AgregarItemTabla() {
  const [openModalI, setOpenModalI] = useState(false);
  const handleOpenModal = () => setOpenModalI(true);
  const handleCloseModal = () => setOpenModalI(false);
  return (
    <div className="w-full flex flex-col items-center justify-center p-6">
      <button
        onClick={handleOpenModal}
        className="w-full md:w-1/3 flex justify-center items-center flex-col cursor-pointer"
      >
        <HiOutlineArchive className="w-fit h-10 text-gray-400" />
        <div className="flex items-center gap-2 border border-dashed p-1 w-full justify-center border-gray-400 hover:border-sky-700 text-gray-400 hover:text-sky-700">
          <FaPlus />
          Agregar un item
        </div>
      </button>
      <ModalAgregaritem isOpen={openModalI} onClose={handleCloseModal} />
    </div>
  );
}

export default AgregarItemTabla;
