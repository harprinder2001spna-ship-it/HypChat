import { FriendshipLevel, FriendshipStarInfo } from '../types';

export interface StarTier {
  min: number;
  max: number;
  level: FriendshipLevel;
  levelStars: number;
  badge: string;
  color: string;
  description: string;
}

export const STAR_TIERS: StarTier[] = [
  {
    min: 0,
    max: 49,
    level: 'New Connection',
    levelStars: 1,
    badge: '⭐',
    color: 'text-amber-400',
    description: 'You recently connected on HypChat'
  },
  {
    min: 50,
    max: 149,
    level: 'Good Friends',
    levelStars: 2,
    badge: '⭐⭐',
    color: 'text-yellow-400',
    description: 'Frequent conversations and shared moments'
  },
  {
    min: 150,
    max: 299,
    level: 'Close Friends',
    levelStars: 3,
    badge: '⭐⭐⭐',
    color: 'text-orange-400',
    description: 'Deep bond built through steady interactions'
  },
  {
    min: 300,
    max: 499,
    level: 'Best Friends',
    levelStars: 4,
    badge: '⭐⭐⭐⭐',
    color: 'text-pink-500',
    description: 'Constant hype sharing and daily mutual trust'
  },
  {
    min: 500,
    max: Infinity,
    level: 'Inner Circle',
    levelStars: 5,
    badge: '🌟',
    color: 'text-purple-400',
    description: 'HypChat elite friendship tier'
  }
];

export function calculateStarTier(stars: number): {
  level: FriendshipLevel;
  levelStars: number;
  badge: string;
  nextLevelStars: number;
  progressPercent: number;
  tier: StarTier;
} {
  const currentStars = Math.max(0, stars);
  const tier = STAR_TIERS.find(t => currentStars >= t.min && currentStars <= t.max) || STAR_TIERS[0];
  
  let nextLevelStars = 50;
  let progressPercent = 100;

  if (tier.level === 'New Connection') {
    nextLevelStars = 50;
    progressPercent = Math.min(100, Math.round((currentStars / 50) * 100));
  } else if (tier.level === 'Good Friends') {
    nextLevelStars = 150;
    progressPercent = Math.min(100, Math.round(((currentStars - 50) / 100) * 100));
  } else if (tier.level === 'Close Friends') {
    nextLevelStars = 300;
    progressPercent = Math.min(100, Math.round(((currentStars - 150) / 150) * 100));
  } else if (tier.level === 'Best Friends') {
    nextLevelStars = 500;
    progressPercent = Math.min(100, Math.round(((currentStars - 300) / 200) * 100));
  } else {
    nextLevelStars = 500;
    progressPercent = 100;
  }

  return {
    level: tier.level,
    levelStars: tier.levelStars,
    badge: tier.badge,
    nextLevelStars,
    progressPercent,
    tier
  };
}

export function formatStarInfo(
  friendId: string,
  friendUsername: string,
  friendName: string,
  friendAvatar: string,
  stars: number,
  totalInteractions: number = 0,
  lastInteractionAt: string = new Date().toISOString()
): FriendshipStarInfo {
  const tierInfo = calculateStarTier(stars);
  return {
    friendId,
    friendUsername,
    friendName,
    friendAvatar,
    stars,
    level: tierInfo.level,
    levelStars: tierInfo.levelStars,
    nextLevelStars: tierInfo.nextLevelStars,
    progressPercent: tierInfo.progressPercent,
    totalInteractions,
    lastInteractionAt
  };
}
