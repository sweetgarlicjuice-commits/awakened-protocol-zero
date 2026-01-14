// ============================================================
// SET ITEMS DATABASE - Complete Equipment Sets for All 10 Towers
// ============================================================

// Set bonus configurations
export const SET_BONUSES = {
  gridz: { name: 'Gridz', tower: 1, bonuses: { 3: { primaryStat: 20, desc: '+20 Primary Stat' }, 5: { primaryStat: 50, critChance: 10, desc: '+50 Primary, +10% Crit' } } },
  tempest: { name: 'Tempest', tower: 2, bonuses: { 3: { primaryStat: 40, def: 15, desc: '+40 Primary, +15 DEF' }, 5: { primaryStat: 100, def: 30, dmgBonus: 10, desc: '+100 Primary, +30 DEF, +10% DMG' } } },
  inferno: { name: 'Inferno', tower: 3, bonuses: { 3: { primaryStat: 60, vit: 30, desc: '+60 Primary, +30 VIT' }, 5: { primaryStat: 150, dmgBonus: 15, desc: '+150 Primary, +15% DMG' } } },
  glacial: { name: 'Glacial', tower: 4, bonuses: { 3: { primaryStat: 80, def: 40, desc: '+80 Primary, +40 DEF' }, 5: { primaryStat: 200, dmgBonus: 20, desc: '+200 Primary, +20% DMG' } } },
  nightmare: { name: 'Nightmare', tower: 5, bonuses: { 3: { primaryStat: 120, vit: 60, desc: '+120 Primary, +60 VIT' }, 5: { primaryStat: 300, dmgBonus: 25, lifesteal: 10, desc: '+300 Primary, +25% DMG, +10% Lifesteal' } } },
  celestial: { name: 'Celestial', tower: 6, bonuses: { 3: { primaryStat: 180, def: 80, desc: '+180 Primary, +80 DEF' }, 5: { primaryStat: 450, dmgBonus: 30, desc: '+450 Primary, +30% DMG' } } },
  abyssal: { name: 'Abyssal', tower: 7, bonuses: { 3: { primaryStat: 250, vit: 100, desc: '+250 Primary, +100 VIT' }, 5: { primaryStat: 600, dmgBonus: 35, critDmg: 50, desc: '+600 Primary, +35% DMG, +50% Crit DMG' } } },
  dragonborn: { name: 'Dragonborn', tower: 8, bonuses: { 3: { primaryStat: 350, def: 120, desc: '+350 Primary, +120 DEF' }, 5: { primaryStat: 800, dmgBonus: 40, allStats: 50, desc: '+800 Primary, +40% DMG, +50 All Stats' } } },
  eternal: { name: 'Eternal', tower: 9, bonuses: { 3: { primaryStat: 450, vit: 150, desc: '+450 Primary, +150 VIT' }, 5: { primaryStat: 1000, dmgBonus: 50, allStats: 80, desc: '+1000 Primary, +50% DMG, +80 All Stats' } } },
  divine: { name: 'Divine', tower: 10, bonuses: { 3: { primaryStat: 600, def: 200, desc: '+600 Primary, +200 DEF' }, 5: { primaryStat: 1500, dmgBonus: 60, allStats: 100, finalDmg: 20, desc: '+1500 Primary, +60% DMG, +100 All, +20% Final DMG' } } }
};

// Tower configurations for set item generation
const TOWER_CONFIGS = [
  { setId: 'gridz', levelReq: 10, rarity: 'epic', mult: 1 },
  { setId: 'tempest', levelReq: 25, rarity: 'epic', mult: 1.8 },
  { setId: 'inferno', levelReq: 40, rarity: 'legendary', mult: 2.8 },
  { setId: 'glacial', levelReq: 60, rarity: 'legendary', mult: 4 },
  { setId: 'nightmare', levelReq: 85, rarity: 'legendary', mult: 6 },
  { setId: 'celestial', levelReq: 115, rarity: 'mythical', mult: 9 },
  { setId: 'abyssal', levelReq: 145, rarity: 'mythical', mult: 13 },
  { setId: 'dragonborn', levelReq: 170, rarity: 'mythical', mult: 18 },
  { setId: 'eternal', levelReq: 185, rarity: 'mythical', mult: 24 },
  { setId: 'divine', levelReq: 195, rarity: 'mythical', mult: 32 }
];

