/**
 * PÁGINA DASHBOARD (LISTA DE TRABAJOS)
 * 
 * Es el núcleo de la aplicación donde se gestionan todas las órdenes de trabajo.
 * Permite visualizar, crear, editar, filtrar y eliminar servicios/trabajos.
 * 
 * Integraciones:
 * - TanStack Query: Manejo de estado del servidor (fetching, caching, mutations)
 * - React Hot Toast: Notificaciones dinámicas para operaciones CRUD
 * - React Modal: Interfaz para formularios de creación y edición
 * 
 * Flujo de Trabajo:
 * 1. Los trabajos se categorizan por pestañas (Pendiente, Diseño, etc.)
 * 2. Soporta búsqueda en tiempo real por nombre de cliente
 * 3. Implementa paginación local para manejar grandes volúmenes de datos
 */
import { useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import { FaPlus } from "react-icons/fa6";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getServicios,
  createServicios,
  updateServicios,
  deleteServicios,
} from "../../Sales/services/serviciosrequest";

import Pagination from "../../../shared/components/pagination";
import Drawer from "../../../shared/components/drawer";

// Configuración de accesibilidad para react-modal
Modal.setAppElement("#root");

const FORM_INITIAL = {
  nombre: "",      // Nombre del cliente
  cantidad: "",    // Cantidad de productos (ej: 1000 volantes)
  descripcion: "", // Detalle del trabajo (ej: Tarjetas 350gr mate)
  estado: "",      // Pendiente, Diseño, Impresión, Terminado, Entregado
  total: 0.0,      // Costo total pactado
  acuenta: 0.0,    // Pago adelantado
};

