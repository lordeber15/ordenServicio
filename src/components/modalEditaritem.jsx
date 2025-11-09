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
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <div className="bg-white p-6 rounded-md shadow-md w-full md:w-1/3">
        <h2 className="text-xl font-bold mb-4 flex justify-center text-sky-700">
          Agregar nuevo item
        </h2>
        <input
          name="cantidad"
          placeholder="Cantidad"
          className="border-0 bg-gray-200 text-black p-2 w-full mb-2 rounded-md"
          value={formData.cantidad}
          onChange={handleChange}
        />
        <input
          name="descripcion"
          placeholder="Almanaque"
          className="border-0 bg-gray-200 text-black p-2 w-full mb-2 rounded-md"
          value={formData.descripcion}
          onChange={handleChange}
        />
        <select
          name="unidad"
          placeholder="Unidad"
          className="border-0 bg-gray-200 text-black p-2 w-full mb-2 rounded-md"
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
          className="border-0 bg-gray-200 text-black p-2 w-full mb-2 rounded-md"
          value={formData.precioUnitario}
          onChange={handleChange}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={handlereset}
            className="p-2 bg-gray-300 cursor-pointer rounded-md"
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
