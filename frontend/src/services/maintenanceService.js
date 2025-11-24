import api from './api';

const maintenanceService = {
  // Get all maintenances with optional filtering
  getMaintenances: async (params) => {
    const response = await api.get('/maintenance', { params });
    return response.data;
  },

  // Create new maintenance record
  createMaintenance: async (data) => {
    const response = await api.post('/maintenance', data);
    return response.data;
  },

  // Update maintenance record
  updateMaintenance: async (id, data) => {
    const response = await api.put(`/maintenance/${id}`, data);
    return response.data;
  }
};

export default maintenanceService;
