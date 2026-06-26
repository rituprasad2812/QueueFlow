import api from "./api";

const counterService = {
  createCounter: async (data) => {
    const response = await api.post("/counters", data);
    return response.data;
  },

  getCounters: async () => {
    const response = await api.get("/counters");
    return response.data;
  },

  updateCounter: async (id, data) => {
    const response = await api.put(`/counters/${id}`, data);
    return response.data;
  },

  deleteCounter: async (id) => {
    const response = await api.delete(`/counters/${id}`);
    return response.data;
  },
};

export default counterService;