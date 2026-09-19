import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'prominent';
  showTagline?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SIZES = {
  sm: { height: 38, maxHeight: 42 },
  md: { height: 72, maxHeight: 80 },
  lg: { height: 110, maxHeight: 120 },
  prominent: { height: 150, maxHeight: 165 },
};

export const DostLogo: React.FC<LogoProps> = ({ size = 'prominent', style }) => {
  const s = SIZES[size];
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }}>
      <img
        src="/logo.jpg"
        alt="Hey Dost"
        style={{
          height: s.height,
          maxHeight: s.maxHeight,
          width: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block',
          borderRadius: 12,
        }}
      />
    </div>
  );
};
