import React from 'react';
import { Bell, Search, Radio } from 'lucide-react';
import { HypChatLogo } from '../Common/HypChatLogo';

interface TopNavBarProps {
  activeView?: 'feed' | 'hype';
  onChangeView?: (view: 'feed' | 'hype') => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeView,
  onChangeView,
  onOpenSearch,
  onOpenNotifications,
  unreadNotificationsCount
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-black/90 backdrop-blur-xl border-b border-neutral-900 px-4 py-2.5 flex items-center justify-between select-none">
      {/* Brand Zone: Original HypChat Logo & Wordmark */}
      <div className="flex items-center gap-3">
        <HypChatLogo size="sm" variant="full" />
      </div>

      {/* Center Feed vs Hype Segmented Switcher (Shown when on discovery tab) */}
      {activeView && onChangeView && (
        <div className="flex items-center bg-neutral-900/90 p-1 rounded-full border border-neutral-800">
          <button
            onClick={() => onChangeView('feed')}
            className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
              activeView === 'feed'
                ? 'bg-[#7c3aed] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => onChangeView('hype')}
            className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
              activeView === 'hype'
                ? 'bg-[#7c3aed] text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Hype
          </button>
        </div>
      )}

      {/* Action Zone: Search & Notifications */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenSearch}
          aria-label="Global Search"
          className="w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-white rounded-full hover:bg-neutral-800/80 transition-colors"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={onOpenNotifications}
          aria-label="Notifications"
          className="w-9 h-9 flex items-center justify-center text-neutral-300 hover:text-white rounded-full hover:bg-neutral-800/80 transition-colors relative"
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-400 rounded-full ring-2 ring-black" />
          )}
        </button>
      </div>
    </header>
  );
};
