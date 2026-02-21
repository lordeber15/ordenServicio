import { MdDeleteOutline } from "react-icons/md";
import Modal from "react-modal";

function tabladetallealmanque({ data, unidades, setItems }) {
  const getUnidadNombre = (id) => {
    const unidad = unidades?.find((u) => u.id === id);
    return unidad ? unidad.nombre : id;
  };

  // 🧹 Función para eliminar un ítem
  const handleDelete = (index) => {
    const confirmar = window.confirm("¿Deseas eliminar este producto?");
    if (!confirmar) return;

    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Cant
              </th>
              <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Descripción
              </th>
              <th className="px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Unidad
              </th>
              <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Unitario
              </th>
              <th className="px-4 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Sub Total
              </th>
              <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-950 divide-y divide-gray-100 dark:divide-slate-900">
            {data?.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                <td className="text-center px-4 py-4 text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                  {item.cantidad}
                </td>
                <td className="px-4 py-4 text-sm font-bold text-slate-800 dark:text-slate-100">
                  {item.descripcion}
                </td>
                <td className="px-4 py-4 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  {getUnidadNombre(item.unidad)}
                </td>
                <td className="px-4 py-4 text-right text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                  S/ {Number(item.precioUnitario || 0).toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right text-sm font-mono font-black text-sky-800 dark:text-sky-400">
                  S/ {(Number(item.precioUnitario || 0) * Number(item.cantidad || 0)).toFixed(2)}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-100 dark:border-rose-900/50 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all cursor-pointer shadow-sm group"
                      title="Eliminar de la lista"
                    >
                      <MdDeleteOutline className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
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

export default tabladetallealmanque;
