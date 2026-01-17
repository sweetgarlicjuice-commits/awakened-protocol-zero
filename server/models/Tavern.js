import mongoose from 'mongoose';

// ============================================================
// TAVERN SHOP SCHEMA
// ============================================================

const shopItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  icon: { type: String, default: '📦' },
  type: String,
  subtype: String,
  rarity: { type: String, default: 'common' },
  price: { type: Number, required: true },
  stock: { type: Number, default: -1 }, // -1 = unlimited
  isActive: { type: Boolean, default: true }
});

const tavernShopSchema = new mongoose.Schema({
  items: [shopItemSchema],
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Static method to initialize shop
tavernShopSchema.statics.initializeShop = async function() {
  let shop = await this.findOne();
  if (!shop) {
    shop = await this.create({ items: [] });
    console.log('[Tavern] Shop initialized');
  }
  return shop;
};

// ============================================================
// TRADING LISTING SCHEMA
// ============================================================

const tradingListingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName: { type: String, required: true },
  characterName: { type: String },
  
  // Item info
  itemId: { type: String, required: true },
  itemName: { type: String, required: true },
  itemIcon: { type: String, default: '📦' },
  itemType: String,
  itemSubtype: String,
  itemRarity: { type: String, default: 'common' },
  itemStats: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // Listing info
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  
  // Status
  isActive: { type: Boolean, default: true },
  listedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  
  // Buyer info (filled when sold)
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyerName: String,
  soldAt: Date
});

// Index for efficient queries
tradingListingSchema.index({ isActive: 1, listedAt: -1 });
tradingListingSchema.index({ sellerId: 1, isActive: 1 });
tradingListingSchema.index({ itemId: 1, isActive: 1 });

// ============================================================
// EXPORTS
// ============================================================

const TavernShop = mongoose.model('TavernShop', tavernShopSchema);
const TradingListing = mongoose.model('TradingListing', tradingListingSchema);

export { TavernShop, TradingListing };
