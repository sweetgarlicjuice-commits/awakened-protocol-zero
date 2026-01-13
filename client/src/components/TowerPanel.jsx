import React, { useState, useEffect, useRef } from 'react';
import { towerAPI } from '../services/api';

const TowerPanel = ({ character, onCharacterUpdate, addLog }) => {
  const [towers, setTowers] = useState([]);
  const [gameState, setGameState] = useState('tower_select');
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [storyText, setStoryText] = useState('');
  const [choices, setChoices] = useState([]);
  const [combatLog, setCombatLog] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [floorRequirements, setFloorRequirements] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const logRef = useRef(null);

  useEffect(() => { fetchTowers(); }, []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [combatLog, storyText]);

  const fetchTowers = async () => {
    try {
      const { data } = await towerAPI.getInfo();
      setTowers(data.towers);
    } catch (err) { console.error(err); }
  };

  const handleEnterTower = async (towerId) => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.enter(towerId);
      setStoryText(data.story);
      setGameState('in_tower');
      addLog('system', data.message);
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Failed to enter'); }
    setIsLoading(false);
  };

  const handleExplore = async () => {
    setIsLoading(true);
    setCombatLog([]);
    setRewards(null);
    try {
      const { data } = await towerAPI.explore();
      if (data.type === 'safe_zone') {
        setGameState('safe_zone');
        setStoryText(data.story);
        addLog('info', data.message);
      } else {
        setStoryText(data.story + '\n\n' + data.pathDescription);
        setChoices(data.choices);
        setGameState('choosing_path');
      }
      onCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Failed to explore'); }
    setIsLoading(false);
  };

  const handleChoosePath = async (choice) => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.choosePath(choice);
      setStoryText(data.story);
      setCurrentEnemy(data.enemy);
      setCombatLog([{ type: 'system', message: data.story }]);
      setGameState('combat');
      addLog('combat', `${data.enemy.name} appears!`);
    } catch (err) { addLog('error', err.response?.data?.error || 'Error'); }
    setIsLoading(false);
  };

  const handleAttack = async () => {
    if (!currentEnemy) return;
    setIsLoading(true);
    try {
      const { data } = await towerAPI.attack(currentEnemy);
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
      const { data } = await towerAPI.useSkill(currentEnemy, skillId);
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
        setStoryText(`Need: ${err.response.data.missing.need} ${err.response.data.missing.name} (Have: ${err.response.data.missing.have})`);
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
      onCharacterUpdate();
    } catch (err) { addLog('error', 'Failed to leave'); }
    setIsLoading(false);
  };

  const handleVictoryState = (data) => {
    setGameState('victory');
    setRewards(data.rewards);
    setCurrentEnemy(null);
    setStoryText(data.message + '\n\n' + data.restPrompt);
    addLog('success', `Victory! +${data.rewards.exp} EXP, +${data.rewards.gold} Gold`);
    if (data.rewards.scrollDropped) addLog('success', '📜 HIDDEN CLASS SCROLL!');
    if (data.leveledUp) addLog('success', `🎉 LEVEL UP! Lv.${data.character.level}`);
  };

  const handleDefeatState = (data) => {
    setGameState('defeat');
    setCurrentEnemy(null);
    setStoryText(data.message);
    addLog('error', `Defeated! Reset to Floor ${data.resetFloor}`);
  };

  // TOWER SELECT
  if (gameState === 'tower_select') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl text-purple-400 mb-2">⚔️ TOWER SELECT</h2>
          <p className="text-gray-500">Choose your destiny, Hunter</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {towers.map(tower => (
            <div key={tower.id} onClick={() => tower.isUnlocked && handleEnterTower(tower.id)}
              className={`bg-void-800/50 rounded-xl p-6 border-2 transition-all cursor-pointer ${tower.isUnlocked ? 'border-purple-500/30 hover:border-purple-400' : 'border-gray-700/30 opacity-50 cursor-not-allowed'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${tower.id === 1 ? 'bg-red-900/50' : 'bg-blue-900/50'}`}>🗼</div>
                <div>
                  <h3 className="font-display text-lg text-white">{tower.name}</h3>
                  <p className="text-sm text-gray-400">Lv.{tower.levelRange.min}-{tower.levelRange.max}</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-4">{tower.description}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">15 Floors</span>
                {!tower.isUnlocked && <span className="text-red-400">🔒 Clear Tower {tower.id - 1}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // IN TOWER - Ready to explore
  if (gameState === 'in_tower') {
    return (
      <div className="space-y-4">
        <div className="bg-void-800/50 rounded-xl p-6 neon-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-xl text-purple-400">Floor {character.currentFloor}</h3>
            <span className="text-amber-400">⚡ {character.energy}/100</span>
          </div>
          <p className="text-gray-300 mb-6 whitespace-pre-line">{storyText || 'You stand ready to explore...'}</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleExplore} disabled={isLoading || character.energy < 10} className="btn-primary disabled:opacity-50">
              {isLoading ? '...' : '🔍 Explore (-10⚡)'}
            </button>
            <button onClick={handleCheckDoorkeeper} disabled={isLoading} className="btn-secondary">
              ⛩️ Doorkeeper
            </button>
            <button onClick={() => handleUsePotion('hp')} disabled={isLoading} className="btn-secondary text-sm">🧪 HP Potion</button>
            <button onClick={() => handleUsePotion('mp')} disabled={isLoading} className="btn-secondary text-sm">💎 MP Potion</button>
          </div>
          <button onClick={handleLeaveTower} className="w-full mt-4 btn-danger text-sm">🚪 Leave Tower</button>
        </div>
      </div>
    );
  }

  // CHOOSING PATH
  if (gameState === 'choosing_path') {
    return (
      <div className="space-y-4">
        <div className="bg-void-800/50 rounded-xl p-6 neon-border">
          <h3 className="font-display text-xl text-purple-400 mb-4">Floor {character.currentFloor}</h3>
          <p className="text-gray-300 mb-6 whitespace-pre-line">{storyText}</p>
          <div className="grid grid-cols-2 gap-3">
            {choices.map(choice => (
              <button key={choice} onClick={() => handleChoosePath(choice)} disabled={isLoading}
                className="btn-primary capitalize">{choice}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // COMBAT
  if (gameState === 'combat' && currentEnemy) {
    return (
      <div className="space-y-4">
        <div className={`bg-void-800/50 rounded-xl p-4 border-2 ${currentEnemy.isBoss ? 'border-red-500/50' : currentEnemy.isElite ? 'border-purple-500/50' : 'border-gray-700/50'}`}>
          <div className="flex items-center gap-4 mb-3">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${currentEnemy.isBoss ? 'bg-red-900/50 animate-pulse' : 'bg-gray-800'}`}>{currentEnemy.icon}</div>
            <div className="flex-1">
              <h3 className={`font-display ${currentEnemy.isBoss ? 'text-red-400' : currentEnemy.isElite ? 'text-purple-400' : 'text-white'}`}>
                {currentEnemy.isBoss && '👑 '}{currentEnemy.isElite && '⚡ '}{currentEnemy.name}
              </h3>
              <div className="h-3 bg-void-900 rounded-full overflow-hidden mt-2">
                <div className={`h-full ${currentEnemy.isBoss ? 'bg-red-600' : 'bg-red-500'}`} style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }}></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{currentEnemy.hp}/{currentEnemy.maxHp} HP</p>
            </div>
          </div>
        </div>
        <div ref={logRef} className="bg-void-900 rounded-lg p-3 h-32 overflow-auto font-mono text-xs">
          {combatLog.map((log, i) => (
            <div key={i} className={log.type === 'player' ? 'text-green-400' : log.type === 'enemy' ? 'text-red-400' : 'text-purple-400'}>{log.message}</div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleAttack} disabled={isLoading} className="btn-primary py-3">⚔️ Attack</button>
          <button onClick={handleFlee} disabled={isLoading || currentEnemy.isBoss} className="btn-secondary py-3 disabled:opacity-50">🏃 Flee</button>
        </div>
        <div className="bg-void-800/50 rounded-lg p-3">
          <p className="text-gray-400 text-xs mb-2">Skills:</p>
          <div className="grid grid-cols-2 gap-2">
            {character.skills?.filter(s => s.unlocked).map(skill => (
              <button key={skill.skillId} onClick={() => handleUseSkill(skill.skillId)} disabled={isLoading}
                className="bg-void-700 hover:bg-void-600 border border-purple-500/30 rounded p-2 text-sm text-left disabled:opacity-50">
                {skill.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // VICTORY
  if (gameState === 'victory') {
    return (
      <div className="space-y-4">
        <div className="bg-void-800/50 rounded-xl p-6 neon-border text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="font-display text-2xl text-green-400 mb-4">VICTORY!</h2>
          <p className="text-gray-300 mb-4 whitespace-pre-line">{storyText}</p>
          <div className="space-y-2 mb-6">
            <p className="text-amber-400">+{rewards?.exp} EXP</p>
            <p className="text-yellow-400">+{rewards?.gold} Gold</p>
            {rewards?.items?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {rewards.items.map((item, i) => (
                  <span key={i} className="px-2 py-1 bg-void-700 rounded text-sm">{item.icon || '📦'} {item.name} x{item.quantity || 1}</span>
                ))}
              </div>
            )}
            {rewards?.scrollDropped && <p className="text-purple-400 font-bold animate-pulse">📜 HIDDEN CLASS SCROLL!</p>}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => handleUsePotion('hp')} className="btn-secondary text-sm">🧪 Use HP Potion</button>
            <button onClick={() => handleUsePotion('mp')} className="btn-secondary text-sm">💎 Use MP Potion</button>
          </div>
          <button onClick={() => setGameState('in_tower')} className="btn-primary w-full">Continue Exploring</button>
        </div>
      </div>
    );
  }

  // DEFEAT
  if (gameState === 'defeat') {
    return (
      <div className="bg-void-800/50 rounded-xl p-8 neon-border text-center">
        <div className="text-5xl mb-4">💀</div>
        <h2 className="font-display text-2xl text-red-400 mb-4">DEFEATED</h2>
        <p className="text-gray-400 mb-6">{storyText}</p>
        <button onClick={() => { setGameState('tower_select'); fetchTowers(); }} className="btn-secondary">Return to Tower Select</button>
      </div>
    );
  }

  // SAFE ZONE
  if (gameState === 'safe_zone') {
    return (
      <div className="bg-void-800/50 rounded-xl p-6 neon-border text-center">
        <div className="text-5xl mb-4">🏠</div>
        <h2 className="font-display text-2xl text-green-400 mb-4">SAFE ZONE - Floor 10</h2>
        <p className="text-gray-400 mb-6">{storyText}</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button onClick={() => handleUsePotion('hp')} className="btn-secondary">🧪 HP Potion</button>
          <button onClick={() => handleUsePotion('mp')} className="btn-secondary">💎 MP Potion</button>
        </div>
        <button onClick={handleCheckDoorkeeper} className="btn-primary w-full mb-3">⛩️ Proceed to Floor 11</button>
        <button onClick={handleLeaveTower} className="btn-danger w-full text-sm">🚪 Leave Tower (Progress Saved)</button>
      </div>
    );
  }

  // DOORKEEPER
  if (gameState === 'doorkeeper' && floorRequirements) {
    return (
      <div className="bg-void-800/50 rounded-xl p-6 neon-border">
        <h3 className="font-display text-xl text-purple-400 mb-4">⛩️ DOORKEEPER</h3>
        <p className="text-gray-300 mb-4">{storyText}</p>
        <div className="bg-void-900 rounded-lg p-4 mb-4">
          <p className="text-gray-400 mb-2">To advance to Floor {floorRequirements.nextFloor}:</p>
          {floorRequirements.requirements?.items?.map((req, i) => {
            const have = floorRequirements.playerItems[req.id] || 0;
            const enough = have >= req.quantity;
            return (
              <div key={i} className={`flex justify-between ${enough ? 'text-green-400' : 'text-red-400'}`}>
                <span>{req.name}</span>
                <span>{have}/{req.quantity} {enough ? '✓' : '✗'}</span>
              </div>
            );
          })}
          {floorRequirements.requirements?.gold > 0 && (
            <div className={`flex justify-between ${floorRequirements.playerGold >= floorRequirements.requirements.gold ? 'text-green-400' : 'text-red-400'}`}>
              <span>Gold</span>
              <span>{floorRequirements.playerGold}/{floorRequirements.requirements.gold}</span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setGameState('in_tower')} className="btn-secondary">← Back</button>
          <button onClick={handleAdvance} disabled={!floorRequirements.canAdvance || isLoading} className="btn-primary disabled:opacity-50">
            {floorRequirements.canAdvance ? 'Pay & Advance →' : 'Need More Items'}
          </button>
        </div>
      </div>
    );
  }

  // TOWER COMPLETE
  if (gameState === 'tower_complete') {
    return (
      <div className="bg-void-800/50 rounded-xl p-8 neon-border text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="font-display text-2xl text-amber-400 mb-4">TOWER CONQUERED!</h2>
        <p className="text-gray-300 mb-6">{storyText}</p>
        <button onClick={() => { setGameState('tower_select'); fetchTowers(); }} className="btn-primary">Return to Tower Select</button>
      </div>
    );
  }

  return <div>Loading...</div>;
};

export default TowerPanel;
