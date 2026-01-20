// ============================================================
// VIP EQUIPMENT DATABASE
// Phase 9.9.4 - Time-limited equipment for VIP players
// 
// STAT TYPES:
// - Flat: pAtk, mAtk, pDef, mDef, hp, mp, str, agi, dex, int, vit
// - Percent: pAtkPercent, mAtkPercent, pDefPercent, mDefPercent, hpPercent, mpPercent
// - Special: expBonus (% more EXP), goldBonus (% more gold)
// ============================================================

export const VIP_EQUIPMENT = {
  // ============================================================
  // VIP STARTER SET (7 Days) - Using FLAT values
  // ============================================================
  vip_starter_helm: {
    id: 'vip_starter_helm',
    name: 'VIP Hunter Helm',
    icon: '🪖',
    type: 'armor',
    slot: 'head',
    rarity: 'epic',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pDef: 15,
      mDef: 10,
      hp: 50
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },
  
  vip_starter_armor: {
    id: 'vip_starter_armor',
    name: 'VIP Hunter Armor',
    icon: '🛡️',
    type: 'armor',
    slot: 'body',
    rarity: 'epic',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pDef: 25,
      mDef: 15,
      hp: 80
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },
  
  vip_starter_pants: {
    id: 'vip_starter_pants',
    name: 'VIP Hunter Pants',
    icon: '👖',
    type: 'armor',
    slot: 'hands', // Maps to 'leg' in character schema
    rarity: 'epic',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pDef: 18,
      mDef: 12,
      hp: 40
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },
  
  vip_starter_boots: {
    id: 'vip_starter_boots',
    name: 'VIP Hunter Boots',
    icon: '👢',
    type: 'armor',
    slot: 'feet', // Maps to 'shoes' in character schema
    rarity: 'epic',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pDef: 10,
      mDef: 8,
      agi: 5,
      hp: 30
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },
  
  vip_starter_blade: {
    id: 'vip_starter_blade',
    name: 'VIP Hunter Blade',
    icon: '⚔️',
    type: 'weapon',
    slot: 'mainHand', // Maps to 'rightHand' in character schema
    rarity: 'epic',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pAtk: 25,
      mAtk: 15,
      critRate: 5
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },
  
  vip_starter_shield: {
    id: 'vip_starter_shield',
    name: 'VIP Hunter Shield',
    icon: '🛡️',
    type: 'armor',
    slot: 'offHand', // Maps to 'leftHand' in character schema
    rarity: 'epic',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pDef: 20,
      mDef: 15,
      hp: 60
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },
  
  vip_starter_ring: {
    id: 'vip_starter_ring',
    name: 'VIP EXP Ring',
    icon: '💍',
    type: 'accessory',
    slot: 'ring',
    rarity: 'legendary',
    levelReq: 1,
    classReq: 'any',
    stats: {
      expBonus: 50  // +50% EXP bonus!
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },
  
  vip_starter_necklace: {
    id: 'vip_starter_necklace',
    name: 'VIP Hunter Amulet',
    icon: '📿',
    type: 'accessory',
    slot: 'necklace',
    rarity: 'epic',
    levelReq: 1,
    classReq: 'any',
    stats: {
      mAtk: 20,
      int: 5,
      mp: 50
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 7,
    setId: 'vip_starter_set'
  },

  // ============================================================
  // VIP PREMIUM SET (30 Days) - Using PERCENTAGE values
  // ============================================================
  vip_premium_helm: {
    id: 'vip_premium_helm',
    name: 'VIP Premium Helm',
    icon: '👑',
    type: 'armor',
    slot: 'head',
    rarity: 'legendary',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pDefPercent: 10,   // +10% P.DEF
      mDefPercent: 8,    // +8% M.DEF
      hpPercent: 5       // +5% HP
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 30,
    setId: 'vip_premium_set'
  },
  
  vip_premium_armor: {
    id: 'vip_premium_armor',
    name: 'VIP Premium Armor',
    icon: '🎖️',
    type: 'armor',
    slot: 'body',
    rarity: 'legendary',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pDefPercent: 15,   // +15% P.DEF
      mDefPercent: 10,   // +10% M.DEF
      hpPercent: 10      // +10% HP
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 30,
    setId: 'vip_premium_set'
  },
  
  vip_premium_pants: {
    id: 'vip_premium_pants',
    name: 'VIP Premium Pants',
    icon: '👖',
    type: 'armor',
    slot: 'hands',
    rarity: 'legendary',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pDefPercent: 12,   // +12% P.DEF
      mDefPercent: 8,    // +8% M.DEF
      hpPercent: 5       // +5% HP
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 30,
    setId: 'vip_premium_set'
  },
  
  vip_premium_boots: {
    id: 'vip_premium_boots',
    name: 'VIP Premium Boots',
    icon: '👟',
    type: 'armor',
    slot: 'feet',
    rarity: 'legendary',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pDefPercent: 8,    // +8% P.DEF
      mDefPercent: 5,    // +5% M.DEF
      agi: 10,           // +10 AGI (flat)
      hpPercent: 3       // +3% HP
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 30,
    setId: 'vip_premium_set'
  },
  
  vip_premium_weapon: {
    id: 'vip_premium_weapon',
    name: 'VIP Premium Blade',
    icon: '🗡️',
    type: 'weapon',
    slot: 'mainHand',
    rarity: 'legendary',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pAtkPercent: 15,   // +15% P.ATK
      mAtkPercent: 10,   // +10% M.ATK
      critRate: 8        // +8% Crit (flat)
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 30,
    setId: 'vip_premium_set'
  },
  
  vip_premium_shield: {
    id: 'vip_premium_shield',
    name: 'VIP Premium Shield',
    icon: '🛡️',
    type: 'armor',
    slot: 'offHand',
    rarity: 'legendary',
    levelReq: 1,
    classReq: 'any',
    stats: {
      pDefPercent: 12,   // +12% P.DEF
      mDefPercent: 10,   // +10% M.DEF
      hpPercent: 8       // +8% HP
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 30,
    setId: 'vip_premium_set'
  },
  
  vip_premium_ring: {
    id: 'vip_premium_ring',
    name: 'VIP Premium Ring',
    icon: '💎',
    type: 'accessory',
    slot: 'ring',
    rarity: 'legendary',
    levelReq: 1,
    classReq: 'any',
    stats: {
      expBonus: 100,     // +100% EXP bonus!
      goldBonus: 50      // +50% Gold bonus!
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 30,
    setId: 'vip_premium_set'
  },
  
  vip_premium_necklace: {
    id: 'vip_premium_necklace',
    name: 'VIP Premium Amulet',
    icon: '📿',
    type: 'accessory',
    slot: 'necklace',
    rarity: 'legendary',
    levelReq: 1,
    classReq: 'any',
    stats: {
      mAtkPercent: 12,   // +12% M.ATK
      int: 15,           // +15 INT (flat)
      mpPercent: 10      // +10% MP
    },
    vipOnly: true,
    expirationType: 'on_first_equip',
    expirationDays: 30,
    setId: 'vip_premium_set'
  }
};

// ============================================================
// VIP SETS DEFINITION
// ============================================================

export const VIP_SETS = {
  vip_starter_set: {
    id: 'vip_starter_set',
    name: 'VIP Starter Set',
    description: '7-day starter equipment for new VIP players',
    expirationDays: 7,
    pieces: [
      'vip_starter_helm',
      'vip_starter_armor',
      'vip_starter_pants',
      'vip_starter_boots',
      'vip_starter_blade',
      'vip_starter_shield',
      'vip_starter_ring',
      'vip_starter_necklace'
    ],
    setBonus: {
      4: { expBonus: 10 },  // 4-piece: +10% EXP
      8: { expBonus: 25, goldBonus: 15 }  // 8-piece: +25% EXP, +15% Gold
    }
  },
  
  vip_premium_set: {
    id: 'vip_premium_set',
    name: 'VIP Premium Set',
    description: '30-day premium equipment with percentage bonuses',
    expirationDays: 30,
    pieces: [
      'vip_premium_helm',
      'vip_premium_armor',
      'vip_premium_pants',
      'vip_premium_boots',
      'vip_premium_weapon',
      'vip_premium_shield',
      'vip_premium_ring',
      'vip_premium_necklace'
    ],
    setBonus: {
      4: { pAtkPercent: 5, mAtkPercent: 5 },  // 4-piece: +5% ATK
      8: { pAtkPercent: 10, mAtkPercent: 10, hpPercent: 10 }  // 8-piece: +10% ATK, +10% HP
    }
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getVipItemById(itemId) {
  return VIP_EQUIPMENT[itemId] || null;
}

export function getVipSetById(setId) {
  return VIP_SETS[setId] || null;
}

export function getAllVipItems() {
  return Object.values(VIP_EQUIPMENT);
}

export function getAllVipSets() {
  return Object.values(VIP_SETS);
}

export function getVipSetPieces(setId) {
  const set = VIP_SETS[setId];
  if (!set) return [];
  return set.pieces.map(pieceId => VIP_EQUIPMENT[pieceId]).filter(Boolean);
}

export default {
  VIP_EQUIPMENT,
  VIP_SETS,
  getVipItemById,
  getVipSetById,
  getAllVipItems,
  getAllVipSets,
  getVipSetPieces
};
