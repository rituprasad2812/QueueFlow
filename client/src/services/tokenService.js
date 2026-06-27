import api from "./api";

const tokenService = {
  joinQueue: async (data) => {
    const response = await api.post("/tokens/join", data);
    return response.data;
  },

  trackToken: async (tokenId) => {
    const response = await api.get(`/tokens/track/${tokenId}`);
    return response.data;
  },

  cancelToken: async (tokenId) => {
    const response = await api.put(`/tokens/${tokenId}/cancel`);
    return response.data;
  },

  getQueueTokens: async (queueId) => {
    const response = await api.get(`/tokens/queue/${queueId}`);
    return response.data;
  },

  callToken: async (tokenId, counterId) => {
    const response = await api.put(`/tokens/${tokenId}/call`, { counterId });
    return response.data;
  },

  serveToken: async (tokenId) => {
    const response = await api.put(`/tokens/${tokenId}/serve`);
    return response.data;
  },

  completeToken: async (tokenId) => {
    const response = await api.put(`/tokens/${tokenId}/complete`);
    return response.data;
  },

  noShowToken: async (tokenId) => {
    const response = await api.put(`/tokens/${tokenId}/no-show`);
    return response.data;
  },

  getNextToken: async (queueId) => {
    const response = await api.get(`/tokens/next/${queueId}`);
    return response.data;
  },
};

export default tokenService;