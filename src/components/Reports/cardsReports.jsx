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
    <div className="rounded-lg mx-2 w-full px-8 py-2 shadow-[0px_0px_10px_-1px_rgba(0,_0,_0,_0.15)] bg-green-100 hover:scale-105 transition-all">
      <div>
        <div className="flex flex-col">
          <div
            className={`flex justify-end font-bold text-2xl ${
              esMayor ? "text-green-700" : "text-red-600"
            }`}
          >
            {titulo}
          </div>
          <div
            className={`flex justify-end text-lg  ${
              esMayor ? "text-green-700" : "text-red-600"
            }`}
          >
            {monthNames[month]}
          </div>
          <div
            className={`flex justify-end text-3xl font-bold ${
              esMayor ? "text-green-700" : "text-red-600"
            }`}
          >
            {sumaMesActual.toFixed(2)}
          </div>
          <div className="flex justify-end">
            {esMayor ? (
              <div className="flex w-full justify-between py-1">
                <FaCaretUp className="text-green-700 text-2xl flex justify-between" />
                <FaArrowTrendUp className="text-green-700 text-2xl" />
              </div>
            ) : (
              <div>
                <FaCaretDown className="text-red-600 text-2xl" />
                <FaArrowTrendDown className="text-red-600 text-2xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardsReports;
