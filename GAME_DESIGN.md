# Awakened Protocol: Zero
## Game Design Document - Phase 1

### Overview
A Solo Leveling inspired text-based turn-based RPG where players explore mysterious towers, level up, gain equipment, and unlock powerful hidden classes through combat and quests.

---

## 1. CORE SYSTEMS

### 1.1 Basic Classes (Starting Classes)

| Class | Focus | Primary Stat | Playstyle |
|-------|-------|--------------|-----------|
| **Swordsman** | Melee | STR | High HP, balanced offense/defense |
| **Thief** | Stealth | AGI | High evasion, critical hits, poison |
| **Archer** | Ranged | DEX | Precision strikes, multi-target |
| **Mage** | Magic | INT | Elemental spells, AoE damage |

### 1.2 Base Stats
- **HP** (Health Points): Determines survivability
- **MP** (Mana Points): Used for skills
- **STR** (Strength): Physical damage, carry capacity
- **AGI** (Agility): Evasion, critical chance
- **DEX** (Dexterity): Accuracy, ranged damage
- **INT** (Intelligence): Magic damage, MP pool
- **VIT** (Vitality): HP pool, defense

### 1.3 Energy System
- **Max Energy**: 100
- **Energy Cost**: 25 per floor exploration
- **Regeneration**: Full refill in 4 hours (25 energy per hour)

---

## 2. TOWER SYSTEM

### 2.1 Tower Structure
Each tower has 15 floors:
- **Floors 1-9**: Regular combat floors
- **Floor 10**: Safe Zone (Rest, trade, upgrade)
- **Floors 11-14**: Elite floors (Harder enemies, better drops)
- **Floor 15**: Boss Room

### 2.2 Tower 1: Crimson Spire
- **Level Range**: 1-10
- **Theme**: Ancient ruins, undead creatures
- **Enemies**: Skeleton Warriors, Zombie Mages, Cursed Knights
- **Boss**: The Hollow King (Level 10)
- **Drops**: Common & Uncommon equipment

### 2.3 Tower 2: Azure Depths
- **Level Range**: 10-20
- **Theme**: Underwater caverns, aquatic monsters
- **Enemies**: Drowned Pirates, Sea Serpents, Coral Golems
- **Boss**: Leviathan's Herald (Level 20)
- **Drops**: Uncommon & Rare equipment

---

## 3. HIDDEN CLASS SYSTEM (Phase 1)

### 3.1 Obtaining Hidden Class Scrolls
- **Elite Mobs (Floors 13-14)**: 2% drop chance
- **Tower Boss**: 5% drop chance

### 3.2 Hidden Classes (Rare Tier)

| Hidden Class | Base Class | Theme | Special Mechanic |
|--------------|------------|-------|------------------|
| **Flameblade** | Swordsman | Fire-infused warrior | Burn damage over time |
| **Shadow Dancer** | Thief | Darkness assassin | Invisibility, backstab |
| **Storm Ranger** | Archer | Lightning archer | Chain lightning arrows |
| **Frost Weaver** | Mage | Ice sorcerer | Freeze and shatter |

### 3.3 Hidden Class Quest Requirements
After obtaining scroll, player must complete:
1. Defeat specific enemies (10 kills)
2. Find hidden item in tower
3. Defeat mini-boss related to class theme
4. Final trial combat

### 3.4 Class Reset
- Requires **Memory Crystal** (rare drop or shop purchase)
- Resets to base class, keeps all gear and level

---

## 4. EQUIPMENT SYSTEM

### 4.1 Rarity Tiers
- **Common** (Gray): Base stats
- **Uncommon** (Green): +10% stats, 1 bonus stat
- **Rare** (Blue): +25% stats, 2 bonus stats
- **Epic** (Purple): +50% stats, 3 bonus stats, special effect
- **Legendary** (Gold): +100% stats, 4 bonus stats, unique passive

### 4.2 Equipment Slots
- Weapon (Class-specific)
- Head
- Chest
- Hands
- Legs
- Feet
- Accessory x2

### 4.3 Shared Equipment
- All equipment works for both base and hidden classes
- No re-farming required after class change

---

## 5. COMBAT SYSTEM

### 5.1 Turn-Based Combat
1. Player selects action (Attack, Skill, Item, Defend, Flee)
2. Speed determines turn order
3. Actions resolve
4. Enemy turn
5. Repeat until victory/defeat

### 5.2 Skill System
- Each class has 4 base skills
- Hidden classes unlock 4 additional skills
- Skills cost MP and may have cooldowns

### 5.3 Combat Rewards
- Experience Points (EXP)
- Gold
- Item drops (based on enemy type and rarity)

---

## 6. ECONOMY

### 6.1 Currency
- **Gold**: Primary currency for shops
- **Gems**: Premium currency (optional future feature)

### 6.2 Marketplace
- Trade items with NPCs at Safe Zone
- Buy potions, basic equipment
- Sell loot

### 6.3 Valuable Items
- Hidden Class Scrolls (tradeable)
- Memory Crystals
- Rare materials for crafting (future feature)

---

## 7. PROGRESSION

### 7.1 Level Progression
- Max Level: 50 (Phase 1)
- EXP requirements scale exponentially
- Each level grants stat points to distribute

### 7.2 Stat Points
- 5 stat points per level
- Can be allocated to any stat

---

## 8. PHASE 1 IMPLEMENTATION SCOPE

### Included:
- [ ] Character creation (4 base classes)
- [ ] Basic combat system
- [ ] Tower 1: Crimson Spire (15 floors)
- [ ] Tower 2: Azure Depths (15 floors)
- [ ] Energy system
- [ ] 4 Hidden Class scrolls (1 per base class)
- [ ] Hidden class quest chains
- [ ] Basic equipment system
- [ ] Shop/inventory management
- [ ] Save/Load system (MongoDB)

### Future Phases:
- Additional towers
- More hidden classes (Epic, Legendary tiers)
- PvP system
- Guild system
- Crafting
- Events

---

## 9. TECHNICAL STACK

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Hosting**: GitHub Pages (frontend) / Render or Railway (backend)
