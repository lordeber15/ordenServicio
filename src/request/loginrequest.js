import axios from "axios";

const loginApi = axios.create({
  baseURL: "https://imprenta-imprenta-a2bsyh-c1440d-62-171-181-168.traefik.me/",
});
export const getLogin = async () => {
  const res = await loginApi.get("/login");
  return res.data;
};

export const createLogin = (login) => {
  return loginApi.post("/login", login);
};

export const updateLogin = (login) => {
  const serviciosCopy = { ...login };
  delete serviciosCopy.id;
  return loginApi.put(`/login/${login.id}`, serviciosCopy);
};

export const deleteLogin = (id) => {
  return loginApi.delete(`/login/${id}`);
};
