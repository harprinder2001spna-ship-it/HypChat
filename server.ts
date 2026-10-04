import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = path.join(__dirname, 'data', 'hypchat_store.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Initial Mock Community Data
const INITIAL_SOUNDS = [
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

const INITIAL_USERS = [
  {
    id: 'user-kai',
    name: 'Kai Parker',
    username: 'kai_motion',
    email: 'kai@hypchat.io',
    password: 'password123',
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
    password: 'password123',
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
    password: 'password123',
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
    password: 'password123',
    bio: 'Visual director & generative graphic designer 🎨 Tokyo & London',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=zara',
    followersCount: 15300,
    followingCount: 220,
    friendsCount: 39,
    createdAt: '2026-02-01T12:00:00Z'
  }
];

const INITIAL_HYPES = [
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

interface UserRecord {
  id: string;
  name: string;
  username: string;
  email: string;
  password?: string;
  bio: string;
  avatar: string;
  followersCount: number;
  followingCount: number;
  friendsCount: number;
  isPrivate?: boolean;
  createdAt: string;
}

interface HypeRecord {
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
  videoTheme: string;
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
  privacy: 'public' | 'friends' | string;
  filter?: string;
  createdAt: string;
}

interface DatabaseSchema {
  users: UserRecord[];
  sounds: typeof INITIAL_SOUNDS;
  hypes: HypeRecord[];
  likes: { userId: string; hypeId: string; createdAt: string }[];
  saves: { userId: string; hypeId: string; createdAt: string }[];
  comments: {
    id: string;
    hypeId: string;
    userId: string;
    user: { id: string; name: string; username: string; avatar: string };
    text: string;
    likesCount: number;
    createdAt: string;
    replies?: any[];
  }[];
  follows: { followerId: string; targetId: string; createdAt: string }[];
  friendRequests: {
    id: string;
    senderId: string;
    receiverId: string;
    sender: any;
    status: 'pending' | 'accepted' | 'declined' | 'cancelled';
    createdAt: string;
  }[];
  friendships: {
    id: string;
    user1Id: string;
    user2Id: string;
    stars: number;
    totalInteractions: number;
    lastInteractionAt: string;
    createdAt: string;
  }[];
  conversations: {
    id: string;
    participantIds: string[];
    updatedAt: string;
  }[];
  messages: {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    sharedHypeId?: string;
    sharedHypeData?: any;
    status: 'sent' | 'delivered' | 'read';
    createdAt: string;
  }[];
  notifications: {
    id: string;
    userId: string;
    actorId: string;
    actor: { id: string; name: string; username: string; avatar: string };
    type: string;
    title: string;
    content: string;
    targetId?: string;
    isRead: boolean;
    createdAt: string;
  }[];
  reports: {
    id: string;
    reporterId: string;
    targetType: string;
    targetId: string;
    reason: string;
    details?: string;
    createdAt: string;
  }[];
  blocks: {
    userId: string;
    blockedUserId: string;
    createdAt: string;
  }[];
  stories: {
    id: string;
    userId: string;
    user: { id: string; name: string; username: string; avatar: string };
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption?: string;
    textOverlay?: string;
    soundTitle?: string;
    filter?: string;
    createdAt: string;
    expiresAt: string;
    viewers?: { userId: string; username: string; avatar: string; viewedAt: string }[];
    reactions?: { userId: string; username: string; emoji: string; createdAt: string }[];
  }[];
  socialPosts: {
    id: string;
    userId: string;
    user: { id: string; name: string; username: string; avatar: string };
    mediaUrl: string;
    mediaType: 'image' | 'video';
    caption: string;
    hashtags: string[];
    soundTitle?: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    createdAt: string;
  }[];
}

const INITIAL_STORIES = [
  {
    id: 'story-maya-1',
    userId: 'user-maya',
    user: {
      id: 'user-maya',
      name: 'Maya Chen',
      username: 'maya_synth',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=maya'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image' as const,
    caption: 'Late night modular synth recording session 🎛️',
    textOverlay: 'HYP STUDIO',
    soundTitle: 'Neon Drift (Original Mix)',
    filter: 'none',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 22).toISOString(),
    viewers: [],
    reactions: []
  },
  {
    id: 'story-kai-1',
    userId: 'user-kai',
    user: {
      id: 'user-kai',
      name: 'Kai Parker',
      username: 'kai_motion',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kai'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image' as const,
    caption: 'Sunrise mobility run 🏃‍♂️',
    textOverlay: 'EARLY GAINS',
    soundTitle: 'Sub Zero Velocity 808',
    filter: 'vivid',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 19).toISOString(),
    viewers: [],
    reactions: []
  },
  {
    id: 'story-leo-1',
    userId: 'user-leo',
    user: {
      id: 'user-leo',
      name: 'Leo Rivera',
      username: 'leo_nomad',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=leo'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image' as const,
    caption: 'Golden hour drone pass over the coast 🌅',
    textOverlay: 'COASTAL DRIFT',
    soundTitle: 'Warm Horizons',
    filter: 'warm',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 21).toISOString(),
    viewers: [],
    reactions: []
  }
];

const INITIAL_SOCIAL_POSTS = [
  {
    id: 'post-1',
    userId: 'user-maya',
    user: {
      id: 'user-maya',
      name: 'Maya Chen',
      username: 'maya_synth',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=maya'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image' as const,
    caption: 'Dialing in the analog filters for our new Hyp sound pack. What tempo should we hit next?',
    hashtags: ['music', 'analog', 'sounddesign'],
    soundTitle: 'Neon Drift (Original Mix)',
    likesCount: 142,
    commentsCount: 18,
    sharesCount: 12,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'post-2',
    userId: 'user-kai',
    user: {
      id: 'user-kai',
      name: 'Kai Parker',
      username: 'kai_motion',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kai'
    },
    mediaUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image' as const,
    caption: 'Focus over fear. Rooftop precision drop test today. Always honor the preparation.',
    hashtags: ['parkour', 'athlete', 'flowstate'],
    soundTitle: 'Sub Zero Velocity 808',
    likesCount: 289,
    commentsCount: 34,
    sharesCount: 25,
    createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
  }
];

// Load or initialize DB
function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.stories || parsed.stories.length === 0) {
        parsed.stories = [...INITIAL_STORIES];
      }
      if (!parsed.socialPosts || parsed.socialPosts.length === 0) {
        parsed.socialPosts = [...INITIAL_SOCIAL_POSTS];
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error loading DB file, fallback to initial state', err);
  }

  const initialDb: DatabaseSchema = {
    users: [...INITIAL_USERS],
    sounds: [...INITIAL_SOUNDS],
    hypes: [...INITIAL_HYPES],
    likes: [
      { userId: 'user-maya', hypeId: 'hype-1', createdAt: new Date().toISOString() },
      { userId: 'user-kai', hypeId: 'hype-2', createdAt: new Date().toISOString() }
    ],
    saves: [
      { userId: 'user-kai', hypeId: 'hype-2', createdAt: new Date().toISOString() }
    ],
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
      { followerId: 'user-kai', targetId: 'user-maya', createdAt: new Date().toISOString() },
      { followerId: 'user-maya', targetId: 'user-kai', createdAt: new Date().toISOString() }
    ],
    friendRequests: [],
    friendships: [
      {
        id: 'friendship-kai-maya',
        user1Id: 'user-kai',
        user2Id: 'user-maya',
        stars: 185, // Close Friends ⭐⭐⭐
        totalInteractions: 48,
        lastInteractionAt: new Date().toISOString(),
        createdAt: '2026-01-20T10:00:00Z'
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
    notifications: [],
    reports: [],
    blocks: [],
    stories: [...INITIAL_STORIES],
    socialPosts: [...INITIAL_SOCIAL_POSTS]
  };

  saveDb(initialDb);
  return initialDb;
}

function saveDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file', err);
  }
}

let db = loadDb();

// Helper for Friendship Stars update
function updateFriendshipStars(user1Id: string, user2Id: string, starsDelta: number) {
  let friendship = db.friendships.find(
    f => (f.user1Id === user1Id && f.user2Id === user2Id) || (f.user1Id === user2Id && f.user2Id === user1Id)
  );

  if (!friendship) {
    friendship = {
      id: `friendship-${Date.now()}`,
      user1Id,
      user2Id,
      stars: 15 + starsDelta, // Base connection points
      totalInteractions: 1,
      lastInteractionAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    db.friendships.push(friendship);
  } else {
    // Stars NEVER reset! Accumulate gradually
    friendship.stars += starsDelta;
    friendship.totalInteractions += 1;
    friendship.lastInteractionAt = new Date().toISOString();
  }
  saveDb(db);
  return friendship;
}

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ extended: true, limit: '60mb' }));
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Request logger for API calls
  app.use('/api', (req, res, next) => {
    next();
  });

  // ===================== AUTH ROUTES =====================
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    try {
      const { name, username, email, password, confirmPassword, avatar } = req.body;

      if (!name || !username || !email || !password) {
        return res.status(400).json({ error: 'Please provide all required fields.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (cleanUsername.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters (letters, numbers, underscores).' });
      }

      const existingUser = db.users.find(
        u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        if (existingUser.username.toLowerCase() === cleanUsername) {
          return res.status(400).json({ error: 'Username already taken. Please choose another.' });
        }
        return res.status(400).json({ error: 'Email already registered.' });
      }

      const newUser = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        username: cleanUsername,
        email: email.trim().toLowerCase(),
        password,
        bio: 'Just stepped into HypChat 🔥',
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0,
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      saveDb(db);

      const { password: _, ...safeUser } = newUser;
      return res.status(201).json({
        user: safeUser,
        token: `hyp_token_${newUser.id}_${Date.now()}`
      });
    } catch {
      return res.status(500).json({ error: 'Something went wrong during signup. Please try again.' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { loginIdentifier, password } = req.body;

      if (!loginIdentifier || !password) {
        return res.status(400).json({ error: 'Please enter your username/email and password.' });
      }

      const cleanId = loginIdentifier.trim().toLowerCase();
      const user = db.users.find(
        u => u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
      );

      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email/username or password.' });
      }

      const { password: _, ...safeUser } = user;
      return res.json({
        user: safeUser,
        token: `hyp_token_${user.id}_${Date.now()}`
      });
    } catch {
      return res.status(500).json({ error: 'Login failed. Please check your credentials.' });
    }
  });

  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter your registered email address.' });
    }
    const user = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }
    return res.json({ message: 'Password reset link sent to your email.' });
  });

  // ===================== USER ROUTES =====================
  app.get('/api/users/search', (req: Request, res: Response) => {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    const currentUserId = req.query.currentUserId as string;

    if (!q) {
      // return suggested users
      const suggestions = db.users
        .filter(u => u.id !== currentUserId)
        .slice(0, 10)
        .map(({ password, ...u }) => u);
      return res.json(suggestions);
    }

    const matches = db.users
      .filter(u => u.id !== currentUserId && (u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)))
      .slice(0, 20)
      .map(({ password, ...u }) => u);

    return res.json(matches);
  });

  app.get('/api/users/:username', (req: Request, res: Response) => {
    const username = req.params.username.toLowerCase();
    const user = db.users.find(u => u.username.toLowerCase() === username || u.id === username);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const { password, ...safeUser } = user;

    // Get user hypes count
    const userHypes = db.hypes.filter(h => h.creatorId === user.id);
    return res.json({
      ...safeUser,
      hypesCount: userHypes.length
    });
  });

  app.patch('/api/users/profile', (req: Request, res: Response) => {
    const { userId, name, username, bio, avatar, originalAvatar, aiAvatar, isPrivate } = req.body;
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (username) {
      const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const conflict = db.users.find(u => u.username === cleanUsername && u.id !== userId);
      if (conflict) {
        return res.status(400).json({ error: 'Username is already taken.' });
      }
      db.users[userIndex].username = cleanUsername;
    }

    if (name) db.users[userIndex].name = name.trim();
    if (bio !== undefined) db.users[userIndex].bio = bio.trim();
    if (avatar) db.users[userIndex].avatar = avatar;
    if (originalAvatar !== undefined) (db.users[userIndex] as any).originalAvatar = originalAvatar;
    if (aiAvatar !== undefined) (db.users[userIndex] as any).aiAvatar = aiAvatar;
    if (isPrivate !== undefined) db.users[userIndex].isPrivate = !!isPrivate;

    saveDb(db);
    const { password, ...safeUser } = db.users[userIndex];
    return res.json(safeUser);
  });

  // ===================== AI CHARACTER GENERATION =====================
  app.post('/api/ai/character', (req: Request, res: Response) => {
    const { userId, style, sourcePhotoUrl } = req.body;
    const safeStyle = style || 'Realistic';

    // Generates a high quality artistic avatar matching the chosen style
    const seed = `${userId || 'guest'}_${safeStyle}_${Date.now()}`;
    const stylePresets: Record<string, string[]> = {
      Realistic: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80'
      ],
      Anime: [
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=7c3aed,8b5cf6,4c1d95`,
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed + 'b')}&backgroundColor=581c87,9333ea`,
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed + 'c')}&backgroundColor=3b0764,7c3aed`
      ],
      Artistic: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80'
      ],
      '3D': [
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed)}&colors=8b5cf6,a855f7,c084fc`,
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed + '3d')}&colors=7c3aed,c084fc`,
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(seed + 'render')}&colors=9333ea,a855f7`
      ],
      Cyber: [
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80'
      ],
      Minimal: [
        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=581c87,7c3aed`,
        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&backgroundColor=4c1d95,6d28d9`,
        `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed + 'min')}&backgroundColor=3b0764,8b5cf6`
      ]
    };

    const presetList = stylePresets[safeStyle] || stylePresets.Realistic;
    const randomPick = presetList[Math.floor(Math.random() * presetList.length)];

    return res.json({
      imageUrl: randomPick,
      style: safeStyle,
      createdAt: new Date().toISOString()
    });
  });

  app.post('/api/users/:id/follow', (req: Request, res: Response) => {
    const targetId = req.params.id;
    const { userId } = req.body;

    if (!userId || userId === targetId) {
      return res.status(400).json({ error: 'Invalid operation.' });
    }

    const existingIndex = db.follows.findIndex(f => f.followerId === userId && f.targetId === targetId);
    let isFollowing = false;

    if (existingIndex !== -1) {
      db.follows.splice(existingIndex, 1);
      const targetUser = db.users.find(u => u.id === targetId);
      if (targetUser && targetUser.followersCount > 0) targetUser.followersCount--;
      const follower = db.users.find(u => u.id === userId);
      if (follower && follower.followingCount > 0) follower.followingCount--;
      isFollowing = false;
    } else {
      db.follows.push({ followerId: userId, targetId, createdAt: new Date().toISOString() });
      const targetUser = db.users.find(u => u.id === targetId);
      if (targetUser) targetUser.followersCount++;
      const follower = db.users.find(u => u.id === userId);
      if (follower) follower.followingCount++;
      isFollowing = true;

      // Notification
      const actor = db.users.find(u => u.id === userId);
      if (actor) {
        db.notifications.push({
          id: `notif-${Date.now()}`,
          userId: targetId,
          actorId: userId,
          actor: { id: actor.id, name: actor.name, username: actor.username, avatar: actor.avatar },
          type: 'follow',
          title: 'New Follower',
          content: `@${actor.username} started following you.`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    saveDb(db);
    return res.json({ isFollowing });
  });

  app.delete('/api/users/account', (req: Request, res: Response) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required.' });

    db.users = db.users.filter(u => u.id !== userId);
    db.hypes = db.hypes.filter(h => h.creatorId !== userId);
    db.friendships = db.friendships.filter(f => f.user1Id !== userId && f.user2Id !== userId);
    db.friendRequests = db.friendRequests.filter(r => r.senderId !== userId && r.receiverId !== userId);
    db.conversations = db.conversations.filter(c => !c.participantIds.includes(userId));
    db.messages = db.messages.filter(m => m.senderId !== userId && m.receiverId !== userId);

    saveDb(db);
    return res.json({ success: true, message: 'Account deleted.' });
  });

  // ===================== FRIEND SYSTEM & STAR SYSTEM =====================
  app.get('/api/friends', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'User ID required.' });

    const userFriendships = db.friendships.filter(f => f.user1Id === userId || f.user2Id === userId);

    const friendsList = userFriendships.map(f => {
      const friendId = f.user1Id === userId ? f.user2Id : f.user1Id;
      const friendUser = db.users.find(u => u.id === friendId);
      return {
        friendshipId: f.id,
        friendId,
        stars: f.stars,
        totalInteractions: f.totalInteractions,
        lastInteractionAt: f.lastInteractionAt,
        friend: friendUser ? {
          id: friendUser.id,
          name: friendUser.name,
          username: friendUser.username,
          avatar: friendUser.avatar,
          bio: friendUser.bio
        } : null
      };
    }).filter(f => f.friend !== null);

    return res.json(friendsList);
  });

  app.get('/api/friends/requests', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'User ID required.' });

    const requests = db.friendRequests.filter(r => r.receiverId === userId && r.status === 'pending');
    return res.json(requests);
  });

  app.post('/api/friends/request/:targetUserId', (req: Request, res: Response) => {
    const { userId } = req.body;
    const targetUserId = req.params.targetUserId;

    if (!userId || userId === targetUserId) {
      return res.status(400).json({ error: 'Cannot send request to yourself.' });
    }

    // Check if already friends
    const alreadyFriends = db.friendships.some(
      f => (f.user1Id === userId && f.user2Id === targetUserId) || (f.user1Id === targetUserId && f.user2Id === userId)
    );
    if (alreadyFriends) {
      return res.status(400).json({ error: 'You are already friends with this user.' });
    }

    // Check existing pending request
    const existing = db.friendRequests.find(
      r => ((r.senderId === userId && r.receiverId === targetUserId) || (r.senderId === targetUserId && r.receiverId === userId)) && r.status === 'pending'
    );
    if (existing) {
      return res.status(400).json({ error: 'A pending friend request already exists.' });
    }

    const sender = db.users.find(u => u.id === userId);
    if (!sender) return res.status(404).json({ error: 'Sender not found.' });

    const request = {
      id: `req-${Date.now()}`,
      senderId: userId,
      receiverId: targetUserId,
      sender: {
        id: sender.id,
        name: sender.name,
        username: sender.username,
        avatar: sender.avatar
      },
      status: 'pending' as const,
      createdAt: new Date().toISOString()
    };

    db.friendRequests.push(request);

    // Notification
    db.notifications.push({
      id: `notif-${Date.now()}`,
      userId: targetUserId,
      actorId: userId,
      actor: { id: sender.id, name: sender.name, username: sender.username, avatar: sender.avatar },
      type: 'friend_request',
      title: 'New Friend Request',
      content: `@${sender.username} sent you a friend request.`,
      targetId: request.id,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    saveDb(db);
    return res.status(201).json(request);
  });

  app.post('/api/friends/request/:requestId/accept', (req: Request, res: Response) => {
    const { userId } = req.body;
    const requestId = req.params.requestId;

    const request = db.friendRequests.find(r => r.id === requestId);
    if (!request || request.receiverId !== userId) {
      return res.status(404).json({ error: 'Friend request not found.' });
    }

    request.status = 'accepted';

    // Update friend counts
    const user1 = db.users.find(u => u.id === request.senderId);
    const user2 = db.users.find(u => u.id === request.receiverId);
    if (user1) user1.friendsCount = (user1.friendsCount || 0) + 1;
    if (user2) user2.friendsCount = (user2.friendsCount || 0) + 1;

    // Create Friendship with base stars: 25 points initial bond!
    const friendship = updateFriendshipStars(request.senderId, request.receiverId, 25);

    // Notification to sender
    if (user2) {
      db.notifications.push({
        id: `notif-${Date.now()}`,
        userId: request.senderId,
        actorId: request.receiverId,
        actor: { id: user2.id, name: user2.name, username: user2.username, avatar: user2.avatar },
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        content: `@${user2.username} accepted your friend request! Start earning Friendship Stars ⭐`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);
    return res.json({ success: true, friendship });
  });

  app.post('/api/friends/request/:requestId/decline', (req: Request, res: Response) => {
    const { userId } = req.body;
    const requestId = req.params.requestId;

    const request = db.friendRequests.find(r => r.id === requestId);
    if (!request || request.receiverId !== userId) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    request.status = 'declined';
    saveDb(db);
    return res.json({ success: true });
  });

  app.post('/api/friends/request/:requestId/cancel', (req: Request, res: Response) => {
    const { userId } = req.body;
    const requestId = req.params.requestId;

    const request = db.friendRequests.find(r => r.id === requestId);
    if (!request || request.senderId !== userId) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    request.status = 'cancelled';
    saveDb(db);
    return res.json({ success: true });
  });

  app.delete('/api/friends/:friendId', (req: Request, res: Response) => {
    const { userId } = req.body;
    const friendId = req.params.friendId;

    db.friendships = db.friendships.filter(
      f => !((f.user1Id === userId && f.user2Id === friendId) || (f.user1Id === friendId && f.user2Id === userId))
    );

    const u1 = db.users.find(u => u.id === userId);
    const u2 = db.users.find(u => u.id === friendId);
    if (u1 && u1.friendsCount > 0) u1.friendsCount--;
    if (u2 && u2.friendsCount > 0) u2.friendsCount--;

    saveDb(db);
    return res.json({ success: true });
  });

  // ===================== HYPE FEED & CREATION =====================
  app.get('/api/hypes', (req: Request, res: Response) => {
    const feed = (req.query.feed as string) || 'foryou';
    const currentUserId = req.query.currentUserId as string;
    const soundId = req.query.soundId as string;
    const tag = req.query.tag as string;
    const creatorId = req.query.creatorId as string;

    let filtered = [...db.hypes];

    // Filter by sound
    if (soundId) {
      filtered = filtered.filter(h => h.soundId === soundId);
    }

    // Filter by tag
    if (tag) {
      filtered = filtered.filter(h => h.hashtags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }

    // Filter by creator
    if (creatorId) {
      filtered = filtered.filter(h => h.creatorId === creatorId);
    }

    // Privacy filter
    if (currentUserId) {
      filtered = filtered.filter(h => {
        if (h.privacy === 'public') return true;
        if (h.creatorId === currentUserId) return true;
        // Check if friends
        return db.friendships.some(
          f => (f.user1Id === currentUserId && f.user2Id === h.creatorId) ||
               (f.user1Id === h.creatorId && f.user2Id === currentUserId)
        );
      });
    } else {
      filtered = filtered.filter(h => h.privacy === 'public');
    }

    // Feed variations
    if (feed === 'following' && currentUserId) {
      const followingIds = db.follows.filter(f => f.followerId === currentUserId).map(f => f.targetId);
      filtered = filtered.filter(h => followingIds.includes(h.creatorId));
    } else if (feed === 'trending') {
      // Dynamic score algorithm: views*1 + likes*3 + comments*5 + shares*7 + saves*4
      filtered.sort((a, b) => {
        const scoreA = a.viewsCount + a.likesCount * 3 + a.commentsCount * 5 + a.sharesCount * 7 + a.savesCount * 4;
        const scoreB = b.viewsCount + b.likesCount * 3 + b.commentsCount * 5 + b.sharesCount * 7 + b.savesCount * 4;
        return scoreB - scoreA;
      });
    } else if (feed === 'new') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Append like & save status for user
    const result = filtered.map(h => {
      const isLiked = currentUserId ? db.likes.some(l => l.userId === currentUserId && l.hypeId === h.id) : false;
      const isSaved = currentUserId ? db.saves.some(s => s.userId === currentUserId && s.hypeId === h.id) : false;
      const isFollowing = currentUserId ? db.follows.some(f => f.followerId === currentUserId && f.targetId === h.creatorId) : false;
      return {
        ...h,
        isLiked,
        isSaved,
        isFollowingCreator: isFollowing
      };
    });

    return res.json(result);
  });

  app.post('/api/hypes', (req: Request, res: Response) => {
    try {
      const {
        userId,
        caption,
        hashtags,
        soundId,
        privacy,
        filter,
        videoTheme,
        posterGradient,
        videoUrl
      } = req.body;

      if (!userId || !caption) {
        return res.status(400).json({ error: 'Caption is required to publish a Hype.' });
      }

      const creator = db.users.find(u => u.id === userId);
      if (!creator) return res.status(404).json({ error: 'Creator not found.' });

      let soundTitle: string | undefined;
      let soundArtist: string | undefined;
      if (soundId) {
        const sound = db.sounds.find(s => s.id === soundId);
        if (sound) {
          soundTitle = sound.title;
          soundArtist = sound.artist;
          sound.useCount++;
        }
      }

      const newHype = {
        id: `hype-${Date.now()}`,
        creatorId: userId,
        creator: {
          id: creator.id,
          name: creator.name,
          username: creator.username,
          avatar: creator.avatar
        },
        videoUrl: videoUrl || '',
        posterGradient: posterGradient || 'from-indigo-800 via-rose-800 to-amber-700',
        videoTheme: (videoTheme as any) || 'custom',
        caption: caption.trim(),
        hashtags: Array.isArray(hashtags) ? hashtags : [],
        soundId,
        soundTitle,
        soundArtist,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        savesCount: 0,
        viewsCount: 1,
        privacy: privacy === 'friends' ? ('friends' as const) : ('public' as const),
        filter: filter || 'none',
        createdAt: new Date().toISOString()
      };

      db.hypes.unshift(newHype);
      saveDb(db);
      return res.status(201).json(newHype);
    } catch {
      return res.status(500).json({ error: 'Unable to publish Hype. Please try again.' });
    }
  });

  app.post('/api/hypes/:id/like', (req: Request, res: Response) => {
    const { userId } = req.body;
    const hypeId = req.params.id;

    const hype = db.hypes.find(h => h.id === hypeId);
    if (!hype) return res.status(404).json({ error: 'Hype not found.' });

    const existingIndex = db.likes.findIndex(l => l.userId === userId && l.hypeId === hypeId);
    let isLiked = false;

    if (existingIndex !== -1) {
      db.likes.splice(existingIndex, 1);
      if (hype.likesCount > 0) hype.likesCount--;
      isLiked = false;
    } else {
      db.likes.push({ userId, hypeId, createdAt: new Date().toISOString() });
      hype.likesCount++;
      isLiked = true;

      // Notification to creator
      if (hype.creatorId !== userId) {
        const actor = db.users.find(u => u.id === userId);
        if (actor) {
          db.notifications.push({
            id: `notif-${Date.now()}`,
            userId: hype.creatorId,
            actorId: userId,
            actor: { id: actor.id, name: actor.name, username: actor.username, avatar: actor.avatar },
            type: 'like',
            title: 'Liked your Hype',
            content: `@${actor.username} liked: "${hype.caption.slice(0, 30)}..."`,
            targetId: hype.id,
            isRead: false,
            createdAt: new Date().toISOString()
          });

          // Check if mutual friends -> add Friendship Star!
          updateFriendshipStars(userId, hype.creatorId, 1);
        }
      }
    }

    saveDb(db);
    return res.json({ isLiked, likesCount: hype.likesCount });
  });

  app.post('/api/hypes/:id/save', (req: Request, res: Response) => {
    const { userId } = req.body;
    const hypeId = req.params.id;

    const hype = db.hypes.find(h => h.id === hypeId);
    if (!hype) return res.status(404).json({ error: 'Hype not found.' });

    const existingIndex = db.saves.findIndex(s => s.userId === userId && s.hypeId === hypeId);
    let isSaved = false;

    if (existingIndex !== -1) {
      db.saves.splice(existingIndex, 1);
      if (hype.savesCount > 0) hype.savesCount--;
      isSaved = false;
    } else {
      db.saves.push({ userId, hypeId, createdAt: new Date().toISOString() });
      hype.savesCount++;
      isSaved = true;
    }

    saveDb(db);
    return res.json({ isSaved, savesCount: hype.savesCount });
  });

  app.post('/api/hypes/:id/view', (req: Request, res: Response) => {
    const hype = db.hypes.find(h => h.id === req.params.id);
    if (hype) {
      hype.viewsCount++;
      saveDb(db);
    }
    return res.json({ viewsCount: hype ? hype.viewsCount : 0 });
  });

  app.post('/api/hypes/:id/share', (req: Request, res: Response) => {
    const { userId, targetFriendId } = req.body;
    const hype = db.hypes.find(h => h.id === req.params.id);
    if (!hype) return res.status(404).json({ error: 'Hype not found.' });

    hype.sharesCount++;

    // If shared to a specific friend inside HypChat chat -> Earn 5 Friendship Stars!
    if (userId && targetFriendId) {
      updateFriendshipStars(userId, targetFriendId, 5);

      const sender = db.users.find(u => u.id === userId);
      if (sender) {
        db.notifications.push({
          id: `notif-${Date.now()}`,
          userId: targetFriendId,
          actorId: userId,
          actor: { id: sender.id, name: sender.name, username: sender.username, avatar: sender.avatar },
          type: 'share',
          title: 'Shared a Hype',
          content: `@${sender.username} sent you a Hype in Chat (+5 Friendship Stars ⭐)`,
          targetId: hype.id,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }

    saveDb(db);
    return res.json({ sharesCount: hype.sharesCount });
  });

  // ===================== COMMENTS =====================
  app.get('/api/hypes/:id/comments', (req: Request, res: Response) => {
    const hypeId = req.params.id;
    const comments = db.comments.filter(c => c.hypeId === hypeId);
    return res.json(comments);
  });

  app.post('/api/hypes/:id/comments', (req: Request, res: Response) => {
    const { userId, text } = req.body;
    const hypeId = req.params.id;

    if (!userId || !text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }

    const hype = db.hypes.find(h => h.id === hypeId);
    if (!hype) return res.status(404).json({ error: 'Hype not found.' });

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const comment = {
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
      createdAt: new Date().toISOString(),
      replies: []
    };

    db.comments.push(comment);
    hype.commentsCount++;

    // Notification to hype creator
    if (hype.creatorId !== userId) {
      db.notifications.push({
        id: `notif-${Date.now()}`,
        userId: hype.creatorId,
        actorId: userId,
        actor: { id: user.id, name: user.name, username: user.username, avatar: user.avatar },
        type: 'comment',
        title: 'New Comment',
        content: `@${user.username} commented: "${text.trim().slice(0, 30)}..."`,
        targetId: hype.id,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      // Mutual friend star bonus
      updateFriendshipStars(userId, hype.creatorId, 2);
    }

    saveDb(db);
    return res.status(201).json(comment);
  });

  app.delete('/api/hypes/comments/:commentId', (req: Request, res: Response) => {
    const { userId } = req.body;
    const commentId = req.params.commentId;

    const index = db.comments.findIndex(c => c.id === commentId && c.userId === userId);
    if (index === -1) {
      return res.status(404).json({ error: 'Comment not found or unauthorized.' });
    }

    const comment = db.comments[index];
    const hype = db.hypes.find(h => h.id === comment.hypeId);
    if (hype && hype.commentsCount > 0) hype.commentsCount--;

    db.comments.splice(index, 1);
    saveDb(db);
    return res.json({ success: true });
  });

  // ===================== SOUNDS SYSTEM =====================
  app.get('/api/sounds', (req: Request, res: Response) => {
    return res.json(db.sounds);
  });

  app.get('/api/sounds/:id', (req: Request, res: Response) => {
    const sound = db.sounds.find(s => s.id === req.params.id);
    if (!sound) return res.status(404).json({ error: 'Sound not found.' });

    // Find all hypes using this sound
    const usingHypes = db.hypes.filter(h => h.soundId === sound.id);
    return res.json({ sound, hypes: usingHypes });
  });

  // ===================== CHAT & MESSAGING =====================
  app.get('/api/conversations', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'User ID required.' });

    const userConvs = db.conversations.filter(c => c.participantIds.includes(userId));

    const result = userConvs.map(conv => {
      const otherId = conv.participantIds.find(id => id !== userId) || userId;
      const otherUser = db.users.find(u => u.id === otherId);

      // Get last message
      const convMessages = db.messages.filter(m => m.conversationId === conv.id);
      const lastMessage = convMessages[convMessages.length - 1];

      // Unread count
      const unreadCount = convMessages.filter(m => m.receiverId === userId && m.status !== 'read').length;

      // Friendship stars
      const friendship = db.friendships.find(
        f => (f.user1Id === userId && f.user2Id === otherId) || (f.user1Id === otherId && f.user2Id === userId)
      );

      return {
        id: conv.id,
        participantIds: conv.participantIds,
        otherUser: otherUser ? {
          id: otherUser.id,
          name: otherUser.name,
          username: otherUser.username,
          avatar: otherUser.avatar,
          bio: otherUser.bio
        } : null,
        lastMessage,
        unreadCount,
        stars: friendship ? friendship.stars : 0,
        updatedAt: conv.updatedAt
      };
    }).filter(c => c.otherUser !== null);

    return res.json(result);
  });

  app.post('/api/conversations/start/:targetUserId', (req: Request, res: Response) => {
    const { userId } = req.body;
    const targetUserId = req.params.targetUserId;

    if (!userId || !targetUserId) {
      return res.status(400).json({ error: 'Missing participant IDs.' });
    }

    let conv = db.conversations.find(
      c => c.participantIds.includes(userId) && c.participantIds.includes(targetUserId)
    );

    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        participantIds: [userId, targetUserId],
        updatedAt: new Date().toISOString()
      };
      db.conversations.push(conv);
      saveDb(db);
    }

    return res.json(conv);
  });

  app.get('/api/conversations/:id/messages', (req: Request, res: Response) => {
    const convId = req.params.id;
    const userId = req.query.userId as string;

    const messages = db.messages.filter(m => m.conversationId === convId);

    // Mark received messages as read
    if (userId) {
      let updated = false;
      messages.forEach(m => {
        if (m.receiverId === userId && m.status !== 'read') {
          m.status = 'read';
          updated = true;
        }
      });
      if (updated) saveDb(db);
    }

    return res.json(messages);
  });

  app.post('/api/conversations/:id/messages', (req: Request, res: Response) => {
    const convId = req.params.id;
    const { senderId, receiverId, text, mediaUrl, mediaType, sharedHypeId, sharedHypeData } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ error: 'Invalid message parameters.' });
    }

    if (!text && !mediaUrl && !sharedHypeId) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const message = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      senderId,
      receiverId,
      text: text ? text.trim() : undefined,
      mediaUrl,
      mediaType,
      sharedHypeId,
      sharedHypeData,
      status: 'sent' as const,
      createdAt: new Date().toISOString()
    };

    db.messages.push(message);

    // Update conversation timestamp
    const conv = db.conversations.find(c => c.id === convId);
    if (conv) conv.updatedAt = message.createdAt;

    // FRIENDSHIP STAR REWARD:
    // Sending message earns +2 Friendship Stars (or +5 if sharing a Hype video)!
    const starDelta = sharedHypeId ? 5 : 2;
    updateFriendshipStars(senderId, receiverId, starDelta);

    // Notification
    const sender = db.users.find(u => u.id === senderId);
    if (sender) {
      db.notifications.push({
        id: `notif-${Date.now()}`,
        userId: receiverId,
        actorId: senderId,
        actor: { id: sender.id, name: sender.name, username: sender.username, avatar: sender.avatar },
        type: 'message',
        title: 'New Message',
        content: sharedHypeId
          ? `@${sender.username} sent you a Hype (+5 ⭐)`
          : `@${sender.username}: ${text ? text.slice(0, 30) : 'Sent media'}`,
        targetId: convId,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    saveDb(db);
    return res.status(201).json(message);
  });

  // ===================== NOTIFICATIONS =====================
  app.get('/api/notifications', (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'User ID required.' });

    const userNotifs = db.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json(userNotifs);
  });

  app.post('/api/notifications/read', (req: Request, res: Response) => {
    const { userId, notifId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required.' });

    if (notifId) {
      const notif = db.notifications.find(n => n.id === notifId && n.userId === userId);
      if (notif) notif.isRead = true;
    } else {
      // Mark all read
      db.notifications.forEach(n => {
        if (n.userId === userId) n.isRead = true;
      });
    }

    saveDb(db);
    return res.json({ success: true });
  });

  // ===================== REPORTS & BLOCKS =====================
  app.post('/api/reports', (req: Request, res: Response) => {
    const { reporterId, targetType, targetId, reason, details } = req.body;
    if (!reporterId || !targetType || !targetId || !reason) {
      return res.status(400).json({ error: 'All report fields are required.' });
    }

    const report = {
      id: `rep-${Date.now()}`,
      reporterId,
      targetType,
      targetId,
      reason,
      details,
      createdAt: new Date().toISOString()
    };

    db.reports.push(report);
    saveDb(db);
    return res.status(201).json({ success: true, message: 'Report submitted. Thank you for keeping HypChat safe.' });
  });

  app.post('/api/users/:id/block', (req: Request, res: Response) => {
    const { userId } = req.body;
    const blockedUserId = req.params.id;

    if (!userId || !blockedUserId) return res.status(400).json({ error: 'Invalid parameters.' });

    const exists = db.blocks.some(b => b.userId === userId && b.blockedUserId === blockedUserId);
    if (!exists) {
      db.blocks.push({ userId, blockedUserId, createdAt: new Date().toISOString() });
      saveDb(db);
    }
    return res.json({ success: true, message: 'User blocked.' });
  });

  // ===================== STORIES API =====================
  app.get('/api/stories', (req: Request, res: Response) => {
    const now = Date.now();
    // Return unexpired stories (or stories without expiresAt default to 24h)
    const validStories = (db.stories || []).filter(s => {
      if (!s.expiresAt) return true;
      return new Date(s.expiresAt).getTime() > now;
    });
    return res.json(validStories);
  });

  app.post('/api/stories', (req: Request, res: Response) => {
    const { userId, mediaUrl, mediaType, caption, textOverlay, soundTitle, filter } = req.body;
    if (!userId || !mediaUrl) {
      return res.status(400).json({ error: 'User ID and media required.' });
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const newStory = {
      id: `story-${Date.now()}`,
      userId,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      },
      mediaUrl,
      mediaType: mediaType || 'image',
      caption: caption ? caption.trim() : undefined,
      textOverlay: textOverlay ? textOverlay.trim() : undefined,
      soundTitle,
      filter: filter || 'none',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      viewers: [],
      reactions: []
    };

    if (!db.stories) db.stories = [];
    db.stories.unshift(newStory);
    saveDb(db);
    return res.status(201).json(newStory);
  });

  app.delete('/api/stories/:id', (req: Request, res: Response) => {
    const storyId = req.params.id;
    const { userId } = req.body;

    const idx = (db.stories || []).findIndex(s => s.id === storyId && (!userId || s.userId === userId));
    if (idx === -1) {
      return res.status(404).json({ error: 'Story not found or unauthorized.' });
    }

    db.stories.splice(idx, 1);
    saveDb(db);
    return res.json({ success: true, message: 'Story deleted.' });
  });

  app.post('/api/stories/:id/view', (req: Request, res: Response) => {
    const storyId = req.params.id;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required.' });

    const story = (db.stories || []).find(s => s.id === storyId);
    const viewer = db.users.find(u => u.id === userId);
    if (story && viewer) {
      if (!story.viewers) story.viewers = [];
      if (!story.viewers.some(v => v.userId === userId)) {
        story.viewers.push({
          userId,
          username: viewer.username,
          avatar: viewer.avatar,
          viewedAt: new Date().toISOString()
        });
        saveDb(db);
      }
    }
    return res.json({ success: true });
  });

  app.post('/api/stories/:id/react', (req: Request, res: Response) => {
    const storyId = req.params.id;
    const { userId, emoji } = req.body;
    if (!userId || !emoji) return res.status(400).json({ error: 'User ID and emoji required.' });

    const story = (db.stories || []).find(s => s.id === storyId);
    const reactor = db.users.find(u => u.id === userId);
    if (story && reactor) {
      if (!story.reactions) story.reactions = [];
      story.reactions.push({
        userId,
        username: reactor.username,
        emoji,
        createdAt: new Date().toISOString()
      });

      // Reward Friendship Stars ⭐
      updateFriendshipStars(userId, story.userId, 2);

      // Notification to story author
      if (story.userId !== userId) {
        db.notifications.push({
          id: `notif-${Date.now()}`,
          userId: story.userId,
          actorId: userId,
          actor: { id: reactor.id, name: reactor.name, username: reactor.username, avatar: reactor.avatar },
          type: 'story_reaction',
          title: 'Story Reaction',
          content: `@${reactor.username} reacted ${emoji} to your story (+2 ⭐)`,
          targetId: story.id,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
      saveDb(db);
    }
    return res.json({ success: true });
  });

  // ===================== SOCIAL POSTS API =====================
  app.get('/api/posts', (req: Request, res: Response) => {
    return res.json(db.socialPosts || []);
  });

  app.post('/api/posts', (req: Request, res: Response) => {
    const { userId, mediaUrl, mediaType, caption, hashtags, soundTitle } = req.body;
    if (!userId || !caption) {
      return res.status(400).json({ error: 'User ID and caption required.' });
    }

    const user = db.users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const newPost = {
      id: `post-${Date.now()}`,
      userId,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar
      },
      mediaUrl: mediaUrl || '',
      mediaType: mediaType || 'image',
      caption: caption.trim(),
      hashtags: Array.isArray(hashtags) ? hashtags : ['hypchat'],
      soundTitle,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date().toISOString()
    };

    if (!db.socialPosts) db.socialPosts = [];
    db.socialPosts.unshift(newPost);
    saveDb(db);
    return res.status(201).json(newPost);
  });

  app.post('/api/posts/:id/like', (req: Request, res: Response) => {
    const postId = req.params.id;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID required.' });

    const post = (db.socialPosts || []).find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    const idx = (db.likes || []).findIndex(l => l.userId === userId && l.hypeId === postId);
    let isLiked = false;

    if (idx !== -1) {
      db.likes.splice(idx, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
      isLiked = false;
    } else {
      if (!db.likes) db.likes = [];
      db.likes.push({ userId, hypeId: postId, createdAt: new Date().toISOString() });
      post.likesCount++;
      isLiked = true;

      // Add friendship star
      updateFriendshipStars(userId, post.userId, 1);
    }

    saveDb(db);
    return res.json({ isLiked, likesCount: post.likesCount });
  });

  // ===================== VITE MIDDLEWARE / STATIC FILES =====================
  const distPath = path.resolve(__dirname, 'dist');
  const indexHtmlPath = path.resolve(distPath, 'index.html');
  const hasBuildOutput = fs.existsSync(indexHtmlPath);
  const isProduction = process.env.NODE_ENV === 'production' || (hasBuildOutput && process.env.NODE_ENV !== 'development');

  if (isProduction && hasBuildOutput) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(indexHtmlPath);
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HypChat running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start HypChat server:', err);
});
