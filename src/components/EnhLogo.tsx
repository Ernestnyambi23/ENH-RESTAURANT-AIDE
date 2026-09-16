import React from 'react';
import brandLogoImg from '../assets/brand_logo.jpg';

interface EnhLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  showText?: boolean;
  textColor?: 'dark' | 'light' | 'navy';
  useImageOnly?: boolean;
}

/**
 * Official Brand Logo for ENH RESTAURANT MANAGEMENT AIDE LTD.
 * Renders the golden cloche 'E' emblem with navy cutlery and corporate typography.
 */
export const EnhLogo: React.FC<EnhLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'navy',
  useImageOnly = false,
}) => {
  // Dimension scales
  const sizeMap = {
    xs: { emblem: 'w-6 h-6', textTitle: 'text-xs', textSub: 'text-[7px]' },
    sm: { emblem: 'w-8 h-8', textTitle: 'text-sm', textSub: 'text-[8.5px]' },
    md: { emblem: 'w-11 h-11', textTitle: 'text-base', textSub: 'text-[10px]' },
    lg: { emblem: 'w-16 h-16', textTitle: 'text-xl', textSub: 'text-xs' },
    xl: { emblem: 'w-24 h-24', textTitle: 'text-3xl', textSub: 'text-sm' },
    '2xl': { emblem: 'w-36 h-36', textTitle: 'text-4xl', textSub: 'text-base' },
    hero: { emblem: 'w-48 h-48', textTitle: 'text-5xl', textSub: 'text-lg' },
  };

  const currentSize = sizeMap[size];

  const titleColorClass =
    textColor === 'light'
      ? 'text-white'
      : textColor === 'dark'
      ? 'text-slate-900'
      : 'text-[#163352]';

  const subColorClass =
    textColor === 'light'
      ? 'text-slate-300'
      : textColor === 'dark'
      ? 'text-slate-600'
      : 'text-[#163352]/90';

  if (useImageOnly) {
    return (
      <div className={`inline-flex flex-col items-center justify-center ${className}`}>
        <img
          src={brandLogoImg}
          alt="ENH RESTAURANT MANAGEMENT AIDE LTD."
          className={`${currentSize.emblem} object-contain`}
          referrerPolicy="no-referrer"
        />
        {showText && (
          <div className="text-center mt-2">
            <h1 className={`font-black tracking-tight ${titleColorClass} ${currentSize.textTitle} leading-none`}>
              ENH
            </h1>
            <p className={`font-bold tracking-widest uppercase mt-0.5 ${subColorClass} ${currentSize.textSub}`}>
              RESTAURANT MANAGEMENT AIDE LTD.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      {/* High-definition Vector Emblem */}
      <svg
        viewBox="0 0 350 250"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentSize.emblem} aspect-[350/250] overflow-visible drop-shadow-xs`}
        aria-label="ENH Brand Emblem"
      >
        {/* Top Handle / Ring on Cloche */}
        <circle
          cx="175"
          cy="38"
          r="14"
          stroke="#C59B53"
          strokeWidth="9"
          fill="none"
        />

        {/* Steam Wisps rising from upper right */}
        <path
          d="M208 42 C216 28 228 24 232 14 C234 9 233 4 231 2 C236 7 241 16 238 27 C234 37 222 42 216 56"
          fill="#C59B53"
        />
        <path
          d="M226 48 C232 40 240 37 244 28 C246 23 245 18 244 16 C247 21 251 28 248 37 C245 46 236 50 231 60"
          fill="#C59B53"
        />

        {/* Cloche Dome forming the 'E' silhouette on the right */}
        {/* Main outer dome arc */}
        <path
          d="M90 178 C90 98 126 56 182 56 C228 56 250 82 250 112 C250 132 236 142 222 145 C236 148 250 156 250 178"
          stroke="#C59B53"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Middle arm of the 'E' inside cloche */}
        <path
          d="M188 145 L242 145"
          stroke="#C59B53"
          strokeWidth="15"
          strokeLinecap="round"
        />

        {/* Bottom Horizontal Platter Bar */}
        <path
          d="M75 188 L275 188"
          stroke="#C59B53"
          strokeWidth="15"
          strokeLinecap="round"
        />

        {/* Navy Blue Fork */}
        <g fill="#163352">
          {/* Fork tines */}
          <rect x="156" y="88" width="3.5" height="34" rx="1.75" />
          <rect x="162" y="88" width="3.5" height="34" rx="1.75" />
          <rect x="168" y="88" width="3.5" height="34" rx="1.75" />
          <rect x="174" y="88" width="3.5" height="34" rx="1.75" />
          {/* Fork bridge */}
          <path d="M155 120 C155 130 175 130 175 120 Z" />
          {/* Fork handle */}
          <rect x="163" y="126" width="7" height="62" rx="3.5" />
        </g>

        {/* Navy Blue Knife */}
        <g fill="#163352">
          {/* Knife blade with curve */}
          <path
            d="M187 88 C187 88 198 94 198 128 L187 132 Z"
          />
          {/* Knife bolster / guard */}
          <rect x="186" y="130" width="12" height="4" rx="2" />
          {/* Knife handle */}
          <rect x="189" y="134" width="7" height="54" rx="3.5" />
        </g>
      </svg>

      {/* Typography */}
      {showText && (
        <div className="text-center mt-1 flex flex-col items-center">
          <span
            className={`font-black tracking-normal uppercase ${titleColorClass} ${currentSize.textTitle} leading-none font-sans`}
          >
            ENH
          </span>
          <span
            className={`font-bold tracking-widest uppercase mt-0.5 text-center ${subColorClass} ${currentSize.textSub}`}
            style={{ letterSpacing: '0.14em' }}
          >
            RESTAURANT MANAGEMENT AIDE LTD.
          </span>
        </div>
      )}
    </div>
  );
};
