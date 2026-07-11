import client from './client';

// Auth endpoints
export const auth = {
  getLoginUrl: () => client.get('/auth/login'),
  getCurrentUser: () => client.get('/auth/me'),
  logout: () => client.post('/auth/logout'),
};

// Profile endpoints
export const profiles = {
  getAll: () => client.get('/profiles'),
  getById: (id: string) => client.get(`/profiles/${id}`),
  analyze: (id: string) => client.post(`/profiles/${id}/analyze`),
};

// Permission Set endpoints
export const permsets = {
  getAll: () => client.get('/permsets'),
  getById: (id: string) => client.get(`/permsets/${id}`),
  search: (query: string) => client.get(`/permsets/search/${query}`),
};
