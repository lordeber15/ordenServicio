import { FaCaretUp } from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa";
import { FaArrowTrendDown } from "react-icons/fa6";
import { FaArrowTrendUp } from "react-icons/fa6";

function CardsReports({ data, titulo }) {
  const fecha = new Date();
  const month = fecha.getMonth();
  const mesAnterior = month - 1;

  // Total mes actual
  const sumaMesActual = data.reduce((acc, i) => {
    const fechaItem = new Date(i.fecha); // 👈 asegurar que tienes un campo fecha
    return fechaItem.getMonth() === month
      ? acc + parseFloat(i.monto || 0)
      : acc;
  }, 0);

  // Total mes anterior
  const sumaMesAnterior = data.reduce((acc, i) => {
    const fechaItem = new Date(i.fecha);
    return fechaItem.getMonth() === mesAnterior
      ? acc + parseFloat(i.monto || 0)
      : acc;
  }, 0);

  const esMayor = sumaMesActual > sumaMesAnterior;

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Nobiembre",
    "Diciembre",
  ];
  return (
    <div className={`rounded-xl mx-2 w-full px-8 py-6 shadow-lg transition-all hover:scale-[1.02] border ${
      esMayor 
        ? "bg-green-50 dark:bg-emerald-950/30 border-green-100 dark:border-emerald-800/50" 
        : "bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-800/50"
    }`}>
      <div>
        <div className="flex flex-col animate-fade animate-once animate-duration-300">
          <div
            className={`flex justify-end font-black text-2xl tracking-tight ${
              esMayor ? "text-green-700 dark:text-emerald-400" : "text-red-600 dark:text-rose-400"
            }`}
          >
            {titulo}
          </div>
          <div
            className={`flex justify-end text-sm font-bold uppercase tracking-widest opacity-70 ${
              esMayor ? "text-green-700 dark:text-emerald-400" : "text-red-600 dark:text-rose-400"
            }`}
          >
            {monthNames[month]}
          </div>
          <div
            className={`flex justify-end text-2xl md:text-4xl font-black mt-2 ${
              esMayor ? "text-green-800 dark:text-emerald-300" : "text-red-700 dark:text-rose-300"
            }`}
          >
            S/ {sumaMesActual.toFixed(2)}
          </div>
          <div className="flex justify-end">
            {esMayor ? (
              <div className="flex w-full justify-between items-center py-2">
                <FaCaretUp className="text-green-700 dark:text-emerald-400 text-3xl" />
                <FaArrowTrendUp className="text-green-700 dark:text-emerald-400 text-2xl" />
              </div>
            ) : (
              <div className="flex w-full justify-between items-center py-2">
                <FaCaretDown className="text-red-600 dark:text-rose-400 text-3xl" />
                <FaArrowTrendDown className="text-red-600 dark:text-rose-400 text-2xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardsReports;
