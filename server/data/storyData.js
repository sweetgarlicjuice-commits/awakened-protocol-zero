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
      { skillId: 'flame_slash', name: 'Flame Slash', mpCost: 15, damage: 2.0, effect: 'burn', type: 'physical', desc: 'Slash with burning blade. DMG + burn effect.' },
      { skillId: 'inferno_strike', name: 'Inferno Strike', mpCost: 25, damage: 2.8, type: 'physical', desc: 'Powerful fire-infused strike. High single-target DMG.' },
      { skillId: 'fire_aura', name: 'Fire Aura', mpCost: 20, effect: 'buff_fire', type: 'buff', desc: 'Surround yourself in flames. +30% ATK for 3 turns.' },
      { skillId: 'volcanic_rage', name: 'Volcanic Rage', mpCost: 40, damage: 3.5, effect: 'burn_all', type: 'physical', desc: 'Erupt with volcanic power. Massive DMG + burn.' }
    ]
  },
  shadowDancer: {
    id: 'shadowDancer',
    name: 'Shadow Dancer',
    baseClass: 'thief',
    icon: '🌑',
    description: 'One with the shadows, striking unseen',
    skills: [
      { skillId: 'shadow_strike', name: 'Shadow Strike', mpCost: 12, damage: 2.5, critBonus: 0.5, type: 'physical', desc: 'Strike from the shadows. High crit chance.' },
      { skillId: 'vanish', name: 'Vanish', mpCost: 20, effect: 'invisibility', type: 'buff', desc: 'Become invisible. Next attack auto-crits +100% DMG.' },
      { skillId: 'death_mark', name: 'Death Mark', mpCost: 18, damage: 1.5, effect: 'mark', type: 'physical', desc: 'Mark target. +30% damage taken for 3 turns.' },
      { skillId: 'shadow_dance', name: 'Shadow Dance', mpCost: 35, damage: 2.0, hits: 5, type: 'physical', desc: 'Rapid 5-hit combo from the shadows.' }
    ]
  },
  stormRanger: {
    id: 'stormRanger',
    name: 'Storm Ranger',
    baseClass: 'archer',
    icon: '⚡',
    description: 'Commands lightning with every arrow',
    skills: [
      { skillId: 'lightning_arrow', name: 'Lightning Arrow', mpCost: 14, damage: 2.2, effect: 'shock', type: 'physical', desc: 'Arrow charged with lightning. High DMG + shock.' },
      { skillId: 'chain_lightning', name: 'Chain Lightning', mpCost: 22, damage: 1.8, hits: 3, type: 'magic', desc: 'Lightning chains to hit 3 times.' },
      { skillId: 'storm_eye', name: 'Storm Eye', mpCost: 18, effect: 'accuracy_major', type: 'buff', desc: 'Enter focus state. +50% Precision, +30% Crit.' },
      { skillId: 'thunderstorm', name: 'Thunderstorm', mpCost: 45, damage: 3.0, effect: 'shock_all', type: 'magic', desc: 'Call down a devastating thunderstorm. 4 hits.' }
    ]
  },
  frostWeaver: {
    id: 'frostWeaver',
    name: 'Frost Weaver',
    baseClass: 'mage',
    icon: '❄️',
    description: 'Absolute zero incarnate, freezing all',
    skills: [
      { skillId: 'frost_bolt', name: 'Frost Bolt', mpCost: 12, damage: 2.0, effect: 'freeze', type: 'magic', desc: 'Ice bolt that slows enemy. -20% ATK.' },
      { skillId: 'blizzard', name: 'Blizzard', mpCost: 28, damage: 2.2, effect: 'slow_all', type: 'magic', desc: 'Ice storm hits 3 times. 30% freeze chance.' },
      { skillId: 'ice_armor', name: 'Ice Armor', mpCost: 20, effect: 'defense_up', type: 'buff', desc: 'Armor of ice. +50 DEF, reflect 20% DMG.' },
      { skillId: 'absolute_zero', name: 'Absolute Zero', mpCost: 50, damage: 4.0, effect: 'freeze_shatter', type: 'magic', desc: 'Ultimate cold. Massive DMG + 2-turn freeze.' }
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

// Base class skill descriptions
export const BASE_CLASS_SKILLS = {
  swordsman: [
    { skillId: 'slash', name: 'Slash', mpCost: 5, damage: 1.3, desc: 'Quick slash attack. Low cost, decent DMG.' },
    { skillId: 'heavyStrike', name: 'Heavy Strike', mpCost: 12, damage: 1.8, desc: 'Powerful overhead strike. High single-target DMG.' },
    { skillId: 'shieldBash', name: 'Shield Bash', mpCost: 8, damage: 1.0, desc: 'Bash with shield. Chance to stun enemy.' },
    { skillId: 'warCry', name: 'War Cry', mpCost: 15, damage: 0, desc: 'Battle cry. +20% ATK for 3 turns.' }
  ],
  thief: [
    { skillId: 'backstab', name: 'Backstab', mpCost: 8, damage: 2.2, desc: 'Strike from behind. +40% crit chance.' },
    { skillId: 'poisonBlade', name: 'Poison Blade', mpCost: 10, damage: 1.3, desc: 'Poisoned attack. DoT for 3 turns.' },
    { skillId: 'smokeScreen', name: 'Smoke Screen', mpCost: 12, damage: 0, desc: 'Create smoke. +30% evasion for 2 turns.' },
    { skillId: 'steal', name: 'Steal', mpCost: 5, damage: 0, desc: 'Attempt to steal gold from enemy.' }
  ],
  archer: [
    { skillId: 'preciseShot', name: 'Precise Shot', mpCost: 6, damage: 1.6, desc: 'Aimed shot. Never misses, bonus DMG.' },
    { skillId: 'multiShot', name: 'Multi Shot', mpCost: 14, damage: 0.6, hits: 3, desc: 'Fire 3 arrows at once.' },
    { skillId: 'eagleEye', name: 'Eagle Eye', mpCost: 10, damage: 0, desc: 'Focus aim. +20% crit for 3 turns.' },
    { skillId: 'arrowRain', name: 'Arrow Rain', mpCost: 20, damage: 2.0, desc: 'Rain of arrows. High DMG attack.' }
  ],
  mage: [
    { skillId: 'fireball', name: 'Fireball', mpCost: 10, damage: 1.8, desc: 'Hurl a fireball. Burns for 3 turns.' },
    { skillId: 'iceSpear', name: 'Ice Spear', mpCost: 12, damage: 1.5, desc: 'Ice projectile. Chance to freeze.' },
    { skillId: 'manaShield', name: 'Mana Shield', mpCost: 15, damage: 0, desc: 'Absorb DMG with MP. Shield = INT × 2.' },
    { skillId: 'thunderbolt', name: 'Thunderbolt', mpCost: 18, damage: 2.2, desc: 'Lightning strike. High magic DMG.' }
  ]
};

// Story events for Towers 3-10
export const STORY_EVENTS_EXPANDED = {
  tower3: {
    entrance: ['The heat hits you like a wall as you enter the Volcanic Core.', 'Molten lava flows through the caverns ahead.'],
    exploration: ['Embers float through the scorching air.', 'The ground trembles with volcanic activity.'],
    paths: [{ description: 'The path splits at a river of lava.', choices: ['jump', 'detour'], outcomes: { jump: ['{enemy} ambushes you mid-leap!'], detour: ['{enemy} blocks the longer path!'] } }],
    combat_intro: ['⚔️ {enemy} emerges from the flames!', '⚔️ {enemy} blocks your path!'],
    victory: ['The flames of {enemy} are extinguished!', '{enemy} crumbles into cooling embers!'],
    rest_prompt: ['The heat is exhausting. Rest at a cool spot?'],
    floor_cleared: ['The path ahead is clear. The Doorkeeper awaits.']
  },
  tower4: {
    entrance: ['Bitter cold bites at your skin as you enter Frozen Peak.', 'Ice crystals cover every surface.'],
    exploration: ['Your breath forms clouds in the frigid air.', 'Icicles hang from the ceiling like daggers.'],
    paths: [{ description: 'A frozen lake blocks your path.', choices: ['cross', 'around'], outcomes: { cross: ['{enemy} breaks through the ice!'], around: ['{enemy} was waiting in ambush!'] } }],
    combat_intro: ['⚔️ {enemy} emerges from the frost!', '⚔️ {enemy} attacks from the blizzard!'],
    victory: ['The ice that was {enemy} shatters!', '{enemy} freezes solid and crumbles!'],
    rest_prompt: ['The cold is draining. Find warmth to rest?'],
    floor_cleared: ['The frozen path is clear. The Doorkeeper awaits.']
  },
  tower5: {
    entrance: ['Darkness consumes all light as you enter the Shadow Realm.', 'Your own shadow seems to writhe with malice.'],
    exploration: ['Whispers echo from the darkness.', 'Shadows move at the edge of your vision.'],
    paths: [{ description: 'Multiple shadow paths appear before you.', choices: ['light', 'dark'], outcomes: { light: ['{enemy} lurks in the faint light!'], dark: ['{enemy} strikes from the shadows!'] } }],
    combat_intro: ['⚔️ {enemy} materializes from darkness!', '⚔️ {enemy} was hiding in your shadow!'],
    victory: ['{enemy} dissolves into shadow!', 'The nightmare of {enemy} ends!'],
    rest_prompt: ['Even darkness needs rest. Find a sanctuary?'],
    floor_cleared: ['The shadows recede. The Doorkeeper awaits.']
  },
  tower6: {
    entrance: ['Radiant light blinds you as you enter the Celestial Sanctum.', 'Divine architecture stretches endlessly upward.'],
    exploration: ['Holy light permeates every corner.', 'Angelic hymns echo in the distance.'],
    paths: [{ description: 'A celestial guardian bars your path.', choices: ['fight', 'pray'], outcomes: { fight: ['{enemy} accepts your challenge!'], pray: ['{enemy} tests your devotion!'] } }],
    combat_intro: ['⚔️ {enemy} descends from above!', '⚔️ {enemy} challenges your worth!'],
    victory: ['{enemy} ascends in holy light!', 'The celestial {enemy} is vanquished!'],
    rest_prompt: ['Even in heaven, warriors rest. Pray at the shrine?'],
    floor_cleared: ['The divine path is clear. The Doorkeeper awaits.']
  },
  tower7: {
    entrance: ['Reality bends as you enter the Abyssal Void.', 'There is no up, no down, only void.'],
    exploration: ['Space and time have no meaning here.', 'Impossible geometry surrounds you.'],
    paths: [{ description: 'Multiple dimensions intersect here.', choices: ['left', 'right'], outcomes: { left: ['{enemy} emerges from a rift!'], right: ['{enemy} was waiting between worlds!'] } }],
    combat_intro: ['⚔️ {enemy} tears through reality!', '⚔️ {enemy} exists in impossible ways!'],
    victory: ['{enemy} is consumed by the void!', '{enemy} ceases to exist!'],
    rest_prompt: ['Find a stable pocket of reality to rest?'],
    floor_cleared: ['Reality stabilizes. The Doorkeeper awaits.']
  },
  tower8: {
    entrance: ['The power of dragons fills the air as you enter the Domain.', 'Massive claw marks scar the walls.'],
    exploration: ['Dragon roars echo in the distance.', 'Treasures and bones litter the floor.'],
    paths: [{ description: 'A dragon nest blocks your path.', choices: ['sneak', 'charge'], outcomes: { sneak: ['{enemy} spotted you anyway!'], charge: ['{enemy} accepts your challenge!'] } }],
    combat_intro: ['⚔️ {enemy} descends with a roar!', '⚔️ {enemy} breathes fire at you!'],
    victory: ['{enemy} falls with a thunderous crash!', 'The mighty {enemy} is slain!'],
    rest_prompt: ['Rest in the dragon hoard?'],
    floor_cleared: ['The lair is clear. The Doorkeeper awaits.']
  },
  tower9: {
    entrance: ['Ancient power fills the Eternal Citadel.', 'Time flows differently here.'],
    exploration: ['Echoes of past and future blend together.', 'The citadel has stood for eternity.'],
    paths: [{ description: 'Time loops block your progress.', choices: ['break', 'wait'], outcomes: { break: ['{enemy} guards the timeline!'], wait: ['{enemy} arrives from another era!'] } }],
    combat_intro: ['⚔️ {enemy} has waited eternities for this!', '⚔️ {enemy} attacks across time!'],
    victory: ['{enemy} fades into eternity!', 'The eternal {enemy} falls!'],
    rest_prompt: ['Rest in a moment frozen in time?'],
    floor_cleared: ['Time resumes. The Doorkeeper awaits.']
  },
  tower10: {
    entrance: ['Divine power overwhelms your senses at the Throne of Gods.', 'You stand at the pinnacle of creation.'],
    exploration: ['The presence of gods is palpable.', 'Reality bends to divine will.'],
    paths: [{ description: 'A divine gate bars your path.', choices: ['prove', 'force'], outcomes: { prove: ['{enemy} tests your divine right!'], force: ['{enemy} punishes your hubris!'] } }],
    combat_intro: ['⚔️ {enemy} descends from godhood!', '⚔️ {enemy} wields divine power!'],
    victory: ['{enemy} falls before mortal might!', 'Even gods fall to your blade!'],
    rest_prompt: ['Rest in the halls of divinity?'],
    floor_cleared: ['The divine path opens. The Doorkeeper awaits.']
  }
};

// Floor requirements for towers 3-10
export const FLOOR_REQUIREMENTS_EXPANDED = {
  tower3: { 3: { items: [], gold: 200 }, 6: { items: [], gold: 400 }, 9: { items: [], gold: 800 }, 10: { items: [], gold: 0 }, 12: { items: [], gold: 1500 }, 14: { items: [], gold: 3000 }, 15: { items: [], gold: 5000 } },
  tower4: { 3: { items: [], gold: 400 }, 6: { items: [], gold: 800 }, 9: { items: [], gold: 1600 }, 10: { items: [], gold: 0 }, 12: { items: [], gold: 3000 }, 14: { items: [], gold: 6000 }, 15: { items: [], gold: 10000 } },
  tower5: { 3: { items: [], gold: 800 }, 6: { items: [], gold: 1500 }, 9: { items: [], gold: 3000 }, 10: { items: [], gold: 0 }, 12: { items: [], gold: 6000 }, 14: { items: [], gold: 12000 }, 15: { items: [], gold: 20000 } },
  tower6: { 3: { items: [], gold: 1500 }, 6: { items: [], gold: 3000 }, 9: { items: [], gold: 6000 }, 10: { items: [], gold: 0 }, 12: { items: [], gold: 12000 }, 14: { items: [], gold: 25000 }, 15: { items: [], gold: 40000 } },
  tower7: { 3: { items: [], gold: 3000 }, 6: { items: [], gold: 6000 }, 9: { items: [], gold: 12000 }, 10: { items: [], gold: 0 }, 12: { items: [], gold: 25000 }, 14: { items: [], gold: 50000 }, 15: { items: [], gold: 80000 } },
  tower8: { 3: { items: [], gold: 6000 }, 6: { items: [], gold: 12000 }, 9: { items: [], gold: 25000 }, 10: { items: [], gold: 0 }, 12: { items: [], gold: 50000 }, 14: { items: [], gold: 100000 }, 15: { items: [], gold: 160000 } },
  tower9: { 3: { items: [], gold: 12000 }, 6: { items: [], gold: 25000 }, 9: { items: [], gold: 50000 }, 10: { items: [], gold: 0 }, 12: { items: [], gold: 100000 }, 14: { items: [], gold: 200000 }, 15: { items: [], gold: 320000 } },
  tower10: { 3: { items: [], gold: 25000 }, 6: { items: [], gold: 50000 }, 9: { items: [], gold: 100000 }, 10: { items: [], gold: 0 }, 12: { items: [], gold: 200000 }, 14: { items: [], gold: 400000 }, 15: { items: [], gold: 650000 } }
};

export const HIDDEN_CLASS_INFO = {
  // ==================== SWORDSMAN HIDDEN CLASSES ====================
  flameblade: {
    name: 'Flameblade',
    icon: '🔥',
    baseClass: 'swordsman',
    description: 'Masters the power of fire, dealing burn damage over time.',
    element: 'fire',
    skills: [
      { skillId: 'flameSlash', name: 'Flame Slash' },
      { skillId: 'infernoStrike', name: 'Inferno Strike' },
      { skillId: 'fireAura', name: 'Fire Aura' },
      { skillId: 'volcanicRage', name: 'Volcanic Rage' }
    ]
  },
  berserker: {
    name: 'Berserker',
    icon: '💢',
    baseClass: 'swordsman',
    description: 'Sacrifices HP for devastating damage. The angrier, the stronger.',
    element: 'none',
    skills: [
      { skillId: 'rageSlash', name: 'Rage Slash' },
      { skillId: 'bloodFury', name: 'Blood Fury' },
      { skillId: 'recklessCharge', name: 'Reckless Charge' },
      { skillId: 'deathwish', name: 'Deathwish' }
    ]
  },
  paladin: {
    name: 'Paladin',
    icon: '✨',
    baseClass: 'swordsman',
    description: 'Holy warrior with powerful healing and protective abilities.',
    element: 'holy',
    skills: [
      { skillId: 'holyStrike', name: 'Holy Strike' },
      { skillId: 'divineShield', name: 'Divine Shield' },
      { skillId: 'healingLight', name: 'Healing Light' },
      { skillId: 'judgment', name: 'Judgment' }
    ]
  },
  earthshaker: {
    name: 'Earthshaker',
    icon: '🌍',
    baseClass: 'swordsman',
    description: 'Commands the earth itself, crushing enemies with seismic power.',
    element: 'earth',
    skills: [
      { skillId: 'groundSlam', name: 'Ground Slam' },
      { skillId: 'stoneSkin', name: 'Stone Skin' },
      { skillId: 'earthquake', name: 'Earthquake' },
      { skillId: 'titansWrath', name: "Titan's Wrath" }
    ]
  },
  frostguard: {
    name: 'Frostguard',
    icon: '❄️',
    baseClass: 'swordsman',
    description: 'Ice-armored tank that freezes enemies and reflects damage.',
    element: 'ice',
    skills: [
      { skillId: 'frostStrike', name: 'Frost Strike' },
      { skillId: 'iceBarrier', name: 'Ice Barrier' },
      { skillId: 'glacialSlash', name: 'Glacial Slash' },
      { skillId: 'absoluteDefense', name: 'Absolute Defense' }
    ]
  },

  // ==================== THIEF HIDDEN CLASSES ====================
  shadowDancer: {
    name: 'Shadow Dancer',
    icon: '🌑',
    baseClass: 'thief',
    description: 'One with the darkness, capable of true invisibility.',
    element: 'dark',
    skills: [
      { skillId: 'shadowStrike', name: 'Shadow Strike' },
      { skillId: 'vanish', name: 'Vanish' },
      { skillId: 'deathMark', name: 'Death Mark' },
      { skillId: 'shadowDance', name: 'Shadow Dance' }
    ]
  },
  venomancer: {
    name: 'Venomancer',
    icon: '🐍',
    baseClass: 'thief',
    description: 'Master of poisons, slowly killing enemies with deadly toxins.',
    element: 'nature',
    skills: [
      { skillId: 'toxicStab', name: 'Toxic Stab' },
      { skillId: 'acidSpray', name: 'Acid Spray' },
      { skillId: 'plagueCloud', name: 'Plague Cloud' },
      { skillId: 'venomousEnd', name: 'Venomous End' }
    ]
  },
  assassin: {
    name: 'Assassin',
    icon: '⚫',
    baseClass: 'thief',
    description: 'Silent killer with devastating execute abilities.',
    element: 'dark',
    skills: [
      { skillId: 'assassinate', name: 'Assassinate' },
      { skillId: 'shadowStep', name: 'Shadow Step' },
      { skillId: 'markedForDeath', name: 'Marked for Death' },
      { skillId: 'deathLotus', name: 'Death Lotus' }
    ]
  },
  phantom: {
    name: 'Phantom',
    icon: '👻',
    baseClass: 'thief',
    description: 'Ethereal being that phases through defenses.',
    element: 'dark',
    skills: [
      { skillId: 'phantomStrike', name: 'Phantom Strike' },
      { skillId: 'phaseShift', name: 'Phase Shift' },
      { skillId: 'soulDrain', name: 'Soul Drain' },
      { skillId: 'etherealBurst', name: 'Ethereal Burst' }
    ]
  },
  bloodreaper: {
    name: 'Bloodreaper',
    icon: '🩸',
    baseClass: 'thief',
    description: 'Drains the life force of enemies to sustain themselves.',
    element: 'dark',
    skills: [
      { skillId: 'bloodSlash', name: 'Blood Slash' },
      { skillId: 'crimsonDance', name: 'Crimson Dance' },
      { skillId: 'bloodPact', name: 'Blood Pact' },
      { skillId: 'sanguineHarvest', name: 'Sanguine Harvest' }
    ]
  },

  // ==================== ARCHER HIDDEN CLASSES ====================
  stormRanger: {
    name: 'Storm Ranger',
    icon: '⚡',
    baseClass: 'archer',
    description: 'Commands lightning, arrows that chain between enemies.',
    element: 'lightning',
    skills: [
      { skillId: 'lightningArrow', name: 'Lightning Arrow' },
      { skillId: 'chainLightning', name: 'Chain Lightning' },
      { skillId: 'stormEye', name: 'Storm Eye' },
      { skillId: 'thunderstorm', name: 'Thunderstorm' }
    ]
  },
  pyroArcher: {
    name: 'Pyro Archer',
    icon: '🔥',
    baseClass: 'archer',
    description: 'Fire arrows that explode on impact, burning everything.',
    element: 'fire',
    skills: [
      { skillId: 'flameArrow', name: 'Flame Arrow' },
      { skillId: 'explosiveShot', name: 'Explosive Shot' },
      { skillId: 'infernoQuiver', name: 'Inferno Quiver' },
      { skillId: 'phoenixArrow', name: 'Phoenix Arrow' }
    ]
  },
  frostSniper: {
    name: 'Frost Sniper',
    icon: '❄️',
    baseClass: 'archer',
    description: 'Icy precision that freezes enemies in their tracks.',
    element: 'ice',
    skills: [
      { skillId: 'iceArrow', name: 'Ice Arrow' },
      { skillId: 'piercingCold', name: 'Piercing Cold' },
      { skillId: 'frozenPrecision', name: 'Frozen Precision' },
      { skillId: 'avalancheShot', name: 'Avalanche Shot' }
    ]
  },
  natureWarden: {
    name: 'Nature Warden',
    icon: '🌿',
    baseClass: 'archer',
    description: 'Guardian of nature with healing and thorn attacks.',
    element: 'nature',
    skills: [
      { skillId: 'vineArrow', name: 'Vine Arrow' },
      { skillId: 'natureBounty', name: "Nature's Bounty" },
      { skillId: 'thornBarrage', name: 'Thorn Barrage' },
      { skillId: 'gaiaWrath', name: "Gaia's Wrath" }
    ]
  },
  voidHunter: {
    name: 'Void Hunter',
    icon: '🌀',
    baseClass: 'archer',
    description: 'Harnesses the void, arrows that pierce all defenses.',
    element: 'dark',
    skills: [
      { skillId: 'voidArrow', name: 'Void Arrow' },
      { skillId: 'dimensionalRift', name: 'Dimensional Rift' },
      { skillId: 'voidSight', name: 'Void Sight' },
      { skillId: 'oblivionShot', name: 'Oblivion Shot' }
    ]
  },

  // ==================== MAGE HIDDEN CLASSES ====================
  frostWeaver: {
    name: 'Frost Weaver',
    icon: '❄️',
    baseClass: 'mage',
    description: 'Absolute zero incarnate, freezing enemies completely.',
    element: 'ice',
    skills: [
      { skillId: 'frostBolt', name: 'Frost Bolt' },
      { skillId: 'blizzard', name: 'Blizzard' },
      { skillId: 'iceArmor', name: 'Ice Armor' },
      { skillId: 'absoluteZero', name: 'Absolute Zero' }
    ]
  },
  pyromancer: {
    name: 'Pyromancer',
    icon: '🔥',
    baseClass: 'mage',
    description: 'Master of fire magic, turning everything to ash.',
    element: 'fire',
    skills: [
      { skillId: 'flameBurst', name: 'Flame Burst' },
      { skillId: 'meteorShower', name: 'Meteor Shower' },
      { skillId: 'combustion', name: 'Combustion' },
      { skillId: 'inferno', name: 'Inferno' }
    ]
  },
  stormcaller: {
    name: 'Stormcaller',
    icon: '⚡',
    baseClass: 'mage',
    description: 'Commands the storm, devastating AoE lightning attacks.',
    element: 'lightning',
    skills: [
      { skillId: 'lightningBolt', name: 'Lightning Bolt' },
      { skillId: 'staticField', name: 'Static Field' },
      { skillId: 'stormShield', name: 'Storm Shield' },
      { skillId: 'tempest', name: 'Tempest' }
    ]
  },
  necromancer: {
    name: 'Necromancer',
    icon: '💀',
    baseClass: 'mage',
    description: 'Dark mage who drains life and curses enemies.',
    element: 'dark',
    skills: [
      { skillId: 'darkBolt', name: 'Dark Bolt' },
      { skillId: 'curseOfWeakness', name: 'Curse of Weakness' },
      { skillId: 'lifeLeech', name: 'Life Leech' },
      { skillId: 'deathCoil', name: 'Death Coil' }
    ]
  },
  arcanist: {
    name: 'Arcanist',
    icon: '✨',
    baseClass: 'mage',
    description: 'Pure arcane magic with devastating multi-hit spells.',
    element: 'none',
    skills: [
      { skillId: 'arcaneMissile', name: 'Arcane Missile' },
      { skillId: 'spellAmplify', name: 'Spell Amplify' },
      { skillId: 'manaSurge', name: 'Mana Surge' },
      { skillId: 'arcaneBarrage', name: 'Arcane Barrage' }
    ]
  }
};


// ============================================================
// PHASE 7: Scroll Mappings for Hidden Class System
// ============================================================

// Scroll item ID -> Hidden Class mapping
export const SCROLL_TO_CLASS = {
  // Swordsman scrolls
  'scroll_flameblade': { classId: 'flameblade', baseReq: 'swordsman' },
  'scroll_berserker': { classId: 'berserker', baseReq: 'swordsman' },
  'scroll_paladin': { classId: 'paladin', baseReq: 'swordsman' },
  'scroll_earthshaker': { classId: 'earthshaker', baseReq: 'swordsman' },
  'scroll_frostguard': { classId: 'frostguard', baseReq: 'swordsman' },
  // Thief scrolls
  'scroll_shadow_dancer': { classId: 'shadowDancer', baseReq: 'thief' },
  'scroll_venomancer': { classId: 'venomancer', baseReq: 'thief' },
  'scroll_assassin': { classId: 'assassin', baseReq: 'thief' },
  'scroll_phantom': { classId: 'phantom', baseReq: 'thief' },
  'scroll_bloodreaper': { classId: 'bloodreaper', baseReq: 'thief' },
  // Archer scrolls
  'scroll_storm_ranger': { classId: 'stormRanger', baseReq: 'archer' },
  'scroll_pyro_archer': { classId: 'pyroArcher', baseReq: 'archer' },
  'scroll_frost_sniper': { classId: 'frostSniper', baseReq: 'archer' },
  'scroll_nature_warden': { classId: 'natureWarden', baseReq: 'archer' },
  'scroll_void_hunter': { classId: 'voidHunter', baseReq: 'archer' },
  // Mage scrolls
  'scroll_frost_weaver': { classId: 'frostWeaver', baseReq: 'mage' },
  'scroll_pyromancer': { classId: 'pyromancer', baseReq: 'mage' },
  'scroll_stormcaller': { classId: 'stormcaller', baseReq: 'mage' },
  'scroll_necromancer': { classId: 'necromancer', baseReq: 'mage' },
  'scroll_arcanist': { classId: 'arcanist', baseReq: 'mage' }
};

// Hidden Class ID -> Scroll item ID mapping
export const CLASS_TO_SCROLL = {
  // Swordsman
  'flameblade': 'scroll_flameblade',
  'berserker': 'scroll_berserker',
  'paladin': 'scroll_paladin',
  'earthshaker': 'scroll_earthshaker',
  'frostguard': 'scroll_frostguard',
  // Thief
  'shadowDancer': 'scroll_shadow_dancer',
  'venomancer': 'scroll_venomancer',
  'assassin': 'scroll_assassin',
  'phantom': 'scroll_phantom',
  'bloodreaper': 'scroll_bloodreaper',
  // Archer
  'stormRanger': 'scroll_storm_ranger',
  'pyroArcher': 'scroll_pyro_archer',
  'frostSniper': 'scroll_frost_sniper',
  'natureWarden': 'scroll_nature_warden',
  'voidHunter': 'scroll_void_hunter',
  // Mage
  'frostWeaver': 'scroll_frost_weaver',
  'pyromancer': 'scroll_pyromancer',
  'stormcaller': 'scroll_stormcaller',
  'necromancer': 'scroll_necromancer',
  'arcanist': 'scroll_arcanist'
};

// Scroll display names
export const SCROLL_NAMES = {
  'scroll_flameblade': 'Flameblade Scroll',
  'scroll_berserker': 'Berserker Scroll',
  'scroll_paladin': 'Paladin Scroll',
  'scroll_earthshaker': 'Earthshaker Scroll',
  'scroll_frostguard': 'Frostguard Scroll',
  'scroll_shadow_dancer': 'Shadow Dancer Scroll',
  'scroll_venomancer': 'Venomancer Scroll',
  'scroll_assassin': 'Assassin Scroll',
  'scroll_phantom': 'Phantom Scroll',
  'scroll_bloodreaper': 'Bloodreaper Scroll',
  'scroll_storm_ranger': 'Storm Ranger Scroll',
  'scroll_pyro_archer': 'Pyro Archer Scroll',
  'scroll_frost_sniper': 'Frost Sniper Scroll',
  'scroll_nature_warden': 'Nature Warden Scroll',
  'scroll_void_hunter': 'Void Hunter Scroll',
  'scroll_frost_weaver': 'Frost Weaver Scroll',
  'scroll_pyromancer': 'Pyromancer Scroll',
  'scroll_stormcaller': 'Stormcaller Scroll',
  'scroll_necromancer': 'Necromancer Scroll',
  'scroll_arcanist': 'Arcanist Scroll'
};
