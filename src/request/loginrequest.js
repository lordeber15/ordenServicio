import axiosURL from "./axiosURL";

export const getLogin = async () => {
  const res = await axiosURL.get("/login");
  return res.data;
};

export const createLogin = (login) => {
  return axiosURL.post("/login", login);
};

export const updateLogin = (login) => {
  const serviciosCopy = { ...login };
  delete serviciosCopy.id;
  return axiosURL.put(`/login/${login.id}`, serviciosCopy);
};

export const deleteLogin = (id) => {
  return axiosURL.delete(`/login/${id}`);
};
