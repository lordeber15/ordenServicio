import Modal from "react-modal";
import { IoIosClose } from "react-icons/io";
import { useState } from "react";
function ModalAgregaritem({ isOpen, onClose }) {
  const [operacionSelect, setOperacionSelesct] = useState("");
  const [cambioPu, setCambioPu] = useState("");
  const manejadorCambio = (event) => {
    setOperacionSelesct(event.target.value);
  };
  const changecambioPu = (e) => {
    setCambioPu(e.target.value);
  };

  const handleBlur = (e) => {
    const value = e.target.value;
    if (value.includes(".")) {
      const [integerPart, decimalPart] = value.split(".");
      if (decimalPart.length === 0) {
        setCambioPu(`${integerPart}.00`);
      } else if (decimalPart.length === 1) {
        setCambioPu(`${integerPart}.${decimalPart}0`);
      }
    } else {
      setCambioPu(`${value}.00`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="bg-white w-1/2 p-6 rounded-md shadow-md max-w-md mx-auto mt-20"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
    >
      <div className=" flex justify-between gap-2">
        <div></div>
        <select
          className="text-lg font-semibold mb-4"
          value={operacionSelect}
          onChange={manejadorCambio}
        >
          <option value="Ope. Gravada"> Operacion Grabada</option>
          <option value="Exportación"> Exportación</option>
        </select>
        <button
          onClick={onClose}
          className="bg-white w-fit h-fit scale-120 rounded hover:bg-gray-200 flex cursor-pointer justify-end "
        >
          <IoIosClose />
        </button>
      </div>
      <div className=" flex flex-col gap-2">
        <div className="flex gap-2 pb-2">
          <select name="unidad" id="unidad" className="p-2 w-1/2">
            <option value="unidades">Unidad</option>
            <option value="unidades">Servicios</option>
            <option value="unidades">Baldes</option>
          </select>
          <input
            type="text"
            placeholder="Codigo (Opcional)"
            className="p-2 w-full bg-gray-200 rounded-lg"
          />
        </div>
      </div>
      <div className="flex">
        <div className=" w-full flex justify-end flex-col gap-2">
          <input
            type="text"
            placeholder="Descripcion"
            className="p-2 bg-gray-200 rounded-lg"
          />
          <div className="flex">
            <div className="p-2 w-1/2 text-right">Valor Unitario</div>
            <input
              type="text"
              placeholder="Valor Unitario"
              className=" w-full p-2 bg-gray-200 rounded-lg text-right"
              value={(cambioPu / 1.18).toFixed([3])}
            />
          </div>

          <div className="flex">
            <div className="p-2 w-1/2 text-right">IGV 18%</div>
            <input
              className="w-full p-2 text-right bg-gray-200 rounded-lg"
              type="text"
              disabled
              value={((cambioPu / 1.18) * 0.18).toFixed([3])}
            />
          </div>
          <div className="flex">
            <div className="p-2 w-1/2 text-right">Precio Unitario</div>
            <input
              type="text"
              placeholder="Precio unitario"
              className=" w-full p-2 bg-gray-200 rounded-lg text-right"
              onChange={changecambioPu}
              onBlur={handleBlur}
            />
          </div>
        </div>
      </div>
      <hr className="my-3 h-0.5 border-t-0 bg-gray-200" />
      <div className="w-full gap-2 flex flex-col">
        <div className="flex flex-row items-center">
          <label className="w-1/2 text-right pr-2">
            {operacionSelect ? operacionSelect : "Ope. Gravada"}
          </label>
          <input
            type="text"
            disabled
            className="p-2 w-full text-right bg-gray-200 rounded-lg"
            value={(cambioPu / 1.18).toFixed([2])}
          />
        </div>
        <div className="flex flex-row items-center">
          <label className="w-1/2 text-right pr-2"> IGV</label>
          <input
            disabled
            type="text"
            className="p-2 w-full text-right bg-gray-200 rounded-lg"
            value={((cambioPu / 1.18) * 0.18).toFixed([2])}
          />
        </div>
        <div className="flex flex-row items-center">
          <label className="w-1/2 text-right pr-2"> Importe Total</label>
          <input
            disabled
            type="text"
            className="p-2 w-full text-right bg-gray-200 rounded-lg"
            value={cambioPu}
          />
        </div>
      </div>
      <div className="flex  pt-2 gap-2">
        <button
          onClick={() => {
            onClose();
            setCambioPu("0");
          }}
          className="p-2 w-1/2 bg-red-400 rounded-md text-white cursor-pointer"
        >
          Cancelar
        </button>
        <button className="p-2 w-1/2 bg-sky-700 rounded-md text-white cursor-pointer">
          Agregar
        </button>
      </div>
    </Modal>
  );
}

export default ModalAgregaritem;
