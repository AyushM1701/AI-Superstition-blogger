'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { buildPollinationsImageUrl } from '../lib/image-style';

interface ReelsPlayerProps {
  imagePrompts?: string[];
  imageUrls?: string[];
  audioUrl?: string;
  script?: string;
  durationInSeconds?: number;
}

const KB_EFFECTS = ['kb-zoom-in', 'kb-pan-left', 'kb-pan-right', 'kb-zoom-out', 'kb-pan-up'];

export default function ReelsPlayer({ imagePrompts, imageUrls, audioUrl, script, durationInSeconds = 30 }: ReelsPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0); // 0–1 within current slide
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  
  // Expose elapsed time so we can sync subtitles correctly even during fallback
  const [currentElapsed, setCurrentElapsed] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fallback (no-audio) pausable timer state
  const fallbackElapsedRef = useRef(0);
  const fallbackStartRef = useRef<number | null>(null);
  const fallbackRafRef = useRef<number | null>(null);

  const getImageUrl = (promptOrUrl: string, isUrl: boolean) => {
    if (isUrl) return promptOrUrl;
    return buildPollinationsImageUrl(promptOrUrl, 1920, 1080);
  };

  const hasStaticUrls = !!imageUrls && imageUrls.length > 0;
  const itemsCount = hasStaticUrls ? imageUrls.length : (imagePrompts?.length || 0);
  const effectiveDuration = audioDuration ?? durationInSeconds;
  const timePerImage = itemsCount > 0 ? effectiveDuration / itemsCount : 0; // seconds

  const allSentences = useMemo(() => {
    if (!script) return [];
    return script.match(/[^.!?]+[.!?]+/g) || [script];
  }, [script]);

  useEffect(() => {
    setAudioDuration(null);
    const audio = audioRef.current;
    if (!audio) return;
    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) setAudioDuration(audio.duration);
    };
    if (audio.duration && isFinite(audio.duration)) setAudioDuration(audio.duration);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [audioUrl]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setSlideProgress(0);
    setCurrentElapsed(0);
    fallbackElapsedRef.current = 0;
    fallbackStartRef.current = null;
    if (fallbackRafRef.current) cancelAnimationFrame(fallbackRafRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const togglePlay = () => {
    if (itemsCount === 0) return;
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.error('Audio play failed:', e));
      }
    } else {
      setIsPlaying(prev => !prev);
    }
  };

  // --- Audio-driven sync: single source of truth is audio.currentTime ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl || timePerImage <= 0) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      setCurrentElapsed(currentTime);
      const raw = currentTime / timePerImage;
      const idx = Math.min(itemsCount - 1, Math.floor(raw));
      setCurrentIndex(idx);
      setSlideProgress(Math.min(1, raw - idx));
    };
    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, [audioUrl, itemsCount, timePerImage]);

  // --- Fallback (no audio track): pausable rAF timer, doesn't reset on pause ---
  useEffect(() => {
    if (audioUrl || !isPlaying || itemsCount === 0 || timePerImage <= 0) {
      if (fallbackRafRef.current) cancelAnimationFrame(fallbackRafRef.current);
      return;
    }
    fallbackStartRef.current = performance.now();
    const totalMs = effectiveDuration * 1000;

    const tick = (now: number) => {
      const elapsed = fallbackElapsedRef.current + (now - (fallbackStartRef.current ?? now));
      if (elapsed >= totalMs) {
        setCurrentElapsed(effectiveDuration);
        setCurrentIndex(itemsCount - 1);
        setSlideProgress(1);
        return;
      }
      
      const elapsedSec = elapsed / 1000;
      setCurrentElapsed(elapsedSec);
      
      const raw = elapsedSec / timePerImage;
      const idx = Math.min(itemsCount - 1, Math.floor(raw));
      setCurrentIndex(idx);
      setSlideProgress(Math.min(1, raw - idx));
      fallbackRafRef.current = requestAnimationFrame(tick);
    };
    fallbackRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (fallbackRafRef.current) cancelAnimationFrame(fallbackRafRef.current);
      if (fallbackStartRef.current) {
        fallbackElapsedRef.current += performance.now() - fallbackStartRef.current;
      }
    };
  }, [audioUrl, isPlaying, itemsCount, timePerImage, effectiveDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => stopPlayback();
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [stopPlayback]);

  if (itemsCount === 0) return null;

  const getKbEffect = (index: number) => KB_EFFECTS[index % KB_EFFECTS.length];

  // Calculate current sentence for subtitles
  const currentSentenceIdx = allSentences.length > 0 
    ? Math.min(allSentences.length - 1, Math.floor((currentElapsed / effectiveDuration) * allSentences.length))
    : 0;
  const currentSentence = allSentences[currentSentenceIdx];

  return (
    <div
      className="reels-player"
      onClick={togglePlay}
      role="button"
      tabIndex={0}
      aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePlay(); } }}
    >
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}

      <div className="reels-viewport">
        {Array.from({ length: itemsCount }).map((_, index) => {
          const src = hasStaticUrls ? getImageUrl(imageUrls[index], true) : getImageUrl(imagePrompts![index], false);
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`reels-slide ${isActive ? 'active' : ''}`}
              style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 10 : 1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={isActive ? `active-${index}` : `idle-${index}`}
                src={src}
                alt={`Scene ${index + 1}`}
                className={isActive ? getKbEffect(index) : ''}
                style={{
                  animationDuration: `${timePerImage}s`,
                  animationPlayState: isActive && isPlaying ? 'running' : 'paused',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = buildPollinationsImageUrl('dark starry night sky constellations astrology', 1920, 1080);
                }}
              />
            </div>
          );
        })}
      </div>

      {isPlaying && currentSentence && (
        <div className="reels-subtitle">
          {currentSentence}
        </div>
      )}

      <div className="reels-overlay">
        {!isPlaying && <div className="play-button">▶</div>}
        <div className="progress-bar-container">
          {Array.from({ length: itemsCount }).map((_, idx) => {
            const width = idx < currentIndex ? 100 : idx === currentIndex ? slideProgress * 100 : 0;
            return (
              <div key={idx} className="progress-segment">
                <div className="progress-fill" style={{ width: `${width}%` }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
