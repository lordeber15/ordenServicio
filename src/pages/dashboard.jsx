import { useState } from "react";
import Modal from "react-modal";
import { FaPlus } from "react-icons/fa6";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getServicios,
  createServicios,
  updateServicios,
  deleteServicios,
} from "../request/serviciosrequest";

import Pagination from "../components/pagination";

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
    mutationFn: (data) =>
      toast.promise(createServicios(data), {
        loading: "Guardando...",
        success: "Servicio agregado con éxito ✅",
        error: "Error al agregar servicio ❌",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries("servicios");
    },
  });

  const deleteServiciosMutation = useMutation({
    mutationFn: (id) =>
      toast.promise(deleteServicios(id), {
        loading: "Eliminando...",
        success: "Servicio eliminado ✅",
        error: "Error al eliminar servicio ❌",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries("servicios");
    },
  });

  const updateServiciosMutation = useMutation({
    mutationFn: (data) =>
      toast.promise(updateServicios(data), {
        loading: "Actualizando...",
        success: "Servicio actualizado ✅",
        error: "Error al actualizar servicio ❌",
      }),
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
  const [activeTab, setActiveTab] = useState("pendiente");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

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
      toast.error("Todos los campos son obligatorios ⚠️");
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
      toast.error("Por favor, completa todos los campos ⚠️");
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

  /*const handleDeleteServicios = (id) => {
    deleteServiciosMutation.mutate(id);
    queryClient.invalidateQueries("servicios");
  };*/

  const handleDeleteServicios = (id) => {
    setIdToDelete(id);
    setConfirmModalOpen(true);
  };

  const confirmDeleteServicios = () => {
    if (idToDelete !== null) {
      deleteServiciosMutation.mutate(idToDelete);
      queryClient.invalidateQueries("servicios");
      setIdToDelete(null);
      setConfirmModalOpen(false);
    }
  };

  const cancelDelete = () => {
    setIdToDelete(null);
    setConfirmModalOpen(false);
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
    <div>
      <div className="sm:-mx-0 lg:-mx-0">
        <div className="min-w-full py-2 sm:px-6 lg:px-8">
          <div className=" overflow-x-auto w-full px-10 py-4">
            <div className="font-bold flex py-4 justify-between">
              <div />
              <div className="text-3xl text-sky-700 ">Lista de Trabajos</div>
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
                className=" cursor-pointer hover:bg-sky-700 text-sky-700 hover:text-white flex items-center flex-row px-3 py-2 text-sx rounded-md gap-2 transition ease-in duration-300"
              >
                <FaPlus />
                Nuevo Trabajo
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setActiveTab("Todos")}
                className={`px-4 py-2 rounded-md cursor-pointer ${
                  activeTab === "Todos"
                    ? "border-b-2 text-sky-700 hover:border-b-2 border-sky-700 animate-fade animate-duration-300 animate-ease-in"
                    : "bg-white"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveTab("pendiente")}
                className={`px-4 py-2 rounded-md cursor-pointer ${
                  activeTab === "pendiente"
                    ? "border-b-2 text-sky-700 hover:border-b-2 border-sky-700 animate-fade animate-duration-300 animate-ease-in"
                    : "bg-white"
                }`}
              >
                Pendiente
              </button>
              <button
                onClick={() => setActiveTab("Diseño")}
                className={`px-4 py-2 rounded-md cursor-pointer ${
                  activeTab === "Diseño"
                    ? "border-b-2 text-sky-700 hover:border-b-2 border-sky-700 animate-fade animate-duration-300 animate-ease-in"
                    : "bg-white"
                }`}
              >
                Diseño
              </button>
              <button
                onClick={() => setActiveTab("Impresión")}
                className={`px-4 py-2 rounded-md cursor-pointer ${
                  activeTab === "Impresión"
                    ? "border-b-2 text-sky-700 hover:border-b-2 border-sky-700 animate-fade animate-duration-300 animate-ease-in"
                    : "bg-white"
                }`}
              >
                Impresión
              </button>
              <button
                onClick={() => setActiveTab("Terminado")}
                className={`px-4 py-2 rounded-md cursor-pointer ${
                  activeTab === "Terminado"
                    ? "border-b-2 text-sky-700 hover:border-b-2 border-sky-700 animate-fade animate-duration-300 animate-ease-in"
                    : "bg-white"
                }`}
              >
                Terminado
              </button>
              <button
                onClick={() => setActiveTab("Entregado")}
                className={`px-4 py-2 rounded-md cursor-pointer ${
                  activeTab === "Entregado"
                    ? "border-b-2 text-sky-700 hover:border-b-2 border-sky-700 animate-fade animate-duration-300 animate-ease-in"
                    : "bg-white"
                }`}
              >
                Entregado
              </button>
            </div>

            <Pagination
              data={dataServicios || []}
              activeTab={activeTab}
              onEdit={handleEditServicios}
              onDelete={handleDeleteServicios}
            />

            {/* Modal de edición */}
            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              className="bg-white p-6 rounded-xl shadow-lg w-full sm:w-1/2 md:w-1/3 mx-auto mt-20 animate-fade animate-duration-200 animate-ease-in"
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
            <Modal
              isOpen={confirmModalOpen}
              onRequestClose={cancelDelete}
              contentLabel="Confirmar eliminación"
              className="bg-white p-6 rounded-xl shadow-lg w-full sm:w-1/3 mx-auto mt-40 animate-fade animate-duration-200 animate-ease-in"
              overlayClassName="fixed inset-0  flex items-center justify-center z-50"
              style={{
                overlay: {
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                },
              }}
            >
              <h2 className="text-xl font-bold text-red-600 mb-4">
                ¿Estás seguro?
              </h2>
              <p className="text-gray-700 mb-6">
                Esta acción eliminará el servicio{" "}
                <span className="font-semibold text-red-700">
                  {dataServicios?.find((item) => item.id === idToDelete)
                    ?.nombre || "desconocido"}
                </span>{" "}
                permanentemente. ¿Deseas continuar?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteServicios}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
