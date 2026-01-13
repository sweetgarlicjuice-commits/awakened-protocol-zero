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
  
  choosePath: (choice) =>
    api.post('/tower/choose-path', { choice }),
  
  attack: (enemy) =>
    api.post('/tower/combat/attack', { enemy }),
  
  useSkill: (enemy, skillId) =>
    api.post('/tower/combat/skill', { enemy, skillId }),
  
  flee: (enemy) =>
    api.post('/tower/combat/flee', { enemy }),
  
  usePotion: (potionType) =>
    api.post('/tower/use-potion', { potionType }),
  
  getFloorRequirements: () =>
    api.get('/tower/floor-requirements'),
  
  advance: () =>
    api.post('/tower/advance'),
  
  leave: () =>
    api.post('/tower/leave'),
  
  getHiddenClasses: () =>
    api.get('/tower/hidden-classes'),
  
  unlockHiddenClass: (scrollId) =>
    api.post('/tower/unlock-hidden-class', { scrollId }),
  
  removeHiddenClass: () =>
    api.post('/tower/remove-hidden-class'),
  
  craft: (recipeId) =>
    api.post('/tower/craft', { recipeId })
};

// GM API
export const gmAPI = {
  getPlayer: (userId) =>
    api.get(`/gm/player/${userId}`),
  
  updateStats: (userId, stats, statPoints) =>
    api.patch(`/gm/player/${userId}/stats`, { stats, statPoints }),
  
  resetStats: (userId) =>
    api.post(`/gm/player/${userId}/reset-stats`),
  
  refreshEnergy: (userId) =>
    api.post(`/gm/player/${userId}/refresh-energy`),
  
  addGold: (userId, amount) =>
    api.post(`/gm/player/${userId}/add-gold`, { amount }),
  
  addItem: (userId, item) =>
    api.post(`/gm/player/${userId}/add-item`, item),
  
  removeItem: (userId, itemIndex) =>
    api.delete(`/gm/player/${userId}/remove-item/${itemIndex}`),
  
  clearInventory: (userId) =>
    api.post(`/gm/player/${userId}/clear-inventory`),
  
  resetProgress: (userId) =>
    api.post(`/gm/player/${userId}/reset-progress`),
  
  removeHiddenClass: (userId) =>
    api.post(`/gm/player/${userId}/remove-hidden-class`),
  
  deletePlayer: (userId) =>
    api.delete(`/gm/player/${userId}`),
  
  setLevel: (userId, level) =>
    api.post(`/gm/player/${userId}/set-level`, { level }),
  
  healPlayer: (userId) =>
    api.post(`/gm/player/${userId}/heal`),
  
  getHiddenClasses: () =>
    api.get('/gm/hidden-classes')
};

// Game info
export const gameAPI = {
  health: () => api.get('/health'),
  info: () => api.get('/info')
};

export default api;
