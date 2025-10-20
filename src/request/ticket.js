import axiosURL from "./axiosURL";

export const getTicket = async () => {
  const res = await axiosURL.get("/ticket");
  return res.data;
};

export const createTicket = (ticket) => {
  return axiosURL.post("/ticket", ticket);
};

export const updateTicket = (ticket) => {
  const ticketCopy = { ...ticket };
  delete ticketCopy.id;
  return axiosURL.put(`/ticket/${ticket.id}`, ticketCopy);
};

export const deleteTicket = (id) => {
  return axiosURL.delete(`/ticket/${id}`);
};
