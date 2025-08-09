import Drawer from "../drawer";
import Tablaingresosyegresos from "../tablaingresosegresos";
import { useQuery } from "@tanstack/react-query";
import { getIngresos } from "../../request/ingresosrequest";
import { getEgresos } from "../../request/egresosrequest";
function Ingresos() {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const { data: dataIngresos } = useQuery({
    queryKey: ["servicios"],
    queryFn: getIngresos,
  });

  const { data: dataEgresos } = useQuery({
    queryKey: ["servicios"],
    queryFn: getEgresos,
  });

  return (
    <div>
      <div className="flex px-10 py-4 justify-between">
        <div>
          <Drawer />
        </div>
        <div className="text-2xl font-bold text-sky-800">
          Ingresos y Egresos
        </div>
        <div>
          <input type="date" className="p-2" defaultValue={getTodayDate()} />
        </div>
      </div>
      <div className="flex gap-4 px-10">
        <div className=" w-1/2">
          <span className="flex font-bold text-2xl text-sky-800 justify-center pb-2">
            Ingresos
          </span>
          <Tablaingresosyegresos ingresosyegresos={dataIngresos} />
        </div>
        <div className="w-1/2">
          <span className="flex font-bold text-2xl text-sky-800 justify-center pb-2">
            Egresos
          </span>
          <Tablaingresosyegresos ingresosyegresos={dataEgresos} />
        </div>
      </div>
      <div className="p-2 my-2 mx-10 flex justify-center bg-red-500 hover:bg-red-600 cursor-pointer rounded-lg text-white font-bold">
        Cerrar Caja
      </div>
    </div>
  );
}

export default Ingresos;
