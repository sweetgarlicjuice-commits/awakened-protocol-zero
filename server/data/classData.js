// ============================================================
// CLASS DATA - All Base & Hidden Classes
// ============================================================
// Phase 7: 4 Base Classes + 20 Hidden Classes (5 per base)
// ============================================================

// ============================================================
// BASE CLASSES (4)
// ============================================================

export const BASE_CLASSES = {
  swordsman: {
    id: 'swordsman',
    name: 'Swordsman',
    icon: '⚔️',
    color: 'text-red-400',
    description: 'A mighty warrior who excels in close combat. High HP and strength make them formidable tanks.',
    primaryStat: 'str',
    secondaryStat: 'vit',
    baseStats: {
      str: 15,
      agi: 8,
      dex: 8,
      int: 5,
      vit: 14
    },
    skills: ['slash', 'heavyStrike', 'shieldBash', 'warCry'],
    hiddenClasses: ['flameblade', 'berserker', 'paladin', 'earthshaker', 'frostguard']
  },
  
  thief: {
    id: 'thief',
    name: 'Thief',
    icon: '🗡️',
    color: 'text-indigo-400',
    description: 'A swift assassin who strikes from the shadows. High agility grants evasion and critical hits.',
    primaryStat: 'agi',
    secondaryStat: 'dex',
    baseStats: {
      str: 8,
      agi: 15,
      dex: 12,
      int: 7,
      vit: 8
    },
    skills: ['backstab', 'poisonBlade', 'smokeScreen', 'steal'],
    hiddenClasses: ['shadowDancer', 'venomancer', 'assassin', 'phantom', 'bloodreaper']
  },
  
  archer: {
    id: 'archer',
    name: 'Archer',
    icon: '🏹',
    color: 'text-green-400',
    description: 'A precise marksman who rains death from afar. Dexterity ensures every shot counts.',
    primaryStat: 'dex',
    secondaryStat: 'agi',
    baseStats: {
      str: 10,
      agi: 12,
      dex: 15,
      int: 6,
      vit: 7
    },
    skills: ['preciseShot', 'multiShot', 'eagleEye', 'arrowRain'],
    hiddenClasses: ['stormRanger', 'pyroArcher', 'frostSniper', 'natureWarden', 'voidHunter']
  },
  
  mage: {
    id: 'mage',
    name: 'Mage',
    icon: '🔮',
    color: 'text-purple-400',
    description: 'A master of arcane arts who wields devastating elemental spells. Intelligence is their weapon.',
    primaryStat: 'int',
    secondaryStat: 'vit',
    baseStats: {
      str: 5,
      agi: 7,
      dex: 8,
      int: 15,
      vit: 5
    },
    skills: ['fireball', 'iceSpear', 'manaShield', 'thunderbolt'],
    hiddenClasses: ['frostWeaver', 'pyromancer', 'stormcaller', 'necromancer', 'arcanist']
  }
};

// ============================================================
// HIDDEN CLASSES (20)
// ============================================================

