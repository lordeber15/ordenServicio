import CardsReports from "../components/Reports/cardsReports";
import { useQuery } from "@tanstack/react-query";
import { getIngresos } from "../request/ingresosrequest";
import { getEgresos } from "../request/egresosrequest";
/**
 * PÁGINA: REPORTES MENSUALES
 * 
 * Panel de visualización de estadísticas financieras. Utiliza React Query
 * para consumir los endpoints de ingresos y egresos de forma eficiente.
 */
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
    <div className="px-10 pt-8 flex flex-col gap-6 items-center max-w-7xl mx-auto">
      <div className="text-4xl w-full font-black text-sky-800 dark:text-slate-100 flex justify-center tracking-tight transition-colors">
        Reporte Mensual
      </div>
      <div className="flex w-full gap-6">
        {dataIngresos ? (
          <CardsReports titulo="Ingresos" data={dataIngresos} />
        ) : (
          <div className="flex-1 py-12 text-center text-gray-400 italic">Cargando ingresos...</div>
        )}
        {dataEgresos ? (
          <CardsReports titulo="Egresos" data={dataEgresos} />
        ) : (
          <div className="flex-1 py-12 text-center text-gray-400 italic">Cargando egresos...</div>
        )}
      </div>
    </div>
  );
}

export default Reportes;
