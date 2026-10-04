import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Upload,
  RefreshCw,
  Check,
  RotateCcw,
  Trash2,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { User, AiCharacterStyle } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AiCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updatedUser: User) => void;
}

interface StyleOption {
  id: AiCharacterStyle;
  label: string;
  badge: string;
  description: string;
  accentGradient: string;
}

const STYLES: StyleOption[] = [
  {
    id: 'Realistic',
    label: 'Realistic',
    badge: 'Studio HD',
    description: 'Photorealistic character portrait with natural studio lighting',
    accentGradient: 'from-violet-600 to-indigo-700'
  },
  {
    id: 'Anime',
    label: 'Anime',
    badge: 'Neo Shonen',
    description: 'Modern Japanese anime aesthetic with crisp cel-shaded lines',
    accentGradient: 'from-purple-600 to-pink-600'
  },
  {
    id: 'Artistic',
    label: 'Artistic',
    badge: 'Oil & Canvas',
    description: 'Expressive fine-art digital painting with rich brush textures',
    accentGradient: 'from-fuchsia-600 to-purple-800'
  },
  {
    id: '3D',
    label: '3D Render',
    badge: 'Stylized 3D',
    description: 'Smooth Disney/Pixar animated 3D character with soft ambient depth',
    accentGradient: 'from-violet-500 to-purple-700'
  },
  {
    id: 'Cyber',
    label: 'Cyber',
    badge: 'Cyberpunk',
    description: 'Futuristic cyberpunk streetwear with rich neon violet reflections',
    accentGradient: 'from-purple-700 to-cyan-700'
  },
  {
    id: 'Minimal',
    label: 'Minimal',
    badge: 'Line Art',
    description: 'Clean vector silhouette and editorial duotone royal purple aesthetic',
    accentGradient: 'from-purple-900 to-violet-800'
  }
];

