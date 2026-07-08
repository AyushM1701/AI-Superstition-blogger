'use client';

import { useEffect, useRef } from 'react';

export default function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    
    // Cleanup function runs when component unmounts (e.g. navigating to home page)
    return () => {
      if (video) {
        video.pause();
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="video-player"
      poster="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23111' /></svg>"
    />
  );
}
