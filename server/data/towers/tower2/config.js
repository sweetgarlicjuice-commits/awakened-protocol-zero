// ============================================================
// TOWER 2 CONFIG - Frost Citadel
// Edit this file to change tower settings
// ============================================================

export const TOWER2_CONFIG = {
  id: 2,
  name: 'Frost Citadel',
  description: 'Frozen fortress filled with ice creatures',
  theme: 'ice',
  element: 'ice',
  icon: '❄️',
  floors: 15,
  levelRange: { min: 10, max: 25 },
  lootTier: ['uncommon', 'rare', 'epic'],
  background: 'frost',
  
  // Unlock requirement
  requirement: { tower: 1, cleared: true },
  
  // Boss info
  boss: {
    name: 'Frost Wyrm',
    icon: '🐲',
    floor: 15
  }
};

export default TOWER2_CONFIG;
