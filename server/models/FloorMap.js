import mongoose from 'mongoose';

// ============================================================
// FLOOR MAP MODEL - Node-based exploration system
// ============================================================

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['start', 'combat', 'elite', 'boss', 'treasure', 'rest', 'mystery', 'merchant', 'shrine'],
    required: true 
  },
  row: { type: Number, required: true }, // 0 = start, higher = closer to boss
  col: { type: Number, required: true }, // Position in row
  connections: [String], // Node IDs this connects to
  visited: { type: Boolean, default: false },
  cleared: { type: Boolean, default: false },
  isExit: { type: Boolean, default: false }, // Exit nodes advance floor when cleared
  // Combat node data
  enemies: [{
    id: String,
    name: String,
    icon: String,
    hp: Number,
    maxHp: Number,
    atk: Number,
    def: Number,
    expReward: Number,
    goldReward: { min: Number, max: Number },
    isElite: Boolean,
    isBoss: Boolean
  }],
  waves: { type: Number, default: 1 },
  currentWave: { type: Number, default: 0 },
  // Reward data (for treasure/mystery nodes)
  rewards: {
    gold: Number,
    exp: Number,
    items: [{
      itemId: String,
      name: String,
      icon: String,
      type: String,
      rarity: String,
      quantity: Number
    }],
    healPercent: Number,
    buffType: String
  },
  // Mystery node data
  scenario: {
    id: String,
    description: String,
    choices: [String],
    resolved: Boolean
  }
});

