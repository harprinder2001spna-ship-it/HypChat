import React, { useState, useEffect } from 'react';
import { X, Search, Play, Pause, Check, Music } from 'lucide-react';
import { Sound } from '../../types';
import { api } from '../../services/api';
import { audioEngine } from '../../utils/audioEngine';

interface SoundSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSoundId?: string;
  onSelectSound: (sound: Sound) => void;
}

export const SoundSelectorModal: React.FC<SoundSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedSoundId,
  onSelectSound
}) => {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSounds();
    } else {
      audioEngine.stop();
      setPlayingId(null);
    }
  }, [isOpen]);

  const loadSounds = async () => {
    try {
      setIsLoading(true);
      const list = await api.getSounds();
      setSounds(list);
    } catch {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlay = (sound: Sound) => {
    if (playingId === sound.id) {
      audioEngine.stop();
      setPlayingId(null);
    } else {
      audioEngine.playSound(sound.audioKey, sound.id);
      setPlayingId(sound.id);
    }
  };

  const filteredSounds = sounds.filter(
    s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 flex flex-col max-h-[80vh] shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Royalty-Free Sounds</h3>
              <p className="text-[10px] text-emerald-400 font-medium">100% Licensed & Copyright Safe</p>
            </div>
          </div>
          <button
            onClick={() => {
              audioEngine.stop();
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sound titles, genres or artists..."
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Sound List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading sound library...</div>
          ) : filteredSounds.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No sounds found.</div>
          ) : (
            filteredSounds.map((sound) => {
              const isSelected = selectedSoundId === sound.id;
              const isPlaying = playingId === sound.id;

              return (
                <div
                  key={sound.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-orange-500/10 border-orange-500/40'
                      : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
                    <button
                      onClick={() => handleTogglePlay(sound)}
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${sound.color} flex items-center justify-center text-white shrink-0 shadow-sm active:scale-95 transition-transform`}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="text-xs font-bold text-white truncate">
                        {sound.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {sound.artist} · <span className="text-slate-500">{sound.genre}</span> · {sound.duration}s
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      audioEngine.stop();
                      setPlayingId(null);
                      onSelectSound(sound);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-slate-950'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Selected</span>
                      </>
                    ) : (
                      <span>Use</span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
