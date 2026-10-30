import React, { useMemo } from 'react';

interface FloatingPetalsProps {
  enabled?: boolean;
}

export const FloatingPetals: React.FC<FloatingPetalsProps> = ({ enabled = true }) => {
  const petals = useMemo(() => {
    return Array.from({ length: 6 }).map((_, idx) => {
      const left = 5 + (idx * 16) + Math.random() * 8;
      const duration = 18 + Math.random() * 12; // 18-30s slow and gentle
      const delay = Math.random() * 12;
      const size = 10 + Math.random() * 8;
      const opacity = 0.15 + Math.random() * 0.2; // very soft and unobtrusive

      return {
        id: idx,
        left: `${left}%`,
        duration: `${duration}s`,
        delay: `${delay}s`,
        size,
        opacity,
      };
    });
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {petals.map(p => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            top: '-20px',
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        >
          <svg width={p.size} height={p.size} viewBox="0 0 30 30" fill="none">
            <path 
              d="M15 0 C22 8, 28 15, 20 25 C14 28, 8 22, 10 14 C11 7, 13 2, 15 0 Z" 
              fill="#f43f5e" 
              opacity="0.3" 
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
