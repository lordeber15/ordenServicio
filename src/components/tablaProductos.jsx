import { CiEdit } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import Modal from "react-modal";

export default function TablaProductos({ data }) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto ">
        <table className="min-w-full border border-sky-700 divide-y divide-sky-700">
          <thead className="bg-sky-700 text-white">
            <tr>
              <th className="px-4 py-2 text-center text-sm font-semibold">
                Código
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Nombre
              </th>

              <th className="px-4 py-2 text-left text-sm font-semibold">
                Unidad
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Precio
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="text-center px-4 py-2 text-sm text-gray-800">
                  {item.codigo}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.descripcion}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.unidad}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  S/ {item.precio.toFixed(2)}
                </td>
                <td className=" py-2 text-gray-800 space-x-2">
                  <button className="bg-sky-700 text-white p-2 rounded text-xs hover:bg-sky-600">
                    <CiEdit className="h-5 w-5" />
                  </button>
                  <button className="bg-red-400 text-white p-2 rounded text-xs hover:bg-red-600">
                    <MdDeleteOutline className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={""} />
    </div>
  );
}
