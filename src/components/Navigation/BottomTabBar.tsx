import React from 'react';
import { Film, MessageSquare, Users, User, Camera } from 'lucide-react';

export type TabType = 'hype' | 'chat' | 'friends' | 'profile';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenCamera: () => void;
  unreadMessagesCount: number;
  pendingRequestsCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  onOpenCamera,
  unreadMessagesCount,
  pendingRequestsCount
}) => {
  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-neutral-900 px-3 pb-safe select-none"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 relative">
        {/* Hype Tab */}
        <button
          onClick={() => onTabChange('hype')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors relative ${
            activeTab === 'hype' ? 'text-[#8b5cf6]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Film className={`w-5 h-5 transition-transform ${activeTab === 'hype' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-bold tracking-wider mt-1">Hype</span>
          {activeTab === 'hype' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#8b5cf6]" />
          )}
        </button>

        {/* Chat Tab */}
        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors relative ${
            activeTab === 'chat' ? 'text-[#8b5cf6]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 transition-transform ${activeTab === 'chat' ? 'scale-110' : ''}`} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-[#8b5cf6] text-white text-[10px] font-bold rounded-full min-w-[16px] text-center shadow-sm">
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wider mt-1">Chat</span>
          {activeTab === 'chat' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#8b5cf6]" />
          )}
        </button>

        {/* Prominent Center Camera Button */}
        <div className="flex items-center justify-center px-2">
          <button
            onClick={onOpenCamera}
            aria-label="Open Camera"
            className="w-13 h-13 rounded-full bg-[#7c3aed] hover:bg-violet-600 flex items-center justify-center shadow-xl shadow-purple-950/60 text-white transform active:scale-95 transition-all focus:outline-none ring-2 ring-violet-900/60"
          >
            <Camera className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        {/* Friends Tab */}
        <button
          onClick={() => onTabChange('friends')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors relative ${
            activeTab === 'friends' ? 'text-[#8b5cf6]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 transition-transform ${activeTab === 'friends' ? 'scale-110' : ''}`} />
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-purple-500 text-white text-[10px] font-bold rounded-full min-w-[16px] text-center">
                {pendingRequestsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wider mt-1">Friends</span>
          {activeTab === 'friends' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#8b5cf6]" />
          )}
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-colors relative ${
            activeTab === 'profile' ? 'text-[#8b5cf6]' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110' : ''}`} />
          <span className="text-[10px] font-bold tracking-wider mt-1">Profile</span>
          {activeTab === 'profile' && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#8b5cf6]" />
          )}
        </button>
      </div>
    </nav>
  );
};
