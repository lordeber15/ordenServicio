import Drawer from "../../components/drawer";
import { FaPlus } from "react-icons/fa6";

function boleta() {
  return (
    <div>
      <div className="flex justify-between items-center px-12 py-4">
        <Drawer />
        <div className="text-2xl font-bold">Boleta</div>
        <button className="flex items-center gap-2 p-2 shadow-xs hover:text-white hover:bg-sky-700 rounded-md transition ease-in duration-300">
          <FaPlus />
          Agregar Item
        </button>
      </div>
    </div>
  );
}

export default boleta;
