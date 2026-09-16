import React from 'react';
import brandLogoImg from '../assets/brand_logo.jpg';
import { AppTheme } from '../types';

interface AppBackgroundProps {
  backgroundImage?: string;
  opacity?: number;
  blur?: number;
  fit?: 'cover' | 'contain' | 'tile';
  overlay?: 'none' | 'light' | 'dark' | 'emerald' | 'warm';
  theme?: AppTheme;
  reduceBlur?: boolean;
}

export const AppBackground: React.FC<AppBackgroundProps> = ({
  backgroundImage,
  opacity,
  blur = 0,
  fit = 'cover',
  overlay = 'none',
  theme = 'white',
  reduceBlur = true,
}) => {
  const isDark = theme === 'dark';
  const isWarmLight = theme === 'light';
  const isWhite = theme === 'white' || (!isDark && !isWarmLight);

  // When reduceBlur is active, force blur to 0 or clamp strictly for maximum clarity
  const effectiveBlur = reduceBlur ? 0 : Math.max(0, blur);

  const effectiveOpacity = opacity !== undefined 
    ? opacity 
    : backgroundImage 
    ? 0.22 
    : isWhite 
    ? 0.05 
    : 0.12;

  return (
    <div
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden flex items-center justify-center transition-colors duration-300"
      aria-hidden="true"
    >
      {/* 1. Base Theme Gradient Layer */}
      {isDark ? (
        <div className="absolute inset-0 bg-gradient-to-b from-[#121915] via-[#101713] to-[#0a100d]" />
      ) : isWarmLight ? (
        <div className="absolute inset-0 bg-gradient-to-b from-[#f9f8f3]/95 via-[#f4f5f0]/85 to-[#eeeae2]/95" />
      ) : (
        /* Pure White High Visibility Canvas */
        <div className="absolute inset-0 bg-white" />
      )}

      {/* 2. Custom Background Image from Gallery or Presets */}
      {backgroundImage ? (
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            opacity: effectiveOpacity,
            filter: effectiveBlur > 0 ? `blur(${effectiveBlur}px)` : undefined,
            transform: effectiveBlur > 0 ? 'scale(1.05)' : undefined, // prevent blur edge clipping only if blurred
          }}
        >
          {fit === 'tile' ? (
            <div
              className="w-full h-full crisp-img"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundRepeat: 'repeat',
                backgroundSize: '240px auto',
              }}
            />
          ) : fit === 'contain' ? (
            <div className="w-full h-full flex items-center justify-center p-8">
              <img
                src={backgroundImage}
                alt="App Background"
                className="max-w-full max-h-full object-contain crisp-img"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <img
              src={backgroundImage}
              alt="App Background"
              className="w-full h-full object-cover object-center crisp-img"
              referrerPolicy="no-referrer"
            />
          )}
        </div>
      ) : (
        /* Default Official Brand Watermark */
        <div className="relative flex flex-col items-center justify-center max-w-[85vw] max-h-[85vh]">
          {/* Subtle radial glow (omitted if reduceBlur is active or in pure white for maximum text legibility) */}
          {!isWhite && !reduceBlur && (
            <div
              className={`absolute w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] rounded-full blur-xl transform scale-105 ${
                isDark
                  ? 'bg-gradient-to-tr from-emerald-900/20 via-emerald-800/15 to-teal-900/15'
                  : 'bg-gradient-to-tr from-amber-200/20 via-emerald-100/15 to-orange-100/15'
              }`}
            />
          )}

          {/* Circular brand watermark */}
          <div
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden transition-opacity duration-300"
            style={{ opacity: effectiveOpacity }}
          >
            <img
              src={brandLogoImg}
              alt="Village House Brand Background"
              className={`w-full h-full object-contain filter drop-shadow-md crisp-img ${
                isDark ? 'mix-blend-screen brightness-90' : isWhite ? 'opacity-40 mix-blend-multiply' : 'mix-blend-multiply'
              }`}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* 3. Ambient Color Filter Overlay */}
      {overlay === 'light' && (
        <div className="absolute inset-0 bg-white/40 mix-blend-overlay" />
      )}
      {overlay === 'dark' && (
        <div className="absolute inset-0 bg-black/45 mix-blend-multiply" />
      )}
      {overlay === 'emerald' && (
        <div className="absolute inset-0 bg-[#143529]/30 mix-blend-multiply" />
      )}
      {overlay === 'warm' && (
        <div className="absolute inset-0 bg-[#8c4b26]/20 mix-blend-overlay" />
      )}

      {/* 4. Subtle Texture Grid */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? 'opacity-[0.035] bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px]'
            : isWhite
            ? 'opacity-[0.02] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:28px_28px]'
            : 'opacity-[0.03] bg-[radial-gradient(#1f4d3e_1px,transparent_1px)] [background-size:24px_24px]'
        }`}
      />

      {/* 5. Edge Vignette Gradients for Legibility */}
      <div
        className={`absolute top-0 inset-x-0 h-28 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-b from-[#121915]/80 to-transparent'
            : isWarmLight
            ? 'bg-gradient-to-b from-white/50 to-transparent'
            : 'bg-gradient-to-b from-white/90 to-transparent'
        }`}
      />
      <div
        className={`absolute bottom-0 inset-x-0 h-32 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-t from-[#0a100d]/90 to-transparent'
            : isWarmLight
            ? 'bg-gradient-to-t from-[#e9e6dd]/70 to-transparent'
            : 'bg-gradient-to-t from-white/90 to-transparent'
        }`}
      />
    </div>
  );
};
