import React, { useState, useEffect, useRef } from 'react';
import { towerAPI } from '../services/api';

// ============================================================
// SKILL DATA - Phase 7 Complete Skill Database (for display)
// ============================================================

const SKILL_DATA = {
  // Base Swordsman
  slash: { name: 'Slash', mpCost: 5, element: 'none', desc: '120% P.DMG' },
  heavyStrike: { name: 'Heavy Strike', mpCost: 12, element: 'none', desc: '180% P.DMG' },
  shieldBash: { name: 'Shield Bash', mpCost: 8, element: 'none', desc: '100% P.DMG + -15% ATK' },
  warCry: { name: 'War Cry', mpCost: 15, element: 'none', desc: '+25% P.DMG (3t)' },
  // Base Thief
  backstab: { name: 'Backstab', mpCost: 8, element: 'none', desc: '200% P.DMG +30% crit' },
  poisonBlade: { name: 'Poison Blade', mpCost: 10, element: 'nature', desc: '100% P.DMG + Poison' },
  smokeScreen: { name: 'Smoke Screen', mpCost: 12, element: 'none', desc: '+40% Evasion (2t)' },
  steal: { name: 'Steal', mpCost: 5, element: 'none', desc: 'Steal 5-15% gold' },
  // Base Archer
  preciseShot: { name: 'Precise Shot', mpCost: 6, element: 'none', desc: '150% P.DMG, never miss' },
  multiShot: { name: 'Multi Shot', mpCost: 14, element: 'none', desc: '3× 60% P.DMG' },
  eagleEye: { name: 'Eagle Eye', mpCost: 10, element: 'none', desc: '+25% Crit, +20% CritDMG' },
  arrowRain: { name: 'Arrow Rain', mpCost: 20, element: 'none', desc: '220% P.DMG' },
  // Base Mage
  fireball: { name: 'Fireball', mpCost: 10, element: 'fire', desc: '160% M.DMG + Burn' },
  iceSpear: { name: 'Ice Spear', mpCost: 12, element: 'ice', desc: '140% M.DMG + -20% ATK' },
  manaShield: { name: 'Mana Shield', mpCost: 15, element: 'none', desc: 'Shield = 50% MP' },
  thunderbolt: { name: 'Thunderbolt', mpCost: 18, element: 'lightning', desc: '200% M.DMG' },
  // Flameblade
  flameSlash: { name: 'Flame Slash', mpCost: 15, element: 'fire', desc: '180% P.DMG + Burn' },
  infernoStrike: { name: 'Inferno Strike', mpCost: 25, element: 'fire', desc: '280% P.DMG' },
  fireAura: { name: 'Fire Aura', mpCost: 20, element: 'fire', desc: '+30% P.DMG, reflect' },
  volcanicRage: { name: 'Volcanic Rage', mpCost: 40, element: 'fire', desc: '350% P.DMG + Burn' },
  // Berserker
  rageSlash: { name: 'Rage Slash', mpCost: 10, element: 'none', desc: '200% P.DMG, -5% HP' },
  bloodFury: { name: 'Blood Fury', mpCost: 20, element: 'none', desc: '+50% P.DMG, -20% DEF' },
  recklessCharge: { name: 'Reckless Charge', mpCost: 15, element: 'none', desc: '250% P.DMG, -10% HP' },
  deathwish: { name: 'Deathwish', mpCost: 35, element: 'none', desc: '400% P.DMG, -20% HP' },
  // Paladin
  holyStrike: { name: 'Holy Strike', mpCost: 12, element: 'holy', desc: '160% P.DMG' },
  divineShield: { name: 'Divine Shield', mpCost: 18, element: 'holy', desc: 'Shield = 200% P.DEF' },
  healingLight: { name: 'Healing Light', mpCost: 20, element: 'holy', desc: 'Heal 35% Max HP' },
  judgment: { name: 'Judgment', mpCost: 35, element: 'holy', desc: '300% P.DMG + Purify' },
  // Earthshaker
  groundSlam: { name: 'Ground Slam', mpCost: 12, element: 'earth', desc: '150% P.DMG + -20% DEF' },
  stoneSkin: { name: 'Stone Skin', mpCost: 15, element: 'earth', desc: '+50% P.DEF (3t)' },
  earthquake: { name: 'Earthquake', mpCost: 25, element: 'earth', desc: '220% P.DMG + -30% DEF' },
  titansWrath: { name: 'Titan\'s Wrath', mpCost: 40, element: 'earth', desc: '320% P.DMG + Stun' },
  // Frostguard
  frostStrike: { name: 'Frost Strike', mpCost: 12, element: 'ice', desc: '140% P.DMG + -15% ATK' },
  iceBarrier: { name: 'Ice Barrier', mpCost: 18, element: 'ice', desc: '+40% DEF, reflect' },
  frozenBlade: { name: 'Frozen Blade', mpCost: 20, element: 'ice', desc: '200% P.DMG + -25% ATK' },
  glacialFortress: { name: 'Glacial Fortress', mpCost: 35, element: 'ice', desc: '+60% DEF, immune' },
  // Shadow Dancer
  shadowStrike: { name: 'Shadow Strike', mpCost: 12, element: 'dark', desc: '220% P.DMG +40% crit' },
  vanish: { name: 'Vanish', mpCost: 20, element: 'dark', desc: 'Next attack auto-crit' },
  deathMark: { name: 'Death Mark', mpCost: 18, element: 'dark', desc: '+30% damage taken' },
  shadowDance: { name: 'Shadow Dance', mpCost: 35, element: 'dark', desc: '5× 80% P.DMG' },
  // Venomancer
  toxicStrike: { name: 'Toxic Strike', mpCost: 10, element: 'nature', desc: '120% P.DMG + Poison' },
  venomCoat: { name: 'Venom Coat', mpCost: 15, element: 'nature', desc: 'Attacks add Poison' },
  plague: { name: 'Plague', mpCost: 22, element: 'nature', desc: '150% P.DMG + strong Poison' },
  pandemic: { name: 'Pandemic', mpCost: 38, element: 'nature', desc: '200% P.DMG + mega Poison' },
  // Assassin
  exposeWeakness: { name: 'Expose Weakness', mpCost: 10, element: 'none', desc: '130% P.DMG + -25% DEF' },
  markForDeath: { name: 'Mark for Death', mpCost: 15, element: 'none', desc: '+40% crit received' },
  execute: { name: 'Execute', mpCost: 25, element: 'none', desc: '250% P.DMG (+100% if <30%)' },
  assassination: { name: 'Assassination', mpCost: 40, element: 'none', desc: '500% P.DMG (if <20%)' },
  // Phantom
  haunt: { name: 'Haunt', mpCost: 12, element: 'dark', desc: '140% P.DMG + -15% stats' },
  nightmare: { name: 'Nightmare', mpCost: 18, element: 'dark', desc: '-30% ATK & DEF' },
  soulDrain: { name: 'Soul Drain', mpCost: 20, element: 'dark', desc: '180% P.DMG + Lifesteal' },
  dread: { name: 'Dread', mpCost: 40, element: 'dark', desc: '250% P.DMG + -40% stats' },
  // Bloodreaper
  bloodlet: { name: 'Bloodlet', mpCost: 10, element: 'none', desc: '150% P.DMG + 20% LS' },
  sanguineBlade: { name: 'Sanguine Blade', mpCost: 15, element: 'none', desc: 'Attacks lifesteal' },
  crimsonSlash: { name: 'Crimson Slash', mpCost: 22, element: 'none', desc: '220% P.DMG + 35% LS' },
  exsanguinate: { name: 'Exsanguinate', mpCost: 38, element: 'none', desc: '300% P.DMG + 50% LS' },
  // Storm Ranger
  lightningArrow: { name: 'Lightning Arrow', mpCost: 14, element: 'lightning', desc: '200% P.DMG' },
  chainLightning: { name: 'Chain Lightning', mpCost: 22, element: 'lightning', desc: '3× 100% M.DMG' },
  stormEye: { name: 'Storm Eye', mpCost: 18, element: 'lightning', desc: '+30% Acc, +40% CritDMG' },
  thunderstorm: { name: 'Thunderstorm', mpCost: 45, element: 'lightning', desc: '4× 120% M.DMG' },
  // Pyro Archer
  fireArrow: { name: 'Fire Arrow', mpCost: 12, element: 'fire', desc: '170% P.DMG + Burn' },
  explosiveShot: { name: 'Explosive Shot', mpCost: 18, element: 'fire', desc: '230% P.DMG' },
  ignite: { name: 'Ignite', mpCost: 15, element: 'fire', desc: 'Attacks add Burn' },
  meteorArrow: { name: 'Meteor Arrow', mpCost: 40, element: 'fire', desc: '350% P.DMG + Burn' },
  // Frost Sniper
  iceArrow: { name: 'Ice Arrow', mpCost: 12, element: 'ice', desc: '180% P.DMG + -15% ATK' },
  frozenAim: { name: 'Frozen Aim', mpCost: 15, element: 'ice', desc: '+50% CritDMG (3t)' },
  piercingCold: { name: 'Piercing Cold', mpCost: 22, element: 'ice', desc: '260% P.DMG + -25% DEF' },
  absoluteShot: { name: 'Absolute Shot', mpCost: 42, element: 'ice', desc: '420% P.DMG + Freeze' },
  // Nature Warden
  thornArrow: { name: 'Thorn Arrow', mpCost: 10, element: 'nature', desc: '150% P.DMG + Poison' },
  naturesGift: { name: 'Nature\'s Gift', mpCost: 18, element: 'nature', desc: 'Heal 30% + Cleanse' },
  vineTrap: { name: 'Vine Trap', mpCost: 15, element: 'nature', desc: '130% P.DMG + -40% Eva' },
  overgrowth: { name: 'Overgrowth', mpCost: 35, element: 'nature', desc: '280% P.DMG + Poison' },
  // Void Hunter
  voidArrow: { name: 'Void Arrow', mpCost: 14, element: 'dark', desc: '190% P.DMG, -30% DEF pen' },
  nullZone: { name: 'Null Zone', mpCost: 18, element: 'dark', desc: '-40% DEF (3t)' },
  darkVolley: { name: 'Dark Volley', mpCost: 25, element: 'dark', desc: '3× 90% P.DMG' },
  oblivion: { name: 'Oblivion', mpCost: 45, element: 'dark', desc: '380% P.DMG, -50% DEF pen' },
  // Frost Weaver
  frostBolt: { name: 'Frost Bolt', mpCost: 12, element: 'ice', desc: '150% M.DMG + -25% ATK' },
  blizzard: { name: 'Blizzard', mpCost: 28, element: 'ice', desc: '200% M.DMG + -30% DEF' },
  iceArmor: { name: 'Ice Armor', mpCost: 20, element: 'ice', desc: '+40% P.DEF, +20% M.DEF' },
  absoluteZero: { name: 'Absolute Zero', mpCost: 50, element: 'ice', desc: '400% M.DMG + Freeze' },
  // Pyromancer
  flameBurst: { name: 'Flame Burst', mpCost: 12, element: 'fire', desc: '170% M.DMG + Burn' },
  combustion: { name: 'Combustion', mpCost: 20, element: 'fire', desc: '240% M.DMG' },
  inferno: { name: 'Inferno', mpCost: 30, element: 'fire', desc: '280% M.DMG + Burn' },
  hellfire: { name: 'Hellfire', mpCost: 48, element: 'fire', desc: '450% M.DMG + Burn' },
  // Stormcaller
  shock: { name: 'Shock', mpCost: 10, element: 'lightning', desc: '140% M.DMG + 20% Stun' },
  lightningBolt: { name: 'Lightning Bolt', mpCost: 18, element: 'lightning', desc: '200% M.DMG' },
  thunderChain: { name: 'Thunder Chain', mpCost: 25, element: 'lightning', desc: '3× 90% M.DMG' },
  tempest: { name: 'Tempest', mpCost: 45, element: 'lightning', desc: '5× 100% M.DMG' },
  // Necromancer
  lifeDrain: { name: 'Life Drain', mpCost: 12, element: 'dark', desc: '140% M.DMG + 30% LS' },
  curse: { name: 'Curse', mpCost: 15, element: 'dark', desc: '-25% all stats (3t)' },
  soulRend: { name: 'Soul Rend', mpCost: 25, element: 'dark', desc: '220% M.DMG + 40% LS' },
  deathPact: { name: 'Death Pact', mpCost: 42, element: 'dark', desc: '350% M.DMG + 50% LS' },
  // Arcanist
  arcaneMissile: { name: 'Arcane Missile', mpCost: 10, element: 'holy', desc: '160% M.DMG' },
  empower: { name: 'Empower', mpCost: 18, element: 'holy', desc: '+35% M.DMG (3t)' },
  arcaneBurst: { name: 'Arcane Burst', mpCost: 28, element: 'holy', desc: '280% M.DMG' },
  transcendence: { name: 'Transcendence', mpCost: 45, element: 'holy', desc: '+50% DMG, +30% Crit' },
};

