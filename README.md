# ⚔️ Awakened Protocol: Zero

A Solo Leveling inspired text-based turn-based RPG where players explore mysterious towers, level up, gain equipment, and unlock powerful hidden classes through combat and quests.

## 🎮 Game Features (Phase 1)

### Basic Classes
- **⚔️ Swordsman** - Melee tank/DPS with high HP and strength
- **🗡️ Thief** - Stealth assassin with high agility and critical hits
- **🏹 Archer** - Ranged DPS with precision and multi-target attacks
- **🔮 Mage** - Elemental caster with devastating spells

### Hidden Classes (Rare Tier)
- **🔥 Flameblade** (Swordsman) - Fire-infused warrior with burn damage
- **🌑 Shadow Dancer** (Thief) - Darkness assassin with invisibility
- **⚡ Storm Ranger** (Archer) - Lightning archer with chain attacks
- **❄️ Frost Weaver** (Mage) - Ice sorcerer with freeze abilities

### Account System
- GM creates accounts for players
- Players cannot self-register
- GM can enable/disable accounts

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free tier works)
- Git

### Step 1: Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/awakened-protocol-zero.git
cd awakened-protocol-zero
```

### Step 2: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account / Sign in
3. Create a new cluster (free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

### Step 3: Configure Server

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your MongoDB URI
```

Edit `.env` file:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/awakened-protocol-zero?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-change-this
PORT=5000
GM_USERNAME=admin
GM_PASSWORD=your-admin-password
```

### Step 4: Setup Client

```bash
# Open new terminal, navigate to client
cd client

# Install dependencies
npm install

# Create .env file (optional, for production)
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### Step 5: Run the Application

**Terminal 1 - Server:**
```bash
cd server
npm start
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

### Step 6: Access the Game

1. Open browser: `http://localhost:3000`
2. Login with admin credentials (set in .env)
3. GM Dashboard: Create player accounts
4. Players: Login → Create Character → Play!

---

## 📁 Project Structure

```
awakened-protocol-zero/
├── server/                 # Backend API
│   ├── models/            # MongoDB schemas
│   │   ├── User.js        # User authentication
│   │   └── Character.js   # Character data
│   ├── routes/            # API endpoints
│   │   ├── auth.js        # Login, account management
│   │   └── character.js   # Character operations
│   ├── middleware/        # Auth middleware
│   └── index.js           # Server entry point
│
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── App.jsx        # Main app
│   └── index.html
│
└── GAME_DESIGN.md         # Full game design document
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/gm/create-account` | Create player account | GM |
| GET | `/api/auth/gm/players` | List all players | GM |
| PATCH | `/api/auth/gm/toggle-account/:id` | Enable/disable account | GM |

### Character
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/character/classes` | Get class info | No |
| POST | `/api/character/create` | Create character | Yes |
| GET | `/api/character` | Get character | Yes |
| POST | `/api/character/allocate-stats` | Allocate stat points | Yes |
| POST | `/api/character/rest` | Rest to recover HP/MP | Yes |

---

## 🎯 Development Roadmap

### Phase 1 (Current) ✅
- [x] User authentication system
- [x] GM account management
- [x] Character creation with 4 base classes
- [x] Basic stats and leveling system
- [x] Energy system
- [x] Skills framework
- [x] Dark, Solo Leveling-inspired UI

### Phase 2 (Next)
- [x] Tower system with 2 towers
- [x] Turn-based combat system
- [x] Enemy encounters
- [x] Floor progression
- [x] Boss battles
- [x] Loot drops

### Phase 3 (Future)
- [x] Hidden class scroll drops
- [x] Hidden class quests
- [x] Class evolution system
- [x] Equipment system
- [x] Inventory management
- [x] Shop/trading

### Phase 4 (Later)
- [ ] Additional towers
- [ ] More hidden classes
- [ ] Crafting system
- [ ] Achievements
- [ ] Leaderboards

---

## 🛠️ Technologies

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Auth:** JWT tokens

---

## 📝 License

MIT License - Feel free to use and modify!

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

Made with ⚔️ for hunters everywhere
