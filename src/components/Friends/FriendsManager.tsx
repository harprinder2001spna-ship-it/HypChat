import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Star,
  Check,
  X,
  MessageCircle,
  Clock,
  Sparkles,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { User, FriendRequest } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { calculateStarTier } from '../../utils/starSystem';
import { HypChatAppIcon } from '../Common/HypChatLogo';

interface FriendsManagerProps {
  onStartChatWithFriend: (friendUser: User) => void;
  onOpenProfile: (userId: string) => void;
  onRequestAccepted?: () => void;
}

export const FriendsManager: React.FC<FriendsManagerProps> = ({
  onStartChatWithFriend,
  onOpenProfile,
  onRequestAccepted
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  // Friends list with star info
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [sentRequestUserIds, setSentRequestUserIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedFriendStarDetails, setSelectedFriendStarDetails] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadRequests();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'search') {
      performSearch(searchQuery);
    }
  }, [searchQuery, activeTab]);

  const loadFriends = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const list = await api.getFriends(user.id);
      setFriends(list);
    } catch {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!user) return;
    try {
      const list = await api.getFriendRequests(user.id);
      setRequests(list);
    } catch {
      // non-blocking
    }
  };

  const performSearch = async (query: string) => {
    try {
      const res = await api.searchUsers(query, user?.id);
      setSearchResults(res);
    } catch {
      // non-blocking
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    if (!user) return;
    try {
      await api.sendFriendRequest(targetUserId, user.id);
      setSentRequestUserIds([...sentRequestUserIds, targetUserId]);
    } catch {
      // error handled
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return;
    try {
      await api.acceptFriendRequest(requestId, user.id);
      setRequests(requests.filter((r) => r.id !== requestId));
      loadFriends();
      if (onRequestAccepted) onRequestAccepted();
    } catch {
      // error handled
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (!user) return;
    try {
      await api.declineFriendRequest(requestId, user.id);
      setRequests(requests.filter((r) => r.id !== requestId));
    } catch {
      // error handled
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    try {
      await api.removeFriend(friendId, user.id);
      setFriends(friends.filter((f) => f.friendId !== friendId));
      setSelectedFriendStarDetails(null);
    } catch {
      // error handled
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-[calc(100vh-4rem-3.5rem)] flex flex-col bg-black text-white p-4 select-none">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <HypChatAppIcon size="sm" />
        <div>
          <h2 className="font-display text-xl font-extrabold text-white tracking-tight">Friends & Stars</h2>
          <p className="text-[11px] text-purple-300/80">
            Build mutual connections and level up Friendship Stars ⭐
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-neutral-900 p-1 rounded-2xl border border-neutral-800 mb-4">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'friends'
              ? 'bg-[#7c3aed] text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Friends ({friends.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all relative ${
            activeTab === 'requests'
              ? 'bg-[#7c3aed] text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Requests
          {requests.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-black text-[10px] font-bold rounded-full">
              {requests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'search'
              ? 'bg-[#7c3aed] text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Find Users
        </button>
      </div>

      {/* TAB 1: FRIENDS LIST */}
      {activeTab === 'friends' && (
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-neutral-500">Loading friends...</div>
          ) : friends.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              <Users className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">No friends yet</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto mb-4">
                Connect with creators to earn persistent Friendship Stars that never reset!
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="px-4 py-2.5 bg-[#7c3aed] text-white font-bold text-xs rounded-xl hover:bg-violet-600 transition-colors shadow-lg shadow-purple-950/40"
              >
                Find & Add Friends
              </button>
            </div>
          ) : (
            friends.map((item) => {
              const tier = calculateStarTier(item.stars);
              return (
                <div
                  key={item.friendId}
                  className="p-3 bg-neutral-900/70 border border-neutral-800 rounded-2xl flex flex-col gap-2.5 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onOpenProfile(item.friendId)}
                      className="flex items-center gap-3 text-left min-w-0 flex-1 mr-2"
                    >
                      <img
                        src={item.friend.avatar}
                        alt={item.friend.name}
                        className="w-11 h-11 rounded-full bg-neutral-800 object-cover border border-neutral-700"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {item.friend.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          @{item.friend.username}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onStartChatWithFriend(item.friend)}
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-xl transition-colors"
                        title="Open Chat"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          setSelectedFriendStarDetails(
                            selectedFriendStarDetails?.friendId === item.friendId ? null : item
                          )
                        }
                        className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-colors"
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            selectedFriendStarDetails?.friendId === item.friendId ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Friendship Star Gauge Bar */}
                  <div className="p-2.5 bg-black/60 rounded-xl border border-neutral-800/80">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{item.stars} Stars</span>
                        <span className="text-neutral-500">·</span>
                        <span className="text-white font-medium">{tier.level}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {tier.progressPercent}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-purple-500 rounded-full transition-all duration-300"
                        style={{ width: `${tier.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded Friendship Star Details */}
                  {selectedFriendStarDetails?.friendId === item.friendId && (
                    <div className="pt-2 border-t border-neutral-800 text-xs text-neutral-400 space-y-2 animate-in fade-in duration-150">
                      <p className="text-[11px] leading-relaxed">
                        {tier.tier.description}. Stars represent long-term relationship strength and never decay.
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-neutral-500 font-mono">
                          Total interactions: {item.totalInteractions || 0}
                        </span>
                        <button
                          onClick={() => handleRemoveFriend(item.friendId)}
                          className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove Friend</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: FRIEND REQUESTS */}
      {activeTab === 'requests' && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {requests.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              <Clock className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">No pending requests</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                Incoming friend requests will appear here.
              </p>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <img
                    src={req.sender.avatar}
                    alt={req.sender.name}
                    className="w-10 h-10 rounded-full bg-neutral-800 object-cover"
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-xs font-bold text-white truncate">
                      {req.sender.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      @{req.sender.username}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="px-3 py-1.5 bg-[#7c3aed] hover:bg-violet-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-colors shadow-purple-950/40"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>

                  <button
                    onClick={() => handleDeclineRequest(req.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-400 rounded-xl hover:bg-neutral-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: USER SEARCH & ADD */}
      {activeTab === 'search' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or name..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {searchResults.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                No users found matching "{searchQuery}"
              </div>
            ) : (
              searchResults.map((u) => {
                const isFriend = friends.some((f) => f.friendId === u.id);
                const hasSent = sentRequestUserIds.includes(u.id);

                return (
                  <div
                    key={u.id}
                    className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <button
                      onClick={() => onOpenProfile(u.id)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left"
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-full bg-neutral-800 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{u.name}</div>
                        <div className="text-[11px] text-neutral-400 truncate">@{u.username}</div>
                        <p className="text-[10px] text-neutral-500 truncate mt-0.5">{u.bio}</p>
                      </div>
                    </button>

                    {isFriend ? (
                      <span className="text-[11px] font-bold text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                        Friends
                      </span>
                    ) : hasSent ? (
                      <span className="text-[11px] font-bold text-amber-400 px-3 py-1 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(u.id)}
                        className="px-3 py-1.5 bg-[#7c3aed] hover:bg-violet-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors shadow-sm shadow-purple-950/40"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
