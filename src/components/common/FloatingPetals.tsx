import React, { useMemo } from 'react';

interface FloatingPetalsProps {
  enabled: boolean;
}

export const FloatingPetals: React.FC<FloatingPetalsProps> = ({ enabled }) => {
  const petals = useMemo(() => {
    return Array.from({ length: 14 }).map((_, idx) => {
      const left = Math.random() * 100;
      const duration = 12 + Math.random() * 14; // 12-26s
      const delay = Math.random() * 10;
      const size = 12 + Math.random() * 14;
      const opacity = 0.35 + Math.random() * 0.4;
      const isBow = idx % 4 === 0;

      return {
        id: idx,
        left: `${left}%`,
        duration: `${duration}s`,
        delay: `${delay}s`,
        size,
        opacity,
        isBow,
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
            top: '-30px',
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        >
          {p.isBow ? (
            <span style={{ fontSize: `${p.size}px` }}>🎀</span>
          ) : (
            <svg width={p.size} height={p.size} viewBox="0 0 30 30" fill="none">
              <path 
                d="M15 0 C22 8, 28 15, 20 25 C14 28, 8 22, 10 14 C11 7, 13 2, 15 0 Z" 
                fill="#ffb6c1" 
                opacity="0.85" 
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};
