import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('apz_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration (but not on login/register routes)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/login') || 
                        error.config?.url?.includes('/auth/register');
    
    // Only redirect on 401 if it's not a login/register attempt
    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('apz_token');
      localStorage.removeItem('apz_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  // Login
  login: (username, password) => api.post('/auth/login', { username, password }),
  
  // Get current user
  getMe: () => api.get('/auth/me'),
  
  // Get all players (GM/Admin) - correct path
  getPlayers: () => api.get('/auth/gm/players'),
  
  // Create account (GM/Admin) - correct path
  createAccount: (username, password, role) => api.post('/auth/gm/create-account', { username, password, role }),
  
  // Toggle account active status (GM/Admin) - correct path
  toggleAccount: (userId) => api.patch(`/auth/gm/toggle-account/${userId}`),
};

// ============================================
// CHARACTER API
// ============================================
export const characterAPI = {
  // Get class info
  getClasses: () => api.get('/character/classes'),
  
  // Create character
  create: (name, baseClass) => api.post('/character/create', { name, baseClass }),
  
  // Get character
  get: () => api.get('/character'),
  
  // Allocate stat points
  allocateStats: (stats) => api.post('/character/allocate-stats', { stats }),
  
  // Rest to heal
  rest: () => api.post('/character/rest'),
};

// ============================================
// TOWER API
// ============================================
export const towerAPI = {
  // Get tower info
  getInfo: () => api.get('/tower/info'),
  
  // Enter tower
  enter: (towerId, floor = 1) => api.post('/tower/enter', { towerId, floor }),
};

// ============================================
// EXPLORATION API
// ============================================
export const explorationAPI = {
  // Get/generate floor map
  getMap: (floor = null) => api.get(`/exploration/map${floor ? `?floor=${floor}` : ''}`),
  
  // Move to connected node
  move: (nodeId) => api.post('/exploration/move', { nodeId }),
  
  // Start combat on combat node
  startCombat: () => api.post('/exploration/combat/start'),
  
  // Combat action (attack, skill, defend)
  combatAction: (action, target = null, skillId = null) => 
    api.post('/exploration/combat/action', { action, target, skillId }),
  
  // Interact with non-combat node
  interact: () => api.post('/exploration/interact'),
  
  // Leave tower
  leave: () => api.post('/exploration/leave'),
  
  // Get skill database
  getSkills: () => api.get('/exploration/skills'),
};

