import Drawer from "../drawer";
import Tablaingresosyegresos from "../tablaingresosegresos";
import { useQuery } from "@tanstack/react-query";
import { getIngresos } from "../../services/ingresosrequest";
import { getEgresos } from "../../services/egresosrequest";
import { getVentasDia } from "../../services/caja";
import { useState, useMemo } from "react";

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const { data: dataEgresos } = useQuery({
    queryKey: ["egresos"],
    queryFn: getEgresos,
  });

  const { data: ventasData } = useQuery({
    queryKey: ["ventasDia", selectedDate],
    queryFn: () => getVentasDia(selectedDate),
  });

  const totalesVentas = ventasData?.totales || { tickets: 0, boletas: 0, facturas: 0, general: 0 };

  const filteredIngresos = dataIngresos?.filter(
    (item) => formatDate(item.fecha) === selectedDate
  );
  const filteredEgresos = dataEgresos?.filter(
    (item) => formatDate(item.fecha) === selectedDate
  );

  const totalIngresos = useMemo(
    () => (filteredIngresos || []).reduce((s, i) => s + parseFloat(i.monto || 0), 0),
    [filteredIngresos]
  );
  const totalEgresos = useMemo(
    () => (filteredEgresos || []).reduce((s, i) => s + parseFloat(i.monto || 0), 0),
    [filteredEgresos]
  );
  const saldoDia = totalesVentas.general + totalIngresos - totalEgresos;

  return (
    <div>
      <div className="flex px-4 md:px-10 py-4 justify-between items-center">
        <div>
          <Drawer />
        </div>
        <div className="text-lg md:text-2xl font-bold text-sky-800 dark:text-sky-400">
          Ingresos y Egresos
        </div>
        <div>
          <input
            type="date"
            className="p-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:border-sky-500"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* ── Resumen de ventas del día ── */}
      <div className="px-4 md:px-10 mb-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-sky-700 dark:text-sky-400 mb-3 uppercase tracking-wider">
            Ventas del Dia
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-sky-50 dark:bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Tickets</div>
              <div className="text-lg font-bold font-mono text-sky-800 dark:text-sky-300">
                S/ {totalesVentas.tickets.toFixed(2)}
              </div>
            </div>
            <div className="bg-sky-50 dark:bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Boletas</div>
              <div className="text-lg font-bold font-mono text-sky-800 dark:text-sky-300">
                S/ {totalesVentas.boletas.toFixed(2)}
              </div>
            </div>
            <div className="bg-sky-50 dark:bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Facturas</div>
              <div className="text-lg font-bold font-mono text-sky-800 dark:text-sky-300">
                S/ {totalesVentas.facturas.toFixed(2)}
              </div>
            </div>
            <div className="bg-sky-700 dark:bg-sky-900 rounded-lg p-3 text-center">
              <div className="text-xs text-sky-200 mb-1">Total Ventas</div>
              <div className="text-lg font-bold font-mono text-white">
                S/ {totalesVentas.general.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tablas de ingresos y egresos manuales ── */}
      <div className="flex gap-4 px-4 md:px-10 flex-col md:flex-row">
        <div className="w-full md:w-1/2">
          <span className="flex font-bold text-2xl text-sky-800 dark:text-sky-400 justify-center pb-2">
            Ingresos
          </span>
          <Tablaingresosyegresos
            titulo={"Ingreso"}
            ingresosyegresos={filteredIngresos}
          />
        </div>
        <div className="w-full md:w-1/2">
          <span className="flex font-bold text-2xl text-sky-800 dark:text-sky-400 justify-center pb-2">
            Egresos
          </span>
          <Tablaingresosyegresos
            titulo={"Egreso"}
            ingresosyegresos={filteredEgresos}
          />
        </div>
      </div>

      {/* ── Balance del día ── */}
      <div className="px-4 md:px-10 mt-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-slate-800 p-4">
          <h3 className="text-sm font-semibold text-sky-700 dark:text-sky-400 mb-3 uppercase tracking-wider">
            Balance del Dia
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-sm">
            <div className="text-center px-3">
              <div className="text-xs text-gray-500 dark:text-slate-400">Ventas</div>
              <div className="font-bold font-mono text-sky-800 dark:text-sky-300">S/ {totalesVentas.general.toFixed(2)}</div>
            </div>
            <span className="text-gray-400 font-bold text-lg">+</span>
            <div className="text-center px-3">
              <div className="text-xs text-gray-500 dark:text-slate-400">Ingresos</div>
              <div className="font-bold font-mono text-green-600 dark:text-green-400">S/ {totalIngresos.toFixed(2)}</div>
            </div>
            <span className="text-gray-400 font-bold text-lg">-</span>
            <div className="text-center px-3">
              <div className="text-xs text-gray-500 dark:text-slate-400">Egresos</div>
              <div className="font-bold font-mono text-red-600 dark:text-red-400">S/ {totalEgresos.toFixed(2)}</div>
            </div>
            <span className="text-gray-400 font-bold text-lg">=</span>
            <div className={`text-center px-4 py-2 rounded-lg ${saldoDia >= 0 ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
              <div className="text-xs text-gray-500 dark:text-slate-400">Saldo</div>
              <div className={`text-xl font-bold font-mono ${saldoDia >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                S/ {saldoDia.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ingresos;
