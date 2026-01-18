// ============================================================
// TOWER 4 MATERIALS - Storm Bastion
// Edit this file to add/modify material drops for Tower 4
// ============================================================

export const TOWER4_MATERIALS = [
  {
    id: 'lightning_shard',
    name: 'Lightning Shard',
    icon: '⚡',
    type: 'material',
    rarity: 'common',
    dropChance: 0.35,
    quantity: { min: 1, max: 3 },
    sellPrice: 12,
    description: 'Crystallized lightning energy.'
  },
  {
    id: 'storm_essence',
    name: 'Storm Essence',
    icon: '🌩️',
    type: 'material',
    rarity: 'common',
    dropChance: 0.30,
    quantity: { min: 1, max: 2 },
    sellPrice: 15,
    description: 'Condensed storm energy.'
  },
  {
    id: 'thunder_core',
    name: 'Thunder Core',
    icon: '💎',
    type: 'material',
    rarity: 'uncommon',
    dropChance: 0.20,
    quantity: { min: 1, max: 1 },
    sellPrice: 40,
    description: 'Core crackling with thunder.'
  },
  {
    id: 'storm_titan_heart',
    name: 'Storm Titan Heart',
    icon: '💜',
    type: 'material',
    rarity: 'rare',
    isBossDrop: true,
    dropChance: 0.60,
    quantity: { min: 1, max: 1 },
    sellPrice: 200,
    description: 'Heart of the Storm Titan boss.'
  }
];

export default TOWER4_MATERIALS;
