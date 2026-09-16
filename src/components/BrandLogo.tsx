import React from 'react';
import brandLogoImg from '../assets/brand_logo.jpg';
import { Camera } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'custom';
  showText?: boolean;
  shape?: 'rounded' | 'circle' | 'square' | 'none';
  alt?: string;
  variant?: 'full' | 'icon' | 'badge';
  dark?: boolean;
  src?: string;
  onClick?: () => void;
  isEditable?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  shape = 'rounded',
  alt = 'ENH RESTAURANT MANAGEMENT AIDE LTD.',
  variant = 'icon',
  dark = false,
  src,
  onClick,
  isEditable = false,
}) => {
  let dimensionClasses = 'w-9 h-9';
  if (size === 'xs') dimensionClasses = 'w-6 h-6';
  if (size === 'sm') dimensionClasses = 'w-7 h-7';
  if (size === 'md') dimensionClasses = 'w-10 h-10';
  if (size === 'lg') dimensionClasses = 'w-14 h-14';
  if (size === 'xl') dimensionClasses = 'w-24 h-24';
  if (size === '2xl') dimensionClasses = 'w-36 h-36 sm:w-44 sm:h-44';
  if (size === 'full') dimensionClasses = 'w-48 h-48 sm:w-60 sm:h-60 max-w-full aspect-square';
  if (size === 'custom') dimensionClasses = '';

  const shapeClasses =
    shape === 'circle'
      ? 'rounded-full aspect-square'
      : shape === 'square' || shape === 'none'
      ? 'rounded-none'
      : size === '2xl' || size === 'full' || size === 'xl'
      ? 'rounded-2xl'
      : 'rounded-xl';

  const imageSource = src && src.trim() ? src.trim() : brandLogoImg;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 ${onClick ? 'cursor-pointer group select-none active:scale-95 transition-all' : ''} ${className}`}
      title={isEditable ? 'Click to edit business logo icon' : alt}
    >
      <div
        className={`relative ${dimensionClasses} ${shapeClasses} overflow-hidden shrink-0 bg-white shadow-xs border border-amber-900/10 flex items-center justify-center p-0.5 transition-transform group-hover:scale-105`}
      >
        <img
          src={imageSource}
          alt={alt}
          className={`w-full h-full object-cover ${shapeClasses}`}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to default bundled logo if external URL fails
            if (e.currentTarget.src !== brandLogoImg) {
              e.currentTarget.src = brandLogoImg;
            }
          }}
        />

        {isEditable && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[1px]">
            <Camera className="w-3.5 h-3.5 text-white drop-shadow-md animate-pulse" />
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`text-sm font-black tracking-tight uppercase leading-tight font-sans ${
              dark ? 'text-amber-400' : 'text-[#163352]'
            }`}
          >
            ENH
          </span>
          <span
            className={`text-[8.5px] font-extrabold uppercase tracking-wider ${
              dark ? 'text-slate-400' : 'text-[#163352]/80'
            }`}
          >
            Restaurant Management Aide Ltd.
          </span>
        </div>
      )}
    </div>
  );
};


