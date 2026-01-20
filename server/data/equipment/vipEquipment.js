// ============================================================
// VIP EQUIPMENT - Special items with optional expiration
// ============================================================
// Phase 9.9.4: VIP Equipment System
// - Permanent items: Never expire
// - Trial items: Expire X days after FIRST EQUIP
// ============================================================

export const VIP_EQUIPMENT = {
  // ============================================================
  // VIP STARTER SET [7D] - Slightly better than Tower 1 gear
  // Tower 1 has ~5-15 stats, this has ~20-30 stats
  // ============================================================
  
  vip_starter_head: {
    itemId: 'vip_starter_head',
    name: '⭐ VIP Hunter Helm [7D]',
    icon: '🪖',
    type: 'equipment',
    subtype: 'head',
    rarity: 'rare',
    levelReq: 1,
    stats: { 
      pDef: 15, 
      mDef: 10, 
      hp: 50 
    },
    sellPrice: 0,
    tradeable: false,
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },

  vip_starter_body: {
    itemId: 'vip_starter_body',
    name: '⭐ VIP Hunter Armor [7D]',
    icon: '🛡️',
    type: 'equipment',
    subtype: 'body',
    rarity: 'rare',
    levelReq: 1,
    stats: { 
      pDef: 25, 
      mDef: 15, 
      hp: 80 
    },
    sellPrice: 0,
    tradeable: false,
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },

  vip_starter_leg: {
    itemId: 'vip_starter_leg',
    name: '⭐ VIP Hunter Pants [7D]',
    icon: '👖',
    type: 'equipment',
    subtype: 'leg',
    rarity: 'rare',
    levelReq: 1,
    stats: { 
      pDef: 18, 
      mDef: 12, 
      hp: 40 
    },
    sellPrice: 0,
    tradeable: false,
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },

  vip_starter_shoes: {
    itemId: 'vip_starter_shoes',
    name: '⭐ VIP Hunter Boots [7D]',
    icon: '👢',
    type: 'equipment',
    subtype: 'shoes',
    rarity: 'rare',
    levelReq: 1,
    stats: { 
      pDef: 10, 
      mDef: 8, 
      agi: 5,
      hp: 30 
    },
    sellPrice: 0,
    tradeable: false,
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },

  vip_starter_weapon: {
    itemId: 'vip_starter_weapon',
    name: '⭐ VIP Hunter Blade [7D]',
    icon: '⚔️',
    type: 'equipment',
    subtype: 'rightHand',
    rarity: 'rare',
    levelReq: 1,
    stats: { 
      pAtk: 25, 
      mAtk: 15,
      critRate: 5,
      critDmg: 20
    },
    sellPrice: 0,
    tradeable: false,
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },

  vip_starter_shield: {
    itemId: 'vip_starter_shield',
    name: '⭐ VIP Hunter Shield [7D]',
    icon: '🛡️',
    type: 'equipment',
    subtype: 'leftHand',
    rarity: 'rare',
    levelReq: 1,
    stats: { 
      pDef: 20, 
      mDef: 15,
      hp: 60
    },
    sellPrice: 0,
    tradeable: false,
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },

  vip_starter_ring: {
    itemId: 'vip_starter_ring',
    name: '⭐ VIP EXP Ring [7D]',
    icon: '💍',
    type: 'equipment',
    subtype: 'ring',
    rarity: 'rare',
    levelReq: 1,
    stats: { 
      expBonus: 50  // +50% EXP gain
    },
    sellPrice: 0,
    tradeable: false,
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },

  vip_starter_necklace: {
    itemId: 'vip_starter_necklace',
    name: '⭐ VIP Hunter Amulet [7D]',
    icon: '📿',
    type: 'equipment',
    subtype: 'necklace',
    rarity: 'rare',
    levelReq: 1,
    stats: { 
      mAtk: 20,
      int: 5,
      mp: 50
    },
    sellPrice: 0,
    tradeable: false,
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  }
};

// ============================================================
// VIP SET BONUSES (Optional - if you want set bonuses)
// ============================================================
export const VIP_SET_BONUSES = {
  vip_starter_set: {
    id: 'vip_starter_set',
    name: '⭐ VIP Starter Set',
    bonuses: {
      2: { name: '2-Piece: HP Boost', stats: { hp: 50 } },
      4: { name: '4-Piece: Combat Ready', stats: { pAtk: 10, mAtk: 10 } },
      6: { name: '6-Piece: VIP Power', stats: { critRate: 5, expBonus: 20 } }
    }
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get VIP item by ID
 */
export const getVipItem = (itemId) => VIP_EQUIPMENT[itemId] || null;

/**
 * Get all VIP items
 */
export const getAllVipItems = () => Object.values(VIP_EQUIPMENT);

/**
 * Get all VIP items as array with keys
 */
export const getVipItemList = () => Object.entries(VIP_EQUIPMENT).map(([key, item]) => ({
  key,
  ...item
}));

/**
 * Create inventory item from VIP template
 * This adds the expiration tracking fields
 */
export const createVipInventoryItem = (itemId) => {
  const template = VIP_EQUIPMENT[itemId];
  if (!template) return null;
  
  return {
    ...template,
    quantity: 1,
    stackable: false,
    // Expiration tracking fields - set when first equipped
    firstEquippedAt: null,
    expiresAt: null,
    isExpired: false
  };
};

/**
 * Check if item is expired
 */
export const isItemExpired = (item) => {
  if (!item.expiresAt) return false;
  return new Date() > new Date(item.expiresAt);
};

/**
 * Calculate expiration date from first equip
 */
export const calculateExpirationDate = (item) => {
  if (item.expirationType !== 'on_first_equip') return null;
  const days = item.expirationDays || 7;
  const now = new Date();
  return new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
};

/**
 * Format remaining time for display
 */
export const formatRemainingTime = (expiresAt) => {
  if (!expiresAt) return 'Not activated';
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const remaining = expiry - now;
  
  if (remaining <= 0) return 'Expired';
  
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

export default VIP_EQUIPMENT;
