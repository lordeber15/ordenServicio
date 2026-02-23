import qz from "qz-tray";
import axiosURL from "../../core/api/axiosURL";

// 1. Indicar a QZ Tray que usaremos el algoritmo seguro SHA512 (Debe coincidir con Node.js backend)
qz.security.setSignatureAlgorithm("SHA512");

// 2. Promesa para obtener el certificado público
qz.security.setCertificatePromise((resolve, reject) => {
  axiosURL.get("/api/qz/certificate", { responseType: "text" })
    .then(r => resolve(String(r.data).trim())) // CRÍTICO: Eliminar espacios o saltos de línea al final
    .catch(reject);
});

// 3. Promesa para obtener la firma digital de la petición a enviar
qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
  axiosURL.post("/api/qz/sign", { toSign }, { responseType: "text" })
    .then(r => resolve(String(r.data).trim())) // CRÍTICO: Eliminar espacios o saltos de línea al final
    .catch(reject);
});

// Exportar la instancia pre-configurada para que otros archivos la usen directamente
export default qz;
