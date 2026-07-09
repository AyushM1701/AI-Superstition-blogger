'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

interface ReelsPlayerProps {
  imagePrompts?: string[];
  imageUrls?: string[];
  audioUrl?: string;
  script?: string; // Narration text for synced subtitles
  durationInSeconds?: number; // Fallback only — audio duration takes priority
}

// Ken Burns effect variations — cycles through these per image
const KB_EFFECTS = ['kb-zoom-in', 'kb-pan-left', 'kb-pan-right', 'kb-zoom-out', 'kb-pan-up'];

/**
 * Splits a script into N roughly-equal subtitle segments at sentence boundaries.
 */
function splitIntoSegments(text: string, count: number): string[] {
  if (!text || count <= 0) return [];
  
  // Split by sentence-ending punctuation
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  if (sentences.length <= count) {
    // Fewer sentences than segments — pad with empty strings
    const result = sentences.map(s => s.trim());
    while (result.length < count) result.push('');
    return result;
  }
  
  // Distribute sentences evenly across segments
  const segments: string[] = [];
  const perSegment = Math.ceil(sentences.length / count);
  
  for (let i = 0; i < count; i++) {
    const start = i * perSegment;
    const end = Math.min(start + perSegment, sentences.length);
    segments.push(sentences.slice(start, end).join(' ').trim());
  }
  
  return segments;
}

export default function ReelsPlayer({ imagePrompts, imageUrls, audioUrl, script, durationInSeconds = 30 }: ReelsPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [audioDuration, setAudioDuration] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getImageUrl = (promptOrUrl: string, isUrl: boolean) => {
    if (isUrl) return promptOrUrl;
    const encodedPrompt = encodeURIComponent(promptOrUrl + ", cinematic lighting, shallow depth of field, 35mm film grain, award-winning National Geographic photography, volumetric light");
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1920&height=1080&nologo=true`;
  };

  const hasStaticUrls = !!imageUrls && imageUrls.length > 0;
  const itemsCount = hasStaticUrls ? imageUrls.length : (imagePrompts?.length || 0);

  // Use actual audio duration when available, otherwise fall back to prop
  const effectiveDuration = audioDuration ?? durationInSeconds;
  const timePerImage = itemsCount > 0 ? (effectiveDuration / itemsCount) * 1000 : 0;

  // Pre-compute subtitle segments from script
  const subtitles = useMemo(() => {
    return script ? splitIntoSegments(script, itemsCount) : [];
  }, [script, itemsCount]);

  // Detect actual audio duration once metadata loads
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
      }
    };

    // In case metadata is already loaded
    if (audio.duration && isFinite(audio.duration)) {
      setAudioDuration(audio.duration);
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [audioUrl]);

  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current && itemsCount > 0) {
      if (isPlaying) {
        audioRef.current.pause();
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Image slideshow driven by audio duration
  useEffect(() => {
    if (isPlaying && itemsCount > 0 && timePerImage > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex >= itemsCount - 1) {
            clearInterval(intervalRef.current!);
            return prevIndex; // Stay on last image
          }
          return prevIndex + 1;
        });
      }, timePerImage);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, itemsCount, timePerImage]);

  // Audio ended = everything resets
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => stopPlayback();
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [stopPlayback]);

  if (itemsCount === 0) return null;

  // Pick a Ken Burns effect for each image (deterministic per index)
  const getKbEffect = (index: number) => KB_EFFECTS[index % KB_EFFECTS.length];

  return (
    <div className="reels-player" onClick={togglePlay}>
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}
      
      <div className="reels-viewport">
        {Array.from({ length: itemsCount }).map((_, index) => {
          const src = hasStaticUrls ? getImageUrl(imageUrls[index], true) : getImageUrl(imagePrompts![index], false);
          return (
            <div 
              key={index} 
              className={`reels-slide ${index === currentIndex ? 'active' : ''}`}
              style={{ 
                opacity: index === currentIndex ? 1 : 0,
                zIndex: index === currentIndex ? 10 : 1,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={src} 
                alt={`Scene ${index + 1}`}
                className={isPlaying && index === currentIndex ? getKbEffect(index) : ''}
                style={{ animationDuration: `${timePerImage / 1000}s` }}
              />
            </div>
          );
        })}
      </div>

      {/* Synced Subtitles */}
      {isPlaying && subtitles[currentIndex] && (
        <div className="reels-subtitle" key={currentIndex}>
          {subtitles[currentIndex]}
        </div>
      )}

      <div className="reels-overlay">
        {!isPlaying && (
          <div className="play-button">
            ▶
          </div>
        )}
        <div className="progress-bar-container">
          {Array.from({ length: itemsCount }).map((_, idx) => (
            <div key={idx} className="progress-segment">
              <div 
                className="progress-fill" 
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex && isPlaying ? '100%' : '0%',
                  transition: idx === currentIndex && isPlaying ? `width ${timePerImage}ms linear` : 'none'
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
