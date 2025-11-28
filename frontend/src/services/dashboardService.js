import api from './api';

const dashboardService = {
  // Get comprehensive dashboard statistics
  getStats: async () => {
    const response = await api.get('/dashboard/equipos-por-estado');
    return response.data;
  },

  // Get assets by status
  getAssetsByStatus: async () => {
    const response = await api.get('/dashboard/equipos-por-estado');
    return response.data;
  },

  // Get assets by category
  getAssetsByCategory: async () => {
    const response = await api.get('/dashboard/equipos-por-categoria');
    return response.data;
  },

  // Get assets by department
  getAssetsByDepartment: async () => {
    const response = await api.get('/dashboard/equipos-por-almacen');
    return response.data;
  },

  // Get overdue assignments
  getOverdueAssignments: async () => {
    const response = await api.get('/dashboard/asignaciones-vencidas');
    return response.data;
  },

  // Get upcoming warranties
  getUpcomingWarranties: async () => {
    const response = await api.get('/dashboard/garantias-por-vencer');
    return response.data;
  },

  // Get inventory value
  getInventoryValue: async () => {
    const response = await api.get('/dashboard/valor-inventario');
    return response.data;
  },

  // Get summary
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  // Get recent entries
  getRecentEntries: async () => {
    const response = await api.get('/dashboard/ultimas-entradas');
    return response.data;
  },

  // Get recent assignments  
  getRecentAssignments: async () => {
    const response = await api.get('/dashboard/ultimas-asignaciones');
    return response.data;
  }
};

export default dashboardService;
