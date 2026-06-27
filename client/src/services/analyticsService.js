import api from "./api";

const analyticsService = {
  getOverview: async () => {
    const response = await api.get("/analytics/overview");
    return response.data;
  },

  getPeakHours: async () => {
    const response = await api.get("/analytics/peak-hours");
    return response.data;
  },

  getWeeklyStats: async () => {
    const response = await api.get("/analytics/weekly");
    return response.data;
  },
};

export default analyticsService;