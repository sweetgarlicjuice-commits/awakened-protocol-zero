import mongoose from 'mongoose';

// Tavern Shop - GM managed shop items
const shopItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, default: '📦' },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: -1 }, // -1 = unlimited
  isActive: { type: Boolean, default: true }
});

const tavernShopSchema = new mongoose.Schema({
  items: [shopItemSchema],
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Initialize default shop items
tavernShopSchema.statics.initializeShop = async function() {
  let shop = await this.findOne();
  if (!shop) {
    shop = await this.create({
      items: [
        { itemId: 'health_potion_small', name: 'Small HP Potion', icon: '🧪', type: 'consumable', price: 25 },
        { itemId: 'health_potion_medium', name: 'Medium HP Potion', icon: '🧪', type: 'consumable', price: 60 },
        { itemId: 'mana_potion_small', name: 'Small MP Potion', icon: '💎', type: 'consumable', price: 20 },
        { itemId: 'mana_potion_medium', name: 'Medium MP Potion', icon: '💎', type: 'consumable', price: 50 },
        { itemId: 'antidote', name: 'Antidote', icon: '🌿', type: 'consumable', price: 15 },
        { itemId: 'energy_drink', name: 'Energy Drink', icon: '⚡', type: 'consumable', price: 100 }
      ]
    });
  }
  return shop;
};

export const TavernShop = mongoose.model('TavernShop', tavernShopSchema);

// Player Trading Stall - Player to player trading
const tradingListingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName: { type: String, required: true },
  characterName: { type: String, required: true },
  itemId: { type: String, required: true },
  itemName: { type: String, required: true },
  itemIcon: { type: String, default: '📦' },
  itemType: { type: String, required: true },
  itemRarity: { type: String, default: 'common' },
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  listedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Optional expiration
  isActive: { type: Boolean, default: true }
});

// Index for faster queries
tradingListingSchema.index({ sellerId: 1 });
tradingListingSchema.index({ itemId: 1 });
tradingListingSchema.index({ isActive: 1 });

export const TradingListing = mongoose.model('TradingListing', tradingListingSchema);
