import axios from 'axios';

var API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

var api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(function(config) {
  var token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// Auth API
export var authAPI = {
  login: function(username, password) {
    return api.post('/auth/login', { username: username, password: password });
  },
  register: function(username, password) {
    return api.post('/auth/register', { username: username, password: password });
  },
  getPlayers: function() {
    return api.get('/auth/players');
  },
  createAccount: function(username, password, role) {
    return api.post('/auth/create-account', { username: username, password: password, role: role });
  },
  toggleAccount: function(userId) {
    return api.post('/auth/toggle-account/' + userId);
  }
};

// Character API
export var characterAPI = {
  getClasses: function() {
    return api.get('/character/classes');
  },
  create: function(name, baseClass) {
    return api.post('/character/create', { name: name, baseClass: baseClass });
  },
  get: function() {
    return api.get('/character');
  },
  allocateStats: function(stats) {
    return api.post('/character/allocate-stats', { stats: stats });
  },
  rest: function() {
    return api.post('/character/rest');
  }
};

// Tower API
export var towerAPI = {
  getInfo: function() {
    return api.get('/tower/info');
  },
  getFloors: function(towerId) {
    return api.get('/tower/floors/' + towerId);
  },
  selectFloor: function(towerId, floor) {
    return api.post('/tower/select-floor', { towerId: towerId, floor: floor });
  },
  enter: function(towerId) {
    return api.post('/tower/enter', { towerId: towerId });
  },
  explore: function() {
    return api.post('/tower/explore');
  },
  choosePath: function(choice, scenarioId) {
    return api.post('/tower/choose-path', { choice: choice, scenarioId: scenarioId });
  },
  attack: function(enemy, treasureAfter) {
    return api.post('/tower/combat/attack', { enemy: enemy, treasureAfter: treasureAfter });
  },
  useSkill: function(enemy, skillId, treasureAfter) {
    return api.post('/tower/combat/skill', { enemy: enemy, skillId: skillId, treasureAfter: treasureAfter });
  },
  flee: function(enemy) {
    return api.post('/tower/combat/flee', { enemy: enemy });
  },
  usePotion: function(potionType) {
    return api.post('/tower/use-potion', { potionType: potionType });
  },
  getFloorRequirements: function() {
    return api.get('/tower/floor-requirements');
  },
  advance: function() {
    return api.post('/tower/advance');
  },
  leave: function() {
    return api.post('/tower/leave');
  },
  getHiddenClasses: function() {
    return api.get('/tower/hidden-classes');
  },
  unlockHiddenClass: function(scrollItemIndex) {
    return api.post('/tower/unlock-hidden-class', { scrollItemIndex: scrollItemIndex });
  },
  removeHiddenClass: function() {
    return api.post('/tower/remove-hidden-class');
  },
  craft: function(recipeId) {
    return api.post('/tower/craft', { recipeId: recipeId });
  }
};

// Tavern API
export var tavernAPI = {
  // Item search
  searchItems: function(query) {
    return api.get('/tavern/items/search?q=' + encodeURIComponent(query));
  },
  getAllItems: function() {
    return api.get('/tavern/items/all');
  },
  
  // Shop
  getShop: function() {
    return api.get('/tavern/shop');
  },
  buyFromShop: function(itemId, quantity) {
    return api.post('/tavern/shop/buy', { itemId: itemId, quantity: quantity });
  },
  sellToShop: function(itemId, quantity) {
    return api.post('/tavern/shop/sell', { itemId: itemId, quantity: quantity });
  },
  
  // Trading
  getTradingListings: function() {
    return api.get('/tavern/trading');
  },
  getMyListings: function() {
    return api.get('/tavern/trading/my');
  },
  listItem: function(itemId, quantity, pricePerUnit) {
    return api.post('/tavern/trading/list', { itemId: itemId, quantity: quantity, pricePerUnit: pricePerUnit });
  },
  buyFromPlayer: function(listingId, quantity) {
    return api.post('/tavern/trading/buy/' + listingId, { quantity: quantity });
  },
  cancelListing: function(listingId) {
    return api.delete('/tavern/trading/' + listingId);
  },
  
  // Inventory
  useItem: function(itemId) {
    return api.post('/tavern/inventory/use', { itemId: itemId });
  },
  splitStack: function(itemId, quantity) {
    return api.post('/tavern/inventory/split', { itemId: itemId, quantity: quantity });
  },
  combineStacks: function(itemId) {
    return api.post('/tavern/inventory/combine', { itemId: itemId });
  },
  discardItem: function(itemId, quantity) {
    return api.delete('/tavern/inventory/' + itemId + '?quantity=' + quantity);
  },
  
  // Equipment
  equipItem: function(itemId) {
    return api.post('/tavern/equip', { itemId: itemId });
  },
  unequipItem: function(slot) {
    return api.post('/tavern/unequip', { slot: slot });
  },
  
  // Crafting
  craftMemoryCrystal: function() {
    return api.post('/tavern/craft/memory-crystal');
  },
  useMemoryCrystal: function() {
    return api.post('/tavern/use-memory-crystal');
  },
  
  // GM Shop Management
  getGMShop: function() {
    return api.get('/tavern/gm/shop');
  },
  addToShop: function(itemId, price, stock) {
    return api.post('/tavern/gm/shop/add', { itemId: itemId, price: price, stock: stock });
  },
  updateShopItem: function(itemId, updates) {
    return api.patch('/tavern/gm/shop/' + itemId, updates);
  },
  removeFromShop: function(itemId) {
    return api.delete('/tavern/gm/shop/' + itemId);
  }
};

// GM API
export var gmAPI = {
  getPlayer: function(userId) {
    return api.get('/gm/player/' + userId);
  },
  refreshEnergy: function(userId) {
    return api.post('/gm/player/' + userId + '/refresh-energy');
  },
  healPlayer: function(userId) {
    return api.post('/gm/player/' + userId + '/heal');
  },
  addGold: function(userId, amount) {
    return api.post('/gm/player/' + userId + '/add-gold', { amount: amount });
  },
  setLevel: function(userId, level) {
    return api.post('/gm/player/' + userId + '/set-level', { level: level });
  },
  editStats: function(userId, stats) {
    return api.post('/gm/player/' + userId + '/edit-stats', { stats: stats });
  },
  resetStats: function(userId) {
    return api.post('/gm/player/' + userId + '/reset-stats');
  },
  resetProgress: function(userId) {
    return api.post('/gm/player/' + userId + '/reset-progress');
  },
  addItem: function(userId, itemData) {
    return api.post('/gm/player/' + userId + '/add-item', itemData);
  },
  removeItem: function(userId, index) {
    return api.delete('/gm/player/' + userId + '/remove-item/' + index);
  },
  clearInventory: function(userId) {
    return api.post('/gm/player/' + userId + '/clear-inventory');
  },
  removeHiddenClass: function(userId) {
    return api.post('/gm/player/' + userId + '/remove-hidden-class');
  },
  deletePlayer: function(userId) {
    return api.delete('/gm/player/' + userId);
  },
  getHiddenClasses: function() {
    return api.get('/gm/hidden-classes');
  },
  getTradingListings: function() {
    return api.get('/gm/trading');
  },
  removeTradingListing: function(listingId) {
    return api.delete('/gm/trading/' + listingId);
  }
};

export default api;
