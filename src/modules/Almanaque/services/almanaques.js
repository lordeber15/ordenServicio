import axiosURL from "../../../core/api/axiosURL";

export const getAlmanaque = async () => {
  const res = await axiosURL.get("/almanaque");
  return res.data;
};

export const getAlmanaqueById = async (id) => {
  const res = await axiosURL.get(`/almanaque/${id}`);
  return res.data;
};

export const createAlmanaque = (almanaque) => {
  return axiosURL.post("/almanaque", almanaque);
};

// export const updateAlmanaque = (almanaque) => {
//   const almanaqueCopy = { ...almanaque };
//   delete almanaqueCopy.id;
//   return axiosURL.put(`/almanaque/${almanaque.id}`, almanaqueCopy);
// };

// ✅ update con firma (id, almanaque)
export const updateAlmanaque = (id, almanaque) => {
  return axiosURL.put(`/almanaque/${id}`, almanaque);
};

export const deleteAlmanaque = (id) => {
  return axiosURL.delete(`/almanaque/${id}`);
};
