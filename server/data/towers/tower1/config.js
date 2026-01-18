// ============================================================
// TOWER 1 CONFIG - Crimson Spire
// Edit this file to change tower settings
// ============================================================

export const TOWER1_CONFIG = {
  id: 1,
  name: 'Crimson Spire',
  description: 'Ancient ruins filled with undead creatures',
  theme: 'undead',
  element: 'dark',
  icon: '🩸',
  floors: 15,
  levelRange: { min: 1, max: 15 },
  lootTier: ['common', 'uncommon', 'rare'],
  background: 'crimson',
  
  // Unlock requirement (null for first tower)
  requirement: null,
  
  // Boss info
  boss: {
    name: 'Death Knight',
    icon: '💀',
    floor: 15
  }
};

export default TOWER1_CONFIG;
