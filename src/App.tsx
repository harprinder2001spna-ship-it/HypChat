import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BottomTabBar, TabType } from './components/Navigation/BottomTabBar';
import { TopNavBar } from './components/Navigation/TopNavBar';
import { HypeFeed } from './components/Hype/HypeFeed';
import { CreateHypeModal } from './components/Hype/CreateHypeModal';
import { CameraView } from './components/Camera/CameraView';
import { StoryViewerModal } from './components/Stories/StoryViewerModal';
import { ConversationList } from './components/Chat/ConversationList';
import { ChatRoom } from './components/Chat/ChatRoom';
import { FriendsManager } from './components/Friends/FriendsManager';
import { ProfileView } from './components/Profile/ProfileView';
import { AuthModal } from './components/Auth/AuthModal';
import { GlobalSearchModal } from './components/Search/GlobalSearchModal';
import { NotificationsModal } from './components/Notifications/NotificationsModal';
import { ReportModal } from './components/Common/ReportModal';
import { HypChatLogo } from './components/Common/HypChatLogo';
import { Conversation, User, HypeVideo, Story } from './types';
import { api } from './services/api';

function MainApp() {
  const { user, isLoading } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('hype');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);

  // Modals & Camera
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCreateHypeOpen, setIsCreateHypeOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [reportState, setReportState] = useState<{
    isOpen: boolean;
    targetType: 'user' | 'hype' | 'comment';
    targetId: string;
  }>({
    isOpen: false,
    targetType: 'user',
    targetId: ''
  });

  // Badge counters
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  // Poll badges and stories periodically
  useEffect(() => {
    if (!user) return;
    refreshBadges();
    refreshStories();
    const interval = setInterval(() => {
      refreshBadges();
      refreshStories();
    }, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const refreshStories = async () => {
    try {
      const list = await api.getStories();
      setStories(list);
    } catch {
      // non-blocking
    }
  };

  const refreshBadges = async () => {
    if (!user) return;
    try {
      const [convs, reqs, notifs] = await Promise.all([
        api.getConversations(user.id),
        api.getFriendRequests(user.id),
        api.getNotifications(user.id)
      ]);

      const totalUnreadMsgs = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadMessagesCount(totalUnreadMsgs);
      setPendingRequestsCount(reqs.length);
      setUnreadNotifsCount(notifs.filter((n) => !n.isRead).length);
    } catch {
      // non-blocking
    }
  };

  const handleStartChatWithUser = async (targetUser: User) => {
    if (!user) return;
    try {
      const conv = await api.startConversation(user.id, targetUser.id);
      setActiveConversation({
        ...conv,
        otherUser: targetUser,
        unreadCount: 0,
        starsInfo: {
          friendId: targetUser.id,
          friendUsername: targetUser.username,
          friendName: targetUser.name,
          friendAvatar: targetUser.avatar,
          stars: 0,
          level: 'New Connection',
          levelStars: 1,
          nextLevelStars: 50,
          progressPercent: 0,
          totalInteractions: 0,
          lastInteractionAt: new Date().toISOString()
        }
      });
      setActiveTab('chat');
      setViewingProfileUserId(null);
    } catch {
      // error handled
    }
  };

  const handleOpenReport = (type: 'user' | 'hype' | 'comment', id: string) => {
    setReportState({
      isOpen: true,
      targetType: type,
      targetId: id
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 select-none">
        <HypChatLogo size="lg" className="mb-4" />
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-600/30 selection:text-purple-200">
      {/* Top Navigation Bar */}
      <TopNavBar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotifsCount}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-md mx-auto overflow-hidden relative">
        {activeTab === 'hype' && (
          <HypeFeed
            stories={stories}
            onOpenStory={(idx) => setActiveStoryIndex(idx)}
            onOpenCreateStory={() => setIsCameraOpen(true)}
            onOpenCreatorProfile={(creatorId) => setViewingProfileUserId(creatorId)}
            onOpenReport={handleOpenReport}
          />
        )}

        {activeTab === 'chat' && (
          activeConversation ? (
            <ChatRoom
              conversation={activeConversation}
              onBack={() => setActiveConversation(null)}
              onOpenProfile={(otherId) => setViewingProfileUserId(otherId)}
              onOpenReport={(type, id) => handleOpenReport(type, id)}
              onWatchHype={(hypeId) => {
                setActiveTab('hype');
                setActiveConversation(null);
              }}
            />
          ) : (
            <ConversationList
              stories={stories}
              onOpenStory={(idx) => setActiveStoryIndex(idx)}
              onOpenCreateStory={() => setIsCameraOpen(true)}
              onSelectConversation={(conv) => setActiveConversation(conv)}
              onOpenFriends={() => setActiveTab('friends')}
            />
          )
        )}

        {activeTab === 'friends' && (
          <FriendsManager
            onStartChatWithFriend={(friendUser) => handleStartChatWithUser(friendUser)}
            onOpenProfile={(friendId) => setViewingProfileUserId(friendId)}
            onRequestAccepted={() => {
              refreshBadges();
              refreshStories();
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            onStartChat={handleStartChatWithUser}
            onOpenReport={handleOpenReport}
          />
        )}
      </main>

      {/* Fixed Bottom Tab Bar with Prominent Center Camera Button */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'chat') {
            setActiveConversation(null);
          }
        }}
        onOpenCamera={() => setIsCameraOpen(true)}
        unreadMessagesCount={unreadMessagesCount}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* Real Fullscreen Camera Experience */}
      <CameraView
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onStoryPosted={() => {
          refreshStories();
          refreshBadges();
        }}
        onHypePosted={() => {
          setActiveTab('hype');
          refreshBadges();
        }}
        onPostCreated={() => {
          refreshBadges();
        }}
        onSendToChat={(targetUser) => {
          handleStartChatWithUser(targetUser);
        }}
      />

      {/* Fullscreen Story Viewer Modal */}
      {activeStoryIndex !== null && stories.length > 0 && (
        <StoryViewerModal
          isOpen={activeStoryIndex !== null}
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
          onStoryDeleted={() => {
            refreshStories();
          }}
          onOpenChatWithUser={(targetUser) => {
            setActiveStoryIndex(null);
            handleStartChatWithUser(targetUser);
          }}
        />
      )}

      {/* Other User Profile Overlay Sheet */}
      {viewingProfileUserId && (
        <div className="fixed inset-0 z-50 bg-slate-950 max-w-md mx-auto flex flex-col animate-in slide-in-from-right duration-200">
          <ProfileView
            userId={viewingProfileUserId}
            onClose={() => setViewingProfileUserId(null)}
            onStartChat={handleStartChatWithUser}
            onOpenReport={handleOpenReport}
          />
        </div>
      )}

      {/* Create Hype Video Studio Modal */}
      <CreateHypeModal
        isOpen={isCreateHypeOpen}
        onClose={() => setIsCreateHypeOpen(false)}
        onHypeCreated={() => {
          setActiveTab('hype');
          refreshBadges();
        }}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectUser={(userId) => {
          setViewingProfileUserId(userId);
        }}
        onSelectHype={(hype) => {
          setActiveTab('hype');
        }}
        onSelectSound={(soundId) => {
          setIsCreateHypeOpen(true);
        }}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onOpenUser={(userId) => setViewingProfileUserId(userId)}
        onOpenChat={() => setActiveTab('chat')}
        onOpenFriends={() => setActiveTab('friends')}
        onNotificationsRead={() => setUnreadNotifsCount(0)}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportState.isOpen}
        onClose={() => setReportState({ ...reportState, isOpen: false })}
        targetType={reportState.targetType}
        targetId={reportState.targetId}
      />

      {/* Auth Modal (if user logs out or needs to sign up) */}
      <AuthModal isOpen={!user} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