export const AiCharacterModal: React.FC<AiCharacterModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated
}) => {
  const { user, updateUser } = useAuth();

  const [selectedPhoto, setSelectedPhoto] = useState<string>(user?.avatar || '');
  const [selectedStyle, setSelectedStyle] = useState<AiCharacterStyle>('Cyber');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] = useState<{
    imageUrl: string;
    style: AiCharacterStyle;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedPhoto(url);
    setGeneratedCharacter(null);
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const res = await api.generateAiCharacter({
        userId: user.id,
        style: selectedStyle,
        sourcePhotoUrl: selectedPhoto
      });
      setGeneratedCharacter({
        imageUrl: res.imageUrl,
        style: res.style as AiCharacterStyle
      });
    } catch {
      // non-blocking
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseAsProfilePicture = async () => {
    if (!generatedCharacter) return;
    try {
      setIsSaving(true);
      const originalAvatar = user.originalAvatar || user.avatar;
      const updated = await api.updateProfile({
        userId: user.id,
        avatar: generatedCharacter.imageUrl,
        originalAvatar,
        aiAvatar: {
          imageUrl: generatedCharacter.imageUrl,
          style: generatedCharacter.style,
          createdAt: new Date().toISOString()
        }
      });
      updateUser(updated);
      if (onProfileUpdated) onProfileUpdated(updated);

      setSuccessToast('AI Character applied as your profile picture!');
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1200);
    } catch {
      // non-blocking
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwitchBackToNormal = async () => {
    const fallbackPhoto =
      user.originalAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
    try {
      setIsSaving(true);
      const updated = await api.updateProfile({
        userId: user.id,
        avatar: fallbackPhoto,
        aiAvatar: null
      });
      updateUser(updated);
      if (onProfileUpdated) onProfileUpdated(updated);
      setSuccessToast('Switched back to your normal profile photo!');
      setTimeout(() => {
        setSuccessToast(null);
        onClose();
      }, 1200);
    } catch {
      // non-blocking
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAiCharacter = async () => {
    try {
      setIsSaving(true);
      const fallbackPhoto =
        user.originalAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
      const updated = await api.updateProfile({
        userId: user.id,
        avatar: fallbackPhoto,
        aiAvatar: null,
        originalAvatar: undefined
      });
      updateUser(updated);
      if (onProfileUpdated) onProfileUpdated(updated);
      setGeneratedCharacter(null);
      setSuccessToast('AI Character removed.');
      setTimeout(() => {
        setSuccessToast(null);
      }, 1500);
    } catch {
      // non-blocking
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto select-none">
      <div className="w-full max-w-md bg-neutral-950 border border-purple-900/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white my-auto max-h-[92vh] flex flex-col relative overflow-hidden">
        {/* Subtle purple ambiance header backdrop */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-purple-900/25 via-violet-950/10 to-transparent pointer-events-none" />

        {/* Top Header */}
        <div className="relative flex items-center justify-between pb-4 border-b border-neutral-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-sm sm:text-base tracking-wide text-white">
                Create Your AI Character
              </h2>
              <p className="text-[10px] text-purple-300/80">
                Optional custom AI avatar tailored to your identity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toast Notification */}
        {successToast && (
          <div className="mt-3 p-2.5 rounded-xl bg-purple-600/90 text-white font-bold text-xs flex items-center justify-center gap-2 animate-in zoom-in-95 duration-200 shadow-lg shadow-purple-950">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Active AI Character info bar if already equipped */}
        {user.aiAvatar && !generatedCharacter && (
          <div className="mt-3 p-3 bg-purple-950/40 border border-purple-800/50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={user.aiAvatar.imageUrl}
                alt="AI Avatar"
                className="w-10 h-10 rounded-full border border-purple-500/80 object-cover"
              />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Current AI Character</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-900/60 text-[9px] font-mono text-purple-300">
                    {user.aiAvatar.style}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400">Active profile photo</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleSwitchBackToNormal}
                disabled={isSaving}
                className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 transition-colors"
                title="Switch back to normal photo"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Revert</span>
              </button>
              <button
                onClick={handleDeleteAiCharacter}
                disabled={isSaving}
                className="p-1.5 rounded-xl text-neutral-500 hover:text-red-400 transition-colors"
                title="Delete AI Character"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Main Workflow Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-5">
          {/* STEP 1: Photo Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-purple-900/80 text-[10px] font-mono flex items-center justify-center text-purple-300">
                  1
                </span>
                <span>Select Source Photo</span>
              </label>
              <label className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-neutral-900/70 border border-neutral-800/80 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-neutral-800 border-2 border-purple-500/40 shrink-0">
                <img
                  src={selectedPhoto || user.avatar}
                  alt="Source"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {selectedPhoto === user.avatar ? 'Current Profile Photo' : 'Custom Uploaded Photo'}
                </div>
                <p className="text-[10px] text-neutral-400 mt-0.5 line-clamp-2">
                  The AI Character will synthesize features and pose from this portrait.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: Style Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-purple-900/80 text-[10px] font-mono flex items-center justify-center text-purple-300">
                  2
                </span>
                <span>Choose AI Character Style</span>
              </label>
              <span className="text-[10px] text-purple-400 font-mono">
                {STYLES.length} styles available
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      setSelectedStyle(style.id);
                      setGeneratedCharacter(null);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/50'
                        : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
                    }`}
                  >
                    {/* Style header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{style.label}</span>
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                          {style.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-snug line-clamp-2">
                      {style.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Generation & Preview State */}
          {isGenerating ? (
            <div className="p-6 rounded-2xl bg-neutral-900/80 border border-purple-800/40 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-600/60 flex items-center justify-center text-purple-400 relative">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <div className="absolute inset-0 rounded-2xl border border-purple-400 animate-ping opacity-30" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Synthesizing AI Character...</h4>
                <p className="text-[10px] text-purple-300 font-mono mt-0.5">
                  Rendering {selectedStyle} aesthetic
                </p>
              </div>
              <div className="w-48 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          ) : generatedCharacter ? (
            /* PREVIEW */
            <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 to-neutral-900 border border-purple-700/60 flex flex-col items-center text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl overflow-hidden bg-neutral-900 border-2 border-purple-500 shadow-xl shadow-purple-950/60">
                  <img
                    src={generatedCharacter.imageUrl}
                    alt="AI Character Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-mono text-[9px] font-bold shadow-md">
                  {generatedCharacter.style}
                </span>
              </div>

              <div className="pt-1">
                <h4 className="text-xs font-bold text-white">Your AI Character is ready!</h4>
                <p className="text-[10px] text-neutral-400">
                  Preview looks great. You can apply it or regenerate another variation.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-3 border-t border-neutral-900 flex flex-col gap-2">
          {!generatedCharacter ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-[#7c3aed] hover:bg-violet-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Character</span>
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating || isSaving}
                  className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>

                <button
                  type="button"
                  onClick={handleUseAsProfilePicture}
                  disabled={isSaving}
                  className="flex-[2] py-2.5 bg-[#7c3aed] hover:bg-violet-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-950/50 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isSaving ? 'Applying...' : 'Use as Profile Picture'}</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
