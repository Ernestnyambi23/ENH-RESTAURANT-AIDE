import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Palette,
  Bell,
  BellOff,
  Database,
  Activity,
  Bug,
  Shield,
  CheckCircle2,
  Download,
  Terminal,
  Volume2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { RestaurantSettings, AppTheme } from '../types';
import { UserRole } from '../utils/rbac';
import { sound } from '../utils/sound';
import { exportFullDatabaseBackup } from '../utils/storage';

interface UnifiedSettingsCardProps {
  settings: RestaurantSettings;
  onUpdateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  currentRole?: UserRole;
  mode?: 'full' | 'general_only' | 'admin_only';
}

export const UnifiedSettingsCard: React.FC<UnifiedSettingsCardProps> = ({
  settings,
  onUpdateSettings,
  currentRole = UserRole.OWNER,
  mode = 'full',
}) => {
  const isAdmin = currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER;

  const darkThemeEnabled = settings.theme === 'dark';
  const notificationsEnabled = settings.notificationsEnabled ?? true;
  const autoBackupEnabled = settings.autoBackupEnabled ?? false;
  const systemLoggingEnabled = settings.systemLoggingEnabled ?? false;
  const debugModeEnabled = settings.debugModeEnabled ?? false;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectTheme = (theme: AppTheme) => {
    sound.playClick();
    onUpdateSettings({ theme });
    showToast(
      theme === 'white'
        ? '⚪ White theme (high visibility) activated'
        : theme === 'dark'
        ? '🌙 Dark theme enabled system-wide'
        : '☀️ Warm light theme activated'
    );
  };

  const handleToggleDarkTheme = (enabled: boolean) => {
    handleSelectTheme(enabled ? 'dark' : 'white');
  };

  const handleToggleNotifications = (enabled: boolean) => {
    sound.playClick();
    onUpdateSettings({
      notificationsEnabled: enabled,
      enableSoundAlerts: enabled,
    });
    if (enabled) {
      sound.playSuccess();
    }
    showToast(enabled ? '🔔 Real-time alerts and sound notifications enabled' : '🔕 Notifications muted');
  };

  const handleToggleAutoBackup = (enabled: boolean) => {
    sound.playClick();
    onUpdateSettings({
      autoBackupEnabled: enabled,
      lastAutoBackupTime: enabled ? Date.now() : settings.lastAutoBackupTime,
    });
    showToast(enabled ? '🛡️ Automated background snapshots scheduled' : 'Automated snapshots paused');
  };

  const handleToggleSystemLogging = (enabled: boolean) => {
    sound.playClick();
    onUpdateSettings({ systemLoggingEnabled: enabled });
    showToast(enabled ? '📊 System telemetry and crash logging active' : 'Telemetry logging disabled');
  };

  const handleToggleDebugMode = (enabled: boolean) => {
    sound.playClick();
    onUpdateSettings({ debugModeEnabled: enabled });
    showToast(enabled ? '🐞 Debug diagnostics HUD enabled' : 'Debug diagnostics overlay hidden');
  };

  const handleManualSnapshot = () => {
    setIsTakingSnapshot(true);
    sound.playSuccess();
    try {
      const jsonStr = exportFullDatabaseBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orderup-snapshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onUpdateSettings({ lastAutoBackupTime: Date.now() });
      showToast('✅ Instant system snapshot exported successfully');
    } catch {
      showToast('❌ Failed to export snapshot');
    } finally {
      setIsTakingSnapshot(false);
    }
  };

  const renderGeneralSettings = mode === 'full' || mode === 'general_only';
  const renderAdminControls = (mode === 'full' || mode === 'admin_only') && isAdmin;

  return (
    <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e2e4dc]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#143529] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1b2620] flex items-center gap-2">
              <span>Unified App Settings</span>
              {isAdmin && (
                <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                  Admin Unlocked
                </span>
              )}
            </h3>
            <p className="text-xs text-[#8b978f]">
              Reactive preferences synchronized across system storage & devices.
            </p>
          </div>
        </div>

        {toastMessage && (
          <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Category 1: General Settings */}
      {renderGeneralSettings && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#143529] uppercase tracking-wider flex items-center gap-1.5">
            <span>General Settings</span>
          </div>

          <div className="space-y-2.5">
            {/* Setting Item 1: Display Theme */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-[#fafbfa] border border-[#e2e4dc] gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-[#1b2620]">Display Theme</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {settings.theme === 'white' || !settings.theme ? 'White (High Vis)' : settings.theme === 'dark' ? 'Dark' : 'Warm'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b978f] truncate">Pure white, warm cream, or dark night mode</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  id="unified-theme-white-btn"
                  onClick={() => handleSelectTheme('white')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                    settings.theme === 'white' || !settings.theme
                      ? 'bg-[#1f4d3e] text-white border-[#1f4d3e] shadow-xs'
                      : 'bg-white text-[#4c5a52] border-[#e2e4dc] hover:bg-gray-50'
                  }`}
                  title="White theme for maximum visibility"
                >
                  <span className="w-2 h-2 rounded-full bg-white border border-slate-400" />
                  <span>White</span>
                </button>
                <button
                  type="button"
                  id="unified-theme-light-btn"
                  onClick={() => handleSelectTheme('light')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                    settings.theme === 'light'
                      ? 'bg-[#1f4d3e] text-white border-[#1f4d3e] shadow-xs'
                      : 'bg-white text-[#4c5a52] border-[#e2e4dc] hover:bg-gray-50'
                  }`}
                  title="Warm classic light"
                >
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>Warm</span>
                </button>
                <button
                  type="button"
                  id="unified-theme-dark-btn"
                  onClick={() => handleSelectTheme('dark')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-[#1f4d3e] text-white border-[#1f4d3e] shadow-xs'
                      : 'bg-white text-[#4c5a52] border-[#e2e4dc] hover:bg-gray-50'
                  }`}
                  title="Dark night mode"
                >
                  <Moon className="w-3 h-3 text-indigo-400" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Setting Item 2: Notifications */}
            <SettingSwitchRow
              id="unified-setting-notifications"
              icon={
                notificationsEnabled ? (
                  <Bell className="w-4 h-4 text-emerald-600" />
                ) : (
                  <BellOff className="w-4 h-4 text-gray-400" />
                )
              }
              iconBg={notificationsEnabled ? 'bg-emerald-50' : 'bg-gray-100'}
              title="Notifications"
              subtitle="Receive app alerts and updates"
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
              badgeText={notificationsEnabled ? 'Alerts Active' : 'Muted'}
              extraAction={
                notificationsEnabled ? (
                  <button
                    type="button"
                    onClick={() => sound.playOrderPlaced()}
                    title="Test Sound Alert"
                    className="p-1.5 rounded-lg bg-[#fafbfa] hover:bg-white text-[#4c5a52] border border-[#e2e4dc] text-[11px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Volume2 className="w-3 h-3 text-[#143529]" />
                    <span className="hidden sm:inline">Test Alert</span>
                  </button>
                ) : undefined
              }
            />
          </div>
        </div>
      )}

      {/* Category 2: Admin Controls (Rendered strictly when isAdmin is true) */}
      {renderAdminControls && (
        <div className="space-y-3 pt-3 border-t border-[#e2e4dc]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Controls</span>
            </div>
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
              Role: {currentRole}
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Admin Setting 1: Automated Backups */}
            <SettingSwitchRow
              id="unified-setting-auto-backup"
              icon={<Database className="w-4 h-4 text-purple-600" />}
              iconBg="bg-purple-50"
              title="Automated Backups"
              subtitle="Run daily background system snapshots"
              checked={autoBackupEnabled}
              onCheckedChange={handleToggleAutoBackup}
              badgeText={autoBackupEnabled ? 'Daily Snapshots' : 'Manual Only'}
              extraAction={
                <button
                  type="button"
                  onClick={handleManualSnapshot}
                  disabled={isTakingSnapshot}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>{isTakingSnapshot ? 'Saving...' : 'Snapshot Now'}</span>
                </button>
              }
            />

            {/* Admin Setting 2: System Logging */}
            <SettingSwitchRow
              id="unified-setting-system-logging"
              icon={<Activity className="w-4 h-4 text-purple-600" />}
              iconBg="bg-purple-50"
              title="System Logging"
              subtitle="Send crash reports and network telemetry"
              checked={systemLoggingEnabled}
              onCheckedChange={handleToggleSystemLogging}
              badgeText={systemLoggingEnabled ? 'Telemetry Active' : 'Off'}
            />

            {/* Admin Setting 3: Debug Diagnostics */}
            <SettingSwitchRow
              id="unified-setting-debug-mode"
              icon={<Bug className="w-4 h-4 text-purple-600" />}
              iconBg="bg-purple-50"
              title="Debug Diagnostics"
              subtitle="Overlay real-time performance and API flags"
              checked={debugModeEnabled}
              onCheckedChange={handleToggleDebugMode}
              badgeText={debugModeEnabled ? 'HUD Visible' : 'Hidden'}
            />
          </div>

          {settings.lastAutoBackupTime && (
            <div className="text-[11px] text-[#8b978f] flex items-center gap-1.5 pt-1">
              <RefreshCw className="w-3 h-3" />
              <span>Last snapshot recorded: {new Date(settings.lastAutoBackupTime).toLocaleString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Reusable SettingSwitchRow Component styled after Material 3 Switch
interface SettingSwitchRowProps {
  id?: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  badgeText?: string;
  extraAction?: React.ReactNode;
}

const SettingSwitchRow: React.FC<SettingSwitchRowProps> = ({
  id,
  icon,
  iconBg,
  title,
  subtitle,
  checked,
  onCheckedChange,
  badgeText,
  extraAction,
}) => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-3.5 bg-[#fafbfa] hover:bg-[#f4f5f0] border border-[#e2e4dc] rounded-2xl transition-colors gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-[#1b2620] truncate">{title}</span>
            {badgeText && (
              <span
                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                  checked
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#8b978f] truncate">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {extraAction}

        <button
          type="button"
          id={id}
          role="switch"
          aria-checked={checked}
          onClick={() => onCheckedChange(!checked)}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#143529]/30 ${
            checked ? 'bg-[#143529]' : 'bg-[#d2d6cf]'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
