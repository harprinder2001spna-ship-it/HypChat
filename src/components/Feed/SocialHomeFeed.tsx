import React, { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
  UserPlus,
  Sparkles,
  Camera,
  Flame,
  Star,
  MoreVertical,
  Play
} from 'lucide-react';
import { SocialPost, Story, User, HypeVideo } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StoriesTray } from '../Stories/StoriesTray';
import { StoryViewerModal } from '../Stories/StoryViewerModal';
import { CommentSheet } from '../Hype/CommentSheet';
import { ShareHypeModal } from '../Hype/ShareHypeModal';

interface SocialHomeFeedProps {
  onOpenCamera: () => void;
  onOpenFriends: () => void;
  onOpenHypeFeed: () => void;
  onOpenUserProfile: (userId: string) => void;
  onSelectHypeVideo: (hype: HypeVideo) => void;
}

export const SocialHomeFeed: React.FC<SocialHomeFeedProps> = ({
  onOpenCamera,
  onOpenFriends,
  onOpenHypeFeed,
  onOpenUserProfile,
  onSelectHypeVideo
}) => {
  const { user } = useAuth();

  const [stories, setStories] = useState<Story[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [trendingHypes, setTrendingHypes] = useState<HypeVideo[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [sharePost, setSharePost] = useState<any | null>(null);

  useEffect(() => {
    loadHomeData();
  }, [user]);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      const [storiesRes, postsRes, hypesRes, usersRes] = await Promise.all([
        api.getStories(),
        api.getSocialPosts(),
        api.getHypes({ feed: 'trending' }),
        api.searchUsers('', user?.id)
      ]);

      setStories(storiesRes);
      setPosts(postsRes);
      setTrendingHypes(hypesRes.slice(0, 4));
      setSuggestedUsers(usersRes.slice(0, 5));
    } catch {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = async (post: SocialPost) => {
    if (!user) return;
    try {
      const res = await api.toggleSocialPostLike(post.id, user.id);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, isLiked: res.isLiked, likesCount: res.likesCount } : p
        )
      );
    } catch {
      // error handled
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) return;
    try {
      await api.sendFriendRequest(targetUserId, user.id);
      setSuggestedUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    } catch {
      // error
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-[calc(100vh-4rem-3.5rem)] flex flex-col bg-black text-white overflow-y-auto select-none">
      {/* 1. Stories Tray at Top */}
      <StoriesTray
        stories={stories}
        onOpenStory={(idx) => setActiveStoryIndex(idx)}
        onOpenCreateStory={onOpenCamera}
      />

      {/* 2. Quick Discovery Strip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-900 bg-neutral-950/40">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-[#ff1e42]" />
            <span>Camera</span>
          </button>

          <button
            onClick={onOpenFriends}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Stars</span>
          </button>
        </div>

        <button
          onClick={onOpenHypeFeed}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#ff1e42]/10 border border-[#ff1e42]/30 text-xs font-bold text-[#ff1e42] hover:bg-[#ff1e42]/20 transition-colors"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Hype Reels</span>
        </button>
      </div>

      {/* 3. Main Social Feed Posts */}
      <div className="p-4 space-y-6">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            <div className="w-6 h-6 border-2 border-[#ff1e42] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading social feed...</span>
          </div>
        ) : (
          <>
            {/* Suggested Connections Carousel (If present) */}
            {suggestedUsers.length > 0 && (
              <div className="p-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Suggested Friends</span>
                  </div>
                  <button
                    onClick={onOpenFriends}
                    className="text-[11px] font-semibold text-[#ff1e42] hover:underline"
                  >
                    See all
                  </button>
                </div>

                <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {suggestedUsers.map((su) => (
                    <div
                      key={su.id}
                      className="min-w-[130px] p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col items-center text-center"
                    >
                      <button onClick={() => onOpenUserProfile(su.id)}>
                        <img
                          src={su.avatar}
                          alt={su.name}
                          className="w-12 h-12 rounded-full bg-neutral-800 mb-1.5 object-cover"
                        />
                        <div className="text-xs font-bold text-white truncate max-w-[110px]">
                          {su.name}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate max-w-[110px]">
                          @{su.username}
                        </div>
                      </button>

                      <button
                        onClick={() => handleSendFriendRequest(su.id)}
                        className="mt-2 w-full py-1 bg-[#ff1e42] hover:bg-red-600 text-white font-bold text-[10px] rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Hypes Highlight Carousel */}
            {trendingHypes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Flame className="w-4 h-4 text-[#ff1e42]" />
                    <span>Trending on Hype</span>
                  </div>
                  <button
                    onClick={onOpenHypeFeed}
                    className="text-[11px] font-semibold text-neutral-400 hover:text-white"
                  >
                    Watch all →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {trendingHypes.map((hype) => (
                    <button
                      key={hype.id}
                      onClick={() => onSelectHypeVideo(hype)}
                      className="group relative aspect-[9/13] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 text-left hover:border-neutral-700 transition-colors"
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${hype.posterGradient} opacity-90`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                      <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-mono text-white bg-black/60 px-2 py-0.5 rounded-full">
                        <Flame className="w-3 h-3 text-[#ff1e42]" />
                        <span>{hype.viewsCount}</span>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <div className="text-[11px] font-bold text-white truncate">
                          @{hype.creator.username}
                        </div>
                        <div className="text-[10px] text-neutral-300 line-clamp-1 mt-0.5">
                          {hype.caption}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Social Posts Feed */}
            <div className="space-y-5 pt-2">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Recent Moments
              </h3>

              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-neutral-900/70 border border-neutral-800/80 rounded-3xl overflow-hidden shadow-lg"
                >
                  {/* Post Header */}
                  <div className="p-3.5 flex items-center justify-between">
                    <button
                      onClick={() => onOpenUserProfile(post.userId)}
                      className="flex items-center gap-2.5 text-left group"
                    >
                      <img
                        src={post.user.avatar}
                        alt={post.user.name}
                        className="w-10 h-10 rounded-full bg-neutral-800 object-cover border border-neutral-700 group-hover:border-[#ff1e42] transition-colors"
                      />
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-[#ff1e42] transition-colors">
                          {post.user.name}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          @{post.user.username}
                        </div>
                      </div>
                    </button>

                    <button className="text-neutral-400 hover:text-white p-1">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Media Content */}
                  <div className="relative aspect-square bg-neutral-950 flex items-center justify-center overflow-hidden">
                    {post.mediaType === 'video' ? (
                      <video
                        src={post.mediaUrl}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Actions & Metrics */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Like */}
                        <button
                          onClick={() => handleToggleLike(post)}
                          className="flex items-center gap-1.5 group"
                        >
                          <Heart
                            className={`w-5 h-5 transition-transform group-active:scale-125 ${
                              post.isLiked
                                ? 'text-[#ff1e42] fill-[#ff1e42]'
                                : 'text-neutral-300 hover:text-white'
                            }`}
                          />
                          <span className="text-xs font-bold font-mono text-white">
                            {post.likesCount}
                          </span>
                        </button>

                        {/* Comment */}
                        <button
                          onClick={() => setCommentPostId(post.id)}
                          className="flex items-center gap-1.5 text-neutral-300 hover:text-white"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-xs font-bold font-mono text-white">
                            {post.commentsCount}
                          </span>
                        </button>

                        {/* Share into Chat */}
                        <button
                          onClick={() => setSharePost(post)}
                          className="text-neutral-300 hover:text-amber-400"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>

                      <button className="text-neutral-400 hover:text-amber-400">
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Sound attribution */}
                    {post.soundTitle && (
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                        <Music className="w-3 h-3 text-[#ff1e42]" />
                        <span>{post.soundTitle}</span>
                      </div>
                    )}

                    {/* Caption & Hashtags */}
                    <div className="text-xs text-white leading-relaxed">
                      <span className="font-bold mr-1.5">@{post.user.username}</span>
                      <span>{post.caption}</span>
                    </div>

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {post.hashtags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-semibold text-[#ff1e42]"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          isOpen={activeStoryIndex !== null}
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
          onStoryDeleted={loadHomeData}
        />
      )}

      {/* Comments Sheet */}
      {commentPostId && (
        <CommentSheet
          isOpen={!!commentPostId}
          onClose={() => setCommentPostId(null)}
          hypeId={commentPostId}
        />
      )}

      {/* Share Modal */}
      {sharePost && (
        <ShareHypeModal
          isOpen={!!sharePost}
          onClose={() => setSharePost(null)}
          hype={{
            id: sharePost.id,
            creatorId: sharePost.userId,
            creator: sharePost.user,
            videoUrl: sharePost.mediaUrl,
            posterGradient: 'from-neutral-900 to-black',
            videoTheme: 'custom',
            caption: sharePost.caption,
            hashtags: sharePost.hashtags || [],
            likesCount: sharePost.likesCount,
            commentsCount: sharePost.commentsCount,
            sharesCount: sharePost.sharesCount || 0,
            savesCount: 0,
            viewsCount: 1,
            privacy: 'public',
            createdAt: sharePost.createdAt
          }}
        />
      )}
    </div>
  );
};
