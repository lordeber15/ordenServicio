import { useState } from "react";
import Modal from "react-modal";
import logo from "../assets/icons8-editar.svg";
import plus from "../assets/plus.svg";
import back from "../assets/back.svg";
import { Link } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getServicios } from "../request/serviciosrequest";

Modal.setAppElement("#root"); // Asegura la accesibilidad del modal

function Dashboard() {
  const { data: dataServicios } = useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  const openModal = (item) => {
    setSelectedItem(item);
    setFormData(item);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedItem(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos actualizados:", formData);
    closeModal();
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden px-20 py-4">
            <div className="font-bold flex py-4 justify-between">
              <Link to={"/"}>
                <img
                  src={back}
                  className="w-12 cursor-pointer bg-gray-400 p-2 rounded-md"
                />
              </Link>
              <div className="text-3xl ">Lista de Trabajos</div>
              <button
                onClick={() =>
                  openModal({
                    nombre: "",
                    cantidad: "",
                    descripcion: "",
                    estado: "Pendiente",
                    total: "",
                  })
                }
                className="bg-gray-400 hover:bg-gray-500 flex items-center flex-row px-3 py-2 text-sx rounded-md text-white gap-2 shadow-lg"
              >
                <img src={plus} className="w-6 items-center " />
                Nuevo Trabajo
              </button>
            </div>
            <table className="min-w-full text-left text-sm font-light border rounded-lg shadow-lg overflow-hidden">
              <thead className="border-b font-medium dark:border-neutral-500 bg-gray-400 rounded-t-lg">
                <tr>
                  <th className="px-3 py-4">N°</th>
                  <th className="px-3 py-4">Nombre Cliente</th>
                  <th className="px-3 py-4">Cantidad</th>
                  <th className="px-3 py-4">Descripcion</th>
                  <th className="px-3 py-4">Estado</th>
                  <th className="px-3 py-4">Total</th>
                  <th className="px-3 py-4">A cuenta</th>
                  <th className="px-3 py-4">Saldo</th>
                  <th className="px-3 py-4">Editar</th>
                </tr>
              </thead>
              <tbody className="rounded-b-lg">
                {dataServicios &&
                  dataServicios.map((cont, i) => (
                    <tr
                      className="border-b dark:border-neutral-500 last:rounded-b-lg"
                      key={i}
                    >
                      <td className="whitespace-nowrap px-3 py-4 font-medium">
                        {cont.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {cont.nombre}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {cont.cantidad}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        {cont.descripcion}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={`px-3 py-2 rounded-full font-bold text-white ${
                            cont.estado === "Pendiente"
                              ? "bg-rose-500"
                              : cont.estado === "Proceso"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        >
                          {cont.estado}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        S./ {cont.total}.00
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        S./ {cont.acuenta}.00
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        S./ {cont.total - cont.acuenta}.00
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          className="cursor-pointer w-6"
                          onClick={() => openModal(cont)}
                        >
                          <img src={logo} alt="Editar" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Modal de edición */}
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              className="bg-white p-6 rounded-xl shadow-lg w-1/5 mx-auto mt-20"
              overlayClassName="fixed inset-0 flex items-center justify-center"
              style={{
                overlay: {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
              }}
            >
              {selectedItem && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold">Trabajo</h2>

                  <label className="text-sm font-medium">Nombre:</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre || ""}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded-lg w-full"
                  />

                  <label className="text-sm font-medium">Cantidad:</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad || ""}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded-lg w-full"
                  />

                  <label className="text-sm font-medium">Trabajo:</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formData.descripcion || ""}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded-lg w-full"
                  />

                  <label className="text-sm font-medium">Estado:</label>
                  <select
                    name="estado"
                    value={formData.estado || ""}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded-lg w-full"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Proceso">Proceso</option>
                    <option value="Completado">Completado</option>
                  </select>

                  <label className="text-sm font-medium">Total:</label>
                  <input
                    type="number"
                    name="total"
                    value={formData.total || ""}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded-lg w-full"
                  />
                  <label className="text-sm font-medium">A Cuenta:</label>
                  <input
                    type="number"
                    name="acuenta"
                    value={formData.acuenta || ""}
                    onChange={handleChange}
                    className="border px-3 py-2 rounded-lg w-full"
                  />

                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-cyan-500 text-white px-4 py-2 rounded-lg"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              )}
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
