export type FriendshipLevel =
  | 'New Connection'
  | 'Good Friends'
  | 'Close Friends'
  | 'Best Friends'
  | 'Inner Circle';

export type AiCharacterStyle = 'Realistic' | 'Anime' | 'Artistic' | '3D' | 'Cyber' | 'Minimal';

export interface AiCharacterData {
  imageUrl: string;
  style: AiCharacterStyle;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  originalAvatar?: string;
  aiAvatar?: AiCharacterData;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  isPrivate?: boolean;
  createdAt: string;
}

export interface FriendshipStarInfo {
  friendId: string;
  friendUsername: string;
  friendName: string;
  friendAvatar: string;
  stars: number;
  level: FriendshipLevel;
  levelStars: number; // 1 to 5
  nextLevelStars: number;
  progressPercent: number;
  totalInteractions: number;
  lastInteractionAt: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  sender: User;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
}

export interface Sound {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  genre: string;
  useCount: number;
  audioKey: string; // sound preset identifier for audio engine
  color: string;
}

export interface HypeVideo {
  id: string;
  creatorId: string;
  creator: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  videoUrl: string;
  posterGradient: string;
  videoTheme: 'dance' | 'synth' | 'nature' | 'art' | 'skate' | 'nightcity' | 'custom';
  caption: string;
  hashtags: string[];
  soundId?: string;
  soundTitle?: string;
  soundArtist?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  savesCount: number;
  viewsCount: number;
  privacy: 'public' | 'friends';
  filter?: string;
  createdAt: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowingCreator?: boolean;
}

export interface Comment {
  id: string;
  hypeId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  replies?: CommentReply[];
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  text: string;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  sharedHypeId?: string;
  sharedHypeData?: {
    id: string;
    caption: string;
    creatorUsername: string;
    posterGradient: string;
  };
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
  stars?: number;
  starsInfo: FriendshipStarInfo;
  updatedAt: string;
}

export interface Story {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  textOverlay?: string;
  soundTitle?: string;
  filter?: string;
  createdAt: string;
  expiresAt: string;
  viewers: {
    userId: string;
    username: string;
    avatar: string;
    viewedAt: string;
  }[];
  reactions: {
    userId: string;
    username: string;
    emoji: string;
    createdAt: string;
  }[];
  isViewed?: boolean;
}

export interface SocialPost {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  hashtags: string[];
  soundTitle?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  actorId: string;
  actor: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  type:
    | 'friend_request'
    | 'friend_accepted'
    | 'message'
    | 'like'
    | 'comment'
    | 'follow'
    | 'share'
    | 'story_reaction'
    | 'story_reply';
  title: string;
  content: string;
  targetId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ReportPayload {
  targetType: 'user' | 'hype' | 'comment';
  targetId: string;
  reason: string;
  details?: string;
}
