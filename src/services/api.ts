import {
  User,
  HypeVideo,
  Comment,
  Sound,
  Conversation,
  Message,
  FriendRequest,
  NotificationItem,
  ReportPayload,
  Story,
  SocialPost
} from '../types';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Default Seed Data for offline/local-first resilience
const DEFAULT_LOCAL_SOUNDS: Sound[] = [
  {
    id: 'sound-1',
    title: 'Neon Drift (Original Mix)',
    artist: 'Maya Chen',
    duration: 15,
    genre: 'Synthwave',
    useCount: 1420,
    audioKey: 'synthwave_pulse',
    color: 'from-orange-500 to-pink-500'
  },
  {
    id: 'sound-2',
    title: 'Midnight Coffee Beats',
    artist: 'Lo-Fi Collective',
    duration: 20,
    genre: 'Chillhop',
    useCount: 3890,
    audioKey: 'lofi_midnight',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'sound-3',
    title: 'Sub Zero Velocity 808',
    artist: 'HypChat Originals',
    duration: 12,
    genre: 'Trap / Phonk',
    useCount: 8210,
    audioKey: 'trap_hype_808',
    color: 'from-red-500 to-amber-500'
  },
  {
    id: 'sound-4',
    title: 'Cyberfunk Roller',
    artist: 'Kai Parker',
    duration: 18,
    genre: 'Electro Funk',
    useCount: 940,
    audioKey: 'cyber_funk',
    color: 'from-emerald-400 to-teal-600'
  },
  {
    id: 'sound-5',
    title: 'Warm Horizons',
    artist: 'Acoustic Labs',
    duration: 16,
    genre: 'Indie Folk',
    useCount: 650,
    audioKey: 'acoustic_breeze',
    color: 'from-amber-400 to-rose-400'
  }
];

const DEFAULT_LOCAL_USERS: User[] = [
  {
    id: 'user-kai',
    name: 'Kai Parker',
    username: 'kai_motion',
    email: 'kai@hypchat.io',
    bio: 'Movement artist & parkour trainer 🏃‍♂️ Capturing human velocity #HypMotion',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kai',
    followersCount: 18400,
    followingCount: 312,
    friendsCount: 48,
    createdAt: '2026-01-10T12:00:00Z'
  },
  {
    id: 'user-maya',
    name: 'Maya Chen',
    username: 'maya_synth',
    email: 'maya@hypchat.io',
    bio: 'Analog gear, modular pulses & sound design 🎛️ Creating daily sonic gems',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=maya',
    followersCount: 29500,
    followingCount: 180,
    friendsCount: 52,
    createdAt: '2026-01-12T12:00:00Z'
  },
  {
    id: 'user-leo',
    name: 'Leo Rivera',
    username: 'leo_nomad',
    email: 'leo@hypchat.io',
    bio: 'Cinematography & drone perspectives 🌊 Chasing golden hour across coastlines',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=leo',
    followersCount: 41200,
    followingCount: 450,
    friendsCount: 64,
    createdAt: '2026-01-15T12:00:00Z'
  },
  {
    id: 'user-zara',
    name: 'Zara Al-Mansoor',
    username: 'zara_art',
    email: 'zara@hypchat.io',
    bio: 'Visual director & generative graphic designer 🎨 Tokyo & London',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=zara',
    followersCount: 15300,
    followingCount: 220,
    friendsCount: 39,
    createdAt: '2026-02-01T12:00:00Z'
  }
];

