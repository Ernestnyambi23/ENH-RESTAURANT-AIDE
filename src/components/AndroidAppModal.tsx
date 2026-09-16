import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  Layers,
  Sparkles,
  Cpu,
  Share2,
  Terminal,
  ShieldCheck,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { triggerHaptic } from '../utils/haptics';

interface AndroidAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
  isStandalone: boolean;
}

export const AndroidAppModal: React.FC<AndroidAppModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallPwa,
  isStandalone,
}) => {
  const [activeTab, setActiveTab] = useState<'install' | 'icon' | 'qr' | 'apk'>('install');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCli, setCopiedCli] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.href);
    }
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const cliCode = `# 1. Install Capacitor Android bridge
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize project
npx cap init "ENH Restaurant Management Aide" com.enh.restaurant.aide

# 3. Add Android Platform & Build APK
npx cap add android
npm run build
npx cap sync android

# 4. Copy official ENH launcher icons
cp public/icon-512.jpg android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# 5. Open in Android Studio / Build Release APK
npx cap open android`;

  const handleCopyCli = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(cliCode);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const handleDownloadIcon = () => {
    triggerHaptic('success');
    const a = document.createElement('a');
    a.href = '/icon-512.jpg';
    a.download = 'enh_restaurant_management_aide_android_icon.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-5">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#e2e4dc] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1f4d3e] text-white p-5 relative shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400/40 shadow-md shrink-0 bg-white p-0.5">
              <img
                src="/icon-192.jpg"
                alt="ENH RESTAURANT MANAGEMENT AIDE LTD."
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">Android App Edition</h3>
                <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Android POS
                </span>
              </div>
              <p className="text-xs text-[#cfe0d7] mt-0.5 font-medium">
                ENH RESTAURANT MANAGEMENT AIDE LTD.
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-black/25 p-1 rounded-xl mt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('install');
              }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'install'
                  ? 'bg-white text-[#1f4d3e] shadow-xs'
                  : 'text-[#cfe0d7] hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>Install</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('icon');
              }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'icon'
                  ? 'bg-white text-[#1f4d3e] shadow-xs'
                  : 'text-[#cfe0d7] hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              <span>App Icon</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('qr');
              }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'qr'
                  ? 'bg-white text-[#1f4d3e] shadow-xs'
                  : 'text-[#cfe0d7] hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span>Scan QR</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('apk');
              }}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'apk'
                  ? 'bg-white text-[#1f4d3e] shadow-xs'
                  : 'text-[#cfe0d7] hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 shrink-0" />
              <span>APK Build</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-[#1b2620]">
          {/* TAB 1: 1-Tap Install on Android */}
          {activeTab === 'install' && (
            <div className="space-y-4">
              {isStandalone ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900">App Already Installed!</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      You are currently running ENH Restaurant Management Aide in full-screen standalone Android mode.
                    </p>
                  </div>
                </div>
              ) : deferredPrompt ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Direct Android Install Available</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    Tap the button below to install ENH Restaurant Management Aide directly to your Android home screen and app drawer as a standalone app.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('success');
                      onInstallPwa();
                    }}
                    className="w-full py-3 bg-[#1f4d3e] hover:bg-[#183d31] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install App on Android Now</span>
                  </button>
                </div>
              ) : null}

              {/* Android Chrome 3-Step Guide */}
              <div className="bg-[#f9f8f4] border border-[#e2e4dc] rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#738279] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#1f4d3e]" />
                  <span>How to Install on Any Android Device (Chrome / Edge / Samsung Internet)</span>
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#eceee7]">
                    <span className="w-6 h-6 rounded-full bg-[#1f4d3e] text-white text-xs font-black flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div className="text-xs">
                      <span className="font-bold text-[#1b2620]">Open browser menu:</span> Tap the{' '}
                      <span className="font-mono font-bold bg-gray-100 px-1 py-0.5 rounded">⋮ (three dots)</span> at the top-right of your Android browser.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#eceee7]">
                    <span className="w-6 h-6 rounded-full bg-[#1f4d3e] text-white text-xs font-black flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="text-xs">
                      <span className="font-bold text-[#1b2620]">Select Install:</span> Tap{' '}
                      <span className="font-bold text-[#1f4d3e]">"Install App"</span> or{' '}
                      <span className="font-bold text-[#1f4d3e]">"Add to Home screen"</span>.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#eceee7]">
                    <span className="w-6 h-6 rounded-full bg-[#1f4d3e] text-white text-xs font-black flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="text-xs">
                      <span className="font-bold text-[#1b2620]">Launch & Order:</span> The <strong className="text-[#1f4d3e]">ENH RESTAURANT MANAGEMENT AIDE LTD.</strong> app icon will appear on your Android home screen and app drawer, launching fullscreen with zero browser bars.
                    </div>
                  </div>
                </div>
              </div>

              {/* Native Android Features Checklist */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">Fullscreen POS View</span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">Offline Cache Ready</span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">Android Haptic Vibrate</span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-900">Multi-Terminal Sync</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Android App Icon & Launcher Showcase */}
          {activeTab === 'icon' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-[#1f4d3e]/10 via-[#1f4d3e]/5 to-amber-50 rounded-2xl border border-emerald-200/60">
                <div className="text-center space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                    <ShieldCheck className="w-3 h-3" /> Official Android Launcher Asset
                  </span>
                  <h4 className="text-base font-extrabold text-[#1f4d3e]">
                    ENH RESTAURANT MANAGEMENT AIDE LTD.
                  </h4>
                  <p className="text-xs text-[#526359] max-w-sm mx-auto">
                    Configured for Android 13/14 adaptive launcher masks (circle, squircle, rounded rectangle) with safe margin padding.
                  </p>
                </div>

                {/* Launcher Shape Variations Preview */}
                <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-emerald-200/40">
                  {/* Squircle (Samsung / Xiaomi) */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-[22px] overflow-hidden shadow-md border-2 border-white bg-white p-0.5 ring-1 ring-emerald-500/20">
                      <img
                        src="/icon-192.jpg"
                        alt="Android Squircle Icon"
                        className="w-full h-full object-cover rounded-[20px]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1b2620]">Squircle Mask</span>
                    <span className="text-[9px] text-[#738279]">Samsung / Xiaomi</span>
                  </div>

                  {/* Circle (Google Pixel / Moto) */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-md border-2 border-white bg-white p-0.5 ring-1 ring-emerald-500/20">
                      <img
                        src="/icon-192.jpg"
                        alt="Android Circle Icon"
                        className="w-full h-full object-cover rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1b2620]">Circle Mask</span>
                    <span className="text-[9px] text-[#738279]">Pixel / Stock OS</span>
                  </div>

                  {/* Rounded (Sunmi POS / Tablet) */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-white p-0.5 ring-1 ring-emerald-500/20">
                      <img
                        src="/icon-192.jpg"
                        alt="Android POS Icon"
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1b2620]">Rounded POS</span>
                    <span className="text-[9px] text-[#738279]">Sunmi / Handheld</span>
                  </div>
                </div>
              </div>

              {/* Home Screen Simulated Dock */}
              <div className="bg-[#1b2620] text-white p-3.5 rounded-2xl border border-white/10 space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#a7f3d0]/70 flex items-center justify-between">
                  <span>Android Home Screen Simulation</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded text-[9px]">Live Preview</span>
                </div>
                <div className="flex items-center justify-center gap-6 py-2">
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-white p-0.5 transition-transform group-hover:scale-105">
                      <img
                        src="/icon-192.jpg"
                        alt="ENH Aide Icon"
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-white tracking-wide">ENH Aide</span>
                  </div>
                </div>
              </div>

              {/* Technical Manifest Specs */}
              <div className="bg-[#f9f8f4] border border-[#e2e4dc] rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-[11px] pb-1 border-b border-[#eceee7]">
                  <span className="text-[#738279]">Manifest Application Name:</span>
                  <span className="font-bold text-[#1b2620]">ENH RESTAURANT MANAGEMENT AIDE LTD</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] pb-1 border-b border-[#eceee7]">
                  <span className="text-[#738279]">Short Name (Launcher):</span>
                  <span className="font-bold text-[#1f4d3e]">ENH Aide</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] pb-1 border-b border-[#eceee7]">
                  <span className="text-[#738279]">Package ID:</span>
                  <span className="font-bold text-[#1b2620]">com.enh.restaurant.aide</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[#738279]">Active Icon Sizes:</span>
                  <span className="font-bold text-[#1b2620]">192×192 & 512×512 (Maskable & Any)</span>
                </div>
              </div>

              {/* Download Asset Button */}
              <button
                type="button"
                onClick={handleDownloadIcon}
                className="w-full py-2.5 bg-[#1f4d3e] hover:bg-[#183d31] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Resolution Android Icon (512×512)</span>
              </button>
            </div>
          )}

          {/* TAB 3: Scan QR from Android Phone / Tablet */}
          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-[#738279]">
                Scan this QR code with the camera on your Android phone, tablet, or handheld POS to open and install the app instantly.
              </p>

              <div className="bg-white p-4 rounded-2xl border-2 border-[#1f4d3e]/20 inline-block shadow-sm mx-auto">
                {appUrl ? (
                  <QRCodeSVG
                    value={appUrl}
                    size={200}
                    level="H"
                    includeMargin
                    imageSettings={{
                      src: '/icon-192.jpg',
                      x: undefined,
                      y: undefined,
                      height: 44,
                      width: 44,
                      excavate: true,
                    }}
                  />
                ) : (
                  <div className="w-[200px] h-[200px] bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Copy URL trigger */}
              <div className="flex items-center gap-2 max-w-sm mx-auto">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 bg-[#f4f5f0] border border-[#d6d8ce] rounded-xl px-3 py-2 text-xs font-mono text-[#1b2620] truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-[#1f4d3e] hover:bg-[#183d31] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Standalone Android APK Build */}
          {activeTab === 'apk' && (
            <div className="space-y-3">
              <div className="bg-[#f4f5f0] border border-[#e2e4dc] rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#1f4d3e]" />
                    <span className="text-xs font-bold text-[#1b2620]">
                      Compile Native Android APK (Capacitor)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCli}
                    className="text-[11px] font-bold text-[#1f4d3e] hover:text-[#183d31] flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#d6d8ce]"
                  >
                    {copiedCli ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCli ? 'Copied Commands' : 'Copy Commands'}</span>
                  </button>
                </div>

                <pre className="bg-[#1b2620] text-[#a7f3d0] p-3 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre leading-relaxed">
                  {cliCode}
                </pre>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Hardware Compatibility & Official Icon
                </span>
                <p className="text-[11.5px] text-blue-800">
                  Builds include the official ENH RESTAURANT MANAGEMENT AIDE LTD. adaptive launcher icon mipmaps for Sunmi, PAX, Android POS terminals, tablets, and smartphones.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f9f8f4] border-t border-[#e2e4dc] p-4 flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-[#738279] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>ENH Restaurant Management Aide Ltd. • Android POS</span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-4 py-2 bg-[#1b2620] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