// Element icons
const ELEMENT_ICONS = {
  none: '', fire: '🔥', water: '💧', lightning: '⚡', earth: '🌍',
  nature: '🌿', ice: '❄️', dark: '🌑', holy: '✨'
};

const TowerPanel = ({ character, onCharacterUpdate, addLog, onTowerStateChange }) => {
  const [towers, setTowers] = useState([]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [gameState, setGameState] = useState('tower_select');
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [storyText, setStoryText] = useState('');
  const [choices, setChoices] = useState([]);
  const [scenarioId, setScenarioId] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [floorRequirements, setFloorRequirements] = useState(null);
  const [treasureAfter, setTreasureAfter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [eventProgress, setEventProgress] = useState(null);
  const [playerBuffs, setPlayerBuffs] = useState([]);
  const [enemyDebuffs, setEnemyDebuffs] = useState([]);
  const logRef = useRef(null);

  useEffect(() => { fetchTowers(); }, []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [combatLog, storyText]);

  const fetchTowers = async () => {
    try {
      const { data } = await towerAPI.getInfo();
      setTowers(data.towers);
      if (data.currentTower) {
        const current = data.towers.find(t => t.id === data.currentTower);
        if (current) setSelectedTower(current);
      }
    } catch (err) { console.error(err); }
  };

  const fetchFloors = async (towerId) => {
    try {
      const { data } = await towerAPI.getFloors(towerId);
      setFloors(data.floors);
      setSelectedFloor(data.currentFloor || 1);
    } catch (err) { console.error(err); }
  };

  const handleSelectTower = async (tower) => {
    if (!tower.isUnlocked) {
      addLog('error', 'Tower locked! Clear previous tower first.');
      return;
    }
    setSelectedTower(tower);
  };

  const handleEnterTower = async () => {
    if (!selectedTower) return;
    setIsLoading(true);
    try {
      const { data } = await towerAPI.enter(selectedTower.id);
      addLog('system', data.message);
      if (selectedFloor > 1) {
        await towerAPI.selectFloor(selectedTower.id, selectedFloor);
      }
      setGameState('in_tower');
      setPlayerBuffs([]);
      setEnemyDebuffs([]);
      if (onTowerStateChange) onTowerStateChange(true);
      onCharacterUpdate();
    } catch (err) { 
      const error = err.response?.data?.error || 'Failed to enter';
      addLog('error', error);
      if (error.includes('cursed')) {
        const match = error.match(/(\d+) more minutes/);
        if (match) setLockoutTime(parseInt(match[1]));
      }
    }
    setIsLoading(false);
  };

  const handleSelectFloor = async (floor) => {
    if (!floor.unlocked) {
      addLog('error', 'Floor not unlocked yet!');
      return;
    }
    setSelectedFloor(floor.floor);
  };

  const handleExplore = async () => {
    setIsLoading(true);
    setCombatLog([]);
    setRewards(null);
    setTreasureAfter(null);
    setEventProgress(null);
    setPlayerBuffs([]);
    setEnemyDebuffs([]);
    try {
      const { data } = await towerAPI.explore();
      if (data.type === 'safe_zone') {
        setGameState('safe_zone');
        setStoryText(data.story);
        addLog('info', data.message);
      } else {
        setStoryText(data.story);
        setChoices(data.choices);
        setScenarioId(data.scenarioId);
        setEventProgress(data.eventProgress || null);
        setGameState('choosing_path');
      }
    } catch (err) { 
      addLog('error', err.response?.data?.error || 'Exploration failed');
    }
    setIsLoading(false);
  };

  // Handle continuing to next event in multi-event sequence
  const handleNextEvent = (nextEvent, progress) => {
    setStoryText(nextEvent.story || nextEvent.description || 'The path continues...');
    setChoices(nextEvent.choices || []);
    setScenarioId(nextEvent.scenarioId || scenarioId);
    setEventProgress(progress);
    setGameState('choosing_path');
  };

  const handleChoosePath = async (choice) => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.choosePath(scenarioId, choice);
      handlePathOutcome(data);
    } catch (err) { addLog('error', err.response?.data?.error || 'Choice failed'); }
    setIsLoading(false);
  };

  const handlePathOutcome = (data) => {
    const type = data.type;
    
    // Check for multi-event continuation
    if (type && type.endsWith('_continue') && data.nextEvent) {
      // Process current outcome first
      if (data.damage) {
        addLog('combat', `You took ${data.damage} damage!`);
      }
      if (data.healing) {
        addLog('success', `You healed ${data.healing} HP!`);
      }
      if (data.gold) {
        addLog('success', `Found ${data.gold} gold!`);
      }
      if (data.item) {
        addLog('success', `Found ${data.item.name}!`);
      }
      
      onCharacterUpdate();
      handleNextEvent(data.nextEvent, data.eventProgress);
      return;
    }
    
    // Normal outcome handling
    switch (type) {
      case 'combat':
      case 'combat_then_treasure':
        const enemy = data.enemy;
        const normalizedEnemy = {
          ...enemy,
          id: enemy.id || enemy.name?.toLowerCase().replace(/\s+/g, '_') || 'enemy',
          hp: enemy.hp || enemy.baseHp || 100,
          maxHp: enemy.maxHp || enemy.baseHp || enemy.hp || 100,
          atk: enemy.atk || enemy.baseAtk || enemy.attack || 10,
          def: enemy.def || enemy.baseDef || enemy.defense || 5,
          name: enemy.name || 'Unknown Enemy',
          icon: enemy.icon || '👹',
          isBoss: enemy.isBoss || false,
          isElite: enemy.isElite || false,
          expReward: enemy.expReward || enemy.exp || 20,
          goldReward: enemy.goldReward || enemy.gold || { min: 10, max: 20 },
          element: enemy.element || 'none',
          activeBuffs: enemy.activeBuffs || []
        };
        setCurrentEnemy(normalizedEnemy);
        setEnemyDebuffs(normalizedEnemy.activeBuffs || []);
        addLog('combat', `${normalizedEnemy.name} appears!`);
        if (type === 'combat_then_treasure') setTreasureAfter(true);
        setGameState('combat');
        break;
      case 'damage':
        setStoryText(data.message || 'You took damage!');
        addLog('combat', `You took ${data.damage || 0} damage!`);
        setGameState('in_tower');
        break;
      case 'heal':
        setStoryText(data.message || 'You feel refreshed!');
        addLog('success', data.message || 'Healed!');
        setGameState('in_tower');
        break;
      case 'gold_reward':
      case 'item_reward':
      case 'material_reward':
        setStoryText(data.message || 'You found something!');
        addLog('success', data.message || 'Reward obtained!');
        setGameState('in_tower');
        break;
      case 'lore_reward':
      case 'safe_progress':
        setStoryText(data.message || 'You continue onward...');
        addLog('info', data.message || 'Progress made.');
        setGameState('in_tower');
        break;
      case 'treasure':
        setStoryText(data.message || 'You found treasure!');
        setRewards(data.rewards);
        setGameState('victory');
        break;
      case 'nothing':
        setStoryText(data.message || 'Nothing happens...');
        setGameState('in_tower');
        break;
      default:
        setStoryText(data.message || 'Something happened...');
        if (data.rewards) {
          setRewards(data.rewards);
          setGameState('victory');
        } else {
          setGameState('in_tower');
        }
    }
    onCharacterUpdate();
  };

  const handleAttack = async () => {
    if (!currentEnemy) return;
    setIsLoading(true);
    try {
      const enemyData = {
        ...currentEnemy,
        id: currentEnemy.id || currentEnemy.name?.toLowerCase().replace(/\s+/g, '_') || 'enemy',
        hp: currentEnemy.hp || 50,
        maxHp: currentEnemy.maxHp || currentEnemy.hp || 50,
        atk: currentEnemy.atk || currentEnemy.attack || 10,
        def: currentEnemy.def || currentEnemy.defense || 5,
        name: currentEnemy.name || 'Enemy',
        isBoss: currentEnemy.isBoss || false,
        isElite: currentEnemy.isElite || false,
        expReward: currentEnemy.expReward || currentEnemy.exp || 20,
        goldReward: currentEnemy.goldReward || currentEnemy.gold || 10,
        activeBuffs: enemyDebuffs || []
      };
      const { data } = await towerAPI.attack(enemyData, treasureAfter);
      
      // Process combat log
      if (data.combatLog) {
        data.combatLog.forEach(log => setCombatLog(prev => [...prev, { 
          type: log.actor, 
          message: log.message,
          isCritical: log.isCritical,
          element: log.element
        }]));
      }
      
      // Update buffs from response
      if (data.character?.activeBuffs) {
        setPlayerBuffs(data.character.activeBuffs);
      }
      if (data.enemy?.activeBuffs) {
        setEnemyDebuffs(data.enemy.activeBuffs);
      }
      
      handleCombatResult(data);
    } catch (err) { addLog('error', err.response?.data?.error || 'Attack failed'); }
    setIsLoading(false);
  };

  const handleUseSkill = async (skillId) => {
    if (!currentEnemy) return;
    setIsLoading(true);
    try {
      const enemyData = {
        ...currentEnemy,
        id: currentEnemy.id || currentEnemy.name?.toLowerCase().replace(/\s+/g, '_') || 'enemy',
        hp: currentEnemy.hp || 50,
        maxHp: currentEnemy.maxHp || currentEnemy.hp || 50,
        atk: currentEnemy.atk || currentEnemy.attack || 10,
        def: currentEnemy.def || currentEnemy.defense || 5,
        name: currentEnemy.name || 'Enemy',
        isBoss: currentEnemy.isBoss || false,
        isElite: currentEnemy.isElite || false,
        expReward: currentEnemy.expReward || currentEnemy.exp || 20,
        goldReward: currentEnemy.goldReward || currentEnemy.gold || 10,
        activeBuffs: enemyDebuffs || []
      };
      const { data } = await towerAPI.useSkill(enemyData, skillId, treasureAfter);
      
      // Process combat log
      if (data.combatLog) {
        data.combatLog.forEach(log => setCombatLog(prev => [...prev, { 
          type: log.actor, 
          message: log.message,
          isCritical: log.isCritical,
          element: log.element,
          skillName: log.skillName
        }]));
      }
      
      // Update buffs from response
      if (data.character?.activeBuffs) {
        setPlayerBuffs(data.character.activeBuffs);
      }
      if (data.enemy?.activeBuffs) {
        setEnemyDebuffs(data.enemy.activeBuffs);
      }
      
      handleCombatResult(data);
    } catch (err) { addLog('error', err.response?.data?.error || 'Skill failed'); }
    setIsLoading(false);
  };

  const handleFlee = async () => {
    if (!currentEnemy) return;
    setIsLoading(true);
    try {
      const enemyData = {
        ...currentEnemy,
        atk: currentEnemy.atk || currentEnemy.attack
      };
      const { data } = await towerAPI.flee(enemyData);
      if (data.status === 'fled') {
        addLog('info', 'You successfully fled!');
        setPlayerBuffs([]);
        setEnemyDebuffs([]);
        setGameState('in_tower');
      } else {
        setCombatLog(prev => [...prev, { type: 'enemy', message: data.message }]);
        if (data.character?.activeBuffs) {
          setPlayerBuffs(data.character.activeBuffs);
        }
      }
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Flee failed'); }
    setIsLoading(false);
  };

  const handleCombatResult = (data) => {
    if (data.status === 'victory') {
      setStoryText(data.message || 'Victory!');
      setRewards(data.rewards);
      setPlayerBuffs([]);
      setEnemyDebuffs([]);
      if (treasureAfter) {
        addLog('success', 'Victory! A treasure chest appears...');
      }
      setGameState('victory');
    } else if (data.status === 'defeat') {
      addLog('error', data.message || 'You were defeated...');
      setStoryText(data.message || 'You were defeated...');
      setPlayerBuffs([]);
      setEnemyDebuffs([]);
      setGameState('defeat');
    } else if (data.status === 'ongoing') {
      setCurrentEnemy(prev => ({
        ...prev,
        ...data.enemy,
        hp: data.enemy.hp,
        activeBuffs: data.enemy?.activeBuffs || []
      }));
    }
    onCharacterUpdate();
  };

  const handleUsePotion = async (type) => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.usePotion(type);
      addLog('success', data.message);
      if (gameState === 'combat') {
        setCombatLog(prev => [...prev, { type: 'player', message: data.message }]);
      }
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'No potions!'); }
    setIsLoading(false);
  };

  const handleCheckDoorkeeper = async () => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.checkFloorRequirements();
      setFloorRequirements(data);
      setStoryText(data.doorkeeper || 'The doorkeeper awaits...');
      setGameState('doorkeeper');
    } catch (err) { addLog('error', 'Could not reach doorkeeper'); }
    setIsLoading(false);
  };

  const handleAdvance = async () => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.advance();
      addLog('success', data.message);
      setGameState('in_tower');
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Cannot advance'); }
    setIsLoading(false);
  };

  const handleLeaveTower = async () => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.leave();
      addLog('info', data.message);
      setGameState('tower_select');
      setPlayerBuffs([]);
      setEnemyDebuffs([]);
      if (onTowerStateChange) onTowerStateChange(false);
      onCharacterUpdate();
    } catch (err) { addLog('error', 'Failed to leave tower'); }
    setIsLoading(false);
  };

  const getUnlockedSkills = () => {
    return character?.skills?.filter(s => s.unlocked) || [];
  };

  const getSkillMpCost = (skillId) => {
    return SKILL_DATA[skillId]?.mpCost || 10;
  };

  const getSkillElement = (skillId) => {
    return SKILL_DATA[skillId]?.element || 'none';
  };

  const getTowerDrops = (towerId) => {
    const drops = {
      1: ['Bone Fragment', 'Hollow Essence', 'Gridz Set Pieces'],
      2: ['Sea Crystal', 'Aqua Essence', 'Tempest Set Pieces'],
      3: ['Molten Core', 'Fire Essence', 'Inferno Set Pieces'],
      4: ['Frost Shard', 'Ice Essence', 'Glacial Set Pieces'],
      5: ['Shadow Fragment', 'Void Essence', 'Nightmare Set Pieces'],
      6: ['Celestial Dust', 'Holy Essence', 'Celestial Set Pieces'],
      7: ['Abyssal Stone', 'Dark Essence', 'Abyssal Set Pieces'],
      8: ['Dragon Scale', 'Dragon Essence', 'Dragonborn Set Pieces'],
      9: ['Eternal Shard', 'Time Essence', 'Eternal Set Pieces'],
      10: ['Divine Fragment', 'God Essence', 'Divine Set Pieces']
    };
    return drops[towerId] || ['Unknown Materials'];
  };

  // ============================================================
  // BUFF/DEBUFF DISPLAY COMPONENT
  // ============================================================
  
  const BuffDisplay = ({ buffs, isEnemy = false }) => {
    if (!buffs || buffs.length === 0) return null;
    
    return (
      <div className={`flex flex-wrap gap-1 justify-center mt-1`}>
        {buffs.map((buff, idx) => {
          // Safely get buff values - handle objects
          const buffName = typeof buff.name === 'string' ? buff.name : (buff.name?.toString() || 'Buff');
          const buffValue = typeof buff.value === 'number' ? buff.value : (typeof buff.value === 'string' ? buff.value : '');
          const buffDuration = typeof buff.duration === 'number' ? buff.duration : 0;
          const buffIcon = typeof buff.icon === 'string' ? buff.icon : '✨';
          const buffType = buff.type || '';
          
          // Format value display
          let valueDisplay = '';
          if (buffValue !== '' && buffValue !== 0) {
            const prefix = buffValue > 0 && buffType !== 'dot' ? '+' : '';
            const suffix = buffType === 'dot' ? '/t' : '%';
            valueDisplay = `${prefix}${buffValue}${suffix}`;
          }
          
          return (
            <div
              key={idx}
              className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
                isEnemy ? 'bg-red-900/50' : 'bg-blue-900/50'
              }`}
              title={`${buffName}: ${buffValue} (${buffDuration}t)`}
            >
              <span>{buffIcon}</span>
              {valueDisplay && <span className={buff.color || 'text-white'}>{valueDisplay}</span>}
              <span className="text-gray-400">({buffDuration}t)</span>
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================================
  // RENDER: Tower Select
  // ============================================================
  
  const renderTowerSelect = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-purple-400">🏰 Select Tower</h3>
      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
        {towers.map(tower => (
          <button
            key={tower.id}
            onClick={() => handleSelectTower(tower)}
            className={`p-3 rounded-lg text-left transition-all ${
              selectedTower?.id === tower.id
                ? 'bg-purple-700 border-2 border-purple-400'
                : tower.isUnlocked
                  ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600'
                  : 'bg-gray-900 opacity-50 cursor-not-allowed border border-gray-700'
            }`}
          >
            <div className="font-bold text-sm">{tower.name}</div>
            <div className="text-xs text-gray-400">Lv.{tower.levelRange}</div>
            {!tower.isUnlocked && <div className="text-xs text-red-400">🔒 Locked</div>}
          </button>
        ))}
      </div>
      
      {/* Tower Details */}
      {selectedTower && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <h4 className="font-bold text-lg text-purple-300">{selectedTower.name}</h4>
          <p className="text-sm text-gray-400">{selectedTower.description}</p>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Levels</div>
              <div className="text-white font-bold">{selectedTower.levelRange}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-gray-400">Floors</div>
              <div className="text-white font-bold">{selectedTower.floors || 15}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-yellow-400 font-semibold mb-1">👑 Boss</div>
              <div className="text-gray-300 text-xs">{selectedTower.boss || 'Unknown'}</div>
            </div>
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-yellow-400 font-semibold mb-1">📦 Drops</div>
              <div className="text-gray-300 text-xs">{getTowerDrops(selectedTower.id)[0]}</div>
            </div>
          </div>
          
          {/* Floor Select Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Start Floor:</span>
              <span className="text-blue-400 font-bold">{selectedFloor}</span>
            </div>
            <input
              type="range"
              min="1"
              max={selectedTower.highestFloor || 1}
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>{selectedTower.highestFloor || 1}</span>
            </div>
          </div>
          
          <button
            onClick={handleEnterTower}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold transition-all shadow-lg shadow-purple-500/30"
          >
            {isLoading ? '⏳ Entering...' : `⚡ Enter Tower (-10 Energy)`}
          </button>
        </div>
      )}
      
      {lockoutTime && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center">
          <span className="text-red-400">🔒 Tower Lockout: {lockoutTime} minutes remaining</span>
        </div>
      )}
    </div>
  );

  // ============================================================
  // RENDER: In Tower
  // ============================================================
  
  const renderInTower = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-blue-400">
          🏰 {selectedTower?.name || 'Tower'} - Floor {character?.currentFloor || 1}
        </h3>
        <div className="text-sm text-gray-400">
          HP: {character?.stats?.hp || 0}/{character?.stats?.maxHp || 0}
        </div>
      </div>
      
      {/* Player Buffs Display */}
      {playerBuffs.length > 0 && (
        <div className="bg-blue-900/20 rounded-lg p-2">
          <div className="text-xs text-blue-400 mb-1">Your Buffs:</div>
          <BuffDisplay buffs={playerBuffs} />
        </div>
      )}
      
      <div className="bg-gray-900/50 rounded-lg p-4 text-center">
        <p className="text-gray-300">The tower awaits exploration...</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={handleExplore} 
          disabled={isLoading}
          className="py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 rounded-lg font-bold transition-all"
        >
          {isLoading ? '⏳...' : '🔍 Explore'}
        </button>
        <button onClick={handleCheckDoorkeeper} disabled={isLoading} className="py-3 bg-purple-700 hover:bg-purple-600 rounded-lg font-bold">
          ⛩️ Doorkeeper
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleUsePotion('hp')} disabled={isLoading} className="py-2 bg-red-700 hover:bg-red-600 rounded">
          ❤️ HP Potion
        </button>
        <button onClick={() => handleUsePotion('mp')} disabled={isLoading} className="py-2 bg-blue-700 hover:bg-blue-600 rounded">
          💙 MP Potion
        </button>
      </div>
      
      <button onClick={handleLeaveTower} disabled={isLoading} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded">
        🚪 Leave Tower
      </button>
    </div>
  );

  // ============================================================
  // RENDER: Choosing Path
  // ============================================================
  
  const renderChoosingPath = () => (
    <div className="space-y-4">
      {eventProgress && (
        <div className="flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: eventProgress.total }, (_, i) => (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < eventProgress.current 
                  ? 'bg-green-500' 
                  : i === eventProgress.current - 1 
                    ? 'bg-blue-500 ring-2 ring-blue-300' 
                    : 'bg-gray-600'
              }`}
            />
          ))}
          <span className="text-gray-400 ml-2">Event {eventProgress.current}/{eventProgress.total}</span>
        </div>
      )}
      
      <p className="text-gray-300 whitespace-pre-line bg-gray-900/50 p-4 rounded-lg">{storyText}</p>
      
      <div className="grid gap-2">
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleChoosePath(choice)}
            disabled={isLoading}
            className="py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left capitalize transition-all hover:translate-x-1"
          >
            {choice === 'left' ? '← ' : choice === 'right' ? '→ ' : 
             choice === 'crown' ? '👑 ' : choice === 'skull' ? '💀 ' : choice === 'sword' ? '🗡️ ' : '• '}
            {choice.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    </div>
  );

  // ============================================================
  // RENDER: Combat (with buffs/debuffs)
  // ============================================================
  
  const renderCombat = () => {
    const unlockedSkills = getUnlockedSkills();
    
    return (
      <div className="space-y-3">
        {/* Enemy Display */}
        {currentEnemy && (
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-1">{currentEnemy.icon || '👹'}</div>
            <h4 className="font-bold text-lg">{currentEnemy.name}</h4>
            <div className="flex justify-center gap-2 text-sm">
              {currentEnemy.isBoss && <span className="text-red-400">👑 BOSS</span>}
              {currentEnemy.isElite && <span className="text-purple-400">⚔️ ELITE</span>}
              {currentEnemy.element && currentEnemy.element !== 'none' && (
                <span className="text-gray-400">{ELEMENT_ICONS[currentEnemy.element]} {currentEnemy.element}</span>
              )}
            </div>
            
            {/* Enemy HP Bar */}
            <div className="mt-2">
              <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all" 
                  style={{ width: Math.max(0, (currentEnemy.hp / currentEnemy.maxHp) * 100) + '%' }}
                />
              </div>
              <span className="text-sm">{Math.max(0, currentEnemy.hp)} / {currentEnemy.maxHp}</span>
            </div>
            
            {/* Enemy Debuffs */}
            {enemyDebuffs.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-red-400 mb-1">Debuffs:</div>
                <BuffDisplay buffs={enemyDebuffs} isEnemy={true} />
              </div>
            )}
          </div>
        )}
        
        {/* Combat Log */}
        <div ref={logRef} className="bg-gray-900 p-3 rounded-lg h-28 overflow-y-auto text-sm">
          {combatLog.map((log, i) => {
            // Ensure message is always a string
            const message = typeof log.message === 'string' ? log.message : 
                           (typeof log.message === 'object' ? JSON.stringify(log.message) : String(log.message || ''));
            const element = typeof log.element === 'string' ? log.element : '';
            
            return (
              <p key={i} className={`${
                log.type === 'player' ? 'text-green-400' : 
                log.type === 'enemy' ? 'text-red-400' : 
                log.type === 'system' ? 'text-yellow-400' : 'text-gray-400'
              } ${log.isCritical ? 'font-bold' : ''}`}>
                {element && ELEMENT_ICONS[element]} {message}
              </p>
            );
          })}
        </div>
        
        {/* Player Stats with Buffs */}
        <div className="bg-gray-800/50 p-2 rounded space-y-1">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">HP: </span>
              <span className="text-green-400">{character?.stats?.hp || 0}/{character?.stats?.maxHp || 0}</span>
            </div>
            <div>
              <span className="text-gray-400">MP: </span>
              <span className="text-blue-400">{character?.stats?.mp || 0}/{character?.stats?.maxMp || 0}</span>
            </div>
          </div>
          
          {/* Player Buffs */}
          {playerBuffs.length > 0 && (
            <div className="pt-1 border-t border-gray-700">
              <div className="text-xs text-blue-400 mb-1">Buffs:</div>
              <BuffDisplay buffs={playerBuffs} />
            </div>
          )}
        </div>
        
        {/* Basic Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleAttack} 
            disabled={isLoading} 
            className="py-2 bg-red-600 hover:bg-red-500 rounded font-bold disabled:opacity-50"
          >
            ⚔️ Attack
          </button>
          <button 
            onClick={handleFlee} 
            disabled={isLoading || currentEnemy?.isBoss} 
            className="py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 rounded"
          >
            🏃 Flee
          </button>
        </div>
        
        {/* Skills Section */}
        {unlockedSkills.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-purple-400 font-semibold">⚡ Skills</div>
            <div className="grid grid-cols-2 gap-2">
              {unlockedSkills.slice(0, 8).map(skill => {
                const mpCost = getSkillMpCost(skill.skillId);
                const element = getSkillElement(skill.skillId);
                const hasEnoughMp = (character?.stats?.mp || 0) >= mpCost;
                const elementIcon = ELEMENT_ICONS[element] || '';
                
                return (
                  <button
                    key={skill.skillId}
                    onClick={() => handleUseSkill(skill.skillId)}
                    disabled={isLoading || !hasEnoughMp}
                    className={`py-2 px-2 rounded text-sm transition-all ${
                      hasEnoughMp 
                        ? 'bg-purple-700 hover:bg-purple-600' 
                        : 'bg-gray-700 opacity-50 cursor-not-allowed'
                    }`}
                    title={SKILL_DATA[skill.skillId]?.desc || skill.name}
                  >
                    {elementIcon} {skill.name} <span className="text-blue-300">({mpCost})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {unlockedSkills.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-2">
            No skills available - check Skills tab
          </div>
        )}
        
        {/* Potions */}
        <div className="flex gap-2">
          <button onClick={() => handleUsePotion('hp')} className="flex-1 py-1 bg-red-800 hover:bg-red-700 rounded text-sm">❤️ HP</button>
          <button onClick={() => handleUsePotion('mp')} className="flex-1 py-1 bg-blue-800 hover:bg-blue-700 rounded text-sm">💙 MP</button>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: Victory
  // ============================================================
  
  const renderVictory = () => (
    <div className="space-y-4 text-center">
      <div className="text-4xl">🎉</div>
      <p className="text-gray-300 whitespace-pre-line">{storyText}</p>
      {rewards && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-bold text-yellow-400 mb-2">Rewards</h4>
          <p>+{rewards.exp} EXP | +{rewards.gold} Gold</p>
          {rewards.treasureGold && <p className="text-yellow-300">💰 +{rewards.treasureGold} Treasure Gold</p>}
          {rewards.items && rewards.items.length > 0 && (
            <div className="mt-2">
              {rewards.items.map((item, i) => (
                <span key={i} className="inline-block bg-gray-700 px-2 py-1 rounded m-1 text-sm">
                  {item.icon || '📦'} {item.name} {item.quantity > 1 && 'x' + item.quantity}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <button onClick={() => setGameState('in_tower')} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold">
        Continue
      </button>
    </div>
  );

  // ============================================================
  // RENDER: Defeat
  // ============================================================
  
  const renderDefeat = () => (
    <div className="space-y-4 text-center">
      <div className="text-4xl">💀</div>
      <h3 className="text-xl font-bold text-red-400">Defeated</h3>
      <p className="text-gray-400">{storyText || 'You have been defeated...'}</p>
      <button 
        onClick={() => {
          setGameState('tower_select');
          if (onTowerStateChange) onTowerStateChange(false);
          onCharacterUpdate();
        }} 
        className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-bold"
      >
        Return
      </button>
    </div>
  );

  // ============================================================
  // RENDER: Doorkeeper
  // ============================================================
  
  const renderDoorkeeper = () => (
    <div className="space-y-4">
      <p className="text-gray-300 italic">{storyText}</p>
      {floorRequirements && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-bold text-yellow-400 mb-2">Requirements for Floor {floorRequirements.nextFloor}</h4>
          {floorRequirements.requirements?.items?.map((req, i) => {
            const have = floorRequirements.playerItems[req.id] || 0;
            return (
              <p key={i} className={have >= req.quantity ? 'text-green-400' : 'text-red-400'}>
                {req.name}: {have}/{req.quantity}
              </p>
            );
          })}
          {floorRequirements.requirements?.gold > 0 && (
            <p className={floorRequirements.playerGold >= floorRequirements.requirements.gold ? 'text-green-400' : 'text-red-400'}>
              Gold: {floorRequirements.playerGold}/{floorRequirements.requirements.gold}
            </p>
          )}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleAdvance} disabled={isLoading || !floorRequirements?.canAdvance} className="py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:opacity-50 rounded font-bold">
          ⬆️ Advance
        </button>
        <button onClick={() => setGameState('in_tower')} className="py-2 bg-gray-600 hover:bg-gray-500 rounded">
          ← Back
        </button>
      </div>
    </div>
  );

  // ============================================================
  // RENDER: Safe Zone
  // ============================================================
  
  const renderSafeZone = () => (
    <div className="space-y-4 text-center">
      <div className="text-4xl">🏕️</div>
      <h3 className="text-xl font-bold text-green-400">Safe Zone</h3>
      <p className="text-gray-300">{storyText}</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleUsePotion('hp')} className="py-2 bg-red-700 hover:bg-red-600 rounded">
          ❤️ HP Potion
        </button>
        <button onClick={() => handleUsePotion('mp')} className="py-2 bg-blue-700 hover:bg-blue-600 rounded">
          💙 MP Potion
        </button>
      </div>
      <button onClick={() => setGameState('in_tower')} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg">
        Continue
      </button>
    </div>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="bg-gray-800/30 rounded-xl p-4 border border-purple-500/20">
      {gameState === 'tower_select' && renderTowerSelect()}
      {gameState === 'in_tower' && renderInTower()}
      {gameState === 'choosing_path' && renderChoosingPath()}
      {gameState === 'combat' && renderCombat()}
      {gameState === 'victory' && renderVictory()}
      {gameState === 'defeat' && renderDefeat()}
      {gameState === 'doorkeeper' && renderDoorkeeper()}
      {gameState === 'safe_zone' && renderSafeZone()}
    </div>
  );
};

export default TowerPanel;