const DEFAULT_LOCAL_HYPES: HypeVideo[] = [
  {
    id: 'hype-1',
    creatorId: 'user-kai',
    creator: {
      id: 'user-kai',
      name: 'Kai Parker',
      username: 'kai_motion',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kai'
    },
    videoUrl: '',
    posterGradient: 'from-amber-600 via-orange-600 to-rose-700',
    videoTheme: 'dance',
    caption: 'Sunset roof sequence in downtown rooftop. The balance on this rail felt effortless 🔥',
    hashtags: ['hype', 'movement', 'parkour', 'urbanflow'],
    soundId: 'sound-4',
    soundTitle: 'Cyberfunk Roller',
    soundArtist: 'Kai Parker',
    likesCount: 3420,
    commentsCount: 184,
    sharesCount: 512,
    savesCount: 910,
    viewsCount: 28400,
    privacy: 'public',
    filter: 'vibrant',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'hype-2',
    creatorId: 'user-maya',
    creator: {
      id: 'user-maya',
      name: 'Maya Chen',
      username: 'maya_synth',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=maya'
    },
    videoUrl: '',
    posterGradient: 'from-indigo-900 via-purple-900 to-pink-800',
    videoTheme: 'synth',
    caption: 'Dialing in custom analog resonance on the Moog filter. How does that bass hit in headphones? 🎧',
    hashtags: ['producer', 'synthwave', 'beats', 'hypchat'],
    soundId: 'sound-1',
    soundTitle: 'Neon Drift (Original Mix)',
    soundArtist: 'Maya Chen',
    likesCount: 5190,
    commentsCount: 320,
    sharesCount: 880,
    savesCount: 1450,
    viewsCount: 49200,
    privacy: 'public',
    filter: 'cyber',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'hype-3',
    creatorId: 'user-leo',
    creator: {
      id: 'user-leo',
      name: 'Leo Rivera',
      username: 'leo_nomad',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=leo'
    },
    videoUrl: '',
    posterGradient: 'from-teal-800 via-emerald-800 to-cyan-900',
    videoTheme: 'nature',
    caption: 'Golden light hitting the Pacific swell. Shot at 120fps drone glide 🌊',
    hashtags: ['oceanvibes', 'cinematic', 'drift', 'nature'],
    soundId: 'sound-2',
    soundTitle: 'Midnight Coffee Beats',
    soundArtist: 'Lo-Fi Collective',
    likesCount: 8940,
    commentsCount: 412,
    sharesCount: 1250,
    savesCount: 2800,
    viewsCount: 84000,
    privacy: 'public',
    filter: 'warm',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'hype-4',
    creatorId: 'user-zara',
    creator: {
      id: 'user-zara',
      name: 'Zara Al-Mansoor',
      username: 'zara_art',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=zara'
    },
    videoUrl: '',
    posterGradient: 'from-fuchsia-900 via-rose-900 to-indigo-950',
    videoTheme: 'art',
    caption: 'Generative typography loop reacting to live microphone input. 3D spatial textures! ✨',
    hashtags: ['digitalart', 'motiondesign', 'creativecoding'],
    soundId: 'sound-3',
    soundTitle: 'Sub Zero Velocity 808',
    soundArtist: 'HypChat Originals',
    likesCount: 4210,
    commentsCount: 195,
    sharesCount: 640,
    savesCount: 1120,
    viewsCount: 38200,
    privacy: 'public',
    filter: 'vibrant',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

interface LocalDatabase {
  users: (User & { password?: string })[];
  sounds: Sound[];
  hypes: HypeVideo[];
  stories: Story[];
  socialPosts: SocialPost[];
  likes: { userId: string; hypeId: string }[];
  saves: { userId: string; hypeId: string }[];
  comments: Comment[];
  follows: { followerId: string; targetId: string }[];
  friendRequests: FriendRequest[];
  friendships: {
    id: string;
    user1Id: string;
    user2Id: string;
    stars: number;
    totalInteractions: number;
    lastInteractionAt: string;
  }[];
  conversations: { id: string; participantIds: string[]; updatedAt: string }[];
  messages: Message[];
  notifications: NotificationItem[];
}

const DEFAULT_LOCAL_STORIES: Story[] = [
  {
    id: 'story-1',
    userId: 'user-kai',
    user: {
      id: 'user-kai',
      name: 'Kai Parker',
      username: 'kai_motion',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kai'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Sunset movement flow on the high ledges',
    textOverlay: 'GOLDEN HOUR AGILITY 🏃‍♂️',
    soundTitle: 'Cyberfunk Roller',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 22).toISOString(),
    viewers: [],
    reactions: []
  },
  {
    id: 'story-2',
    userId: 'user-maya',
    user: {
      id: 'user-maya',
      name: 'Maya Chen',
      username: 'maya_synth',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=maya'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Late night patch cables dialed in',
    textOverlay: 'SYNTH DRIFT 🎛️',
    soundTitle: 'Neon Drift (Original Mix)',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 19).toISOString(),
    viewers: [],
    reactions: []
  },
  {
    id: 'story-3',
    userId: 'user-leo',
    user: {
      id: 'user-leo',
      name: 'Leo Rivera',
      username: 'leo_nomad',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=leo'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Coastal mist clearing off the bluffs',
    textOverlay: 'PACIFIC DAWN 🌊',
    soundTitle: 'Midnight Coffee Beats',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 16).toISOString(),
    viewers: [],
    reactions: []
  }
];

const DEFAULT_LOCAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    userId: 'user-kai',
    user: {
      id: 'user-kai',
      name: 'Kai Parker',
      username: 'kai_motion',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kai'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Focusing on kinetic balance and flow today. Strength isn’t just force, it’s control.',
    hashtags: ['movement', 'agility', 'hypchat'],
    soundTitle: 'Cyberfunk Roller',
    likesCount: 1420,
    commentsCount: 88,
    sharesCount: 195,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'post-2',
    userId: 'user-maya',
    user: {
      id: 'user-maya',
      name: 'Maya Chen',
      username: 'maya_synth',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=maya'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Analog oscillators warmth just hits different on tube monitors. New stems coming soon!',
    hashtags: ['sounddesign', 'synthesizer', 'audio'],
    soundTitle: 'Neon Drift (Original Mix)',
    likesCount: 2310,
    commentsCount: 140,
    sharesCount: 310,
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
  },
  {
    id: 'post-3',
    userId: 'user-leo',
    user: {
      id: 'user-leo',
      name: 'Leo Rivera',
      username: 'leo_nomad',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=leo'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    caption: 'Alpine reflections before sunrise. The silence up here is sacred.',
    hashtags: ['cinematography', 'nature', 'alpine'],
    soundTitle: 'Midnight Coffee Beats',
    likesCount: 3890,
    commentsCount: 215,
    sharesCount: 520,
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString()
  }
];

const LOCAL_STORAGE_DB_KEY = 'hypchat_client_db';

function getLocalDb(): LocalDatabase {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback to initial
  }

  const initial: LocalDatabase = {
    users: DEFAULT_LOCAL_USERS.map((u) => ({ ...u, password: 'password123' })),
    sounds: DEFAULT_LOCAL_SOUNDS,
    hypes: DEFAULT_LOCAL_HYPES,
    stories: DEFAULT_LOCAL_STORIES,
    socialPosts: DEFAULT_LOCAL_SOCIAL_POSTS,
    likes: [
      { userId: 'user-maya', hypeId: 'hype-1' },
      { userId: 'user-kai', hypeId: 'hype-2' }
    ],
    saves: [{ userId: 'user-kai', hypeId: 'hype-2' }],
    comments: [
      {
        id: 'c-1',
        hypeId: 'hype-1',
        userId: 'user-maya',
        user: {
          id: 'user-maya',
          name: 'Maya Chen',
          username: 'maya_synth',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=maya'
        },
        text: 'That landing was clean!! Sound choice syncs perfectly with the drop.',
        likesCount: 14,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'c-2',
        hypeId: 'hype-2',
        userId: 'user-leo',
        user: {
          id: 'user-leo',
          name: 'Leo Rivera',
          username: 'leo_nomad',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=leo'
        },
        text: 'Need this whole track on repeat. Incredible low-end punch.',
        likesCount: 22,
        createdAt: new Date(Date.now() - 14400000).toISOString()
      }
    ],
    follows: [
      { followerId: 'user-kai', targetId: 'user-maya' },
      { followerId: 'user-maya', targetId: 'user-kai' }
    ],
    friendRequests: [],
    friendships: [
      {
        id: 'friendship-kai-maya',
        user1Id: 'user-kai',
        user2Id: 'user-maya',
        stars: 185,
        totalInteractions: 48,
        lastInteractionAt: new Date().toISOString()
      }
    ],
    conversations: [
      {
        id: 'conv-kai-maya',
        participantIds: ['user-kai', 'user-maya'],
        updatedAt: new Date().toISOString()
      }
    ],
    messages: [
      {
        id: 'm-1',
        conversationId: 'conv-kai-maya',
        senderId: 'user-maya',
        receiverId: 'user-kai',
        text: 'Yo Kai! Checked your new roof line video, super clean balance.',
        status: 'read',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'm-2',
        conversationId: 'conv-kai-maya',
        senderId: 'user-kai',
        receiverId: 'user-maya',
        text: 'Thanks Maya! Used your Cyberfunk track for it 🔥',
        status: 'read',
        createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString()
      }
    ],
    notifications: []
  };

  saveLocalDb(initial);
  return initial;
}

function saveLocalDb(db: LocalDatabase) {
  try {
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify(db));
  } catch {
    // quota exceeded or private mode
  }
}

function updateLocalFriendshipStars(user1Id: string, user2Id: string, delta: number) {
  const db = getLocalDb();
  let friendship = db.friendships.find(
    (f) =>
      (f.user1Id === user1Id && f.user2Id === user2Id) ||
      (f.user1Id === user2Id && f.user2Id === user1Id)
  );

  if (!friendship) {
    friendship = {
      id: `friendship-${Date.now()}`,
      user1Id,
      user2Id,
      stars: 15 + delta,
      totalInteractions: 1,
      lastInteractionAt: new Date().toISOString()
    };
    db.friendships.push(friendship);
  } else {
    // Stars NEVER reset! Accumulate gradually
    friendship.stars += delta;
    friendship.totalInteractions += 1;
    friendship.lastInteractionAt = new Date().toISOString();
  }
  saveLocalDb(db);
}

export const api = {
  // Auth
  async signup(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    avatar?: string;
  }): Promise<{ user: User; token: string }> {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.error || 'Signup failed.');
      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      // Local fallback
      const db = getLocalDb();
      const cleanUsername = data.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const existing = db.users.find(
        (u) => u.username === cleanUsername || u.email.toLowerCase() === data.email.toLowerCase()
      );
      if (existing) {
        if (existing.username === cleanUsername) {
          throw new ApiError('Username already taken. Please choose another.');
        }
        throw new ApiError('Email already registered.');
      }
      const newUser: User & { password?: string } = {
        id: `user-${Date.now()}`,
        name: data.name.trim(),
        username: cleanUsername,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        bio: 'Just stepped into HypChat 🔥',
        avatar:
          data.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      saveLocalDb(db);
      const { password: _, ...safeUser } = newUser;
      return { user: safeUser, token: `token_${newUser.id}` };
    }
  },

  async login(loginIdentifier: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginIdentifier, password })
      });
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.error || 'Invalid credentials.');
      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      // Local fallback
      const db = getLocalDb();
      const clean = loginIdentifier.toLowerCase().trim();
      const user = db.users.find(
        (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
      );
      if (!user || user.password !== password) {
        throw new ApiError('Invalid email/username or password.');
      }
      const { password: _, ...safeUser } = user;
      return { user: safeUser, token: `token_${user.id}` };
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.error || 'Account not found.');
      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      return { message: 'Password reset link sent to your email.' };
    }
  },

  // Users
  async getUser(usernameOrId: string): Promise<User & { hypesCount: number }> {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(usernameOrId)}`);
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.error || 'User not found.');
      return json;
    } catch {
      const db = getLocalDb();
      const u =
        db.users.find((x) => x.username.toLowerCase() === usernameOrId.toLowerCase()) ||
        db.users.find((x) => x.id === usernameOrId) ||
        DEFAULT_LOCAL_USERS[0];
      const count = db.hypes.filter((h) => h.creatorId === u.id).length;
      const { password: _, ...safeUser } = u as (User & { password?: string });
      return { ...safeUser, hypesCount: count };
    }
  },

  async searchUsers(query: string, currentUserId?: string): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (currentUserId) params.append('currentUserId', currentUserId);
      const res = await fetch(`/api/users/search?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const q = query.trim().toLowerCase();
    if (!q) {
      return db.users
        .filter((u) => u.id !== currentUserId)
        .map(({ password: _, ...safe }) => safe);
    }
    return db.users
      .filter(
        (u) =>
          u.id !== currentUserId &&
          (u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
      )
      .map(({ password: _, ...safe }) => safe);
  },

  async updateProfile(data: {
    userId: string;
    name?: string;
    username?: string;
    bio?: string;
    avatar?: string;
    originalAvatar?: string;
    aiAvatar?: any;
    isPrivate?: boolean;
  }): Promise<User> {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.error || 'Failed to update profile.');
      return json;
    } catch {
      const db = getLocalDb();
      const idx = db.users.findIndex((u) => u.id === data.userId);
      if (idx !== -1) {
        if (data.name) db.users[idx].name = data.name;
        if (data.username) db.users[idx].username = data.username;
        if (data.bio !== undefined) db.users[idx].bio = data.bio;
        if (data.avatar) db.users[idx].avatar = data.avatar;
        if (data.originalAvatar !== undefined) (db.users[idx] as any).originalAvatar = data.originalAvatar;
        if (data.aiAvatar !== undefined) (db.users[idx] as any).aiAvatar = data.aiAvatar;
        if (data.isPrivate !== undefined) db.users[idx].isPrivate = data.isPrivate;
        saveLocalDb(db);
        const { password: _, ...safe } = db.users[idx];
        return safe;
      }
      throw new ApiError('User not found.');
    }
  },

  async generateAiCharacter(data: {
    userId: string;
    style: string;
    sourcePhotoUrl?: string;
  }): Promise<{ imageUrl: string; style: string }> {
    try {
      const res = await fetch('/api/ai/character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    // High quality client procedural fallback
    const seed = `${data.userId}_${data.style}_${Date.now()}`;
    const styleSeeds: Record<string, string> = {
      Realistic: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80`,
      Anime: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=7c3aed,8b5cf6,4c1d95`,
      Artistic: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80`,
      '3D': `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}&colors=8b5cf6,a855f7,c084fc`,
      Cyber: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80`,
      Minimal: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=581c87,7c3aed`
    };

    const imageUrl = styleSeeds[data.style] || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}`;
    return { imageUrl, style: data.style };
  },

  async toggleFollow(targetId: string, userId: string): Promise<{ isFollowing: boolean }> {
    try {
      const res = await fetch(`/api/users/${targetId}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      return await res.json();
    } catch {
      const db = getLocalDb();
      const idx = db.follows.findIndex(
        (f) => f.followerId === userId && f.targetId === targetId
      );
      let isFollowing = false;
      if (idx !== -1) {
        db.follows.splice(idx, 1);
        isFollowing = false;
      } else {
        db.follows.push({ followerId: userId, targetId });
        isFollowing = true;
      }
      saveLocalDb(db);
      return { isFollowing };
    }
  },

  async deleteAccount(userId: string): Promise<void> {
    try {
      await fetch('/api/users/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch {
      // non-blocking
    }
    const db = getLocalDb();
    db.users = db.users.filter((u) => u.id !== userId);
    saveLocalDb(db);
  },

  // Friends & Star System
  async getFriends(userId: string): Promise<{
    friendshipId: string;
    friendId: string;
    stars: number;
    totalInteractions: number;
    lastInteractionAt: string;
    friend: User;
  }[]> {
    try {
      const res = await fetch(`/api/friends?userId=${encodeURIComponent(userId)}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const userFriendships = db.friendships.filter(
      (f) => f.user1Id === userId || f.user2Id === userId
    );

    return userFriendships
      .map((f) => {
        const friendId = f.user1Id === userId ? f.user2Id : f.user1Id;
        const friendUser = db.users.find((u) => u.id === friendId);
        return {
          friendshipId: f.id,
          friendId,
          stars: f.stars,
          totalInteractions: f.totalInteractions,
          lastInteractionAt: f.lastInteractionAt,
          friend: friendUser || DEFAULT_LOCAL_USERS[0]
        };
      })
      .filter((f) => !!f.friend);
  },

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const res = await fetch(`/api/friends/requests?userId=${encodeURIComponent(userId)}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    return db.friendRequests.filter(
      (r) => r.receiverId === userId && r.status === 'pending'
    );
  },

  async sendFriendRequest(targetUserId: string, userId: string): Promise<FriendRequest> {
    try {
      const res = await fetch(`/api/friends/request/${targetUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.error || 'Could not send request.');
      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const db = getLocalDb();
      const sender = db.users.find((u) => u.id === userId) || DEFAULT_LOCAL_USERS[0];
      const req: FriendRequest = {
        id: `req-${Date.now()}`,
        senderId: userId,
        receiverId: targetUserId,
        sender,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      db.friendRequests.push(req);
      saveLocalDb(db);
      return req;
    }
  },

  async acceptFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      await fetch(`/api/friends/request/${requestId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const req = db.friendRequests.find((r) => r.id === requestId);
    if (req) {
      req.status = 'accepted';
      updateLocalFriendshipStars(req.senderId, req.receiverId, 25);
    }
  },

  async declineFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      await fetch(`/api/friends/request/${requestId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const req = db.friendRequests.find((r) => r.id === requestId);
    if (req) req.status = 'declined';
    saveLocalDb(db);
  },

  async cancelFriendRequest(requestId: string, userId: string): Promise<void> {
    try {
      await fetch(`/api/friends/request/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const req = db.friendRequests.find((r) => r.id === requestId);
    if (req) req.status = 'cancelled';
    saveLocalDb(db);
  },

  async removeFriend(friendId: string, userId: string): Promise<void> {
    try {
      await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch {
      // fallback
    }
    const db = getLocalDb();
    db.friendships = db.friendships.filter(
      (f) =>
        !(
          (f.user1Id === userId && f.user2Id === friendId) ||
          (f.user1Id === friendId && f.user2Id === userId)
        )
    );
    saveLocalDb(db);
  },

  // Hypes
  async getHypes(options?: {
    feed?: 'foryou' | 'following' | 'trending' | 'new';
    currentUserId?: string;
    soundId?: string;
    tag?: string;
    creatorId?: string;
  }): Promise<HypeVideo[]> {
    try {
      const params = new URLSearchParams();
      if (options?.feed) params.append('feed', options.feed);
      if (options?.currentUserId) params.append('currentUserId', options.currentUserId);
      if (options?.soundId) params.append('soundId', options.soundId);
      if (options?.tag) params.append('tag', options.tag);
      if (options?.creatorId) params.append('creatorId', options.creatorId);

      const res = await fetch(`/api/hypes?${params.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    let list = [...db.hypes];

    if (options?.soundId) list = list.filter((h) => h.soundId === options.soundId);
    if (options?.creatorId) list = list.filter((h) => h.creatorId === options.creatorId);
    if (options?.tag)
      list = list.filter((h) =>
        h.hashtags.some((t) => t.toLowerCase() === options.tag!.toLowerCase())
      );

    return list.map((h) => ({
      ...h,
      isLiked: options?.currentUserId
        ? db.likes.some((l) => l.userId === options.currentUserId && l.hypeId === h.id)
        : false,
      isSaved: options?.currentUserId
        ? db.saves.some((s) => s.userId === options.currentUserId && s.hypeId === h.id)
        : false,
      isFollowingCreator: options?.currentUserId
        ? db.follows.some(
            (f) => f.followerId === options.currentUserId && f.targetId === h.creatorId
          )
        : false
    }));
  },

  async createHype(data: {
    userId: string;
    caption: string;
    hashtags: string[];
    soundId?: string;
    privacy: 'public' | 'friends';
    filter?: string;
    videoTheme?: string;
    posterGradient?: string;
    videoUrl?: string;
  }): Promise<HypeVideo> {
    try {
      const res = await fetch('/api/hypes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.error || 'Failed to upload video.');
      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const db = getLocalDb();
      const creator = db.users.find((u) => u.id === data.userId) || DEFAULT_LOCAL_USERS[0];
      const sound = db.sounds.find((s) => s.id === data.soundId);

      const newHype: HypeVideo = {
        id: `hype-${Date.now()}`,
        creatorId: data.userId,
        creator: {
          id: creator.id,
          name: creator.name,
          username: creator.username,
          avatar: creator.avatar
        },
        videoUrl: data.videoUrl || '',
        posterGradient:
          data.posterGradient || 'from-indigo-800 via-rose-800 to-amber-700',
        videoTheme: (data.videoTheme as any) || 'custom',
        caption: data.caption.trim(),
        hashtags: data.hashtags,
        soundId: data.soundId,
        soundTitle: sound?.title,
        soundArtist: sound?.artist,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        savesCount: 0,
        viewsCount: 1,
        privacy: data.privacy,
        filter: data.filter || 'none',
        createdAt: new Date().toISOString()
      };
      db.hypes.unshift(newHype);
      saveLocalDb(db);
      return newHype;
    }
  },

  async toggleLike(
    hypeId: string,
    userId: string
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    try {
      const res = await fetch(`/api/hypes/${hypeId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const hype = db.hypes.find((h) => h.id === hypeId);
    const idx = db.likes.findIndex((l) => l.userId === userId && l.hypeId === hypeId);
    let isLiked = false;
    if (idx !== -1) {
      db.likes.splice(idx, 1);
      if (hype && hype.likesCount > 0) hype.likesCount--;
      isLiked = false;
    } else {
      db.likes.push({ userId, hypeId });
      if (hype) hype.likesCount++;
      isLiked = true;
    }
    saveLocalDb(db);
    return { isLiked, likesCount: hype ? hype.likesCount : 0 };
  },

  async toggleSave(
    hypeId: string,
    userId: string
  ): Promise<{ isSaved: boolean; savesCount: number }> {
    try {
      const res = await fetch(`/api/hypes/${hypeId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const hype = db.hypes.find((h) => h.id === hypeId);
    const idx = db.saves.findIndex((s) => s.userId === userId && s.hypeId === hypeId);
    let isSaved = false;
    if (idx !== -1) {
      db.saves.splice(idx, 1);
      if (hype && hype.savesCount > 0) hype.savesCount--;
      isSaved = false;
    } else {
      db.saves.push({ userId, hypeId });
      if (hype) hype.savesCount++;
      isSaved = true;
    }
    saveLocalDb(db);
    return { isSaved, savesCount: hype ? hype.savesCount : 0 };
  },

  async recordView(hypeId: string): Promise<void> {
    try {
      await fetch(`/api/hypes/${hypeId}/view`, { method: 'POST' });
    } catch {
      // non-blocking
    }
  },

  async shareHype(
    hypeId: string,
    userId?: string,
    targetFriendId?: string
  ): Promise<{ sharesCount: number }> {
    try {
      const res = await fetch(`/api/hypes/${hypeId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, targetFriendId })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const hype = db.hypes.find((h) => h.id === hypeId);
    if (hype) hype.sharesCount++;
    if (userId && targetFriendId) {
      updateLocalFriendshipStars(userId, targetFriendId, 5);
    }
    saveLocalDb(db);
    return { sharesCount: hype ? hype.sharesCount : 1 };
  },

  // Comments
  async getComments(hypeId: string): Promise<Comment[]> {
    try {
      const res = await fetch(`/api/hypes/${hypeId}/comments`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    return db.comments.filter((c) => c.hypeId === hypeId);
  },

  async addComment(hypeId: string, userId: string, text: string): Promise<Comment> {
    try {
      const res = await fetch(`/api/hypes/${hypeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text })
      });
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.error || 'Failed to post comment.');
      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const db = getLocalDb();
      const user = db.users.find((u) => u.id === userId) || DEFAULT_LOCAL_USERS[0];
      const comment: Comment = {
        id: `comm-${Date.now()}`,
        hypeId,
        userId,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar
        },
        text: text.trim(),
        likesCount: 0,
        createdAt: new Date().toISOString()
      };
      db.comments.push(comment);
      const hype = db.hypes.find((h) => h.id === hypeId);
      if (hype) hype.commentsCount++;
      saveLocalDb(db);
      return comment;
    }
  },

  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      await fetch(`/api/hypes/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch {
      // fallback
    }
    const db = getLocalDb();
    db.comments = db.comments.filter((c) => c.id !== commentId);
    saveLocalDb(db);
  },

  // Sounds
  async getSounds(): Promise<Sound[]> {
    try {
      const res = await fetch('/api/sounds');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return DEFAULT_LOCAL_SOUNDS;
  },

  async getSoundDetails(id: string): Promise<{ sound: Sound; hypes: HypeVideo[] }> {
    try {
      const res = await fetch(`/api/sounds/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const sound = db.sounds.find((s) => s.id === id) || DEFAULT_LOCAL_SOUNDS[0];
    const hypes = db.hypes.filter((h) => h.soundId === sound.id);
    return { sound, hypes };
  },

  // Chat
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const res = await fetch(`/api/conversations?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const json = await res.json();
        return json.map((c: any) => ({
          ...c,
          starsInfo: {
            friendId: c.otherUser.id,
            friendUsername: c.otherUser.username,
            friendName: c.otherUser.name,
            friendAvatar: c.otherUser.avatar,
            stars: c.stars || 0
          }
        }));
      }
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const userConvs = db.conversations.filter((c) => c.participantIds.includes(userId));

    return userConvs
      .map((conv) => {
        const otherId = conv.participantIds.find((id) => id !== userId) || userId;
        const otherUser = db.users.find((u) => u.id === otherId);
        const convMessages = db.messages.filter((m) => m.conversationId === conv.id);
        const lastMessage = convMessages[convMessages.length - 1];
        const unreadCount = convMessages.filter(
          (m) => m.receiverId === userId && m.status !== 'read'
        ).length;
        const friendship = db.friendships.find(
          (f) =>
            (f.user1Id === userId && f.user2Id === otherId) ||
            (f.user1Id === otherId && f.user2Id === userId)
        );

        return {
          id: conv.id,
          participantIds: conv.participantIds,
          otherUser: otherUser || DEFAULT_LOCAL_USERS[0],
          lastMessage,
          unreadCount,
          stars: friendship ? friendship.stars : 0,
          starsInfo: {
            friendId: otherId,
            friendUsername: otherUser?.username || '',
            friendName: otherUser?.name || '',
            friendAvatar: otherUser?.avatar || '',
            stars: friendship ? friendship.stars : 0,
            level: 'New Connection' as const,
            levelStars: 1,
            nextLevelStars: 50,
            progressPercent: 0,
            totalInteractions: 0,
            lastInteractionAt: new Date().toISOString()
          },
          updatedAt: conv.updatedAt
        };
      })
      .filter((c) => !!c.otherUser);
  },

  async startConversation(userId: string, targetUserId: string): Promise<Conversation> {
    try {
      const res = await fetch(`/api/conversations/start/${targetUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    let conv = db.conversations.find(
      (c) => c.participantIds.includes(userId) && c.participantIds.includes(targetUserId)
    );
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        participantIds: [userId, targetUserId],
        updatedAt: new Date().toISOString()
      };
      db.conversations.push(conv);
      saveLocalDb(db);
    }
    const otherUser = db.users.find((u) => u.id === targetUserId) || DEFAULT_LOCAL_USERS[0];
    return {
      id: conv.id,
      participantIds: conv.participantIds,
      otherUser,
      unreadCount: 0,
      stars: 0,
      starsInfo: {
        friendId: otherUser.id,
        friendUsername: otherUser.username,
        friendName: otherUser.name,
        friendAvatar: otherUser.avatar,
        stars: 0,
        level: 'New Connection',
        levelStars: 1,
        nextLevelStars: 50,
        progressPercent: 0,
        totalInteractions: 0,
        lastInteractionAt: new Date().toISOString()
      },
      updatedAt: conv.updatedAt
    };
  },

  async getMessages(conversationId: string, userId: string): Promise<Message[]> {
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages?userId=${encodeURIComponent(userId)}`
      );
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    return db.messages.filter((m) => m.conversationId === conversationId);
  },

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    sharedHypeId?: string;
    sharedHypeData?: any;
  }): Promise<Message> {
    try {
      const res = await fetch(`/api/conversations/${data.conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!res.ok) throw new ApiError(json.error || 'Failed to send message.');
      return json;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      const db = getLocalDb();
      const msg: Message = {
        id: `msg-${Date.now()}`,
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        text: data.text,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        sharedHypeId: data.sharedHypeId,
        sharedHypeData: data.sharedHypeData,
        status: 'sent',
        createdAt: new Date().toISOString()
      };
      db.messages.push(msg);

      // Star reward (+2 for message, +5 for shared hype)
      const starDelta = data.sharedHypeId ? 5 : 2;
      updateLocalFriendshipStars(data.senderId, data.receiverId, starDelta);

      saveLocalDb(db);
      return msg;
    }
  },

  // Notifications
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    return db.notifications.filter((n) => n.userId === userId);
  },

  async markNotificationsRead(userId: string, notifId?: string): Promise<void> {
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, notifId })
      });
    } catch {
      // fallback
    }
    const db = getLocalDb();
    db.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    saveLocalDb(db);
  },

  // Safety
  async submitReport(payload: ReportPayload & { reporterId: string }): Promise<void> {
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      // non-blocking
    }
  },

  async blockUser(userId: string, targetId: string): Promise<void> {
    try {
      await fetch(`/api/users/${targetId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch {
      // non-blocking
    }
  },

  // Stories
  async getStories(): Promise<Story[]> {
    try {
      const res = await fetch('/api/stories');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    return db.stories || DEFAULT_LOCAL_STORIES;
  },

  async createStory(data: {
    userId: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    textOverlay?: string;
    soundTitle?: string;
    filter?: string;
  }): Promise<Story> {
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const user = db.users.find((u) => u.id === data.userId) || DEFAULT_LOCAL_USERS[0];
    const newStory: Story = {
      id: `story-${Date.now()}`,
      userId: data.userId,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      },
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      caption: data.caption,
      textOverlay: data.textOverlay,
      soundTitle: data.soundTitle,
      filter: data.filter,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      viewers: [],
      reactions: []
    };
    db.stories = [newStory, ...(db.stories || [])];
    saveLocalDb(db);
    return newStory;
  },

  async deleteStory(storyId: string, userId: string): Promise<void> {
    try {
      await fetch(`/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch {
      // fallback
    }
    const db = getLocalDb();
    db.stories = (db.stories || []).filter((s) => s.id !== storyId);
    saveLocalDb(db);
  },

  async recordStoryView(storyId: string, userId: string): Promise<void> {
    try {
      await fetch(`/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const story = (db.stories || []).find((s) => s.id === storyId);
    const viewer = db.users.find((u) => u.id === userId);
    if (story && viewer && !story.viewers?.some((v: { userId: string }) => v.userId === userId)) {
      if (!story.viewers) story.viewers = [];
      story.viewers.push({
        userId,
        username: viewer.username,
        avatar: viewer.avatar,
        viewedAt: new Date().toISOString()
      });
      saveLocalDb(db);
    }
  },

  async reactToStory(storyId: string, userId: string, emoji: string): Promise<void> {
    try {
      await fetch(`/api/stories/${storyId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, emoji })
      });
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const story = (db.stories || []).find((s) => s.id === storyId);
    const reactor = db.users.find((u) => u.id === userId);
    if (story && reactor) {
      if (!story.reactions) story.reactions = [];
      story.reactions.push({
        userId,
        username: reactor.username,
        emoji,
        createdAt: new Date().toISOString()
      });

      // Reward Friendship Stars if friends
      updateLocalFriendshipStars(userId, story.userId, 2);

      // Notification
      db.notifications.push({
        id: `notif-${Date.now()}`,
        userId: story.userId,
        actorId: userId,
        actor: {
          id: reactor.id,
          name: reactor.name,
          username: reactor.username,
          avatar: reactor.avatar
        },
        type: 'story_reaction',
        title: 'Story Reaction',
        content: `@${reactor.username} reacted ${emoji} to your story (+2 ⭐)`,
        targetId: story.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });
      saveLocalDb(db);
    }
  },

  // Social Posts
  async getSocialPosts(): Promise<SocialPost[]> {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    return db.socialPosts || DEFAULT_LOCAL_SOCIAL_POSTS;
  },

  async createSocialPost(data: {
    userId: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption: string;
    hashtags?: string[];
    soundTitle?: string;
  }): Promise<SocialPost> {
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const user = db.users.find((u) => u.id === data.userId) || DEFAULT_LOCAL_USERS[0];
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      userId: data.userId,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      },
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
      caption: data.caption,
      hashtags: data.hashtags || ['moment'],
      soundTitle: data.soundTitle,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString()
    };
    db.socialPosts = [newPost, ...(db.socialPosts || [])];
    saveLocalDb(db);
    return newPost;
  },

  async toggleSocialPostLike(
    postId: string,
    userId: string
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const db = getLocalDb();
    const post = (db.socialPosts || []).find((p) => p.id === postId);
    if (!post) return { isLiked: false, likesCount: 0 };

    const idx = (db.likes || []).findIndex(
      (l) => l.userId === userId && l.hypeId === postId
    );
    let isLiked = false;
    if (idx !== -1) {
      db.likes.splice(idx, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
      isLiked = false;
    } else {
      if (!db.likes) db.likes = [];
      db.likes.push({ userId, hypeId: postId });
      post.likesCount++;
      isLiked = true;

      // Add friendship star
      updateLocalFriendshipStars(userId, post.userId, 1);
    }
    saveLocalDb(db);
    return { isLiked, likesCount: post.likesCount };
  }
};
