import React, { useState, useEffect } from 'react';
import { X, Play, Pause, Music, Flame, Sparkles } from 'lucide-react';
import { Sound, HypeVideo } from '../../types';
import { api } from '../../services/api';
import { audioEngine } from '../../utils/audioEngine';

interface SoundDetailModalProps {
  soundId: string | null;
  onClose: () => void;
  onUseSound: (sound: Sound) => void;
  onSelectHype?: (hype: HypeVideo) => void;
}

export const SoundDetailModal: React.FC<SoundDetailModalProps> = ({
  soundId,
  onClose,
  onUseSound,
  onSelectHype
}) => {
  const [data, setData] = useState<{ sound: Sound; hypes: HypeVideo[] } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (soundId) {
      loadDetails(soundId);
    } else {
      audioEngine.stop();
      setIsPlaying(false);
    }
  }, [soundId]);

  const loadDetails = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await api.getSoundDetails(id);
      setData(res);
    } catch {
      // non-blocking
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePlay = () => {
    if (!data) return;
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
    } else {
      audioEngine.playSound(data.sound.audioKey, data.sound.id);
      setIsPlaying(true);
    }
  };

  if (!soundId) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 flex flex-col max-h-[85vh] shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-orange-400">Audio Track</span>
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

        {isLoading || !data ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading sound info...</div>
        ) : (
          <>
            {/* Sound Hero Card */}
            <div className="flex items-center gap-4 p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-5">
              <button
                onClick={handleTogglePlay}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${data.sound.color} flex items-center justify-center text-white shrink-0 shadow-lg active:scale-95 transition-transform`}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-white" />
                ) : (
                  <Play className="w-7 h-7 fill-white ml-0.5" />
                )}
              </button>

              <div className="min-w-0 flex-1 text-left">
                <h3 className="text-sm font-bold text-white truncate">
                  {data.sound.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {data.sound.artist} · <span className="text-orange-400 font-mono">{data.sound.genre}</span>
                </p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono">
                  <span>{data.sound.useCount} Hypes created</span>
                  <span>·</span>
                  <span>{data.sound.duration}s length</span>
                </div>
              </div>
            </div>

            {/* CTA: Use This Sound */}
            <button
              onClick={() => {
                audioEngine.stop();
                onUseSound(data.sound);
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-5 shadow-lg shadow-orange-500/20"
            >
              <Music className="w-4 h-4" />
              <span>Use This Sound in Hype</span>
            </button>

            {/* Videos Using This Sound */}
            <div className="flex-1 overflow-y-auto pr-1">
              <h4 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Hypes Using This Sound ({data.hypes.length})</span>
              </h4>

              {data.hypes.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Be the first creator to drop a Hype with this sound!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {data.hypes.map((hype) => (
                    <button
                      key={hype.id}
                      onClick={() => {
                        if (onSelectHype) {
                          onSelectHype(hype);
                          onClose();
                        }
                      }}
                      className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-800 text-left border border-slate-700/50 hover:border-orange-500/50 transition-all"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${hype.posterGradient} opacity-90`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-mono text-white/90 bg-slate-950/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        <Flame className="w-3 h-3 text-orange-400" />
                        <span>{hype.viewsCount}</span>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5 right-2.5">
                        <div className="text-[11px] font-semibold text-white truncate">
                          @{hype.creator.username}
                        </div>
                        <div className="text-[10px] text-slate-300 line-clamp-1 mt-0.5">
                          {hype.caption}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
