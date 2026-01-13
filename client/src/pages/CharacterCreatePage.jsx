import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { characterAPI } from '../services/api';

const CLASS_ICONS = {
  swordsman: '⚔️',
  thief: '🗡️',
  archer: '🏹',
  mage: '🔮'
};

const CLASS_COLORS = {
  swordsman: 'from-red-600 to-red-800',
  thief: 'from-indigo-600 to-indigo-800',
  archer: 'from-green-600 to-green-800',
  mage: 'from-purple-600 to-purple-800'
};

const CLASS_ACCENT = {
  swordsman: 'border-red-500/50 hover:border-red-400',
  thief: 'border-indigo-500/50 hover:border-indigo-400',
  archer: 'border-green-500/50 hover:border-green-400',
  mage: 'border-purple-500/50 hover:border-purple-400'
};

const CharacterCreatePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [characterName, setCharacterName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: class select, 2: name input

  const { createCharacter, character } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (character) {
      navigate('/game');
    }
  }, [character, navigate]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data } = await characterAPI.getClasses();
      setClasses(data.classes);
    } catch (err) {
      setError('Failed to load classes. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassSelect = (classData) => {
    setSelectedClass(classData);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedClass(null);
    setError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!characterName.trim()) {
      setError('Please enter a character name.');
      return;
    }

    if (characterName.length < 2 || characterName.length > 20) {
      setError('Name must be 2-20 characters.');
      return;
    }

    setIsCreating(true);
    setError('');

    const result = await createCharacter(characterName.trim(), selectedClass.id);
    
    if (result.success) {
      navigate('/game');
    } else {
      setError(result.error);
    }
    
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
          CREATE YOUR HUNTER
        </h1>
        <p className="text-gray-500 mt-2">
          {step === 1 ? 'Choose your class wisely, Hunter.' : 'What shall you be called?'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-500'}`}>
          1
        </div>
        <div className={`w-20 h-1 ${step >= 2 ? 'bg-purple-600' : 'bg-void-700'}`}></div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-500'}`}>
          2
        </div>
      </div>

      {error && (
        <div className="max-w-md mx-auto mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Step 1: Class Selection */}
      {step === 1 && (
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {classes.map((classData) => (
              <button
                key={classData.id}
                onClick={() => handleClassSelect(classData)}
                className={`group bg-void-800 rounded-xl p-6 border-2 ${CLASS_ACCENT[classData.id]} transition-all duration-300 card-hover text-left`}
              >
                {/* Class Icon */}
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${CLASS_COLORS[classData.id]} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {CLASS_ICONS[classData.id]}
                </div>

                {/* Class Name */}
                <h3 className="font-display text-xl text-center text-white mb-2">
                  {classData.name.toUpperCase()}
                </h3>

                {/* Playstyle */}
                <p className="text-center text-sm text-gray-400 mb-4">
                  {classData.playstyle}
                </p>

                {/* Description */}
                <p className="text-gray-500 text-sm mb-6">
                  {classData.description}
                </p>

                {/* Base Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>HP</span>
                    <span className="text-green-400">{classData.baseStats.hp}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>MP</span>
                    <span className="text-blue-400">{classData.baseStats.mp}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Primary ({classData.primaryStat})</span>
                    <span className="text-purple-400">{classData.baseStats[classData.primaryStat.toLowerCase()]}</span>
                  </div>
                </div>

                {/* Hidden Class Preview */}
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-600">HIDDEN CLASS:</span>
                    <span className="text-purple-400">{classData.hiddenClass.icon} {classData.hiddenClass.name}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Name Input */}
      {step === 2 && selectedClass && (
        <div className="max-w-md mx-auto">
          <div className="bg-void-800 rounded-xl p-8 neon-border">
            {/* Selected Class Display */}
            <div className="text-center mb-8">
              <div className={`w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br ${CLASS_COLORS[selectedClass.id]} flex items-center justify-center text-5xl shadow-lg animate-float`}>
                {CLASS_ICONS[selectedClass.id]}
              </div>
              <h3 className="font-display text-2xl text-white">
                {selectedClass.name.toUpperCase()}
              </h3>
              <p className="text-gray-400 text-sm mt-1">{selectedClass.playstyle}</p>
            </div>

            {/* Name Form */}
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2 font-medium">
                  HUNTER NAME
                </label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="input-field text-center text-xl font-display"
                  placeholder="Enter your name"
                  maxLength={20}
                  autoFocus
                />
                <p className="text-gray-600 text-xs mt-2 text-center">
                  2-20 characters • Cannot be changed later
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 btn-secondary"
                >
                  ← BACK
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !characterName.trim()}
                  className="flex-1 btn-primary"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      AWAKENING...
                    </span>
                  ) : (
                    'AWAKEN →'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCreatePage;
