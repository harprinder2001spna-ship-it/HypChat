import React, { useState, useEffect } from 'react';
import { X, Send, Check, Share2, Copy, Star } from 'lucide-react';
import { HypeVideo } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { calculateStarTier } from '../../utils/starSystem';

interface ShareHypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  hype: HypeVideo | null;
  onShareComplete?: () => void;
}

export const ShareHypeModal: React.FC<ShareHypeModalProps> = ({
  isOpen,
  onClose,
  hype,
  onShareComplete
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [sentFriendIds, setSentFriendIds] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadFriends();
    }
  }, [isOpen, user]);

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

  const handleSendToFriend = async (friendId: string) => {
    if (!user || !hype || sentFriendIds.includes(friendId)) return;

    try {
      // Find or start conversation with friend
      const conv = await api.startConversation(user.id, friendId);

      // Send shared hype message with Hype payload
      await api.sendMessage({
        conversationId: conv.id,
        senderId: user.id,
        receiverId: friendId,
        sharedHypeId: hype.id,
        sharedHypeData: {
          id: hype.id,
          caption: hype.caption,
          creatorUsername: hype.creator.username,
          posterGradient: hype.posterGradient
        }
      });

      // Update backend share count & friendship stars (+5 stars)
      await api.shareHype(hype.id, user.id, friendId);

      setSentFriendIds(prev => [...prev, friendId]);
      if (onShareComplete) onShareComplete();
    } catch {
      // error handled
    }
  };

  const handleCopyLink = () => {
    if (!hype) return;
    const url = `${window.location.origin}/#hype-${hype.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!hype) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Hype by @${hype.creator.username}`,
          text: hype.caption,
          url: `${window.location.origin}/#hype-${hype.id}`
        });
        if (user) await api.shareHype(hype.id, user.id);
        if (onShareComplete) onShareComplete();
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  if (!isOpen || !hype) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Share Hype</h3>
            <p className="text-[11px] text-amber-400 flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Sharing with friends earns +5 Friendship Stars</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video preview pill */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-800/80 rounded-2xl mb-4 border border-slate-700/60">
          <div className={`w-12 h-16 rounded-xl bg-gradient-to-br ${hype.posterGradient} shrink-0 flex items-center justify-center text-white/50 text-[10px]`}>
            ▶
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-white truncate block">
              @{hype.creator.username}
            </span>
            <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
              {hype.caption}
            </p>
          </div>
        </div>

        {/* Friends Horizontal Quick Send Carousel */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-slate-400 mb-2">Send in HypChat</h4>
          {isLoading ? (
            <div className="py-4 text-center text-xs text-slate-500">Loading friends...</div>
          ) : friends.length === 0 ? (
            <div className="p-3 bg-slate-800/50 rounded-xl text-center text-xs text-slate-400">
              No friends added yet. Search users in the Friends tab to connect!
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {friends.map((item) => {
                const isSent = sentFriendIds.includes(item.friendId);
                const tier = calculateStarTier(item.stars);
                return (
                  <button
                    key={item.friendId}
                    onClick={() => handleSendToFriend(item.friendId)}
                    disabled={isSent}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl min-w-[76px] transition-all ${
                      isSent ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={item.friend.avatar}
                        alt={item.friend.name}
                        className="w-11 h-11 rounded-full bg-slate-700 object-cover"
                      />
                      <span className="absolute -bottom-1 -right-1 text-[10px]">
                        {tier.badge}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-white truncate w-14 text-center">
                      {item.friend.name.split(' ')[0]}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isSent ? 'bg-emerald-500 text-slate-950' : 'bg-orange-500 text-slate-950'
                    }`}>
                      {isSent ? <Check className="w-2.5 h-2.5" /> : <Send className="w-2.5 h-2.5" />}
                      <span>{isSent ? 'Sent' : 'Send'}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* External share actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors"
          >
            <Share2 className="w-4 h-4 text-orange-400" />
            <span>More Options</span>
          </button>
        </div>
      </div>
    </div>
  );
};
