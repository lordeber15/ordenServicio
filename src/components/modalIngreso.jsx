import Modal from "react-modal";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIngresos } from "../request/ingresosrequest";
import { createEgresos } from "../request/egresosrequest";
import { useState } from "react";

function ModalIngreso({ isOpen, onClose, titulo }) {
  const [valueDescripcion, setValueDescricion] = useState("");
  const [valueMonto, setValueMonto] = useState("");
  const [valueMetodo, setValueMetodo] = useState("");
  const queryClient = useQueryClient();

  const handlerReset = () => {
    setValueDescricion("");
    setValueMonto("");
    setValueMetodo("");
  };

  const addIngresosMutation = useMutation({
    mutationFn: createIngresos,
    onSuccess: () => {
      queryClient.invalidateQueries(["ingresos"]); // 🔹 la misma key que usa tu tabla ingresos
      handlerReset();
      onClose(); // 🔹 cierra el modal
    },
  });

  const addEgresosMutation = useMutation({
    mutationFn: createEgresos,
    onSuccess: () => {
      queryClient.invalidateQueries(["egresos"]); // 🔹 la misma key que usa tu tabla egresos
      handlerReset();
      onClose(); // 🔹 cierra el modal
    },
  });

  const handleSave = () => {
    if (!valueDescripcion || !valueMonto || !valueMetodo) {
      console.log("Todos los campos son obligatorios");
      return;
    }

    if (titulo === "Ingreso") {
      addIngresosMutation.mutate({
        descripcion: valueDescripcion,
        monto: valueMonto,
        metodo: valueMetodo,
      });
    } else {
      addEgresosMutation.mutate({
        descripcion: valueDescripcion,
        monto: valueMonto,
        metodo: valueMetodo,
      });
    }
  };
  const isSaving =
    addIngresosMutation.isPending || addEgresosMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="bg-white dark:bg-slate-900 w-1/2 p-6 rounded-md shadow-md max-w-md mx-auto mt-15 border dark:border-slate-800"
      overlayClassName="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex justify-center items-start z-50 transition-opacity"
      style={{ overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" } }}
    >
      <div className="pb-2">
        <div className="flex justify-between p-2">
          <div></div>
          <h2 className="text-2xl text-sky-800 dark:text-slate-100 font-bold">
            {titulo === "Ingreso" ? "Ingreso" : "Egreso"}
          </h2>
          <button
            className="text-sky-800 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-800 p-2 rounded-lg cursor-pointer transition-colors"
            onClick={onClose}
          >
            <IoCloseSharp />
          </button>
        </div>
        <div className="flex gap-2 flex-col">
          <input
            type="text"
            placeholder="Descripción"
            value={valueDescripcion}
            className="w-full p-2 text-sky-800 dark:text-slate-200 bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-md font-bold focus:outline-none focus:border-sky-500 transition-colors"
            onChange={(e) => setValueDescricion(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Monto"
              value={valueMonto}
              className="w-full p-2 text-sky-800 dark:text-slate-200 bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-md font-bold focus:outline-none focus:border-sky-500 transition-colors"
              onChange={(e) => setValueMonto(e.target.value)}
            />
            <select
              className="w-full p-2 text-sky-800 dark:text-slate-200 bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-md font-bold focus:outline-none focus:border-sky-500 transition-colors"
              value={valueMetodo}
              onChange={(e) => setValueMetodo(e.target.value)}
            >
              <option value="">Seleccione método</option>
              <option value="yape">Yape</option>
              <option value="efectivo">Efectivo</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="w-1/2 p-2 cursor-pointer flex justify-center text-white bg-red-400 font-bold rounded-lg"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`w-1/2 p-2 cursor-pointer flex justify-center text-white font-bold rounded-lg ${
            isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-sky-700 hover:bg-sky-800"
          }`}
        >
          {isSaving ? "Guardando..." : `Guardar ${titulo}`}
        </button>
      </div>
    </Modal>
  );
}

export default ModalIngreso;
