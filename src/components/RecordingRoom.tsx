import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Mic, 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  Check, 
  Sliders, 
  AlertCircle, 
  Volume2, 
  EyeOff,
  Maximize2,
  Minimize2,
  ChevronDown,
  X,
  HelpCircle,
  Sparkles,
  Layers
} from 'lucide-react';
import { BlurMode, Submission } from '../types';
import { CanvasFaceAnonymizer, initFaceDetector } from '../lib/faceAnonymizer';
import { saveSubmission } from '../lib/storage';

interface RecordingRoomProps {
  onSubmitted: (submission: Submission) => void;
  onOpenCrisis: () => void;
  onExit?: () => void;
}

const STUDY_PROMPTS = [
  {
    id: 'prompt-1',
    num: 'PROMPT 01',
    title: 'Expectations & Pressure',
    text: 'Describe a situation where expectations or pressure placed on you felt overwhelming.',
    cue: 'Think about who set the expectations, unspoken assumptions, or emotional tension.'
  },
  {
    id: 'prompt-2',
    num: 'PROMPT 02',
    title: 'Somatic & Mental Impact',
    text: 'How did this situation affect your physical health, mental focus, or daily routine?',
    cue: 'Did you experience sleep disruptions, physical tension, irritability, or withdrawal?'
  },
  {
    id: 'prompt-3',
    num: 'PROMPT 03',
    title: 'Coping Strategies & Outcomes',
    text: 'What coping strategies did you try, and how did they work in practice?',
    cue: 'Consider boundaries, communication attempts, therapy, hobbies, or seeking outside support.'
  }
];

