import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Modal from "react-modal";
import { getUnidades } from "../request/unidades";

function ModalEditaritem({ isOpen, onClose, setItems }) {
  const { data: dbUnidad } = useQuery({
    queryKey: ["unidades"],
    queryFn: getUnidades,
  });

  const [formData, setFormData] = useState({
    cantidad: "",
    descripcion: "",
    unidad: "",
    precioUnitario: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handlereset = () => {
    onClose();
    setFormData({
      cantidad: "",
      descripcion: "",
      unidad: "",
      precioUnitario: "",
    });
  };

  const handleAgregar = () => {
    if (!formData.descripcion || !formData.precioUnitario) return;
    setItems((prev) => [...prev, formData]); // agrega el nuevo item
    setFormData({
      cantidad: "",
      descripcion: "",
      unidad: "",
      precioUnitario: "",
    }); // limpia
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="p-6 rounded-md shadow-md flex justify-center items-center mt-32"
      overlayClassName="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex justify-center items-start z-50 transition-opacity"
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <div className="bg-white dark:bg-slate-900 p-6 rounded-md shadow-md w-full md:w-1/3 border dark:border-slate-800">
        <h2 className="text-xl font-bold mb-4 flex justify-center text-sky-700 dark:text-slate-100">
          Agregar nuevo item
        </h2>
        <input
          name="cantidad"
          placeholder="Cantidad"
          className="border border-gray-100 dark:border-slate-800 bg-gray-200 dark:bg-slate-950 text-black dark:text-slate-100 p-2 w-full mb-2 rounded-md focus:outline-none focus:border-sky-500 transition-colors"
          value={formData.cantidad}
          onChange={handleChange}
        />
        <input
          name="descripcion"
          placeholder="Almanaque"
          className="border border-gray-100 dark:border-slate-800 bg-gray-200 dark:bg-slate-950 text-black dark:text-slate-100 p-2 w-full mb-2 rounded-md focus:outline-none focus:border-sky-500 transition-colors"
          value={formData.descripcion}
          onChange={handleChange}
        />
        <select
          name="unidad"
          placeholder="Unidad"
          className="border border-gray-100 dark:border-slate-800 bg-gray-200 dark:bg-slate-950 text-black dark:text-slate-100 p-2 w-full mb-2 rounded-md focus:outline-none focus:border-sky-500 transition-colors"
          defaultValue={formData.unidad || "Unidades"}
          onChange={handleChange}
        >
          {dbUnidad ? (
            dbUnidad.map((unid) => (
              <option key={unid.id} value={unid.descripcion}>
                {unid.descripcion}
              </option>
            ))
          ) : (
            <option disabled>Selecciona una Opcion</option>
          )}
        </select>
        <input
          name="precioUnitario"
          placeholder="Precio"
          type="number"
          className="border border-gray-100 dark:border-slate-800 bg-gray-200 dark:bg-slate-950 text-black dark:text-slate-100 p-2 w-full mb-2 rounded-md focus:outline-none focus:border-sky-500 transition-colors"
          value={formData.precioUnitario}
          onChange={handleChange}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={handlereset}
            className="p-2 bg-gray-300 dark:bg-slate-800 hover:bg-gray-400 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-400 cursor-pointer rounded-md font-bold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregar}
            className="p-2 bg-sky-700 text-white cursor-pointer rounded-md"
          >
            Agregar
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalEditaritem;
