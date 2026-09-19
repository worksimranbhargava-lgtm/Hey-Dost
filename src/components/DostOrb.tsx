import React, { useState, useEffect, useRef } from 'react';
import type { OrbState } from '../types';

interface OrbProps {
  state: OrbState;
  size?: number;
  onClick?: () => void;
  reduced?: boolean;
}

const ORB_LABEL: Record<OrbState, string> = {
  idle: '',
  listening: "I'm listening...",
  thinking: 'Let me understand...',
  speaking: "Here's what I found...",
  uncertain: "I'm not sure I understood.",
  error: 'Something went wrong. Tap to try again.',
};

export const DostOrb: React.FC<OrbProps> = ({ state, size = 140, onClick, reduced = false }) => {
  const [pulse, setPulse] = useState(0);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    if (reduced) { setPulse(0); return; }

    let running = true;
    const animate = (t: number) => {
      if (!running) return;
      const delta = t - timeRef.current;
      timeRef.current = t;

      // Gentle sine-wave pulsing
      const speed = state === 'listening' ? 0.003 : state === 'thinking' ? 0.002 : 0.001;
      setPulse(prev => {
        const next = prev + speed * delta;
        return next > Math.PI * 2 ? next - Math.PI * 2 : next;
      });

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(t => {
      timeRef.current = t;
      rafRef.current = requestAnimationFrame(animate);
    });
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [state, reduced]);

  const glowScale = reduced ? 1 : 1 + Math.sin(pulse) * (
    state === 'listening' ? 0.08 :
    state === 'thinking' ? 0.05 :
    state === 'speaking' ? 0.06 : 0.03
  );

  const innerScale = reduced ? 1 : 1 + Math.sin(pulse + 0.5) * (
    state === 'listening' ? 0.05 : 0.02
  );

  const colors: Record<OrbState, { outer: string; inner: string; glow: string }> = {
    idle:      { outer: '#1B8A6B', inner: '#F59E2B', glow: 'rgba(27,138,107,0.18)' },
    listening: { outer: '#1B8A6B', inner: '#F59E2B', glow: 'rgba(245,158,43,0.35)' },
    thinking:  { outer: '#1B8A6B', inner: '#60A5FA', glow: 'rgba(96,165,250,0.30)' },
    speaking:  { outer: '#059669', inner: '#34D399', glow: 'rgba(52,211,153,0.30)' },
    uncertain: { outer: '#9B8B5A', inner: '#F59E2B', glow: 'rgba(245,158,43,0.20)' },
    error:     { outer: '#DC2626', inner: '#F87171', glow: 'rgba(220,38,38,0.35)' },
  };

  const c = colors[state];
  const half = size / 2;
  const innerR = size * 0.22;
  const outerR = size * 0.38;

  return (
    <div
      className="dost-orb-container"
      style={{ width: size, height: size, position: 'relative', cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Talk to Dost' : undefined}
    >
      {/* Outer glow ring */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`,
        transform: `scale(${glowScale * 1.3})`,
        transition: reduced ? 'none' : 'transform 0.1s ease-out',
      }} />

      {/* Main orb */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          position: 'relative',
          zIndex: 1,
          transform: `scale(${innerScale})`,
          transition: reduced ? 'none' : 'transform 0.1s ease-out',
          overflow: 'visible',
        }}
      >
        <defs>
          <radialGradient id="orb-outer" cx="40%" cy="35%">
            <stop offset="0%" stopColor={c.outer} stopOpacity="0.9" />
            <stop offset="100%" stopColor={c.outer} stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id="orb-inner" cx="40%" cy="35%">
            <stop offset="0%" stopColor={c.inner} stopOpacity="1" />
            <stop offset="100%" stopColor={c.inner} stopOpacity="0.7" />
          </radialGradient>
          <filter id="orb-blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Outer teal shape (like the logo body/embrace) */}
        <ellipse
          cx={half * 0.85}
          cy={half * 1.2}
          rx={outerR}
          ry={outerR * 0.6}
          fill="url(#orb-outer)"
          opacity="0.9"
        />
        {/* Arc/embrace shape */}
        <path
          d={`M ${half * 0.4} ${half * 1.5} Q ${half * 0.3} ${half * 0.7} ${half * 0.9} ${half * 0.65} Q ${half * 1.6} ${half * 0.6} ${half * 1.5} ${half * 1.3} Q ${half * 1.2} ${half * 1.7} ${half * 0.4} ${half * 1.5}`}
          fill="url(#orb-outer)"
          opacity="0.85"
        />
        {/* Teal head circle (left figure) */}
        <circle
          cx={half * 0.75}
          cy={half * 0.52}
          r={outerR * 0.35}
          fill="url(#orb-outer)"
          opacity="0.95"
        />
        {/* Orange sun/companion circle */}
        <circle
          cx={half * 1.28}
          cy={half * 0.48}
          r={innerR}
          fill="url(#orb-inner)"
          opacity="0.95"
        />
        {/* Orange rays (simplified) */}
        {state !== 'idle' && !reduced && [0, 45, 90].map(angle => {
          const rad = (angle * Math.PI) / 180;
          const rx = half * 1.28 + Math.cos(rad) * innerR * 1.5;
          const ry = half * 0.48 + Math.sin(rad) * innerR * 1.5;
          const rx2 = half * 1.28 + Math.cos(rad) * innerR * 2;
          const ry2 = half * 0.48 + Math.sin(rad) * innerR * 2;
          return (
            <line
              key={angle}
              x1={rx} y1={ry} x2={rx2} y2={ry2}
              stroke={c.inner}
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
          );
        })}
      </svg>

      {/* State label */}
      {ORB_LABEL[state] && (
        <div style={{
          position: 'absolute',
          bottom: -32,
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontSize: 13,
          color: '#1B8A6B',
          fontWeight: 500,
          letterSpacing: '0.01em',
        }}>
          {ORB_LABEL[state]}
        </div>
      )}
    </div>
  );
};
