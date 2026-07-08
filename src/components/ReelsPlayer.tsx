'use client';

import { useState, useRef, useEffect } from 'react';

interface ReelsPlayerProps {
  imagePrompts?: string[]; // Kept for backwards compatibility
  imageUrls?: string[]; // Added new prop
  audioUrl?: string;
  durationInSeconds?: number;
}

export default function ReelsPlayer({ imagePrompts, imageUrls, audioUrl, durationInSeconds = 30 }: ReelsPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // We prefer static imageUrls, but fallback to generating from prompts if missing
  const getImageUrl = (promptOrUrl: string, isUrl: boolean) => {
    if (isUrl) return promptOrUrl;
    const encodedPrompt = encodeURIComponent(promptOrUrl + ", cinematic, highly detailed, 8k, professional photography");
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1920&nologo=true`;
  };

  const hasStaticUrls = !!imageUrls && imageUrls.length > 0;
  const itemsCount = hasStaticUrls ? imageUrls.length : (imagePrompts?.length || 0);
  const timePerImage = itemsCount > 0 ? (durationInSeconds / itemsCount) * 1000 : 0;

  const togglePlay = () => {
    if (audioRef.current && itemsCount > 0) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (isPlaying && itemsCount > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          if (prevIndex === itemsCount - 1) {
            setIsPlaying(false);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
            clearInterval(intervalRef.current!);
            return 0;
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

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentIndex(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []);

  if (itemsCount === 0) return null;

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
                animationDuration: `${timePerImage / 1000}s`
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={src} 
                alt="Generated scene" 
                className={isPlaying && index === currentIndex ? 'ken-burns-active' : ''}
              />
            </div>
          );
        })}
      </div>

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
