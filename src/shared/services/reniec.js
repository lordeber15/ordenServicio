import axiosURL from "../../core/api/axiosURL";

export const getReniec = async (dni) => {
  const res = await axiosURL.get(`api/reniec/${dni}`);
  return res.data;
};
