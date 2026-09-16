import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Lock,
  KeyRound,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Terminal,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Code2,
  ChevronRight,
} from 'lucide-react';
import { EnhLogo } from './EnhLogo';
import { BrandLogo } from './BrandLogo';
import { AuthUser } from '../types';
import { UserRole } from '../utils/rbac';
import { sound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

// Secret key sequence required on the access screen to unlock Super Admin ('enhadmin')
const SECRET_OVERRIDE_SEQUENCE = ['e', 'n', 'h', 'a', 'd', 'm', 'i', 'n'];

interface SuperAdminSecureAccessProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenDeveloperSpace?: () => void;
  onAuthenticated: (authData: {
    role: UserRole;
    user: AuthUser;
    company: string;
  }) => void;
  enableSourceProtection?: boolean;
}

export const SuperAdminSecureAccess: React.FC<SuperAdminSecureAccessProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpenDeveloperSpace,
  onAuthenticated,
  enableSourceProtection = true,
}) => {
  // Keystroke buffer & modal visibility
  const [keyBuffer, setKeyBuffer] = useState<string[]>([]);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const showAdminModal = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setStep('CREDENTIALS');
    setErrorMessage('');
  };

  // Auth flow step: 'CREDENTIALS' | 'MFA' | 'GRANTED'
  const [step, setStep] = useState<'CREDENTIALS' | 'MFA' | 'GRANTED'>('CREDENTIALS');

  // Form states
  const [email, setEmail] = useState('admin@enh.co.tz');
  const [password, setPassword] = useState('MasterPassword123!');
  const [secretOverrideKey, setSecretOverrideKey] = useState('ENH-SEC-9021');
  const [showPassword, setShowPassword] = useState(false);
  const [showOverrideKey, setShowOverrideKey] = useState(false);

  // MFA OTP states
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Anti-Debugging / Source Code Disguise Guard
  useEffect(() => {
    if (!enableSourceProtection) return;

    // 1. Disable Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      // Allow right-click on inputs/textareas for usability
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // 2. Disable Key Shortcuts for Inspect Element (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
    const handleKeyDownProtection = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
      ) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('keydown', handleKeyDownProtection);

    // 3. DevTools Timing Detection (Disguise/Break Execution if Inspector Opened)
    const devToolsInterval = setInterval(() => {
      const startTime = performance.now();
      try {
        // Evaluate debugger; thread halts noticeably if DevTools is actively inspecting
        const debugFn = new Function('debugger');
        debugFn();
      } catch {
        // Suppress
      }
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        // DevTools detected: clear sensitive UI state immediately
        if (internalIsOpen) {
          setInternalIsOpen(false);
          setErrorMessage('Security Violation: Debugger Detected.');
        }
      }
    }, 3000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDownProtection);
      clearInterval(devToolsInterval);
    };
  }, [enableSourceProtection, internalIsOpen]);

  // Listener for Secret Key Override Sequence (Typing 'enhadmin' anywhere on the page)
  const handleGlobalKeyPress = useCallback((e: KeyboardEvent) => {
    // Ignore keystrokes inside text inputs so users can type normally
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    const key = e.key.toLowerCase();
    setKeyBuffer((prev) => {
      const updated = [...prev, key].slice(-SECRET_OVERRIDE_SEQUENCE.length);
      if (updated.join('') === SECRET_OVERRIDE_SEQUENCE.join('')) {
        setInternalIsOpen(true);
        setErrorMessage('');
        sound.playKitchenBell();
        triggerHaptic('heavy');
      }
      return updated;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, [handleGlobalKeyPress]);

  // Step 1: Validate Master Credentials & Override Key
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanKey = secretOverrideKey.trim();

    // Valid master credentials check
    const isValidCreds =
      (cleanEmail === 'admin@enh.co.tz' || cleanEmail === 'developer' || cleanEmail === 'admin') &&
      (cleanPass === 'MasterPassword123!' || cleanPass === 'dev123' || cleanPass === 'admin123') &&
      (cleanKey === 'ENH-SEC-9021' || cleanKey === 'ENH-ROOT');

    if (isValidCreds) {
      sound.playSuccess();
      triggerHaptic('medium');
      setStep('MFA');
      // Auto-fill demo OTPs after short delay for quick testing
      setTimeout(() => {
        if (!emailOtp) setEmailOtp('654321');
        if (!phoneOtp) setPhoneOtp('123456');
      }, 500);
    } else {
      sound.playError();
      triggerHaptic('heavy');
      setErrorMessage('Invalid Master Credentials or Secret Override Key.');
    }
  };

  // Step 2: Validate Dual Multi-Factor Authentication (Email + SMS)
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmailOtp = emailOtp.trim();
    const cleanPhoneOtp = phoneOtp.trim();

    if (cleanEmailOtp === '654321' && cleanPhoneOtp === '123456') {
      sound.playSuccess();
      triggerHaptic('heavy');
      setStep('GRANTED');

      const masterUser: AuthUser = {
        id: 'enh-superadmin-master',
        username: 'enh-master',
        name: 'ENH Platform Architect & Super Admin',
        role: UserRole.DEVELOPER,
        restaurant_id: 'ALL',
        businessId: null,
        email: 'admin@enh.co.tz',
        lastLoginAt: Date.now(),
      };

      setTimeout(() => {
        onAuthenticated({
          role: UserRole.DEVELOPER,
          user: masterUser,
          company: 'ENH RESTAURANT MANAGEMENT AIDE LTD.',
        });
        handleClose();
      }, 1200);
    } else {
      sound.playError();
      triggerHaptic('heavy');
      setErrorMessage('Invalid MFA Codes. Verify both Email (654321) and Phone (123456) OTPs.');
    }
  };

  const copyDemoCreds = (field: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInstantDeveloperAccess = () => {
    sound.playSuccess();
    triggerHaptic('heavy');
    const masterUser: AuthUser = {
      id: 'enh-superadmin-master',
      username: 'enh-master',
      name: 'ENH Platform Architect & Super Admin',
      role: UserRole.DEVELOPER,
      restaurant_id: 'ALL',
      businessId: null,
      email: 'admin@enh.co.tz',
      lastLoginAt: Date.now(),
    };
    onAuthenticated({
      role: UserRole.DEVELOPER,
      user: masterUser,
      company: 'ENH RESTAURANT MANAGEMENT AIDE LTD.',
    });
    handleClose();
  };

  if (!showAdminModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-[99999] animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="superadmin-modal-title"
    >
      <div className="bg-white text-slate-800 border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle top accent bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-600 via-amber-500 to-teal-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close Secure Access"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Official Brand Emblem */}
        <div className="border-b border-slate-100 pb-4 mb-4 text-center">
          <div className="flex justify-center mb-3">
            <EnhLogo size="md" textColor="navy" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10px] font-mono uppercase tracking-wider font-bold mb-1">
            <ShieldAlert className="w-3 h-3" />
            <span>Super Admin & Developer Settings</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            ENH SaaS Console • Branch Partition Inspector & Root Settings
          </p>

          {/* Instant 1-Click Developer Login Quick Button */}
          <button
            type="button"
            id="superadmin-quick-instant-login-btn"
            onClick={handleInstantDeveloperAccess}
            className="mt-3 w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white text-xs font-bold transition-all shadow-md active:scale-98 flex items-center justify-between border border-slate-700 hover:border-emerald-500/50 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>1-Click Developer Direct Login</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Instant
            </span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: CREDENTIALS */}
        {/* ========================================================================= */}
        {step === 'CREDENTIALS' && (
          <form onSubmit={handleCredentialSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Master Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono shadow-2xs"
                  placeholder="admin@enh.co.tz"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono shadow-2xs"
                  placeholder="Master Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Secret Override Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showOverrideKey ? 'text' : 'password'}
                  required
                  value={secretOverrideKey}
                  onChange={(e) => setSecretOverrideKey(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono shadow-2xs"
                  placeholder="ENH-SEC-XXXX"
                />
                <button
                  type="button"
                  onClick={() => setShowOverrideKey(!showOverrideKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showOverrideKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Helper */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-700" />
                  Preset Master Key:
                </span>
                <button
                  type="button"
                  onClick={() => copyDemoCreds('all', 'admin@enh.co.tz / MasterPassword123! / ENH-SEC-9021')}
                  className="text-[10px] text-slate-500 hover:text-emerald-800 flex items-center gap-1 cursor-pointer font-semibold"
                >
                  {copiedField === 'all' ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'all' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-[10px] text-slate-500 space-y-0.5 font-mono">
                <div>Email: <span className="text-slate-900 font-medium">admin@enh.co.tz</span></div>
                <div>Pass: <span className="text-slate-900 font-medium">MasterPassword123!</span></div>
                <div>Key: <span className="text-slate-900 font-medium">ENH-SEC-9021</span></div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
                <span>Verify Credentials</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-98 cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
            </div>

            {onOpenDeveloperSpace && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenDeveloperSpace();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-950 text-xs font-bold transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <span>Open Super Admin Developer Settings & Review Space</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: MULTI-FACTOR AUTHENTICATION (EMAIL + SMS) */}
        {/* ========================================================================= */}
        {step === 'MFA' && (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[12px] text-emerald-900 flex items-start gap-2 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Dual MFA verification sent to registered admin channels (admin@enh.co.tz & +255 7XX XXX 921).
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Email Verification Code (OTP)
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Demo: 654321</span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base tracking-widest text-center focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono font-bold shadow-2xs"
                  placeholder="654321"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  SMS / Phone Verification Code (OTP)
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Demo: 123456</span>
              </div>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-base tracking-widest text-center focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono font-bold shadow-2xs"
                  placeholder="123456"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Authenticate & Grant Access</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('CREDENTIALS')}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-98 cursor-pointer border border-slate-200"
              >
                Back
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: GRANTED */}
        {/* ========================================================================= */}
        {step === 'GRANTED' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-black text-emerald-900">Access Granted</h4>
            <p className="text-xs text-slate-600">
              Dual MFA Verified. Initializing Super Admin Controls for ENH RESTAURANT MANAGEMENT AIDE LTD...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSecureAccess;
