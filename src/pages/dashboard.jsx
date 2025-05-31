import { useState } from "react";
import Modal from "react-modal";
import logoeditar from "../assets/icons8-editar.svg";
import logodelete from "../assets/delete.svg";
import plus from "../assets/plus.svg";
import back from "../assets/back.svg";
import { Link } from "react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getServicios,
  createServicios,
  updateServicios,
  deleteServicios,
} from "../request/serviciosrequest";

Modal.setAppElement("#root"); // Asegura la accesibilidad del modal

function Dashboard() {
  const { data: dataServicios } = useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  const addServiciosMutation = useMutation({
    mutationFn: createServicios,
    onSuccess: () => {
      queryClient.invalidateQueries("servicios");
    },
  });

  const deleteServiciosMutation = useMutation({
    mutationFn: deleteServicios,
    onSuccess: () => {
      queryClient.invalidateQueries("servicios");
    },
  });

  const updateServiciosMutation = useMutation({
    mutationFn: updateServicios,
    onSuccess: () => {
      queryClient.invalidateQueries("servicios");
    },
  });

  const [valueInputnombre, setInputnombre] = useState("");
  const [valueInputCantidad, setValueInputCantidad] = useState("");
  const [valueInputTrabajo, setInputTrabajo] = useState("");
  const [valueInputEstado, setInputEstado] = useState("");
  const [valueInputTotal, setInputTotal] = useState(0.0);
  const [valueInputAcuenta, setInputAcuenta] = useState(0.0);
  const [editServiciosId, setEditServiciosId] = useState(null);
  const [activeTab, setActiveTab] = useState("inventario");

  const handlerChangeNombre = (e) => {
    setInputnombre(e.target.value);
  };
  const handlerChangeCantidad = (e) => {
    setValueInputCantidad(e.target.value);
  };
  const handlerChangeTrabajo = (e) => {
    setInputTrabajo(e.target.value);
  };
  const handlerChangeEstado = (e) => {
    setInputEstado(e.target.value);
  };
  const handlerChangeTotal = (e) => {
    setInputTotal(e.target.value);
  };
  const handlerChangeAcuenta = (e) => {
    setInputAcuenta(e.target.value);
  };

  const handlerClickServicios = async () => {
    if (
      !valueInputnombre ||
      !valueInputCantidad ||
      !valueInputTrabajo ||
      !valueInputEstado ||
      !valueInputTotal ||
      !valueInputAcuenta
    ) {
      console.log("Todos los campos son obligatorios");
      return;
    }
    try {
      await addServiciosMutation.mutateAsync({
        nombre: valueInputnombre,
        cantidad: parseInt(valueInputCantidad, 10),
        descripcion: valueInputTrabajo,
        estado: valueInputEstado,
        total: parseFloat(valueInputTotal),
        acuenta: parseFloat(valueInputAcuenta),
      });
      handlerReset();
      closeModal();
      queryClient.invalidateQueries("servicios");
    } catch (error) {
      console.error("Error al agregar el servicio:", error);
    }
  };

  const handleEditServicios = (id) => {
    setEditServiciosId(id);
    const servicios = dataServicios.find((servicios) => servicios.id === id);
    if (servicios) {
      setInputnombre(servicios.nombre);
      setValueInputCantidad(servicios.cantidad);
      setInputTrabajo(servicios.descripcion);
      setInputEstado(servicios.estado);
      setInputTotal(servicios.total);
      setInputAcuenta(servicios.acuenta);
      openModal({
        nombre: "",
        cantidad: "",
        descripcion: "",
        estado: "",
        total: "",
        acuenta: "",
      });
    }
  };

  const handlerUpdateServicios = () => {
    if (
      valueInputnombre.trim() === "" ||
      valueInputCantidad === "" ||
      valueInputTrabajo.trim() === "" ||
      valueInputEstado === "" ||
      valueInputTotal === "" ||
      valueInputAcuenta === ""
    ) {
      console.log("Por favor, completa todos los campos.");
      return;
    }
    try {
      updateServiciosMutation.mutate({
        id: editServiciosId,
        nombre: valueInputnombre,
        cantidad: valueInputCantidad,
        descripcion: valueInputTrabajo,
        estado: valueInputEstado,
        total: valueInputTotal,
        acuenta: valueInputAcuenta,
      });
      closeModal();
      handlerReset();
    } catch (error) {
      console.error("Error al actualizar el empaque:", error);
    }
  };

  const handleDeleteServicios = (id) => {
    deleteServiciosMutation.mutate(id);
    queryClient.invalidateQueries("servicios");
  };

  const handlerReset = () => {
    setEditServiciosId(null);
    setInputnombre("");
    setValueInputCantidad("");
    setInputTrabajo("");
    setInputEstado("");
    setInputTotal(0.0);
    setInputAcuenta(0.0);
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedItem(null);
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
                onClick={() => {
                  handlerReset();
                  openModal({
                    nombre: "",
                    cantidad: "",
                    descripcion: "",
                    estado: "",
                    total: "",
                    acuenta: "",
                  });
                }}
                className="bg-gray-400 hover:bg-gray-500 flex items-center flex-row px-3 py-2 text-sx rounded-md text-white gap-2 shadow-lg"
              >
                <img src={plus} className="w-6 items-center " />
                Nuevo Trabajo
              </button>
            </div>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab("Todos")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "Todos"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveTab("pendiente")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "pendiente"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Pendiente
              </button>
              <button
                onClick={() => setActiveTab("Diseño")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "Diseño"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Diseño
              </button>
              <button
                onClick={() => setActiveTab("Impresión")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "Impresión"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Impresión
              </button>
              <button
                onClick={() => setActiveTab("Terminado")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "Terminado"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Terminado
              </button>
              <button
                onClick={() => setActiveTab("Entregado")}
                className={`px-4 py-2 rounded-md ${
                  activeTab === "Entregado"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                Entregado
              </button>
            </div>
            <table className="min-w-full text-left text-sm font-light border rounded-lg shadow-lg overflow-hidden">
              <thead className="border-b font-medium dark:border-neutral-500 bg-gray-400 rounded-t-lg">
                <tr>
                  <th className="px-3 py-4">N°</th>
                  <th className="px-3 py-4">Nombre Cliente</th>
                  <th className="px-3 py-4">Fecha de Recepcion</th>
                  <th className="px-3 py-4">Cantidad</th>
                  <th className="px-3 py-4">Descripcion</th>
                  <th className="px-3 py-4">Estado</th>
                  <th className="px-3 py-4">Total</th>
                  <th className="px-3 py-4">A cuenta</th>
                  <th className="px-3 py-4">Saldo</th>
                  <th className="px-3 py-4">Editar</th>
                  <th className="px-3 py-4">Eliminar</th>
                </tr>
              </thead>
              <tbody className="rounded-b-lg">
                {dataServicios &&
                  dataServicios
                    .filter((cont) => {
                      if (activeTab === "Todos") return true; // Inventario muestra todos
                      return (
                        cont.estado.toLowerCase() === activeTab.toLowerCase()
                      );
                    })
                    .map((cont, i) => (
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
                          {new Date(cont.createdAt).toLocaleDateString("es-PE")}
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
                          S./ {cont.total - cont.acuenta}.00
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <button
                            className="cursor-pointer w-6"
                            onClick={() => handleEditServicios(cont.id)}
                          >
                            <img src={logoeditar} alt="Editar" />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <button
                            className="cursor-pointer w-6"
                            onClick={() => handleDeleteServicios(cont.id)}
                          >
                            <img src={logodelete} alt="Eliminar" />
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
              className="bg-white p-6 rounded-xl shadow-lg w-full sm:w-1/2 md:w-1/3 mx-auto mt-20"
              overlayClassName="fixed inset-0 flex items-center justify-center"
              style={{
                overlay: {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
              }}
            >
              {selectedItem && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-bold">Trabajo</h2>

                  <label className="text-sm font-medium">Nombre:</label>
                  <input
                    type="text"
                    name="nombre"
                    value={valueInputnombre || ""}
                    onChange={handlerChangeNombre}
                    className="border px-3 py-2 rounded-lg w-full"
                  />

                  <label className="text-sm font-medium">Cantidad:</label>
                  <input
                    type="number"
                    name="cantidad"
                    value={valueInputCantidad || ""}
                    onChange={handlerChangeCantidad}
                    className="border px-3 py-2 rounded-lg w-full"
                  />

                  <label className="text-sm font-medium">Trabajo:</label>
                  <input
                    type="text"
                    name="descripcion"
                    value={valueInputTrabajo || ""}
                    onChange={handlerChangeTrabajo}
                    className="border px-3 py-2 rounded-lg w-full"
                  />

                  <label className="text-sm font-medium">Estado:</label>
                  <select
                    name="estado"
                    value={valueInputEstado || ""}
                    onChange={handlerChangeEstado}
                    className="border px-3 py-2 rounded-lg w-full"
                  >
                    <option value="">Seleciona una opcion</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Diseño">Diseño</option>
                    <option value="Impresión">Impresión</option>
                    <option value="Terminado">Terminado</option>
                    <option value="Entregado">Entregado</option>
                  </select>

                  <label className="text-sm font-medium">Total:</label>
                  <input
                    type="number"
                    name="total"
                    value={valueInputTotal || ""}
                    onChange={handlerChangeTotal}
                    className="border px-3 py-2 rounded-lg w-full"
                  />
                  <label className="text-sm font-medium">A Cuenta:</label>
                  <input
                    type="number"
                    name="acuenta"
                    value={valueInputAcuenta || ""}
                    onChange={handlerChangeAcuenta}
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
                    {editServiciosId == null ? (
                      <button
                        onClick={handlerClickServicios}
                        className="bg-cyan-500 text-white px-4 py-2 rounded-lg"
                        disabled={addServiciosMutation.isLoading}
                      >
                        Guardar
                      </button>
                    ) : (
                      <button
                        onClick={handlerUpdateServicios}
                        className="bg-cyan-500 text-white px-4 py-2 rounded-lg"
                      >
                        Actualizar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
