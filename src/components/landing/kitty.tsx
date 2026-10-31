import React from 'react';

// The motif shared by the landing page and the guides: a flashcard with cat ears, in plum line art.

export const INK = 'var(--c-ink)';
export const BLUSH = 'var(--c-blush)';

/* ─── The motif: a flashcard with cat ears ─── */

// Card silhouette with ears, viewBox 0 0 200 170.
export const KITTY_PATH =
  'M26 34 L40 7 Q43 1 48 6 L72 34 H128 L152 6 Q157 1 160 7 L174 34 Q194 34 194 54 V144 Q194 164 174 164 H26 Q6 164 6 144 V54 Q6 34 26 34 Z';

export type Mood = 'think' | 'happy' | 'sleep';

export const FaceG: React.FC<{ x: number; y: number; s?: number; mood: Mood }> = ({ x, y, s = 1, mood }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {mood === 'think' && (
      <>
        <ellipse cx="-22" cy="0" rx="5" ry="6.5" fill={INK} />
        <ellipse cx="22" cy="0" rx="5" ry="6.5" fill={INK} />
        <circle cx="-20.5" cy="-2.5" r="1.7" fill="var(--c-paper)" />
        <circle cx="23.5" cy="-2.5" r="1.7" fill="var(--c-paper)" />
      </>
    )}
    {mood === 'happy' && (
      <>
        <path d="M-29 3 Q-22 -8 -15 3" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M15 3 Q22 -8 29 3" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </>
    )}
    {mood === 'sleep' && (
      <>
        <path d="M-29 -1 Q-22 6 -15 -1" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M15 -1 Q22 6 29 -1" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </>
    )}
    <ellipse cx="-36" cy="13" rx="8" ry="4.5" fill={BLUSH} />
    <ellipse cx="36" cy="13" rx="8" ry="4.5" fill={BLUSH} />
    <path d="M-7 11 Q-3.5 16 0 11 Q3.5 16 7 11" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

export const KittyShape: React.FC<{
  fill: string;
  mood?: Mood;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}> = ({ fill, mood, className, style, title }) => (
  <svg viewBox="0 0 200 170" className={className} style={style} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
    {title && <title>{title}</title>}
    <path d={KITTY_PATH} fill={fill} stroke={INK} strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    <path d="M40 30 L46 15 L60 30 Z" fill={BLUSH} />
    <path d="M140 30 L154 15 L160 30 Z" fill={BLUSH} />
    {mood && <FaceG x={100} y={92} s={1} mood={mood} />}
  </svg>
);

// Ears placed on the top edge of any bordered HTML card; `fill` matches the card.
export const Ears: React.FC<{ fill: string }> = ({ fill }) => (
  <>
    {(['l', 'r'] as const).map((side) => (
      <svg key={side} className={`lp-ear lp-ear-${side}`} viewBox="0 0 44 36" aria-hidden="true">
        <path d="M2 39 L17 5 Q20 -1 24 4 L42 39" fill={fill} stroke={INK} strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d="M13 34 L20 16 L30 34 Z" fill={BLUSH} />
      </svg>
    ))}
  </>
);

/* ─── Doodles in the same line ─── */

export const Sparkle: React.FC<{ size: number; fill?: string; className?: string; style?: React.CSSProperties }> = ({
  size, fill = 'var(--c-butter)', className = '', style,
}) => (
  <svg width={size} height={size} viewBox="-2 -2 28 28" className={`lp-doodle ${className}`} style={style} aria-hidden="true">
    <path
      d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z"
      fill={fill}
      stroke={INK}
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

export const Pencil: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <svg width="150" height="40" viewBox="0 0 150 40" className={`lp-doodle ${className}`} style={style} aria-hidden="true">
    <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
      <rect x="22" y="8" width="96" height="24" rx="3" fill="var(--c-butter)" />
      <rect x="118" y="8" width="16" height="24" fill="var(--c-mint)" />
      <path d="M134 8 H140 Q147 8 147 15 V25 Q147 32 140 32 H134 Z" fill="var(--c-pink-soft)" />
      <path d="M22 8 L2 20 L22 32 Z" fill="var(--c-peach)" />
      <path d="M9 16 L2 20 L9 24 Z" fill={INK} />
      <path d="M26 20 H114" fill="none" strokeWidth="2" />
    </g>
  </svg>
);

export const Heart: React.FC<{ size: number; className?: string; style?: React.CSSProperties }> = ({ size, className = '', style }) => (
  <svg width={size} height={size} viewBox="-2 -2 28 26" className={`lp-doodle ${className}`} style={style} aria-hidden="true">
    <path
      d="M12 21 C5 15.5 1 12 1 7.5 C1 4 3.7 1.5 7 1.5 C9.2 1.5 11 2.7 12 4.5 C13 2.7 14.8 1.5 17 1.5 C20.3 1.5 23 4 23 7.5 C23 12 19 15.5 12 21 Z"
      fill="var(--c-pink-soft)"
      stroke={INK}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const MiniKitty: React.FC<{ fill: string }> = ({ fill }) => (
  <svg width="22" height="19" viewBox="0 0 200 170" aria-hidden="true">
    <path d={KITTY_PATH} fill={fill} stroke={INK} strokeWidth="14" strokeLinejoin="round" />
  </svg>
);
