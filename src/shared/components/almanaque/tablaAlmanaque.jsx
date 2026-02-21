import Modal from "react-modal";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
function TablaAlmanaque({ data }) {
  let navigate = useNavigate();
  function routeChange(id) {
    navigate(`/almanaque/${id}`);
  }
  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                N° Cotización
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Cliente
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Fecha Emisión
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-950 divide-y divide-gray-100 dark:divide-slate-900">
            {data?.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-sky-50 dark:hover:bg-slate-900 cursor-pointer transition-all group"
                onClick={() => routeChange(item.id)}
              >
                <td className="text-center px-6 py-4 text-sm font-mono font-black text-sky-700 dark:text-slate-400">
                  {item.id.toString().padStart(5, '0')}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-800 dark:group-hover:text-sky-400">
                  {item.cliente}
                </td>
                <td className="text-center px-6 py-4 text-sm font-mono font-bold text-slate-500 dark:text-slate-400">
                  {dayjs(item.fechaEmision).format("DD/MM/YYYY")}
                </td>
                <td className="px-6 py-4 text-right text-sm font-mono font-black text-sky-700 dark:text-sky-400">
                  S/ {Number(item.precioTotal || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={false} />
    </div>
  );
}

export default TablaAlmanaque;
