// ============================================================
// TOWER 5 MATERIALS - Verdant Spire
// Edit this file to add/modify material drops for Tower 5
// ============================================================

export const TOWER5_MATERIALS = [
  {
    id: 'living_vine',
    name: 'Living Vine',
    icon: '🌿',
    type: 'material',
    rarity: 'common',
    dropChance: 0.35,
    quantity: { min: 1, max: 3 },
    sellPrice: 18,
    description: 'Vine that still moves on its own.'
  },
  {
    id: 'nature_essence',
    name: 'Nature Essence',
    icon: '💚',
    type: 'material',
    rarity: 'common',
    dropChance: 0.30,
    quantity: { min: 1, max: 2 },
    sellPrice: 22,
    description: 'Pure essence of nature magic.'
  },
  {
    id: 'ancient_bark',
    name: 'Ancient Bark',
    icon: '🪵',
    type: 'material',
    rarity: 'uncommon',
    dropChance: 0.20,
    quantity: { min: 1, max: 1 },
    sellPrice: 55,
    description: 'Bark from a centuries-old tree.'
  },
  {
    id: 'treant_heartwood',
    name: 'Treant Heartwood',
    icon: '💎',
    type: 'material',
    rarity: 'rare',
    isBossDrop: true,
    dropChance: 0.60,
    quantity: { min: 1, max: 1 },
    sellPrice: 280,
    description: 'Heartwood of the Guardian Treant boss.'
  }
];

export default TOWER5_MATERIALS;
