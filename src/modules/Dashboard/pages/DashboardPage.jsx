import { useState, useMemo, useCallback, useEffect } from "react";
import Modal from "react-modal";
import {
  FaPlus,
  FaClipboardList,
  FaClock,
  FaGears,
  FaCircleCheck,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  getServicios,
  createServicios,
  updateServicios,
  deleteServicios,
  getServiciosStats,
} from "../../Sales/services/serviciosrequest";

import Pagination from "../../../shared/components/pagination";
import Drawer from "../../../shared/components/drawer";

Modal.setAppElement("#root");

const FORM_INITIAL = {
  nombre: "",
  cantidad: "",
  descripcion: "",
  estado: "",
  total: 0.0,
  acuenta: 0.0,
};

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const TABS_CONFIG = [
  { key: "Todos", label: "Todos", color: "bg-sky-700 text-white" },
  { key: "Pendiente", label: "Pendiente", color: "bg-rose-500 text-white" },
  { key: "Diseño", label: "Diseño", color: "bg-orange-500 text-white" },
  { key: "Impresión", label: "Impresión", color: "bg-blue-500 text-white" },
  { key: "Terminado", label: "Terminado", color: "bg-green-500 text-white" },
  { key: "Entregado", label: "Entregado", color: "bg-gray-500 text-white" },
];

