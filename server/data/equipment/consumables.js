// ============================================================
// CONSUMABLES DATABASE
// Potions, food, buff items, and other usable items
// ============================================================

export const CONSUMABLES = {
  
  // ============================================================
  // HEALTH POTIONS
  // ============================================================
  
  small_hp_potion: {
    id: 'small_hp_potion',
    name: 'Small HP Potion',
    icon: '🧪',
    type: 'consumable',
    category: 'potion',
    effect: { heal: 50 },
    stackable: true,
    maxStack: 99,
    dropFloor: 1,
    buyPrice: 30,
    sellPrice: 8,
    description: 'Restores 50 HP.'
  },
  
  medium_hp_potion: {
    id: 'medium_hp_potion',
    name: 'Medium HP Potion',
    icon: '🧪',
    type: 'consumable',
    category: 'potion',
    effect: { heal: 150 },
    stackable: true,
    maxStack: 99,
    dropFloor: 4,
    buyPrice: 80,
    sellPrice: 20,
    description: 'Restores 150 HP.'
  },
  
  large_hp_potion: {
    id: 'large_hp_potion',
    name: 'Large HP Potion',
    icon: '🧪',
    type: 'consumable',
    category: 'potion',
    effect: { heal: 350 },
    stackable: true,
    maxStack: 99,
    dropFloor: 8,
    buyPrice: 200,
    sellPrice: 50,
    description: 'Restores 350 HP.'
  },
  
  mega_hp_potion: {
    id: 'mega_hp_potion',
    name: 'Mega HP Potion',
    icon: '❤️',
    type: 'consumable',
    category: 'potion',
    effect: { healPercent: 50 },
    stackable: true,
    maxStack: 99,
    dropFloor: 12,
    buyPrice: 500,
    sellPrice: 125,
    description: 'Restores 50% of max HP.'
  },
  
  full_hp_potion: {
    id: 'full_hp_potion',
    name: 'Full HP Potion',
    icon: '💖',
    type: 'consumable',
    category: 'potion',
    effect: { healPercent: 100 },
    stackable: true,
    maxStack: 20,
    dropFloor: 15,
    buyPrice: 1500,
    sellPrice: 375,
    description: 'Fully restores HP.'
  },
  
  
  // ============================================================
  // MANA POTIONS
  // ============================================================
  
  small_mp_potion: {
    id: 'small_mp_potion',
    name: 'Small MP Potion',
    icon: '💧',
    type: 'consumable',
    category: 'potion',
    effect: { mana: 30 },
    stackable: true,
    maxStack: 99,
    dropFloor: 1,
    buyPrice: 25,
    sellPrice: 6,
    description: 'Restores 30 MP.'
  },
  
  medium_mp_potion: {
    id: 'medium_mp_potion',
    name: 'Medium MP Potion',
    icon: '💧',
    type: 'consumable',
    category: 'potion',
    effect: { mana: 80 },
    stackable: true,
    maxStack: 99,
    dropFloor: 4,
    buyPrice: 70,
    sellPrice: 18,
    description: 'Restores 80 MP.'
  },
  
  large_mp_potion: {
    id: 'large_mp_potion',
    name: 'Large MP Potion',
    icon: '💧',
    type: 'consumable',
    category: 'potion',
    effect: { mana: 200 },
    stackable: true,
    maxStack: 99,
    dropFloor: 8,
    buyPrice: 180,
    sellPrice: 45,
    description: 'Restores 200 MP.'
  },
  
  mega_mp_potion: {
    id: 'mega_mp_potion',
    name: 'Mega MP Potion',
    icon: '💙',
    type: 'consumable',
    category: 'potion',
    effect: { manaPercent: 50 },
    stackable: true,
    maxStack: 99,
    dropFloor: 12,
    buyPrice: 450,
    sellPrice: 112,
    description: 'Restores 50% of max MP.'
  },
  
  full_mp_potion: {
    id: 'full_mp_potion',
    name: 'Full MP Potion',
    icon: '🔵',
    type: 'consumable',
    category: 'potion',
    effect: { manaPercent: 100 },
    stackable: true,
    maxStack: 20,
    dropFloor: 15,
    buyPrice: 1200,
    sellPrice: 300,
    description: 'Fully restores MP.'
  },
  
  
  // ============================================================
  // COMBINED POTIONS
  // ============================================================
  
  elixir: {
    id: 'elixir',
    name: 'Elixir',
    icon: '✨',
    type: 'consumable',
    category: 'potion',
    effect: { healPercent: 30, manaPercent: 30 },
    stackable: true,
    maxStack: 50,
    dropFloor: 6,
    buyPrice: 300,
    sellPrice: 75,
    description: 'Restores 30% HP and MP.'
  },
  
  mega_elixir: {
    id: 'mega_elixir',
    name: 'Mega Elixir',
    icon: '🌟',
    type: 'consumable',
    category: 'potion',
    effect: { healPercent: 100, manaPercent: 100 },
    stackable: true,
    maxStack: 10,
    dropFloor: 15,
    buyPrice: 3000,
    sellPrice: 750,
    description: 'Fully restores HP and MP.'
  },
  
  
  // ============================================================
  // BUFF POTIONS (Combat buffs)
  // ============================================================
  
  strength_potion: {
    id: 'strength_potion',
    name: 'Strength Potion',
    icon: '💪',
    type: 'consumable',
    category: 'buff',
    effect: { buff: { type: 'pAtk', value: 20, duration: 5 } },
    stackable: true,
    maxStack: 20,
    dropFloor: 3,
    buyPrice: 150,
    sellPrice: 38,
    description: '+20 P.ATK for 5 turns.'
  },
  
  magic_potion: {
    id: 'magic_potion',
    name: 'Magic Potion',
    icon: '🔮',
    type: 'consumable',
    category: 'buff',
    effect: { buff: { type: 'mAtk', value: 20, duration: 5 } },
    stackable: true,
    maxStack: 20,
    dropFloor: 3,
    buyPrice: 150,
    sellPrice: 38,
    description: '+20 M.ATK for 5 turns.'
  },
  
  defense_potion: {
    id: 'defense_potion',
    name: 'Defense Potion',
    icon: '🛡️',
    type: 'consumable',
    category: 'buff',
    effect: { buff: { type: 'pDef', value: 25, duration: 5 } },
    stackable: true,
    maxStack: 20,
    dropFloor: 3,
    buyPrice: 150,
    sellPrice: 38,
    description: '+25 P.DEF for 5 turns.'
  },
  
  speed_potion: {
    id: 'speed_potion',
    name: 'Speed Potion',
    icon: '💨',
    type: 'consumable',
    category: 'buff',
    effect: { buff: { type: 'agi', value: 15, duration: 5 } },
    stackable: true,
    maxStack: 20,
    dropFloor: 4,
    buyPrice: 180,
    sellPrice: 45,
    description: '+15 AGI for 5 turns.'
  },
  
  critical_potion: {
    id: 'critical_potion',
    name: 'Critical Potion',
    icon: '🎯',
    type: 'consumable',
    category: 'buff',
    effect: { buff: { type: 'critRate', value: 15, duration: 5 } },
    stackable: true,
    maxStack: 20,
    dropFloor: 5,
    buyPrice: 250,
    sellPrice: 62,
    description: '+15% Crit Rate for 5 turns.'
  },
  
  berserk_potion: {
    id: 'berserk_potion',
    name: 'Berserk Potion',
    icon: '💢',
    type: 'consumable',
    category: 'buff',
    effect: { buff: { type: 'pAtk', value: 50, duration: 3 } },
    stackable: true,
    maxStack: 10,
    dropFloor: 8,
    buyPrice: 400,
    sellPrice: 100,
    description: '+50 P.ATK for 3 turns.'
  },
  
  
  // ============================================================
  // FOOD (Out of combat recovery)
  // ============================================================
  
  bread: {
    id: 'bread',
    name: 'Bread',
    icon: '🍞',
    type: 'consumable',
    category: 'food',
    effect: { heal: 30 },
    useInCombat: false,
    stackable: true,
    maxStack: 99,
    dropFloor: 1,
    buyPrice: 10,
    sellPrice: 2,
    description: 'Simple bread. Restores 30 HP outside combat.'
  },
  
  meat: {
    id: 'meat',
    name: 'Cooked Meat',
    icon: '🍖',
    type: 'consumable',
    category: 'food',
    effect: { heal: 80 },
    useInCombat: false,
    stackable: true,
    maxStack: 99,
    dropFloor: 2,
    buyPrice: 30,
    sellPrice: 8,
    description: 'Hearty meal. Restores 80 HP outside combat.'
  },
  
  feast: {
    id: 'feast',
    name: 'Hunter\'s Feast',
    icon: '🍱',
    type: 'consumable',
    category: 'food',
    effect: { healPercent: 100, manaPercent: 50 },
    useInCombat: false,
    stackable: true,
    maxStack: 20,
    dropFloor: 8,
    buyPrice: 200,
    sellPrice: 50,
    description: 'Full meal. Restores all HP and 50% MP outside combat.'
  },
  
  
  // ============================================================
  // SPECIAL ITEMS
  // ============================================================
  
  antidote: {
    id: 'antidote',
    name: 'Antidote',
    icon: '💊',
    type: 'consumable',
    category: 'cure',
    effect: { cure: 'poison' },
    stackable: true,
    maxStack: 50,
    dropFloor: 2,
    buyPrice: 50,
    sellPrice: 12,
    description: 'Cures poison.'
  },
  
  phoenix_feather: {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    icon: '🪶',
    type: 'consumable',
    category: 'revive',
    effect: { revive: true, healPercent: 30 },
    stackable: true,
    maxStack: 5,
    dropFloor: 10,
    buyPrice: 2000,
    sellPrice: 500,
    description: 'Revives from defeat with 30% HP.'
  },
  
  escape_scroll: {
    id: 'escape_scroll',
    name: 'Escape Scroll',
    icon: '📜',
    type: 'consumable',
    category: 'utility',
    effect: { escape: true },
    stackable: true,
    maxStack: 20,
    dropFloor: 1,
    buyPrice: 100,
    sellPrice: 25,
    description: 'Instantly escape from tower.'
  },
  
  energy_drink: {
    id: 'energy_drink',
    name: 'Energy Drink',
    icon: '🥤',
    type: 'consumable',
    category: 'utility',
    effect: { energy: 25 },
    stackable: true,
    maxStack: 20,
    dropFloor: 1,
    buyPrice: 200,
    sellPrice: 50,
    description: 'Restores 25 energy.'
  },
  
  energy_elixir: {
    id: 'energy_elixir',
    name: 'Energy Elixir',
    icon: '⚡',
    type: 'consumable',
    category: 'utility',
    effect: { energy: 100 },
    stackable: true,
    maxStack: 10,
    dropFloor: 10,
    buyPrice: 800,
    sellPrice: 200,
    description: 'Fully restores energy.'
  }
};

// ============================================================
// HELPERS
// ============================================================

export const getConsumablesByCategory = (category) => {
  return Object.values(CONSUMABLES).filter(c => c.category === category);
};

export const getPotions = () => getConsumablesByCategory('potion');
export const getBuffPotions = () => getConsumablesByCategory('buff');
export const getFood = () => getConsumablesByCategory('food');
