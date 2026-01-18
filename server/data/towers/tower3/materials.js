// ============================================================
// TOWER 3 MATERIALS - Shadow Keep
// Edit this file to add/modify material drops for Tower 3
// ============================================================

export const TOWER3_MATERIALS = [
  {
    id: 'shadow_essence',
    name: 'Shadow Essence',
    icon: '🌑',
    type: 'material',
    rarity: 'common',
    dropChance: 0.35,
    quantity: { min: 1, max: 3 },
    sellPrice: 8,
    description: 'Condensed essence of shadow.'
  },
  {
    id: 'dark_silk',
    name: 'Dark Silk',
    icon: '🕸️',
    type: 'material',
    rarity: 'common',
    dropChance: 0.30,
    quantity: { min: 1, max: 2 },
    sellPrice: 10,
    description: 'Silk woven in darkness.'
  },
  {
    id: 'nightmare_dust',
    name: 'Nightmare Dust',
    icon: '✨',
    type: 'material',
    rarity: 'uncommon',
    dropChance: 0.20,
    quantity: { min: 1, max: 1 },
    sellPrice: 25,
    description: 'Dust from nightmare creatures.'
  },
  {
    id: 'shadow_lord_core',
    name: 'Shadow Lord Core',
    icon: '⚫',
    type: 'material',
    rarity: 'rare',
    isBossDrop: true,
    dropChance: 0.60,
    quantity: { min: 1, max: 1 },
    sellPrice: 150,
    description: 'Core of the Shadow Lord boss.'
  }
];

export default TOWER3_MATERIALS;
