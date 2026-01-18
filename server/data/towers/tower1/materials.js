// ============================================================
// TOWER 1 MATERIALS - Crimson Spire
// Edit this file to add/modify material drops for Tower 1
// ============================================================

export const TOWER1_MATERIALS = [
  {
    id: 'bone_fragment',
    name: 'Bone Fragment',
    icon: '🦴',
    type: 'material',
    rarity: 'common',
    dropChance: 0.40,
    quantity: { min: 1, max: 4 },
    sellPrice: 3,
    description: 'Fragment from undead skeleton.'
  },
  {
    id: 'cursed_cloth',
    name: 'Cursed Cloth',
    icon: '🧵',
    type: 'material',
    rarity: 'common',
    dropChance: 0.30,
    quantity: { min: 1, max: 2 },
    sellPrice: 5,
    description: 'Cloth tainted with dark magic.'
  },
  {
    id: 'cursed_bone',
    name: 'Cursed Bone',
    icon: '💀',
    type: 'material',
    rarity: 'uncommon',
    dropChance: 0.25,
    quantity: { min: 1, max: 2 },
    sellPrice: 12,
    description: 'Bone infused with dark magic.'
  },
  {
    id: 'death_knight_core',
    name: 'Death Knight Core',
    icon: '⚫',
    type: 'material',
    rarity: 'rare',
    isBossDrop: true,
    dropChance: 0.60,
    quantity: { min: 1, max: 1 },
    sellPrice: 100,
    description: 'Core of the Death Knight boss.'
  }
];

export default TOWER1_MATERIALS;
