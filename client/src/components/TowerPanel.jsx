import React, { useState, useEffect, useRef } from 'react';
import { towerAPI } from '../services/api';

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
  const [eventProgress, setEventProgress] = useState(null); // Track multi-event progress
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
      onCharacterUpdate();
    } catch (err) { 
      const error = err.response?.data?.error || 'Failed to explore';
      addLog('error', error);
      if (error.includes('cursed')) {
        setGameState('tower_select');
      }
    }
    setIsLoading(false);
  };

  // Handle next event in multi-event exploration
  const handleNextEvent = (nextEvent, progress) => {
    setStoryText(nextEvent.story);
    setChoices(nextEvent.choices);
    setScenarioId(nextEvent.scenarioId);
    setEventProgress(progress);
    setGameState('choosing_path');
  };

  const handleChoosePath = async (choice) => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.choosePath(choice, scenarioId);
      
      // Handle different outcome types - including _continue types for multi-event
      const type = data.type;
      
      // Check if this is a "continue" type with next event
      if (type.endsWith('_continue') && data.nextEvent) {
        // Show result message briefly, then transition to next event
        const resultMsg = data.message;
        addLog('info', resultMsg);
        
        // Update HP/MP display
        onCharacterUpdate();
        
        // Move to next event
        handleNextEvent(data.nextEvent, data.eventProgress);
        setIsLoading(false);
        return;
      }
      
      // Handle standard outcome types
      switch (type) {
        case 'combat_start':
          setStoryText(data.story);
          setCurrentEnemy(data.enemy);
          setTreasureAfter(data.treasureAfter || null);
          setCombatLog([{ type: 'system', message: data.story }]);
          setGameState('combat');
          addLog('combat', data.enemy.name + ' appears!');
          break;
          
        case 'curse_lockout':
          setStoryText(data.message);
          setGameState('cursed');
          setLockoutTime(data.lockoutMinutes);
          addLog('error', data.message);
          if (onTowerStateChange) onTowerStateChange(false);
          break;
          
        case 'damage':
        case 'trap':
        case 'poison':
          setStoryText(data.message + '\n\n⚠️ -' + data.damage + ' HP!');
          addLog('error', '-' + data.damage + ' HP!');
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'heal':
        case 'blessing':
        case 'major_heal':
        case 'nature_blessing':
          let healMsg = data.message + '\n\n💚 +' + data.heal + ' HP!';
          if (data.mpRestore) healMsg += '\n💙 +' + data.mpRestore + ' MP!';
          setStoryText(healMsg);
          addLog('success', '+' + data.heal + ' HP!' + (data.mpRestore ? ' +' + data.mpRestore + ' MP!' : ''));
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'buff':
        case 'buff_reward':
          setStoryText(data.message + '\n\n✨ Gained ' + (data.buffType || 'buff') + '!');
          addLog('success', 'Buff gained: ' + (data.buffType || 'unknown'));
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'material':
        case 'material_reward':
          setStoryText(data.message + '\n\n📦 +' + (data.quantity || 1) + ' ' + (data.material?.name || 'material') + '!');
          addLog('success', 'Found: ' + (data.material?.name || 'materials'));
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'item':
        case 'item_reward':
        case 'artifact_find':
          setStoryText(data.message + '\n\n📦 Received ' + (data.item || 'item') + '!');
          addLog('success', 'Received: ' + (data.item || 'item'));
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'lore':
        case 'lore_reward':
        case 'spell_knowledge':
          setStoryText(data.message + '\n\n📚 +' + (data.exp || 0) + ' EXP!');
          addLog('success', '+' + (data.exp || 0) + ' EXP from knowledge!');
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'treasure':
        case 'treasure_room':
        case 'secret_room':
          let treasureMsg = data.message;
          if (data.gold) treasureMsg += '\n\n💰 +' + data.gold + ' gold!';
          if (data.heal) treasureMsg += '\n💚 +' + data.heal + ' HP!';
          setStoryText(treasureMsg);
          if (data.foundChest || data.gold) addLog('success', '+' + (data.gold || 0) + ' Gold!');
          setGameState('in_tower');
          onCharacterUpdate();
          break;
        
        case 'spirit_trade':
          setStoryText(data.message + '\n\n💰 +' + (data.gold || 25) + ' gold!');
          addLog('success', 'Spirit trade: +' + (data.gold || 25) + ' gold');
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'ally':
        case 'ally_reward':
        case 'companion_buff':
          setStoryText(data.message + '\n\n🐾 Temporary ally gained!');
          addLog('success', 'Gained temporary ally!');
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'exploration':
          // Followup scenario
          setStoryText(data.story);
          setChoices(data.choices);
          setScenarioId(data.scenarioId);
          setEventProgress(data.eventProgress || null);
          setGameState('choosing_path');
          break;
          
        case 'safe':
        case 'safe_progress':
        case 'safe_retreat':
        default:
          let safeMsg = data.message || 'You continue onward.';
          if (data.heal) safeMsg += '\n\n💚 +' + data.heal + ' HP!';
          setStoryText(safeMsg);
          addLog('info', data.message || 'Safe passage.');
          setGameState('in_tower');
          onCharacterUpdate();
          break;
      }
    } catch (err) { 
      console.error('Choose path error:', err);
      addLog('error', err.response?.data?.error || 'Error processing choice'); 
    }
    setIsLoading(false);
  };

  const handleAttack = async () => {
    if (!currentEnemy) return;
    setIsLoading(true);
    try {
      // Ensure we're passing the enemy with all required fields
      // Server expects: hp, maxHp, atk, def, name, id, expReward, goldReward
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
        goldReward: currentEnemy.goldReward || currentEnemy.gold || 10
      };
      
      const { data } = await towerAPI.attack(enemyData, treasureAfter);
      
      if (data.combatLog) {
        data.combatLog.forEach(log => setCombatLog(prev => [...prev, { type: log.actor, message: log.message }]));
      }
      
      if (data.status === 'victory') handleVictoryState(data);
      else if (data.status === 'defeat') handleDefeatState(data);
      else {
        setCurrentEnemy({
          ...currentEnemy,
          ...data.enemy,
          hp: data.enemy.hp
        });
      }
      onCharacterUpdate();
    } catch (err) { 
      console.error('Attack error:', err);
      addLog('error', err.response?.data?.error || 'Attack failed'); 
    }
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
        goldReward: currentEnemy.goldReward || currentEnemy.gold || 10
      };
      
      const { data } = await towerAPI.useSkill(enemyData, skillId, treasureAfter);
      
      if (data.combatLog) {
        data.combatLog.forEach(log => setCombatLog(prev => [...prev, { type: log.actor, message: log.message }]));
      }
      
      if (data.status === 'victory') handleVictoryState(data);
      else if (data.status === 'defeat') handleDefeatState(data);
      else {
        setCurrentEnemy({
          ...currentEnemy,
          ...data.enemy,
          hp: data.enemy.hp
        });
      }
      onCharacterUpdate();
    } catch (err) { 
      console.error('Skill error:', err);
      addLog('error', err.response?.data?.error || 'Skill failed'); 
    }
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
      if (data.success) {
        setGameState('in_tower');
        setCurrentEnemy(null);
        setTreasureAfter(null);
        addLog('info', data.message);
      } else {
        setCombatLog(prev => [...prev, { type: 'enemy', message: data.message }]);
        if (data.status === 'defeat') handleDefeatState(data);
      }
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Flee failed'); }
    setIsLoading(false);
  };

  const handleUsePotion = async (type) => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.usePotion(type);
      addLog('success', data.message);
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'No potions'); }
    setIsLoading(false);
  };

  const handleCheckDoorkeeper = async () => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.getFloorRequirements();
      setFloorRequirements(data);
      setStoryText(data.doorkeeper);
      setGameState('doorkeeper');
    } catch (err) { addLog('error', 'Failed to check requirements'); }
    setIsLoading(false);
  };

  const handleAdvance = async () => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.advance();
      addLog('system', data.message);
      if (data.status === 'tower_complete') {
        setGameState('tower_complete');
        setStoryText(data.message);
      } else {
        setGameState('in_tower');
        setFloorRequirements(null);
      }
      onCharacterUpdate();
      fetchTowers();
    } catch (err) { 
      addLog('error', err.response?.data?.error || 'Cannot advance');
      if (err.response?.data?.missing) {
        setStoryText('Need: ' + err.response.data.missing.need + ' ' + err.response.data.missing.name + ' (Have: ' + err.response.data.missing.have + ')');
      }
    }
    setIsLoading(false);
  };

  const handleLeaveTower = async () => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.leave();
      addLog('info', data.message);
      setGameState('tower_select');
      setSelectedTower(null);
      if (onTowerStateChange) onTowerStateChange(false);
      onCharacterUpdate();
    } catch (err) { addLog('error', 'Failed to leave'); }
    setIsLoading(false);
  };

  const handleVictoryState = (data) => {
    setGameState('victory');
    setRewards(data.rewards);
    setCurrentEnemy(null);
    setTreasureAfter(null);
    let msg = data.message + '\n\n' + data.restPrompt;
    if (data.rewards?.treasureGold) msg += '\n\n💰 Found treasure chest! +' + data.rewards.treasureGold + ' Gold!';
    setStoryText(msg);
    addLog('success', 'Victory! +' + data.rewards.exp + ' EXP, +' + data.rewards.gold + ' Gold');
    if (data.rewards?.treasureGold) addLog('success', '💰 Treasure: +' + data.rewards.treasureGold + ' Gold');
    if (data.rewards?.scrollDropped) addLog('success', '📜 HIDDEN CLASS SCROLL!');
    if (data.leveledUp) addLog('success', '🎉 LEVEL UP! Lv.' + data.character.level);
  };

  const handleDefeatState = (data) => {
    setGameState('defeated');
    setCurrentEnemy(null);
    setTreasureAfter(null);
    setStoryText(data.message);
    addLog('error', 'Defeated! Reset to Floor ' + data.resetFloor);
    if (onTowerStateChange) onTowerStateChange(false);
  };

  // Skill MP costs lookup
  const getSkillMpCost = (skillId) => {
    const costs = {
      slash: 5, heavyStrike: 12, shieldBash: 8, warCry: 15,
      backstab: 8, poisonBlade: 10, smokeScreen: 12, steal: 5,
      preciseShot: 6, multiShot: 14, eagleEye: 10, arrowRain: 20,
      fireball: 10, iceSpear: 12, manaShield: 15, thunderbolt: 18,
      flame_slash: 15, inferno_strike: 25, fire_aura: 20, volcanic_rage: 40,
      shadow_strike: 12, vanish: 20, death_mark: 18, shadow_dance: 35,
      lightning_arrow: 14, chain_lightning: 22, storm_eye: 18, thunderstorm: 45,
      frost_bolt: 12, blizzard: 28, ice_armor: 20, absolute_zero: 50
    };
    return costs[skillId] || 10;
  };

  // Get unlocked skills for combat
  const getUnlockedSkills = () => {
    if (!character?.skills) return [];
    return character.skills.filter(s => s.unlocked);
  };

  // Tower story info helper
  const getTowerStory = (towerId) => {
    const stories = {
      1: 'The Crimson Spire rises from cursed grounds, its halls haunted by the restless dead.',
      2: 'Azure Depths hide ancient aquatic horrors beneath its flooded chambers.',
      3: 'The Volcanic Core burns with eternal flame, home to fire elementals and molten beasts.',
      4: 'Frozen Peak stands silent and deadly, where ice claims all who enter unprepared.',
      5: 'The Shadow Realm exists between worlds, filled with nightmares made manifest.',
      6: 'Celestial Sanctum gleams with divine light, but its guardians show no mercy.',
      7: 'The Abyssal Void consumes all hope, where void creatures hunger endlessly.',
      8: 'Dragon\'s Domain echoes with ancient power, ruled by the last of dragonkind.',
      9: 'The Eternal Citadel defies time itself, its defenders immortal and unending.',
      10: 'Throne of Gods awaits at the peak, where divinity and mortality collide.'
    };
    return stories[towerId] || 'A mysterious tower awaits...';
  };

  const getTowerEnemies = (towerId) => {
    const enemies = {
      1: ['Skeleton Warrior', 'Ghoul', 'Wraith'],
      2: ['Sea Serpent', 'Drowned One', 'Coral Golem'],
      3: ['Fire Imp', 'Magma Elemental', 'Flame Hound'],
      4: ['Ice Wraith', 'Frost Giant', 'Snow Stalker'],
      5: ['Shadow Fiend', 'Nightmare', 'Void Walker'],
      6: ['Celestial Guardian', 'Light Bearer', 'Divine Sentinel'],
      7: ['Void Spawn', 'Abyssal Horror', 'Null Entity'],
      8: ['Drake', 'Wyrm', 'Dragon Kin'],
      9: ['Eternal Knight', 'Time Keeper', 'Immortal Guard'],
      10: ['Divine Champion', 'God\'s Hand', 'Celestial Arbiter']
    };
    return enemies[towerId] || ['Unknown Enemy'];
  };

  const getTowerDrops = (towerId) => {
    const drops = {
      1: ['Bone Fragment', 'Tattered Cloth', 'Cursed Essence'],
      2: ['Pearl Shard', 'Sea Crystal', 'Aqua Core'],
      3: ['Ember Stone', 'Magma Heart', 'Fire Essence'],
      4: ['Frost Crystal', 'Ice Core', 'Frozen Tear'],
      5: ['Shadow Fragment', 'Nightmare Essence', 'Void Shard'],
      6: ['Divine Fragment', 'Light Crystal', 'Celestial Dust'],
      7: ['Void Core', 'Abyssal Fragment', 'Null Essence'],
      8: ['Dragon Scale', 'Dragon Claw', 'Dragon Heart'],
      9: ['Eternal Shard', 'Time Crystal', 'Immortal Essence'],
      10: ['Divine Core', 'God Fragment', 'Celestial Heart']
    };
    return drops[towerId] || ['Unknown Material'];
  };

  // Render tower selection with compact [1-10] buttons
  const renderTowerSelect = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-400">🏰 Select Tower</h3>
      
      {/* Compact Tower Buttons [1-10] */}
      <div className="flex flex-wrap gap-2">
        {towers.map(tower => {
          const towerNum = tower.id;
          const isSelected = selectedTower?.id === tower.id;
          const hasProgress = tower.highestFloor > 1;
          
          return (
            <button
              key={tower.id}
              onClick={() => handleSelectTower(tower)}
              disabled={!tower.isUnlocked}
              className={`w-10 h-10 rounded-lg font-bold text-sm relative transition-all ${
                isSelected 
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-lg shadow-blue-500/50' 
                  : tower.isUnlocked 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
              title={tower.name}
            >
              {!tower.isUnlocked && <span className="absolute -top-1 -right-1 text-xs">🔒</span>}
              {tower.isUnlocked && hasProgress && <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></span>}
              {towerNum}
            </button>
          );
        })}
      </div>
      
      {/* Selected Tower Details */}
      {selectedTower && (
        <div className="bg-gray-700/50 rounded-lg p-4 space-y-3 border border-gray-600">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-lg text-blue-400">{selectedTower.name}</h4>
              <p className="text-sm text-gray-400">Level {selectedTower.levelRange.min}-{selectedTower.levelRange.max}</p>
            </div>
            {selectedTower.highestFloor > 1 && (
              <span className="text-green-400 text-sm bg-green-900/30 px-2 py-1 rounded">
                Floor {selectedTower.highestFloor}/15
              </span>
            )}
          </div>
          
          {/* Tower Story */}
          <div className="text-sm text-gray-300 italic border-l-2 border-purple-500 pl-3">
            {getTowerStory(selectedTower.id)}
          </div>
          
          {/* Tower Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Enemies */}
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-red-400 font-semibold mb-1">👹 Enemies</div>
              <div className="text-gray-300 text-xs space-y-1">
                {getTowerEnemies(selectedTower.id).map((enemy, i) => (
                  <div key={i}>{enemy}</div>
                ))}
              </div>
            </div>
            
            {/* Drops */}
            <div className="bg-gray-800/50 rounded p-2">
              <div className="text-yellow-400 font-semibold mb-1">📦 Drops</div>
              <div className="text-gray-300 text-xs space-y-1">
                {getTowerDrops(selectedTower.id).map((drop, i) => (
                  <div key={i}>{drop}</div>
                ))}
              </div>
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
          
          {/* Enter Button */}
          <button
            onClick={handleEnterTower}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold transition-all shadow-lg shadow-purple-500/30"
          >
            {isLoading ? '⏳ Entering...' : `⚡ Enter Tower (-10 Energy)`}
          </button>
        </div>
      )}
      
      {/* Lockout Warning */}
      {lockoutTime && (
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center">
          <span className="text-red-400">🔒 Tower Lockout: {lockoutTime} minutes remaining</span>
        </div>
      )}
    </div>
  );

  // Render in tower state
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

  // Render choosing path with event progress
  const renderChoosingPath = () => (
    <div className="space-y-4">
      {/* Event Progress Indicator */}
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

  // Render combat with skills
  const renderCombat = () => {
    const unlockedSkills = getUnlockedSkills();
    
    return (
      <div className="space-y-4">
        {/* Enemy Display */}
        {currentEnemy && (
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-4xl mb-2">{currentEnemy.icon || '👹'}</div>
            <h4 className="font-bold text-lg">{currentEnemy.name}</h4>
            {currentEnemy.isBoss && <span className="text-red-400 text-sm">👑 BOSS</span>}
            {currentEnemy.isElite && <span className="text-purple-400 text-sm">⚔️ ELITE</span>}
            <div className="mt-2">
              <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-red-500 h-full transition-all" 
                  style={{ width: Math.max(0, (currentEnemy.hp / currentEnemy.maxHp) * 100) + '%' }}
                />
              </div>
              <span className="text-sm">{Math.max(0, currentEnemy.hp)} / {currentEnemy.maxHp}</span>
            </div>
          </div>
        )}
        
        {/* Combat Log */}
        <div ref={logRef} className="bg-gray-900 p-3 rounded-lg h-32 overflow-y-auto text-sm">
          {combatLog.map((log, i) => (
            <p key={i} className={
              log.type === 'player' ? 'text-green-400' : 
              log.type === 'enemy' ? 'text-red-400' : 'text-yellow-400'
            }>
              {log.message}
            </p>
          ))}
        </div>
        
        {/* Player Stats */}
        <div className="grid grid-cols-2 gap-2 text-sm bg-gray-800/50 p-2 rounded">
          <div>
            <span className="text-gray-400">HP: </span>
            <span className="text-green-400">{character?.stats?.hp || 0}/{character?.stats?.maxHp || 0}</span>
          </div>
          <div>
            <span className="text-gray-400">MP: </span>
            <span className="text-blue-400">{character?.stats?.mp || 0}/{character?.stats?.maxMp || 0}</span>
          </div>
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
                const hasEnoughMp = (character?.stats?.mp || 0) >= mpCost;
                
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
                    title={hasEnoughMp ? `Use ${skill.name}` : `Not enough MP (need ${mpCost})`}
                  >
                    {skill.name} ({mpCost} MP)
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* No Skills Warning */}
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

  // Render victory
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

  // Render doorkeeper
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
        <button onClick={() => setGameState('in_tower')} className="py-2 bg-gray-700 hover:bg-gray-600 rounded">
          ← Back
        </button>
      </div>
    </div>
  );

  // Render safe zone
  const renderSafeZone = () => (
    <div className="space-y-4 text-center">
      <div className="text-4xl">🏠</div>
      <h3 className="text-xl font-bold text-green-400">Safe Zone - Floor 10</h3>
      <p className="text-gray-300">{storyText}</p>
      <p className="text-gray-400">Your progress is saved here.</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleCheckDoorkeeper} className="py-2 bg-purple-600 hover:bg-purple-500 rounded">⛩️ Doorkeeper</button>
        <button onClick={handleLeaveTower} className="py-2 bg-gray-700 hover:bg-gray-600 rounded">🚪 Leave</button>
      </div>
    </div>
  );

  // Render defeated
  const renderDefeated = () => (
    <div className="space-y-4 text-center">
      <div className="text-4xl">💀</div>
      <h3 className="text-xl font-bold text-red-400">Defeated!</h3>
      <p className="text-gray-300">{storyText}</p>
      <button onClick={() => { setGameState('tower_select'); onCharacterUpdate(); }} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
        Return
      </button>
    </div>
  );

  // Render tower complete
  const renderTowerComplete = () => (
    <div className="space-y-4 text-center">
      <div className="text-4xl">🏆</div>
      <h3 className="text-xl font-bold text-blue-400">Tower Conquered!</h3>
      <p className="text-gray-300">{storyText}</p>
      <button onClick={() => { setGameState('tower_select'); fetchTowers(); }} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold shadow-lg shadow-blue-500/30">
        Continue
      </button>
    </div>
  );

  // Render cursed
  const renderCursed = () => (
    <div className="space-y-4 text-center">
      <div className="text-4xl">🔮</div>
      <h3 className="text-xl font-bold text-purple-400">Cursed!</h3>
      <p className="text-gray-300">{storyText}</p>
      <p className="text-red-400">Tower lockout: {lockoutTime} minutes</p>
      <button onClick={() => { setGameState('tower_select'); setLockoutTime(null); }} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
        Return
      </button>
    </div>
  );

  // Render floor select (if needed)
  const renderFloorSelect = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-blue-400">Select Floor</h3>
      <div className="grid grid-cols-5 gap-2">
        {floors.map(floor => (
          <button
            key={floor.floor}
            onClick={() => handleSelectFloor(floor)}
            disabled={!floor.unlocked}
            className={`py-2 rounded text-sm ${
              floor.floor === selectedFloor
                ? 'bg-blue-600'
                : floor.unlocked
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-800 opacity-50'
            }`}
          >
            {floor.floor}
          </button>
        ))}
      </div>
      <button onClick={handleEnterTower} className="w-full py-2 bg-green-600 hover:bg-green-500 rounded font-bold">
        Enter Floor {selectedFloor}
      </button>
    </div>
  );

  // Main render
  return (
    <div className="bg-void-800/50 rounded-xl p-6 neon-border">
      {gameState === 'tower_select' && renderTowerSelect()}
      {gameState === 'floor_select' && renderFloorSelect()}
      {gameState === 'in_tower' && renderInTower()}
      {gameState === 'choosing_path' && renderChoosingPath()}
      {gameState === 'combat' && renderCombat()}
      {gameState === 'victory' && renderVictory()}
      {gameState === 'doorkeeper' && renderDoorkeeper()}
      {gameState === 'safe_zone' && renderSafeZone()}
      {gameState === 'defeated' && renderDefeated()}
      {gameState === 'tower_complete' && renderTowerComplete()}
      {gameState === 'cursed' && renderCursed()}
    </div>
  );
};

export default TowerPanel;
