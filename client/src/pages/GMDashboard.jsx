consumable">Consumable</option>
                <option value="equipment">Equipment</option>
                <option value="scroll">Scroll</option>
                <option value="special">Special</option>
              </select>
              <select value={addItemForm.rarity} onChange={(e) => setAddItemForm({ ...addItemForm, rarity: e.target.value })} className="input-field">
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
              <input type="number" placeholder="Quantity" value={addItemForm.quantity} onChange={(e) => setAddItemForm({ ...addItemForm, quantity: parseInt(e.target.value) })}
                className="input-field" min={1} required />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddItemModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GMDashboard;
