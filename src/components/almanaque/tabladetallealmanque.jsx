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
      <div className="overflow-x-auto rounded-t-md">
        <table className="min-w-full border border-sky-700 divide-y divide-sky-700">
          <thead className="bg-sky-700 text-white">
            <tr>
              <th className="px-4 py-2 text-center text-sm font-semibold">
                Cant
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Descripción
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Unidad
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Precio Unitario
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Sub Total
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="text-center px-4 py-2 text-sm text-gray-800">
                  {item.cantidad}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.descripcion}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {getUnidadNombre(item.unidad)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  S/{Number(item.precioUnitario || 0).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  S/
                  {Number(item.precioUnitario * item.cantidad || 0).toFixed(2)}
                </td>
                <td className="flex justify-center p-2">
                  <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-400 text-white p-2 rounded text-xs hover:bg-red-600"
                  >
                    <MdDeleteOutline className="h-5 w-5" />
                  </button>
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
