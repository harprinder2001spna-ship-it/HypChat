import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  Film,
  Star,
  MoreVertical,
  Flag,
  UserX,
  Sparkles,
  Check,
  CheckCheck
} from 'lucide-react';
import { Conversation, Message, User } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { calculateStarTier } from '../../utils/starSystem';

interface ChatRoomProps {
  conversation: Conversation;
  onBack: () => void;
  onOpenProfile: (userId: string) => void;
  onOpenReport: (targetType: 'user', targetId: string) => void;
  onWatchHype?: (hypeId: string) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  conversation,
  onBack,
  onOpenProfile,
  onOpenReport,
  onWatchHype
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [stars, setStars] = useState(conversation.stars || 0);
  const [starGainedAnimation, setStarGainedAnimation] = useState(false);
  const [showStarDetails, setShowStarDetails] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [conversation.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;
    try {
      const list = await api.getMessages(conversation.id, user.id);
      setMessages(list);
    } catch {
      // non-blocking
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || (!text.trim() && !fileInputRef.current?.value) || isSending) return;

    const messageText = text.trim();
    setText('');

    try {
      setIsSending(true);

      const sentMsg = await api.sendMessage({
        conversationId: conversation.id,
        senderId: user.id,
        receiverId: conversation.otherUser.id,
        text: messageText
      });

      setMessages((prev) => [...prev, sentMsg]);

      // Trigger Friendship Star gain: +2 Stars!
      setStars((prev: number) => prev + 2);
      setStarGainedAnimation(true);
      setTimeout(() => setStarGainedAnimation(false), 2000);
    } catch {
      // error handled
    } finally {
      setIsSending(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const isVideo = file.type.startsWith('video');

      try {
        const sentMsg = await api.sendMessage({
          conversationId: conversation.id,
          senderId: user.id,
          receiverId: conversation.otherUser.id,
          mediaUrl: dataUrl,
          mediaType: isVideo ? 'video' : 'image'
        });
        setMessages((prev) => [...prev, sentMsg]);
        setStars((prev: number) => prev + 2);
      } catch {
        // error
      }
    };
    reader.readAsDataURL(file);
  };

  const formatMessageTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const tier = calculateStarTier(stars);

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-black text-white max-w-md mx-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-black/95 backdrop-blur-md border-b border-neutral-900 z-10 pt-safe">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-neutral-400 hover:text-white rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => onOpenProfile(conversation.otherUser.id)}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="relative">
              <img
                src={conversation.otherUser.avatar}
                alt={conversation.otherUser.name}
                className="w-10 h-10 rounded-full bg-neutral-800 object-cover border border-neutral-700 group-hover:border-purple-500 transition-colors"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
            </div>

            <div>
              <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate max-w-[130px]">
                {conversation.otherUser.name}
              </div>
              <div className="text-[10px] text-neutral-400">
                @{conversation.otherUser.username}
              </div>
            </div>
          </button>
        </div>

        {/* Friendship Stars Badge (Interactive Level Widget) */}
        <div className="flex items-center gap-1.5 relative">
          <button
            onClick={() => setShowStarDetails(!showStarDetails)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-bold relative"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{stars}</span>
            <span className="text-[10px]">{tier.badge}</span>

            {/* Star Gain Animation Toast */}
            {starGainedAnimation && (
              <span className="absolute -top-3 -right-2 px-1.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black animate-bounce shadow-md">
                +2 ⭐
              </span>
            )}
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="min-h-[44px] min-w-[36px] flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Menu dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-neutral-900 border border-neutral-800 rounded-2xl p-1.5 shadow-2xl z-30 text-left">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onOpenReport('user', conversation.otherUser.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-neutral-800 rounded-xl"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report User</span>
              </button>
              <button
                onClick={async () => {
                  setShowMenu(false);
                  if (user) {
                    await api.blockUser(user.id, conversation.otherUser.id);
                    onBack();
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-neutral-800 rounded-xl"
              >
                <UserX className="w-3.5 h-3.5" />
                <span>Block User</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Friendship Stars Detail Banner (Expandable) */}
      {showStarDetails && (
        <div className="p-3.5 bg-neutral-900/95 border-b border-neutral-800 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{tier.badge}</span>
              <span className="text-xs font-bold text-white">{tier.level}</span>
            </div>
            <span className="text-[11px] font-mono text-amber-400 font-semibold">
              {stars} / {tier.nextLevelStars} Stars
            </span>
          </div>

          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${tier.progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {tier.tier.description}. Stars never reset if a day is missed! Message and share moments to level up.
          </p>
        </div>
      )}

      {/* Message history */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 text-xs">
            <Sparkles className="w-8 h-8 text-amber-400/50 mx-auto mb-2" />
            <p className="font-semibold text-neutral-300">Start of your private conversation</p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Every message earns +2 Friendship Stars ⭐
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Shared Hype Card */}
                {msg.sharedHypeId && msg.sharedHypeData && (
                  <div
                    onClick={() => onWatchHype && onWatchHype(msg.sharedHypeId!)}
                    className="cursor-pointer max-w-[240px] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 mb-1 hover:border-purple-500 transition-colors shadow-lg"
                  >
                    <div
                      className={`h-36 bg-gradient-to-br ${msg.sharedHypeData.posterGradient} flex flex-col justify-between p-3 relative`}
                    >
                      <div className="inline-flex items-center gap-1 text-[10px] font-mono text-white bg-black/60 px-2 py-0.5 rounded-full w-fit">
                        <Film className="w-3 h-3 text-purple-400" />
                        <span>Shared Hype</span>
                      </div>
                      <div className="text-center text-white/80">
                        <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center mx-auto mb-1">
                          ▶
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="text-[11px] font-bold text-white">
                        @{msg.sharedHypeData.creatorUsername}
                      </div>
                      <div className="text-[10px] text-neutral-400 line-clamp-2 mt-0.5">
                        {msg.sharedHypeData.caption}
                      </div>
                    </div>
                  </div>
                )}

                {/* Media preview (image/video) */}
                {msg.mediaUrl && (
                  <div className="max-w-[240px] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 mb-1">
                    {msg.mediaType === 'video' ? (
                      <video src={msg.mediaUrl} controls className="w-full max-h-60 object-cover" />
                    ) : (
                      <img src={msg.mediaUrl} alt="Attached media" className="w-full max-h-60 object-cover" />
                    )}
                  </div>
                )}

                {/* Text bubble */}
                {msg.text && (
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-xs max-w-[78%] leading-relaxed break-words shadow-sm ${
                      isMe
                        ? 'bg-[#7c3aed] text-white font-medium rounded-br-xs'
                        : 'bg-neutral-900 text-white rounded-bl-xs border border-neutral-800'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}

                {/* Timestamp & Status */}
                <div className="flex items-center gap-1 mt-1 text-[10px] text-neutral-500 font-mono px-1">
                  <span>{formatMessageTime(msg.createdAt)}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3 h-3 text-violet-300 inline" />
                      ) : (
                        <Check className="w-3 h-3 text-neutral-500 inline" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-black border-t border-neutral-900 flex items-center gap-2 pb-safe"
      >
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[44px] min-w-[40px] flex items-center justify-center text-neutral-400 hover:text-white"
        >
          <ImageIcon className="w-5 h-5" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            className="hidden"
          />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message... (+2 ⭐)"
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
        />

        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="w-10 h-10 rounded-xl bg-[#7c3aed] hover:bg-violet-600 disabled:opacity-40 text-white font-bold flex items-center justify-center shrink-0 transition-colors shadow-md shadow-purple-950/50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
