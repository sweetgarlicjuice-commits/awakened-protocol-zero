// Floor Requirements - Items needed to advance to next floor
export const FLOOR_REQUIREMENTS = {
  tower1: {
    1: { items: [{ id: 'bone_fragment', name: 'Bone Fragment', quantity: 5 }], gold: 0 },
    2: { items: [{ id: 'bone_fragment', name: 'Bone Fragment', quantity: 8 }], gold: 10 },
    3: { items: [{ id: 'bone_fragment', name: 'Bone Fragment', quantity: 12 }, { id: 'health_potion_small', name: 'Small Health Potion', quantity: 1 }], gold: 20 },
    4: { items: [{ id: 'cursed_cloth', name: 'Cursed Cloth', quantity: 5 }], gold: 30 },
    5: { items: [{ id: 'cursed_cloth', name: 'Cursed Cloth', quantity: 8 }, { id: 'mana_potion_small', name: 'Small Mana Potion', quantity: 2 }], gold: 50 },
    6: { items: [{ id: 'ghost_essence', name: 'Ghost Essence', quantity: 3 }], gold: 60 },
    7: { items: [{ id: 'ghost_essence', name: 'Ghost Essence', quantity: 5 }, { id: 'bone_fragment', name: 'Bone Fragment', quantity: 15 }], gold: 80 },
    8: { items: [{ id: 'dark_crystal', name: 'Dark Crystal', quantity: 2 }], gold: 100 },
    9: { items: [{ id: 'dark_crystal', name: 'Dark Crystal', quantity: 4 }, { id: 'health_potion_small', name: 'Small Health Potion', quantity: 3 }], gold: 150 },
    10: { items: [], gold: 0 }, // Safe zone - no requirement
    11: { items: [{ id: 'death_mark', name: 'Death Mark', quantity: 2 }], gold: 200 },
    12: { items: [{ id: 'death_mark', name: 'Death Mark', quantity: 4 }, { id: 'ghost_essence', name: 'Ghost Essence', quantity: 8 }], gold: 250 },
    13: { items: [{ id: 'soul_shard', name: 'Soul Shard', quantity: 2 }], gold: 300 },
    14: { items: [{ id: 'soul_shard', name: 'Soul Shard', quantity: 5 }, { id: 'mana_potion_small', name: 'Small Mana Potion', quantity: 5 }], gold: 400 },
    15: { items: [], gold: 500 } // Boss floor
  },
  tower2: {
    1: { items: [{ id: 'sea_scale', name: 'Sea Scale', quantity: 5 }], gold: 100 },
    2: { items: [{ id: 'sea_scale', name: 'Sea Scale', quantity: 10 }], gold: 150 },
    3: { items: [{ id: 'coral_piece', name: 'Coral Piece', quantity: 5 }], gold: 200 },
    4: { items: [{ id: 'coral_piece', name: 'Coral Piece', quantity: 8 }, { id: 'health_potion_medium', name: 'Medium Health Potion', quantity: 2 }], gold: 250 },
    5: { items: [{ id: 'siren_tear', name: 'Siren Tear', quantity: 3 }], gold: 300 },
    6: { items: [{ id: 'siren_tear', name: 'Siren Tear', quantity: 5 }], gold: 350 },
    7: { items: [{ id: 'deep_pearl', name: 'Deep Pearl', quantity: 2 }], gold: 400 },
    8: { items: [{ id: 'deep_pearl', name: 'Deep Pearl', quantity: 4 }, { id: 'sea_scale', name: 'Sea Scale', quantity: 20 }], gold: 500 },
    9: { items: [{ id: 'abyssal_ink', name: 'Abyssal Ink', quantity: 3 }], gold: 600 },
    10: { items: [], gold: 0 },
    11: { items: [{ id: 'kraken_tooth', name: 'Kraken Tooth', quantity: 2 }], gold: 800 },
    12: { items: [{ id: 'kraken_tooth', name: 'Kraken Tooth', quantity: 4 }], gold: 1000 },
    13: { items: [{ id: 'leviathan_scale', name: 'Leviathan Scale', quantity: 2 }], gold: 1200 },
    14: { items: [{ id: 'leviathan_scale', name: 'Leviathan Scale', quantity: 5 }, { id: 'mana_potion_medium', name: 'Medium Mana Potion', quantity: 5 }], gold: 1500 },
    15: { items: [], gold: 2000 }
  }
};

