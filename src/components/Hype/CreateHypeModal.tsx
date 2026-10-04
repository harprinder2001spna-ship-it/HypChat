import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Music,
  Sliders,
  Check,
  Globe,
  Users,
  Flame,
  Volume2,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import { Sound } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SoundSelectorModal } from '../Sound/SoundSelectorModal';
import { audioEngine } from '../../utils/audioEngine';

interface CreateHypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHypeCreated: () => void;
  initialSound?: Sound | null;
}

const FILTERS = [
  { id: 'none', name: 'Normal', css: '' },
  { id: 'vibrant', name: 'Vibrant', css: 'saturate-150 contrast-110' },
  { id: 'cyber', name: 'Cyber', css: 'hue-rotate-30 saturate-200 brightness-110' },
  { id: 'warm', name: 'Warm', css: 'sepia-30 contrast-105' },
  { id: 'noir', name: 'Noir', css: 'grayscale contrast-125' },
  { id: 'sunset', name: 'Sunset', css: 'brightness-105 contrast-115 hue-rotate-15' }
];

const QUICK_TAGS = ['hype', 'urbanvibes', 'electronic', 'cinematic', 'visuals', 'daily'];

export const CreateHypeModal: React.FC<CreateHypeModalProps> = ({
  isOpen,
  onClose,
  onHypeCreated,
  initialSound
}) => {
  const { user } = useAuth();

  // Mode: 'record' | 'preview'
  const [step, setStep] = useState<'capture' | 'edit'>('capture');

  // Camera & MediaRecorder
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Video data & preview
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [videoTheme, setVideoTheme] = useState<'dance' | 'synth' | 'nature' | 'art' | 'custom'>('custom');
  const [posterGradient, setPosterGradient] = useState('from-indigo-900 via-rose-800 to-amber-700');

  // Edit fields
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>(['hype']);
  const [tagInput, setTagInput] = useState('');
  const [selectedSound, setSelectedSound] = useState<Sound | null>(initialSound || null);
  const [isSoundSelectorOpen, setIsSoundSelectorOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('none');
  const [privacy, setPrivacy] = useState<'public' | 'friends'>('public');
  const [soundVolume, setSoundVolume] = useState(80);
  const [trimDuration, setTrimDuration] = useState(15); // seconds

  // Upload/Publish state
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialSound) setSelectedSound(initialSound);
  }, [initialSound]);

  useEffect(() => {
    if (isOpen && step === 'capture' && !videoBlobUrl) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      audioEngine.stop();
    };
  }, [isOpen, step, facingMode]);

  // Timer for recording
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordSeconds((sec) => {
          if (sec >= 30) {
            stopRecording();
            return 30;
          }
          return sec + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError('Camera access not available or blocked. You can still upload a video from your device files!');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    setRecordSeconds(0);

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoBlobUrl(url);
        stopCamera();
        setStep('edit');
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      // Play backing track if sound is selected
      if (selectedSound) {
        audioEngine.playSound(selectedSound.audioKey, selectedSound.id);
      }
    } catch {
      setCameraError('Recording failed on this device.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    audioEngine.stop();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoBlobUrl(url);
    stopCamera();
    setStep('edit');
  };

  const handleAddHashtag = (tag: string) => {
    const clean = tag.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (clean && !hashtags.includes(clean)) {
      setHashtags([...hashtags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handlePublish = async () => {
    if (!user) return;
    setErrorMessage(null);

    if (!caption.trim()) {
      setErrorMessage('Please add a caption for your Hype.');
      return;
    }

    try {
      setIsPublishing(true);

      // Random gradient if none
      const gradients = [
        'from-orange-600 via-rose-600 to-amber-700',
        'from-indigo-800 via-purple-800 to-pink-700',
        'from-teal-800 via-emerald-800 to-cyan-900',
        'from-fuchsia-900 via-rose-900 to-indigo-950'
      ];
      const randomGrad = gradients[Math.floor(Math.random() * gradients.length)];

      await api.createHype({
        userId: user.id,
        caption: caption.trim(),
        hashtags: hashtags.length > 0 ? hashtags : ['hype'],
        soundId: selectedSound ? selectedSound.id : undefined,
        privacy,
        filter: activeFilter,
        videoTheme: 'custom',
        posterGradient: randomGrad,
        videoUrl: videoBlobUrl || ''
      });

      audioEngine.stop();
      onHypeCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to publish video. Try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  const currentFilterClass = FILTERS.find((f) => f.id === activeFilter)?.css || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-md h-full flex flex-col bg-slate-950 text-white relative">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 z-20">
          <button
            onClick={() => {
              audioEngine.stop();
              stopCamera();
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-display font-bold text-sm tracking-wide">
              {step === 'capture' ? 'RECORD HYPE' : 'POLISH & PUBLISH'}
            </span>
          </div>
          {step === 'edit' ? (
            <button
              onClick={() => {
                setStep('capture');
                setVideoBlobUrl(null);
                startCamera();
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Retake
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mx-4 mt-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: CAPTURE VIEW */}
        {step === 'capture' && (
          <div className="flex-1 relative flex flex-col justify-between overflow-hidden bg-slate-900">
            {/* Live Camera Viewfinder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${currentFilterClass}`}
              />
              {cameraError && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-300 max-w-xs mb-4">{cameraError}</p>
                  <label className="px-4 py-2.5 bg-orange-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer hover:bg-orange-400 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload Video File</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Top Sound Badge Overlay */}
            <div className="relative z-10 p-4 flex justify-center">
              <button
                onClick={() => setIsSoundSelectorOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-slate-700/60 text-xs font-medium text-white hover:bg-slate-900/80"
              >
                <Music className="w-3.5 h-3.5 text-orange-400" />
                <span className="max-w-[160px] truncate">
                  {selectedSound ? selectedSound.title : 'Add Sound / Music'}
                </span>
              </button>
            </div>

            {/* Recording Controls */}
            <div className="relative z-10 p-6 flex flex-col items-center gap-4 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent">
              {/* Record duration timer */}
              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 00:30</span>
                </div>
              )}

              <div className="w-full flex items-center justify-around">
                {/* Upload from file button */}
                <label className="flex flex-col items-center gap-1 text-slate-300 hover:text-white cursor-pointer min-h-[44px] justify-center">
                  <Upload className="w-6 h-6" />
                  <span className="text-[10px]">Upload</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Shutter / Record Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-18 h-18 rounded-full border-4 flex items-center justify-center transition-all ${
                    isRecording
                      ? 'border-rose-500 bg-rose-500/20'
                      : 'border-orange-500 hover:scale-105'
                  }`}
                >
                  <div
                    className={`transition-all ${
                      isRecording
                        ? 'w-6 h-6 rounded-md bg-rose-500'
                        : 'w-14 h-14 rounded-full bg-orange-500'
                    }`}
                  />
                </button>

                {/* Flip camera button */}
                <button
                  onClick={toggleCameraFacing}
                  className="flex flex-col items-center gap-1 text-slate-300 hover:text-white min-h-[44px] justify-center"
                >
                  <RefreshCw className="w-6 h-6" />
                  <span className="text-[10px]">Flip</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: EDIT & PUBLISH VIEW */}
        {step === 'edit' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Video preview container */}
            <div className="relative aspect-[9/14] max-h-72 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 mx-auto">
              {videoBlobUrl ? (
                <video
                  src={videoBlobUrl}
                  autoPlay
                  loop
                  playsInline
                  controls
                  className={`w-full h-full object-cover ${currentFilterClass}`}
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${posterGradient} flex items-center justify-center p-6 text-center ${currentFilterClass}`}
                >
                  <Flame className="w-12 h-12 text-white/50" />
                </div>
              )}

              {/* Sound indicator badge */}
              {selectedSound && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[11px] font-mono text-white border border-slate-700/60">
                  <Music className="w-3 h-3 text-orange-400" />
                  <span className="max-w-[140px] truncate">{selectedSound.title}</span>
                </div>
              )}
            </div>

            {/* Filter selection carousel */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Visual Filter</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      activeFilter === f.id
                        ? 'bg-orange-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Selector Row */}
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {selectedSound ? selectedSound.title : 'No background sound selected'}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {selectedSound ? `${selectedSound.artist} · ${selectedSound.genre}` : 'Tap to add royalty-free audio'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedSound && (
                  <button
                    onClick={() => {
                      audioEngine.stop();
                      setSelectedSound(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsSoundSelectorOpen(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
                >
                  {selectedSound ? 'Change' : 'Add Sound'}
                </button>
              </div>
            </div>

            {/* Caption Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's the hype about? Describe your clip..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Hashtags</label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddHashtag(tagInput);
                    }
                  }}
                  placeholder="Type tag and press enter..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddHashtag(tagInput)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-xl"
                >
                  Add
                </button>
              </div>

              {/* Tag chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveHashtag(tag)}
                      className="text-orange-400 hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggested Tags */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 overflow-x-auto no-scrollbar">
                <span>Quick:</span>
                {QUICK_TAGS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleAddHashtag(q)}
                    className="hover:text-orange-400 text-slate-400"
                  >
                    #{q}
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Who can view this Hype</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrivacy('public')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                    privacy === 'public'
                      ? 'bg-orange-500/10 border-orange-500/40 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Globe className={`w-4 h-4 ${privacy === 'public' ? 'text-orange-400' : ''}`} />
                  <div>
                    <div className="text-xs font-bold text-white">Public</div>
                    <div className="text-[10px] text-slate-400">Discoverable by everyone</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPrivacy('friends')}
                  className={`p-3 rounded-2xl border flex items-center gap-2.5 text-left transition-all ${
                    privacy === 'friends'
                      ? 'bg-orange-500/10 border-orange-500/40 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Users className={`w-4 h-4 ${privacy === 'friends' ? 'text-orange-400' : ''}`} />
                  <div>
                    <div className="text-xs font-bold text-white">Friends Only</div>
                    <div className="text-[10px] text-slate-400">Only mutual friends</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Publish CTA button */}
            <div className="pt-2 pb-6">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-sm rounded-xl hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {isPublishing ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Flame className="w-5 h-5 fill-slate-950" />
                    <span>Publish Hype Video</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Royalty-Free Sound Selector Sub-Modal */}
        <SoundSelectorModal
          isOpen={isSoundSelectorOpen}
          onClose={() => setIsSoundSelectorOpen(false)}
          selectedSoundId={selectedSound?.id}
          onSelectSound={(sound) => setSelectedSound(sound)}
        />
      </div>
    </div>
  );
};
