import React, { useState, useEffect } from 'react';
import {
  User,
  Settings,
  Edit3,
  Bookmark,
  Flame,
  Star,
  Users,
  MessageCircle,
  UserPlus,
  UserCheck,
  Flag,
  UserX,
  LogOut,
  Trash2,
  X,
  Check,
  Lock,
  Globe,
  Film,
  Sparkles
} from 'lucide-react';
import { User as UserType, HypeVideo } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { calculateStarTier } from '../../utils/starSystem';
import { AiCharacterModal } from './AiCharacterModal';
import { HypChatLogo, HypChatAppIcon } from '../Common/HypChatLogo';

interface ProfileViewProps {
  userId?: string; // If undefined, views current logged-in user
  onClose?: () => void;
  onStartChat?: (targetUser: UserType) => void;
  onOpenReport?: (targetType: 'user', targetId: string) => void;
  onSelectHype?: (hype: HypeVideo) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  onClose,
  onStartChat,
  onOpenReport,
  onSelectHype
}) => {
  const { user: currentUser, logout, deleteAccount, updateUser } = useAuth();
  const isOwnProfile = !userId || userId === currentUser?.id;
  const targetId = userId || currentUser?.id || '';

  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [hypes, setHypes] = useState<HypeVideo[]>([]);
  const [savedHypes, setSavedHypes] = useState<HypeVideo[]>([]);
  const [activeTab, setActiveTab] = useState<'hypes' | 'saved'>('hypes');
  const [friendshipInfo, setFriendshipInfo] = useState<any | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [hasSentFriendRequest, setHasSentFriendRequest] = useState(false);

  // Edit Profile modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [editAvatarSeed, setEditAvatarSeed] = useState('');

  // AI Character modal state
  const [isAiCharacterOpen, setIsAiCharacterOpen] = useState(false);

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (targetId) {
      loadProfileData();
    }
  }, [targetId, currentUser]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const userRes = await api.getUser(targetId);
      setProfileUser(userRes);

      // Load user hypes
      const userHypes = await api.getHypes({
        creatorId: userRes.id,
        currentUserId: currentUser?.id
      });
      setHypes(userHypes);

      // If own profile, load saved hypes
      if (isOwnProfile && currentUser) {
        const allHypes = await api.getHypes({ currentUserId: currentUser.id });
        setSavedHypes(allHypes.filter((h) => h.isSaved));
      }

      // Check relation with other user
      if (!isOwnProfile && currentUser) {
        const friendsList = await api.getFriends(currentUser.id);
        const matchFriend = friendsList.find((f) => f.friendId === userRes.id);
        if (matchFriend) {
          setIsFriend(true);
          setFriendshipInfo(matchFriend);
        }
      }
    } catch {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUser || !profileUser) return;
    try {
      const res = await api.toggleFollow(profileUser.id, currentUser.id);
      setIsFollowing(res.isFollowing);
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              followersCount: res.isFollowing
                ? prev.followersCount + 1
                : Math.max(0, prev.followersCount - 1)
            }
          : null
      );
    } catch {
      // error handled
    }
  };

  const handleSendFriendRequest = async () => {
    if (!currentUser || !profileUser) return;
    try {
      await api.sendFriendRequest(profileUser.id, currentUser.id);
      setHasSentFriendRequest(true);
    } catch {
      // error handled
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const avatarUrl = editAvatarSeed
        ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(editAvatarSeed)}`
        : currentUser.avatar;

      const updated = await api.updateProfile({
        userId: currentUser.id,
        name: editName.trim(),
        username: editUsername.trim(),
        bio: editBio.trim(),
        avatar: avatarUrl,
        isPrivate: editIsPrivate
      });

      updateUser(updated);
      setProfileUser(updated);
      setIsEditModalOpen(false);
    } catch {
      // error handled
    }
  };

  const openEditModal = () => {
    if (!profileUser) return;
    setEditName(profileUser.name);
    setEditUsername(profileUser.username);
    setEditBio(profileUser.bio);
    setEditIsPrivate(!!profileUser.isPrivate);
    setIsEditModalOpen(true);
  };

  if (isLoading || !profileUser) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-neutral-500 text-xs">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
        <span>Loading profile...</span>
      </div>
    );
  }

  const starTier = friendshipInfo ? calculateStarTier(friendshipInfo.stars) : null;

  return (
    <div className="w-full max-w-md mx-auto h-[calc(100vh-4rem-3.5rem)] flex flex-col bg-black text-white overflow-y-auto p-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <HypChatAppIcon size="sm" />
          <span className="text-sm font-bold tracking-tight text-white">
            @{profileUser.username}
          </span>
          {profileUser.isPrivate && (
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
          )}
        </div>

        {isOwnProfile ? (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            {onOpenReport && (
              <button
                onClick={() => onOpenReport('user', profileUser.id)}
                className="p-2 text-neutral-400 hover:text-amber-400"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Profile Info Card */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="relative mb-3">
          <img
            src={profileUser.avatar}
            alt={profileUser.name}
            className="w-20 h-20 rounded-full bg-neutral-800 object-cover border-2 border-purple-500 shadow-xl shadow-purple-950/40"
          />
          {profileUser.aiAvatar && (
            <div
              className="absolute -top-1 -right-1 bg-purple-950 border border-purple-500 text-purple-300 rounded-full px-1.5 py-0.5 text-[9px] font-mono font-bold shadow-md flex items-center gap-0.5"
              title={`AI Character: ${profileUser.aiAvatar.style}`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>AI</span>
            </div>
          )}
          {friendshipInfo && (
            <div className="absolute -bottom-1 -right-1 bg-black border border-neutral-800 rounded-full px-1.5 py-0.5 text-xs shadow-md">
              {starTier?.badge}
            </div>
          )}
        </div>

        <h2 className="text-base font-bold text-white tracking-tight">{profileUser.name}</h2>
        <p className="text-xs text-neutral-400 mt-0.5 max-w-xs">{profileUser.bio}</p>

        {/* Stats Row */}
        <div className="flex items-center gap-6 my-4 py-2 px-4 rounded-2xl bg-neutral-900 border border-neutral-800/80">
          <div className="text-center">
            <div className="text-sm font-bold text-white font-mono">{hypes.length}</div>
            <div className="text-[10px] text-neutral-400">Hypes</div>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="text-center">
            <div className="text-sm font-bold text-white font-mono">
              {profileUser.followersCount}
            </div>
            <div className="text-[10px] text-neutral-400">Followers</div>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="text-center">
            <div className="text-sm font-bold text-white font-mono">
              {profileUser.followingCount}
            </div>
            <div className="text-[10px] text-neutral-400">Following</div>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div className="text-center">
            <div className="text-sm font-bold text-white font-mono">
              {profileUser.friendsCount || 0}
            </div>
            <div className="text-[10px] text-neutral-400">Friends</div>
          </div>
        </div>

        {/* Friendship Star Banner if Friend */}
        {friendshipInfo && starTier && (
          <div className="w-full p-3 mb-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-[#ff1e42]/10 border border-amber-500/30 text-left">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{friendshipInfo.stars} Friendship Stars</span>
                <span className="text-neutral-500">·</span>
                <span className="text-white">{starTier.level}</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {starTier.progressPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-purple-500 rounded-full"
                style={{ width: `${starTier.progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-400">
              {starTier.tier.description}. Stars never reset!
            </p>
          </div>
        )}

        {/* Actions Button Row */}
        {isOwnProfile ? (
          <div className="w-full flex items-center gap-2">
            <button
              onClick={openEditModal}
              className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setIsAiCharacterOpen(true)}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-950 to-violet-900 hover:from-purple-900 hover:to-violet-800 border border-purple-700/60 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-purple-950/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>AI Character</span>
            </button>
          </div>
        ) : (
          <div className="w-full flex items-center gap-2">
            <button
              onClick={handleToggleFollow}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                isFollowing
                  ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  : 'bg-[#7c3aed] text-white hover:bg-violet-600 shadow-md shadow-purple-950/40'
              }`}
            >
              {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              <span>{isFollowing ? 'Following' : 'Follow'}</span>
            </button>

            {isFriend ? (
              <button
                onClick={() => onStartChat && onStartChat(profileUser)}
                className="flex-1 py-2.5 bg-amber-400 text-black font-bold text-xs rounded-xl hover:bg-amber-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat (+2 ⭐)</span>
              </button>
            ) : hasSentFriendRequest ? (
              <span className="flex-1 py-2.5 bg-neutral-800 text-amber-400 border border-neutral-700 rounded-xl text-xs font-semibold text-center">
                Request Sent
              </span>
            ) : (
              <button
                onClick={handleSendFriendRequest}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Add Friend</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs: Hypes vs Saved */}
      <div className="flex border-b border-neutral-800 mb-3">
        <button
          onClick={() => setActiveTab('hypes')}
          className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors relative ${
            activeTab === 'hypes' ? 'text-purple-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Hypes ({hypes.length})</span>
          {activeTab === 'hypes' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>

        {isOwnProfile && (
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 pb-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors relative ${
              activeTab === 'saved' ? 'text-purple-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved ({savedHypes.length})</span>
            {activeTab === 'saved' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        )}
      </div>

      {/* Grid of Hype Videos */}
      <div className="flex-1">
        {activeTab === 'hypes' ? (
          hypes.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No Hypes published yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {hypes.map((hype) => (
                <button
                  key={hype.id}
                  onClick={() => onSelectHype && onSelectHype(hype)}
                  className="aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 relative group text-left border border-neutral-800"
                >
                  <div
                    className={`w-full h-full bg-gradient-to-br ${hype.posterGradient} flex flex-col justify-between p-2`}
                  >
                    <div className="flex items-center gap-1 text-[10px] font-mono text-white/90">
                      <Film className="w-3 h-3 text-purple-400" />
                      <span>{hype.viewsCount}</span>
                    </div>
                    <div className="text-[10px] text-white/90 line-clamp-2">
                      {hype.caption}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          savedHypes.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No saved Hypes yet. Tap the bookmark icon on any video to save it here!
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {savedHypes.map((hype) => (
                <button
                  key={hype.id}
                  onClick={() => onSelectHype && onSelectHype(hype)}
                  className="aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 relative group text-left border border-neutral-800"
                >
                  <div
                    className={`w-full h-full bg-gradient-to-br ${hype.posterGradient} flex flex-col justify-between p-2`}
                  >
                    <div className="flex items-center gap-1 text-[10px] font-mono text-white/90">
                      <Bookmark className="w-3 h-3 text-amber-400" />
                      <span>{hype.viewsCount}</span>
                    </div>
                    <div className="text-[10px] text-white/90 line-clamp-2">
                      {hype.caption}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Username</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-800/60 rounded-xl border border-neutral-700">
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Private Account</div>
                  <div className="text-[10px] text-neutral-400">Only friends can view your hypes</div>
                </div>
                <input
                  type="checkbox"
                  checked={editIsPrivate}
                  onChange={(e) => setEditIsPrivate(e.target.checked)}
                  className="w-4 h-4 accent-[#7c3aed]"
                />
              </div>

              {/* AI Character Option in Edit Profile */}
              <div className="p-3 bg-gradient-to-r from-purple-950/70 to-neutral-900 border border-purple-800/60 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-900/60 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>AI Character</span>
                      {currentUser?.aiAvatar && (
                        <span className="px-1.5 py-0.2 bg-purple-900 text-purple-300 text-[9px] rounded font-mono">
                          {currentUser.aiAvatar.style}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-purple-300/80">
                      {currentUser?.aiAvatar ? 'AI character active' : 'Stylized AI avatar generator'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsAiCharacterOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#7c3aed] hover:bg-violet-600 text-white font-bold text-xs transition-colors shadow-md shadow-purple-950/40"
                >
                  {currentUser?.aiAvatar ? 'Manage AI Character' : 'Create AI Character'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Avatar Seed</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditAvatarSeed(`avatar_${Date.now()}`)}
                    className="text-xs text-purple-400 hover:underline"
                  >
                    Randomize Avatar
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-800 text-white rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#7c3aed] text-white font-bold rounded-xl text-xs hover:bg-violet-600 transition-colors shadow-md shadow-purple-950/40"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Character Studio Modal */}
      <AiCharacterModal
        isOpen={isAiCharacterOpen}
        onClose={() => setIsAiCharacterOpen(false)}
        onProfileUpdated={(updated) => {
          setProfileUser(updated);
          loadProfileData();
        }}
      />

      {/* Settings Modal (Logout & Delete Account) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Account Settings</h3>
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  setConfirmDeleteAccount(false);
                }}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* HypChat Logo in Settings */}
            <div className="flex justify-center mb-4">
              <HypChatLogo size="sm" variant="full" />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  logout();
                }}
                className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-purple-400" />
                <span>Log Out</span>
              </button>

              {confirmDeleteAccount ? (
                <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-center space-y-2 animate-in zoom-in-95 duration-150">
                  <p className="text-xs text-red-300 font-semibold">
                    Are you sure you want to permanently delete your HypChat account? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteAccount(false)}
                      className="flex-1 py-2 bg-neutral-800 text-white rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        setIsSettingsOpen(false);
                        await deleteAccount();
                      }}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                    >
                      Yes, Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteAccount(true)}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
