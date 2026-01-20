import React, { useState, useEffect } from 'react';
import { friendsAPI } from '../services/api';

// ============================================
// FRIENDS PANEL - Phase 9.8
// ============================================
// Features:
// - View friend list with online status
// - Search and add friends by username
// - Accept/decline friend requests
// - View friend profiles
// - Remove friends
// ============================================

const CLASS_ICONS = {
  swordsman: '⚔️',
  thief: '🗡️',
  archer: '🏹',
  mage: '🔮'
};

const ACTIVITY_STATUS = {
  idle: { text: 'Idle', color: 'text-gray-400' },
  in_tower: { text: 'In Tower', color: 'text-yellow-400' },
  in_combat: { text: 'In Combat', color: 'text-red-400' },
  in_dungeon_break: { text: 'Dungeon Break', color: 'text-purple-400' },
  helping_friend: { text: 'Helping Friend', color: 'text-blue-400' }
};

const FriendsPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests, search
  const [friends, setFriends] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    fetchFriends();
    fetchPending();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const fetchFriends = async () => {
    try {
      const { data } = await friendsAPI.getFriends();
      setFriends(data.friends || []);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    }
    setIsLoading(false);
  };

  const fetchPending = async () => {
    try {
      const { data } = await friendsAPI.getPending();
      setPendingReceived(data.received || []);
      setPendingSent(data.sent || []);
    } catch (err) {
      console.error('Failed to fetch pending:', err);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await friendsAPI.searchUsers(query);
      setSearchResults(data.users || []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleSendRequest = async (username) => {
    try {
      await friendsAPI.sendRequest(username);
      showMessage('success', `Friend request sent to ${username}`);
      setSearchQuery('');
      setSearchResults([]);
      fetchPending();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async (friendshipId, username) => {
    try {
      await friendsAPI.acceptRequest(friendshipId);
      showMessage('success', `You are now friends with ${username}`);
      fetchFriends();
      fetchPending();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleDeclineRequest = async (friendshipId) => {
    try {
      await friendsAPI.declineRequest(friendshipId);
      showMessage('success', 'Request declined');
      fetchPending();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to decline request');
    }
  };

  const handleRemoveFriend = async (friendshipId, name) => {
    if (!confirm(`Remove ${name} from friends?`)) return;
    try {
      await friendsAPI.removeFriend(friendshipId);
      showMessage('success', 'Friend removed');
      fetchFriends();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to remove friend');
    }
  };

  const handleViewProfile = async (friendshipId) => {
    try {
      const { data } = await friendsAPI.getFriendProfile(friendshipId);
      setSelectedFriend(data.profile);
    } catch (err) {
      showMessage('error', 'Failed to load profile');
    }
  };

  const formatLastOnline = (date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const last = new Date(date);
    const diffMs = now - last;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const totalPending = pendingReceived.length + pendingSent.length;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-void-900 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden neon-border">
        {/* Header */}
        <div className="bg-void-800 p-4 border-b border-purple-500/30 flex justify-between items-center">
          <h2 className="font-display text-xl text-purple-400 flex items-center gap-2">
            👥 Friends
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-3 text-center text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-purple-500/30">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'friends' 
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'requests' 
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Requests
            {totalPending > 0 && (
              <span className="absolute top-2 right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalPending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'search' 
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🔍 Add Friend
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="space-y-2">
              {isLoading ? (
                <p className="text-center text-gray-400 py-8">Loading...</p>
              ) : friends.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No friends yet</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm"
                  >
                    Find Friends
                  </button>
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend.friendshipId}
                    className="bg-void-800 rounded-lg p-3 flex items-center justify-between hover:bg-void-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Online indicator */}
                      <div className={`w-3 h-3 rounded-full ${friend.character?.isOnline ? 'bg-green-500' : 'bg-gray-600'}`} />
                      
                      {/* Class icon */}
                      <span className="text-xl">
                        {CLASS_ICONS[friend.character?.baseClass] || '👤'}
                      </span>
                      
                      {/* Info */}
                      <div>
                        <p className="text-white font-medium">
                          {friend.character?.name || friend.username}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-400">Lv.{friend.character?.level || 1}</span>
                          {friend.character?.isOnline ? (
                            <span className={ACTIVITY_STATUS[friend.character?.currentActivity]?.color || 'text-green-400'}>
                              {ACTIVITY_STATUS[friend.character?.currentActivity]?.text || 'Online'}
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              {formatLastOnline(friend.character?.lastOnline)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewProfile(friend.friendshipId)}
                        className="px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 rounded text-xs text-blue-400"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.friendshipId, friend.character?.name || friend.username)}
                        className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 rounded text-xs text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {/* Received Requests */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Received ({pendingReceived.length})
                </h3>
                {pendingReceived.length === 0 ? (
                  <p className="text-gray-500 text-sm">No pending requests</p>
                ) : (
                  <div className="space-y-2">
                    {pendingReceived.map((req) => (
                      <div
                        key={req.friendshipId}
                        className="bg-void-800 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {CLASS_ICONS[req.character?.baseClass] || '👤'}
                          </span>
                          <div>
                            <p className="text-white">{req.character?.name || req.username}</p>
                            <p className="text-xs text-gray-400">Lv.{req.character?.level || 1}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(req.friendshipId, req.username)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(req.friendshipId)}
                            className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 rounded text-xs text-red-400"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Sent ({pendingSent.length})
                </h3>
                {pendingSent.length === 0 ? (
                  <p className="text-gray-500 text-sm">No sent requests</p>
                ) : (
                  <div className="space-y-2">
                    {pendingSent.map((req) => (
                      <div
                        key={req.friendshipId}
                        className="bg-void-800 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">
                            {CLASS_ICONS[req.character?.baseClass] || '👤'}
                          </span>
                          <div>
                            <p className="text-white">{req.character?.name || req.username}</p>
                            <p className="text-xs text-gray-400">Lv.{req.character?.level || 1}</p>
                          </div>
                        </div>
                        <span className="text-xs text-yellow-400">Pending...</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Tab */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Search by username..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full bg-void-800 border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.userId}
                      className="bg-void-800 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {CLASS_ICONS[user.character?.baseClass] || '👤'}
                        </span>
                        <div>
                          <p className="text-white">{user.character?.name || user.username}</p>
                          <p className="text-xs text-gray-400">
                            @{user.username} • Lv.{user.character?.level || 1}
                          </p>
                        </div>
                      </div>
                      
                      {user.friendshipStatus === 'friends' ? (
                        <span className="text-xs text-green-400">✓ Friends</span>
                      ) : user.friendshipStatus === 'request_sent' ? (
                        <span className="text-xs text-yellow-400">Pending</span>
                      ) : user.friendshipStatus === 'request_received' ? (
                        <span className="text-xs text-blue-400">Accept in Requests</span>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(user.username)}
                          className="px-4 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm"
                        >
                          Add Friend
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-center text-gray-400 py-4">No users found</p>
              )}

              {searchQuery.length < 2 && (
                <p className="text-center text-gray-500 py-4 text-sm">
                  Type at least 2 characters to search
                </p>
              )}
            </div>
          )}
        </div>

        {/* Profile Modal */}
        {selectedFriend && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60">
            <div className="bg-void-800 rounded-xl p-6 w-full max-w-sm neon-border">
              <div className="text-center mb-4">
                <span className="text-4xl">
                  {CLASS_ICONS[selectedFriend.baseClass] || '👤'}
                </span>
                <h3 className="text-xl font-display text-white mt-2">{selectedFriend.name}</h3>
                {selectedFriend.activeTitle && (
                  <p className="text-yellow-400 text-sm">「{selectedFriend.activeTitle}」</p>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Level</span>
                  <span className="text-white">{selectedFriend.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Class</span>
                  <span className="text-white capitalize">
                    {selectedFriend.hiddenClass !== 'none' 
                      ? selectedFriend.hiddenClass 
                      : selectedFriend.baseClass}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={selectedFriend.isOnline ? 'text-green-400' : 'text-gray-500'}>
                    {selectedFriend.isOnline 
                      ? ACTIVITY_STATUS[selectedFriend.currentActivity]?.text || 'Online'
                      : 'Offline'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Boss Kills</span>
                  <span className="text-white">{selectedFriend.statistics?.bossKills || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Floors Cleared</span>
                  <span className="text-white">{selectedFriend.statistics?.floorsCleared || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Helps Given</span>
                  <span className="text-blue-400">{selectedFriend.socialStats?.helpsGiven || 0}</span>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedFriend(null)}
                className="w-full mt-4 py-2 bg-void-700 hover:bg-void-600 rounded-lg text-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPanel;
