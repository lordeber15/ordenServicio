import TablaAlmanaque from "./tablaAlmanaque";
import Drawer from "../drawer";
import { useQuery } from "@tanstack/react-query";
import { getAlmanaque } from "../../request/almanaques";
import { Link } from "react-router";
import { FaPlus } from "react-icons/fa";

function ListaAlmanaque() {
  const { data: dataAlmanaque } = useQuery({
    queryKey: ["almanaque"],
    queryFn: getAlmanaque,
  });

  return (
    <div className="w-screen">
      <div className="px-12 py-4 ">
        <div className="flex justify-between gap-5 items-center ">
          <Drawer />
          <div className="text-2xl font-bold">Lista de Almanaques</div>
          <Link
            to={"/almanaque/new"}
            className="flex items-center gap-2 bg-sky-700 font-bold text-white py-2 px-3 hover:bg-sky-800 rounded-lg "
          >
            <FaPlus />
            Nueva Nota
          </Link>
        </div>
        <div className="pt-6">
          <TablaAlmanaque data={dataAlmanaque} />
        </div>
      </div>
    </div>
  );
}

export default ListaAlmanaque;
