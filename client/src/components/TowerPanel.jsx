import React, { useState, useEffect, useRef } from 'react';
import { towerAPI } from '../services/api';

const TowerPanel = ({ character, onCharacterUpdate, addLog }) => {
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
    // Don't auto-navigate to floor_select, let user see details first
  };

  const handleEnterTower = async () => {
    if (!selectedTower) return;
    setIsLoading(true);
    try {
      const { data } = await towerAPI.enter(selectedTower.id);
      addLog('system', data.message);
      // Select the floor
      if (selectedFloor > 1) {
        await towerAPI.selectFloor(selectedTower.id, selectedFloor);
      }
      setGameState('in_tower');
      onCharacterUpdate();
    } catch (err) { 
      const error = err.response?.data?.error || 'Failed to enter';
      addLog('error', error);
      // Check for lockout
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

  const handleChoosePath = async (choice) => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.choosePath(choice, scenarioId);
      
      // Handle different outcome types
      switch (data.type) {
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
          break;
          
        case 'damage':
        case 'trap':
          setStoryText(data.message + '\n\n-' + data.damage + ' HP!');
          addLog('error', data.message);
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'heal':
        case 'blessing':
          setStoryText(data.message + '\n\n+' + data.heal + ' HP!');
          addLog('success', data.message);
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'reward':
          setStoryText(data.message + '\n\n+' + data.gold + ' Gold!');
          addLog('success', '+' + data.gold + ' Gold!');
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'treasure':
          setStoryText(data.message);
          if (data.foundChest) addLog('success', '+' + data.gold + ' Gold from chest!');
          else addLog('info', 'The chest was empty...');
          setGameState('in_tower');
          onCharacterUpdate();
          break;
          
        case 'treasure_miss':
          setStoryText(data.message);
          addLog('info', 'No treasure found.');
          setGameState('in_tower');
          break;
          
        case 'exploration':
          // Followup scenario
          setStoryText(data.story);
          setChoices(data.choices);
          setScenarioId(data.scenarioId);
          setGameState('choosing_path');
          break;
          
        case 'safe':
        default:
          setStoryText(data.message || 'You continue onward.');
          addLog('info', data.message || 'Safe passage.');
          setGameState('in_tower');
          break;
      }
    } catch (err) { addLog('error', err.response?.data?.error || 'Error'); }
    setIsLoading(false);
  };

  const handleAttack = async () => {
    if (!currentEnemy) return;
    setIsLoading(true);
    try {
      const { data } = await towerAPI.attack(currentEnemy, treasureAfter);
      data.combatLog.forEach(log => setCombatLog(prev => [...prev, { type: log.actor, message: log.message }]));
      if (data.status === 'victory') handleVictoryState(data);
      else if (data.status === 'defeat') handleDefeatState(data);
      else setCurrentEnemy(data.enemy);
      onCharacterUpdate();
    } catch (err) { addLog('error', 'Attack failed'); }
    setIsLoading(false);
  };

  const handleUseSkill = async (skillId) => {
    if (!currentEnemy) return;
    setIsLoading(true);
    try {
      const { data } = await towerAPI.useSkill(currentEnemy, skillId, treasureAfter);
      data.combatLog.forEach(log => setCombatLog(prev => [...prev, { type: log.actor, message: log.message }]));
      if (data.status === 'victory') handleVictoryState(data);
      else if (data.status === 'defeat') handleDefeatState(data);
      else setCurrentEnemy(data.enemy);
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Skill failed'); }
    setIsLoading(false);
  };

  const handleFlee = async () => {
    if (!currentEnemy) return;
    setIsLoading(true);
    try {
      const { data } = await towerAPI.flee(currentEnemy);
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
    if (data.rewards.treasureGold) msg += '\n\n💰 Found treasure chest! +' + data.rewards.treasureGold + ' Gold!';
    setStoryText(msg);
    addLog('success', 'Victory! +' + data.rewards.exp + ' EXP, +' + data.rewards.gold + ' Gold');
    if (data.rewards.treasureGold) addLog('success', '💰 Treasure: +' + data.rewards.treasureGold + ' Gold');
    if (data.rewards.scrollDropped) addLog('success', '📜 HIDDEN CLASS SCROLL!');
    if (data.leveledUp) addLog('success', '🎉 LEVEL UP! Lv.' + data.character.level);
  };

  const handleDefeatState = (data) => {
    setGameState('defeated');
    setCurrentEnemy(null);
    setTreasureAfter(null);
    setStoryText(data.message);
    addLog('error', 'Defeated! Reset to Floor ' + data.resetFloor);
  };

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
              <div className="text-yellow-400 font-semibold mb-1">💎 Drops</div>
              <div className="text-gray-300 text-xs space-y-1">
                {getTowerDrops(selectedTower.id).map((drop, i) => (
                  <div key={i}>{drop}</div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Drop Rates */}
          <div className="bg-gray-800/50 rounded p-2 text-xs">
            <div className="text-blue-400 font-semibold mb-1">📊 Drop Rates</div>
            <div className="grid grid-cols-3 gap-2 text-gray-300">
              <div>Normal: 15% equip</div>
              <div>Elite: 40% equip</div>
              <div>Boss: 80% equip</div>
            </div>
          </div>
          
          {/* Enter Button */}
          <button
            onClick={() => fetchFloors(selectedTower.id).then(() => setGameState('floor_select'))}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold shadow-lg shadow-blue-500/30"
          >
            ⚔️ Select Floor
          </button>
        </div>
      )}
      
      {/* No tower selected hint */}
      {!selectedTower && (
        <p className="text-gray-500 text-center py-4">Select a tower above to see details</p>
      )}
    </div>
  );
  
  // Tower story data
  const getTowerStory = (towerId) => {
    const stories = {
      1: "The Crimson Spire rises from cursed ground, home to restless undead who guard ancient treasures. Many hunters have entered, few have returned.",
      2: "Deep beneath the waves lies the Azure Depths, where aquatic horrors lurk in the crushing darkness. The pressure alone has driven many mad.",
      3: "The Volcanic Core burns eternally, its magma chambers housing fire elementals and molten beasts. Only the brave dare face its searing heat.",
      4: "Frozen Peak stands eternal, its icy halls home to frost creatures and the dreaded Ice Emperor. The cold seeps into your very soul.",
      5: "The Shadow Realm exists between worlds, where darkness itself hunts the living. Reality bends and nightmares walk freely.",
      6: "Celestial Sanctum floats among the clouds, guarded by beings of pure light. But even angels can fall to corruption.",
      7: "The Abyssal Void consumes all light and hope. Here, void creatures feed on the essence of existence itself.",
      8: "Dragon's Domain echoes with ancient roars. The last dragons make their stand here, and they do not suffer intruders.",
      9: "The Eternal Citadel defies time itself. Its guardians have watched over forbidden knowledge for millennia.",
      10: "The Throne of Gods awaits only the mightiest hunters. Here, divine beings test those who dare challenge their supremacy."
    };
    return stories[towerId] || "A mysterious tower awaits...";
  };
  
  // Tower enemies data
  const getTowerEnemies = (towerId) => {
    const enemies = {
      1: ["Skeleton Warrior", "Zombie", "Ghost", "💀 Boss: Hollow King"],
      2: ["Sea Serpent", "Drowned One", "Coral Golem", "💀 Boss: Leviathan"],
      3: ["Fire Imp", "Magma Golem", "Flame Wraith", "💀 Boss: Molten King"],
      4: ["Frost Wolf", "Ice Elemental", "Yeti", "💀 Boss: Ice Emperor"],
      5: ["Shadow Stalker", "Nightmare", "Void Walker", "💀 Boss: Void Emperor"],
      6: ["Fallen Angel", "Light Golem", "Seraphim", "💀 Boss: Archangel"],
      7: ["Void Spawn", "Abyssal Horror", "Null Beast", "💀 Boss: Void God"],
      8: ["Drake", "Wyvern", "Elder Dragon", "💀 Boss: Ancient Dragon"],
      9: ["Time Keeper", "Eternal Guard", "Chrono Beast", "💀 Boss: Eternal King"],
      10: ["Divine Soldier", "God's Hand", "Celestial", "💀 Boss: God King"]
    };
    return enemies[towerId] || ["Unknown creatures"];
  };
  
  // Tower drops data
  const getTowerDrops = (towerId) => {
    const drops = {
      1: ["Bone Fragment", "Ectoplasm", "Gridz Set (1%/5%/15%)"],
      2: ["Sea Crystal", "Pearl", "Tempest Set (1%/5%/15%)"],
      3: ["Magma Core", "Ash", "Inferno Set (1%/5%/15%)"],
      4: ["Frost Shard", "Ice Crystal", "Glacial Set (1%/5%/15%)"],
      5: ["Shadow Essence", "Void Dust", "Nightmare Set (1%/5%/15%)"],
      6: ["Holy Light", "Angel Feather", "Celestial Set (1%/5%/15%)"],
      7: ["Void Core", "Null Fragment", "Abyssal Set (1%/5%/15%)"],
      8: ["Dragon Scale", "Dragon Fang", "Dragonborn Set (1%/5%/15%)"],
      9: ["Time Crystal", "Eternal Dust", "Eternal Set (1%/5%/15%)"],
      10: ["Divine Essence", "God Fragment", "Divine Set (1%/5%/15%)"]
    };
    return drops[towerId] || ["Unknown drops"];
  };

  // Render floor selection
  const renderFloorSelect = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-blue-400">🏰 {selectedTower?.name}</h3>
        <button onClick={() => setGameState('tower_select')} className="text-gray-400 hover:text-white">← Back</button>
      </div>
      <p className="text-gray-400">Select floor to explore:</p>
      <div className="grid grid-cols-5 gap-2">
        {floors.map(floor => (
          <button
            key={floor.floor}
            onClick={() => handleSelectFloor(floor)}
            className={'p-3 rounded text-center transition ' + 
              (floor.floor === selectedFloor ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-lg shadow-blue-500/50' : 
               floor.unlocked ? (floor.isBoss ? 'bg-red-700 hover:bg-red-600' : 
                                 floor.isSafeZone ? 'bg-green-700 hover:bg-green-600' : 
                                 floor.isEliteZone ? 'bg-purple-700 hover:bg-purple-600' :
                                 'bg-gray-700 hover:bg-gray-600') : 
               'bg-gray-800 opacity-50 cursor-not-allowed')}
          >
            <div className="font-bold">{floor.floor}</div>
            {floor.isBoss && <div className="text-xs">👑</div>}
            {floor.isSafeZone && <div className="text-xs">🏠</div>}
            {floor.isEliteZone && <div className="text-xs">⚔️</div>}
            {!floor.unlocked && <div className="text-xs">🔒</div>}
          </button>
        ))}
      </div>
      <div className="text-sm text-gray-400 mt-2">
        <span className="inline-block w-4 h-4 bg-green-700 mr-1"></span> Safe Zone
        <span className="inline-block w-4 h-4 bg-purple-700 ml-3 mr-1"></span> Elite Zone
        <span className="inline-block w-4 h-4 bg-red-700 ml-3 mr-1"></span> Boss
      </div>
      <button
        onClick={handleEnterTower}
        disabled={isLoading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-lg shadow-lg shadow-blue-500/30"
      >
        ⚔️ Enter Floor {selectedFloor}
      </button>
    </div>
  );

  // Render cursed state
  const renderCursed = () => (
    <div className="text-center space-y-4">
      <div className="text-6xl">💀</div>
      <h3 className="text-2xl font-bold text-red-400">CURSED!</h3>
      <p className="text-gray-300">{storyText}</p>
      <p className="text-yellow-400">Tower lockout: {lockoutTime} minutes remaining</p>
      <button onClick={() => { setGameState('tower_select'); setLockoutTime(null); }} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
        Return to Tower Select
      </button>
    </div>
  );

  // Render in tower state
  const renderInTower = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-blue-400">🏰 {selectedTower?.name || 'Tower'} - Floor {character?.currentFloor}</h3>
        <span className="text-sm text-gray-400">⚡ {character?.energy}/100</span>
      </div>
      {storyText && <p className="text-gray-300 italic whitespace-pre-line">{storyText}</p>}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleExplore} disabled={isLoading || character?.energy < 10} className="py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:opacity-50 rounded-lg font-bold">
          🔍 Explore (-10⚡)
        </button>
        <button onClick={handleCheckDoorkeeper} disabled={isLoading} className="py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold">
          ⛩️ Doorkeeper
        </button>
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

  // Render choosing path
  const renderChoosingPath = () => (
    <div className="space-y-4">
      <p className="text-gray-300 whitespace-pre-line">{storyText}</p>
      <div className="grid gap-2">
        {choices.map((choice, idx) => (
          <button
            key={idx}
            onClick={() => handleChoosePath(choice)}
            disabled={isLoading}
            className="py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left capitalize"
          >
            {choice === 'left' ? '← ' : choice === 'right' ? '→ ' : 
             choice === 'crown' ? '👑 ' : choice === 'skull' ? '💀 ' : choice === 'sword' ? '🗡️ ' : '• '}
            {choice}
          </button>
        ))}
      </div>
    </div>
  );

  // Render combat
  const renderCombat = () => (
    <div className="space-y-4">
      {currentEnemy && (
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-4xl mb-2">{currentEnemy.icon}</div>
          <h4 className="font-bold text-lg">{currentEnemy.name}</h4>
          {currentEnemy.isBoss && <span className="text-red-400 text-sm">👑 BOSS</span>}
          {currentEnemy.isElite && <span className="text-purple-400 text-sm">⚔️ ELITE</span>}
          <div className="mt-2">
            <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
              <div className="bg-red-500 h-full transition-all" style={{ width: Math.max(0, (currentEnemy.hp / currentEnemy.maxHp) * 100) + '%' }}></div>
            </div>
            <span className="text-sm">{Math.max(0, currentEnemy.hp)} / {currentEnemy.maxHp}</span>
          </div>
        </div>
      )}
      <div ref={logRef} className="bg-gray-900 p-3 rounded-lg h-32 overflow-y-auto text-sm">
        {combatLog.map((log, i) => (
          <p key={i} className={log.type === 'player' ? 'text-green-400' : log.type === 'enemy' ? 'text-red-400' : 'text-yellow-400'}>
            {log.message}
          </p>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleAttack} disabled={isLoading} className="py-2 bg-red-600 hover:bg-red-500 rounded font-bold">
          ⚔️ Attack
        </button>
        <button onClick={handleFlee} disabled={isLoading || currentEnemy?.isBoss} className="py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 rounded">
          🏃 Flee
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {character?.skills?.filter(s => s.unlocked).slice(0, 4).map(skill => (
          <button
            key={skill.skillId}
            onClick={() => handleUseSkill(skill.skillId)}
            disabled={isLoading || character.stats.mp < getSkillMpCost(skill.skillId)}
            className="py-2 px-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 rounded text-sm"
          >
            {skill.name} ({getSkillMpCost(skill.skillId)} MP)
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleUsePotion('hp')} className="flex-1 py-1 bg-red-800 hover:bg-red-700 rounded text-sm">❤️ HP</button>
        <button onClick={() => handleUsePotion('mp')} className="flex-1 py-1 bg-blue-800 hover:bg-blue-700 rounded text-sm">💙 MP</button>
      </div>
    </div>
  );

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
          {rewards.items.length > 0 && (
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

  // Main render
  return (
    <div className="bg-gray-800 rounded-lg p-4 neon-border">
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
