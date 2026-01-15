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
  darkMark: { name: 'Dark Mark', mpCost: 16, element: 'dark', desc: '+25% damage taken' },
  nullField: { name: 'Null Field', mpCost: 20, element: 'dark', desc: 'Dispel buffs, -40% M.DEF' },
  oblivion: { name: 'Oblivion', mpCost: 42, element: 'dark', desc: '380% P.DMG, ignore DEF' },
  // Frost Weaver
  frostBolt: { name: 'Frost Bolt', mpCost: 12, element: 'ice', desc: '170% M.DMG + -20% ATK' },
  blizzard: { name: 'Blizzard', mpCost: 25, element: 'ice', desc: '200% M.DMG + -30% ATK' },
  iceArmor: { name: 'Ice Armor', mpCost: 18, element: 'ice', desc: '+40% M.DEF (3t)' },
  absoluteZero: { name: 'Absolute Zero', mpCost: 45, element: 'ice', desc: '350% M.DMG + Freeze' },
  // Pyromancer
  flameBurst: { name: 'Flame Burst', mpCost: 14, element: 'fire', desc: '180% M.DMG + Burn' },
  inferno: { name: 'Inferno', mpCost: 28, element: 'fire', desc: '250% M.DMG + strong Burn' },
  fireShield: { name: 'Fire Shield', mpCost: 20, element: 'fire', desc: 'Reflect 30% damage' },
  supernova: { name: 'Supernova', mpCost: 50, element: 'fire', desc: '400% M.DMG + mega Burn' },
  // Stormcaller
  sparkBolt: { name: 'Spark Bolt', mpCost: 12, element: 'lightning', desc: '160% M.DMG' },
  thunderclap: { name: 'Thunderclap', mpCost: 22, element: 'lightning', desc: '2× 130% M.DMG' },
  staticField: { name: 'Static Field', mpCost: 18, element: 'lightning', desc: '-25% enemy evasion' },
  tempest: { name: 'Tempest', mpCost: 48, element: 'lightning', desc: '5× 100% M.DMG' },
  // Necromancer
  drainLife: { name: 'Drain Life', mpCost: 15, element: 'dark', desc: '150% M.DMG + 30% LS' },
  curse: { name: 'Curse', mpCost: 20, element: 'dark', desc: '-30% all stats (3t)' },
  soulHarvest: { name: 'Soul Harvest', mpCost: 25, element: 'dark', desc: '200% M.DMG + 50% LS' },
  deathPact: { name: 'Death Pact', mpCost: 45, element: 'dark', desc: '300% M.DMG + full LS' },
  // Arcanist
  arcaneBolt: { name: 'Arcane Bolt', mpCost: 10, element: 'none', desc: '3× 60% M.DMG' },
  manaStorm: { name: 'Mana Storm', mpCost: 25, element: 'none', desc: '4× 70% M.DMG' },
  arcaneShield: { name: 'Arcane Shield', mpCost: 15, element: 'none', desc: 'Shield = 100% INT' },
  arcaneBarrage: { name: 'Arcane Barrage', mpCost: 45, element: 'none', desc: '6× 80% M.DMG' }
};

const ELEMENT_ICONS = {
  fire: '🔥',
  ice: '❄️',
  lightning: '⚡',
  nature: '🌿',
  dark: '🌑',
  holy: '✨',
  earth: '🌍',
  none: ''
};

// ============================================================
// HELPER: Safe string conversion
// ============================================================
const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return String(value);
};

const safeNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

