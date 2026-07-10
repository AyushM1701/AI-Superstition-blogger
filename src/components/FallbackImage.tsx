/* eslint-disable @next/next/no-img-element */
'use client';

import { ImgHTMLAttributes } from 'react';

interface FallbackImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc: string;
}

export default function FallbackImage({ src, fallbackSrc, ...props }: FallbackImageProps) {
  return (
    <img 
      src={src} 
      {...props} 
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        // Prevent infinite loop if fallback image also fails
        if (target.src !== fallbackSrc) {
          target.src = fallbackSrc;
        }
      }}
    />
  );
}
