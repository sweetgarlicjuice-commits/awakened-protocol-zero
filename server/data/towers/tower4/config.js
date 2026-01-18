// ============================================================
// TOWER 4 CONFIG - Storm Bastion
// Edit this file to change tower settings
// ============================================================

export const TOWER4_CONFIG = {
  id: 4,
  name: 'Storm Bastion',
  description: 'Floating fortress struck by eternal lightning',
  theme: 'storm',
  element: 'lightning',
  icon: '⚡',
  floors: 15,
  levelRange: { min: 30, max: 45 },
  lootTier: ['rare', 'epic'],
  background: 'storm',
  
  requirement: { tower: 3, cleared: true },
  
  boss: {
    name: 'Storm Titan',
    icon: '👁️',
    floor: 15
  }
};

export default TOWER4_CONFIG;
