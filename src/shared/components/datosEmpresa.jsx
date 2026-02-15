import logo from "../../assets/ALEXANDER.webp";

function DatosEmpresa() {
  return (
    <div className="flex w-full items-center flex-col md:flex-row">
      <div className="p-2 flex justify-center items-center gap-3 w-full flex-col md:flex-row">
        <img
          src={logo}
          alt="logo"
          className="h-20 w-20 md:h-34 md:w-34 flex justify-center gap-2 items-center bg-cover"
        />
        <div className="flex items-center flex-col justify-center">
          <h1 className="text-lg font-bold">
            Distribuidora Imprenta Alexander E.I.R.L.
          </h1>
          <p className="text-xs font-bold">
            Jr.Bellido 579 Huamanga - Ayacucho - Huamanga
          </p>
          <p className="text-xs text-center">
            Impresiones Offet, Diseño Publicitario, Afiches, Revistas,
            Tripticos, Etiquetas, Almanaques.
          </p>
          <p className="text-xs font-black">CEL: 927840716</p>
        </div>
      </div>
    </div>
  );
}

export default DatosEmpresa;
