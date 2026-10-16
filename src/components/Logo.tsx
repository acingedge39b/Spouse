import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'mark' | 'hero';
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  className = '', 
  onClick 
}) => {
  // SVG Insignia Emblem Component
  const Emblem = ({ size = 40 }: { size?: number }) => (
    <div 
      className="relative shrink-0 select-none group" 
      style={{ width: size, height: size }}
    >
      {/* Neo-brutalist shadow offset backing */}
      <div 
        className="absolute inset-0 rounded-2xl bg-[#121212] translate-x-0.5 translate-y-0.5 transition-transform group-hover:translate-x-1 group-hover:translate-y-1"
      />
      {/* Main emblem face */}
      <div className="relative w-full h-full rounded-2xl bg-[#FF5A36] border-2 border-[#121212] flex items-center justify-center p-1 overflow-hidden">
        <svg 
          viewBox="0 0 64 64" 
          className="w-full h-full text-white" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle radial crest lines */}
          <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="2 2" />
          
          {/* Academic Laurel Leaves (Left Branch) */}
          <path 
            d="M17 40 C 13 32, 16 23, 23 18 C 21 24, 23 30, 26 35" 
            stroke="white" 
            strokeWidth="2.4" 
            strokeLinecap="round" 
          />
          <path d="M19 28 C 16 26, 17 23, 20 22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19 36 C 16 35, 17 32, 20 31" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          
          {/* Academic Laurel Leaves (Right Branch) */}
          <path 
            d="M47 40 C 51 32, 48 23, 41 18 C 43 24, 41 30, 38 35" 
            stroke="white" 
            strokeWidth="2.4" 
            strokeLinecap="round" 
          />
          <path d="M45 28 C 48 26, 47 23, 44 22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M45 36 C 48 35, 47 32, 44 31" stroke="white" strokeWidth="1.8" strokeLinecap="round" />

          {/* Interlocked Marital Covenant Rings */}
          <circle cx="27" cy="33" r="9.5" stroke="#FFFDF7" strokeWidth="2.8" />
          <circle cx="37" cy="33" r="9.5" stroke="#FFE600" strokeWidth="2.8" />

          {/* Doctoral Flame / Enlightenment Star */}
          <polygon points="32,13 35,19 32,18 29,19" fill="#FFE600" stroke="#121212" strokeWidth="0.8" />
          <circle cx="32" cy="18" r="1.2" fill="#121212" />

          {/* Academic Base Ribbon */}
          <rect x="21" y="47" width="22" height="5.5" rx="2.75" fill="#121212" />
          <text 
            x="32" 
            y="51.2" 
            fontFamily="ui-monospace, monospace" 
            fontSize="4.2" 
            fontWeight="900" 
            fill="#FFE600" 
            textAnchor="middle" 
            letterSpacing="0.4"
          >
            Ψ 2026
          </text>
        </svg>
      </div>
    </div>
  );

  // Variant: Mark only
  if (variant === 'mark') {
    return (
      <div onClick={onClick} className={`inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}>
        <Emblem size={44} />
      </div>
    );
  }

  // Variant: Hero (Large, with institutional crest badges)
  if (variant === 'hero') {
    return (
      <div 
        onClick={onClick} 
        className={`flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <Emblem size={68} />
        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="neo-badge bg-[#FFE600] text-[#121212] text-[10px] font-mono px-2 py-0.5">
              IRB #2026-SP84
            </span>
            <span className="neo-badge bg-[#121212] text-white text-[10px] font-mono px-2 py-0.5">
              DOCTORAL DISSERTATION
            </span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#121212] tracking-tight leading-none">
            Marital Pressures Study
          </h2>
          <p className="text-xs text-gray-700 font-bold tracking-wide">
            Consortium for Behavioral & Relational Systems Research
          </p>
        </div>
      </div>
    );
  }

  // Variant: Compact (For mobile header or tight navigation)
  if (variant === 'compact') {
    return (
      <div 
        onClick={onClick} 
        className={`flex items-center gap-2 min-w-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <Emblem size={36} />
        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-black text-sm text-[#121212] tracking-tight truncate">
              Marital Pressures
            </span>
            <span className="neo-badge bg-[#FFE600] text-[#121212] text-[8px] px-1 py-0.2 shrink-0">
              PhD
            </span>
          </div>
          <p className="text-[9px] text-gray-600 font-bold truncate">
            Qualitative Portal • IRB #2026-SP84
          </p>
        </div>
      </div>
    );
  }

  // Variant: Full (Default header brand)
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-2.5 sm:gap-3 group min-w-0 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <Emblem size={44} />
      <div className="truncate">
        <div className="flex items-center gap-2">
          <span className="font-serif font-black text-base sm:text-xl text-[#121212] tracking-tight truncate group-hover:text-[#FF5A36] transition-colors">
            Marital Pressures Study
          </span>
          <span className="neo-badge bg-[#FFE600] text-[#121212] text-[9px] px-2 py-0.5 shrink-0 shadow-[1px_1px_0px_0px_#000]">
            PhD
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-gray-700 font-bold truncate tracking-tight">
          Qualitative Research Portal • IRB Protocol #2026-SP84
        </p>
      </div>
    </div>
  );
};