function Dashboard() {
  const queryClient = useQueryClient();

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editServiciosId, setEditServiciosId] = useState(null);
  const [activeTab, setActiveTab] = useState("Pendiente");
  const [page, setPage] = useState(1);
  const [limit] = useState(7);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [form, setForm] = useState(FORM_INITIAL);

  const { data: dataResponse, isLoading } = useQuery({
    queryKey: ["servicios", page, limit, activeTab, debouncedSearchTerm],
    queryFn: () =>
      getServicios(page, limit, {
        nombre: debouncedSearchTerm,
        estado: activeTab === "Todos" ? undefined : activeTab,
      }),
    keepPreviousData: true,
  });

  const servicios = dataResponse?.data || [];
  const totalPages = dataResponse?.totalPages || 0;
  const currentPage = dataResponse?.currentPage || 1;

  const { data: stats } = useQuery({
    queryKey: ["servicios-stats"],
    queryFn: getServiciosStats,
    staleTime: 30000,
  });

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["servicios"] });
    queryClient.invalidateQueries({ queryKey: ["servicios-stats"] });
  };

  const addServiciosMutation = useMutation({
    mutationFn: (data) =>
      toast.promise(createServicios(data), {
        loading: "Guardando...",
        success: "Servicio agregado con éxito",
        error: "Error al agregar servicio",
      }),
    onSuccess: invalidateAll,
  });

  const deleteServiciosMutation = useMutation({
    mutationFn: (id) =>
      toast.promise(deleteServicios(id), {
        loading: "Eliminando...",
        success: "Servicio eliminado",
        error: "Error al eliminar servicio",
      }),
    onSuccess: invalidateAll,
  });

  const updateServiciosMutation = useMutation({
    mutationFn: (data) =>
      toast.promise(updateServicios(data), {
        loading: "Actualizando...",
        success: "Servicio actualizado",
        error: "Error al actualizar servicio",
      }),
    onSuccess: invalidateAll,
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
    if (!form.nombre || !form.cantidad || !form.descripcion || !form.estado || !form.total || !form.acuenta) {
      toast.error("Todos los campos son obligatorios");
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

  const handleEditServicios = useCallback(
    (id) => {
      setEditServiciosId(id);
      const servicio = servicios?.find((s) => s.id === id);
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
      } else {
        toast.error("Servicio no encontrado en la página actual");
      }
    },
    [servicios, openModal]
  );

  const handlerUpdateServicios = () => {
    if (!form.nombre.trim() || form.cantidad === "" || !form.descripcion.trim() || form.estado === "" || form.total === "" || form.acuenta === "") {
      toast.error("Por favor, completa todos los campos");
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

  const STAT_CARDS = [
    {
      label: "Total Trabajos",
      value: stats?.total ?? 0,
      icon: FaClipboardList,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-50 dark:bg-sky-950/30",
      border: "border-sky-100 dark:border-sky-900/50",
    },
    {
      label: "Pendientes",
      value: stats?.Pendiente ?? 0,
      icon: FaClock,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      border: "border-rose-100 dark:border-rose-900/50",
    },
    {
      label: "En Proceso",
      value: (stats?.["Diseño"] ?? 0) + (stats?.["Impresión"] ?? 0),
      icon: FaGears,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      border: "border-orange-100 dark:border-orange-900/50",
    },
    {
      label: "Completados",
      value: (stats?.Terminado ?? 0) + (stats?.Entregado ?? 0),
      icon: FaCircleCheck,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-100 dark:border-green-900/50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Drawer />
            <div>
              <h1 className="text-3xl font-black text-gray-800 dark:text-slate-50 flex items-center gap-3">
                <FaClipboardList className="text-sky-600 dark:text-sky-400" />
                Lista de Trabajos
              </h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1 text-sm">
                Gestiona las ordenes de trabajo de la imprenta.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handlerReset();
              openModal({});
            }}
            className="bg-sky-700 hover:bg-sky-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-sky-900/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <FaPlus />
            Nuevo Trabajo
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className={`${card.bg} border ${card.border} rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md`}
            >
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`text-xl ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-800 dark:text-slate-50">{card.value}</p>
                <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH + TABS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
            <FaMagnifyingGlass className="text-gray-400 dark:text-slate-500 ml-1" />
            <input
              type="text"
              placeholder="Buscar por nombre de cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent outline-none text-gray-700 dark:text-slate-200 font-medium placeholder:text-gray-300 dark:placeholder:text-slate-600"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {TABS_CONFIG.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = tab.key === "Todos" ? stats?.total : stats?.[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? `${tab.color} shadow-md`
                      : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {tab.label}
                  {count !== undefined && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20"
                          : "bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TABLE / DATA */}
        {isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-slate-800 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-lg w-1/3" />
                    <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded-lg w-1/2" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-slate-800 rounded-full" />
                  <div className="h-4 w-16 bg-gray-100 dark:bg-slate-800/50 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        ) : servicios.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-16 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaClipboardList className="text-3xl text-gray-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-gray-700 dark:text-slate-200 mb-2">No hay trabajos</h3>
            <p className="text-gray-400 dark:text-slate-500 mb-6 max-w-sm mx-auto">
              {activeTab === "Todos"
                ? "Aun no tienes ordenes registradas. Crea tu primer trabajo."
                : `No hay trabajos con estado "${activeTab}".`}
            </p>
            {activeTab === "Todos" && (
              <button
                onClick={() => {
                  handlerReset();
                  openModal({});
                }}
                className="bg-sky-700 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl font-bold inline-flex items-center gap-2 shadow-lg shadow-sky-900/10 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <FaPlus />
                Crear Trabajo
              </button>
            )}
          </div>
        ) : (
          <Pagination
            data={servicios}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setPage}
            onEdit={handleEditServicios}
            onDelete={handleDeleteServicios}
          />
        )}

        {/* MODAL CREAR/EDITAR */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          className="outline-none"
          overlayClassName="fixed inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-md z-50 p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in border dark:border-slate-800">
            <div className="bg-sky-900 dark:bg-slate-950 p-8 text-white">
              <h2 className="text-2xl font-black">
                {editServiciosId ? "Editar Trabajo" : "Nuevo Trabajo"}
              </h2>
              <p className="text-sky-300 text-sm mt-1">
                {editServiciosId
                  ? "Actualiza los datos de la orden de trabajo."
                  : "Registra una nueva orden de trabajo en el sistema."}
              </p>
            </div>

            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan Perez"
                  className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none font-medium text-gray-800 dark:text-slate-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={handleChange}
                    placeholder="Ej: 1000"
                    className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none font-medium text-gray-800 dark:text-slate-100 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none font-bold text-gray-800 dark:text-slate-100 transition-all"
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">
                  Descripcion del Trabajo
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Ej: Tarjetas de presentacion 350gr mate"
                  className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none font-medium text-gray-800 dark:text-slate-100 h-24 resize-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">
                    Total (S/.)
                  </label>
                  <input
                    type="number"
                    name="total"
                    value={form.total}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none font-medium text-gray-800 dark:text-slate-100 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase ml-1">
                    A Cuenta (S/.)
                  </label>
                  <input
                    type="number"
                    name="acuenta"
                    value={form.acuenta}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none font-medium text-gray-800 dark:text-slate-100 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-2xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={editServiciosId ? handlerUpdateServicios : handlerClickServicios}
                  disabled={addServiciosMutation.isPending || updateServiciosMutation.isPending}
                  className="flex-1 py-4 bg-sky-700 hover:bg-sky-600 text-white rounded-2xl font-black shadow-xl shadow-sky-900/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {addServiciosMutation.isPending || updateServiciosMutation.isPending
                    ? "Guardando..."
                    : editServiciosId
                    ? "Actualizar"
                    : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </Modal>

        {/* MODAL ELIMINAR */}
        <Modal
          isOpen={confirmModalOpen}
          onRequestClose={cancelDelete}
          className="outline-none"
          overlayClassName="fixed inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-md z-50 p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in border dark:border-slate-800">
            <div className="bg-red-600 dark:bg-red-900 p-8 text-white">
              <h2 className="text-2xl font-black">Confirmar Eliminacion</h2>
              <p className="text-red-200 text-sm mt-1">Esta accion no se puede deshacer.</p>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-gray-700 dark:text-slate-300 font-medium">
                Deseas eliminar permanentemente el servicio de{" "}
                <span className="text-red-700 dark:text-red-400 font-black">
                  {servicios?.find((item) => item.id === idToDelete)?.nombre}
                </span>
                ?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={cancelDelete}
                  className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 rounded-2xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteServicios}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black shadow-xl shadow-red-900/20 transition-all cursor-pointer"
                >
                  Si, Eliminar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Dashboard;