const TowerPanel = ({ character, onCharacterUpdate, onTowerStateChange }) => {
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
      setTowers(data.towers || []);
      if (data.currentTower) {
        const current = (data.towers || []).find(t => t.id === data.currentTower);
        if (current) setSelectedTower(current);
      }
    } catch (err) { console.error(err); }
  };

  const fetchFloors = async (towerId) => {
    try {
      const { data } = await towerAPI.getFloors(towerId);
      setFloors(data.floors || []);
      setSelectedFloor(data.currentFloor || 1);
    } catch (err) { console.error(err); }
  };

  const addLog = (type, message) => {
    setCombatLog(prev => [...prev, { type, message: safeString(message) }]);
  };

  const handleSelectTower = async (tower) => {
    if (!tower || !tower.isUnlocked) {
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
      addLog('system', safeString(data.message));
      if (selectedFloor > 1) {
        await towerAPI.selectFloor(selectedTower.id, selectedFloor);
      }
      setGameState('in_tower');
      setPlayerBuffs([]);
      setEnemyDebuffs([]);
      if (onTowerStateChange) onTowerStateChange(true);
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Failed to enter tower'); }
    setIsLoading(false);
  };

  const handleLeaveTower = async () => {
    setIsLoading(true);
    try {
      await towerAPI.leave();
      setGameState('tower_select');
      setCombatLog([]);
      setCurrentEnemy(null);
      setStoryText('');
      setChoices([]);
      setRewards(null);
      setPlayerBuffs([]);
      setEnemyDebuffs([]);
      if (onTowerStateChange) onTowerStateChange(false);
      onCharacterUpdate();
    } catch (err) { addLog('error', 'Failed to leave tower'); }
    setIsLoading(false);
  };

  const handleExplore = async () => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.explore();
      
      // Handle lockout
      if (data.lockoutTime) {
        setLockoutTime(data.lockoutTime);
        addLog('info', safeString(data.message));
        setIsLoading(false);
        return;
      }
      
      // Handle event progress
      if (data.eventProgress) {
        setEventProgress(data.eventProgress);
      }
      
      // Handle different event types
      switch (data.eventType) {
        case 'item':
        case 'treasure':
          const itemName = data.item?.name || 'something';
          addLog('success', `Found ${itemName}!`);
          setStoryText(safeString(data.message) || `You found ${itemName}!`);
          setRewards({
            exp: safeNumber(data.exp, 0),
            gold: safeNumber(data.gold, 0),
            items: data.item ? [data.item] : []
          });
          setGameState('victory');
          break;
          
        case 'enemy':
        case 'enemy_group':
        case 'boss':
        case 'elite':
          const enemy = data.enemy || data.enemies?.[0];
          if (enemy) {
            const normalizedEnemy = {
              id: enemy.id || safeString(enemy.name, 'enemy').toLowerCase().replace(/\s+/g, '_'),
              hp: safeNumber(enemy.hp, 50),
              maxHp: safeNumber(enemy.maxHp || enemy.hp, 50),
              atk: safeNumber(enemy.atk || enemy.attack, 10),
              def: safeNumber(enemy.def || enemy.defense, 5),
              name: safeString(enemy.name, 'Unknown Enemy'),
              icon: safeString(enemy.icon, '👹'),
              element: safeString(enemy.element, 'none'),
              isBoss: !!enemy.isBoss,
              isElite: !!enemy.isElite,
              expReward: safeNumber(enemy.expReward || enemy.exp, 20),
              goldReward: safeNumber(enemy.goldReward || enemy.gold, 10)
            };
            setCurrentEnemy(normalizedEnemy);
            addLog('combat', `${normalizedEnemy.name} appears!`);
            setGameState('combat');
          }
          break;
          
        case 'trap':
          setStoryText(safeString(data.message) || 'You took damage!');
          addLog('enemy', safeString(data.message));
          break;
          
        case 'rest':
          setStoryText(safeString(data.message) || 'You feel refreshed!');
          addLog('success', safeString(data.message) || 'Healed!');
          break;
          
        case 'mystery':
        case 'event':
          setStoryText(safeString(data.message) || 'You found something!');
          addLog('success', safeString(data.message) || 'Reward obtained!');
          if (data.exp || data.gold) {
            setRewards({ exp: safeNumber(data.exp, 0), gold: safeNumber(data.gold, 0), items: data.items || [] });
            setGameState('victory');
          }
          break;
          
        case 'continue':
          setStoryText(safeString(data.message) || 'You continue onward...');
          addLog('info', safeString(data.message) || 'Progress made.');
          break;
          
        case 'branch':
          setStoryText(safeString(data.message) || 'You found treasure!');
          if (data.choices && Array.isArray(data.choices)) {
            setChoices(data.choices);
            setScenarioId(data.scenarioId);
            setGameState('choosing_path');
          }
          break;
          
        case 'nothing':
          setStoryText(safeString(data.message) || 'Nothing happens...');
          break;
          
        default:
          setStoryText(safeString(data.message) || 'Something happened...');
      }
      
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Exploration failed'); }
    setIsLoading(false);
  };

  const handleAttack = async () => {
    if (!currentEnemy) return;
    setIsLoading(true);
    try {
      const enemyData = {
        ...currentEnemy,
        id: currentEnemy.id || safeString(currentEnemy.name, 'enemy').toLowerCase().replace(/\s+/g, '_'),
        hp: safeNumber(currentEnemy.hp, 50),
        maxHp: safeNumber(currentEnemy.maxHp || currentEnemy.hp, 50),
        atk: safeNumber(currentEnemy.atk || currentEnemy.attack, 10),
        def: safeNumber(currentEnemy.def || currentEnemy.defense, 5),
        name: safeString(currentEnemy.name, 'Enemy'),
        isBoss: !!currentEnemy.isBoss,
        isElite: !!currentEnemy.isElite,
        expReward: safeNumber(currentEnemy.expReward || currentEnemy.exp, 20),
        goldReward: safeNumber(currentEnemy.goldReward || currentEnemy.gold, 10),
        activeBuffs: enemyDebuffs || []
      };
      const { data } = await towerAPI.attack(enemyData, treasureAfter);
      
      // Process combat log
      if (data.combatLog && Array.isArray(data.combatLog)) {
        data.combatLog.forEach(log => {
          if (log && typeof log === 'object') {
            setCombatLog(prev => [...prev, { 
              type: safeString(log.actor, 'system'), 
              message: safeString(log.message),
              isCritical: !!log.isCritical,
              element: safeString(log.element)
            }]);
          }
        });
      }
      
      // Update buffs from response
      if (data.character?.activeBuffs && Array.isArray(data.character.activeBuffs)) {
        setPlayerBuffs(data.character.activeBuffs);
      }
      if (data.enemy?.activeBuffs && Array.isArray(data.enemy.activeBuffs)) {
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
        id: currentEnemy.id || safeString(currentEnemy.name, 'enemy').toLowerCase().replace(/\s+/g, '_'),
        hp: safeNumber(currentEnemy.hp, 50),
        maxHp: safeNumber(currentEnemy.maxHp || currentEnemy.hp, 50),
        atk: safeNumber(currentEnemy.atk || currentEnemy.attack, 10),
        def: safeNumber(currentEnemy.def || currentEnemy.defense, 5),
        name: safeString(currentEnemy.name, 'Enemy'),
        isBoss: !!currentEnemy.isBoss,
        isElite: !!currentEnemy.isElite,
        expReward: safeNumber(currentEnemy.expReward || currentEnemy.exp, 20),
        goldReward: safeNumber(currentEnemy.goldReward || currentEnemy.gold, 10),
        activeBuffs: enemyDebuffs || []
      };
      const { data } = await towerAPI.useSkill(enemyData, skillId, treasureAfter);
      
      // Process combat log
      if (data.combatLog && Array.isArray(data.combatLog)) {
        data.combatLog.forEach(log => {
          if (log && typeof log === 'object') {
            setCombatLog(prev => [...prev, { 
              type: safeString(log.actor, 'system'), 
              message: safeString(log.message),
              isCritical: !!log.isCritical,
              element: safeString(log.element),
              skillName: safeString(log.skillName)
            }]);
          }
        });
      }
      
      // Update buffs from response
      if (data.character?.activeBuffs && Array.isArray(data.character.activeBuffs)) {
        setPlayerBuffs(data.character.activeBuffs);
      }
      if (data.enemy?.activeBuffs && Array.isArray(data.enemy.activeBuffs)) {
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
      const { data } = await towerAPI.flee(currentEnemy);
      if (data.success) {
        addLog('info', safeString(data.message));
        setCurrentEnemy(null);
        setGameState('in_tower');
        setEnemyDebuffs([]);
      } else {
        setCombatLog(prev => [...prev, { type: 'enemy', message: safeString(data.message) }]);
        handleCombatResult(data);
      }
    } catch (err) { addLog('error', 'Failed to flee'); }
    setIsLoading(false);
  };

  const handleCombatResult = (data) => {
    if (data.victory) {
      setStoryText(safeString(data.message) || 'Victory!');
      setRewards({
        exp: safeNumber(data.exp, 0),
        gold: safeNumber(data.gold, 0),
        items: Array.isArray(data.items) ? data.items : [],
        treasureGold: safeNumber(data.treasureGold, 0)
      });
      setCurrentEnemy(null);
      setTreasureAfter(null);
      setEnemyDebuffs([]);
      setGameState('victory');
    } else if (data.defeat) {
      addLog('error', safeString(data.message) || 'You were defeated...');
      setStoryText(safeString(data.message) || 'You were defeated...');
      setGameState('defeat');
    } else {
      // Combat continues
      if (data.enemy) {
        setCurrentEnemy(prev => ({
          ...prev,
          hp: safeNumber(data.enemy.hp, prev?.hp || 0),
          maxHp: safeNumber(data.enemy.maxHp, prev?.maxHp || 50)
        }));
      }
    }
    onCharacterUpdate();
  };

  const handleUsePotion = async (type) => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.usePotion(type);
      addLog('success', safeString(data.message));
      if (gameState === 'combat') {
        setCombatLog(prev => [...prev, { type: 'player', message: safeString(data.message) }]);
      }
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'No potions'); }
    setIsLoading(false);
  };

  const handleChoosePath = async (choice) => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.choosePath(choice, scenarioId);
      
      setStoryText(safeString(data.message));
      addLog('info', safeString(data.message));
      
      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        setChoices(data.choices);
        setScenarioId(data.scenarioId);
      } else if (data.enemy) {
        const normalizedEnemy = {
          id: data.enemy.id || safeString(data.enemy.name, 'enemy').toLowerCase().replace(/\s+/g, '_'),
          hp: safeNumber(data.enemy.hp, 50),
          maxHp: safeNumber(data.enemy.maxHp || data.enemy.hp, 50),
          atk: safeNumber(data.enemy.atk || data.enemy.attack, 10),
          def: safeNumber(data.enemy.def || data.enemy.defense, 5),
          name: safeString(data.enemy.name, 'Unknown Enemy'),
          icon: safeString(data.enemy.icon, '👹'),
          element: safeString(data.enemy.element, 'none'),
          isBoss: !!data.enemy.isBoss,
          isElite: !!data.enemy.isElite,
          expReward: safeNumber(data.enemy.expReward || data.enemy.exp, 20),
          goldReward: safeNumber(data.enemy.goldReward || data.enemy.gold, 10)
        };
        setCurrentEnemy(normalizedEnemy);
        setTreasureAfter(data.treasureAfter || null);
        setChoices([]);
        setGameState('combat');
      } else if (data.exp || data.gold || (data.items && data.items.length > 0)) {
        setRewards({
          exp: safeNumber(data.exp, 0),
          gold: safeNumber(data.gold, 0),
          items: Array.isArray(data.items) ? data.items : []
        });
        setChoices([]);
        setEventProgress(null);
        setGameState('victory');
      } else {
        setChoices([]);
        setEventProgress(null);
        setGameState('in_tower');
      }
      
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Failed'); }
    setIsLoading(false);
  };

  const handleCheckDoorkeeper = async () => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.getFloorRequirements();
      setFloorRequirements(data);
      setStoryText(safeString(data.message));
      setGameState('doorkeeper');
    } catch (err) { addLog('error', 'Failed to check requirements'); }
    setIsLoading(false);
  };

  const handleAdvance = async () => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.advance();
      addLog('success', safeString(data.message));
      setGameState('in_tower');
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Cannot advance'); }
    setIsLoading(false);
  };

  // Helpers
  const getUnlockedSkills = () => {
    return character?.skills?.filter(s => s.unlocked) || [];
  };

  const getSkillMpCost = (skillId) => {
    return SKILL_DATA[skillId]?.mpCost || 10;
  };

  const getSkillElement = (skillId) => {
    return SKILL_DATA[skillId]?.element || 'none';
  };

  // ============================================================
  // BUFF/DEBUFF DISPLAY COMPONENT
  // ============================================================
  
  const BuffDisplay = ({ buffs, isEnemy = false }) => {
    if (!buffs || !Array.isArray(buffs) || buffs.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1 justify-center mt-1">
        {buffs.map((buff, idx) => {
          if (!buff || typeof buff !== 'object') return null;
          
          // Safely extract values
          const buffName = safeString(buff.name, 'Buff');
          const buffValue = safeNumber(buff.value, 0);
          const buffDuration = safeNumber(buff.duration, 0);
          const buffIcon = safeString(buff.icon, '✨');
          const buffType = safeString(buff.type, '');
          
          // Format value display
          let valueDisplay = '';
          if (buffValue !== 0) {
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
        {(towers || []).map(tower => (
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
            <div className="font-bold text-sm">{safeString(tower.name, 'Tower')}</div>
            <div className="text-xs text-gray-400">Lv.{safeString(tower.levelRange, '?')}</div>
            {!tower.isUnlocked && <div className="text-xs text-red-400">🔒 Locked</div>}
          </button>
        ))}
      </div>
      
      {/* Tower Details */}
      {selectedTower && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
          <h4 className="font-bold text-lg text-purple-300">{safeString(selectedTower.name, 'Tower')}</h4>
          <p className="text-gray-400 text-sm">{safeString(selectedTower.description, 'A mysterious tower awaits...')}</p>
          
          {/* Floor Selection */}
          <div>
            <label className="text-sm text-gray-400">Start Floor:</label>
            <select 
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(Number(e.target.value))}
              className="ml-2 bg-gray-700 rounded px-2 py-1 text-sm"
            >
              {Array.from({ length: character?.highestFloorReached?.floor || 1 }, (_, i) => (
                <option key={i+1} value={i+1}>Floor {i+1}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleEnterTower}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-lg font-bold transition-all"
          >
            {isLoading ? '⏳...' : '⚔️ Enter Tower'}
          </button>
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
          🏰 {safeString(selectedTower?.name, 'Tower')} - Floor {safeNumber(character?.currentFloor, 1)}
        </h3>
        <div className="text-sm text-gray-400">
          HP: {safeNumber(character?.stats?.hp, 0)}/{safeNumber(character?.stats?.maxHp, 0)}
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
          {Array.from({ length: eventProgress.total || 0 }, (_, i) => (
            <div 
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < (eventProgress.current || 0)
                  ? 'bg-green-500' 
                  : i === (eventProgress.current || 0) - 1 
                    ? 'bg-blue-500 ring-2 ring-blue-300' 
                    : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
      
      <div className="bg-gray-900/50 rounded-lg p-4">
        <p className="text-gray-300 whitespace-pre-line">{safeString(storyText, 'A choice awaits...')}</p>
      </div>
      
      <div className="space-y-2">
        {(choices || []).map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleChoosePath(choice)}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left capitalize transition-all hover:translate-x-1"
          >
            {choice === 'left' ? '← ' : choice === 'right' ? '→ ' : 
             choice === 'crown' ? '👑 ' : choice === 'skull' ? '💀 ' : choice === 'sword' ? '🗡️ ' : '• '}
            {safeString(choice, 'Choice').replace(/_/g, ' ')}
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
            <div className="text-4xl mb-1">{safeString(currentEnemy.icon, '👹')}</div>
            <h4 className="font-bold text-lg">{safeString(currentEnemy.name, 'Enemy')}</h4>
            <div className="flex justify-center gap-2 text-sm">
              {currentEnemy.isBoss && <span className="text-red-400">👑 BOSS</span>}
              {currentEnemy.isElite && <span className="text-purple-400">⚔️ ELITE</span>}
              {currentEnemy.element && currentEnemy.element !== 'none' && (
                <span className="text-gray-400">{ELEMENT_ICONS[currentEnemy.element] || ''} {currentEnemy.element}</span>
              )}
            </div>
            
            {/* Enemy HP Bar */}
            <div className="mt-2">
              <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all" 
                  style={{ width: Math.max(0, (safeNumber(currentEnemy.hp, 0) / safeNumber(currentEnemy.maxHp, 1)) * 100) + '%' }}
                />
              </div>
              <span className="text-sm">{Math.max(0, safeNumber(currentEnemy.hp, 0))} / {safeNumber(currentEnemy.maxHp, 0)}</span>
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
          {(combatLog || []).map((log, i) => {
            const message = safeString(log?.message, '');
            const element = safeString(log?.element, '');
            const logType = safeString(log?.type, 'system');
            
            return (
              <p key={i} className={`${
                logType === 'player' ? 'text-green-400' : 
                logType === 'enemy' ? 'text-red-400' : 
                logType === 'system' ? 'text-yellow-400' : 'text-gray-400'
              } ${log?.isCritical ? 'font-bold' : ''}`}>
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
              <span className="text-green-400">{safeNumber(character?.stats?.hp, 0)}/{safeNumber(character?.stats?.maxHp, 0)}</span>
            </div>
            <div>
              <span className="text-gray-400">MP: </span>
              <span className="text-blue-400">{safeNumber(character?.stats?.mp, 0)}/{safeNumber(character?.stats?.maxMp, 0)}</span>
            </div>
          </div>
          
          {/* Player Buffs */}
          {playerBuffs.length > 0 && (
            <div>
              <div className="text-xs text-blue-400 mb-1">Buffs:</div>
              <BuffDisplay buffs={playerBuffs} />
            </div>
          )}
        </div>
        
        {/* Combat Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={handleAttack} disabled={isLoading} className="py-2 bg-red-600 hover:bg-red-500 rounded font-bold">
            ⚔️ Attack
          </button>
          <button onClick={handleFlee} disabled={isLoading} className="py-2 bg-gray-600 hover:bg-gray-500 rounded">
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
                const hasEnoughMp = safeNumber(character?.stats?.mp, 0) >= mpCost;
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
                    title={SKILL_DATA[skill.skillId]?.desc || safeString(skill.name)}
                  >
                    {elementIcon} {safeString(skill.name, 'Skill')} <span className="text-blue-300">({mpCost})</span>
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
      <p className="text-gray-300 whitespace-pre-line">{safeString(storyText, 'Victory!')}</p>
      {rewards && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-bold text-yellow-400 mb-2">Rewards</h4>
          <p>+{safeNumber(rewards.exp, 0)} EXP | +{safeNumber(rewards.gold, 0)} Gold</p>
          {rewards.treasureGold > 0 && <p className="text-yellow-300">💰 +{safeNumber(rewards.treasureGold, 0)} Treasure Gold</p>}
          {rewards.items && Array.isArray(rewards.items) && rewards.items.length > 0 && (
            <div className="mt-2">
              {rewards.items.map((item, i) => (
                <span key={i} className="inline-block bg-gray-700 px-2 py-1 rounded m-1 text-sm">
                  {safeString(item?.icon, '📦')} {safeString(item?.name, 'Item')} {safeNumber(item?.quantity, 1) > 1 && 'x' + safeNumber(item?.quantity, 1)}
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
      <p className="text-gray-400">{safeString(storyText, 'You have been defeated...')}</p>
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
      <p className="text-gray-300 italic">{safeString(storyText, 'The doorkeeper awaits...')}</p>
      {floorRequirements && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="font-bold text-yellow-400 mb-2">Requirements for Floor {safeNumber(floorRequirements.nextFloor, 1)}</h4>
          {floorRequirements.requirements?.items && Array.isArray(floorRequirements.requirements.items) && floorRequirements.requirements.items.map((req, i) => {
            const have = safeNumber(floorRequirements.playerItems?.[req.id], 0);
            return (
              <p key={i} className={have >= safeNumber(req.quantity, 0) ? 'text-green-400' : 'text-red-400'}>
                {safeString(req.name, 'Item')}: {have}/{safeNumber(req.quantity, 0)}
              </p>
            );
          })}
          {safeNumber(floorRequirements.requirements?.gold, 0) > 0 && (
            <p className={safeNumber(floorRequirements.playerGold, 0) >= safeNumber(floorRequirements.requirements.gold, 0) ? 'text-green-400' : 'text-red-400'}>
              Gold: {safeNumber(floorRequirements.playerGold, 0)}/{safeNumber(floorRequirements.requirements.gold, 0)}
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
      <p className="text-gray-300">{safeString(storyText, 'A safe place to rest...')}</p>
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
