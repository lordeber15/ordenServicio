import Drawer from "../components/drawer";
import { FaPlus } from "react-icons/fa6";
import TablaProductos from "../components/tablaProductos";

function Inventario() {
  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center px-12 py-4">
        <Drawer />
        <div className="text-2xl font-bold">Inventario</div>
        <button className="flex items-center gap-2 p-2 shadow-xs hover:text-white hover:bg-sky-700 rounded-md transition ease-in duration-300">
          <FaPlus />
          Agregar Item
        </button>
      </div>
      <div>
        <TablaProductos />
      </div>
    </div>
  );
}

export default Inventario;
