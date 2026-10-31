import React from 'react';
import { FaceG, INK, KITTY_PATH, KittyShape, type Mood } from '../landing/kitty';

// The Ankitti mark: a flashcard with cat ears (same drawing as the landing page).
// Kept under its old name so every screen that used the bow picks it up.
export const KittyBow: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size * 0.85} viewBox="0 0 200 170" className={`inline-block ${className}`} aria-hidden="true">
    <path d={KITTY_PATH} fill="var(--c-pink-soft)" stroke={INK} strokeWidth="14" strokeLinejoin="round" />
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

const POSE_MOOD: Record<MascotPose, { mood: Mood; fill: string }> = {
  hero: { mood: 'happy', fill: 'var(--c-pink-soft)' },
  celebrate: { mood: 'happy', fill: 'var(--c-mint)' },
  reading: { mood: 'think', fill: 'var(--c-paper)' },
  cafe: { mood: 'sleep', fill: 'var(--c-butter)' },
};

export const AestheticMascot: React.FC<MascotProps> = ({ pose = 'hero', className = 'w-36 h-36', alt = 'Ankitti' }) => (
  <KittyShape fill={POSE_MOOD[pose].fill} mood={POSE_MOOD[pose].mood} className={className} title={alt} />
);

// Account avatar: a small kitty face on a round pastel disc.
export const KittyAvatar: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={`shrink-0 ${className}`} aria-hidden="true">
    <circle cx="50" cy="50" r="47" fill="var(--c-lilac)" stroke={INK} strokeWidth="5" />
    <g transform="translate(14 22) scale(0.36)">
      <path d={KITTY_PATH} fill="var(--c-paper)" stroke={INK} strokeWidth="12" strokeLinejoin="round" />
      <FaceG x={100} y={96} s={1.25} mood="happy" />
    </g>
  </svg>
);

// Cute Speech Bubble for Mascot Dialogue
export const CuteSpeechBubble: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`relative bg-white rounded-2xl px-4 py-2.5 border border-strawberry-200 shadow-sm text-xs font-semibold text-cocoa-800 ${className}`}>
      {children}
      {/* Speech bubble pointer arrow */}
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-white border-b-[6px] border-b-transparent" />
      <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-r-[9px] border-r-strawberry-200 border-b-[7px] border-b-transparent -z-10" />
    </div>
  );
};

