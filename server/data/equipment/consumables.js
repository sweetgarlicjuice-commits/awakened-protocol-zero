// ============================================================
// CONSUMABLES - Potions, Scrolls, and Utility Items
// ============================================================

export const CONSUMABLES = {
  // ============================================================
  // HEALTH POTIONS
  // ============================================================
  small_health_potion: {
    id: 'small_health_potion',
    name: 'Small Health Potion',
    icon: '🧪',
    type: 'consumable',
    subType: 'potion',
    rarity: 'common',
    effect: { type: 'heal_hp', value: 50 },
    description: 'Restores 50 HP.',
    levelReq: 1,
    buyPrice: 25,
    sellPrice: 10,
    stackable: true,
    maxStack: 99,
    usableInCombat: true
  },
  
  medium_health_potion: {
    id: 'medium_health_potion',
    name: 'Medium Health Potion',
    icon: '🧪',
    type: 'consumable',
    subType: 'potion',
    rarity: 'uncommon',
    effect: { type: 'heal_hp', value: 150 },
    description: 'Restores 150 HP.',
    levelReq: 10,
    buyPrice: 75,
    sellPrice: 30,
    stackable: true,
    maxStack: 99,
    usableInCombat: true
  },
  
  large_health_potion: {
    id: 'large_health_potion',
    name: 'Large Health Potion',
    icon: '🧪',
    type: 'consumable',
    subType: 'potion',
    rarity: 'rare',
    effect: { type: 'heal_hp', value: 350 },
    description: 'Restores 350 HP.',
    levelReq: 25,
    buyPrice: 200,
    sellPrice: 80,
    stackable: true,
    maxStack: 99,
    usableInCombat: true
  },
  
  mega_health_potion: {
    id: 'mega_health_potion',
    name: 'Mega Health Potion',
    icon: '🧪',
    type: 'consumable',
    subType: 'potion',
    rarity: 'epic',
    effect: { type: 'heal_hp', value: 700 },
    description: 'Restores 700 HP.',
    levelReq: 50,
    buyPrice: 500,
    sellPrice: 200,
    stackable: true,
    maxStack: 99,
    usableInCombat: true
  },

  // ============================================================
  // MANA POTIONS
  // ============================================================
  small_mana_potion: {
    id: 'small_mana_potion',
    name: 'Small Mana Potion',
    icon: '🔵',
    type: 'consumable',
    subType: 'potion',
    rarity: 'common',
    effect: { type: 'heal_mp', value: 30 },
    description: 'Restores 30 MP.',
    levelReq: 1,
    buyPrice: 25,
    sellPrice: 10,
    stackable: true,
    maxStack: 99,
    usableInCombat: true
  },
  
  medium_mana_potion: {
    id: 'medium_mana_potion',
    name: 'Medium Mana Potion',
    icon: '🔵',
    type: 'consumable',
    subType: 'potion',
    rarity: 'uncommon',
    effect: { type: 'heal_mp', value: 80 },
    description: 'Restores 80 MP.',
    levelReq: 10,
    buyPrice: 75,
    sellPrice: 30,
    stackable: true,
    maxStack: 99,
    usableInCombat: true
  },
  
  large_mana_potion: {
    id: 'large_mana_potion',
    name: 'Large Mana Potion',
    icon: '🔵',
    type: 'consumable',
    subType: 'potion',
    rarity: 'rare',
    effect: { type: 'heal_mp', value: 180 },
    description: 'Restores 180 MP.',
    levelReq: 25,
    buyPrice: 200,
    sellPrice: 80,
    stackable: true,
    maxStack: 99,
    usableInCombat: true
  },
  
  mega_mana_potion: {
    id: 'mega_mana_potion',
    name: 'Mega Mana Potion',
    icon: '🔵',
    type: 'consumable',
    subType: 'potion',
    rarity: 'epic',
    effect: { type: 'heal_mp', value: 400 },
    description: 'Restores 400 MP.',
    levelReq: 50,
    buyPrice: 500,
    sellPrice: 200,
    stackable: true,
    maxStack: 99,
    usableInCombat: true
  },

  // ============================================================
  // HYBRID POTIONS
  // ============================================================
  elixir_of_restoration: {
    id: 'elixir_of_restoration',
    name: 'Elixir of Restoration',
    icon: '⚗️',
    type: 'consumable',
    subType: 'potion',
    rarity: 'rare',
    effect: { type: 'heal_both', hpValue: 200, mpValue: 100 },
    description: 'Restores 200 HP and 100 MP.',
    levelReq: 20,
    buyPrice: 300,
    sellPrice: 120,
    stackable: true,
    maxStack: 99,
    usableInCombat: true
  },
  
  full_restoration_elixir: {
    id: 'full_restoration_elixir',
    name: 'Full Restoration Elixir',
    icon: '⚗️',
    type: 'consumable',
    subType: 'potion',
    rarity: 'epic',
    effect: { type: 'full_restore' },
    description: 'Fully restores HP and MP.',
    levelReq: 40,
    buyPrice: 1000,
    sellPrice: 400,
    stackable: true,
    maxStack: 20,
    usableInCombat: true
  },

  // ============================================================
  // BUFF POTIONS (Combat)
  // ============================================================
  strength_elixir: {
    id: 'strength_elixir',
    name: 'Strength Elixir',
    icon: '💪',
    type: 'consumable',
    subType: 'buff_potion',
    rarity: 'uncommon',
    effect: { type: 'buff', stat: 'pAtk', value: 20, duration: 5 },
    description: 'Increases P.ATK by 20 for 5 turns.',
    levelReq: 10,
    buyPrice: 150,
    sellPrice: 60,
    stackable: true,
    maxStack: 50,
    usableInCombat: true
  },
  
  intelligence_elixir: {
    id: 'intelligence_elixir',
    name: 'Intelligence Elixir',
    icon: '🧠',
    type: 'consumable',
    subType: 'buff_potion',
    rarity: 'uncommon',
    effect: { type: 'buff', stat: 'mAtk', value: 25, duration: 5 },
    description: 'Increases M.ATK by 25 for 5 turns.',
    levelReq: 10,
    buyPrice: 150,
    sellPrice: 60,
    stackable: true,
    maxStack: 50,
    usableInCombat: true
  },
  
  iron_skin_potion: {
    id: 'iron_skin_potion',
    name: 'Iron Skin Potion',
    icon: '🛡️',
    type: 'consumable',
    subType: 'buff_potion',
    rarity: 'uncommon',
    effect: { type: 'buff', stat: 'pDef', value: 30, duration: 5 },
    description: 'Increases P.DEF by 30 for 5 turns.',
    levelReq: 10,
    buyPrice: 150,
    sellPrice: 60,
    stackable: true,
    maxStack: 50,
    usableInCombat: true
  },
  
  swift_potion: {
    id: 'swift_potion',
    name: 'Swift Potion',
    icon: '💨',
    type: 'consumable',
    subType: 'buff_potion',
    rarity: 'uncommon',
    effect: { type: 'buff', stat: 'agi', value: 15, duration: 5 },
    description: 'Increases AGI by 15 for 5 turns.',
    levelReq: 10,
    buyPrice: 150,
    sellPrice: 60,
    stackable: true,
    maxStack: 50,
    usableInCombat: true
  },
  
  critical_elixir: {
    id: 'critical_elixir',
    name: 'Critical Elixir',
    icon: '🎯',
    type: 'consumable',
    subType: 'buff_potion',
    rarity: 'rare',
    effect: { type: 'buff', stat: 'critRate', value: 15, duration: 5 },
    description: 'Increases Crit Rate by 15% for 5 turns.',
    levelReq: 20,
    buyPrice: 300,
    sellPrice: 120,
    stackable: true,
    maxStack: 30,
    usableInCombat: true
  },
  
  berserker_draught: {
    id: 'berserker_draught',
    name: 'Berserker Draught',
    icon: '🔴',
    type: 'consumable',
    subType: 'buff_potion',
    rarity: 'epic',
    effect: { 
      type: 'multi_buff', 
      buffs: [
        { stat: 'pAtk', value: 50 },
        { stat: 'critDmg', value: 30 }
      ],
      debuffs: [
        { stat: 'pDef', value: -20 }
      ],
      duration: 3 
    },
    description: '+50 P.ATK, +30% Crit DMG, but -20 P.DEF for 3 turns.',
    levelReq: 35,
    buyPrice: 500,
    sellPrice: 200,
    stackable: true,
    maxStack: 20,
    usableInCombat: true
  },

  // ============================================================
  // UTILITY ITEMS
  // ============================================================
  escape_rope: {
    id: 'escape_rope',
    name: 'Escape Rope',
    icon: '🪢',
    type: 'consumable',
    subType: 'utility',
    rarity: 'common',
    effect: { type: 'escape_tower' },
    description: 'Instantly escape from the current tower. Progress is saved.',
    levelReq: 1,
    buyPrice: 100,
    sellPrice: 40,
    stackable: true,
    maxStack: 10,
    usableInCombat: false
  },
  
  energy_drink: {
    id: 'energy_drink',
    name: 'Energy Drink',
    icon: '🥤',
    type: 'consumable',
    subType: 'utility',
    rarity: 'uncommon',
    effect: { type: 'restore_energy', value: 20 },
    description: 'Restores 20 Energy.',
    levelReq: 1,
    buyPrice: 200,
    sellPrice: 80,
    stackable: true,
    maxStack: 20,
    usableInCombat: false
  },
  
  mega_energy_drink: {
    id: 'mega_energy_drink',
    name: 'Mega Energy Drink',
    icon: '🥤',
    type: 'consumable',
    subType: 'utility',
    rarity: 'rare',
    effect: { type: 'restore_energy', value: 50 },
    description: 'Restores 50 Energy.',
    levelReq: 1,
    buyPrice: 500,
    sellPrice: 200,
    stackable: true,
    maxStack: 10,
    usableInCombat: false
  },

  // ============================================================
  // REVIVAL ITEMS
  // ============================================================
  phoenix_feather: {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    icon: '🪶',
    type: 'consumable',
    subType: 'revival',
    rarity: 'epic',
    effect: { type: 'auto_revive', hpPercent: 30 },
    description: 'Automatically revives you with 30% HP when defeated (consumed before death).',
    levelReq: 20,
    buyPrice: 1000,
    sellPrice: 400,
    stackable: true,
    maxStack: 5,
    usableInCombat: false
  },

  // ============================================================
  // EXP ITEMS
  // ============================================================
  exp_scroll_small: {
    id: 'exp_scroll_small',
    name: 'Small EXP Scroll',
    icon: '📜',
    type: 'consumable',
    subType: 'exp',
    rarity: 'uncommon',
    effect: { type: 'grant_exp', value: 100 },
    description: 'Grants 100 EXP.',
    levelReq: 1,
    buyPrice: null,
    sellPrice: 50,
    stackable: true,
    maxStack: 99,
    usableInCombat: false
  },
  
  exp_scroll_medium: {
    id: 'exp_scroll_medium',
    name: 'Medium EXP Scroll',
    icon: '📜',
    type: 'consumable',
    subType: 'exp',
    rarity: 'rare',
    effect: { type: 'grant_exp', value: 500 },
    description: 'Grants 500 EXP.',
    levelReq: 1,
    buyPrice: null,
    sellPrice: 250,
    stackable: true,
    maxStack: 99,
    usableInCombat: false
  },
  
  exp_scroll_large: {
    id: 'exp_scroll_large',
    name: 'Large EXP Scroll',
    icon: '📜',
    type: 'consumable',
    subType: 'exp',
    rarity: 'epic',
    effect: { type: 'grant_exp', value: 2000 },
    description: 'Grants 2000 EXP.',
    levelReq: 1,
    buyPrice: null,
    sellPrice: 1000,
    stackable: true,
    maxStack: 99,
    usableInCombat: false
  },

  // ============================================================
  // STAT RESET ITEMS
  // ============================================================
  stat_reset_scroll: {
    id: 'stat_reset_scroll',
    name: 'Stat Reset Scroll',
    icon: '📜✨',
    type: 'consumable',
    subType: 'utility',
    rarity: 'epic',
    effect: { type: 'reset_stats' },
    description: 'Resets all allocated stat points. Allows redistribution.',
    levelReq: 1,
    buyPrice: 2000,
    sellPrice: 800,
    stackable: true,
    maxStack: 10,
    usableInCombat: false
  },

  // ============================================================
  // ANTIDOTES & CLEANSE
  // ============================================================
  antidote: {
    id: 'antidote',
    name: 'Antidote',
    icon: '💊',
    type: 'consumable',
    subType: 'cure',
    rarity: 'common',
    effect: { type: 'cure_debuff', debuffType: 'poison' },
    description: 'Cures poison status.',
    levelReq: 1,
    buyPrice: 30,
    sellPrice: 12,
    stackable: true,
    maxStack: 99,
    usableInCombat: true
  },
  
  panacea: {
    id: 'panacea',
    name: 'Panacea',
    icon: '💎',
    type: 'consumable',
    subType: 'cure',
    rarity: 'rare',
    effect: { type: 'cure_all_debuffs' },
    description: 'Cures all negative status effects.',
    levelReq: 15,
    buyPrice: 250,
    sellPrice: 100,
    stackable: true,
    maxStack: 30,
    usableInCombat: true
  }
};

