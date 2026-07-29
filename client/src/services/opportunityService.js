import api from './api';

export const opportunityService = {
  getOpportunities: (params) => api.get('/opportunities', { params }),
  getPipeline: (params) => api.get('/opportunities/pipeline', { params }),
  getOpportunityById: (id) => api.get(`/opportunities/${id}`),
  createOpportunity: (data) => api.post('/opportunities', data),
  updateOpportunity: (id, data) => api.put(`/opportunities/${id}`, data),
  updateStage: (id, stage, probability) => api.patch(`/opportunities/${id}/stage`, { stage, probability }),
  deleteOpportunity: (id) => api.delete(`/opportunities/${id}`),
};