// Kawaii Sticker Pill Badge
export const KawaiiBadge: React.FC<{
  emoji?: string;
  label: string;
  color?: 'strawberry' | 'taro' | 'matcha' | 'honey';
  className?: string;
}> = ({ emoji, label, color = 'strawberry', className = '' }) => {
  const styles = {
    strawberry: 'bg-strawberry-50 text-strawberry-700 border-strawberry-200',
    taro: 'bg-taro-50 text-taro-700 border-taro-200',
    matcha: 'bg-matcha-50 text-matcha-700 border-matcha-200',
    honey: 'bg-honey-50 text-honey-800 border-honey-200',
  }[color];

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold shadow-2xs ${styles} ${className}`}>
      {emoji && <span className="text-xs">{emoji}</span>}
      <span>{label}</span>
    </span>
  );
};

// ✦ 4-Point Retro Sparkle Cluster ✦
export const SparkleCluster: React.FC<{ className?: string; color?: string }> = ({ 
  className = '', 
  color = '#F59E0B' 
}) => (
  <div className={`inline-flex items-center space-x-1 pointer-events-none select-none ${className}`}>
    <CuteSparkleStar size={16} color={color} className="animate-twinkle" />
    <CuteSparkleStar size={10} color="#EC4899" className="animate-twinkle [animation-delay:0.7s]" />
    <CuteSparkleStar size={13} color="#8B5CF6" className="animate-twinkle [animation-delay:1.4s]" />
  </div>
);

// 🥞 Kawaii Stack of Fluffy Pancakes (Inspired by Reference 4)
export const KawaiiPancakeStack: React.FC<{ size?: number; className?: string }> = ({ 
  size = 64, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-sm ${className}`}
  >
    {/* Plate */}
    <ellipse cx="50" cy="85" rx="44" ry="10" fill="#FCE7F3" stroke="#F472B6" strokeWidth="2.5" />
    <ellipse cx="50" cy="83" rx="38" ry="7" fill="#FFFFFF" />
    
    {/* Bottom Pancake */}
    <path d="M18 72 C18 64 82 64 82 72 C82 80 18 80 18 72 Z" fill="#FED7AA" stroke="#F97316" strokeWidth="2.5" />
    <ellipse cx="50" cy="69" rx="32" ry="7" fill="#FFEDD5" />
    
    {/* Middle Pancake */}
    <path d="M20 58 C20 50 80 50 80 58 C80 66 20 66 20 58 Z" fill="#FED7AA" stroke="#F97316" strokeWidth="2.5" />
    <ellipse cx="50" cy="55" rx="30" ry="7" fill="#FFEDD5" />
    
    {/* Top Pancake */}
    <path d="M22 44 C22 36 78 36 78 44 C78 52 22 52 22 44 Z" fill="#FED7AA" stroke="#F97316" strokeWidth="2.5" />
    <ellipse cx="50" cy="41" rx="28" ry="7" fill="#FFEDD5" />
    
    {/* Dripping Pink Strawberry Syrup */}
    <path 
      d="M26 42 Q32 38 40 40 Q46 38 52 41 Q60 38 72 43 C72 52 68 55 64 52 C60 48 56 60 52 62 C48 64 44 48 40 48 C36 48 34 56 30 55 C26 54 26 46 26 42 Z" 
      fill="#FB7185" 
      stroke="#E11D48" 
      strokeWidth="2" 
    />
    <circle cx="34" cy="61" r="2.5" fill="#FB7185" />
    
    {/* Whipped Cream & Strawberry on top */}
    <ellipse cx="50" cy="35" rx="9" ry="5" fill="#FFFFFF" stroke="#FCE7F3" strokeWidth="1.5" />
    <path d="M48 20 C42 22 42 30 48 32 C54 30 54 22 48 20 Z" fill="#F43F5E" stroke="#BE123C" strokeWidth="2" />
    {/* Strawberry Seeds */}
    <circle cx="47" cy="25" r="0.8" fill="#FEF08A" />
    <circle cx="50" cy="27" r="0.8" fill="#FEF08A" />
    <circle cx="46" cy="29" r="0.8" fill="#FEF08A" />
    {/* Strawberry Green Leaves */}
    <path d="M48 19 Q45 15 42 17 Q48 18 48 20 Q51 16 54 17 Q50 18 48 20" fill="#4ADE80" stroke="#16A34A" strokeWidth="1" />
  </svg>
);

