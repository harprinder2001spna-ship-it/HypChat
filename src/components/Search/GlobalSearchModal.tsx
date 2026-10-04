import React, { useState, useEffect } from 'react';
import { Search, X, Film, Users, Music, Hash, Play } from 'lucide-react';
import { User, HypeVideo, Sound } from '../../types';
import { api } from '../../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  onSelectHype: (hype: HypeVideo) => void;
  onSelectSound: (soundId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  onSelectHype,
  onSelectSound
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'users' | 'hypes' | 'sounds'>('all');

  const [users, setUsers] = useState<User[]>([]);
  const [hypes, setHypes] = useState<HypeVideo[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleSearch(query);
    }
  }, [isOpen, query]);

  const handleSearch = async (q: string) => {
    try {
      setIsLoading(true);
      const [userResults, hypeResults, soundResults] = await Promise.all([
        api.searchUsers(q),
        api.getHypes(),
        api.getSounds()
      ]);

      setUsers(userResults);

      const cleanQ = q.trim().toLowerCase();
      if (!cleanQ) {
        setHypes(hypeResults.slice(0, 6));
        setSounds(soundResults.slice(0, 4));
      } else {
        setHypes(
          hypeResults.filter(
            (h) =>
              h.caption.toLowerCase().includes(cleanQ) ||
              h.hashtags.some((t) => t.toLowerCase().includes(cleanQ)) ||
              h.creator.username.toLowerCase().includes(cleanQ)
          )
        );
        setSounds(
          soundResults.filter(
            (s) =>
              s.title.toLowerCase().includes(cleanQ) ||
              s.artist.toLowerCase().includes(cleanQ) ||
              s.genre.toLowerCase().includes(cleanQ)
          )
        );
      }
    } catch {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white max-w-md mx-auto animate-in fade-in duration-150">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3 pt-safe">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, hypes, tags, sounds..."
            autoFocus
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-white font-semibold min-h-[44px] px-2 flex items-center"
        >
          Cancel
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex px-4 py-2 gap-2 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
        {(
          [
            { id: 'all', label: 'Top Results' },
            { id: 'users', label: 'Users' },
            { id: 'hypes', label: 'Hypes' },
            { id: 'sounds', label: 'Sounds' }
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === tab.id
                ? 'bg-[#7c3aed] text-white shadow-sm shadow-purple-950/40'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* USERS SECTION */}
        {(activeFilter === 'all' || activeFilter === 'users') && users.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Users</span>
            </h4>
            <div className="space-y-2">
              {users.slice(0, activeFilter === 'users' ? 20 : 4).map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-left transition-colors"
                >
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-10 h-10 rounded-full bg-slate-800 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{u.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">@{u.username}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* HYPES SECTION */}
        {(activeFilter === 'all' || activeFilter === 'hypes') && hypes.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>Hype Videos</span>
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {hypes.slice(0, activeFilter === 'hypes' ? 20 : 4).map((h) => (
                <button
                  key={h.id}
                  onClick={() => {
                    onSelectHype(h);
                    onClose();
                  }}
                  className="aspect-[9/14] rounded-2xl overflow-hidden bg-slate-900 relative text-left border border-slate-800 group"
                >
                  <div
                    className={`w-full h-full bg-gradient-to-br ${h.posterGradient} flex flex-col justify-between p-3`}
                  >
                    <div className="flex items-center gap-1 text-[10px] font-mono text-white/90">
                      <Film className="w-3 h-3 text-purple-300" />
                      <span>{h.viewsCount}</span>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-white truncate">
                        @{h.creator.username}
                      </div>
                      <div className="text-[10px] text-white/90 line-clamp-2 mt-0.5">
                        {h.caption}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SOUNDS SECTION */}
        {(activeFilter === 'all' || activeFilter === 'sounds') && sounds.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>Royalty-Free Sounds</span>
            </h4>
            <div className="space-y-2">
              {sounds.slice(0, activeFilter === 'sounds' ? 20 : 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectSound(s.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${s.color} flex items-center justify-center text-white shrink-0`}
                    >
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white truncate">{s.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {s.artist} · {s.duration}s
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
