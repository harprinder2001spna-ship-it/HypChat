import React, { useState, useEffect } from 'react';
import { X, Send, Heart, Trash2, Flag } from 'lucide-react';
import { Comment } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CommentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  hypeId: string;
  onCommentCountChange?: (count: number) => void;
  onOpenReport?: (type: 'comment', id: string) => void;
}

export const CommentSheet: React.FC<CommentSheetProps> = ({
  isOpen,
  onClose,
  hypeId,
  onCommentCountChange,
  onOpenReport
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && hypeId) {
      loadComments();
    }
  }, [isOpen, hypeId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const list = await api.getComments(hypeId);
      setComments(list);
      if (onCommentCountChange) onCommentCountChange(list.length);
    } catch {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inputText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const newComment = await api.addComment(hypeId, user.id, inputText.trim());
      const updated = [...comments, newComment];
      setComments(updated);
      setInputText('');
      setReplyingToId(null);
      if (onCommentCountChange) onCommentCountChange(updated.length);
    } catch {
      // error handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    try {
      await api.deleteComment(commentId, user.id);
      const updated = comments.filter(c => c.id !== commentId);
      setComments(updated);
      if (onCommentCountChange) onCommentCountChange(updated.length);
    } catch {
      // error handled
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const deltaMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(deltaMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl flex flex-col max-h-[75vh] shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Grab Handle & Header */}
        <div className="pt-3 pb-2 px-4 border-b border-slate-800/80">
          <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-2" />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Comments ({comments.length})
            </h3>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No comments yet. Start the conversation!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 text-left">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full bg-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      @{comment.user.username}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formatTimestamp(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed break-words">
                    {comment.text}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                    <button
                      onClick={() => setReplyingToId(comment.id)}
                      className="hover:text-white font-medium"
                    >
                      Reply
                    </button>
                    {user?.id === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="hover:text-rose-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                    {user?.id !== comment.userId && onOpenReport && (
                      <button
                        onClick={() => onOpenReport('comment', comment.id)}
                        className="hover:text-amber-400 flex items-center gap-1"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Report</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                  <button className="text-slate-400 hover:text-rose-500 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {comment.likesCount || 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input box */}
        <form
          onSubmit={handlePostComment}
          className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2 pb-safe"
        >
          {user ? (
            <>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={replyingToId ? 'Write a reply...' : 'Add a thoughtful comment...'}
                className="flex-1 bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSubmitting}
                className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-slate-950 flex items-center justify-center shrink-0 transition-colors font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="w-full py-2 text-center text-xs text-slate-400">
              Please sign in to leave a comment.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