// 🧋 Kawaii Boba Drink Cup with Kitty Ears (Inspired by Reference 4)
export const KawaiiBobaCup: React.FC<{ size?: number; className?: string }> = ({ 
  size = 64, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-sm ${className}`}
  >
    {/* Straw */}
    <rect x="52" y="5" width="8" height="40" rx="3" transform="rotate(15 52 5)" fill="#F472B6" stroke="#DB2777" strokeWidth="2" />
    <line x1="53" y1="12" x2="63" y2="15" stroke="#FFFFFF" strokeWidth="2" />
    <line x1="51" y1="20" x2="61" y2="23" stroke="#FFFFFF" strokeWidth="2" />
    
    {/* Cat Ears Dome Lid */}
    {/* Left Ear */}
    <path d="M28 32 L34 18 Q38 20 40 30 Z" fill="#FBCFE8" stroke="#DB2777" strokeWidth="2" />
    <path d="M31 29 L35 21 Q37 23 38 28 Z" fill="#F472B6" />
    {/* Right Ear */}
    <path d="M72 32 L66 18 Q62 20 60 30 Z" fill="#FBCFE8" stroke="#DB2777" strokeWidth="2" />
    <path d="M69 29 L65 21 Q63 23 62 28 Z" fill="#F472B6" />
    {/* Dome Cap */}
    <path d="M22 35 C22 24 78 24 78 35 Z" fill="#FCE7F3" stroke="#DB2777" strokeWidth="2" />
    <rect x="20" y="33" width="60" height="6" rx="3" fill="#F472B6" stroke="#DB2777" strokeWidth="1.5" />
    
    {/* Cup Body */}
    <path d="M25 38 L32 88 Q33 93 40 93 L60 93 Q67 93 68 88 L75 38 Z" fill="#FED7AA" stroke="#CA8A04" strokeWidth="2.5" />
    {/* Milk Tea Highlight */}
    <path d="M28 42 L34 84 Q35 88 42 88 L46 88 L41 42 Z" fill="#FFEDD5" opacity="0.6" />
    
    {/* Cute Kitty Face on Cup */}
    <circle cx="43" cy="58" r="2.5" fill="#451A03" />
    <circle cx="57" cy="58" r="2.5" fill="#451A03" />
    <ellipse cx="50" cy="62" rx="2" ry="1.2" fill="#F59E0B" />
    {/* Blushing Cheeks */}
    <circle cx="38" cy="63" r="3" fill="#FDA4AF" opacity="0.8" />
    <circle cx="62" cy="63" r="3" fill="#FDA4AF" opacity="0.8" />
    
    {/* Boba Tapioca Pearls */}
    <circle cx="40" cy="85" r="4" fill="#3B1E08" />
    <circle cx="50" cy="87" r="4.5" fill="#3B1E08" />
    <circle cx="60" cy="85" r="4" fill="#3B1E08" />
    <circle cx="45" cy="78" r="3.5" fill="#3B1E08" />
    <circle cx="55" cy="79" r="4" fill="#3B1E08" />
    <circle cx="36" cy="76" r="3.5" fill="#3B1E08" />
    <circle cx="63" cy="77" r="3.5" fill="#3B1E08" />
  </svg>
);

// 📖 Kawaii Study Notebook & Pencil (Inspired by Reference 1 & 2)
export const KawaiiStudyNotebook: React.FC<{ size?: number; className?: string }> = ({ 
  size = 64, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block drop-shadow-sm ${className}`}
  >
    {/* Notebook Cover */}
    <rect x="25" y="16" width="56" height="70" rx="8" fill="#FCE7F3" stroke="#F43F5E" strokeWidth="2.5" />
    {/* Spine & Rings */}
    <rect x="20" y="16" width="12" height="70" rx="4" fill="#FDA4AF" stroke="#F43F5E" strokeWidth="2" />
    <circle cx="26" cy="26" r="2" fill="#FFFFFF" stroke="#BE123C" strokeWidth="1" />
    <circle cx="26" cy="40" r="2" fill="#FFFFFF" stroke="#BE123C" strokeWidth="1" />
    <circle cx="26" cy="54" r="2" fill="#FFFFFF" stroke="#BE123C" strokeWidth="1" />
    <circle cx="26" cy="68" r="2" fill="#FFFFFF" stroke="#BE123C" strokeWidth="1" />
    
    {/* Inner Paper Page */}
    <rect x="36" y="24" width="38" height="54" rx="4" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="1.5" />
    <line x1="42" y1="34" x2="68" y2="34" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
    <line x1="42" y1="42" x2="68" y2="42" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
    <line x1="42" y1="50" x2="62" y2="50" stroke="#FDA4AF" strokeWidth="2" strokeLinecap="round" />
    
    {/* Star Doodle on Page */}
    <polygon points="58,62 60,57 62,62 67,62 63,65 65,70 60,67 55,70 57,65 53,62" fill="#FCD34D" />
    
    {/* Cute Yellow Pencil angled across */}
    <g transform="rotate(35 60 70)">
      <rect x="52" y="30" width="10" height="35" rx="2" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
      <polygon points="52,65 57,75 62,65" fill="#FDE68A" stroke="#CA8A04" strokeWidth="1.5" />
      <polygon points="55,71 57,75 59,71" fill="#451A03" />
      <rect x="52" y="25" width="10" height="6" rx="2" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1.5" />
    </g>
  </svg>
);

// 🌸 Washi Tape Sticker (for sticky notes / reviews)
export const KawaiiWashiTape: React.FC<{ className?: string; color?: string }> = ({ 
  className = '', 
  color = '#FBCFE8' 
}) => (
  <div 
    style={{ backgroundColor: color }} 
    className={`w-16 h-4 opacity-80 backdrop-blur-xs rounded-xs border-dashed border-y border-pink-300 shadow-2xs rotate-[-2deg] ${className}`} 
  />
);