// ============================================
// TAVERN API
// PHASE 9.3.3 FIX: Corrected all endpoint paths to match backend routes
// ============================================
export const tavernAPI = {
  // Get shop inventory (player view)
  getShop: () => api.get('/tavern/shop'),
  
  // Get GM shop view
  getGMShop: () => api.get('/tavern/gm/shop'),
  
  // Buy item from shop - FIXED: /tavern/shop/buy
  buy: (itemId, quantity = 1) => api.post('/tavern/shop/buy', { itemId, quantity }),
  
  // Sell item - FIXED: /tavern/shop/sell
  sell: (itemId, quantity = 1) => api.post('/tavern/shop/sell', { itemId, quantity }),
  
  // Use consumable item - FIXED: /tavern/inventory/use
  useItem: (itemId) => api.post('/tavern/inventory/use', { itemId }),
  
  // Equip item (correct)
  equipItem: (itemId) => api.post('/tavern/equip', { itemId }),
  
  // Unequip item from slot (correct)
  unequipItem: (slot) => api.post('/tavern/unequip', { slot }),
  
  // Discard item - FIXED: DELETE /tavern/inventory/:itemId with body
  discardItem: (itemId, quantity = 1) => api.delete(`/tavern/inventory/${itemId}`, { data: { quantity } }),
  
  // Split stack - FIXED: /tavern/inventory/split
  splitStack: (itemId, quantity) => api.post('/tavern/inventory/split', { itemId, quantity }),
  
  // Combine stacks of same item - FIXED: /tavern/inventory/combine
  combineStacks: (itemId) => api.post('/tavern/inventory/combine', { itemId }),
  
  // Craft Memory Crystal (correct)
  craftMemoryCrystal: () => api.post('/tavern/craft/memory-crystal'),
  
  // Use Memory Crystal (remove hidden class) (correct)
  useMemoryCrystal: () => api.post('/tavern/use-memory-crystal'),
  
  // Use hidden class scroll
  useScroll: (itemId) => api.post('/tavern/use-scroll', { itemId }),
  
  // Generic craft item
  craftItem: (recipeId) => api.post('/tavern/craft', { recipeId }),
  
  // Search items
  searchItems: (query) => api.get(`/tavern/items/search?q=${encodeURIComponent(query)}`),
  
  // === GM/Admin Shop Management ===
  
  // Add item to shop
  addToShop: (itemId, price, stock = -1) => api.post('/tavern/gm/shop/add', { itemId, price, stock }),
  
  // Update shop item
  updateShopItem: (itemId, updates) => api.patch(`/tavern/gm/shop/${itemId}`, updates),
  
  // Remove from shop
  removeFromShop: (itemId) => api.delete(`/tavern/gm/shop/${itemId}`),
  
  // Repopulate shop with consumables
  repopulateShop: (clearExisting = false) => api.post('/tavern/gm/shop/repopulate', { clearExisting }),
  
  // === Trading ===
  
  // Get trading listings
  getListings: () => api.get('/tavern/trading'),
  
  // Get my listings
  getMyListings: () => api.get('/tavern/trading/my'),
  
  // Create listing - FIXED: pricePerUnit instead of price
  createListing: (itemId, quantity, pricePerUnit) => api.post('/tavern/trading/list', { itemId, quantity, pricePerUnit }),
  
  // Buy from listing - FIXED: includes listingId in URL
  buyListing: (listingId, quantity = null) => api.post(`/tavern/trading/buy/${listingId}`, { quantity }),
  
  // Cancel own listing
  cancelListing: (listingId) => api.delete(`/tavern/trading/${listingId}`),
};

// ============================================
// GM API
// ============================================
export const gmAPI = {
  // === Player Management ===
  
  // Get player details
  getPlayer: (id) => api.get(`/gm/player/${id}`),
  
  // Update player stats
  updateStats: (id, stats) => api.post(`/gm/player/${id}/edit-stats`, { stats }),
  
  // Reset stats to base
  resetStats: (id) => api.post(`/gm/player/${id}/reset-stats`),
  
  // Refresh energy to 100
  refreshEnergy: (id) => api.post(`/gm/player/${id}/refresh-energy`),
  
  // Add/remove gold
  addGold: (id, amount) => api.post(`/gm/player/${id}/add-gold`, { amount }),
  
  // Set player level
  setLevel: (id, level) => api.post(`/gm/player/${id}/set-level`, { level }),
  
  // Full heal player
  healPlayer: (id) => api.post(`/gm/player/${id}/heal`),
  
  // Reset tower progress
  resetProgress: (id) => api.post(`/gm/player/${id}/reset-progress`),
  
  // Remove hidden class
  removeHiddenClass: (id) => api.post(`/gm/player/${id}/remove-hidden-class`),
  
  // Delete player account
  deletePlayer: (id) => api.delete(`/gm/player/${id}`),
  
  // === Inventory Management ===
  
  // Add item to player inventory
  addItem: (id, item) => api.post(`/gm/player/${id}/add-item`, item),
  
  // Remove item by index
  removeItem: (id, index) => api.delete(`/gm/player/${id}/remove-item/${index}`),
  
  // Clear all inventory
  clearInventory: (id) => api.post(`/gm/player/${id}/clear-inventory`),
  
  // === Item Database Search ===
  
  // Search all items in equipment database
  searchItems: (query) => api.get(`/gm/items/search?q=${encodeURIComponent(query)}`),
  
  // Get all items (paginated)
  getAllItems: (page = 0, limit = 50, type = null) => 
    api.get(`/gm/items/all?page=${page}&limit=${limit}${type ? `&type=${type}` : ''}`),
  
  // === Hidden Classes ===
  
  // Get all hidden class ownership status
  getHiddenClasses: () => api.get('/gm/hidden-classes'),
  
  // === Trading Management ===
  
  // Get all trading listings
  getTradingListings: () => api.get('/gm/trading'),
  
  // Remove trading listing (returns item to seller)
  removeTradingListing: (id) => api.delete(`/gm/trading/${id}`),
};

