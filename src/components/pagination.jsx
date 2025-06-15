import { useState } from "react";
import logoeditar from "../assets/icons8-editar.svg";
import logodelete from "../assets/delete.svg";

const ITEMS_PER_PAGE = 8;
function Pagination({ data, activeTab, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((item) => {
    if (activeTab === "Todos") return true;
    return item.estado.toLowerCase() === activeTab.toLowerCase();
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div>
      <table className="min-w-full text-left text-sm font-light border rounded-lg shadow-lg overflow-hidden">
        <thead className="border-b font-medium bg-sky-700 text-white rounded-t-lg">
          <tr>
            <th className="px-3 py-4">N°</th>
            <th className="px-3 py-4">Nombre Cliente</th>
            <th className="px-3 py-4">Fecha de Recepción</th>
            <th className="px-3 py-4">Cantidad</th>
            <th className="px-3 py-4">Descripción</th>
            <th className="px-3 py-4">Estado</th>
            <th className="px-3 py-4">Total</th>
            <th className="px-3 py-4">A cuenta</th>
            <th className="px-3 py-4">Saldo</th>
            <th className="px-3 py-4">Editar</th>
            <th className="px-3 py-4">Eliminar</th>
          </tr>
        </thead>
        <tbody className="rounded-b-lg text-sky-900">
          {paginatedData.map((cont, i) => (
            <tr key={i} className="border-b border-sky-700">
              <td className="whitespace-nowrap px-3 py-4 font-medium">
                {cont.id}
              </td>
              <td className="whitespace-nowrap px-3 py-4">{cont.nombre}</td>
              <td className="whitespace-nowrap px-3 py-4">
                {new Date(cont.createdAt).toLocaleDateString("es-PE")}
              </td>
              <td className="whitespace-nowrap px-3 py-4">{cont.cantidad}</td>
              <td className="whitespace-nowrap px-3 py-4">
                {cont.descripcion}
              </td>
              <td className="whitespace-nowrap px-3 py-4">
                <span
                  className={`px-3 py-2 rounded-full font-bold text-white ${
                    cont.estado === "Pendiente"
                      ? "bg-rose-500"
                      : cont.estado === "Diseño"
                      ? "bg-orange-500"
                      : cont.estado === "Impresión"
                      ? "bg-blue-500"
                      : cont.estado === "Terminado"
                      ? "bg-green-500"
                      : cont.estado === "Entregado"
                      ? "bg-gray-500"
                      : "bg-black"
                  }`}
                >
                  {cont.estado}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                S./ {parseFloat(cont.total).toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                S./ {cont.acuenta}.00
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                S./ {(cont.total - cont.acuenta).toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <button
                  className="cursor-pointer w-6"
                  onClick={() => onEdit(cont.id)}
                >
                  <img src={logoeditar} alt="Editar" />
                </button>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <button
                  className="cursor-pointer w-6"
                  onClick={() => onDelete(cont.id)}
                >
                  <img src={logodelete} alt="Eliminar" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-4">
          <button
            className="px-4 py-1 bg-sky-700 text-white rounded disabled:opacity-50"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span className="text-sky-700 font-bold">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="px-4 py-1 bg-sky-700 text-white rounded disabled:opacity-50"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default Pagination;