const floorMapSchema = new mongoose.Schema({
  characterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
  towerId: { type: Number, required: true },
  floor: { type: Number, required: true },
  nodes: [nodeSchema],
  currentNodeId: { type: String, default: null },
  startNodeId: { type: String },
  bossNodeId: { type: String },
  completed: { type: Boolean, default: false },
  // Combat state (persisted between turns)
  activeCombat: {
    nodeId: String,
    wave: Number,
    enemies: [{
      id: String,
      name: String,
      icon: String,
      hp: Number,
      maxHp: Number,
      atk: Number,
      def: Number,
      expReward: Number,
      goldReward: { min: Number, max: Number },
      isElite: Boolean,
      isBoss: Boolean,
      buffs: [{ type: String, duration: Number, value: Number }],
      debuffs: [{ type: String, duration: Number, value: Number }]
    }],
    turnCount: Number,
    combatLog: [{ actor: String, message: String, damage: Number, type: String }],
    playerBuffs: [{ type: String, duration: Number, value: Number }]
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // 24h expiry
});

// Index for fast lookup
floorMapSchema.index({ characterId: 1, towerId: 1, floor: 1 });
floorMapSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// ============================================================
// STATIC: Generate a new floor map
// ============================================================
floorMapSchema.statics.generateFloorMap = function(characterId, towerId, floor, towerData, enemyData) {
  const nodes = [];
  const isBossFloor = floor % 5 === 0; // Boss every 5 floors
  const isEliteFloor = floor % 3 === 0 && !isBossFloor; // Elite every 3 floors (not boss)
  
  // Determine map size based on floor
  const rows = isBossFloor ? 5 : (floor <= 5 ? 4 : 5);
  const nodesPerRow = [1, 2, 3, 2, 1]; // Diamond shape
  
  let nodeId = 0;
  const nodeGrid = [];
  
  // Generate nodes row by row
  for (let row = 0; row < rows; row++) {
    const rowNodes = [];
    const colCount = nodesPerRow[Math.min(row, nodesPerRow.length - 1)];
    
    for (let col = 0; col < colCount; col++) {
      const id = `node_${nodeId++}`;
      let type = 'combat';
      
      // Determine node type
      if (row === 0) {
        type = 'start';
      } else if (row === rows - 1) {
        type = isBossFloor ? 'boss' : 'combat';
      } else {
        // Random type for middle nodes
        const roll = Math.random();
        if (isEliteFloor && row === rows - 2 && col === Math.floor(colCount / 2)) {
          type = 'elite';
        } else if (roll < 0.50) {
          type = 'combat';
        } else if (roll < 0.65) {
          type = 'treasure';
        } else if (roll < 0.75) {
          type = 'rest';
        } else if (roll < 0.85) {
          type = 'mystery';
        } else if (roll < 0.92) {
          type = 'merchant';
        } else {
          type = 'shrine';
        }
      }
      
      const node = {
        id,
        type,
        row,
        col,
        connections: [],
        visited: row === 0, // Start node is visited
        cleared: row === 0, // Start node is cleared
        isExit: row === rows - 1, // Last row nodes are exit nodes
        enemies: [],
        waves: 1
      };
      
      // Generate enemies for combat nodes
      if (['combat', 'elite', 'boss'].includes(type)) {
        node.enemies = generateEnemies(type, towerId, floor, enemyData);
        node.waves = type === 'boss' ? 1 : (type === 'elite' ? 1 : Math.min(1 + Math.floor(floor / 5), 3));
      }
      
      // Generate rewards for treasure nodes
      if (type === 'treasure') {
        node.rewards = generateTreasureRewards(towerId, floor);
      }
      
      // Generate scenario for mystery nodes
      if (type === 'mystery') {
        node.scenario = generateMysteryScenario();
      }
      
      rowNodes.push(node);
      nodes.push(node);
    }
    nodeGrid.push(rowNodes);
  }
  
  // Connect nodes (each node connects to 1-2 nodes in next row)
  for (let row = 0; row < rows - 1; row++) {
    const currentRow = nodeGrid[row];
    const nextRow = nodeGrid[row + 1];
    
    currentRow.forEach((node, colIndex) => {
      // Connect to nodes in next row
      const connectCount = Math.min(nextRow.length, Math.random() < 0.5 ? 1 : 2);
      const possibleConnections = nextRow.map((n, i) => ({ node: n, dist: Math.abs(i - colIndex) }))
        .sort((a, b) => a.dist - b.dist);
      
      for (let i = 0; i < connectCount; i++) {
        if (possibleConnections[i]) {
          node.connections.push(possibleConnections[i].node.id);
        }
      }
    });
  }
  
  // Ensure all nodes in non-first rows have at least one incoming connection
  for (let row = 1; row < rows; row++) {
    nodeGrid[row].forEach(node => {
      const hasIncoming = nodeGrid[row - 1].some(prevNode => prevNode.connections.includes(node.id));
      if (!hasIncoming) {
        // Connect from random node in previous row
        const randomPrev = nodeGrid[row - 1][Math.floor(Math.random() * nodeGrid[row - 1].length)];
        randomPrev.connections.push(node.id);
      }
    });
  }
  
  return new this({
    characterId,
    towerId,
    floor,
    nodes,
    currentNodeId: nodes[0].id,
    startNodeId: nodes[0].id,
    bossNodeId: nodes[nodes.length - 1].id
  });
};

// Helper: Generate enemies for a node
function generateEnemies(type, towerId, floor, enemyData) {
  const enemies = [];
  const towerEnemies = enemyData[`tower${towerId}`];
  if (!towerEnemies) return enemies;
  
  const floorScale = 1 + (floor - 1) * 0.1;
  
  if (type === 'boss' && towerEnemies.boss) {
    const boss = { ...towerEnemies.boss };
    boss.hp = Math.floor(boss.baseHp * floorScale);
    boss.maxHp = boss.hp;
    boss.atk = Math.floor(boss.baseAtk * floorScale);
    boss.def = Math.floor(boss.baseDef * floorScale);
    enemies.push(boss);
  } else if (type === 'elite' && towerEnemies.elite?.length > 0) {
    const elite = { ...towerEnemies.elite[Math.floor(Math.random() * towerEnemies.elite.length)] };
    elite.hp = Math.floor(elite.baseHp * floorScale);
    elite.maxHp = elite.hp;
    elite.atk = Math.floor(elite.baseAtk * floorScale);
    elite.def = Math.floor(elite.baseDef * floorScale);
    enemies.push(elite);
  } else if (towerEnemies.normal?.length > 0) {
    // 1-3 normal enemies
    const count = Math.min(1 + Math.floor(Math.random() * 3), 3);
    for (let i = 0; i < count; i++) {
      const validEnemies = towerEnemies.normal.filter(e => !e.floors || e.floors.includes(floor));
      if (validEnemies.length > 0) {
        const enemy = { ...validEnemies[Math.floor(Math.random() * validEnemies.length)] };
        enemy.hp = Math.floor(enemy.baseHp * floorScale);
        enemy.maxHp = enemy.hp;
        enemy.atk = Math.floor(enemy.baseAtk * floorScale);
        enemy.def = Math.floor(enemy.baseDef * floorScale);
        enemy.instanceId = `${enemy.id}_${i}`; // Unique ID for multiple same enemies
        enemies.push(enemy);
      }
    }
  }
  
  return enemies;
}

// Helper: Generate treasure rewards
function generateTreasureRewards(towerId, floor) {
  const baseGold = 50 + floor * 20 + towerId * 30;
  return {
    gold: Math.floor(baseGold * (0.8 + Math.random() * 0.4)),
    exp: Math.floor(20 + floor * 5),
    items: [],
    healPercent: Math.random() < 0.3 ? 20 : 0
  };
}

// Helper: Generate mystery scenario
function generateMysteryScenario() {
  const scenarios = [
    { id: 'ancient_chest', description: 'An ancient chest sits in the corner, covered in dust. Do you OPEN it or LEAVE it?', choices: ['open', 'leave'] },
    { id: 'wounded_traveler', description: 'A wounded traveler asks for help. Do you HELP them or IGNORE them?', choices: ['help', 'ignore'] },
    { id: 'strange_altar', description: 'A strange altar glows with energy. Do you PRAY at it or DESTROY it?', choices: ['pray', 'destroy'] },
    { id: 'gambling_imp', description: 'A mischievous imp offers a gamble. Do you ACCEPT or DECLINE?', choices: ['accept', 'decline'] },
    { id: 'poison_fountain', description: 'A fountain with suspicious liquid. Do you DRINK or AVOID?', choices: ['drink', 'avoid'] }
  ];
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}

export default mongoose.model('FloorMap', floorMapSchema);
