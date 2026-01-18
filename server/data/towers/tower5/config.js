// ============================================================
// TOWER 5 CONFIG - Verdant Spire
// Edit this file to change tower settings
// ============================================================

export const TOWER5_CONFIG = {
  id: 5,
  name: 'Verdant Spire',
  description: 'Ancient tower overgrown with sentient plants',
  theme: 'nature',
  element: 'nature',
  icon: '🌿',
  floors: 15,
  levelRange: { min: 40, max: 55 },
  lootTier: ['rare', 'epic', 'legendary'],
  background: 'verdant',
  
  requirement: { tower: 4, cleared: true },
  
  boss: {
    name: 'Guardian Treant',
    icon: '🌳',
    floor: 15
  }
};

export default TOWER5_CONFIG;