// Base stats per class per slot
const BASE_STATS = {
  swordsman: { leftHand: { str: 30, atk: 25 }, head: { vit: 20, def: 15 }, body: { vit: 25, def: 20 }, leg: { str: 15, vit: 10 }, shoes: { agi: 10, vit: 10 } },
  thief: { leftHand: { agi: 30, atk: 20 }, head: { agi: 20, critChance: 5 }, body: { agi: 25, def: 10 }, leg: { agi: 15, critChance: 3 }, shoes: { agi: 20, vit: 5 } },
  archer: { leftHand: { dex: 30, atk: 22 }, head: { dex: 20, precision: 10 }, body: { dex: 22, def: 8 }, leg: { dex: 15, agi: 8 }, shoes: { agi: 15, dex: 10 } },
  mage: { leftHand: { int: 35, magicAtk: 25 }, head: { int: 22, mana: 20 }, body: { int: 25, mana: 25 }, leg: { int: 15, vit: 10 }, shoes: { int: 18, mana: 12 } }
};

const SLOT_NAMES = { leftHand: 'Weapon', head: 'Helm', body: 'Armor', leg: 'Greaves', shoes: 'Boots' };
const SLOT_ICONS = { leftHand: { swordsman: '⚔️', thief: '🗡️', archer: '🏹', mage: '🪄' }, head: '🪖', body: '🛡️', leg: '👖', shoes: '👢' };

// Generate all set items
export const SET_ITEMS = {};

TOWER_CONFIGS.forEach(config => {
  SET_ITEMS[config.setId] = {};
  const setName = config.setId.charAt(0).toUpperCase() + config.setId.slice(1);
  
  ['swordsman', 'thief', 'archer', 'mage'].forEach(classId => {
    SET_ITEMS[config.setId][classId] = {};
    
    ['leftHand', 'head', 'body', 'leg', 'shoes'].forEach(slot => {
      const baseStats = BASE_STATS[classId][slot];
      const scaledStats = {};
      Object.entries(baseStats).forEach(([stat, val]) => { scaledStats[stat] = Math.floor(val * config.mult); });
      
      const icon = typeof SLOT_ICONS[slot] === 'object' ? SLOT_ICONS[slot][classId] : SLOT_ICONS[slot];
      
      SET_ITEMS[config.setId][classId][slot] = {
        id: config.setId + '_' + slot + '_' + classId,
        name: setName + ' ' + SLOT_NAMES[slot],
        icon: icon,
        slot: slot,
        rarity: config.rarity,
        levelReq: config.levelReq,
        setId: config.setId,
        classReq: classId,
        stats: scaledStats,
        sellPrice: Math.floor(100 * config.mult)
      };
    });
  });
});

// ============================================================
// NON-SET EQUIPMENT BY RARITY
// ============================================================

