import Drawer from "../components/drawer";
import { FaPlus } from "react-icons/fa6";
import TablaProductos from "../components/tablaProductos";
import Search from "../components/search";
import { useState } from "react";
import ModalAgregaritem from "../components/modalAgregaritem";

function Inventario() {
  const dataTable = [
    {
      codigo: "P001",
      descripcion: "Producto A",
      unidad: "unidad",
      precio: 10.5,
    },
    {
      codigo: "P002",
      descripcion: "Producto B",
      unidad: "paquete",
      precio: 22.0,
    },
    {
      codigo: "P003",
      descripcion: "Producto C",
      unidad: "caja",
      precio: 18.75,
    },
  ];
  const [openModalI, setOpenModalI] = useState(false);
  const handleOpenModal = () => setOpenModalI(true);
  const handleCloseModal = () => setOpenModalI(false);
  return (
    <div className="h-full">
      <div className="flex justify-between items-center px-10 py-4">
        <Drawer />
        <div className="text-2xl font-bold">Inventario</div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 p-2 shadow-xs hover:text-white hover:bg-sky-700 rounded-md transition ease-in duration-300"
        >
          <FaPlus />
          Agregar Item
        </button>
      </div>
      <div className="px-8 w-full flex justify-end">
        <Search />
      </div>
      <div className="px-10">
        <TablaProductos data={dataTable} />
      </div>
      <ModalAgregaritem isOpen={openModalI} onClose={handleCloseModal} />
    </div>
  );
}

export default Inventario;
