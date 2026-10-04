import React, { useState, useEffect } from 'react';
import { Search, MessageSquarePlus, Star, Sparkles } from 'lucide-react';
import { Conversation, User, Story } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { calculateStarTier } from '../../utils/starSystem';
import { StoriesTray } from '../Stories/StoriesTray';
import { HypChatAppIcon } from '../Common/HypChatLogo';

interface ConversationListProps {
  onSelectConversation: (conv: Conversation) => void;
  onOpenFriends: () => void;
  stories?: Story[];
  onOpenStory?: (index: number) => void;
  onOpenCreateStory?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  onOpenFriends,
  stories,
  onOpenStory,
  onOpenCreateStory
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const list = await api.getConversations(user.id);
      setConversations(list);
    } catch {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-md mx-auto h-[calc(100vh-4rem-3.5rem)] flex flex-col bg-black text-white p-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <HypChatAppIcon size="sm" />
          <div>
            <h2 className="font-display text-xl font-extrabold text-white tracking-tight">Messages</h2>
            <p className="text-[11px] text-purple-300/80">
              Encrypted 1-on-1 chats & Friendship Stars ⭐
            </p>
          </div>
        </div>

        <button
          onClick={onOpenFriends}
          className="min-h-[44px] px-3.5 py-1.5 bg-[#7c3aed]/15 hover:bg-[#7c3aed]/25 text-purple-300 font-bold text-xs rounded-xl border border-purple-500/30 flex items-center gap-1.5 transition-colors"
        >
          <MessageSquarePlus className="w-4 h-4 text-purple-400" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search conversations..."
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Friends Stories Tray */}
      {stories && stories.length > 0 && (
        <div className="mb-3 p-2 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl">
          <StoriesTray
            compact
            stories={stories}
            onOpenStory={onOpenStory || (() => {})}
            onOpenCreateStory={onOpenCreateStory || (() => {})}
          />
        </div>
      )}

      {/* Conversation rows */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-neutral-500">Loading messages...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-16 text-center text-neutral-400">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-500">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No active conversations</h4>
            <p className="text-xs text-neutral-500 max-w-xs mx-auto mb-4">
              Start chatting with your HypChat friends to begin building Friendship Stars ⭐
            </p>
            <button
              onClick={onOpenFriends}
              className="px-4 py-2.5 bg-[#7c3aed] text-white font-bold text-xs rounded-xl hover:bg-violet-600 transition-colors shadow-lg shadow-purple-950/40"
            >
              Browse Friends
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const tier = calculateStarTier(conv.stars || 0);

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800/80 transition-all text-left group"
              >
                {/* Avatar with Friendship level badge */}
                <div className="relative shrink-0">
                  <img
                    src={conv.otherUser.avatar}
                    alt={conv.otherUser.name}
                    className="w-12 h-12 rounded-full bg-neutral-800 object-cover border border-neutral-700 group-hover:border-purple-500 transition-colors"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs">
                    {tier.badge}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-white truncate max-w-[150px]">
                      {conv.otherUser.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {conv.lastMessage ? formatTimestamp(conv.lastMessage.createdAt) : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] text-amber-400 font-mono flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{conv.stars || 0}</span>
                    </span>
                    <span className="text-neutral-600 text-[10px]">·</span>
                    <span className="text-[10px] text-neutral-400 font-medium">{tier.level}</span>
                  </div>

                  <p className="text-[11px] text-neutral-400 truncate">
                    {conv.lastMessage?.text ||
                      (conv.lastMessage?.sharedHypeId ? 'Shared a Hype video' : 'Sent media')}
                  </p>
                </div>

                {/* Unread badge */}
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm shadow-purple-950">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
