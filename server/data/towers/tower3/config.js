// ============================================================
// TOWER 3 CONFIG - Shadow Keep
// Edit this file to change tower settings
// ============================================================

export const TOWER3_CONFIG = {
  id: 3,
  name: 'Shadow Keep',
  description: 'Dark fortress shrouded in eternal shadow',
  theme: 'shadow',
  element: 'dark',
  icon: '🌑',
  floors: 15,
  levelRange: { min: 20, max: 35 },
  lootTier: ['rare', 'epic'],
  background: 'shadow',
  
  requirement: { tower: 2, cleared: true },
  
  boss: {
    name: 'Shadow Lord',
    icon: '👑',
    floor: 15
  }
};

export default TOWER3_CONFIG;
