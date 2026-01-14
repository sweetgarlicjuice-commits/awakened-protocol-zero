import React, { useState } from 'react';
import axios from 'axios';

const GMStatAdjustment = () => {
  const [statName, setStatName] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

  const handleStatAdjustment = async () => {
    try {
      // Send a request to the backend to adjust the stat
      const response = await axios.post('/api/character/adjust-stats', { statName, value });
      setMessage(`Stat adjusted successfully: ${response.data.message}`);
    } catch (error) {
      setMessage('Error adjusting stat.');
      console.error('Error adjusting stat:', error);
    }
  };

  return (
    <div>
      <h1>GM Stat Adjustment</h1>
      <div>
        <label>Stat Name: </label>
        <input
          type="text"
          value={statName}
          onChange={(e) => setStatName(e.target.value)}
          placeholder="e.g., str, agi, dex"
        />
      </div>
      <div>
        <label>Value: </label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter new value"
        />
      </div>
      <button onClick={handleStatAdjustment}>Adjust Stat</button>
      <p>{message}</p>
    </div>
  );
};

export default GMStatAdjustment;
