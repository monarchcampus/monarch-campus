import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Gauge,
  Shield,
  Lock,
} from 'lucide-react';

interface SecureVideoPlayerProps {
  videoUrl: string;
  poster?: string;
  studentName?: string;
  onEnded?: () => void;
  className?: string;
}

// Helper to extract YouTube video ID from various URL formats
export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  // Check if it's already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }
  return null;
};

export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  videoUrl,
  poster,
  studentName = 'Monarch Student',
  onEnded,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: '15%', left: '15%' });

  const controlsTimeoutRef = useRef<any>(null);
  const youtubeId = extractYouTubeId(videoUrl);
  const isYouTube = !!youtubeId;

  // Move watermark around periodically to deter screen recorders
  useEffect(() => {
    const interval = setInterval(() => {
      const top = Math.floor(Math.random() * 70 + 10) + '%';
      const left = Math.floor(Math.random() * 70 + 10) + '%';
      setWatermarkPos({ top, left });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // PostMessage sender for YouTube iframe
  const postToYT = (func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func,
          args,
        }),
        '*'
      );
    }
  };

  // YouTube polling for time & duration
  useEffect(() => {
    if (!isYouTube) return;

    // Listen for YouTube postMessage events
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setCurrentTime(data.info.currentTime);
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(data.info.duration);
          }
          if (typeof data.info.playerState === 'number') {
            // 1 = playing, 2 = paused, 0 = ended
            if (data.info.playerState === 1) setIsPlaying(true);
            else if (data.info.playerState === 2) setIsPlaying(false);
            else if (data.info.playerState === 0) {
              setIsPlaying(false);
              onEnded?.();
            }
          }
        }
      } catch (err) {
        // ignore non-json messages
      }
    };

    window.addEventListener('message', handleMessage);

    // Regularly request info delivery
    const timer = setInterval(() => {
      if (isPlaying) {
        postToYT('getCurrentTime');
        postToYT('getDuration');
      }
    }, 800);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(timer);
    };
  }, [isYouTube, isPlaying, onEnded]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3500);
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (isYouTube) {
      if (isPlaying) {
        postToYT('pauseVideo');
        setIsPlaying(false);
      } else {
        postToYT('playVideo');
        setIsPlaying(true);
      }
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Format seconds to Hours and Minutes (පැය සහ මිනිත්තු වලින්)
  const formatHoursMinutes = (seconds: number) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '00h 00m 00s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Local live ticker to smoothly count second-by-second while video is playing
  useEffect(() => {
    if (!isPlaying) return;
    const tickInterval = setInterval(() => {
      setCurrentTime((prev) => {
        if (duration > 0 && prev >= duration) return duration;
        return prev + 0.25;
      });
    }, 250);
    return () => clearInterval(tickInterval);
  }, [isPlaying, duration]);

  const scrubberRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Skip -5 seconds and +5 seconds (5න් 5ට පාස්ට් ෆෝවර්ඩ් සහ රීවයින්ඩ්)
  const skipTime = (seconds: number) => {
    const target = Math.max(0, Math.min(duration || 3600, currentTime + seconds));
    seekTo(target);
  };

  // Seek to specific timestamp immediately
  const seekTo = (seconds: number) => {
    const clamped = Math.max(0, Math.min(duration || 3600, seconds));
    setCurrentTime(clamped);
    if (isYouTube) {
      postToYT('seekTo', [clamped, true]);
    } else if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  };

  // Change playback speed
  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    if (isYouTube) {
      postToYT('setPlaybackRate', [rate]);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (isYouTube) {
      if (isMuted) {
        postToYT('unMute');
        setIsMuted(false);
      } else {
        postToYT('mute');
        setIsMuted(true);
      }
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  // Handle timeline scrubber touch/click interaction anywhere on the track
  const handleTrackInteraction = (clientX: number) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const target = ratio * (duration || 100);
    seekTo(target);
  };

  const handleScrubberMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    handleTrackInteraction(e.clientX);
  };

  const handleScrubberTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    if (e.touches && e.touches[0]) {
      handleTrackInteraction(e.touches[0].clientX);
    }
  };

  const handleScrubberTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches[0]) {
      handleTrackInteraction(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsScrubbing(false);
    const handleTouchEnd = () => setIsScrubbing(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        return false;
      }}
      className={`group relative aspect-video w-full select-none overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10 ${className}`}
    >
      {/* 1. Underlying Video Player Stage */}
      {isYouTube ? (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&controls=0&disablekb=1&modestbranding=1&rel=0&iv_load_policy=3&fs=0&playsinline=1&showinfo=0`}
          title="Monarch Campus Secure Player"
          className="h-full w-full pointer-events-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          playsInline
          className="h-full w-full object-cover"
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
              setDuration(videoRef.current.duration || 0);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            onEnded?.();
          }}
        />
      )}

      {/* 2. PROTECTIVE INVISIBLE SHIELD (ආරක්ෂිත නොපෙනෙන ආවරණය) */}
      {/* Covers YouTube branding, share buttons, right clicks, and native links */}
      <div
        onClick={togglePlay}
        className="absolute inset-0 z-10 cursor-pointer bg-transparent"
        title={isPlaying ? 'Pause (වීඩියෝව නවත්වන්න)' : 'Play (වීඩියෝව ධාවනය කරන්න)'}
      />

      {/* Top Banner Shield (blocks YouTube Title and Share menu) */}
      <div className="absolute top-0 inset-x-0 h-16 z-20 pointer-events-auto bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between px-4 transition-opacity duration-300 opacity-90">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Monarch Shield DRM</span>
          </span>
          <span className="text-xs font-semibold text-white/80 hidden sm:inline">
            Protected HD Stream
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 font-mono font-bold">Unlisted & Encrypted</span>
        </div>
      </div>

      {/* Floating Anti-Piracy Watermark with Student Name */}
      <div
        style={{ top: watermarkPos.top, left: watermarkPos.left }}
        className="pointer-events-none absolute z-20 text-[11px] font-mono font-bold text-white/20 select-none tracking-widest backdrop-blur-[1px] transition-all duration-1000"
      >
        {studentName} · MONARCH LMS
      </div>

      {/* Center Big Play/Pause Indicator on paused state */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 z-20 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-2xl transition hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-amber-500/40"
        >
          <Play className="h-7 w-7 translate-x-0.5 fill-current" />
        </button>
      )}

      {/* 3. CUSTOM CONTROL BAR (BOTTOM) */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent px-4 pb-3 pt-6 transition-all duration-300 ${
          showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        {/* TIMELINE / CAPILLARY GLASS TUBE (කේෂික වීදුරු නළය - SLIM GLASS TUBE WITH RED LIQUID FILL) */}
        <div
          ref={scrubberRef}
          onMouseDown={handleScrubberMouseDown}
          onTouchStart={handleScrubberTouchStart}
          onTouchMove={handleScrubberTouchMove}
          className="group/bar relative mb-3 cursor-pointer py-2.5 touch-none select-none"
          title="ප්ලෙයර් ට්‍රැක් එකේ අවශ්‍ය ඕනෑම ස්ථානයකට ටච් කරන්න"
        >
          {/* Capillary Glass Tube Body (කේෂික වීදුරු නළය) - Slim cylindrical transparent glass */}
          <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-white/10 dark:bg-slate-900/90 border border-white/25 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.1)] backdrop-blur-xs">
            {/* Top glass reflection sheen line */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-white/30 rounded-full pointer-events-none" />

            {/* Glowing Red Fluid Filling inside the Capillary Tube (රතු පාටින් පිරෙන ද්‍රවය) */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-700 via-red-600 to-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] rounded-full transition-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Meniscus / Capillary Liquid Droplet Point (කේෂික නළයේ ද්‍රව මුහුණත / පොයින්ට් එක) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform"
            style={{ left: `${progressPercent}%` }}
          >
            <div className="relative flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.9),0_2px_4px_rgba(0,0,0,0.6)] ring-2 ring-red-500/40 group-hover/bar:scale-125 transition-transform" />
              {/* Inner ruby fluid droplet */}
              <div className="absolute w-1.5 h-1.5 rounded-full bg-red-600 shadow-xs" />
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3 text-white text-xs">
          {/* Left Controls: Play, Rewind 5s, Forward 5s, Volume, Time (Hours & Minutes) */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Play/Stop button */}
            <button
              onClick={togglePlay}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-white/20 transition active:scale-90 text-amber-400"
              title={isPlaying ? 'Pause (වීඩියෝව නවත්වන්න)' : 'Play (වීඩියෝව ධාවනය කරන්න)'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Rewind 5s (-5s) */}
            <button
              onClick={() => skipTime(-5)}
              className="cursor-pointer flex items-center gap-0.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition active:scale-90 text-[11px] font-bold"
              title="Rewind 5 seconds (තප්පර 5ක් ආපසු)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>-5s</span>
            </button>

            {/* Fast-Forward 5s (+5s) */}
            <button
              onClick={() => skipTime(5)}
              className="cursor-pointer flex items-center gap-0.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition active:scale-90 text-[11px] font-bold"
              title="Fast Forward 5 seconds (තප්පර 5ක් ඉදිරියට)"
            >
              <span>+5s</span>
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Volume toggle */}
            <button
              onClick={toggleMute}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-white/20 transition hidden sm:inline-flex"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Time Indicator in Hours and Minutes (පැය සහ මිනිත්තු වලින් + සජීවීව කවුන්ට් වීම) */}
            <div className="font-mono text-[11px] bg-black/50 px-2.5 py-1 rounded-lg border border-white/15 flex items-center gap-1.5 shadow-inner">
              <span className="text-red-400 font-bold" title="වත්මන් නරඹන වේලාව (Elapsed Time)">
                {formatHoursMinutes(currentTime)}
              </span>
              <span className="text-slate-500 font-bold">/</span>
              <span className="text-slate-300 font-semibold" title="මුළු කාලය (Total Duration)">
                {formatHoursMinutes(duration)}
              </span>
            </div>
          </div>

          {/* Right Controls: Playback Speed, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition text-xs font-bold font-mono"
                title="Playback Speed (ධාවන වේගය)"
              >
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-28 rounded-xl border border-slate-700 bg-slate-900/95 p-1 shadow-2xl backdrop-blur-md">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800">
                    Speed (වේගය)
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={`w-full text-left px-2 py-1 rounded-lg text-xs font-mono font-semibold transition ${
                        playbackRate === rate
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {rate === 1 ? '1.0x Normal' : `${rate}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen and Exit Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="cursor-pointer p-1.5 rounded-lg hover:bg-white/20 transition active:scale-90 text-white"
              title={isFullscreen ? 'Exit Fullscreen (පූර්ණ තිරයෙන් ඉවත් වන්න)' : 'Fullscreen (පූර්ණ තිරය)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
