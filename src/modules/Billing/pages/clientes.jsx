import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import { CiEdit, CiSearch } from "react-icons/ci";
import { MdDeleteOutline } from "react-icons/md";
import Drawer from "../../../shared/components/drawer";
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  buscarClientePorDoc,
} from "../../../shared/services/clientes";

const TIPO_DOC_LABEL = { "1": "DNI", "6": "RUC", "0": "S/Doc", "4": "CE", "7": "Pasaporte" };
const TIPO_DOC_OPTIONS = [
  { id: "1", label: "DNI" },
  { id: "6", label: "RUC" },
  { id: "4", label: "Carnet de Extranjería" },
  { id: "7", label: "Pasaporte" },
  { id: "0", label: "Sin Documento" },
];
const PER_PAGE = 15;

// ─── Tabla de clientes ──────────────────────────────────────────────────────
function TablaClientes({ data, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-sky-700 dark:border-slate-800 transition-colors">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-sky-700 dark:bg-slate-900 text-white">
          <tr>
            <th className="px-4 py-3">Tipo Doc</th>
            <th className="px-4 py-3">Nro Documento</th>
            <th className="px-4 py-3">Razón Social / Nombre</th>
            <th className="px-4 py-3 hidden md:table-cell">Dirección</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sky-100 dark:divide-slate-800 text-sky-900 dark:text-slate-200 bg-white dark:bg-slate-950">
          {data.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                No hay clientes registrados
              </td>
            </tr>
          )}
          {data.map((c) => (
            <tr key={c.id} className="hover:bg-sky-50 dark:hover:bg-slate-900 transition-colors">
              <td className="px-4 py-3">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300">
                  {TIPO_DOC_LABEL[c.tipo_documento_id] || c.tipo_documento_id || "—"}
                </span>
              </td>
              <td className="px-4 py-3 font-mono font-bold">{c.nrodoc || "—"}</td>
              <td className="px-4 py-3 font-medium">{c.razon_social || "—"}</td>
              <td className="px-4 py-3 hidden md:table-cell text-gray-600 dark:text-slate-400 truncate max-w-xs">
                {c.direccion || "—"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="p-1.5 bg-sky-700 dark:bg-slate-800 hover:bg-sky-600 dark:hover:bg-slate-700 text-white rounded cursor-pointer border dark:border-slate-700 transition-colors"
                    title="Editar"
                  >
                    <CiEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer transition-colors"
                    title="Eliminar"
                  >
                    <MdDeleteOutline className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Modal Agregar / Editar cliente ─────────────────────────────────────────
function ModalCliente({ isOpen, onClose, cliente }) {
  const queryClient = useQueryClient();

  const [tipoDoc, setTipoDoc] = useState("1");
  const [nrodoc, setNrodoc] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccion, setDireccion] = useState("");
  const [buscando, setBuscando] = useState(false);

  // Pre-cargar datos al abrir en modo edición
  useState(() => {
    // Usamos un efecto inline al montar
  });

  // Reset al abrir/cerrar
  const resetForm = () => {
    if (cliente) {
      setTipoDoc(cliente.tipo_documento_id || "1");
      setNrodoc(cliente.nrodoc || "");
      setRazonSocial(cliente.razon_social || "");
      setDireccion(cliente.direccion || "");
    } else {
      setTipoDoc("1");
      setNrodoc("");
      setRazonSocial("");
      setDireccion("");
    }
  };

  // Se ejecuta cada vez que cambia isOpen o cliente
  useMemo(() => {
    if (isOpen) resetForm();
  }, [isOpen, cliente]);

  const handleBuscarDoc = async () => {
    if (!nrodoc.trim()) return;
    setBuscando(true);
    try {
      const data = await buscarClientePorDoc(nrodoc.trim());
      setRazonSocial(data.razon_social || "");
      setDireccion(data.direccion || "");
      setTipoDoc(data.tipo_documento_id || tipoDoc);
      toast.success(data.source === "db" ? "Cliente encontrado en BD" : "Encontrado en RENIEC/SUNAT");
    } catch {
      toast("No encontrado — ingresa los datos manualmente");
    } finally {
      setBuscando(false);
    }
  };

  const createMut = useMutation({
    mutationFn: (d) =>
      toast.promise(createCliente(d), {
        loading: "Guardando...",
        success: "Cliente guardado",
        error: "Error al guardar",
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clientes"] }); onClose(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...d }) =>
      toast.promise(updateCliente(id, d), {
        loading: "Actualizando...",
        success: "Cliente actualizado",
        error: "Error al actualizar",
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clientes"] }); onClose(); },
  });

  const handleGuardar = () => {
    if (!razonSocial.trim()) { toast.error("Ingresa la razón social / nombre"); return; }
    const payload = {
      tipo_documento_id: tipoDoc,
      nrodoc: nrodoc.trim(),
      razon_social: razonSocial.trim(),
      direccion: direccion.trim() || null,
    };
    if (cliente) {
      updateMut.mutate({ id: cliente.id, ...payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg w-full md:w-[28rem] mx-auto mt-24"
      overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-50"
    >
      <h2 className="text-xl font-bold mb-4 text-center text-sky-700 dark:text-sky-400">
        {cliente ? "Editar Cliente" : "Agregar Cliente"}
      </h2>

      <div className="flex flex-col gap-3">
        {/* Nro Documento + Buscar */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Nro Documento</label>
          <div className="relative mt-1">
            <input
              type="text"
              value={nrodoc}
              onChange={(e) => setNrodoc(e.target.value.replace(/\D/g, ""))}
              placeholder="DNI (8) o RUC (11)"
              maxLength={11}
              className="border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2 w-full text-sm font-mono focus:outline-none focus:border-sky-500 pr-10"
            />
            <button
              onClick={handleBuscarDoc}
              disabled={buscando || !nrodoc.trim()}
              className="absolute right-1 top-1 p-1.5 bg-sky-700 hover:bg-sky-600 text-white rounded-md cursor-pointer transition-colors disabled:opacity-50"
              title="Buscar en RENIEC/SUNAT"
            >
              <CiSearch className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tipo Documento */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Tipo Documento</label>
          <select
            value={tipoDoc}
            onChange={(e) => setTipoDoc(e.target.value)}
            className="mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2 w-full text-sm focus:outline-none focus:border-sky-500"
          >
            {TIPO_DOC_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Razón Social */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Razón Social / Nombre</label>
          <input
            type="text"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            placeholder="Nombre completo o razón social"
            className="mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2 w-full text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Dirección */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Dirección</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Dirección fiscal o domiciliaria"
            className="mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2 w-full text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 dark:text-slate-200 rounded-md text-sm cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={handleGuardar}
          disabled={isPending}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-md text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Guardando..." : cliente ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Página principal ───────────────────────────────────────────────────────
function Clientes() {
  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes"],
    queryFn: getClientes,
  });

  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCliente, setEditingCliente] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      toast.promise(deleteCliente(id), {
        loading: "Eliminando...",
        success: "Cliente eliminado",
        error: "Error al eliminar",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clientes"] }),
  });

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) =>
        (c.razon_social || "").toLowerCase().includes(q) ||
        (c.nrodoc || "").includes(q)
    );
  }, [clientes, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleAbrirCrear = () => {
    setEditingCliente(null);
    setModalOpen(true);
  };

  const handleEdit = (c) => {
    setEditingCliente(c);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este cliente?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center px-4 md:px-10 py-4">
        <Drawer />
        <div className="text-2xl font-bold">Clientes</div>
        <button
          onClick={handleAbrirCrear}
          className="flex items-center gap-2 p-2 shadow-xs hover:text-white hover:bg-sky-700 rounded-md transition ease-in duration-300 cursor-pointer"
        >
          <FaPlus />
          Agregar Cliente
        </button>
      </div>

      <div className="px-4 md:px-10 flex justify-between items-center mb-2 gap-4">
        <span className="text-sm text-gray-500 dark:text-slate-400">
          {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2 rounded-lg w-full sm:w-72 text-sm focus:outline-none focus:border-sky-500"
        />
      </div>

      <div className="px-4 md:px-10">
        {isLoading ? (
          <div className="text-center py-10 text-sky-700 text-sm">Cargando clientes...</div>
        ) : (
          <>
            <TablaClientes data={paginated} onEdit={handleEdit} onDelete={handleDelete} />

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4 mb-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={`px-3 py-1 text-sm rounded cursor-pointer transition-colors ${
                          p === currentPage
                            ? "bg-sky-700 text-white"
                            : "bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600"
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ModalCliente
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        cliente={editingCliente}
      />
    </div>
  );
}

export default Clientes;
