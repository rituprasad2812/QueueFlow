import api from "./api";

const queueService = {
  createQueue: async (data) => {
    const response = await api.post("/queues", data);
    return response.data;
  },

  getQueues: async () => {
    const response = await api.get("/queues");
    return response.data;
  },

  getQueue: async (id) => {
    const response = await api.get(`/queues/${id}`);
    return response.data;
  },

  updateQueue: async (id, data) => {
    const response = await api.put(`/queues/${id}`, data);
    return response.data;
  },

  deleteQueue: async (id) => {
    const response = await api.delete(`/queues/${id}`);
    return response.data;
  },

  updateQueueStatus: async (id, status) => {
    const response = await api.put(`/queues/${id}/status`, { status });
    return response.data;
  },
};

export default queueService;