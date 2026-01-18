import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const NODE_ICONS = { start: '🚪', combat: '⚔️', elite: '💀', boss: '👹', treasure: '💰', rest: '🏕️', mystery: '❓', merchant: '🛒', shrine: '📜' };
const NODE_COLORS = { start: 'bg-green-600', combat: 'bg-red-600', elite: 'bg-purple-600', boss: 'bg-red-800', treasure: 'bg-yellow-600', rest: 'bg-blue-600', mystery: 'bg-indigo-600', merchant: 'bg-emerald-600', shrine: 'bg-cyan-600' };
const BUFF_ICONS = { attack: '⚔️', critRate: '🎯', evasion: '💨', shield: '🛡️', defend: '🛡️' };

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(config => { const token = localStorage.getItem('apz_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });

const TowerPanel = ({ character, onCharacterUpdate, updateLocalCharacter, addLog, onTowerStateChange }) => {
  const [view, setView] = useState('select');
  const [floorMap, setFloorMap] = useState(null);
  const [tower, setTower] = useState(null);
  const [combat, setCombat] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [message, setMessage] = useState(null);
  const [playerBuffs, setPlayerBuffs] = useState([]);
  const [playerSkills, setPlayerSkills] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(character.currentFloor || 1);
  const [highestFloor, setHighestFloor] = useState(1);
  const combatLogRef = useRef(null);

  // Get highest floor on mount
  useEffect(() => {
    const towerKey = `tower_${character.currentTower || 1}`;
    const highest = character.towerProgress?.[towerKey] || character.currentFloor || 1;
    setHighestFloor(highest);
    setSelectedFloor(character.currentFloor || 1);
  }, [character]);

  const loadFloorMap = async (floor = selectedFloor) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/exploration/map?towerId=${character.currentTower}&floor=${floor}`);
      setFloorMap(data.map);
      setTower(data.tower);
      if (data.highestFloor) setHighestFloor(data.highestFloor);
      setView('map');
      onTowerStateChange?.(true);
      addLog?.('info', `Entered ${data.tower.name} Floor ${data.floor}`);
    } catch (err) { addLog?.('error', err.response?.data?.error || err.message); }
    setIsLoading(false);
  };

  const moveToNode = async (nodeId) => {
    if (character.energy < 5) { addLog?.('error', 'Not enough energy!'); return; }
    setIsLoading(true);
    try {
      const { data } = await api.post('/exploration/move', { nodeId });
      setFloorMap(prev => ({ ...prev, currentNodeId: nodeId, nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, visited: true } : n) }));
      updateLocalCharacter?.({ energy: data.energy });
      addLog?.('info', `Moved to ${NODE_ICONS[data.nodeType]} ${data.nodeType} node`);
      if (['combat', 'elite', 'boss'].includes(data.nodeType)) await startCombat();
      else if (['treasure', 'rest', 'shrine'].includes(data.nodeType)) await handleInteraction();
      else if (data.nodeType === 'mystery') { setEventData(data.node); setView('event'); }
    } catch (err) { addLog?.('error', err.response?.data?.error || err.message); }
    setIsLoading(false);
  };

  const startCombat = async () => {
    try {
      const { data } = await api.post('/exploration/combat/start');
      setCombat(data.combat);
      setCombatLog(data.combat.combatLog || []);
      setPlayerSkills(data.character.skills || []);
      setPlayerBuffs([]);
      setSelectedTarget(0);
      setView('combat');
    } catch (err) { addLog?.('error', err.response?.data?.error || err.message); }
  };

  const doCombatAction = async (action, skillId = null) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/exploration/combat/action', { action, skillId, targetIndex: selectedTarget });
      
      if (data.status === 'victory') {
        setCombatLog(data.combatLog);
        setMessage({ type: 'success', text: `Victory! +${data.rewards.exp} EXP, +${data.rewards.gold} Gold` });
        addLog?.('success', `Victory! +${data.rewards.exp} EXP, +${data.rewards.gold} Gold`);
        setFloorMap(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === prev.currentNodeId ? { ...n, cleared: true } : n) }));
        
        // PHASE 9.5 FIX: Update local character with EXP, gold, level, HP/MP for real-time UI
        updateLocalCharacter?.({ 
          stats: { 
            ...character.stats, 
            hp: data.character.hp, 
            mp: data.character.mp,
            maxHp: data.character.maxHp,
            maxMp: data.character.maxMp
          },
          gold: data.character.gold,
          level: data.character.level,
          experience: data.character.experience,
          experienceToNextLevel: data.character.experienceToNextLevel
        });
        
        if (data.floorComplete) {
          const newFloor = (character.currentFloor || 1) + 1;
          setHighestFloor(prev => Math.max(prev, newFloor));
          setSelectedFloor(newFloor);
          addLog?.('success', `Floor cleared! Floor ${newFloor} unlocked!`);
          setTimeout(() => { setView('select'); setCombat(null); setMessage(null); setPlayerBuffs([]); onCharacterUpdate?.(); }, 2500);
        } else {
          setTimeout(() => { setView('map'); setCombat(null); setMessage(null); setPlayerBuffs([]); onCharacterUpdate?.(); }, 1500);
        }
        if (data.leveledUp) addLog?.('success', `Level up! Now level ${data.character.level}`);
      } else if (data.status === 'defeat') {
        setCombatLog(data.combatLog);
        setMessage({ type: 'error', text: 'Defeated! Returning to town...' });
        setTimeout(() => { setView('select'); setCombat(null); setMessage(null); setPlayerBuffs([]); onTowerStateChange?.(false); onCharacterUpdate?.(); }, 2000);
      } else {
        setCombat(data.combat);
        setCombatLog(data.combat.combatLog);
        setPlayerBuffs(data.playerBuffs || []);
        updateLocalCharacter?.({ stats: { ...character.stats, hp: data.character.hp, mp: data.character.mp } });
      }
    } catch (err) { addLog?.('error', err.response?.data?.error || err.message); }
    setIsLoading(false);
  };

  const handleInteraction = async (choice = null) => {
    setIsLoading(true);
    try {
      const { data } = await api.post('/exploration/interact', { choice });
      setMessage({ type: 'success', text: data.message });
      addLog?.('success', data.message);
      setFloorMap(prev => ({ ...prev, nodes: prev.nodes.map(n => n.id === prev.currentNodeId ? { ...n, cleared: true } : n) }));
      updateLocalCharacter?.({ stats: { ...character.stats, hp: data.character.hp, mp: data.character.mp }, gold: data.character.gold });
      
      // Check if floor was completed (exit node cleared)
      if (data.floorComplete) {
        const newFloor = (character.currentFloor || 1) + 1;
        setHighestFloor(prev => Math.max(prev, newFloor));
        setSelectedFloor(newFloor);
        addLog?.('success', `Floor ${newFloor} unlocked!`);
        setTimeout(() => { setView('select'); setEventData(null); setMessage(null); onCharacterUpdate?.(); }, 2000);
      } else {
        setTimeout(() => { setView('map'); setEventData(null); setMessage(null); }, 1500);
      }
    } catch (err) { addLog?.('error', err.response?.data?.error || err.message); }
    setIsLoading(false);
  };

  const leaveTower = async () => {
    try {
      await api.post('/exploration/leave');
      setView('select'); setFloorMap(null); setCombat(null); setMessage(null); setPlayerBuffs([]);
      onTowerStateChange?.(false);
      addLog?.('info', 'Left the tower');
      onCharacterUpdate?.();
    } catch (err) { addLog?.('error', err.response?.data?.error || err.message); }
  };

  // ============ SELECT FLOOR ============
  if (view === 'select') {
    const maxFloor = 15;
    const floors = Array.from({ length: maxFloor }, (_, i) => i + 1);
    
    return (
      <div className="space-y-4">
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h2 className="font-display text-lg text-purple-400 mb-2">🏰 Tower Selection</h2>
          <p className="text-gray-400 text-sm mb-4">
            Current: Tower {character.currentTower || 1} | Highest Floor: {highestFloor}
          </p>
          
          <div className="mb-4">
            <label className="text-gray-400 text-sm block mb-2">Select Floor:</label>
            <div className="grid grid-cols-5 gap-2">
              {floors.map(floor => {
                const isUnlocked = floor <= highestFloor;
                const isCurrent = floor === selectedFloor;
                return (
                  <button
                    key={floor}
                    onClick={() => isUnlocked && setSelectedFloor(floor)}
                    disabled={!isUnlocked}
                    className={`p-2 rounded-lg text-center transition-all ${
                      isCurrent 
                        ? 'bg-purple-600 text-white ring-2 ring-purple-400' 
                        : isUnlocked 
                          ? 'bg-void-800 hover:bg-void-700 text-gray-300' 
                          : 'bg-void-900/50 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-lg font-bold">{floor}</div>
                    <div className="text-[10px]">{floor === 15 ? '👹 Boss' : floor >= 13 ? '💀 Elite' : '⚔️'}</div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <button
            onClick={() => loadFloorMap(selectedFloor)}
            disabled={isLoading || character.energy < 5}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : character.energy < 5 ? 'Not enough energy!' : `⚔️ Enter Floor ${selectedFloor}`}
          </button>
          
          <p className="text-gray-500 text-xs text-center mt-2">Costs 5 energy per node</p>
        </div>
      </div>
    );
  }

  // ============ MAP VIEW ============
  if (view === 'map' && floorMap) {
    const nodes = floorMap.nodes || [];
    const currentNode = nodes.find(n => n.id === floorMap.currentNodeId);
    const connectedIds = currentNode?.connections || [];
    
    // Group nodes by row for display
    const maxRow = Math.max(...nodes.map(n => n.row || 0));
    const rows = [];
    for (let r = 0; r <= maxRow; r++) {
      rows.push(nodes.filter(n => n.row === r));
    }
    
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between bg-void-800/50 rounded-lg p-3">
          <div>
            <h2 className="font-display text-purple-400">{tower?.name || 'Tower'}</h2>
            <p className="text-gray-500 text-xs">Floor {floorMap.floor}</p>
          </div>
          <button onClick={leaveTower} className="text-red-400 hover:text-red-300 text-sm">🚪 Leave</button>
        </div>
        
        {/* Map Grid */}
        <div className="bg-void-800/30 rounded-xl p-4 overflow-x-auto">
          <div className="flex flex-col-reverse gap-2 min-w-fit">
            {rows.map((rowNodes, rowIdx) => (
              <div key={rowIdx} className="flex justify-center gap-2">
                {rowNodes.map(node => {
                  const isCurrent = node.id === floorMap.currentNodeId;
                  const isConnected = connectedIds.includes(node.id);
                  const canMove = isConnected && !node.visited && !isCurrent;
                  
                  return (
                    <button
                      key={node.id}
                      onClick={() => canMove && moveToNode(node.id)}
                      disabled={!canMove && !isCurrent}
                      className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs transition-all relative
                        ${isCurrent ? 'ring-2 ring-yellow-400 bg-yellow-600/30' : ''}
                        ${node.cleared ? 'opacity-50' : ''}
                        ${canMove ? 'hover:scale-110 cursor-pointer' : ''}
                        ${NODE_COLORS[node.type] || 'bg-gray-600'}
                      `}
                    >
                      <span className="text-lg">{NODE_ICONS[node.type]}</span>
                      {node.row === maxRow && <span className="absolute -top-1 -right-1 text-xs">🚩</span>}
                      {node.cleared && <span className="absolute bottom-0 right-0 text-[8px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-4 mt-3 text-xs text-gray-500">
            <span className="text-yellow-400">⭕ = You</span>
            <span className="text-yellow-400">🚩 = Exit (clear to advance)</span>
          </div>
        </div>
        {currentNode && (
          <div className="bg-void-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{NODE_ICONS[currentNode.type]}</span>
              <div>
                <p className="text-white font-medium capitalize">
                  {currentNode.type} Node
                  {currentNode.row === maxRow && <span className="text-yellow-400 text-xs ml-2">🚩 EXIT</span>}
                </p>
                <p className="text-gray-400 text-xs">{currentNode.cleared ? 'Cleared ✓' : 'Not cleared'}</p>
              </div>
            </div>
            {!currentNode.cleared && ['combat', 'elite', 'boss'].includes(currentNode.type) && <button onClick={startCombat} className="w-full btn-primary py-2 mt-2">⚔️ Start Combat</button>}
            {!currentNode.cleared && ['treasure', 'rest', 'shrine'].includes(currentNode.type) && <button onClick={() => handleInteraction()} className="w-full btn-secondary py-2 mt-2">{NODE_ICONS[currentNode.type]} Interact</button>}
            {!currentNode.cleared && currentNode.type === 'mystery' && <button onClick={() => { setEventData(currentNode); setView('event'); }} className="w-full btn-secondary py-2 mt-2">❓ Investigate</button>}
          </div>
        )}
        {message && <div className={`p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>{message.text}</div>}
      </div>
    );
  }

  // ============ COMBAT ============
  if (view === 'combat' && combat) {
    const aliveEnemies = combat.enemies.filter(e => e.hp > 0);
    
    return (
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between bg-void-800/50 rounded-lg p-2">
          <div><p className="text-purple-400 font-semibold text-sm">Wave {combat.wave}</p><p className="text-gray-400 text-xs">Turn {combat.turnCount}</p></div>
          <div className="text-right text-xs"><p className="text-green-400">HP: {character.stats.hp}/{character.stats.maxHp}</p><p className="text-blue-400">MP: {character.stats.mp}/{character.stats.maxMp}</p></div>
        </div>
        
        {/* Active Buffs */}
        {playerBuffs.length > 0 && (
          <div className="bg-blue-900/30 rounded-lg p-2 flex flex-wrap gap-2">
            <span className="text-xs text-blue-300">Active:</span>
            {playerBuffs.map((b, i) => <span key={i} className="bg-blue-600/50 px-2 py-0.5 rounded text-xs text-white">{BUFF_ICONS[b.type]} {b.type} +{b.value}% ({b.duration}t)</span>)}
          </div>
        )}
        
        {/* Enemies */}
        <div className="bg-void-800/50 rounded-xl p-3 neon-border">
          <h3 className="text-gray-400 text-xs mb-2">ENEMIES ({aliveEnemies.length} alive)</h3>
          <div className="space-y-2">
            {combat.enemies.map((enemy, idx) => (
              <button key={enemy.instanceId || idx} onClick={() => enemy.hp > 0 && setSelectedTarget(idx)} disabled={enemy.hp <= 0}
                className={`w-full p-2 rounded-lg flex items-center gap-3 transition-all
                  ${selectedTarget === idx && enemy.hp > 0 ? 'bg-red-600/30 ring-1 ring-red-500' : 'bg-void-900/50'}
                  ${enemy.hp <= 0 ? 'opacity-40' : 'hover:bg-void-900'}`}>
                <span className="text-2xl">{enemy.icon || '👹'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{enemy.name || 'Enemy'}</p>
                  <div className="h-2 bg-void-900 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${enemy.hp <= 0 ? 'bg-gray-600' : enemy.hp / enemy.maxHp > 0.5 ? 'bg-green-500' : enemy.hp / enemy.maxHp > 0.25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}></div>
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-16 text-right">{Math.max(0, enemy.hp)}/{enemy.maxHp}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Combat Log */}
        <div className="bg-void-800/30 rounded-lg p-2 h-20 overflow-hidden">
          <div ref={combatLogRef} className="h-full overflow-y-auto text-xs space-y-1">
            {combatLog.map((log, i) => (
              <p key={i} className={`${log.type === 'crit' ? 'text-yellow-400 font-bold' : log.type === 'skill' ? 'text-purple-400' : log.type === 'enemy' ? 'text-red-400' : log.type === 'victory' ? 'text-green-400 font-bold' : log.type === 'defeat' ? 'text-red-400 font-bold' : log.type === 'buff' ? 'text-blue-400' : log.type === 'miss' ? 'text-gray-500 italic' : 'text-gray-400'}`}>
                {log.message}
              </p>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        {aliveEnemies.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => doCombatAction('attack')} disabled={isLoading} className="btn-primary py-2 text-sm disabled:opacity-50">⚔️ Attack</button>
              <button onClick={() => doCombatAction('defend')} disabled={isLoading} className="btn-secondary py-2 text-sm disabled:opacity-50">🛡️ Defend</button>
              <button onClick={leaveTower} disabled={isLoading} className="btn-secondary py-2 text-sm text-red-400 disabled:opacity-50">💨 Flee</button>
            </div>
            
            {/* Skills */}
            <div className="bg-void-800/30 rounded-lg p-2">
              <p className="text-gray-400 text-xs mb-2">SKILLS</p>
              <div className="grid grid-cols-2 gap-2">
                {playerSkills.map((skill, i) => (
                  <button key={i} onClick={() => doCombatAction('skill', skill.skillId)} disabled={isLoading || character.stats.mp < skill.mpCost}
                    className={`p-2 rounded text-left text-xs transition-colors disabled:opacity-50
                      ${skill.damageType === 'buff' ? 'bg-blue-900/50 hover:bg-blue-900 border border-blue-500/30' : 
                        skill.target === 'all' ? 'bg-purple-900/50 hover:bg-purple-900' : 'bg-void-900/50 hover:bg-void-900'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium">{skill.name}</span>
                      <span className="text-blue-400">{skill.mpCost}MP</span>
                    </div>
                    <p className="text-gray-400">{skill.desc}</p>
                    <p className={`font-medium ${skill.damageType === 'magical' ? 'text-cyan-400' : skill.damageType === 'buff' ? 'text-blue-400' : 'text-orange-400'}`}>
                      {skill.dmgText}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {message && <div className={`p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'}`}>{message.text}</div>}
      </div>
    );
  }

  // ============ EVENT ============
  if (view === 'event' && eventData) {
    return (
      <div className="space-y-4">
        <div className="bg-void-800/50 rounded-xl p-4 neon-border text-center">
          <span className="text-4xl mb-3 block">{NODE_ICONS[eventData.type]}</span>
          <h3 className="text-white font-semibold mb-2 capitalize">{eventData.type}</h3>
          {eventData.scenario && (
            <>
              <p className="text-gray-300 text-sm mb-4">{eventData.scenario.description}</p>
              <div className="flex gap-2 justify-center">
                {eventData.scenario.choices.map(c => <button key={c} onClick={() => handleInteraction(c)} disabled={isLoading} className="btn-primary px-4 py-2 capitalize disabled:opacity-50">{c}</button>)}
              </div>
            </>
          )}
        </div>
        <button onClick={() => { setView('map'); setEventData(null); }} className="w-full btn-secondary py-2">← Back</button>
      </div>
    );
  }

  return <div className="flex items-center justify-center h-64"><p className="text-gray-400">Loading...</p></div>;
};

export default TowerPanel;
