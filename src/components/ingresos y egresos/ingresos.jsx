import Drawer from "../drawer";
import Tablaingresosyegresos from "../tablaingresosegresos";
import { useQuery } from "@tanstack/react-query";
import { getIngresos } from "../../request/ingresosrequest";
import { getEgresos } from "../../request/egresosrequest";
import { useState } from "react";

function Ingresos() {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const { data: dataIngresos } = useQuery({
    queryKey: ["ingresos"],
    queryFn: getIngresos,
  });

  const { data: dataEgresos } = useQuery({
    queryKey: ["egresos"],
    queryFn: getEgresos,
  });

  const filteredIngresos = dataIngresos?.filter(
    (item) => item.fecha?.slice(0, 10) === selectedDate
  );

  const filteredEgresos = dataEgresos?.filter(
    (item) => item.fecha?.slice(0, 10) === selectedDate
  );

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
          <input
            type="date"
            className="p-2"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-4 px-10 flex-col md:flex-row">
        <div className="w-full dm:w-1/2">
          <span className="flex font-bold text-2xl text-sky-800 justify-center pb-2">
            Ingresos
          </span>
          <Tablaingresosyegresos
            titulo={"Ingreso"}
            ingresosyegresos={filteredIngresos}
          />
        </div>
        <div className="w-full dm:w-1/2">
          <span className="flex font-bold text-2xl text-sky-800 justify-center pb-2">
            Egresos
          </span>
          <Tablaingresosyegresos
            titulo={"Egreso"}
            ingresosyegresos={filteredEgresos}
          />
        </div>
      </div>
      {/* <div className="p-2 my-2 mx-10 flex justify-center bg-red-500 hover:bg-red-600 cursor-pointer rounded-lg text-white font-bold">
        Cerrar Caja
      </div> */}
    </div>
  );
}

export default Ingresos;