export const HIDDEN_CLASSES = {
  // === SWORDSMAN HIDDEN CLASSES ===
  flameblade: {
    id: 'flameblade',
    name: 'Flameblade',
    icon: '🔥',
    color: 'text-orange-400',
    baseClass: 'swordsman',
    element: 'fire',
    description: 'Masters the power of fire, dealing burn damage over time and wielding blazing weapons.',
    role: 'Burn DPS',
    skills: ['flameSlash', 'infernoStrike', 'fireAura', 'volcanicRage'],
    scrollId: 'scroll_flameblade'
  },
  
  berserker: {
    id: 'berserker',
    name: 'Berserker',
    icon: '💢',
    color: 'text-red-600',
    baseClass: 'swordsman',
    element: 'none',
    description: 'Sacrifices defense for overwhelming power. The lower the health, the stronger the attack.',
    role: 'Risk/Reward DPS',
    skills: ['rageSlash', 'bloodFury', 'recklessCharge', 'deathwish'],
    scrollId: 'scroll_berserker'
  },
  
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    icon: '✨',
    color: 'text-yellow-200',
    baseClass: 'swordsman',
    element: 'holy',
    description: 'A holy warrior who protects allies and smites the darkness. Can heal and shield.',
    role: 'Tank/Healer',
    skills: ['holyStrike', 'divineShield', 'healingLight', 'judgment'],
    scrollId: 'scroll_paladin'
  },
  
  earthshaker: {
    id: 'earthshaker',
    name: 'Earthshaker',
    icon: '🌍',
    color: 'text-amber-600',
    baseClass: 'swordsman',
    element: 'earth',
    description: 'Commands the power of earth to shatter enemy defenses and withstand any attack.',
    role: 'DEF Breaker',
    skills: ['groundSlam', 'stoneSkin', 'earthquake', 'titansWrath'],
    scrollId: 'scroll_earthshaker'
  },
  
  frostguard: {
    id: 'frostguard',
    name: 'Frostguard',
    icon: '❄️',
    color: 'text-cyan-300',
    baseClass: 'swordsman',
    element: 'ice',
    description: 'An immovable fortress of ice. Slows enemies while becoming nearly invincible.',
    role: 'Tank/Control',
    skills: ['frostStrike', 'iceBarrier', 'frozenBlade', 'glacialFortress'],
    scrollId: 'scroll_frostguard'
  },
  
  // === THIEF HIDDEN CLASSES ===
  shadowDancer: {
    id: 'shadowDancer',
    name: 'Shadow Dancer',
    icon: '🌑',
    color: 'text-purple-600',
    baseClass: 'thief',
    element: 'dark',
    description: 'One with the darkness, capable of devastating burst damage and guaranteed crits.',
    role: 'Burst Crit',
    skills: ['shadowStrike', 'vanish', 'deathMark', 'shadowDance'],
    scrollId: 'scroll_shadowDancer'
  },
  
  venomancer: {
    id: 'venomancer',
    name: 'Venomancer',
    icon: '🐍',
    color: 'text-green-500',
    baseClass: 'thief',
    element: 'nature',
    description: 'Master of poisons who stacks deadly toxins. Enemies wither away over time.',
    role: 'DoT Stacker',
    skills: ['toxicStrike', 'venomCoat', 'plague', 'pandemic'],
    scrollId: 'scroll_venomancer'
  },
  
  assassin: {
    id: 'assassin',
    name: 'Assassin',
    icon: '⚫',
    color: 'text-gray-600',
    baseClass: 'thief',
    element: 'none',
    description: 'A cold-blooded killer who specializes in finishing off weakened targets.',
    role: 'Execute',
    skills: ['exposeWeakness', 'markForDeath', 'execute', 'assassination'],
    scrollId: 'scroll_assassin'
  },
  
  phantom: {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    color: 'text-purple-400',
    baseClass: 'thief',
    element: 'dark',
    description: 'A ghostly presence that weakens enemies with terrifying debuffs.',
    role: 'Debuffer',
    skills: ['haunt', 'nightmare', 'soulDrain', 'dread'],
    scrollId: 'scroll_phantom'
  },
  
  bloodreaper: {
    id: 'bloodreaper',
    name: 'Bloodreaper',
    icon: '🩸',
    color: 'text-red-500',
    baseClass: 'thief',
    element: 'none',
    description: 'Feeds on the life force of enemies. Every strike heals the reaper.',
    role: 'Lifesteal',
    skills: ['bloodlet', 'sanguineBlade', 'crimsonSlash', 'exsanguinate'],
    scrollId: 'scroll_bloodreaper'
  },
  
  // === ARCHER HIDDEN CLASSES ===
  stormRanger: {
    id: 'stormRanger',
    name: 'Storm Ranger',
    icon: '⚡',
    color: 'text-yellow-400',
    baseClass: 'archer',
    element: 'lightning',
    description: 'Commands lightning itself, arrows that chain between enemies with electric fury.',
    role: 'Multi-hit',
    skills: ['lightningArrow', 'chainLightning', 'stormEye', 'thunderstorm'],
    scrollId: 'scroll_stormRanger'
  },
  
  pyroArcher: {
    id: 'pyroArcher',
    name: 'Pyro Archer',
    icon: '🔥',
    color: 'text-orange-400',
    baseClass: 'archer',
    element: 'fire',
    description: 'Infuses arrows with flames that burn enemies alive.',
    role: 'Burn DPS',
    skills: ['fireArrow', 'explosiveShot', 'ignite', 'meteorArrow'],
    scrollId: 'scroll_pyroArcher'
  },
  
  frostSniper: {
    id: 'frostSniper',
    name: 'Frost Sniper',
    icon: '❄️',
    color: 'text-cyan-300',
    baseClass: 'archer',
    element: 'ice',
    description: 'Absolute zero incarnate, delivering devastating single-target frost damage.',
    role: 'Single Target',
    skills: ['iceArrow', 'frozenAim', 'piercingCold', 'absoluteShot'],
    scrollId: 'scroll_frostSniper'
  },
  
  natureWarden: {
    id: 'natureWarden',
    name: 'Nature Warden',
    icon: '🌿',
    color: 'text-green-400',
    baseClass: 'archer',
    element: 'nature',
    description: 'Guardian of the forest who heals and poisons with nature\'s power.',
    role: 'Sustain',
    skills: ['thornArrow', 'naturesGift', 'vineTrap', 'overgrowth'],
    scrollId: 'scroll_natureWarden'
  },
  
  voidHunter: {
    id: 'voidHunter',
    name: 'Void Hunter',
    icon: '🌀',
    color: 'text-purple-600',
    baseClass: 'archer',
    element: 'dark',
    description: 'Fires arrows infused with void energy that ignore enemy defenses.',
    role: 'Armor Penetration',
    skills: ['voidArrow', 'nullZone', 'darkVolley', 'oblivion'],
    scrollId: 'scroll_voidHunter'
  },
  
  // === MAGE HIDDEN CLASSES ===
  frostWeaver: {
    id: 'frostWeaver',
    name: 'Frost Weaver',
    icon: '❄️',
    color: 'text-cyan-300',
    baseClass: 'mage',
    element: 'ice',
    description: 'Absolute zero incarnate, freezing enemies solid before shattering them completely.',
    role: 'Control',
    skills: ['frostBolt', 'blizzard', 'iceArmor', 'absoluteZero'],
    scrollId: 'scroll_frostWeaver'
  },
  
  pyromancer: {
    id: 'pyromancer',
    name: 'Pyromancer',
    icon: '🔥',
    color: 'text-orange-400',
    baseClass: 'mage',
    element: 'fire',
    description: 'Master of fire magic, unleashing devastating infernos upon enemies.',
    role: 'Pure DPS',
    skills: ['flameBurst', 'combustion', 'inferno', 'hellfire'],
    scrollId: 'scroll_pyromancer'
  },
  
  stormcaller: {
    id: 'stormcaller',
    name: 'Stormcaller',
    icon: '⚡',
    color: 'text-yellow-400',
    baseClass: 'mage',
    element: 'lightning',
    description: 'Calls down the fury of storms, striking multiple times with chain lightning.',
    role: 'Chain Hits',
    skills: ['shock', 'lightningBolt', 'thunderChain', 'tempest'],
    scrollId: 'scroll_stormcaller'
  },
  
  necromancer: {
    id: 'necromancer',
    name: 'Necromancer',
    icon: '💀',
    color: 'text-purple-600',
    baseClass: 'mage',
    element: 'dark',
    description: 'Commands the power of death, draining life from enemies to sustain themselves.',
    role: 'Drain',
    skills: ['lifeDrain', 'curse', 'soulRend', 'deathPact'],
    scrollId: 'scroll_necromancer'
  },
  
  arcanist: {
    id: 'arcanist',
    name: 'Arcanist',
    icon: '✨',
    color: 'text-yellow-200',
    baseClass: 'mage',
    element: 'holy',
    description: 'Master of pure arcane power, amplifying their abilities to devastating effect.',
    role: 'Buff/Burst',
    skills: ['arcaneMissile', 'empower', 'arcaneBurst', 'transcendence'],
    scrollId: 'scroll_arcanist'
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getBaseClass(classId) {
  return BASE_CLASSES[classId] || null;
}

export function getHiddenClass(classId) {
  return HIDDEN_CLASSES[classId] || null;
}

export function getClassInfo(classId) {
  return BASE_CLASSES[classId] || HIDDEN_CLASSES[classId] || null;
}

export function getHiddenClassesForBase(baseClassId) {
  const baseClass = BASE_CLASSES[baseClassId];
  if (!baseClass) return [];
  
  return baseClass.hiddenClasses.map(hcId => HIDDEN_CLASSES[hcId]).filter(Boolean);
}

export function getAllHiddenClasses() {
  return Object.values(HIDDEN_CLASSES);
}

export function getClassElement(classId) {
  const hiddenClass = HIDDEN_CLASSES[classId];
  return hiddenClass ? hiddenClass.element : 'none';
}

export function getClassSkills(baseClassId, hiddenClassId = null) {
  const skills = [];
  
  const baseClass = BASE_CLASSES[baseClassId];
  if (baseClass) {
    skills.push(...baseClass.skills);
  }
  
  if (hiddenClassId && hiddenClassId !== 'none') {
    const hiddenClass = HIDDEN_CLASSES[hiddenClassId];
    if (hiddenClass) {
      skills.push(...hiddenClass.skills);
    }
  }
  
  return skills;
}

export function getScrollForHiddenClass(hiddenClassId) {
  const hiddenClass = HIDDEN_CLASSES[hiddenClassId];
  return hiddenClass ? hiddenClass.scrollId : null;
}

export function getHiddenClassByScroll(scrollId) {
  for (const [id, hc] of Object.entries(HIDDEN_CLASSES)) {
    if (hc.scrollId === scrollId) {
      return hc;
    }
  }
  return null;
}

// ============================================================
// FORMAT FOR UI
// ============================================================

export function formatClassForDisplay(classId) {
  const classInfo = getClassInfo(classId);
  if (!classInfo) return null;
  
  return {
    id: classInfo.id,
    name: classInfo.name,
    icon: classInfo.icon,
    color: classInfo.color,
    description: classInfo.description,
    element: classInfo.element || 'none',
    role: classInfo.role || null,
    isHidden: !!HIDDEN_CLASSES[classId]
  };
}

export default {
  BASE_CLASSES,
  HIDDEN_CLASSES,
  getBaseClass,
  getHiddenClass,
  getClassInfo,
  getHiddenClassesForBase,
  getAllHiddenClasses,
  getClassElement,
  getClassSkills,
  getScrollForHiddenClass,
  getHiddenClassByScroll,
  formatClassForDisplay
};