// Material drops from enemies
export const MATERIAL_DROPS = {
  tower1: {
    skeleton_warrior: [
      { id: 'bone_fragment', name: 'Bone Fragment', icon: '🦴', chance: 0.6, quantity: { min: 1, max: 3 } }
    ],
    zombie: [
      { id: 'bone_fragment', name: 'Bone Fragment', icon: '🦴', chance: 0.4, quantity: { min: 1, max: 2 } },
      { id: 'cursed_cloth', name: 'Cursed Cloth', icon: '🧵', chance: 0.3, quantity: { min: 1, max: 2 } }
    ],
    cursed_knight: [
      { id: 'cursed_cloth', name: 'Cursed Cloth', icon: '🧵', chance: 0.5, quantity: { min: 1, max: 3 } },
      { id: 'dark_crystal', name: 'Dark Crystal', icon: '💎', chance: 0.15, quantity: { min: 1, max: 1 } }
    ],
    ghost: [
      { id: 'ghost_essence', name: 'Ghost Essence', icon: '👻', chance: 0.4, quantity: { min: 1, max: 2 } }
    ],
    bone_mage: [
      { id: 'dark_crystal', name: 'Dark Crystal', icon: '💎', chance: 0.25, quantity: { min: 1, max: 2 } },
      { id: 'ghost_essence', name: 'Ghost Essence', icon: '👻', chance: 0.3, quantity: { min: 1, max: 2 } }
    ],
    death_knight: [
      { id: 'death_mark', name: 'Death Mark', icon: '💀', chance: 0.5, quantity: { min: 1, max: 2 } },
      { id: 'soul_shard', name: 'Soul Shard', icon: '✨', chance: 0.2, quantity: { min: 1, max: 1 } }
    ],
    lich_apprentice: [
      { id: 'soul_shard', name: 'Soul Shard', icon: '✨', chance: 0.4, quantity: { min: 1, max: 2 } },
      { id: 'dark_crystal', name: 'Dark Crystal', icon: '💎', chance: 0.3, quantity: { min: 1, max: 2 } }
    ],
    hollow_king: [
      { id: 'soul_shard', name: 'Soul Shard', icon: '✨', chance: 1.0, quantity: { min: 3, max: 5 } },
      { id: 'memory_crystal_fragment', name: 'Memory Crystal Fragment', icon: '💠', chance: 0.1, quantity: { min: 1, max: 1 } }
    ]
  },
  tower2: {
    drowned_pirate: [
      { id: 'sea_scale', name: 'Sea Scale', icon: '🐚', chance: 0.6, quantity: { min: 1, max: 3 } }
    ],
    sea_serpent: [
      { id: 'sea_scale', name: 'Sea Scale', icon: '🐚', chance: 0.5, quantity: { min: 2, max: 4 } },
      { id: 'coral_piece', name: 'Coral Piece', icon: '🪸', chance: 0.3, quantity: { min: 1, max: 2 } }
    ],
    coral_golem: [
      { id: 'coral_piece', name: 'Coral Piece', icon: '🪸', chance: 0.6, quantity: { min: 2, max: 3 } }
    ],
    siren: [
      { id: 'siren_tear', name: 'Siren Tear', icon: '💧', chance: 0.4, quantity: { min: 1, max: 2 } }
    ],
    deep_one: [
      { id: 'deep_pearl', name: 'Deep Pearl', icon: '🔮', chance: 0.25, quantity: { min: 1, max: 1 } },
      { id: 'abyssal_ink', name: 'Abyssal Ink', icon: '🖤', chance: 0.3, quantity: { min: 1, max: 2 } }
    ],
    kraken_spawn: [
      { id: 'kraken_tooth', name: 'Kraken Tooth', icon: '🦷', chance: 0.5, quantity: { min: 1, max: 2 } },
      { id: 'abyssal_ink', name: 'Abyssal Ink', icon: '🖤', chance: 0.4, quantity: { min: 1, max: 2 } }
    ],
    abyssal_lord: [
      { id: 'leviathan_scale', name: 'Leviathan Scale', icon: '🐉', chance: 0.4, quantity: { min: 1, max: 2 } }
    ],
    leviathan_herald: [
      { id: 'leviathan_scale', name: 'Leviathan Scale', icon: '🐉', chance: 1.0, quantity: { min: 3, max: 5 } },
      { id: 'memory_crystal_fragment', name: 'Memory Crystal Fragment', icon: '💠', chance: 0.1, quantity: { min: 1, max: 1 } }
    ]
  }
};

