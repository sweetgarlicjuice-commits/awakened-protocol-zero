// ============================================================
// SPECIAL ITEMS - Hidden Class Scrolls (UNIQUE SYSTEM)
// ============================================================
// 
// UNIQUE SCROLL SYSTEM:
// - Each hidden class scroll exists as ONLY 1 copy in the entire server
// - When a player uses a scroll, it becomes unavailable to everyone
// - When a player uses Memory Crystal to remove hidden class, scroll returns to pool
// - This creates scarcity and value for hidden classes
//
// Database tracking required:
// - ServerState collection tracks which scrolls are available
// - Character.hiddenClass tracks which player has which class
// ============================================================

export const HIDDEN_CLASS_SCROLLS = {
  // ============================================================
  // SWORDSMAN HIDDEN CLASSES (5)
  // ============================================================
  flameblade_scroll: {
    id: 'flameblade_scroll',
    name: 'Scroll of the Flameblade',
    icon: '📜🔥',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'flameblade',
    baseClass: 'swordsman',
    element: 'fire',
    description: 'Ancient scroll containing the secrets of the Flameblade. Burns with eternal flame.',
    lore: 'Those who master the way of the Flameblade become one with fire itself.',
    dropSource: ['boss'],
    dropTowers: [6], // Infernal Fortress
    dropRate: 0.06, // 6% from boss
    isUnique: true,
    sellPrice: null, // Cannot be sold
    tradeable: false
  },
  
  berserker_scroll: {
    id: 'berserker_scroll',
    name: 'Scroll of the Berserker',
    icon: '📜💢',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'berserker',
    baseClass: 'swordsman',
    element: null,
    description: 'Blood-stained scroll that awakens primal rage within the reader.',
    lore: 'The Berserker knows no fear, only the thrill of battle.',
    dropSource: ['boss'],
    dropTowers: [1, 3], // Crimson Spire, Shadow Keep
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  paladin_scroll: {
    id: 'paladin_scroll',
    name: 'Scroll of the Paladin',
    icon: '📜✨',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'paladin',
    baseClass: 'swordsman',
    element: 'holy',
    description: 'Sacred scroll blessed by the divine. Radiates holy light.',
    lore: 'Paladins are chosen defenders of the innocent, wielding both sword and faith.',
    dropSource: ['boss'],
    dropTowers: [8, 10], // Crystal Caverns, Celestial Pinnacle
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  earthshaker_scroll: {
    id: 'earthshaker_scroll',
    name: 'Scroll of the Earthshaker',
    icon: '📜🌍',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'earthshaker',
    baseClass: 'swordsman',
    element: 'earth',
    description: 'Heavy scroll inscribed on stone tablets. The ground trembles in its presence.',
    lore: 'Earthshakers command the very foundation of the world.',
    dropSource: ['boss'],
    dropTowers: [5], // Verdant Spire
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  frostguard_scroll: {
    id: 'frostguard_scroll',
    name: 'Scroll of the Frostguard',
    icon: '📜❄️',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'frostguard',
    baseClass: 'swordsman',
    element: 'ice',
    description: 'Frozen scroll that never melts. Cold emanates from its surface.',
    lore: 'Frostguards are immovable defenders, as unyielding as winter itself.',
    dropSource: ['boss'],
    dropTowers: [2], // Frost Citadel
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },

  // ============================================================
  // THIEF HIDDEN CLASSES (5)
  // ============================================================
  shadowDancer_scroll: {
    id: 'shadowDancer_scroll',
    name: 'Scroll of the Shadow Dancer',
    icon: '📜🌑',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'shadowDancer',
    baseClass: 'thief',
    element: 'dark',
    description: 'Scroll that seems to shift and phase in and out of existence.',
    lore: 'Shadow Dancers move between light and dark, striking from impossible angles.',
    dropSource: ['boss'],
    dropTowers: [3, 9], // Shadow Keep, Void Sanctum
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  venomancer_scroll: {
    id: 'venomancer_scroll',
    name: 'Scroll of the Venomancer',
    icon: '📜🐍',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'venomancer',
    baseClass: 'thief',
    element: 'nature',
    description: 'Toxic scroll that drips with poisonous ichor.',
    lore: 'Venomancers turn nature\'s deadliest gifts into weapons.',
    dropSource: ['boss'],
    dropTowers: [5], // Verdant Spire
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  assassin_scroll: {
    id: 'assassin_scroll',
    name: 'Scroll of the Assassin',
    icon: '📜⚫',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'assassin',
    baseClass: 'thief',
    element: null,
    description: 'Unmarked black scroll. Those who read it learn the art of the kill.',
    lore: 'Assassins end lives with surgical precision. No target escapes.',
    dropSource: ['boss'],
    dropTowers: [1, 3], // Crimson Spire, Shadow Keep
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  phantom_scroll: {
    id: 'phantom_scroll',
    name: 'Scroll of the Phantom',
    icon: '📜👻',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'phantom',
    baseClass: 'thief',
    element: 'dark',
    description: 'Ethereal scroll that passes through solid objects.',
    lore: 'Phantoms walk between worlds, untouchable and unstoppable.',
    dropSource: ['boss'],
    dropTowers: [9], // Void Sanctum
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  bloodreaper_scroll: {
    id: 'bloodreaper_scroll',
    name: 'Scroll of the Bloodreaper',
    icon: '📜🩸',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'bloodreaper',
    baseClass: 'thief',
    element: null,
    description: 'Crimson scroll that hungers for blood.',
    lore: 'Bloodreapers sustain themselves through the life force of their victims.',
    dropSource: ['boss'],
    dropTowers: [1], // Crimson Spire
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },

  // ============================================================
  // ARCHER HIDDEN CLASSES (5)
  // ============================================================
  stormRanger_scroll: {
    id: 'stormRanger_scroll',
    name: 'Scroll of the Storm Ranger',
    icon: '📜⚡',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'stormRanger',
    baseClass: 'archer',
    element: 'lightning',
    description: 'Scroll crackling with electrical energy.',
    lore: 'Storm Rangers rain down arrows like lightning from the sky.',
    dropSource: ['boss'],
    dropTowers: [4], // Storm Bastion
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  pyroArcher_scroll: {
    id: 'pyroArcher_scroll',
    name: 'Scroll of the Pyro Archer',
    icon: '📜🔥',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'pyroArcher',
    baseClass: 'archer',
    element: 'fire',
    description: 'Scroll singed at the edges, permanently warm to touch.',
    lore: 'Pyro Archers set the battlefield ablaze with every volley.',
    dropSource: ['boss'],
    dropTowers: [6], // Infernal Fortress
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  frostSniper_scroll: {
    id: 'frostSniper_scroll',
    name: 'Scroll of the Frost Sniper',
    icon: '📜❄️',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'frostSniper',
    baseClass: 'archer',
    element: 'ice',
    description: 'Perfectly preserved scroll encased in thin ice.',
    lore: 'Frost Snipers strike from impossible distances with freezing precision.',
    dropSource: ['boss'],
    dropTowers: [2], // Frost Citadel
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  natureWarden_scroll: {
    id: 'natureWarden_scroll',
    name: 'Scroll of the Nature Warden',
    icon: '📜🌿',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'natureWarden',
    baseClass: 'archer',
    element: 'nature',
    description: 'Living scroll with vines growing from its surface.',
    lore: 'Nature Wardens protect the wild and commune with beasts.',
    dropSource: ['boss'],
    dropTowers: [5], // Verdant Spire
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  voidHunter_scroll: {
    id: 'voidHunter_scroll',
    name: 'Scroll of the Void Hunter',
    icon: '📜🌀',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'voidHunter',
    baseClass: 'archer',
    element: 'dark',
    description: 'Scroll that seems to absorb light around it.',
    lore: 'Void Hunters pierce any defense with arrows from the abyss.',
    dropSource: ['boss'],
    dropTowers: [9], // Void Sanctum
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },

  // ============================================================
  // MAGE HIDDEN CLASSES (5)
  // ============================================================
  frostWeaver_scroll: {
    id: 'frostWeaver_scroll',
    name: 'Scroll of the Frost Weaver',
    icon: '📜❄️',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'frostWeaver',
    baseClass: 'mage',
    element: 'ice',
    description: 'Scroll covered in intricate frost patterns.',
    lore: 'Frost Weavers control the battlefield with walls of ice and frozen bindings.',
    dropSource: ['boss'],
    dropTowers: [2], // Frost Citadel
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  pyromancer_scroll: {
    id: 'pyromancer_scroll',
    name: 'Scroll of the Pyromancer',
    icon: '📜🔥',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'pyromancer',
    baseClass: 'mage',
    element: 'fire',
    description: 'Scroll that burns with an unquenchable flame.',
    lore: 'Pyromancers embody destruction, burning all in their path.',
    dropSource: ['boss'],
    dropTowers: [6], // Infernal Fortress
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  stormcaller_scroll: {
    id: 'stormcaller_scroll',
    name: 'Scroll of the Stormcaller',
    icon: '📜⚡',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'stormcaller',
    baseClass: 'mage',
    element: 'lightning',
    description: 'Scroll that sparks with contained lightning.',
    lore: 'Stormcallers command the fury of the heavens.',
    dropSource: ['boss'],
    dropTowers: [4], // Storm Bastion
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  necromancer_scroll: {
    id: 'necromancer_scroll',
    name: 'Scroll of the Necromancer',
    icon: '📜💀',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'necromancer',
    baseClass: 'mage',
    element: 'dark',
    description: 'Ancient scroll written in blood on human skin.',
    lore: 'Necromancers command the dead and drain the living.',
    dropSource: ['boss'],
    dropTowers: [1, 3], // Crimson Spire, Shadow Keep
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  },
  
  arcanist_scroll: {
    id: 'arcanist_scroll',
    name: 'Scroll of the Arcanist',
    icon: '📜✨',
    type: 'hidden_class_scroll',
    rarity: 'legendary',
    hiddenClass: 'arcanist',
    baseClass: 'mage',
    element: null,
    description: 'Scroll written in pure magical energy.',
    lore: 'Arcanists master raw magic itself, transcending elemental limitations.',
    dropSource: ['boss'],
    dropTowers: [8, 10], // Crystal Caverns, Celestial Pinnacle
    dropRate: 0.06,
    isUnique: true,
    sellPrice: null,
    tradeable: false
  }
};

// ============================================================
// MEMORY CRYSTAL - Used to remove hidden class
// ============================================================

export const MEMORY_CRYSTAL = {
  id: 'memory_crystal',
  name: 'Memory Crystal',
  icon: '💎',
  type: 'special_consumable',
  rarity: 'epic',
  description: 'A mysterious crystal that can erase the memories of awakening. Use to remove your hidden class.',
  lore: 'Forged from fragments of forgotten dimensions, it returns what was taken.',
  effect: 'Removes current hidden class. The corresponding scroll becomes available again for others to find.',
  dropSource: ['boss'],
  dropTowers: [8, 9, 10], // High-level towers only
  dropRate: 0.10, // 10% from boss
  buyPrice: null, // Cannot be bought
  sellPrice: 5000,
  stackable: true,
  maxStack: 5
};

// ============================================================
// MEMORY CRYSTAL FRAGMENT - Craft into Memory Crystal
// ============================================================

export const MEMORY_CRYSTAL_FRAGMENT = {
  id: 'memory_crystal_fragment',
  name: 'Memory Crystal Fragment',
  icon: '💠',
  type: 'material',
  rarity: 'rare',
  description: 'A fragment of a Memory Crystal. Collect 10 to forge a complete crystal.',
  dropSource: ['boss'],
  dropTowers: [1, 2, 3, 4, 5], // All towers
  dropRate: 0.10, // 10% from boss
  buyPrice: null,
  sellPrice: 500,
  stackable: true,
  maxStack: 99,
  craftRecipe: {
    result: 'memory_crystal',
    required: 10
  }
};

// ============================================================
// HELPER FUNCTIONS FOR SCROLL SYSTEM
// ============================================================

export const HIDDEN_CLASS_SCROLL_HELPERS = {
  /**
   * Get scroll by hidden class name
   */
  getScrollByClass: (hiddenClassName) => {
    return Object.values(HIDDEN_CLASS_SCROLLS).find(
      scroll => scroll.hiddenClass === hiddenClassName
    );
  },

  /**
   * Get all scrolls for a base class
   */
  getScrollsByBaseClass: (baseClass) => {
    return Object.values(HIDDEN_CLASS_SCROLLS).filter(
      scroll => scroll.baseClass === baseClass
    );
  },

  /**
   * Get scrolls that can drop from a specific tower
   */
  getScrollsByTower: (towerId) => {
    return Object.values(HIDDEN_CLASS_SCROLLS).filter(
      scroll => scroll.dropTowers.includes(towerId)
    );
  },

  /**
   * Check if scroll can drop from tower boss
   */
  canDropFromTower: (scrollId, towerId) => {
    const scroll = HIDDEN_CLASS_SCROLLS[scrollId];
    return scroll ? scroll.dropTowers.includes(towerId) : false;
  },

  /**
   * Get all hidden class info
   */
  getAllHiddenClasses: () => {
    return Object.values(HIDDEN_CLASS_SCROLLS).map(scroll => ({
      id: scroll.hiddenClass,
      name: scroll.name.replace('Scroll of the ', ''),
      baseClass: scroll.baseClass,
      element: scroll.element,
      icon: scroll.icon.replace('📜', '')
    }));
  },

  /**
   * Validate if player can use scroll
   */
  canUseScroll: (scroll, playerClass, playerHiddenClass) => {
    // Already has a hidden class
    if (playerHiddenClass) {
      return { 
        canUse: false, 
        reason: 'You already have a hidden class. Use Memory Crystal to remove it first.' 
      };
    }
    
    // Wrong base class
    if (scroll.baseClass !== playerClass) {
      return { 
        canUse: false, 
        reason: `This scroll requires ${scroll.baseClass} class.` 
      };
    }
    
    return { canUse: true, reason: null };
  }
};

// ============================================================
// SERVER STATE SCHEMA SUGGESTION
// ============================================================
/*
// MongoDB Schema for tracking unique scrolls

const ServerStateSchema = new mongoose.Schema({
  type: { type: String, default: 'scroll_availability' },
  
  // Track which scrolls are available (not claimed by any player)
  availableScrolls: [{
    scrollId: String,
    isAvailable: { type: Boolean, default: true },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', default: null },
    claimedAt: Date
  }],
  
  // Initialize with all scrolls available
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Helper methods:
// - markScrollClaimed(scrollId, characterId)
// - markScrollAvailable(scrollId)
// - getAvailableScrolls()
// - isScrollAvailable(scrollId)
*/

export default {
  HIDDEN_CLASS_SCROLLS,
  MEMORY_CRYSTAL,
  MEMORY_CRYSTAL_FRAGMENT,
  HIDDEN_CLASS_SCROLL_HELPERS
};
