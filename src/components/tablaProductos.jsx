import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";

const TIPO_LABEL = {
  "10": "Gravado",
  "20": "Exonerado",
  "30": "Inafecto",
};

function precioDisplay(p) {
  return parseFloat(p.valor_unitario || 0);
}

function TablaProductos({ data, unidades = [], onEdit, onDelete }) {
  const getUnidadNombre = (id) =>
    unidades.find((u) => u.id === id)?.descripcion || id || "—";

  return (
    <div className="overflow-x-auto rounded-lg border border-sky-700 dark:border-slate-800 transition-colors">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-sky-700 dark:bg-slate-900 text-white">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3 text-right">Precio c/IGV</th>
            <th className="px-4 py-3 text-center">Stock</th>
            <th className="px-4 py-3">Unidad</th>
            <th className="px-4 py-3">Tipo IGV</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sky-100 dark:divide-slate-800 text-sky-900 dark:text-slate-200 bg-white dark:bg-slate-950">
          {(!data || data.length === 0) && (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                No hay productos — haz clic en "Agregar Producto" para comenzar
              </td>
            </tr>
          )}
          {(data || []).map((p) => (
            <tr key={p.id} className="hover:bg-sky-50 dark:hover:bg-slate-900 transition-colors">
              <td className="px-4 py-3 font-medium">{p.nombre}</td>
              <td className="px-4 py-3 text-right font-mono">
                S/ {precioDisplay(p).toFixed(2)}
              </td>
              <td className="px-4 py-3 text-center">
                {p.es_servicio
                  ? <span className="px-2 py-1 rounded-full text-xs font-semibold text-white bg-indigo-500">Servicio</span>
                  : <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${
                      (p.stock ?? 0) > 0 ? "bg-green-500" : "bg-red-500"
                    }`}>{p.stock ?? 0}</span>
                }
              </td>
              <td className="px-4 py-3">{getUnidadNombre(p.unidad_id)}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                {TIPO_LABEL[p.tipo_afectacion_id] || p.tipo_afectacion_id || "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="p-1.5 bg-sky-700 dark:bg-slate-800 hover:bg-sky-600 dark:hover:bg-slate-700 text-white rounded cursor-pointer border dark:border-slate-700 transition-colors"
                    title="Editar"
                  >
                    <CiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
                    title="Eliminar"
                  >
                    <MdDeleteOutline className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablaProductos;
