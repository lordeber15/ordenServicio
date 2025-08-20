import CardsReports from "../components/Reports/cardsReports";
import { useQuery } from "@tanstack/react-query";
import { getIngresos } from "../request/ingresosrequest";
import { getEgresos } from "../request/egresosrequest";
function Reportes() {
  const { data: dataIngresos } = useQuery({
    queryKey: ["ingresos"],
    queryFn: getIngresos,
  });
  const { data: dataEgresos } = useQuery({
    queryKey: ["egresos"],
    queryFn: getEgresos,
  });

  return (
    <div className="px-10 pt-4 flex flex-row gap-2 flex-wrap">
      <div className="text-3xl w-full font-bold text-sky-700 flex justify-center">
        Reporte mensual
      </div>
      <div className="flex w-full pt-2">
        {dataIngresos ? (
          <CardsReports titulo="Ingresos" data={dataIngresos} />
        ) : (
          <p className="flex w-full pt-2 justify-center items-center">
            Cargando...
          </p>
        )}
        {dataEgresos ? (
          <CardsReports titulo="Egresos" data={dataEgresos} />
        ) : (
          <p className="flex w-full pt-2 justify-center items-center">
            Cargando...
          </p>
        )}
      </div>
    </div>
  );
}

export default Reportes;
