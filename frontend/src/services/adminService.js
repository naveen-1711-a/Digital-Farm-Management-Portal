import api from './api';

const adminService = {
  getPendingApprovals: async () => {
    const response = await api.get('/admin/pending-approvals');
    return response.data;
  },

  approveFarm: async (id) => {
    const response = await api.put(`/admin/approve-farm/${id}`);
    return response.data;
  },

  rejectFarm: async (id) => {
    const response = await api.put(`/admin/reject-farm/${id}`);
    return response.data;
  }
};

export default adminService;
