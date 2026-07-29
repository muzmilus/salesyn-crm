import api from './api';

export const leadService = {
  getLeads: (params) => api.get('/leads', { params }),
  getLeadById: (id) => api.get(`/leads/${id}`),
  createLead: (data) => api.post('/leads', data),
  updateLead: (id, data) => api.put(`/leads/${id}`, data),
  deleteLead: (id) => api.delete(`/leads/${id}`),
  updateStatus: (id, status) => api.patch(`/leads/${id}/status`, { status }),
  assignLead: (id, assignedToId) => api.patch(`/leads/${id}/assign`, { assignedToId }),
  convertLead: (id, data) => api.post(`/leads/${id}/convert`, data),
};