// ============================================================
// CONSUMABLE HELPERS
// ============================================================

export const CONSUMABLE_HELPERS = {
  /**
   * Get consumables by subType
   */
  getBySubType: (subType) => {
    return Object.values(CONSUMABLES).filter(c => c.subType === subType);
  },

  /**
   * Get consumables usable in combat
   */
  getCombatUsable: () => {
    return Object.values(CONSUMABLES).filter(c => c.usableInCombat);
  },

  /**
   * Get consumables by rarity
   */
  getByRarity: (rarity) => {
    return Object.values(CONSUMABLES).filter(c => c.rarity === rarity);
  },

  /**
   * Get shop available consumables (has buyPrice)
   */
  getShopItems: () => {
    return Object.values(CONSUMABLES).filter(c => c.buyPrice !== null);
  },

  /**
   * Check if player can use consumable
   */
  canUse: (consumableId, playerLevel, inCombat = false) => {
    const item = CONSUMABLES[consumableId];
    if (!item) return { canUse: false, reason: 'Item not found' };
    
    if (playerLevel < item.levelReq) {
      return { canUse: false, reason: `Requires level ${item.levelReq}` };
    }
    
    if (inCombat && !item.usableInCombat) {
      return { canUse: false, reason: 'Cannot use this item in combat' };
    }
    
    return { canUse: true, reason: null };
  }
};

export default {
  CONSUMABLES,
  CONSUMABLE_HELPERS
};
