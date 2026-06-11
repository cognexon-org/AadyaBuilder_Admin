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
  notificationUnreadCount: () => api.get('/notifications/unread-count'),
  markNotificationRead: (id) => api.patch(`/notifications/${id}/read`, {}),
  markAllNotificationsRead: () => api.patch('/notifications/read-all', {}),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),

  // Mobile homepage / discovery APIs added for the app screens
  home: (params) => api.get('/home', params),
  homeOfferings: () => api.get('/home/offerings'),

  projects: (params) => api.get('/projects', params),
  recommendedProjects: (params) => api.get('/projects/recommended', params),
  popularProjects: (params) => api.get('/projects/popular', params),
  projectDetails: (id) => api.get(`/projects/${id}`),
  createProject: (payload) => api.post('/projects', payload),
  updateProject: (id, payload) => api.put(`/projects/${id}`, payload),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  verifyProject: (id, payload) => api.patch(`/projects/${id}/verify`, payload),
  featureProject: (id, payload) => api.patch(`/projects/${id}/feature`, payload),

  builders: (params) => api.get('/builders/popular', params),
  builderDetails: (id) => api.get(`/builders/${id}`),
  builderProjects: (id, params) => api.get(`/builders/${id}/projects`, params),
  builderProperties: (id, params) => api.get(`/builders/${id}/properties`, params),
  verifyBuilder: (id, payload) => api.patch(`/admin/users/${id}/verify`, payload || {}),

  popularCities: (params) => api.get('/locations/popular-cities', params),
  cityDetails: (city) => api.get(`/locations/cities/${encodeURIComponent(city)}`),
  recommendedLocalities: (params) => api.get('/localities/recommended', params),
  localityDetails: (city, locality) => api.get(`/localities/${encodeURIComponent(city)}/${encodeURIComponent(locality)}`),
  localityInsights: (city, locality) => api.get(`/localities/${encodeURIComponent(city)}/${encodeURIComponent(locality)}/insights`),
  topGainers: (params) => api.get('/insights/top-gainers', params),
  propertyTypeStats: (params) => api.get('/properties/stats/types', params),
  bhkStats: (params) => api.get('/properties/stats/bhk', params),
  postedByStats: (params) => api.get('/properties/stats/posted-by', params),
  insightTools: () => api.get('/insights/tools'),

  feedback: (params) => api.get('/feedback/admin', params),
  myFeedback: () => api.get('/feedback/my-feedback'),
  feedbackStats: (params) => api.get('/feedback/admin/stats', params),
  updateFeedbackStatus: (id, payload) => api.patch(`/feedback/admin/${id}/status`, payload),
  deleteFeedback: (id) => api.delete(`/feedback/admin/${id}`),

  shorts: (params) => api.get('/shorts/admin', params),
  shortsFeed: (params) => api.get('/shorts/feed', params),
  shortDetails: (id) => api.get(`/shorts/${id}`),
  createShort: (payload) => api.post('/shorts', payload),
  updateShort: (id, payload) => api.put(`/shorts/${id}`, payload),
  updateShortStatus: (id, payload) => api.patch(`/shorts/${id}/status`, payload),
  deleteShort: (id) => api.delete(`/shorts/${id}`),

  boostPlans: () => api.get('/boost/plans'),
  createBoostPlan: (payload) => api.post('/boost/plans', payload),
  updateBoostPlan: (id, payload) => api.put(`/boost/plans/${id}`, payload),
  toggleBoostPlan: (id) => api.patch(`/boost/plans/${id}/toggle`, {}),
  boostOrders: (params) => api.get('/boost/orders', params),
  boostProperty: (propertyId, payload) => api.post(`/properties/${propertyId}/boost`, payload),
  boostStatus: (propertyId) => api.get(`/properties/${propertyId}/boost-status`)
};
