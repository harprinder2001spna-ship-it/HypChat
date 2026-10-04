import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
  UserPlus,
  UserCheck,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Flag,
  UserX,
  Film
} from 'lucide-react';
import { HypeVideo, Sound } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CommentSheet } from './CommentSheet';
import { ShareHypeModal } from './ShareHypeModal';
import { SoundDetailModal } from '../Sound/SoundDetailModal';
import { audioEngine } from '../../utils/audioEngine';
import { StoriesTray } from '../Stories/StoriesTray';
import { Story } from '../../types';
import { HypChatAppIcon } from '../Common/HypChatLogo';

interface HypeFeedProps {
  onOpenCreatorProfile: (userId: string) => void;
  onOpenReport: (targetType: 'hype' | 'user', targetId: string) => void;
  stories?: Story[];
  onOpenStory?: (index: number) => void;
  onOpenCreateStory?: () => void;
}

export const HypeFeed: React.FC<HypeFeedProps> = ({
  onOpenCreatorProfile,
  onOpenReport,
  stories,
  onOpenStory,
  onOpenCreateStory
}) => {
  const { user } = useAuth();

  // Active sub-feed tab
  const [activeFeed, setActiveFeed] = useState<'foryou' | 'following' | 'trending' | 'new'>('foryou');
  const [hypes, setHypes] = useState<HypeVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Playback states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Modals & Bottom Sheets
  const [commentHypeId, setCommentHypeId] = useState<string | null>(null);
  const [shareHype, setShareHype] = useState<HypeVideo | null>(null);
  const [selectedSoundId, setSelectedSoundId] = useState<string | null>(null);
  const [activeOptionsMenuId, setActiveOptionsMenuId] = useState<string | null>(null);

  // Heart burst animation
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  // Touch swipe handling
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFeed();
  }, [activeFeed, user]);

  // Handle audio and progress for active video
  useEffect(() => {
    if (hypes.length === 0 || currentIndex >= hypes.length) return;
    const currentHype = hypes[currentIndex];

    // Record view
    api.recordView(currentHype.id);

    // Audio sync if soundId exists
    if (currentHype.soundId && !isMuted && isPlaying) {
      const soundKey = currentHype.soundId.includes('1') ? 'synthwave_pulse'
        : currentHype.soundId.includes('2') ? 'lofi_midnight'
        : currentHype.soundId.includes('3') ? 'trap_hype_808'
        : 'cyber_funk';
      audioEngine.playSound(soundKey, currentHype.soundId);
    } else {
      audioEngine.stop();
    }

    // Reset progress loop
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 150);

    return () => {
      clearInterval(interval);
      audioEngine.stop();
    };
  }, [currentIndex, hypes, isMuted, isPlaying]);

  const loadFeed = async () => {
    try {
      setIsLoading(true);
      const list = await api.getHypes({
        feed: activeFeed,
        currentUserId: user?.id
      });
      setHypes(list);
      setCurrentIndex(0);
    } catch {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextVideo = () => {
    if (currentIndex < hypes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    }
  };

  const handlePrevVideo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    if (diff > 50) {
      handleNextVideo();
    } else if (diff < -50) {
      handlePrevVideo();
    }
    touchStartY.current = null;
  };

  const handleToggleLike = async (hype: HypeVideo) => {
    if (!user) return;
    try {
      const res = await api.toggleLike(hype.id, user.id);
      setHypes((prev) =>
        prev.map((h) =>
          h.id === hype.id ? { ...h, isLiked: res.isLiked, likesCount: res.likesCount } : h
        )
      );
      if (res.isLiked) {
        setShowHeartBurst(true);
        setTimeout(() => setShowHeartBurst(false), 800);
      }
    } catch {
      // error handled
    }
  };

  const handleToggleSave = async (hype: HypeVideo) => {
    if (!user) return;
    try {
      const res = await api.toggleSave(hype.id, user.id);
      setHypes((prev) =>
        prev.map((h) =>
          h.id === hype.id ? { ...h, isSaved: res.isSaved, savesCount: res.savesCount } : h
        )
      );
    } catch {
      // error handled
    }
  };

  const handleToggleFollow = async (creatorId: string) => {
    if (!user) return;
    try {
      const res = await api.toggleFollow(creatorId, user.id);
      setHypes((prev) =>
        prev.map((h) =>
          h.creatorId === creatorId ? { ...h, isFollowingCreator: res.isFollowing } : h
        )
      );
    } catch {
      // error handled
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
    if (!isMuted) {
      audioEngine.stop();
    }
  };

  const currentHype = hypes[currentIndex];

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[calc(100vh-4rem-3.5rem)] max-w-md mx-auto overflow-hidden bg-black select-none"
    >
      {/* Top Floating Stories Tray */}
      {stories && stories.length > 0 && (
        <div className="absolute top-2 left-3 right-3 z-30 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-md border border-neutral-800/90 rounded-2xl py-1 px-2 shadow-2xl">
            <StoriesTray
              compact
              stories={stories}
              onOpenStory={onOpenStory || (() => {})}
              onOpenCreateStory={onOpenCreateStory || (() => {})}
            />
          </div>
        </div>
      )}

      {/* Feed Sub-navigation tabs: For You, Following, Trending, New */}
      <div className={`absolute ${stories && stories.length > 0 ? 'top-19' : 'top-2'} left-0 right-0 z-20 flex justify-center items-center pointer-events-auto transition-all`}>
        <div className="flex items-center gap-1.5 p-1 bg-black/70 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-lg px-2">
          <HypChatAppIcon size="xs" />
          <div className="w-[1px] h-3.5 bg-neutral-800 mx-0.5" />
          {(
            [
              { key: 'foryou', label: 'For You' },
              { key: 'following', label: 'Following' },
              { key: 'trending', label: 'Trending' },
              { key: 'new', label: 'New' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFeed(tab.key)}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                activeFeed === tab.key
                  ? 'bg-[#7c3aed] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-xs">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-2" />
          <span>Discovering Hypes...</span>
        </div>
      ) : hypes.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400">
          <Film className="w-12 h-12 text-neutral-700 mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No Hypes found in this feed</h3>
          <p className="text-xs text-neutral-500 max-w-xs mb-4">
            {activeFeed === 'following'
              ? 'Follow creators to see their video drops here!'
              : 'Be the first creator to drop a Hype!'}
          </p>
          <button
            onClick={() => setActiveFeed('foryou')}
            className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl"
          >
            Explore For You Feed
          </button>
        </div>
      ) : (
        /* Active Video Card */
        <div
          onClick={() => setIsPlaying(!isPlaying)}
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
        >
          {/* Background Canvas / Video display */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              currentHype.posterGradient || 'from-neutral-900 to-black'
            } transition-all duration-300 flex items-center justify-center`}
          >
            {/* If a real uploaded video exists, play it */}
            {currentHype.videoUrl ? (
              <video
                src={currentHype.videoUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              /* Atmospheric dynamic visual canvas animation */
              <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute w-72 h-72 rounded-full bg-purple-600/15 blur-3xl animate-pulse" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-md border border-neutral-700 flex items-center justify-center text-white/90 shadow-2xl">
                    <Play className="w-8 h-8 text-purple-400 fill-purple-400 ml-1" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-widest text-white/60">
                    HYP VIDEO REEL
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Heart double-tap burst effect */}
          {showHeartBurst && (
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
              <Heart className="w-28 h-28 text-purple-400 fill-purple-400 drop-shadow-2xl" />
            </div>
          )}

          {/* Top Scrim and audio mute toggle */}
          <div className="absolute top-14 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
            <div className="text-[11px] font-mono text-white/80 bg-black/50 px-2.5 py-0.5 rounded-full backdrop-blur-sm border border-neutral-800">
              {currentIndex + 1} / {hypes.length}
            </div>

            <button
              onClick={handleToggleMute}
              className="pointer-events-auto min-h-[44px] min-w-[44px] flex items-center justify-center text-white bg-black/50 backdrop-blur-md rounded-full hover:bg-neutral-900 border border-neutral-800 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
            </button>
          </div>

          {/* Right Action Sidebar (Like, Comment, Share, Save, More) */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4 text-white"
          >
            {/* Creator avatar with follow "+" badge */}
            <div className="relative mb-1">
              <button
                onClick={() => onOpenCreatorProfile(currentHype.creatorId)}
                className="w-12 h-12 rounded-full border-2 border-purple-500 overflow-hidden bg-neutral-900 shadow-lg active:scale-95 transition-transform"
              >
                <img
                  src={currentHype.creator.avatar}
                  alt={currentHype.creator.name}
                  className="w-full h-full object-cover"
                />
              </button>

              {user && user.id !== currentHype.creatorId && (
                <button
                  onClick={() => handleToggleFollow(currentHype.creatorId)}
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md transition-all ${
                    currentHype.isFollowingCreator
                      ? 'bg-neutral-900 text-emerald-400 border border-emerald-500/50'
                      : 'bg-[#7c3aed] text-white'
                  }`}
                >
                  {currentHype.isFollowingCreator ? '✓' : '+'}
                </button>
              )}
            </div>

            {/* Like button */}
            <button
              onClick={() => handleToggleLike(currentHype)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:bg-neutral-900/60 transition-transform active:scale-80 ${
                  currentHype.isLiked ? 'text-purple-400' : 'text-white'
                }`}
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    currentHype.isLiked ? 'fill-purple-400' : ''
                  }`}
                />
              </div>
              <span className="text-[11px] font-bold font-mono tracking-tight drop-shadow">
                {currentHype.likesCount}
              </span>
            </button>

            {/* Comment button */}
            <button
              onClick={() => setCommentHypeId(currentHype.id)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:bg-neutral-900/60 transition-transform active:scale-80">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-bold font-mono tracking-tight drop-shadow">
                {currentHype.commentsCount}
              </span>
            </button>

            {/* Share button (Earns +5 Friendship Stars) */}
            <button
              onClick={() => setShareHype(currentHype)}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:bg-neutral-900/60 transition-transform active:scale-80">
                <Share2 className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[11px] font-bold font-mono tracking-tight drop-shadow">
                {currentHype.sharesCount}
              </span>
            </button>

            {/* Save button */}
            <button
              onClick={() => handleToggleSave(currentHype)}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md group-hover:bg-neutral-900/60 transition-transform active:scale-80 ${
                  currentHype.isSaved ? 'text-amber-400' : 'text-white'
                }`}
              >
                <Bookmark
                  className={`w-5 h-5 transition-colors ${
                    currentHype.isSaved ? 'fill-amber-400' : ''
                  }`}
                />
              </div>
              <span className="text-[11px] font-bold font-mono tracking-tight drop-shadow">
                {currentHype.savesCount}
              </span>
            </button>

            {/* More Options / Report Menu */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveOptionsMenuId(
                    activeOptionsMenuId === currentHype.id ? null : currentHype.id
                  )
                }
                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md text-neutral-300 hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {activeOptionsMenuId === currentHype.id && (
                <div className="absolute right-0 bottom-full mb-2 w-40 bg-neutral-900 border border-neutral-700/80 rounded-2xl p-1.5 shadow-2xl z-30 text-left">
                  <button
                    onClick={() => {
                      setActiveOptionsMenuId(null);
                      onOpenReport('hype', currentHype.id);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-neutral-800 rounded-xl"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>Report Hype</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveOptionsMenuId(null);
                      onOpenReport('user', currentHype.creatorId);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-800 rounded-xl"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Block Creator</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Scrim & Creator Info */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto"
          >
            {/* Creator Username & privacy */}
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={() => onOpenCreatorProfile(currentHype.creatorId)}
                className="text-sm font-bold text-white hover:underline drop-shadow-md"
              >
                @{currentHype.creator.username}
              </button>
              {currentHype.privacy === 'friends' && (
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Friends Only
                </span>
              )}
            </div>

            {/* Caption & Hashtags */}
            <p className="text-xs text-neutral-200 max-w-[80%] leading-relaxed line-clamp-2 drop-shadow">
              {currentHype.caption}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {currentHype.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-semibold text-purple-400 drop-shadow"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Sound / Music Info pill */}
            {currentHype.soundTitle && (
              <button
                onClick={() => currentHype.soundId && setSelectedSoundId(currentHype.soundId)}
                className="mt-2.5 flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900/80 backdrop-blur-md border border-neutral-700/60 text-[11px] text-white hover:bg-neutral-800 transition-colors"
              >
                <Music className="w-3 h-3 text-purple-400 shrink-0" />
                <span className="max-w-[200px] truncate">
                  {currentHype.soundTitle} · {currentHype.soundArtist}
                </span>
              </button>
            )}

            {/* Video progress indicator line */}
            <div className="w-full h-1 bg-neutral-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-400 transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Vertical Navigation Chevrons */}
          <div className="absolute left-3 bottom-20 flex flex-col gap-2 z-20 pointer-events-auto">
            {currentIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevVideo();
                }}
                className="w-8 h-8 rounded-full bg-slate-950/40 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            )}
            {currentIndex < hypes.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextVideo();
                }}
                className="w-8 h-8 rounded-full bg-slate-950/40 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Comment Bottom Sheet */}
      {commentHypeId && (
        <CommentSheet
          isOpen={!!commentHypeId}
          onClose={() => setCommentHypeId(null)}
          hypeId={commentHypeId}
          onCommentCountChange={(count) => {
            setHypes((prev) =>
              prev.map((h) => (h.id === commentHypeId ? { ...h, commentsCount: count } : h))
            );
          }}
          onOpenReport={(type, id) => onOpenReport('hype', id)}
        />
      )}

      {/* Share Hype Modal */}
      {shareHype && (
        <ShareHypeModal
          isOpen={!!shareHype}
          onClose={() => setShareHype(null)}
          hype={shareHype}
          onShareComplete={() => {
            setHypes((prev) =>
              prev.map((h) =>
                h.id === shareHype.id ? { ...h, sharesCount: h.sharesCount + 1 } : h
              )
            );
          }}
        />
      )}

      {/* Sound Detail Modal */}
      {selectedSoundId && (
        <SoundDetailModal
          soundId={selectedSoundId}
          onClose={() => setSelectedSoundId(null)}
          onUseSound={() => {
            // Can trigger create hype with sound
          }}
          onSelectHype={(hype) => {
            const idx = hypes.findIndex((h) => h.id === hype.id);
            if (idx !== -1) setCurrentIndex(idx);
          }}
        />
      )}
    </div>
  );
};
