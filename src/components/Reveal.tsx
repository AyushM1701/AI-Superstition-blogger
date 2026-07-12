'use client';

import { ReactNode, CSSProperties } from 'react';
import { useScrollReveal } from '../lib/useScrollReveal';

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: any;
  delay?: number; // ms
  y?: number;     // px translate distance
}

export default function Reveal({ children, className = '', style = {}, as = 'div', delay = 0, y = 24 }: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLElement>();
  const Tag = as as any;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
        transition: `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </Tag>
  );
}
