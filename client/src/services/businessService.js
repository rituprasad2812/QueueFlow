import api from "./api";

const businessService = {
  getBusiness: async () => {
    const response = await api.get("/business");
    return response.data;
  },

  updateBusiness: async (data) => {
    const response = await api.put("/business", data);
    return response.data;
  },
};

export default businessService;