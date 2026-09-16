import React, { useState } from 'react';
import { ShieldAlert, Lock, RefreshCw, KeyRound, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface DeviceLockoutShieldProps {
  onUnlockWithPassword: (password: string) => boolean;
  deviceName: string;
}

export const DeviceLockoutShield: React.FC<DeviceLockoutShieldProps> = ({
  onUnlockWithPassword,
  deviceName,
}) => {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUnlockWithPassword(password.trim())) {
      setError('');
    } else {
      setError('Invalid Admin Password. Terminal remains disabled (Default: admin).');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#143529] text-white flex items-center justify-center p-5 select-none">
      <div className="max-w-md w-full bg-[#1b2620] border border-red-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
        <div className="flex items-center justify-center">
          <div className="relative">
            <BrandLogo size="lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center border-2 border-[#1b2620] text-white">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-extrabold tracking-widest uppercase text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-800/60 inline-block mb-2">
            Device Access Disabled
          </span>
          <h2 className="text-xl font-extrabold text-white">
            Terminal Access Suspended
          </h2>
          <p className="text-xs text-[#cfe0d7] mt-1.5 leading-relaxed">
            This device (<strong className="text-white">{deviceName}</strong>) has been deactivated by the restaurant administrator for security or maintenance.
          </p>
        </div>

        <div className="bg-black/30 border border-white/10 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs text-amber-300 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Administrator Authorization Required</span>
          </div>
          <p className="text-[11px] text-[#8b978f]">
            To re-enable POS ordering or kitchen display on this terminal, enter the master ownership password below (default: <code className="text-amber-300">admin</code>).
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-3 pt-2">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Master Admin Password..."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              className="w-full px-4 py-3 pr-11 bg-black/40 border border-white/20 rounded-xl text-sm font-mono text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 font-bold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#1f4d3e] hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Re-Authorize & Unlock Terminal</span>
          </button>
        </form>
      </div>
    </div>
  );
};
