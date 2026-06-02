import { api, apiRequest } from './client';

export const adminApi = {
  login: (payload) => api.post('/auth/login', payload, { skipAuth: true }),
  me: () => api.get('/auth/me'),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),

  dashboard: (params) => api.get('/admin/dashboard', params),
  health: () => api.get('/admin/health'),
  subscriptionAnalytics: () => api.get('/admin/subscription-analytics'),
  exportReport: (type, params) => apiRequest(`/admin/export/${type}`, { params, raw: params?.format === 'csv' }),

  users: (params) => api.get('/admin/users', params),
  userDetails: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, payload) => api.patch(`/admin/users/${id}/status`, payload),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  verifyUser: (id) => api.patch(`/admin/users/${id}/verify`, {}),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  allProperties: (params) => api.get('/properties/admin/all', params),
  pendingProperties: (params) => api.get('/admin/properties/pending', params),
  propertyDetails: (id) => api.get(`/properties/${id}`),
  verifyProperty: (id, payload) => api.patch(`/admin/properties/${id}/verify`, payload),
  featureProperty: (id, payload) => api.patch(`/admin/properties/${id}/feature`, payload),
  deleteProperty: (id) => api.delete(`/admin/properties/${id}`),

  leads: (params) => api.get('/admin/leads', params),

  plans: () => api.get('/admin/plans'),
  createPlan: (payload) => api.post('/admin/plans', payload),
  updatePlan: (id, payload) => api.put(`/admin/plans/${id}`, payload),
  togglePlan: (id) => api.patch(`/admin/plans/${id}/toggle`, {}),

  settings: () => api.get('/admin/settings'),
  updateSettings: (payload) => api.put('/admin/settings', payload),
  clearCache: (payload) => api.post('/admin/cache/clear', payload),

  articles: (params) => api.get('/content/admin/articles', params),
  article: (idOrSlug) => api.get(`/content/articles/${idOrSlug}`, { view: false }),
  createArticle: (payload) => api.post('/content/articles', payload),
  updateArticle: (id, payload) => api.put(`/content/articles/${id}`, payload),
  deleteArticle: (id) => api.delete(`/content/articles/${id}`),
  publishArticle: (id) => api.patch(`/content/admin/articles/${id}/publish`, {}),
  archiveArticle: (id) => api.patch(`/content/admin/articles/${id}/archive`, {}),
  categories: () => api.get('/content/categories'),

  broadcastNotification: (payload) => api.post('/notifications/broadcast', payload),
  propertyRecommendation: (payload) => api.post('/notifications/recommendation', payload),
  notifications: (params) => api.get('/notifications', params),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/read`, {})
};
