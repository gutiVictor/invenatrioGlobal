import api from './api';

const assetService = {
  // Get all assets with optional filtering
  getAssets: async (params) => {
    const response = await api.get('/assets', { params });
    return response.data;
  },

  // Get single asset by ID
  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return response.data;
  },

  // Create new asset
  createAsset: async (data) => {
    const response = await api.post('/assets', data);
    return response.data;
  },

  // Update existing asset
  updateAsset: async (id, data) => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data;
  },

  // Delete asset
  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  // Assign asset to employee
  assignAsset: async (id, data) => {
    const response = await api.post(`/assets/${id}/assign`, data);
    return response.data;
  },

  // Return asset from employee
  returnAsset: async (id, data) => {
    const response = await api.post(`/assets/${id}/return`, data);
    return response.data;
  },

  // Update existing assignment
  updateAssignment: async (assignmentId, data) => {
    const response = await api.put(`/assets/assignments/${assignmentId}`, data);
    return response.data;
  }
};

export default assetService;
