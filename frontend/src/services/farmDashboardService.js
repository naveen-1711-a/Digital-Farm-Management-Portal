import api from './api';

const farmDashboardService = {
  getDashboardData: async () => {
    const response = await api.get('/farm-dashboard/data');
    return response.data;
  }
};

export default farmDashboardService;
