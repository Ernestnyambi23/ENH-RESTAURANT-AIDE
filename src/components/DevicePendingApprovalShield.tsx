import React, { useState } from 'react';
import { ShieldAlert, Clock, RefreshCw, KeyRound, CheckCircle2, Smartphone, AlertTriangle, Radio, Eye, EyeOff } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { triggerHaptic } from '../utils/haptics';

interface DevicePendingApprovalShieldProps {
  deviceName: string;
  deviceId: string;
  pairingCode?: string;
  onCheckStatus: () => void;
  onUnlockWithAdminPassword: (password: string) => boolean;
}

export const DevicePendingApprovalShield: React.FC<DevicePendingApprovalShieldProps> = ({
  deviceName,
  deviceId,
  pairingCode = 'OPH-8921',
  onCheckStatus,
  onUnlockWithAdminPassword,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [showAdminBypass, setShowAdminBypass] = useState(false);

  const handleRefresh = () => {
    triggerHaptic('light');
    setIsChecking(true);
    onCheckStatus();
    setTimeout(() => {
      setIsChecking(false);
    }, 800);
  };

  const handleAdminBypass = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    if (onUnlockWithAdminPassword(password.trim())) {
      setError('');
    } else {
      setError('Invalid Admin Master Password (Default: admin).');
      triggerHaptic('warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#143529] text-white flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
      <div className="max-w-md w-full bg-[#1b2620] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5 my-auto">
        {/* Brand & Pulsing Security Badge */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <BrandLogo size="lg" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center border-2 border-[#1b2620] text-black animate-pulse shadow-md">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Title & Status */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase text-amber-300 bg-amber-950/70 px-3 py-1 rounded-full border border-amber-700/60 mb-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>Awaiting Admin Authorization</span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight">
            App Installation Registered
          </h2>
          <p className="text-xs text-[#cfe0d7] mt-1.5 leading-relaxed">
            This terminal is waiting for the restaurant administrator to allow access from the <strong className="text-amber-300">Admin Devices List</strong>.
          </p>
        </div>

        {/* Device Information Card with Pairing Code */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#8b978f] font-bold">
              Device Details
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#1f4d3e] text-emerald-300 px-2 py-0.5 rounded">
              {deviceId}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8b978f]">Terminal Name:</span>
              <span className="font-bold text-white truncate max-w-[180px]">{deviceName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8b978f]">Pairing Code:</span>
              <span className="font-mono font-extrabold text-amber-300 text-sm tracking-widest bg-black/50 px-2 py-0.5 rounded border border-amber-500/30">
                {pairingCode}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-[#cfe0d7]">
            <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span>Alert notification sent to restaurant manager terminal</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isChecking}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Admin Approval...' : 'Check Approval Status'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAdminBypass(!showAdminBypass)}
            className="text-xs text-[#8b978f] hover:text-white flex items-center justify-center gap-1.5 w-full py-1.5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{showAdminBypass ? 'Hide On-Site Override' : 'On-Site Admin? Unlock with Master Password'}</span>
          </button>
        </div>

        {/* On-Site Admin Password Override Form */}
        {showAdminBypass && (
          <form onSubmit={handleAdminBypass} className="bg-black/30 border border-white/15 rounded-2xl p-3.5 text-left space-y-2.5 animate-in fade-in zoom-in-95">
            <label className="block text-[11px] font-bold text-[#cfe0d7]">
              Enter Master Admin Password:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Admin password (default: admin)..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full px-3 py-2 pr-9 bg-black/60 border border-white/20 rounded-xl text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {error && (
              <p className="text-[11px] text-red-400 font-bold">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-2 bg-[#1f4d3e] hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Instantly Approve & Start App</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