export const NON_SET_EQUIPMENT = {
  common: {
    weapons: {
      swordsman: [{ id: 'wooden_sword', name: 'Wooden Sword', icon: '🗡️', slot: 'leftHand', levelReq: 1, stats: { str: 3, atk: 5 }, sellPrice: 10 }],
      thief: [{ id: 'wooden_dagger', name: 'Wooden Dagger', icon: '🔪', slot: 'leftHand', levelReq: 1, stats: { agi: 3, atk: 4 }, sellPrice: 10 }],
      archer: [{ id: 'wooden_bow', name: 'Wooden Bow', icon: '🏹', slot: 'leftHand', levelReq: 1, stats: { dex: 3, atk: 4 }, sellPrice: 10 }],
      mage: [{ id: 'wooden_staff', name: 'Wooden Staff', icon: '🪄', slot: 'leftHand', levelReq: 1, stats: { int: 4, magicAtk: 5 }, sellPrice: 10 }]
    },
    armor: [
      { id: 'cloth_shirt', name: 'Cloth Shirt', icon: '👕', slot: 'body', levelReq: 1, stats: { def: 2, vit: 3 }, sellPrice: 8 },
      { id: 'leather_cap', name: 'Leather Cap', icon: '🧢', slot: 'head', levelReq: 1, stats: { def: 1, vit: 2 }, sellPrice: 6 },
      { id: 'cloth_pants', name: 'Cloth Pants', icon: '👖', slot: 'leg', levelReq: 1, stats: { def: 1, vit: 2 }, sellPrice: 6 },
      { id: 'sandals', name: 'Sandals', icon: '👟', slot: 'shoes', levelReq: 1, stats: { agi: 2 }, sellPrice: 5 }
    ],
    accessories: [
      { id: 'copper_ring', name: 'Copper Ring', icon: '💍', slot: 'ring', levelReq: 1, stats: { str: 1, agi: 1 }, sellPrice: 15 },
      { id: 'wooden_pendant', name: 'Wooden Pendant', icon: '📿', slot: 'necklace', levelReq: 1, stats: { vit: 2 }, sellPrice: 12 }
    ]
  },
  rare: {
    weapons: {
      swordsman: [{ id: 'iron_sword', name: 'Iron Sword', icon: '⚔️', slot: 'leftHand', levelReq: 10, stats: { str: 15, atk: 20 }, sellPrice: 80 }],
      thief: [{ id: 'steel_dagger', name: 'Steel Dagger', icon: '🗡️', slot: 'leftHand', levelReq: 10, stats: { agi: 15, atk: 18 }, sellPrice: 80 }],
      archer: [{ id: 'composite_bow', name: 'Composite Bow', icon: '🏹', slot: 'leftHand', levelReq: 10, stats: { dex: 15, atk: 19 }, sellPrice: 80 }],
      mage: [{ id: 'oak_staff', name: 'Oak Staff', icon: '🪄', slot: 'leftHand', levelReq: 10, stats: { int: 18, magicAtk: 22 }, sellPrice: 80 }]
    },
    armor: [
      { id: 'leather_armor', name: 'Leather Armor', icon: '🧥', slot: 'body', levelReq: 10, stats: { def: 12, vit: 15 }, sellPrice: 70 },
      { id: 'iron_helm', name: 'Iron Helm', icon: '🪖', slot: 'head', levelReq: 10, stats: { def: 8, vit: 10 }, sellPrice: 55 }
    ],
    accessories: [
      { id: 'silver_ring', name: 'Silver Ring', icon: '💍', slot: 'ring', levelReq: 10, stats: { str: 5, agi: 5 }, sellPrice: 100 }
    ]
  },
  epic: {
    weapons: {
      swordsman: [{ id: 'knights_sword', name: "Knight's Sword", icon: '⚔️', slot: 'leftHand', levelReq: 30, stats: { str: 45, atk: 55 }, sellPrice: 500 }],
      thief: [{ id: 'shadow_knife', name: 'Shadow Knife', icon: '🗡️', slot: 'leftHand', levelReq: 30, stats: { agi: 45, atk: 50, critChance: 8 }, sellPrice: 500 }],
      archer: [{ id: 'wind_bow', name: 'Wind Bow', icon: '🏹', slot: 'leftHand', levelReq: 30, stats: { dex: 45, atk: 52, precision: 12 }, sellPrice: 500 }],
      mage: [{ id: 'arcane_staff', name: 'Arcane Staff', icon: '🪄', slot: 'leftHand', levelReq: 30, stats: { int: 50, magicAtk: 60, mana: 30 }, sellPrice: 500 }]
    },
    armor: [
      { id: 'plate_armor', name: 'Plate Armor', icon: '🛡️', slot: 'body', levelReq: 30, stats: { def: 35, vit: 40 }, sellPrice: 450 },
      { id: 'steel_helm', name: 'Steel Helm', icon: '🪖', slot: 'head', levelReq: 30, stats: { def: 25, vit: 30 }, sellPrice: 380 }
    ],
    accessories: [
      { id: 'gold_ring', name: 'Gold Ring', icon: '💍', slot: 'ring', levelReq: 30, stats: { str: 15, agi: 15, int: 15, dex: 15 }, sellPrice: 600 }
    ]
  },
  legendary: {
    weapons: {
      swordsman: [{ id: 'dragon_slayer', name: 'Dragon Slayer', icon: '⚔️', slot: 'leftHand', levelReq: 60, stats: { str: 100, atk: 120, critChance: 10 }, sellPrice: 3000 }],
      thief: [{ id: 'soul_reaper', name: 'Soul Reaper', icon: '🗡️', slot: 'leftHand', levelReq: 60, stats: { agi: 100, atk: 110, critChance: 20 }, sellPrice: 3000 }],
      archer: [{ id: 'phoenix_bow', name: 'Phoenix Bow', icon: '🏹', slot: 'leftHand', levelReq: 60, stats: { dex: 100, atk: 115, precision: 25 }, sellPrice: 3000 }],
      mage: [{ id: 'void_staff', name: 'Void Staff', icon: '🪄', slot: 'leftHand', levelReq: 60, stats: { int: 110, magicAtk: 130, mana: 60 }, sellPrice: 3000 }]
    },
    armor: [
      { id: 'dragon_armor', name: 'Dragon Armor', icon: '🛡️', slot: 'body', levelReq: 60, stats: { def: 80, vit: 90, str: 30 }, sellPrice: 2800 },
      { id: 'dragon_helm', name: 'Dragon Helm', icon: '🪖', slot: 'head', levelReq: 60, stats: { def: 55, vit: 65 }, sellPrice: 2400 }
    ],
    accessories: [
      { id: 'dragon_ring', name: 'Dragon Ring', icon: '💍', slot: 'ring', levelReq: 60, stats: { str: 35, agi: 35, int: 35, dex: 35 }, sellPrice: 3500 }
    ]
  },
  mythical: {
    weapons: {
      swordsman: [{ id: 'godslayer', name: 'Godslayer', icon: '⚔️', slot: 'leftHand', levelReq: 150, stats: { str: 300, atk: 350, critChance: 25, dmgBonus: 20 }, sellPrice: 25000 }],
      thief: [{ id: 'void_fang', name: 'Void Fang', icon: '🗡️', slot: 'leftHand', levelReq: 150, stats: { agi: 300, atk: 320, critChance: 40, critDmg: 60 }, sellPrice: 25000 }],
      archer: [{ id: 'celestial_bow', name: 'Celestial Bow', icon: '🏹', slot: 'leftHand', levelReq: 150, stats: { dex: 300, atk: 330, precision: 50, critChance: 30 }, sellPrice: 25000 }],
      mage: [{ id: 'archmage_staff', name: 'Archmage Staff', icon: '🪄', slot: 'leftHand', levelReq: 150, stats: { int: 320, magicAtk: 380, mana: 150, dmgBonus: 25 }, sellPrice: 25000 }]
    },
    armor: [
      { id: 'divine_armor', name: 'Divine Armor', icon: '🛡️', slot: 'body', levelReq: 150, stats: { def: 200, vit: 250, allStats: 50 }, sellPrice: 22000 },
      { id: 'divine_helm', name: 'Divine Helm', icon: '🪖', slot: 'head', levelReq: 150, stats: { def: 140, vit: 180, allStats: 30 }, sellPrice: 18000 }
    ],
    accessories: [
      { id: 'divine_ring', name: 'Divine Ring', icon: '💍', slot: 'ring', levelReq: 150, stats: { str: 80, agi: 80, int: 80, dex: 80, vit: 50 }, sellPrice: 28000 }
    ]
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getRandomEquipment(towerId, baseClass, isElite, isBoss) {
  let rarity = 'common';
  if (towerId <= 2) rarity = isBoss ? 'rare' : (isElite ? 'rare' : (Math.random() < 0.7 ? 'common' : 'rare'));
  else if (towerId <= 4) rarity = isBoss ? 'epic' : (isElite ? 'epic' : (Math.random() < 0.6 ? 'rare' : 'epic'));
  else if (towerId <= 6) rarity = isBoss ? 'legendary' : (isElite ? 'legendary' : (Math.random() < 0.5 ? 'epic' : 'legendary'));
  else rarity = isBoss ? 'mythical' : (isElite ? 'mythical' : (Math.random() < 0.4 ? 'legendary' : 'mythical'));
  
  const eq = NON_SET_EQUIPMENT[rarity];
  if (!eq) return null;
  
  const types = ['weapons', 'armor', 'accessories'];
  const type = types[Math.floor(Math.random() * types.length)];
  const pool = type === 'weapons' ? (eq.weapons[baseClass] || eq.weapons.swordsman) : eq[type];
  if (!pool || !pool.length) return null;
  
  return { ...pool[Math.floor(Math.random() * pool.length)], rarity };
}

export function getSetItemDrop(towerId, baseClass) {
  const sets = ['gridz', 'tempest', 'inferno', 'glacial', 'nightmare', 'celestial', 'abyssal', 'dragonborn', 'eternal', 'divine'];
  const setId = sets[towerId - 1];
  if (!SET_ITEMS[setId] || !SET_ITEMS[setId][baseClass]) return null;
  
  const slots = ['leftHand', 'head', 'body', 'leg', 'shoes'];
  return SET_ITEMS[setId][baseClass][slots[Math.floor(Math.random() * slots.length)]];
}

export function calculateSetBonus(equippedItems, baseClass) {
  const counts = {};
  equippedItems.forEach(item => { if (item?.setId) counts[item.setId] = (counts[item.setId] || 0) + 1; });
  
  const bonuses = { str: 0, agi: 0, dex: 0, int: 0, vit: 0, def: 0, critChance: 0, critDmg: 0, dmgBonus: 0, allStats: 0, finalDmg: 0, mana: 0, lifesteal: 0, precision: 0 };
  const active = [];
  const primaryMap = { swordsman: 'str', thief: 'agi', archer: 'dex', mage: 'int' };
  const primary = primaryMap[baseClass] || 'str';
  
  Object.entries(counts).forEach(([setId, count]) => {
    const set = SET_BONUSES[setId];
    if (!set) return;
    
    [3, 5].forEach(n => {
      if (count >= n && set.bonuses[n]) {
        const b = set.bonuses[n];
        Object.entries(b).forEach(([k, v]) => {
          if (k === 'desc') return;
          if (k === 'primaryStat') bonuses[primary] += v;
          else if (bonuses[k] !== undefined) bonuses[k] += v;
        });
        active.push({ set: set.name, pieces: n, desc: b.desc });
      }
    });
  });
  
  return { bonuses, activeSetBonuses: active, setCounts: counts };
}