// Story events for exploration - makes each run unique
export const STORY_EVENTS = {
  tower1: {
    entrance: [
      "The ancient doors creak open, revealing a corridor shrouded in darkness. The air smells of decay and forgotten memories.",
      "You step into the Crimson Spire. Torches flicker with an unnatural purple flame along the walls.",
      "A cold wind brushes past you as you enter. Somewhere in the darkness, bones rattle.",
      "The tower welcomes you with silence... too much silence. Something is watching."
    ],
    paths: [
      {
        description: "The corridor splits into two paths. To the LEFT, you hear distant moaning. To the RIGHT, an eerie glow beckons.",
        choices: ['left', 'right'],
        outcomes: {
          left: ["You chose the path of moaning... A {enemy} emerges from the shadows!", "The moaning grows louder... {enemy} blocks your way!"],
          right: ["Following the glow, you find... {enemy} guarding a strange artifact!", "The glow was a trap! {enemy} ambushes you!"]
        }
      },
      {
        description: "You reach a chamber with THREE doorways. One is marked with a SKULL, another with a SWORD, the last with a CROWN.",
        choices: ['skull', 'sword', 'crown'],
        outcomes: {
          skull: ["The skull door leads to a crypt... {enemy} rises from a coffin!"],
          sword: ["Behind the sword door, an arena awaits. {enemy} challenges you!"],
          crown: ["The crown door reveals a throne room. {enemy} sits upon the throne!"]
        }
      },
      {
        description: "A massive staircase spirals UPWARD into darkness. A narrow tunnel leads DOWNWARD. Which way?",
        choices: ['upward', 'downward'],
        outcomes: {
          upward: ["You climb higher... {enemy} descends from above!"],
          downward: ["The tunnel is cramped... {enemy} crawls toward you!"]
        }
      }
    ],
    exploration: [
      "You search the room carefully... ",
      "Moving deeper into the floor... ",
      "The shadows seem to move as you explore... ",
      "Ancient runes glow faintly on the walls as you proceed... "
    ],
    combat_intro: [
      "⚔️ {enemy} blocks your path!",
      "⚔️ {enemy} emerges from the darkness!",
      "⚔️ You've been spotted by {enemy}!",
      "⚔️ {enemy} lets out a horrifying screech and attacks!"
    ],
    victory: [
      "The {enemy} crumbles to dust. You catch your breath.",
      "Victory! The {enemy} falls, leaving behind its essence.",
      "You stand victorious over the {enemy}. But this floor isn't cleared yet...",
      "The {enemy} is defeated. You feel yourself growing stronger."
    ],
    rest_prompt: [
      "You find a moment of peace. Do you want to use potions to recover?",
      "The immediate danger has passed. Time to tend to your wounds?",
      "A brief respite. Would you like to heal before continuing?"
    ],
    floor_cleared: [
      "This area is clear. The Doorkeeper awaits at the passage to the next floor.",
      "You've explored this floor thoroughly. Ready to face the Doorkeeper?",
      "The floor grows quiet. Only the Doorkeeper remains between you and progress."
    ]
  },
  tower2: {
    entrance: [
      "Water drips from the cavern ceiling. The Azure Depths swallow you in its cold embrace.",
      "Bioluminescent algae lights your path with an ethereal blue glow. Danger lurks in every shadow.",
      "The sound of crashing waves echoes through the underwater caverns. You are not alone here.",
      "You descend into the depths. The pressure of the ocean above weighs on your soul."
    ],
    paths: [
      {
        description: "The cavern branches. A CORAL passage glows warmly. A DARK abyss yawns to the side.",
        choices: ['coral', 'dark'],
        outcomes: {
          coral: ["The coral passage hides... {enemy}! It attacks!"],
          dark: ["In the darkness, {enemy} was waiting for prey!"]
        }
      },
      {
        description: "You find an underwater current. Swim WITH the current or AGAINST it?",
        choices: ['with', 'against'],
        outcomes: {
          with: ["The current carries you to... {enemy}'s lair!"],
          against: ["Fighting the current exhausts you... {enemy} finds easy prey!"]
        }
      }
    ],
    exploration: [
      "Bubbles rise from below as you explore... ",
      "Strange fish scatter as you move through... ",
      "The water grows colder as you venture deeper... ",
      "Ancient shipwrecks litter the ocean floor around you... "
    ],
    combat_intro: [
      "⚔️ {enemy} emerges from the depths!",
      "⚔️ {enemy} surfaces with a splash!",
      "⚔️ You've disturbed {enemy}'s territory!",
      "⚔️ {enemy} circles you menacingly!"
    ],
    victory: [
      "The {enemy} sinks into the abyss. You survived... for now.",
      "Victory! The {enemy} dissolves into sea foam.",
      "You've bested the {enemy}. The depths hold more challenges.",
      "The {enemy} is vanquished. Its treasures are yours."
    ],
    rest_prompt: [
      "You find an air pocket. Time to use potions?",
      "A moment of calm in the chaos. Heal your wounds?",
      "The waters still. Do you want to recover before continuing?"
    ],
    floor_cleared: [
      "The underwater passage is clear. The Doorkeeper guards the way forward.",
      "You've conquered this depth. The Doorkeeper awaits.",
      "The floor is secured. Ready to pay the toll to advance?"
    ]
  }
};

