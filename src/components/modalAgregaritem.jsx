import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { getUnidades } from "../request/unidades";
import { createProducto, updateProducto } from "../request/productos";

const TIPOS_AFECTACION = [
  { id: "10", label: "Gravado (IGV 18%)" },
  { id: "20", label: "Exonerado" },
  { id: "30", label: "Inafecto" },
];

/**
 * Modal CRUD para productos del inventario.
 *
 * @param {boolean} isOpen - Visibilidad del modal.
 * @param {Function} onClose - Cerrar el modal.
 * @param {Object|null} producto - null para crear, objeto para editar.
 */
function ModalAgregaritem({ isOpen, onClose, producto }) {
  const { data: unidades = [] } = useQuery({
    queryKey: ["unidades"],
    queryFn: getUnidades,
  });

  const [nombre, setNombre] = useState("");
  const [precioConIgv, setPrecioConIgv] = useState("");
  const [stock, setStock] = useState("0");
  const [unidadId, setUnidadId] = useState("NIU");
  const [tipoAfectacion, setTipoAfectacion] = useState("10");
  const [esServicio, setEsServicio] = useState(false);

  const queryClient = useQueryClient();

  // Pre-cargar datos al abrir en modo edición
  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre || "");
      const base = parseFloat(producto.valor_unitario || 0);
      setPrecioConIgv(base.toFixed(2));
      setStock(String(producto.stock ?? 0));
      setUnidadId(producto.unidad_id || "NIU");
      setTipoAfectacion(producto.tipo_afectacion_id || "10");
      setEsServicio(producto.es_servicio || false);
    } else {
      setNombre("");
      setPrecioConIgv("");
      setStock("0");
      setUnidadId(unidades[0]?.id || "NIU");
      setTipoAfectacion("10");
      setEsServicio(false);
    }
  }, [producto, isOpen]);

  const buildPayload = () => {
    const precio = parseFloat(precioConIgv);
    const valorUnitario = precio.toFixed(6);
    return {
      nombre: nombre.trim(),
      valor_unitario: valorUnitario,
      stock: esServicio ? 0 : (parseInt(stock, 10) || 0),
      unidad_id: unidadId,
      tipo_afectacion_id: tipoAfectacion,
      es_servicio: esServicio,
    };
  };

  const onSuccessHandler = () => {
    queryClient.invalidateQueries({ queryKey: ["producto"] });
    onClose();
  };

  const createMutation = useMutation({
    mutationFn: (data) =>
      toast.promise(createProducto(data), {
        loading: "Guardando...",
        success: "Producto guardado ✅",
        error: "Error al guardar ❌",
      }),
    onSuccess: onSuccessHandler,
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      toast.promise(updateProducto(data), {
        loading: "Actualizando...",
        success: "Producto actualizado ✅",
        error: "Error al actualizar ❌",
      }),
    onSuccess: onSuccessHandler,
  });

  const handleGuardar = () => {
    if (!nombre.trim()) { toast.error("Ingresa el nombre del producto"); return; }
    if (!precioConIgv || parseFloat(precioConIgv) <= 0) { toast.error("Ingresa un precio válido"); return; }

    const payload = buildPayload();
    if (producto) {
      updateMutation.mutate({ id: producto.id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg w-full md:w-96 mx-auto mt-24"
      overlayClassName="fixed inset-0 bg-black/50 flex justify-center items-start z-50"
    >
      <h2 className="text-xl font-bold mb-4 text-center text-sky-700 dark:text-sky-400">
        {producto ? "Editar Producto" : "Agregar Producto"}
      </h2>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Almanaque A4 full color"
            className="mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2 w-full text-sm focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Precio con IGV (S/)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={precioConIgv}
            onChange={(e) => setPrecioConIgv(e.target.value)}
            placeholder="0.00"
            className="mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2 w-full text-sm focus:outline-none focus:border-sky-500"
          />
          {precioConIgv && tipoAfectacion === "10" && (
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
              Sin IGV: S/ {(parseFloat(precioConIgv) / 1.18).toFixed(2)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 py-1">
          <input
            type="checkbox"
            id="esServicio"
            checked={esServicio}
            onChange={(e) => setEsServicio(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 cursor-pointer"
          />
          <label htmlFor="esServicio" className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer select-none">
            Es un servicio <span className="text-gray-400 dark:text-slate-500 font-normal">(sin stock físico)</span>
          </label>
        </div>

        {!esServicio && (
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Stock</label>
            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2 w-full text-sm focus:outline-none focus:border-sky-500"
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Unidad de Medida</label>
          <select
            value={unidadId}
            onChange={(e) => setUnidadId(e.target.value)}
            className="mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2 w-full text-sm focus:outline-none focus:border-sky-500"
          >
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.descripcion}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Tipo de Afectación IGV</label>
          <select
            value={tipoAfectacion}
            onChange={(e) => setTipoAfectacion(e.target.value)}
            className="mt-1 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-md p-2 w-full text-sm focus:outline-none focus:border-sky-500"
          >
            {TIPOS_AFECTACION.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
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
          {isPending ? "Guardando..." : producto ? "Actualizar" : "Guardar"}
        </button>
      </div>
    </Modal>
  );
}

export default ModalAgregaritem;
