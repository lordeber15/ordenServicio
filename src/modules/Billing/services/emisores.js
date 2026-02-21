import axiosURL from "../../../core/api/axiosURL";

export const getEmisores = async () => {
  const res = await axiosURL.get("/emisor");
  return res.data;
};

export const createEmisor = (data) => {
  return axiosURL.post("/emisor", data);
};

export const updateEmisor = (id, data) => {
  return axiosURL.put(`/emisor/${id}`, data);
};

export const uploadEmisorLogo = (id, file) => {
  const formData = new FormData();
  formData.append("logo", file);
  return axiosURL.put(`/emisor/${id}/logo`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