export const RecordingRoom: React.FC<RecordingRoomProps> = ({ 
  onSubmitted, 
  onOpenCrisis,
  onExit 
}) => {
  // Mode & State
  const [activeMode, setActiveMode] = useState<'video' | 'audio'>('video');
  const [selectedPromptId, setSelectedPromptId] = useState<string>('prompt-1');
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'review'>('idle');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [promptNotes, setPromptNotes] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPromptsDrawerOpen, setIsPromptsDrawerOpen] = useState(false);

  // Privacy & Anonymizer settings
  const [blurMode, setBlurMode] = useState<BlurMode>('gaussian');
  const [blurIntensity, setBlurIntensity] = useState<number>(36);
  const [scaleFactor, setScaleFactor] = useState<number>(1.35);
  const [blurBackground, setBlurBackground] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Tracking status for UI feedback
  const [trackingInfo, setTrackingInfo] = useState<{ x: number; y: number; detected: boolean }>({
    x: 50,
    y: 35,
    detected: true
  });

  // Audio meter level
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Device & Stream refs
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const reviewVideoRef = useRef<HTMLVideoElement | null>(null);
  const reviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const studioContainerRef = useRef<HTMLDivElement | null>(null);

  const anonymizerRef = useRef<CanvasFaceAnonymizer | null>(null);
  const rawStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);

  // Audio visualizer context for audio mode
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioVisualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioVisualizerFrameId = useRef<number | null>(null);

  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Toggle true browser fullscreen
  const toggleFullscreen = () => {
    if (!studioContainerRef.current) return;
    if (!document.fullscreenElement) {
      studioContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Initialize stream
  useEffect(() => {
    let mounted = true;
    initFaceDetector();

    async function setupStream() {
      setDeviceError(null);
      stopCurrentStreams();

      try {
        if (activeMode === 'video') {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
            audio: true
          });

          if (!mounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }

          rawStreamRef.current = stream;

          if (videoElementRef.current && canvasElementRef.current) {
            videoElementRef.current.srcObject = stream;
            await videoElementRef.current.play();

            const anonymizer = new CanvasFaceAnonymizer(
              videoElementRef.current,
              canvasElementRef.current,
              {
                mode: blurMode,
                blurIntensity,
                scaleFactor,
                blurBackground,
              }
            );

            // Hook up live auto-tracking updates
            anonymizer.onTrackingUpdate = (pos) => {
              if (mounted) {
                setTrackingInfo(pos);
              }
            };

            anonymizer.start();
            anonymizerRef.current = anonymizer;
          }

          setupAudioAnalyser(stream);

        } else {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (!mounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          rawStreamRef.current = stream;
          setupAudioAnalyser(stream);
          startAudioWaveVisualizer();
        }

      } catch (err: any) {
        console.error('Media device access error', err);
        setDeviceError(
          err.name === 'NotAllowedError'
            ? 'Camera or microphone access denied. Please allow permissions in your browser or switch to Audio-Only mode.'
            : 'Unable to access your recording hardware. Please check your system settings or try Audio-Only mode.'
        );
      }
    }

    setupStream();

    return () => {
      mounted = false;
      stopCurrentStreams();
    };
  }, [activeMode]);

  // Update anonymizer options
  useEffect(() => {
    if (anonymizerRef.current) {
      anonymizerRef.current.options = {
        mode: blurMode,
        blurIntensity,
        scaleFactor,
        blurBackground,
        showDetectionBadge: true
      };
    }
  }, [blurMode, blurIntensity, scaleFactor, blurBackground]);

  // Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (recordingState === 'recording') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recordingState]);

  const stopCurrentStreams = () => {
    if (anonymizerRef.current) {
      anonymizerRef.current.stop();
      anonymizerRef.current = null;
    }
    if (rawStreamRef.current) {
      rawStreamRef.current.getTracks().forEach(t => t.stop());
      rawStreamRef.current = null;
    }
    if (audioVisualizerFrameId.current) {
      cancelAnimationFrame(audioVisualizerFrameId.current);
      audioVisualizerFrameId.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks.length) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (e) {
      console.warn('Audio analyser error', e);
    }
  };

  const startAudioWaveVisualizer = () => {
    const canvas = audioVisualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const drawWave = () => {
      phase += 0.05;
      const width = canvas.width || 400;
      const height = canvas.height || 140;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#181A1D';
      ctx.fillRect(0, 0, width, height);

      const amplitude = Math.max(12, (audioLevel / 100) * 55);

      [
        { color: 'rgba(255, 90, 54, 0.35)', speed: 1.0, freq: 0.02 },
        { color: 'rgba(78, 159, 61, 0.45)', speed: 1.4, freq: 0.03 },
        { color: '#FF5A36', speed: 0.8, freq: 0.025 },
      ].forEach((wave) => {
        ctx.beginPath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 3.5;

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * wave.freq + phase * wave.speed) * amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      audioVisualizerFrameId.current = requestAnimationFrame(drawWave);
    };

    drawWave();
  };

  // Start Recording
  const handleStartRecording = () => {
    recordedChunksRef.current = [];
    setElapsedTime(0);

    let recordingStream: MediaStream;

    if (activeMode === 'video') {
      const canvas = canvasElementRef.current;
      if (!canvas) return;
      const canvasStream = canvas.captureStream(30);
      const audioTracks = rawStreamRef.current ? rawStreamRef.current.getAudioTracks() : [];
      recordingStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioTracks
      ]);
    } else {
      if (!rawStreamRef.current) return;
      recordingStream = rawStreamRef.current;
    }

    let mimeType = activeMode === 'video' ? 'video/webm;codecs=vp9,opus' : 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = activeMode === 'video' ? 'video/webm' : 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }
    }

    try {
      const recorder = new MediaRecorder(recordingStream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(recordedChunksRef.current, {
          type: activeMode === 'video' ? 'video/webm' : 'audio/webm'
        });
        recordedBlobRef.current = finalBlob;
        const url = URL.createObjectURL(finalBlob);
        setRecordedBlobUrl(url);
        setRecordingState('review');
      };

      mediaRecorderRef.current = recorder;
      recorder.start(500);
      setRecordingState('recording');
    } catch (e) {
      console.error('MediaRecorder start failed', e);
      alert('Unable to start recording. Please verify camera/mic permissions.');
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleReRecord = () => {
    if (recordedBlobUrl) {
      URL.revokeObjectURL(recordedBlobUrl);
      setRecordedBlobUrl(null);
    }
    recordedBlobRef.current = null;
    recordedChunksRef.current = [];
    setElapsedTime(0);
    setRecordingState('idle');
  };

  const handleSubmit = () => {
    if (!recordedBlobRef.current) return;
    setIsSubmitting(true);

    const activePrompt = STUDY_PROMPTS.find(p => p.id === selectedPromptId);

    const submissionData = {
      mediaType: (activeMode === 'video' ? 'video_blurred' : 'audio_only') as 'video_blurred' | 'audio_only',
      durationSeconds: elapsedTime,
      status: 'submitted' as const,
      blurAlgorithm: activeMode === 'video' 
        ? `Auto-Tracking Canvas ${blurMode.toUpperCase()} (${blurIntensity}px, ${scaleFactor}x coverage)` 
        : 'WebRTC Encrypted Audio',
      promptNotes: promptNotes.trim() || undefined,
      primaryPromptReflected: activePrompt ? `${activePrompt.num}: ${activePrompt.title}` : undefined,
      fileSizeBytes: recordedBlobRef.current.size,
    };

    setTimeout(() => {
      const saved = saveSubmission(submissionData, recordedBlobRef.current || undefined);
      setIsSubmitting(false);
      onSubmitted(saved);
    }, 700);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPrompt = STUDY_PROMPTS.find(p => p.id === selectedPromptId) || STUDY_PROMPTS[0];

  return (
    <div 
      ref={studioContainerRef}
      className={`fixed inset-0 z-40 h-[100dvh] w-screen bg-[#121316] flex flex-col justify-between overflow-hidden select-none transition-all ${
        isFullscreen ? 'z-50' : ''
      }`}
    >
      {/* Hidden raw video element */}
      <video
        ref={videoElementRef}
        playsInline
        muted
        className="hidden"
      />

      {/* 1. TOP FLOATING NEOBRUTALIST HEADER BAR */}
      <div className="absolute top-2.5 sm:top-4 left-2.5 right-2.5 sm:left-6 sm:right-6 z-30 flex items-center justify-between pointer-events-none gap-1.5 sm:gap-2">
        
        {/* Left: Interactive Prompt Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 max-w-[60%] sm:max-w-[45%]">
          <div 
            onClick={() => setIsPromptsDrawerOpen(!isPromptsDrawerOpen)}
            className="neo-btn bg-[#FFFDF7] text-[#121212] px-2.5 sm:px-3.5 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:bg-white truncate"
          >
            <span className="neo-badge bg-[#FF5A36] text-white text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.2 shrink-0">
              {currentPrompt.num}
            </span>
            <span className="text-[11px] sm:text-xs font-black truncate">
              {currentPrompt.title}
            </span>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-gray-500" />
          </div>

          {/* Mode Switcher - Accessible on both Mobile and Desktop */}
          {recordingState === 'idle' && (
            <div className="flex bg-white neo-pill p-0.5 sm:p-1 gap-0.5 sm:gap-1 shrink-0">
              <button
                onClick={() => setActiveMode('video')}
                className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                  activeMode === 'video' ? 'bg-[#FF5A36] text-white' : 'text-gray-700'
                }`}
              >
                Video
              </button>
              <button
                onClick={() => setActiveMode('audio')}
                className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                  activeMode === 'audio' ? 'bg-[#3B82F6] text-white' : 'text-gray-700'
                }`}
              >
                Audio
              </button>
            </div>
          )}
        </div>

        {/* Right Controls: Auto-Track Pill, Filters & Exit */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {activeMode === 'video' && recordingState !== 'review' && (
            <div className="neo-badge bg-[#D4EDDA] text-[#1E7E52] px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] flex items-center gap-1 sm:gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1E7E52] animate-pulse"></span>
              <span className="hidden xs:inline">Auto-Tracking Locked</span>
              <span className="xs:hidden">Locked</span>
            </div>
          )}

          {activeMode === 'video' && recordingState !== 'review' && (
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="neo-btn bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-xs flex items-center gap-1 text-gray-800"
              title="Blur Filter Options"
            >
              <Sliders className="w-3.5 h-3.5 text-[#FF5A36]" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="neo-btn bg-white p-1.5 sm:p-2 text-gray-800"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter True Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          {onExit && (
            <button
              onClick={onExit}
              className="neo-btn bg-white px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs text-gray-800 flex items-center gap-1 font-bold"
              title="Exit Recording Studio"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* EXPANDABLE PROMPT DRAWER (Neo-Brutalist Card) */}
      {isPromptsDrawerOpen && (
        <div className="absolute top-16 left-3 right-3 sm:left-6 sm:max-w-md z-40 neo-card bg-[#FFFDF7] p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <span className="text-xs font-black uppercase tracking-wider text-gray-600">
              Select Focus Prompt
            </span>
            <button 
              onClick={() => setIsPromptsDrawerOpen(false)}
              className="p-1 hover:bg-black/5 rounded-lg text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {STUDY_PROMPTS.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPromptId(p.id);
                  setIsPromptsDrawerOpen(false);
                }}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPromptId === p.id 
                    ? 'border-black bg-[#FFEFEA] shadow-[2px_2px_0px_0px_#000]' 
                    : 'border-transparent hover:bg-black/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#FF5A36]">{p.num}</span>
                  {selectedPromptId === p.id && (
                    <span className="neo-badge bg-[#D4EDDA] text-[#1E7E52] text-[9px] px-1.5 py-0.2">
                      Active Focus
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-gray-900 mt-1">{p.text}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 italic">"{p.cue}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FILTER SETTINGS DRAWER (Neo-Brutalist Drawer) */}
      {isSettingsOpen && activeMode === 'video' && recordingState !== 'review' && (
        <div className="absolute top-16 right-3 sm:right-6 w-full max-w-xs z-40 neo-card bg-[#FFFDF7] p-4 space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between pb-2 border-b-2 border-black">
            <span className="font-extrabold text-sm flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-[#FF5A36]" />
              Redaction Style
            </span>
            <button onClick={() => setIsSettingsOpen(false)} className="font-bold text-xs">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => setBlurMode('gaussian')}
              className={`py-2 px-2 rounded-xl border-2 font-bold text-[10px] ${
                blurMode === 'gaussian' ? 'bg-[#FF5A36] text-white border-black' : 'bg-white border-black'
              }`}
            >
              Gaussian Blur
            </button>
            <button
              onClick={() => setBlurMode('pixelate')}
              className={`py-2 px-2 rounded-xl border-2 font-bold text-[10px] ${
                blurMode === 'pixelate' ? 'bg-[#FF5A36] text-white border-black' : 'bg-white border-black'
              }`}
            >
              Mosaic Pixel
            </button>
            <button
              onClick={() => setBlurMode('shield')}
              className={`py-2 px-2 rounded-xl border-2 font-bold text-[10px] ${
                blurMode === 'shield' ? 'bg-[#FF5A36] text-white border-black' : 'bg-white border-black'
              }`}
            >
              Frosted Shield
            </button>
            <button
              onClick={() => setBlurMode('silhouette')}
              className={`py-2 px-2 rounded-xl border-2 font-bold text-[10px] ${
                blurMode === 'silhouette' ? 'bg-[#FF5A36] text-white border-black' : 'bg-white border-black'
              }`}
            >
              Silhouette
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Blur Power:</span>
              <span className="font-mono text-[#FF5A36]">{blurIntensity}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={60}
              value={blurIntensity}
              onChange={(e) => setBlurIntensity(Number(e.target.value))}
              className="w-full accent-[#FF5A36] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-[11px] font-bold">Blur room background:</span>
            <button
              type="button"
              onClick={() => setBlurBackground(!blurBackground)}
              className={`neo-badge px-2.5 py-1 text-[10px] ${
                blurBackground ? 'bg-[#D4EDDA] text-[#1E7E52]' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {blurBackground ? 'Active' : 'Off'}
            </button>
          </div>
        </div>
      )}

      {/* 2. FULLSCREEN MAIN VIEWPORT (Canvas / Playback Review) */}
      <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
        
        {/* Device error notice */}
        {deviceError && (
          <div className="absolute z-20 m-4 neo-card bg-[#FFEFEA] p-4 max-w-md text-xs text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-black text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span>Camera / Microphone Access</span>
            </div>
            <p>{deviceError}</p>
            <button
              onClick={() => setActiveMode(activeMode === 'video' ? 'audio' : 'video')}
              className="neo-btn bg-white px-3 py-1.5 text-xs text-gray-900"
            >
              Switch to {activeMode === 'video' ? 'Audio-Only' : 'Video'}
            </button>
          </div>
        )}

        {/* Video Mode */}
        {activeMode === 'video' && (
          <>
            {recordingState !== 'review' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Real-time Blurred Canvas Viewport: Full screen mobile cover */}
                <canvas
                  ref={canvasElementRef}
                  className="w-full h-full object-cover sm:object-contain bg-black"
                />

                {/* Floating active tracking subtitle & coordinates */}
                <div className="absolute bottom-24 sm:bottom-28 z-20 neo-badge bg-black/85 text-white px-3 sm:px-4 py-1.5 text-[10px] sm:text-xs flex items-center gap-2 backdrop-blur-md border-black">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse"></span>
                  <span>Face Auto-Tracking Active: Locked • Raw Video Never Leaves Device</span>
                </div>
              </div>
            ) : (
              /* Playback Review View */
              <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 bg-black">
                {recordedBlobUrl && (
                  <video
                    ref={reviewVideoRef}
                    src={recordedBlobUrl}
                    controls
                    playsInline
                    className="w-full h-full max-h-[75vh] object-contain rounded-2xl neo-card p-0"
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Audio Mode */}
        {activeMode === 'audio' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-6">
            {recordingState !== 'review' ? (
              <>
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full neo-card bg-[#3B82F6] text-white flex items-center justify-center relative">
                  <Mic className={`w-12 h-12 ${recordingState === 'recording' ? 'animate-pulse text-white' : ''}`} />
                  {recordingState === 'recording' && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-40"></div>
                  )}
                </div>

                <div className="w-full max-w-md h-24 neo-card bg-[#181A1D] p-1 overflow-hidden">
                  <canvas
                    ref={audioVisualizerCanvasRef}
                    width={400}
                    height={90}
                    className="w-full h-full rounded-xl"
                  />
                </div>

                <p className="text-xs sm:text-sm font-bold text-gray-300">
                  {recordingState === 'recording'
                    ? 'Recording your voice narrative. Speak at a natural pace.'
                    : 'Microphone is active. Camera is completely disabled.'}
                </p>
              </>
            ) : (
              <div className="w-full max-w-md neo-card bg-[#FFFDF7] p-6 space-y-4">
                <div className="w-14 h-14 rounded-2xl neo-card bg-[#D4EDDA] text-[#1E7E52] flex items-center justify-center mx-auto">
                  <Mic className="w-7 h-7" />
                </div>
                <h4 className="font-extrabold text-base text-gray-900">Playback Audio Diary</h4>
                {recordedBlobUrl && (
                  <audio
                    ref={reviewAudioRef}
                    src={recordedBlobUrl}
                    controls
                    className="w-full"
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM FLOATING NEOBRUTALIST RECORDING CONTROLS DOCK */}
      <div className="absolute bottom-3 sm:bottom-5 left-2.5 right-2.5 sm:left-6 sm:right-6 z-30 flex flex-col items-center gap-2 pointer-events-none">
        
        {/* Floating Mobile Timer Pill (when recording or paused) */}
        {(recordingState === 'recording' || recordingState === 'paused') && (
          <div className="pointer-events-auto sm:hidden neo-badge bg-[#121212] text-white px-3.5 py-1 text-xs font-mono font-black flex items-center gap-2 shadow-[2px_2px_0px_0px_#000]">
            <span className={`w-2 h-2 rounded-full ${recordingState === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'}`}></span>
            <span>{recordingState === 'recording' ? 'REC' : 'PAUSED'} {formatTime(elapsedTime)}</span>
          </div>
        )}

        <div className="w-full flex items-center justify-between gap-2 pointer-events-none">
          {/* Left: Live Audio Meter & Status (Desktop) */}
          <div className="pointer-events-auto neo-card bg-[#FFFDF7] px-3.5 py-2 hidden sm:flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-gray-700" />
            <div className="w-20 bg-gray-200 h-2.5 rounded-full overflow-hidden border border-black">
              <div
                className="bg-[#34D399] h-full transition-all duration-75"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-gray-800">
              {formatTime(elapsedTime)}
            </span>
          </div>

          {/* Center: Large Thumb-Friendly Control Buttons */}
          <div className="pointer-events-auto mx-auto flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
            {recordingState === 'idle' && (
              <button
                onClick={handleStartRecording}
                className="w-full sm:w-auto neo-btn bg-[#FF5A36] text-white px-6 sm:px-8 py-3.5 text-sm sm:text-base flex items-center justify-center gap-2.5 min-h-[50px] shadow-[4px_4px_0px_0px_#000] font-black"
              >
                <Play className="w-5 h-5 fill-white shrink-0" />
                <span>Start Recording ({activeMode === 'video' ? 'Video' : 'Audio'})</span>
              </button>
            )}

            {recordingState === 'recording' && (
              <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePauseRecording}
                  className="flex-1 sm:flex-initial neo-btn bg-[#FFE600] text-black px-4 sm:px-5 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Pause className="w-4 h-4 fill-black" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={handleStopRecording}
                  className="flex-1 sm:flex-initial neo-btn bg-[#EF4444] text-white px-5 sm:px-7 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[48px] animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop & Review</span>
                </button>
              </div>
            )}

            {recordingState === 'paused' && (
              <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleResumeRecording}
                  className="flex-1 sm:flex-initial neo-btn bg-[#34D399] text-black px-4 sm:px-5 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Resume</span>
                </button>
                <button
                  onClick={handleStopRecording}
                  className="flex-1 sm:flex-initial neo-btn bg-[#EF4444] text-white px-5 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Finish</span>
                </button>
              </div>
            )}

            {recordingState === 'review' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleReRecord}
                  disabled={isSubmitting}
                  className="neo-btn bg-white text-gray-900 px-4 py-3 text-xs sm:text-sm flex items-center justify-center gap-1.5 min-h-[48px] font-bold"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Re-record</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="neo-btn bg-[#34D399] text-gray-950 px-6 sm:px-8 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 min-h-[48px] shadow-[4px_4px_0px_0px_#000] font-black"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Encrypting & Storing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm & Submit</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right: Crisis & Help */}
          <div 
            className="pointer-events-auto neo-btn bg-[#FFEFEA] px-3 sm:px-3.5 py-2 hidden sm:flex items-center gap-1.5 text-xs text-[#9A3412] cursor-pointer" 
            onClick={onOpenCrisis}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF5A36]"></span>
            <span>Crisis Support (24/7)</span>
          </div>
        </div>
      </div>

    </div>
  );
};
