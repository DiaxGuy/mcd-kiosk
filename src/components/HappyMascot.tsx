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
  message,
  waving = true,
}) => {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Speech bubble if message provided */}
      {message && (
        <div className="mb-3 px-4 py-2 bg-white text-[#111] font-black text-xs md:text-sm rounded-2xl shadow-lg border-2 border-mcd-yellow relative animate-bounce">
          <span>{message}</span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
        </div>
      )}

      {/* SVG Cartoon Character: Happy - Iconic McDonald's Mascot */}
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 200 230"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-xl"
      >
        {/* Animated Left Arm (waving) */}
        <g className={waving ? "animate-wiggle origin-bottom-right" : ""}>
          <path
            d="M48 115 C20 95, 12 70, 22 55 C30 45, 42 58, 48 78 Z"
            fill="#D9222A"
          />
          {/* Yellow Hand Glove */}
          <circle cx="20" cy="52" r="14" fill="#FFBC0D" />
          <circle cx="12" cy="46" r="6" fill="#FFBC0D" />
          <circle cx="20" cy="40" r="6" fill="#FFBC0D" />
        </g>

        {/* Animated Right Arm */}
        <g>
          <path
            d="M152 115 C178 100, 188 78, 178 62 C170 52, 158 64, 152 82 Z"
            fill="#D9222A"
          />
          {/* Yellow Hand Glove */}
          <circle cx="180" cy="58" r="14" fill="#FFBC0D" />
          <circle cx="188" cy="52" r="6" fill="#FFBC0D" />
          <circle cx="180" cy="46" r="6" fill="#FFBC0D" />
        </g>

        {/* Happy's Feet / Shoes */}
        <ellipse cx="65" cy="216" rx="24" ry="12" fill="#FFBC0D" />
        <ellipse cx="65" cy="212" rx="20" ry="10" fill="#FFE082" />
        <ellipse cx="135" cy="216" rx="24" ry="12" fill="#FFBC0D" />
        <ellipse cx="135" cy="212" rx="20" ry="10" fill="#FFE082" />

        {/* Main Body (Red Happy Meal Box) */}
        <rect
          x="44"
          y="42"
          width="112"
          height="165"
          rx="22"
          fill="#D9222A"
        />

        {/* Box Top Handle with Golden Arches */}
        <path
          d="M60 44 C60 18, 90 12, 100 28 C110 12, 140 18, 140 44 Z"
          fill="#FFBC0D"
        />
        <path
          d="M72 44 C72 26, 92 22, 100 34 C108 22, 128 26, 128 44 Z"
          fill="#D9222A"
        />

        {/* Big Cartoon Eyes */}
        {/* Left Eye */}
        <circle cx="76" cy="90" r="18" fill="white" />
        <circle cx="80" cy="90" r="10" fill="#1A1A1A" />
        <circle cx="83" cy="86" r="3.5" fill="white" />
        <circle cx="78" cy="93" r="1.5" fill="white" />

        {/* Right Eye */}
        <circle cx="124" cy="90" r="18" fill="white" />
        <circle cx="120" cy="90" r="10" fill="#1A1A1A" />
        <circle cx="123" cy="86" r="3.5" fill="white" />
        <circle cx="118" cy="93" r="1.5" fill="white" />

        {/* Rosy Cheeks */}
        <ellipse cx="58" cy="118" rx="8" ry="5" fill="#FF6B6B" opacity="0.6" />
        <ellipse cx="142" cy="118" rx="8" ry="5" fill="#FF6B6B" opacity="0.6" />

        {/* Big Characteristic Happy Smile */}
        <path
          d="M64 120 Q100 185 136 120 Z"
          fill="#520508"
        />

        {/* Big White Teeth Row */}
        <path
          d="M66 122 Q100 144 134 122 L131 133 Q100 152 69 133 Z"
          fill="white"
        />

        {/* Teeth Separation Lines */}
        <line x1="84" y1="126" x2="84" y2="136" stroke="#DDD" strokeWidth="1.5" />
        <line x1="100" y1="129" x2="100" y2="140" stroke="#DDD" strokeWidth="1.5" />
        <line x1="116" y1="126" x2="116" y2="136" stroke="#DDD" strokeWidth="1.5" />

        {/* Pink Tongue */}
        <path
          d="M86 160 Q100 148 114 160 Q100 180 86 160 Z"
          fill="#FF758F"
        />

        {/* Golden Arches Logo Badge on Chest */}
        <g transform="translate(85, 182) scale(0.065)">
          <path
            fill="#FFBC0D"
            d="M314.4,65.1c-0.5,0-1.1,0-1.6,0c-28.9,1.2-54.5,40-71.5,100.1c-17-60.1-42.6-98.9-71.5-100.1
            c-0.5,0-1.1,0-1.6,0c-51.8,0-93.8,130.6-93.8,291.8h41.7c0-149.7,23.4-271,52.1-271s52.1,112,52.1,250.2h0.3H262h0.3
            c0-138.1,23.4-250.2,52.1-250.2s52.1,121.3,52.1,271h41.7C408.2,195.7,366.2,65.1,314.4,65.1z"
          />
        </g>
      </svg>
    </div>
  );
};