// Doorkeeper dialogues
export const DOORKEEPER_DIALOGUES = {
  greeting: [
    "⛩️ DOORKEEPER: 'You wish to proceed? Show me you are worthy.'",
    "⛩️ DOORKEEPER: 'Another hunter... Do you have what I require?'",
    "⛩️ DOORKEEPER: 'The path forward has a price. Can you pay it?'"
  ],
  requirements: "⛩️ DOORKEEPER: 'To pass, you must offer: {items}'",
  success: [
    "⛩️ DOORKEEPER: 'Acceptable. You may proceed.'",
    "⛩️ DOORKEEPER: 'Your offering pleases me. The way is open.'",
    "⛩️ DOORKEEPER: 'Go forth, hunter. Greater challenges await.'"
  ],
  failure: [
    "⛩️ DOORKEEPER: 'You lack the required tribute. Return when ready.'",
    "⛩️ DOORKEEPER: 'Insufficient. The door remains sealed.'",
    "⛩️ DOORKEEPER: 'Come back with the proper offerings.'"
  ],
  boss_warning: [
    "⛩️ DOORKEEPER: '⚠️ WARNING: Beyond lies the Floor Master. Are you truly prepared?'",
    "⛩️ DOORKEEPER: '⚠️ The boss awaits. Many have entered. Few have returned.'",
    "⛩️ DOORKEEPER: '⚠️ This is your final warning. The Floor Master shows no mercy.'"
  ]
};

