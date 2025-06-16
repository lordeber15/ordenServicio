import { useState, useEffect, useRef } from "react";
import { FaCaretUp } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { MdDelete } from "react-icons/md";

const ITEMS_PER_PAGE = 7;
function Pagination({ data, activeTab, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [userData, setUserData] = useState("");
  const [admin, setIsAdmin] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []);
  useEffect(() => {
    if (userData && userData.cargo === "Administrador") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [userData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      <table className="min-w-full text-left text-sm font-light rounded-md shadow-lg border border-sky-700">
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
          </tr>
        </thead>
        <tbody className="rounded-b-lg text-sky-900 ">
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

              <td className="relative whitespace-nowrap px-6 py-4">
                <button
                  onClick={() => setOpen(open === cont.id ? null : cont.id)}
                  className="rounded-md w-10 h-10 bg-sky-700 text-white hover:text-sky-700 flex items-center justify-center cursor-pointer hover:bg-sky-500"
                >
                  <FaCaretUp />
                </button>

                {open === cont.id && (
                  <div
                    ref={dropdownRef}
                    className=" absolute flex flex-col z-50 top-14 right-14 bg-white border border-gray-200 rounded-md shadow-lg w-36 text-sm"
                  >
                    <button
                      onClick={() => {
                        onEdit(cont.id); // Reemplaza con tu lógica de edición
                        setOpen(null);
                      }}
                      className="w-full text-left text-md px-4 py-2 hover:bg-sky-100 text-sky-700 flex gap-2 items-center"
                    >
                      <CiEdit className="w-5 h-5" />
                      Editar
                    </button>

                    {admin && (
                      <button
                        onClick={() => {
                          onDelete(cont.id);
                          setOpen(null);
                        }}
                        className="w-full text-left text-md  px-4 py-2 hover:bg-rose-100 text-red-600 flex gap-2 items-center"
                      >
                        <MdDelete className="w-5 h-5" />
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </td>

              {/* <button
                  className="cursor-pointer w-6"
                  onClick={() => onEdit(cont.id)}
                >
                  <img src={logoeditar} alt="Editar" />
                </button> */}
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
