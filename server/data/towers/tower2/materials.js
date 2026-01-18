// ============================================================
// TOWER 2 MATERIALS - Frost Citadel
// Edit this file to add/modify material drops for Tower 2
// ============================================================

export const TOWER2_MATERIALS = [
  {
    id: 'ice_shard',
    name: 'Ice Shard',
    icon: '🧊',
    type: 'material',
    rarity: 'common',
    dropChance: 0.40,
    quantity: { min: 1, max: 3 },
    sellPrice: 4,
    description: 'Sharp shard of magical ice.'
  },
  {
    id: 'frost_dust',
    name: 'Frost Dust',
    icon: '✨',
    type: 'material',
    rarity: 'common',
    dropChance: 0.35,
    quantity: { min: 1, max: 2 },
    sellPrice: 5,
    description: 'Glittering dust from ice creatures.'
  },
  {
    id: 'frozen_heart',
    name: 'Frozen Heart',
    icon: '💙',
    type: 'material',
    rarity: 'uncommon',
    dropChance: 0.25,
    quantity: { min: 1, max: 2 },
    sellPrice: 15,
    description: 'Heart of an ice creature.'
  },
  {
    id: 'frost_wyrm_scale',
    name: 'Frost Wyrm Scale',
    icon: '🐲',
    type: 'material',
    rarity: 'rare',
    isBossDrop: true,
    dropChance: 0.60,
    quantity: { min: 1, max: 1 },
    sellPrice: 120,
    description: 'Scale from the Frost Wyrm boss.'
  }
];

export default TOWER2_MATERIALS;
