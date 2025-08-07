import axios from "axios";

const loginApi = axios.create({
  baseURL: "http://localhost/api/reniec/",
});
export const getReniec = async (dni) => {
  const token = "apis-token-16299.1l9ndIMxkIIiHfeLTQiTF8cxGNvDoFkt";
  try {
    const res = await loginApi.get(`${dni}`, {
      headers: {
        Authorization: `Bearer ${token}`, // 👈 Token en el header
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error al obtener Datos:", error);
    throw error;
  }
};