// ============================================
// FRIENDS API (Phase 9.8)
// ============================================
export const friendsAPI = {
  // Get friend list with online status
  getFriends: () => api.get('/friends'),
  
  // Get pending friend requests (sent and received)
  getPending: () => api.get('/friends/pending'),
  
  // Search users by username
  searchUsers: (query) => api.get(`/friends/search?q=${encodeURIComponent(query)}`),
  
  // Send friend request by username
  sendRequest: (username) => api.post('/friends/request', { username }),
  
  // Accept friend request
  acceptRequest: (friendshipId) => api.post(`/friends/accept/${friendshipId}`),
  
  // Decline friend request
  declineRequest: (friendshipId) => api.post(`/friends/decline/${friendshipId}`),
  
  // Remove friend
  removeFriend: (friendshipId) => api.delete(`/friends/${friendshipId}`),
  
  // Get friend's profile
  getFriendProfile: (friendshipId) => api.get(`/friends/${friendshipId}/profile`),
  
  // Get friend count
  getCount: () => api.get('/friends/count'),
};

// ============================================
// DUNGEON BREAK API (Phase 9.8 + 9.9.1 + 9.9.2)
// ============================================
export const dungeonBreakAPI = {
  // === Player Endpoints ===
  
  // Get active dungeon break event
  getActive: () => api.get('/dungeon-break/active'),
  
  // Attack the boss (records damage, boss counter-attacks)
  attack: () => api.post('/dungeon-break/attack'),
  
  // Get damage leaderboard
  getLeaderboard: (eventId = null) => 
    api.get(`/dungeon-break/leaderboard${eventId ? `?eventId=${eventId}` : ''}`),
  
  // Claim rewards after event ends (gives raid coins)
  claimRewards: (eventId) => api.post('/dungeon-break/claim', { eventId }),
  
  // Get past events history
  getHistory: () => api.get('/dungeon-break/history'),
  
  // Get my participation history
  getMyHistory: () => api.get('/dungeon-break/my-history'),
  
  // === Phase 9.9.2: Raid Coins & Redeem ===
  
  // Get my raid coins balance
  getMyCoins: () => api.get('/dungeon-break/my-coins'),
  
  // Get redeem shop (all sets with pieces)
  getShop: () => api.get('/dungeon-break/shop'),
  
  // Redeem coins for equipment piece
  redeem: (setId, pieceSlot) => api.post('/dungeon-break/redeem', { setId, pieceSlot }),
  
  // === GM Endpoints ===
  
  // Get available bosses
  getBosses: () => api.get('/dungeon-break/bosses'),
  
  // Get available tiers
  getTiers: () => api.get('/dungeon-break/tiers'),
  
  // Create new dungeon break event
  createEvent: (bossId, tier = 'small', durationHours = 3) => 
    api.post('/dungeon-break/create', { bossId, tier, durationHours }),
  
  // Cancel active event
  cancelEvent: () => api.post('/dungeon-break/cancel'),
};

// ============================================
// HELP API (Phase 10 - Co-op Boss Help)
// ============================================
export const helpAPI = {
  // Get my active help request
  getActive: () => api.get('/help/active'),
  
  // Create help request (from boss floor)
  createRequest: (towerId, floor) => api.post('/help/request', { towerId, floor }),
  
  // Cancel my help request
  cancel: (requestId) => api.delete(`/help/cancel/${requestId}`),
  
  // Get available requests from friends
  getAvailable: () => api.get('/help/available'),
  
  // Accept and help a friend (simulated combat)
  accept: (requestId) => api.post(`/help/accept/${requestId}`),
  
  // Get help history
  getHistory: () => api.get('/help/history'),
  
  // Get my helper stats
  getStats: () => api.get('/help/stats'),
};

// ============================================
// STORY API (if you have story mode)
// ============================================
export const storyAPI = {
  // Get story progress
  getProgress: () => api.get('/story/progress'),
  
  // Start story scenario
  startScenario: (scenarioId) => api.post('/story/start', { scenarioId }),
  
  // Make story choice
  makeChoice: (choiceId) => api.post('/story/choice', { choiceId }),
};

export default api;
