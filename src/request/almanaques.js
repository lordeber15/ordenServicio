import axiosURL from "./axiosURL";

export const getAlmanaque = async () => {
  const res = await axiosURL.get("/almanaque");
  return res.data;
};

export const createAlmanaque = (almanaque) => {
  return axiosURL.post("/almanaque", almanaque);
};

export const updateAlmanaque = (almanaque) => {
  const almanaqueCopy = { ...almanaque };
  delete almanaqueCopy.id;
  return axiosURL.put(`/Almanaque/${almanaque.id}`, almanaqueCopy);
};

export const deleteAlmanaque = (id) => {
  return axiosURL.delete(`/almanaque/${id}`);
};
