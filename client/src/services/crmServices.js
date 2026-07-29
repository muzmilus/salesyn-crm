import api from './api';

export const interactionService = {
  getInteractions: (params) => api.get('/interactions', { params }),
  createInteraction: (data) => api.post('/interactions', data),
  deleteInteraction: (id) => api.delete(`/interactions/${id}`),
};

export const followUpService = {
  getFollowUps: (params) => api.get('/followups', { params }),
  createFollowUp: (data) => api.post('/followups', data),
  updateFollowUp: (id, data) => api.put(`/followups/${id}`, data),
  deleteFollowUp: (id) => api.delete(`/followups/${id}`),
};

export const taskService = {
  getTasks: (params) => api.get('/tasks', { params }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
};

export const reportService = {
  getReports: (params) => api.get('/reports', { params }),
};

export const searchService = {
  searchAll: (q) => api.get('/search', { params: { q } }),
};
