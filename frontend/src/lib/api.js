import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('borrowbox_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('borrowbox_token');
      localStorage.removeItem('borrowbox_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// API Helpers
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  demoAccounts: () => api.get('/auth/demo-accounts'),
};

export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getFeatured: () => api.get('/items/featured'),
  getById: (id) => api.get(`/items/${id}`),
  getMyItems: () => api.get('/items/my-items'),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  delete: (id) => api.delete(`/items/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
};

export const borrowAPI = {
  getAll: (params) => api.get('/borrow-requests', { params }),
  getById: (id) => api.get(`/borrow-requests/${id}`),
  create: (data) => api.post('/borrow-requests', data),
  updateStatus: (id, data) => api.put(`/borrow-requests/${id}/status`, data),
  delete: (id) => api.delete(`/borrow-requests/${id}`),
};

export const wishlistAPI = {
  getAll: () => api.get('/wishlist'),
  add: (itemId) => api.post(`/wishlist/${itemId}`),
  remove: (itemId) => api.delete(`/wishlist/${itemId}`),
  check: (itemId) => api.get(`/wishlist/check/${itemId}`),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const reviewsAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data),
};

export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
  adminStats: () => api.get('/dashboard/admin'),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile/update', data),
};
