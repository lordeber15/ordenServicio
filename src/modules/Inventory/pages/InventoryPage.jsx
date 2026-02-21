import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaPlus } from "react-icons/fa6";
import Drawer from "../../../shared/components/drawer";
import TablaProductos from "../../../shared/components/tablaProductos";
import ModalAgregaritem from "../../../shared/components/modalAgregaritem";
import { getProducto, deleteProducto } from "../../Inventory/services/productos";
import { getUnidades } from "../../Billing/services/unidades";

function Inventario() {
  const { data: dataProducto, isLoading } = useQuery({
    queryKey: ["producto"],
    queryFn: getProducto,
  });
  const { data: dataUnidades } = useQuery({
    queryKey: ["unidades"],
    queryFn: getUnidades,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      toast.promise(deleteProducto(id), {
        loading: "Eliminando...",
        success: "Producto eliminado ✅",
        error: "Error al eliminar ❌",
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["producto"] }),
  });

  const filtered = (dataProducto || []).filter((p) =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAbrirCrear = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (p) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Eliminar este producto?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center px-4 md:px-10 py-4">
        <Drawer />
        <div className="text-2xl font-bold">Inventario</div>
        <button
          onClick={handleAbrirCrear}
          className="flex items-center gap-2 p-2 shadow-xs hover:text-white hover:bg-sky-700 rounded-md transition ease-in duration-300 cursor-pointer"
        >
          <FaPlus />
          Agregar Producto
        </button>
      </div>

      <div className="px-4 md:px-10 flex justify-end mb-2">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg w-full sm:w-64 text-sm focus:outline-none focus:border-sky-500"
        />
      </div>

      <div className="px-4 md:px-10">
        {isLoading ? (
          <div className="text-center py-10 text-sky-700 text-sm">
            Cargando productos...
          </div>
        ) : (
          <TablaProductos
            data={filtered}
            unidades={dataUnidades}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <ModalAgregaritem
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        producto={editingProduct}
      />
    </div>
  );
}

export default Inventario;
