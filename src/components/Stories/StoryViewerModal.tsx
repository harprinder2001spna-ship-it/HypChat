import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Eye,
  Trash2,
  Heart,
  Flame,
  Star,
  Sparkles,
  Music,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Story, User } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface StoryViewerModalProps {
  isOpen: boolean;
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
  onStoryDeleted?: () => void;
  onOpenChatWithUser?: (user: User) => void;
}

const REACTIONS = ['❤️', '🔥', '👏', '😮', '😂', '⭐'];

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  isOpen,
  stories,
  initialIndex = 0,
  onClose,
  onStoryDeleted,
  onOpenChatWithUser
}) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showViewersList, setShowViewersList] = useState(false);
  const [reactionToast, setReactionToast] = useState<string | null>(null);

  const activeStory = stories[currentIndex];
  const isOwnStory = activeStory?.userId === user?.id;

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen || !activeStory) return;

    // Record view
    if (user && activeStory.userId !== user.id) {
      api.recordStoryView(activeStory.id, user.id);
    }

    setProgress(0);
    const interval = window.setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNextStory();
            return 0;
          }
          return prev + 2; // ~5 seconds total
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentIndex, isPaused, activeStory]);

  const handleNextStory = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeStory || !replyText.trim()) return;

    const textToSend = `Replied to story: "${replyText.trim()}"`;
    setReplyText('');

    try {
      const conv = await api.startConversation(user.id, activeStory.userId);
      await api.sendMessage({
        conversationId: conv.id,
        senderId: user.id,
        receiverId: activeStory.userId,
        text: textToSend,
        mediaUrl: activeStory.mediaUrl,
        mediaType: activeStory.mediaType
      });
      setReactionToast('Reply sent!');
      setTimeout(() => setReactionToast(null), 2000);
    } catch {
      // error handled
    }
  };

  const handleSendReaction = async (emoji: string) => {
    if (!user || !activeStory) return;
    try {
      await api.reactToStory(activeStory.id, user.id, emoji);
      setReactionToast(`Reacted ${emoji}`);
      setTimeout(() => setReactionToast(null), 1500);
    } catch {
      // error handled
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteStory = async () => {
    if (!user || !activeStory || !isOwnStory) return;
    try {
      await api.deleteStory(activeStory.id, user.id);
      setShowDeleteConfirm(false);
      if (onStoryDeleted) onStoryDeleted();
      if (stories.length <= 1) {
        onClose();
      } else {
        handleNextStory();
      }
    } catch {
      setShowDeleteConfirm(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h`;
  };

  if (!isOpen || !activeStory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none">
      <div
        className="w-full max-w-md h-full flex flex-col bg-black text-white relative overflow-hidden"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-safe flex gap-1.5 bg-gradient-to-b from-black/80 to-transparent">
          {stories.map((story, i) => (
            <div
              key={story.id}
              className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width:
                    i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Creator Info Bar */}
        <div className="absolute top-6 left-0 right-0 z-30 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={activeStory.user.avatar}
              alt={activeStory.user.name}
              className="w-9 h-9 rounded-full bg-neutral-800 object-cover border border-neutral-700"
            />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>@{activeStory.user.username}</span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  · {formatTimeAgo(activeStory.createdAt)}
                </span>
              </div>
              {activeStory.soundTitle && (
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <Music className="w-2.5 h-2.5 text-[#ff1e42]" />
                  <span className="truncate max-w-[140px]">{activeStory.soundTitle}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOwnStory && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-neutral-400 hover:text-red-400 transition-colors"
                title="Delete Story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 max-w-xs w-full text-center space-y-3">
              <Trash2 className="w-8 h-8 text-[#ff1e42] mx-auto" />
              <h3 className="text-sm font-bold text-white">Delete your story?</h3>
              <p className="text-xs text-neutral-400">This story will be removed permanently from your profile and feed.</p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStory}
                  className="flex-1 py-2 rounded-xl bg-[#ff1e42] text-xs font-bold text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Story Media Center */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {activeStory.mediaType === 'image' ? (
            <img
              src={activeStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={activeStory.mediaUrl}
              autoPlay
              loop
              muted={false}
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {/* On-screen Text Overlay */}
          {activeStory.textOverlay && (
            <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
              <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-lg font-extrabold text-white text-center border border-white/20 shadow-2xl">
                {activeStory.textOverlay}
              </span>
            </div>
          )}

          {/* Left/Right Tap Navigation Zones */}
          <div
            onClick={handlePrevStory}
            className="absolute left-0 top-16 bottom-24 w-1/3 z-20 cursor-pointer"
          />
          <div
            onClick={handleNextStory}
            className="absolute right-0 top-16 bottom-24 w-1/3 z-20 cursor-pointer"
          />

          {/* Reaction toast popup */}
          {reactionToast && (
            <div className="absolute bottom-28 z-40 px-4 py-2 bg-black/80 backdrop-blur-md border border-neutral-700 rounded-full text-xs font-bold text-white shadow-2xl animate-in zoom-in-95">
              {reactionToast}
            </div>
          )}
        </div>

        {/* Caption bar if present */}
        {activeStory.caption && (
          <div className="absolute bottom-20 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black via-black/60 to-transparent">
            <p className="text-xs text-white leading-relaxed line-clamp-2 drop-shadow">
              {activeStory.caption}
            </p>
          </div>
        )}

        {/* Bottom Interaction Bar */}
        <div className="relative z-30 p-3 pb-safe bg-gradient-to-t from-black via-black/90 to-transparent">
          {isOwnStory ? (
            /* Story Viewer List Drawer Trigger for Own Story */
            <button
              onClick={() => setShowViewersList(!showViewersList)}
              className="w-full py-2.5 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-white transition-colors"
            >
              <Eye className="w-4 h-4 text-[#ff1e42]" />
              <span>{activeStory.viewers?.length || 0} Story Views</span>
            </button>
          ) : (
            /* Reply & Emoji Reactions for Friends' Stories */
            <div className="space-y-2">
              {/* Quick Emojis */}
              <div className="flex justify-around px-2">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReaction(emoji)}
                    className="text-xl hover:scale-125 active:scale-95 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Reply message bar */}
              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to @${activeStory.user.username}...`}
                  className="flex-1 bg-neutral-900/80 border border-neutral-700/80 rounded-full px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff1e42]"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="w-10 h-10 rounded-full bg-[#ff1e42] hover:bg-red-600 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Viewers Bottom Drawer (When checking own story viewers) */}
        {showViewersList && isOwnStory && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col justify-end p-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-5 max-h-[60vh] flex flex-col">
              <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#ff1e42]" />
                  <h3 className="text-xs font-bold text-white">
                    Viewers ({activeStory.viewers?.length || 0})
                  </h3>
                </div>
                <button
                  onClick={() => setShowViewersList(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {(!activeStory.viewers || activeStory.viewers.length === 0) ? (
                  <div className="py-8 text-center text-xs text-neutral-500">
                    No views yet. Friends will see your story in their tray!
                  </div>
                ) : (
                  activeStory.viewers.map((viewer) => (
                    <div
                      key={viewer.userId}
                      className="flex items-center justify-between p-2 rounded-xl bg-neutral-800/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={viewer.avatar}
                          alt={viewer.username}
                          className="w-8 h-8 rounded-full bg-neutral-700 object-cover"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white">
                            @{viewer.username}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {formatTimeAgo(viewer.viewedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