function Dashboard() {
  const queryClient = useQueryClient();

  // query: fetcher de servicios desde el backend
  const { data: dataServicios, isLoading } = useQuery({
    queryKey: ["servicios"],
    queryFn: getServicios,
  });

  // ESTADOS LOCALES DE UI
  const [modalIsOpen, setModalIsOpen] = useState(false);       
  const [selectedItem, setSelectedItem] = useState(null);       
  const [editServiciosId, setEditServiciosId] = useState(null); 
  const [activeTab, setActiveTab] = useState("pendiente");      
  const [confirmModalOpen, setConfirmModalOpen] = useState(false); 
  const [idToDelete, setIdToDelete] = useState(null);           
  const [searchTerm, setSearchTerm] = useState("");             
  const [form, setForm] = useState(FORM_INITIAL);               

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const addServiciosMutation = useMutation({
    mutationFn: (data) =>
      toast.promise(createServicios(data), {
        loading: "Guardando...",
        success: "Servicio agregado con éxito ✅",
        error: "Error al agregar servicio ❌",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
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
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
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
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
    },
  });

  const handlerReset = useCallback(() => {
    setEditServiciosId(null);
    setForm(FORM_INITIAL);
  }, []);

  const openModal = useCallback((item) => {
    setSelectedItem(item);
    setModalIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
    setSelectedItem(null);
  }, []);

  const handlerClickServicios = async () => {
    if (
      !form.nombre ||
      !form.cantidad ||
      !form.descripcion ||
      !form.estado ||
      !form.total ||
      !form.acuenta
    ) {
      toast.error("Todos los campos son obligatorios ⚠️");
      return;
    }
    try {
      await addServiciosMutation.mutateAsync({
        nombre: form.nombre,
        cantidad: parseInt(form.cantidad, 10),
        descripcion: form.descripcion,
        estado: form.estado,
        total: parseFloat(form.total),
        acuenta: parseFloat(form.acuenta),
      });
      handlerReset();
      closeModal();
    } catch (error) {
      console.error("Error al agregar el servicio:", error);
    }
  };

  const handleEditServicios = useCallback((id) => {
    setEditServiciosId(id);
    const servicio = dataServicios?.find((s) => s.id === id);
    if (servicio) {
      setForm({
        nombre: servicio.nombre,
        cantidad: servicio.cantidad,
        descripcion: servicio.descripcion,
        estado: servicio.estado,
        total: servicio.total,
        acuenta: servicio.acuenta,
      });
      openModal({});
    }
  }, [dataServicios, openModal]);

  const handlerUpdateServicios = () => {
    if (
      !form.nombre.trim() ||
      form.cantidad === "" ||
      !form.descripcion.trim() ||
      form.estado === "" ||
      form.total === "" ||
      form.acuenta === ""
    ) {
      toast.error("Por favor, completa todos los campos ⚠️");
      return;
    }
    try {
      updateServiciosMutation.mutate({
        id: editServiciosId,
        nombre: form.nombre,
        cantidad: form.cantidad,
        descripcion: form.descripcion,
        estado: form.estado,
        total: form.total,
        acuenta: form.acuenta,
      });
      closeModal();
      handlerReset();
    } catch (error) {
      console.error("Error al actualizar el servicio:", error);
    }
  };

  const handleDeleteServicios = useCallback((id) => {
    setIdToDelete(id);
    setConfirmModalOpen(true);
  }, []);

  const confirmDeleteServicios = () => {
    if (idToDelete !== null) {
      deleteServiciosMutation.mutate(idToDelete);
      setIdToDelete(null);
      setConfirmModalOpen(false);
    }
  };

  const cancelDelete = () => {
    setIdToDelete(null);
    setConfirmModalOpen(false);
  };

  const filteredServicios = useMemo(() => {
    return (dataServicios || []).filter((servicio) =>
      servicio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dataServicios, searchTerm]);

  const TABS = ["Todos", "pendiente", "Diseño", "Impresión", "Terminado", "Entregado"];

  return (
    <div>
      <div className="sm:-mx-0 lg:-mx-0">
        <div className="min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-x-auto w-full px-4 md:px-10 py-4">
            <div className="font-bold flex py-4 justify-between transition-colors">
              <Drawer />
              <div className="text-3xl text-sky-700 dark:text-slate-100">Lista de Trabajos</div>
              <button
                onClick={() => {
                  handlerReset();
                  openModal({});
                }}
                className="cursor-pointer hover:bg-sky-700 dark:hover:bg-slate-800 text-sky-700 dark:text-slate-100 hover:text-white dark:hover:text-white flex items-center flex-row px-3 py-2 text-sx rounded-md gap-2 transition ease-in duration-300 border dark:border-slate-800"
              >
                <FaPlus />
                Nuevo Trabajo
              </button>
            </div>

            <div className="flex justify-end mb-4 text-sky-700 dark:text-slate-400">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 px-3 py-2 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-gray-300 dark:placeholder:text-slate-600 transition-colors"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md cursor-pointer transition-all ${
                    activeTab === tab
                      ? "border-b-2 text-sky-700 dark:text-slate-100 border-sky-700 dark:border-slate-100 font-bold"
                      : "bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="text-center py-10 text-sky-700 dark:text-slate-400 text-sm italic">Cargando trabajos...</div>
            ) : (
              <Pagination
                data={filteredServicios}
                activeTab={activeTab}
                onEdit={handleEditServicios}
                onDelete={handleDeleteServicios}
              />
            )}

            <Modal
              isOpen={modalIsOpen}
              onRequestClose={closeModal}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg w-full sm:w-1/2 md:w-1/3 mx-auto mt-20 border dark:border-slate-800"
              overlayClassName="fixed inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-md z-50 transition-opacity"
            >
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-sky-700 dark:text-slate-100">{editServiciosId ? "Editar Trabajo" : "Nuevo Trabajo"}</h2>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Nombre del Cliente:</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-700 dark:text-slate-200 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-sky-500 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                    <input
                      type="number"
                      name="cantidad"
                      value={form.cantidad}
                      onChange={handleChange}
                      className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-700 dark:text-slate-200 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-sky-500 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-400">
Estado:</label>
                    <select
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                      className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-700 dark:text-slate-200 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-sky-500 outline-none transition-colors"
                    >
                      <option value="">Selecciona</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Diseño">Diseño</option>
                      <option value="Impresión">Impresión</option>
                      <option value="Terminado">Terminado</option>
                      <option value="Entregado">Entregado</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Descripción del Trabajo:</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-700 dark:text-slate-200 px-3 py-2 rounded-lg w-full h-24 resize-none focus:ring-2 focus:ring-sky-500 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Total (S/.):</label>
                    <input
                      type="number"
                      name="total"
                      value={form.total}
                      onChange={handleChange}
                      className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-700 dark:text-slate-200 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-sky-500 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">A Cuenta (S/.):</label>
                    <input
                      type="number"
                      name="acuenta"
                      value={form.acuenta}
                      onChange={handleChange}
                      className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-700 dark:text-slate-200 px-3 py-2 rounded-lg w-full focus:ring-2 focus:ring-sky-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-5 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer transition shadow-sm font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editServiciosId ? handlerUpdateServicios : handlerClickServicios}
                    className="bg-sky-700 text-white px-6 py-2 rounded-lg hover:bg-sky-600 cursor-pointer transition font-medium shadow-sm"
                    disabled={addServiciosMutation.isPending || updateServiciosMutation.isPending}
                  >
                    {editServiciosId ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </div>
            </Modal>

            <Modal
              isOpen={confirmModalOpen}
              onRequestClose={cancelDelete}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg w-full sm:w-1/3 mx-auto mt-40 border dark:border-slate-800"
              overlayClassName="fixed inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-md z-50 text-sky-900 dark:text-slate-100 transition-opacity"
            >
              <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                ¿Confirmar Eliminación?
              </h2>
              <p className="text-gray-700 dark:text-slate-300 mb-6 font-medium">
                ¿Deseas eliminar permanentemente el servicio de <span className="text-red-700 dark:text-red-500 font-bold underline">{dataServicios?.find((item) => item.id === idToDelete)?.nombre}</span>?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteServicios}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition font-bold"
                >
                  Sí, Eliminar
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
