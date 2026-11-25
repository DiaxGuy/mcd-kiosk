import React from 'react';

interface HappyMascotProps {
  className?: string;
  size?: number;
  message?: string;
  waving?: boolean;
}

export const HappyMascot: React.FC<HappyMascotProps> = ({
  className = '',
  size = 180,
}) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <img
        src="/images/happy-mascot.jpg"
        alt="Happy McDonald's"
        style={{ width: size, height: size }}
        className="object-contain mix-blend-multiply"
      />
    </div>
  );
};
