import api from "./api";

const staffService = {
  createStaff: async (data) => {
    const response = await api.post("/staff", data);
    return response.data;
  },

  getStaff: async () => {
    const response = await api.get("/staff");
    return response.data;
  },

  deleteStaff: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  },
};

export default staffService;