// Hidden class ownership tracking (stored in separate collection)
export const HIDDEN_CLASS_INFO = {
  flameblade: {
    id: 'flameblade',
    name: 'Flameblade',
    baseClass: 'swordsman',
    icon: '🔥',
    description: 'Master of fire who burns enemies to ash',
    skills: [
      { skillId: 'flame_slash', name: 'Flame Slash', mpCost: 15, damage: 2.0, effect: 'burn', type: 'physical' },
      { skillId: 'inferno_strike', name: 'Inferno Strike', mpCost: 25, damage: 2.8, type: 'physical' },
      { skillId: 'fire_aura', name: 'Fire Aura', mpCost: 20, effect: 'buff_fire', type: 'buff' },
      { skillId: 'volcanic_rage', name: 'Volcanic Rage', mpCost: 40, damage: 3.5, effect: 'burn_all', type: 'physical' }
    ]
  },
  shadowDancer: {
    id: 'shadowDancer',
    name: 'Shadow Dancer',
    baseClass: 'thief',
    icon: '🌑',
    description: 'One with the shadows, striking unseen',
    skills: [
      { skillId: 'shadow_strike', name: 'Shadow Strike', mpCost: 12, damage: 2.5, critBonus: 0.5, type: 'physical' },
      { skillId: 'vanish', name: 'Vanish', mpCost: 20, effect: 'invisibility', type: 'buff' },
      { skillId: 'death_mark', name: 'Death Mark', mpCost: 18, damage: 1.5, effect: 'mark', type: 'physical' },
      { skillId: 'shadow_dance', name: 'Shadow Dance', mpCost: 35, damage: 2.0, hits: 5, type: 'physical' }
    ]
  },
  stormRanger: {
    id: 'stormRanger',
    name: 'Storm Ranger',
    baseClass: 'archer',
    icon: '⚡',
    description: 'Commands lightning with every arrow',
    skills: [
      { skillId: 'lightning_arrow', name: 'Lightning Arrow', mpCost: 14, damage: 2.2, effect: 'shock', type: 'physical' },
      { skillId: 'chain_lightning', name: 'Chain Lightning', mpCost: 22, damage: 1.8, hits: 3, type: 'magic' },
      { skillId: 'storm_eye', name: 'Storm Eye', mpCost: 18, effect: 'accuracy_major', type: 'buff' },
      { skillId: 'thunderstorm', name: 'Thunderstorm', mpCost: 45, damage: 3.0, effect: 'shock_all', type: 'magic' }
    ]
  },
  frostWeaver: {
    id: 'frostWeaver',
    name: 'Frost Weaver',
    baseClass: 'mage',
    icon: '❄️',
    description: 'Absolute zero incarnate, freezing all',
    skills: [
      { skillId: 'frost_bolt', name: 'Frost Bolt', mpCost: 12, damage: 2.0, effect: 'freeze', type: 'magic' },
      { skillId: 'blizzard', name: 'Blizzard', mpCost: 28, damage: 2.2, effect: 'slow_all', type: 'magic' },
      { skillId: 'ice_armor', name: 'Ice Armor', mpCost: 20, effect: 'defense_up', type: 'buff' },
      { skillId: 'absolute_zero', name: 'Absolute Zero', mpCost: 50, damage: 4.0, effect: 'freeze_shatter', type: 'magic' }
    ]
  }
};

// Crafting recipes
export const CRAFTING_RECIPES = {
  memory_crystal: {
    id: 'memory_crystal',
    name: 'Memory Crystal',
    icon: '💎',
    description: 'Used to remove a Hidden Class, making it available for others',
    ingredients: [
      { id: 'memory_crystal_fragment', name: 'Memory Crystal Fragment', quantity: 15 }
    ],
    result: { id: 'memory_crystal', name: 'Memory Crystal', quantity: 1 }
  }
};
