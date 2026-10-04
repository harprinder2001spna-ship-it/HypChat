import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  CheckCircle2,
  Sparkles,
  Check
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HypChatAppIcon } from '../Common/HypChatLogo';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUser: (userId: string) => void;
  onOpenChat?: () => void;
  onOpenFriends?: () => void;
  onNotificationsRead?: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenUser,
  onOpenChat,
  onOpenFriends,
  onNotificationsRead
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const list = await api.getNotifications(user.id);
      setNotifications(list);
    } catch {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await api.markNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onNotificationsRead) onNotificationsRead();
    } catch {
      // non-blocking
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-purple-400" />;
      case 'friend_request':
      case 'friend_accepted':
        return <UserPlus className="w-3.5 h-3.5 text-amber-400" />;
      case 'share':
        return <Share2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'follow':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-purple-400" />;
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
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 flex flex-col max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HypChatAppIcon size="sm" />
            <h3 className="text-sm font-bold text-white tracking-tight">Notifications</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold px-2 py-1"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No new notifications right now.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.type === 'friend_request' && onOpenFriends) {
                    onOpenFriends();
                    onClose();
                  } else if (notif.type === 'message' && onOpenChat) {
                    onOpenChat();
                    onClose();
                  } else if (notif.actorId) {
                    onOpenUser(notif.actorId);
                    onClose();
                  }
                }}
                className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all text-left ${
                  !notif.isRead
                    ? 'bg-purple-950/20 border-purple-500/30'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={notif.actor.avatar}
                    alt={notif.actor.name}
                    className="w-10 h-10 rounded-full bg-slate-800 object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                    {getNotifIcon(notif.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatTimestamp(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {notif.content}
                  </p>
                </div>

                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0 shadow-sm shadow-purple-400" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
