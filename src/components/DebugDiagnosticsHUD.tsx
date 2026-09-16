import React, { useState, useEffect } from 'react';
import { Bug, X, ChevronDown, ChevronUp, Cpu, Activity, Database, Shield, Zap } from 'lucide-react';
import { UserRole } from '../utils/rbac';
import { RestaurantSettings, Order } from '../types';
import { getDatabaseMetrics } from '../utils/storage';

interface DebugDiagnosticsHUDProps {
  settings: RestaurantSettings;
  currentRole?: UserRole;
  orders: Order[];
  onClose?: () => void;
}

export const DebugDiagnosticsHUD: React.FC<DebugDiagnosticsHUDProps> = ({
  settings,
  currentRole = UserRole.OWNER,
  orders,
  onClose,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [renderCount, setRenderCount] = useState<number>(0);
  const [metrics, setMetrics] = useState(() => getDatabaseMetrics());
  const [memoryInfo, setMemoryInfo] = useState<string>('N/A');

  useEffect(() => {
    const interval = setInterval(() => {
      setRenderCount((c) => c + 1);
      setMetrics(getDatabaseMetrics());

      if (typeof window !== 'undefined' && (performance as any).memory) {
        const used = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
        setMemoryInfo(`${used} MB`);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!settings.debugModeEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="bg-[#101713]/95 backdrop-blur-md text-emerald-400 border border-emerald-500/40 rounded-2xl shadow-2xl p-3 w-80 text-xs transition-all">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
          <div className="flex items-center gap-2">
            <Bug className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider text-emerald-300 text-[11px] uppercase">
              DEBUG DIAGNOSTICS HUD
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-emerald-500/20 rounded text-emerald-300 transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                title="Dismiss HUD"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <div className="pt-2 space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between text-emerald-200/80">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-purple-400" />
                Active RBAC Role:
              </span>
              <span className="font-bold text-white bg-purple-950/80 border border-purple-500/30 px-1.5 py-0.2 rounded text-[10px]">
                {currentRole}
              </span>
            </div>

            <div className="flex items-center justify-between text-emerald-200/80">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-amber-400" />
                Theme / Mode:
              </span>
              <span className="font-bold text-emerald-300 capitalize">
                {settings.theme || 'light'}
              </span>
            </div>

            <div className="flex items-center justify-between text-emerald-200/80">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-blue-400" />
                Active Orders:
              </span>
              <span className="font-bold text-white">
                {orders.length}
              </span>
            </div>

            <div className="flex items-center justify-between text-emerald-200/80">
              <span className="flex items-center gap-1.5">
                <Database className="w-3 h-3 text-emerald-400" />
                Total DB Rows:
              </span>
              <span className="font-bold text-emerald-300">
                {metrics.totalRows} ({(metrics.storageBytes / 1024).toFixed(1)} KB)
              </span>
            </div>

            <div className="flex items-center justify-between text-emerald-200/80">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-indigo-400" />
                Memory / Heartbeat:
              </span>
              <span className="font-bold text-white">
                {memoryInfo} &bull; #{renderCount}
              </span>
            </div>

            <div className="pt-1.5 border-t border-emerald-500/20 text-[10px] text-emerald-400/60 flex items-center justify-between">
              <span>Logging: {settings.systemLoggingEnabled ? 'ON' : 'OFF'}</span>
              <span>Backups: {settings.autoBackupEnabled ? 'DAILY' : 'OFF'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
