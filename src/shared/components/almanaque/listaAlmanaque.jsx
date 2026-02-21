import TablaAlmanaque from "./tablaAlmanaque";
import Drawer from "../drawer";
import { useQuery } from "@tanstack/react-query";
import { getAlmanaque, deleteAlmanaque } from "../../../modules/Almanaque/services/almanaques";
import { Link } from "react-router";
import { FaPlus } from "react-icons/fa";

function ListaAlmanaque() {
  const { data: dataAlmanaque } = useQuery({
    queryKey: ["almanaque"],
    queryFn: getAlmanaque,
  });

  return (
    <div className="w-full">
      <div className="px-4 md:px-12 py-4">
        <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center mb-8">
          <div className="flex items-center gap-5">
            <Drawer />
            <h1 className="text-3xl font-black text-sky-800 dark:text-slate-100 tracking-tight transition-colors">Cotizaciones</h1>
          </div>
          <Link
            to={"/almanaque/new"}
            className="flex items-center gap-3 bg-sky-700 hover:bg-sky-600 dark:bg-slate-800 dark:hover:bg-slate-700 font-black text-white py-3 px-6 rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
          >
            <FaPlus className="text-sm" />
            Nueva Cotización
          </Link>
        </div>
        <div className="pt-2">
          <TablaAlmanaque data={dataAlmanaque} />
        </div>
      </div>
    </div>
  );
}

export default ListaAlmanaque;
