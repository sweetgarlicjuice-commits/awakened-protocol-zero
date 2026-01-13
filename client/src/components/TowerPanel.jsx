import React, { useState, useEffect, useRef } from 'react';
import { towerAPI } from '../services/api';

const TowerPanel = ({ character, onCharacterUpdate, addLog }) => {
  const [towers, setTowers] = useState([]);
  const [selectedTower, setSelectedTower] = useState(null);
  const [gameState, setGameState] = useState('idle'); // idle, exploring, combat, victory, defeat, safe_zone
  const [currentEnemy, setCurrentEnemy] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const combatLogRef = useRef(null);

  useEffect(() => {
    fetchTowers();
  }, []);

  useEffect(() => {
    if (combatLogRef.current) {
      combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight;
    }
  }, [combatLog]);

  const fetchTowers = async () => {
    try {
      const { data } = await towerAPI.getInfo();
      setTowers(data.towers);
      // Auto-select current tower
      const currentTower = data.towers.find(t => t.id === character.currentTower);
      if (currentTower) {
        setSelectedTower(currentTower);
      }
    } catch (err) {
      console.error('Failed to fetch towers:', err);
    }
  };

  const handleEnterTower = async (tower) => {
    setIsLoading(true);
    try {
      const { data } = await towerAPI.enter(tower.id);
      setSelectedTower(tower);
      addLog('system', data.message);
      setGameState('idle');
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to enter tower');
    }
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
        addLog('info', data.message);
      } else {
        setCurrentEnemy(data.enemy);
        setGameState('combat');
        setCombatLog([{ type: 'system', message: data.message }]);
        addLog('combat', data.message);
      }
      
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to explore');
    }
    setIsLoading(false);
  };

  const handleAttack = async () => {
    if (!currentEnemy) return;
    setIsLoading(true);
    
    try {
      const { data } = await towerAPI.attack(currentEnemy);
      
      // Add combat log entries
      data.combatLog.forEach(log => {
        setCombatLog(prev => [...prev, { type: log.actor, message: log.message }]);
      });
      
      if (data.status === 'victory') {
        setGameState('victory');
        setRewards(data.rewards);
        setCurrentEnemy(null);
        addLog('success', `Victory! +${data.rewards.exp} EXP, +${data.rewards.gold} Gold`);
        if (data.rewards.scrollDropped) {
          addLog('success', '📜 HIDDEN CLASS SCROLL DROPPED!');
        }
        if (data.leveledUp) {
          addLog('success', `🎉 LEVEL UP! Now level ${data.character.level}!`);
        }
      } else if (data.status === 'defeat') {
        setGameState('defeat');
        setCurrentEnemy(null);
        addLog('error', 'You have been defeated!');
      } else {
        setCurrentEnemy(data.enemy);
      }
      
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Attack failed');
    }
    setIsLoading(false);
  };

  const handleUseSkill = async (skillId) => {
    if (!currentEnemy) return;
    setIsLoading(true);
    
    try {
      const { data } = await towerAPI.useSkill(currentEnemy, skillId);
      
      data.combatLog.forEach(log => {
        setCombatLog(prev => [...prev, { type: log.actor, message: log.message }]);
      });
      
      if (data.status === 'victory') {
        setGameState('victory');
        setRewards(data.rewards);
        setCurrentEnemy(null);
        addLog('success', `Victory! +${data.rewards.exp} EXP, +${data.rewards.gold} Gold`);
        if (data.rewards.scrollDropped) {
          addLog('success', '📜 HIDDEN CLASS SCROLL DROPPED!');
        }
      } else if (data.status === 'defeat') {
        setGameState('defeat');
        setCurrentEnemy(null);
        addLog('error', 'You have been defeated!');
      } else {
        setCurrentEnemy(data.enemy);
      }
      
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Skill failed');
    }
    setIsLoading(false);
  };

  const handleFlee = async () => {
    if (!currentEnemy) return;
    setIsLoading(true);
    
    try {
      const { data } = await towerAPI.flee(currentEnemy);
      
      if (data.success) {
        setGameState('idle');
        setCurrentEnemy(null);
        setCombatLog([]);
        addLog('info', data.message);
      } else {
        setCombatLog(prev => [...prev, { type: 'enemy', message: data.message }]);
        if (data.status === 'defeat') {
          setGameState('defeat');
          setCurrentEnemy(null);
          addLog('error', 'You have been defeated!');
        }
      }
      
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Flee failed');
    }
    setIsLoading(false);
  };

  const handleAdvance = async () => {
    setIsLoading(true);
    
    try {
      const { data } = await towerAPI.advance();
      
      addLog('system', data.message);
      setGameState('idle');
      setCombatLog([]);
      setRewards(null);
      
      if (data.status === 'tower_complete') {
        addLog('success', '🏆 Tower Completed!');
        fetchTowers();
      }
      
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to advance');
    }
    setIsLoading(false);
  };

  const getFloorInfo = () => {
    const floor = character.currentFloor;
    if (floor === 10) return { type: 'safe', label: '🏠 Safe Zone', color: 'text-green-400' };
    if (floor === 15) return { type: 'boss', label: '👑 Boss Room', color: 'text-red-400' };
    if (floor >= 13) return { type: 'elite', label: '⚡ Elite Zone', color: 'text-purple-400' };
    return { type: 'normal', label: `Floor ${floor}`, color: 'text-gray-400' };
  };

  // Tower Selection View
  if (!selectedTower || gameState === 'idle' && !currentEnemy) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl text-purple-400 mb-2">TOWER SELECT</h2>
          <p className="text-gray-500">Choose a tower to explore</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {towers.map(tower => (
            <div
              key={tower.id}
              className={`bg-void-800/50 rounded-xl p-6 border-2 transition-all ${
                tower.isUnlocked
                  ? 'border-purple-500/30 hover:border-purple-400 cursor-pointer'
                  : 'border-gray-700/30 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => tower.isUnlocked && handleEnterTower(tower)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-3xl ${
                  tower.id === 1 ? 'bg-red-900/50' : 'bg-blue-900/50'
                }`}>
                  🗼
                </div>
                <div>
                  <h3 className="font-display text-lg text-white">{tower.name}</h3>
                  <p className="text-sm text-gray-400">Lv. {tower.levelRange.min}-{tower.levelRange.max}</p>
                </div>
              </div>
              
              <p className="text-gray-500 text-sm mb-4">{tower.description}</p>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Floors: {tower.floors}</span>
                {!tower.isUnlocked && (
                  <span className="text-red-400">🔒 Clear Tower {tower.id - 1}</span>
                )}
                {tower.isUnlocked && character.currentTower === tower.id && (
                  <span className="text-purple-400">Current: F{character.currentFloor}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedTower && (
          <div className="bg-void-800/50 rounded-xl p-6 neon-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-xl text-white">{selectedTower.name}</h3>
                <p className={getFloorInfo().color}>{getFloorInfo().label}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400">Energy: {character.energy}/100</p>
                <p className="text-xs text-gray-500">-25 per exploration</p>
              </div>
            </div>

            <button
              onClick={handleExplore}
              disabled={isLoading || character.energy < 25 || character.stats.hp <= 0}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Exploring...' : character.stats.hp <= 0 ? '💀 Rest to Recover' : '⚔️ EXPLORE FLOOR'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Combat View
  if (gameState === 'combat' && currentEnemy) {
    return (
      <div className="space-y-4">
        {/* Enemy Display */}
        <div className={`bg-void-800/50 rounded-xl p-6 border-2 ${
          currentEnemy.isBoss ? 'border-red-500/50' : currentEnemy.isElite ? 'border-purple-500/50' : 'border-gray-700/50'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-lg flex items-center justify-center text-4xl ${
                currentEnemy.isBoss ? 'bg-red-900/50 animate-pulse' : currentEnemy.isElite ? 'bg-purple-900/50' : 'bg-gray-800'
              }`}>
                {currentEnemy.icon}
              </div>
              <div>
                <h3 className={`font-display text-xl ${
                  currentEnemy.isBoss ? 'text-red-400' : currentEnemy.isElite ? 'text-purple-400' : 'text-white'
                }`}>
                  {currentEnemy.isBoss && '👑 '}{currentEnemy.isElite && '⚡ '}{currentEnemy.name}
                </h3>
                <p className="text-sm text-gray-400">ATK: {currentEnemy.atk} | DEF: {currentEnemy.def}</p>
              </div>
            </div>
          </div>
          
          {/* Enemy HP Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">HP</span>
              <span className="text-red-400">{currentEnemy.hp} / {currentEnemy.maxHp}</span>
            </div>
            <div className="h-4 bg-void-900 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  currentEnemy.isBoss ? 'bg-red-600' : currentEnemy.isElite ? 'bg-purple-600' : 'bg-red-500'
                }`}
                style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Combat Log */}
        <div 
          ref={combatLogRef}
          className="bg-void-900 rounded-lg p-4 h-40 overflow-auto font-mono text-sm"
        >
          {combatLog.map((log, index) => (
            <div 
              key={index}
              className={`${
                log.type === 'player' ? 'text-green-400' :
                log.type === 'enemy' ? 'text-red-400' :
                'text-purple-400'
              }`}
            >
              {log.message}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAttack}
            disabled={isLoading}
            className="btn-primary py-4"
          >
            ⚔️ ATTACK
          </button>
          
          <button
            onClick={handleFlee}
            disabled={isLoading || currentEnemy.isBoss}
            className="btn-secondary py-4 disabled:opacity-50"
          >
            🏃 FLEE
          </button>
        </div>

        {/* Skills */}
        <div className="bg-void-800/50 rounded-xl p-4">
          <h4 className="text-gray-400 text-sm mb-3">SKILLS</h4>
          <div className="grid grid-cols-2 gap-2">
            {character.skills?.filter(s => s.unlocked).map(skill => (
              <button
                key={skill.skillId}
                onClick={() => handleUseSkill(skill.skillId)}
                disabled={isLoading}
                className="bg-void-700 hover:bg-void-600 border border-purple-500/30 rounded-lg p-3 text-left transition-colors disabled:opacity-50"
              >
                <div className="text-white text-sm">{skill.name}</div>
                <div className="text-xs text-blue-400">Lv.{skill.level}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Victory View
  if (gameState === 'victory' && rewards) {
    return (
      <div className="space-y-6">
        <div className="bg-void-800/50 rounded-xl p-8 neon-border text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display text-3xl text-green-400 mb-2">VICTORY!</h2>
          
          <div className="space-y-2 mb-6">
            <p className="text-amber-400 text-xl">+{rewards.exp} EXP</p>
            <p className="text-yellow-400 text-xl">+{rewards.gold} Gold</p>
            
            {rewards.items?.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 mb-2">Items Dropped:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {rewards.items.map((item, index) => (
                    <span 
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        item.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                        item.rarity === 'uncommon' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {item.icon || '📦'} {item.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {rewards.scrollDropped && (
              <div className="mt-4 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg animate-pulse">
                <p className="text-purple-400 text-lg font-bold">📜 HIDDEN CLASS SCROLL OBTAINED!</p>
              </div>
            )}
            
            {rewards.memoryCrystal && (
              <p className="text-cyan-400">💎 Memory Crystal +1</p>
            )}
          </div>
          
          <button
            onClick={handleAdvance}
            disabled={isLoading}
            className="btn-primary px-8"
          >
            Continue to Next Floor →
          </button>
        </div>
      </div>
    );
  }

  // Defeat View
  if (gameState === 'defeat') {
    return (
      <div className="space-y-6">
        <div className="bg-void-800/50 rounded-xl p-8 neon-border text-center">
          <div className="text-6xl mb-4">💀</div>
          <h2 className="font-display text-3xl text-red-400 mb-2">DEFEATED</h2>
          <p className="text-gray-400 mb-6">You have fallen in battle...</p>
          
          <button
            onClick={() => {
              setGameState('idle');
              setCombatLog([]);
              setRewards(null);
            }}
            className="btn-secondary px-8"
          >
            Return to Tower
          </button>
        </div>
      </div>
    );
  }

  // Safe Zone View
  if (gameState === 'safe_zone') {
    return (
      <div className="space-y-6">
        <div className="bg-void-800/50 rounded-xl p-8 neon-border text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="font-display text-3xl text-green-400 mb-2">SAFE ZONE</h2>
          <p className="text-gray-400 mb-6">Floor 10 - A place to rest and recover</p>
          
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
            <button
              onClick={handleAdvance}
              disabled={isLoading}
              className="btn-primary"
            >
              Continue to Floor 11 →
            </button>
            
            <button
              onClick={() => {
                setGameState('idle');
                setSelectedTower(null);
              }}
              className="btn-secondary"
            >
              Leave Tower
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TowerPanel;
