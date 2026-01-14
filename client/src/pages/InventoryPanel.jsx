import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InventoryPanel = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');  // Default to 'all'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Fetch items from the backend
        const response = await axios.get('/api/items');
        setItems(response.data.items);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error);
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filterItems = (type) => {
    if (type === 'all') return items;
    return items.filter(item => item.type === type);  // Filter items by type
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Inventory</h1>
      <div>
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('consumable')}>Consumables</button>
        <button onClick={() => setFilter('material')}>Materials</button>
        <button onClick={() => setFilter('equipment')}>Equipment</button>
      </div>

      <ul>
        {filterItems(filter).map((item) => (
          <li key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>  {/* Display item description */}
            <p><strong>Type:</strong> {item.type}</p>
            <p><strong>Rarity:</strong> {item.rarity}</p>
            <p><strong>Price:</strong> {item.buyPrice} gold</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryPanel;
