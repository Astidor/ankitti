import React from 'react';

// Iconic Kawaii Ribbon Bow
export const KittyBow: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg 
    width={size} 
    height={size * 0.75} 
    viewBox="0 0 100 75" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block filter drop-shadow-[0_2px_4px_rgba(244,63,122,0.25)] ${className}`}
  >
    <defs>
      <linearGradient id="bowGradClean" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff4d88" />
        <stop offset="50%" stopColor="#f43f7a" />
        <stop offset="100%" stopColor="#d81b60" />
      </linearGradient>
      <linearGradient id="bowKnotGradClean" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff75a0" />
        <stop offset="100%" stopColor="#e11d5f" />
      </linearGradient>
    </defs>
    {/* Left Loop */}
    <path 
      d="M45 37.5 C40 18, 12 10, 8 26 C4 40, 22 55, 45 42 Z" 
      fill="url(#bowGradClean)" 
      stroke="#b9134a" 
      strokeWidth="3.5" 
      strokeLinejoin="round" 
    />
    <path d="M18 25 C25 22, 34 26, 38 34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
    
    {/* Right Loop */}
    <path 
      d="M55 37.5 C60 18, 88 10, 92 26 C96 40, 78 55, 55 42 Z" 
      fill="url(#bowGradClean)" 
      stroke="#b9134a" 
      strokeWidth="3.5" 
      strokeLinejoin="round" 
    />
    <path d="M82 25 C75 22, 66 26, 62 34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
    
    {/* Ribbon Tails */}
    <path d="M40 42 C32 55, 20 68, 14 70 C24 67, 34 65, 43 50 Z" fill="url(#bowGradClean)" stroke="#b9134a" strokeWidth="3" />
    <path d="M60 42 C68 55, 80 68, 86 70 C76 67, 66 65, 57 50 Z" fill="url(#bowGradClean)" stroke="#b9134a" strokeWidth="3" />

    {/* Center Knot */}
    <ellipse cx="50" cy="39" rx="11" ry="10" fill="url(#bowKnotGradClean)" stroke="#b9134a" strokeWidth="3.5" />
    <ellipse cx="48" cy="36" rx="3.5" ry="2.5" fill="#ffffff" opacity="0.8" />
  </svg>
);

// 4-Point Retro Sparkle Star (Screenshot 2 style)
export const CuteSparkleStar: React.FC<{ size?: number; color?: string; className?: string }> = ({
  size = 20,
  color = '#818cf8',
  className = ''
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={color} 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
  </svg>
);

export type MascotPose = 'hero' | 'celebrate' | 'reading' | 'cafe';

interface MascotProps {
  pose?: MascotPose;
  className?: string;
  alt?: string;
}

const MASCOT_ASSETS: Record<MascotPose, string> = {
  hero: '/assets/hero_mascot.png',
  celebrate: '/assets/celebrate_mascot.png',
  reading: '/assets/reading_mascot.png',
  cafe: '/assets/cafe_mascot.png',
};

export const AestheticMascot: React.FC<MascotProps> = ({
  pose = 'hero',
  className = 'w-36 h-36',
  alt = 'Ankitti Mascot'
}) => {
  return (
    <img 
      src={MASCOT_ASSETS[pose]} 
      alt={alt}
      className={`object-contain rounded-2xl select-none pointer-events-none drop-shadow-md ${className}`} 
      loading="eager"
    />
  );
};

// Clean Avatar representation
export const KittyAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = ''
}) => {
  return (
    <div 
      style={{ width: size, height: size }}
      className={`rounded-full overflow-hidden border-2 border-indigo-200/90 shadow-sm bg-[#faf8f5] flex items-center justify-center ${className}`}
    >
      <img 
        src="/assets/hero_mascot.png" 
        alt="Avatar" 
        className="w-full h-full object-cover scale-125 translate-y-1"
      />
    </div>
  );
};
