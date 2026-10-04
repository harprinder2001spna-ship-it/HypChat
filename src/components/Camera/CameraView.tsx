import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Music,
  Send,
  Download,
  Check,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Users,
  Film
} from 'lucide-react';
import { Sound, User } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SoundSelectorModal } from '../Sound/SoundSelectorModal';
import { audioEngine } from '../../utils/audioEngine';
import { HypChatAppIcon } from '../Common/HypChatLogo';

interface CameraViewProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryPosted?: () => void;
  onHypePosted?: () => void;
  onPostCreated?: () => void;
  onSendToChat?: (targetUser: User, mediaUrl: string, mediaType: 'image' | 'video') => void;
}

const CAMERA_FILTERS = [
  { id: 'none', name: 'Normal', css: '' },
  { id: 'vivid', name: 'Vivid', css: 'saturate-150 contrast-110' },
  { id: 'noir', name: 'Noir', css: 'grayscale contrast-125 brightness-95' },
  { id: 'warm', name: 'Warmth', css: 'sepia-25 contrast-105 hue-rotate-350' },
  { id: 'cyber', name: 'HypPurple', css: 'contrast-120 saturate-125' },
  { id: 'fade', name: 'Matte', css: 'brightness-105 contrast-90' }
];

export const CameraView: React.FC<CameraViewProps> = ({
  isOpen,
  onClose,
  onStoryPosted,
  onHypePosted,
  onPostCreated,
  onSendToChat
}) => {
  const { user } = useAuth();

  // Mode: 'photo' | 'video'
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');

  // Stream & Recording state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isScreenFlashing, setIsScreenFlashing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Captured output
  const [capturedMedia, setCapturedMedia] = useState<{
    url: string;
    type: 'image' | 'video';
  } | null>(null);

  // Edit / Polish tools
  const [caption, setCaption] = useState('');
  const [textOverlay, setTextOverlay] = useState('');
  const [activeFilter, setActiveFilter] = useState('none');
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [isSoundSelectorOpen, setIsSoundSelectorOpen] = useState(false);

  // Send to friends sheet
  const [showFriendPicker, setShowFriendPicker] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [sentFriendIds, setSentFriendIds] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !capturedMedia) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      audioEngine.stop();
    };
  }, [isOpen, facingMode, capturedMedia]);

  // Video recording timer
  useEffect(() => {
    let timer: number;
    if (isRecording) {
      timer = window.setInterval(() => {
        setRecordSeconds((sec) => {
          if (sec >= 30) {
            stopVideoRecording();
            return 30;
          }
          return sec + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError(
        'Camera access not available or restricted. You can still select media from device files.'
      );
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

  // Photo Snap Handler
  const capturePhoto = () => {
    if (!videoRef.current) return;

    if (flashEnabled) {
      setIsScreenFlashing(true);
      setTimeout(() => setIsScreenFlashing(false), 200);
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror image for natural selfie result
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopCamera();
    setCapturedMedia({ url: dataUrl, type: 'image' });
  };

  // Video Recording Handlers
  const startVideoRecording = () => {
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
        stopCamera();
        setCapturedMedia({ url, type: 'video' });
      };
      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      if (selectedSound) {
        audioEngine.playSound(selectedSound.audioKey, selectedSound.id);
      }
    } catch {
      setCameraError('Recording failed on this device.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    audioEngine.stop();
  };

  const handleRetake = () => {
    setCapturedMedia(null);
    setCaption('');
    setTextOverlay('');
    setActiveFilter('none');
    setShowFriendPicker(false);
    setSentFriendIds([]);
    setPublishSuccessMsg(null);
    startCamera();
  };

  // Publishing Actions
  const handleShareToStory = async () => {
    if (!user || !capturedMedia) return;
    try {
      setIsPublishing(true);
      await api.createStory({
        userId: user.id,
        mediaUrl: capturedMedia.url,
        mediaType: capturedMedia.type,
        caption: caption.trim(),
        textOverlay: textOverlay.trim(),
        soundTitle: selectedSound?.title,
        filter: activeFilter
      });
      setPublishSuccessMsg('Added to your Story!');
      setTimeout(() => {
        if (onStoryPosted) onStoryPosted();
        onClose();
      }, 1000);
    } catch {
      // error handled
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePostToHypeOrFeed = async () => {
    if (!user || !capturedMedia) return;
    try {
      setIsPublishing(true);
      if (capturedMedia.type === 'video') {
        // Post as Hype Video
        await api.createHype({
          userId: user.id,
          caption: caption.trim() || 'Camera Drop',
          hashtags: ['camera', 'hypchat', 'vibes'],
          soundId: selectedSound?.id,
          privacy: 'public',
          filter: activeFilter,
          videoUrl: capturedMedia.url
        });
        setPublishSuccessMsg('Published to Hype!');
        setTimeout(() => {
          if (onHypePosted) onHypePosted();
          onClose();
        }, 1000);
      } else {
        // Post as Social Feed Post
        await api.createSocialPost({
          userId: user.id,
          mediaUrl: capturedMedia.url,
          mediaType: 'image',
          caption: caption.trim() || 'Captured on HypChat Camera 📸',
          hashtags: ['moment', 'hypchat'],
          soundTitle: selectedSound?.title
        });
        setPublishSuccessMsg('Posted to Social Feed!');
        setTimeout(() => {
          if (onPostCreated) onPostCreated();
          onClose();
        }, 1000);
      }
    } catch {
      // error handled
    } finally {
      setIsPublishing(false);
    }
  };

  const openSendToFriends = async () => {
    if (!user) return;
    try {
      const list = await api.getFriends(user.id);
      setFriends(list);
      setShowFriendPicker(true);
    } catch {
      // error
    }
  };

  const handleSendToFriend = async (friendUser: User) => {
    if (!user || !capturedMedia || sentFriendIds.includes(friendUser.id)) return;
    try {
      const conv = await api.startConversation(user.id, friendUser.id);
      await api.sendMessage({
        conversationId: conv.id,
        senderId: user.id,
        receiverId: friendUser.id,
        text: caption.trim() || undefined,
        mediaUrl: capturedMedia.url,
        mediaType: capturedMedia.type
      });
      setSentFriendIds((prev) => [...prev, friendUser.id]);
    } catch {
      // error
    }
  };

  const handleSaveToDevice = () => {
    if (!capturedMedia) return;
    const a = document.createElement('a');
    a.href = capturedMedia.url;
    a.download = `hypchat_${Date.now()}.${capturedMedia.type === 'video' ? 'webm' : 'jpg'}`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    const url = URL.createObjectURL(file);
    stopCamera();
    setCapturedMedia({
      url,
      type: isVideo ? 'video' : 'image'
    });
  };

  if (!isOpen) return null;

  const activeFilterCss = CAMERA_FILTERS.find((f) => f.id === activeFilter)?.css || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden select-none">
      <div className="w-full max-w-md h-full flex flex-col bg-black text-white relative">
        {/* Flash Screenbang Overlay */}
        {isScreenFlashing && (
          <div className="absolute inset-0 z-50 bg-white pointer-events-none animate-out fade-out duration-200" />
        )}

        {/* Top Header / Status */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 pt-safe bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                audioEngine.stop();
                stopCamera();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <HypChatAppIcon size="sm" />
          </div>

          {!capturedMedia ? (
            <div className="flex items-center gap-2">
              {/* Sound selector pill */}
              <button
                onClick={() => setIsSoundSelectorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-neutral-700/60 text-xs font-medium text-white hover:bg-neutral-800"
              >
                <Music className="w-3.5 h-3.5 text-purple-400" />
                <span className="max-w-[120px] truncate">
                  {selectedSound ? selectedSound.title : 'Add Sound'}
                </span>
              </button>

              {/* Flash Toggle */}
              <button
                onClick={() => setFlashEnabled(!flashEnabled)}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                  flashEnabled
                    ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-950/40'
                    : 'bg-black/40 text-neutral-300 hover:text-white'
                }`}
              >
                {flashEnabled ? <Zap className="w-4 h-4 fill-white" /> : <ZapOff className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-semibold text-neutral-300 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </div>
          )}
        </div>

        {/* Success toast banner */}
        {publishSuccessMsg && (
          <div className="absolute top-16 left-4 right-4 z-40 p-3 bg-emerald-500/90 text-black font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-2xl animate-in zoom-in-95 duration-200">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{publishSuccessMsg}</span>
          </div>
        )}

        {/* VIEWFINDER / CAPTURE VIEW */}
        {!capturedMedia ? (
          <div className="flex-1 relative flex flex-col justify-between overflow-hidden bg-neutral-950">
            {/* Live Camera Feed */}
            <div className="absolute inset-0 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${activeFilterCss}`}
              />
              {cameraError && (
                <div className="absolute inset-0 bg-neutral-950/90 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
                    <Camera className="w-6 h-6 text-purple-400" />
                  </div>
                  <p className="text-xs text-neutral-300 max-w-xs mb-4">{cameraError}</p>
                  <label className="px-4 py-2.5 bg-[#7c3aed] text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-violet-600 transition-colors flex items-center gap-2 shadow-lg shadow-purple-950/40">
                    <Film className="w-4 h-4" />
                    <span>Upload from Device</span>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Live Text Overlay Preview */}
            {textOverlay && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-6">
                <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-lg font-extrabold text-white text-center border border-white/20 shadow-xl">
                  {textOverlay}
                </span>
              </div>
            )}

            {/* Bottom Controls Area */}
            <div className="relative z-20 pt-8 pb-8 px-6 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col items-center gap-4">
              {/* Record duration indicator */}
              {isRecording && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span>00:{recordSeconds < 10 ? `0${recordSeconds}` : recordSeconds} / 00:30</span>
                </div>
              )}

              {/* Shutter Bar with Flip & File Pick */}
              <div className="w-full flex items-center justify-around">
                {/* File picker */}
                <label className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white cursor-pointer min-h-[44px] justify-center">
                  <Film className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Upload</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Shutter Button */}
                {captureMode === 'photo' ? (
                  <button
                    onClick={capturePhoto}
                    aria-label="Capture Photo"
                    className="w-18 h-18 rounded-full border-4 border-white p-1 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded-full bg-white" />
                  </button>
                ) : (
                  <button
                    onClick={isRecording ? stopVideoRecording : startVideoRecording}
                    aria-label="Record Video"
                    className={`w-18 h-18 rounded-full border-4 flex items-center justify-center transition-all ${
                      isRecording ? 'border-[#7c3aed] p-2' : 'border-[#7c3aed] p-1 hover:scale-105'
                    }`}
                  >
                    <div
                      className={`transition-all bg-[#7c3aed] ${
                        isRecording ? 'w-6 h-6 rounded-md' : 'w-full h-full rounded-full'
                      }`}
                    />
                  </button>
                )}

                {/* Camera Flip */}
                <button
                  onClick={toggleCameraFacing}
                  className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white min-h-[44px] justify-center"
                >
                  <RefreshCw className="w-6 h-6" />
                  <span className="text-[10px] font-medium">Flip</span>
                </button>
              </div>

              {/* Mode Switcher: PHOTO vs VIDEO */}
              <div className="flex items-center gap-6 mt-1 text-xs font-bold tracking-wider">
                <button
                  onClick={() => setCaptureMode('photo')}
                  className={`pb-1 transition-all ${
                    captureMode === 'photo'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  PHOTO
                </button>
                <button
                  onClick={() => setCaptureMode('video')}
                  className={`pb-1 transition-all ${
                    captureMode === 'video'
                      ? 'text-white border-b-2 border-purple-500'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  VIDEO
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW & PUBLISH VIEW */
          <div className="flex-1 relative flex flex-col justify-between overflow-hidden bg-black">
            {/* Captured Media Display */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              {capturedMedia.type === 'image' ? (
                <img
                  src={capturedMedia.url}
                  alt="Captured"
                  className={`w-full h-full object-cover ${activeFilterCss}`}
                />
              ) : (
                <video
                  src={capturedMedia.url}
                  autoPlay
                  loop
                  playsInline
                  controls
                  className={`w-full h-full object-cover ${activeFilterCss}`}
                />
              )}

              {/* Live Overlay Text */}
              {textOverlay && (
                <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                  <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-lg font-extrabold text-white text-center border border-white/20 shadow-2xl">
                    {textOverlay}
                  </span>
                </div>
              )}
            </div>

            {/* Filter carousel */}
            <div className="relative z-20 pt-16 px-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {CAMERA_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap backdrop-blur-md transition-all ${
                      activeFilter === f.id
                        ? 'bg-[#7c3aed] text-white shadow-md shadow-purple-950/40'
                        : 'bg-black/50 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Edit overlay input fields */}
            <div className="relative z-20 p-4 space-y-2 bg-gradient-to-t from-black via-black/80 to-transparent">
              {/* Caption & Text Overlay */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                  className="flex-1 bg-neutral-900/80 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
                <input
                  type="text"
                  value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  placeholder="Text on screen..."
                  className="w-32 bg-neutral-900/80 border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Main Sharing Destinations */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {/* Share to Story */}
                <button
                  onClick={handleShareToStory}
                  disabled={isPublishing}
                  className="py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Your Story</span>
                </button>

                {/* Post to Hype / Feed */}
                <button
                  onClick={handlePostToHypeOrFeed}
                  disabled={isPublishing}
                  className="py-3 bg-[#7c3aed] hover:bg-violet-600 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors shadow-lg shadow-purple-950/40"
                >
                  <Film className="w-4 h-4" />
                  <span>{capturedMedia.type === 'video' ? 'Post Hype' : 'Post to Feed'}</span>
                </button>

                {/* Send to Friend */}
                <button
                  onClick={openSendToFriends}
                  className="py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Send Chat</span>
                </button>
              </div>

              {/* Secondary save button */}
              <div className="flex justify-center pt-1">
                <button
                  onClick={handleSaveToDevice}
                  className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 py-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Save to device</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send to Friends Direct Sheet */}
        {showFriendPicker && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col justify-end p-4">
            <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-5 max-h-[70vh] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">Send directly to friends</h3>
                <button
                  onClick={() => setShowFriendPicker(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {friends.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-500">
                    No friends added yet. Connect in the Friends tab!
                  </div>
                ) : (
                  friends.map((item) => {
                    const isSent = sentFriendIds.includes(item.friendId);
                    return (
                      <div
                        key={item.friendId}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-800/60"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img
                            src={item.friend.avatar}
                            alt={item.friend.name}
                            className="w-9 h-9 rounded-full bg-neutral-700 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">
                              {item.friend.name}
                            </div>
                            <div className="text-[10px] text-neutral-400 truncate">
                              @{item.friend.username}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSendToFriend(item.friend)}
                          disabled={isSent}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 ${
                            isSent
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#7c3aed] text-white hover:bg-violet-600 shadow-md shadow-purple-950/40'
                          }`}
                        >
                          {isSent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                          <span>{isSent ? 'Sent' : 'Send'}</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
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
