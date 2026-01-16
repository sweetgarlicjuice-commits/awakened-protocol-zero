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

  useEffect(() => { if (combatLogRef.current) combatLogRef.current.scrollTop = combatLogRef.current.scrollHeight; }, [combatLog]);

  // ============ TOWER SELECT ============
  if (view === 'select') {
    // Generate floor options (1 to highestFloor)
    const floorOptions = [];
    for (let i = 1; i <= Math.max(highestFloor, 1); i++) {
      floorOptions.push(i);
    }
    
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="font-display text-xl text-purple-400 mb-2">Tower Selection</h2>
          <p className="text-gray-400 text-sm">Tower {character.currentTower} - Highest Floor: {highestFloor}</p>
        </div>
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-white font-semibold">Tower {character.currentTower}</h3><p className="text-gray-400 text-sm">Progress: Floor {highestFloor}/15</p></div>
            <div className="text-right"><p className="text-amber-400">⚡ {character.energy}/100</p><p className="text-gray-500 text-xs">5 energy per node</p></div>
          </div>
          <div className="h-2 bg-void-900 rounded-full mb-4"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${(highestFloor / 15) * 100}%` }}></div></div>
          
          {/* Floor Selection */}
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Select Floor:</label>
            <div className="flex gap-2">
              <select 
                value={selectedFloor} 
                onChange={(e) => setSelectedFloor(parseInt(e.target.value))}
                className="flex-1 bg-void-900 border border-purple-500/30 rounded-lg px-3 py-2 text-white focus:border-purple-500 outline-none"
              >
                {floorOptions.map(f => (
                  <option key={f} value={f}>Floor {f} {f === highestFloor ? '(Highest)' : ''}</option>
                ))}
              </select>
            </div>
            <p className="text-gray-500 text-xs mt-1">You can replay any floor you've reached</p>
          </div>
          
          <button onClick={() => loadFloorMap(selectedFloor)} disabled={isLoading || character.energy < 5 || character.stats.hp <= 0} className="w-full btn-primary py-3 disabled:opacity-50">
            {isLoading ? 'Loading...' : character.stats.hp <= 0 ? 'Need to heal first' : `⚔️ Enter Floor ${selectedFloor}`}
          </button>
        </div>
        <div className="bg-void-800/30 p-3 rounded-lg text-sm text-gray-400">
          <p>💡 Clear the <span className="text-yellow-400">🚩 exit node</span> to unlock next floor</p>
          <p className="mt-1">👹 Boss every 5 floors (5, 10, 15)</p>
        </div>
      </div>
    );
  }

  // ============ NODE MAP ============
  if (view === 'map' && floorMap) {
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    const accessibleNodes = currentNode?.connections || [];
    
    // Group nodes by row
    const rows = {};
    floorMap.nodes.forEach(node => { if (!rows[node.row]) rows[node.row] = []; rows[node.row].push(node); });
    const sortedRows = Object.keys(rows).sort((a, b) => b - a).map(k => rows[k]);
    
    // Find max row (exit row)
    const maxRow = Math.max(...floorMap.nodes.map(n => n.row));
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><h2 className="font-display text-lg text-purple-400">{tower?.name}</h2><p className="text-gray-400 text-sm">Floor {character.currentFloor}</p></div>
          <button onClick={leaveTower} className="btn-secondary text-xs px-3 py-1">🚪 Leave</button>
        </div>
        <div className="bg-void-800/50 rounded-xl p-4 neon-border overflow-x-auto">
          <div className="min-w-[280px] space-y-3">
            {sortedRows.map((row, ri) => (
              <div key={ri} className="flex justify-center gap-3">
                {row.map(node => {
                  const isCurrent = node.id === floorMap.currentNodeId;
                  const isAccessible = accessibleNodes.includes(node.id);
                  const canMove = isAccessible && !node.cleared && !isCurrent && currentNode?.cleared;
                  const isExitNode = node.row === maxRow; // Top row = exit
                  
                  return (
                    <button key={node.id} onClick={() => canMove && moveToNode(node.id)} disabled={!canMove || isLoading}
                      className={`w-14 h-14 rounded-lg flex flex-col items-center justify-center transition-all relative
                        ${isCurrent ? 'ring-2 ring-yellow-400 scale-110' : ''} ${node.cleared ? 'opacity-50' : ''}
                        ${canMove ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
                        ${node.visited ? NODE_COLORS[node.type] : 'bg-gray-700'}
                        ${isAccessible && !node.cleared && currentNode?.cleared ? 'ring-1 ring-white/30' : ''}
                        ${isExitNode && !node.cleared ? 'ring-2 ring-yellow-500' : ''}`}>
                      <span className="text-xl">{node.visited ? NODE_ICONS[node.type] : '?'}</span>
                      {node.cleared && <span className="text-xs">✓</span>}
                      {isExitNode && !node.cleared && <span className="absolute -top-2 -right-2 text-sm bg-yellow-500 rounded-full w-5 h-5 flex items-center justify-center">🚩</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-700/50 text-center text-xs text-gray-500">
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
