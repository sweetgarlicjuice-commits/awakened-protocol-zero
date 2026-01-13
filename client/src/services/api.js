import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('apz_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('apz_token');
      localStorage.removeItem('apz_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  getMe: () => 
    api.get('/auth/me'),
  
  // GM endpoints
  createAccount: (username, password, role = 'player') =>
    api.post('/auth/gm/create-account', { username, password, role }),
  
  getPlayers: () =>
    api.get('/auth/gm/players'),
  
  toggleAccount: (userId) =>
    api.patch(`/auth/gm/toggle-account/${userId}`)
};

// Character API
export const characterAPI = {
  getClasses: () => 
    api.get('/character/classes'),
  
  create: (name, baseClass) =>
    api.post('/character/create', { name, baseClass }),
  
  get: () =>
    api.get('/character'),
  
  allocateStats: (stats) =>
    api.post('/character/allocate-stats', { stats }),
  
  rest: () =>
    api.post('/character/rest')
};

// Tower API
export const towerAPI = {
  getInfo: () =>
    api.get('/tower/info'),
  
  enter: (towerId) =>
    api.post('/tower/enter', { towerId }),
  
  explore: () =>
    api.post('/tower/explore'),
  
  attack: (enemy) =>
    api.post('/tower/combat/attack', { enemy }),
  
  useSkill: (enemy, skillId) =>
    api.post('/tower/combat/skill', { enemy, skillId }),
  
  flee: (enemy) =>
    api.post('/tower/combat/flee', { enemy }),
  
  advance: () =>
    api.post('/tower/advance')
};

// Game info
export const gameAPI = {
  health: () => api.get('/health'),
  info: () => api.get('/info')
};

export default api;
