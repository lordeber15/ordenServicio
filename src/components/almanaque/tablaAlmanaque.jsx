import Modal from "react-modal";
import moment from "moment/moment";
import { useNavigate } from "react-router";
function TablaAlmanaque({ data }) {
  let navigate = useNavigate();
  function routeChange(id) {
    navigate(`/almanaque/${id}`);
  }
  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-t-md">
        <table className="min-w-full border border-sky-700 divide-y divide-sky-700">
          <thead className="bg-sky-700 text-white">
            <tr>
              <th className="px-4 py-2 text-center text-sm font-semibold">
                Numero
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Cliente
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Fecha
              </th>
              {/* <th className="px-4 py-2 text-left text-sm font-semibold">
                A cuenta
              </th> */}
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Saldo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => routeChange(item.id)}
              >
                <td className="text-center px-4 py-2 text-sm text-gray-800">
                  {item.id}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {item.cliente}
                </td>
                <td className="px-4 py-2 text-sm text-gray-800">
                  {moment(item.fechaEmision).format("DD/MM/YYYY")}
                </td>
                {/* <td className="px-4 py-2 text-sm text-gray-800">
                  S/{Number(item.aCuenta || 0).toFixed(2)}
                </td> */}
                <td className="px-4 py-2 text-sm text-gray-800">
                  S/{Number(item.precioTotal - item.aCuenta || 0).toFixed(2)}
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
