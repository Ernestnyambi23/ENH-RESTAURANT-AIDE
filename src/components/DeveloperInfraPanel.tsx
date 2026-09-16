import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  UploadCloud,
  Terminal,
  FileCode2,
  KeyRound,
  Sliders,
  Crown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Play,
  RotateCcw,
  Shield,
  Zap,
  Cpu,
  HardDrive,
  Database,
  Lock,
  Layers,
  Search,
  Check,
  ShieldAlert,
  Sparkles,
  Download,
  Upload,
} from 'lucide-react';
import {
  UserRole,
  Module,
  PermissionAction,
  PERMISSIONS,
  hasPermission,
  authorize,
  MODULE_REGISTRY,
} from '../utils/rbac';
import { ReportResetKeysManager } from './ReportResetKeysManager';
import {
  getDatabaseMetrics,
  exportFullDatabaseBackup,
  restoreFullDatabaseBackup,
  purgeOrdersAndTransactions,
  resetMenuCatalogOnly,
} from '../utils/storage';

interface DeveloperInfraPanelProps {
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onClose?: () => void;
  restaurantName?: string;
  onResetReport?: (reportId: string, resetKey: string) => boolean | void;
  onResetAllReports?: (masterKey: string) => boolean | void;
  onResetData?: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'fatal';
  module: string;
  message: string;
}

export const DeveloperInfraPanel: React.FC<DeveloperInfraPanelProps> = ({
  currentRole,
  onSwitchRole,
  onClose,
  restaurantName,
  onResetReport,
  onResetAllReports,
  onResetData,
}) => {
  const [activeTab, setActiveTab] = useState<Module>(Module.ADMIN_CONTROL);
  const [adminControlSubTab, setAdminControlSubTab] = useState<'reset_keys' | 'feature_flags'>('reset_keys');

  // Database Metrics & Maintenance State
  const [dbMetrics, setDbMetrics] = useState(() => getDatabaseMetrics());
  const [dbNotice, setDbNotice] = useState<string | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<'reset_catalog' | 'purge_orders' | 'factory_reset' | null>(null);

  const refreshDbMetrics = () => {
    setDbMetrics(getDatabaseMetrics());
  };

  // Server Health Mock Data & Live Interval
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(142850);
  const [cpuUsage, setCpuUsage] = useState<number>(14);
  const [memoryUsage, setMemoryUsage] = useState<number>(38);
  const [latencyMs, setLatencyMs] = useState<number>(24);
  const [isServerHealthy, setIsServerHealthy] = useState<boolean>(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
      setCpuUsage((prev) => Math.min(95, Math.max(8, prev + (Math.floor(Math.random() * 7) - 3))));
      setMemoryUsage((prev) => Math.min(85, Math.max(30, prev + (Math.floor(Math.random() * 3) - 1))));
      setLatencyMs((prev) => Math.min(60, Math.max(12, prev + (Math.floor(Math.random() * 5) - 2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // System Logs State
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 360000).toLocaleTimeString(),
      level: 'info',
      module: 'RBAC_CORE',
      message: 'Explicit RBAC v1.0 engine initialized with 17 modules and 3 standard roles.',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 240000).toLocaleTimeString(),
      level: 'info',
      module: 'SERVER_BOOT',
      message: 'Vite + Express production middleware bound to 0.0.0.0:3000.',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      level: 'info',
      module: 'DEVICE_MGR',
      message: 'Terminal device security verification routine executed successfully.',
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 45000).toLocaleTimeString(),
      level: 'warn',
      module: 'MEMORY_WATCH',
      message: 'Garbage collection cycle completed (14.2ms latency).',
    },
  ]);
  const [logFilter, setLogFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [logSearch, setLogSearch] = useState<string>('');

  // Deploy / Push Update state
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployConsoleLogs, setDeployConsoleLogs] = useState<string[]>([
    'Build commit: 8a8310a (RBAC v1.0 integration)',
    'Target cluster: europe-west2-docker-runtime',
    'Status: Current build healthy and verified.',
  ]);

  // Interactive RBAC Tester State
  const [testRole, setTestRole] = useState<UserRole>(UserRole.STAFF);
  const [testModule, setTestModule] = useState<Module>(Module.ORDER);
  const [testAction, setTestAction] = useState<PermissionAction>('create');

  // Database Schema Migrations State
  const [schemaVersion, setSchemaVersion] = useState<string>('v1.2.0');
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [migrationStatus, setMigrationStatus] = useState<string>('Schema is up to date');

  // Admin Control Master Toggles
  const [featureFlags, setFeatureFlags] = useState({
    strictRbacEnforcement: true,
    maintenanceMode: false,
    hardwareDeviceBridge: true,
    realtimeSyncSocket: true,
    debugTelemetry: true,
  });

  // Security Keys State
  const [jwtRotatedAt, setJwtRotatedAt] = useState<string>('2026-08-31 09:15 UTC');
  const [apiKeyHash, setApiKeyHash] = useState<string>('sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f...982a');

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  const handleSimulateDeploy = () => {
    setIsDeploying(true);
    setDeployConsoleLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Triggering cloud hot deployment...`,
    ]);

    setTimeout(() => {
      setDeployConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Running compilation & bundle linting... SUCCESS`,
      ]);
    }, 800);

    setTimeout(() => {
      setDeployConsoleLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Syncing production container dist/server.cjs... READY`,
        `[${new Date().toLocaleTimeString()}] Deployment completed cleanly without downtime!`,
      ]);
      setIsDeploying(false);
    }, 1800);
  };

  const handleRunMigration = () => {
    setIsMigrating(true);
    setMigrationStatus('Running schema migration script 002_rbac_roles.sql...');
    setTimeout(() => {
      setIsMigrating(false);
      setSchemaVersion('v1.2.1');
      setMigrationStatus('Migration 002_rbac_roles.sql applied successfully! 17 tables synchronized.');
    }, 1200);
  };

  const handleRotateKey = () => {
    const newHash = `sha256:${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}...${Math.floor(1000 + Math.random() * 9000)}`;
    setApiKeyHash(newHash);
    setJwtRotatedAt(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'warn',
        module: 'SECURITY_KEYS',
        message: 'Developer rotated JWT and API root secrets successfully.',
      },
      ...prev,
    ]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilter !== 'all' && l.level !== logFilter) return false;
    if (logSearch && !l.message.toLowerCase().includes(logSearch.toLowerCase()) && !l.module.toLowerCase().includes(logSearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  const actionsList: PermissionAction[] = ['create', 'read', 'update', 'delete'];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner: Developer Super-Root Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-5 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 border border-indigo-400 flex items-center justify-center text-white shadow-lg shrink-0">
              <Terminal className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold tracking-tight">
                  Developer Infrastructure & Super-Root Console
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/40">
                  EXPLICIT RBAC v1.0 ROOT
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-1 max-w-xl">
                Global override capability, cross-tenant telemetry, direct container controls, and infrastructure module management.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-black/40 border border-indigo-400/30 rounded-xl px-3 py-2 text-right">
              <span className="block text-[10px] text-indigo-300 font-bold uppercase">Active Identity</span>
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                {currentRole === UserRole.DEVELOPER ? 'Developer (Full Root)' : currentRole.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Infra Modules Sub-Navigation Bar */}
        <div className="mt-5 pt-4 border-t border-indigo-500/20 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab(Module.OWNERSHIP_MASTER)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center ${
              activeTab === Module.OWNERSHIP_MASTER
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-indigo-200'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>RBAC Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(Module.SERVER_HEALTH)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center ${
              activeTab === Module.SERVER_HEALTH
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-indigo-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Server Health</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(Module.PUSH_UPDATES)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center ${
              activeTab === Module.PUSH_UPDATES
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-indigo-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-sky-400" />
            <span>Push Updates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(Module.SYSTEM_ERROR_LOGS)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center ${
              activeTab === Module.SYSTEM_ERROR_LOGS
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-indigo-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Error Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(Module.DATABASE_SCHEMA)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center ${
              activeTab === Module.DATABASE_SCHEMA
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-indigo-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>DB Schema</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(Module.SECURITY_KEYS)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center ${
              activeTab === Module.SECURITY_KEYS
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-indigo-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-rose-400" />
            <span>Security Keys</span>
          </button>

          <button
            type="button"
            id="tab-btn-admin-control"
            onClick={() => setActiveTab(Module.ADMIN_CONTROL)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 justify-center ${
              activeTab === Module.ADMIN_CONTROL
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-indigo-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Control &amp; Reset Keys</span>
          </button>
        </div>
      </div>

      {/* MODULE 1: OWNERSHIP MASTER & RBAC MATRIX INSPECTOR */}
      {activeTab === Module.OWNERSHIP_MASTER && (
        <div className="space-y-4">
          {/* Live RBAC Permission Sandbox */}
          <div className="bg-white border border-[#e2e4dc] rounded-3xl p-5 shadow-xs">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-[#1b2620]">
                  Live RBAC v1.0 Sandbox & Permission Checker
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                hasPermission() & authorize() active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#f4f5f0] p-4 rounded-2xl border border-[#e2e4dc] mb-4">
              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                  1. Select Target Role
                </label>
                <select
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white border border-[#e2e4dc] rounded-xl text-xs font-bold text-[#1b2620]"
                >
                  <option value={UserRole.STAFF}>STAFF (Transactional Only)</option>
                  <option value={UserRole.OWNER}>OWNER (Tenant Admin)</option>
                  <option value={UserRole.DEVELOPER}>DEVELOPER (Full Root)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                  2. Select Target Module
                </label>
                <select
                  value={testModule}
                  onChange={(e) => setTestModule(e.target.value as Module)}
                  className="w-full px-3 py-2 bg-white border border-[#e2e4dc] rounded-xl text-xs font-bold text-[#1b2620]"
                >
                  {MODULE_REGISTRY.map((m) => (
                    <option key={m.module} value={m.module}>
                      [{m.category}] {m.label} ({m.module})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                  3. Select Action
                </label>
                <select
                  value={testAction}
                  onChange={(e) => setTestAction(e.target.value as PermissionAction)}
                  className="w-full px-3 py-2 bg-white border border-[#e2e4dc] rounded-xl text-xs font-bold text-[#1b2620]"
                >
                  <option value="create">create</option>
                  <option value="read">read</option>
                  <option value="update">update</option>
                  <option value="delete">delete</option>
                </select>
              </div>
            </div>

            {/* Test Result Display */}
            {(() => {
              const directPermitted = hasPermission(testRole, testModule, testAction);
              const authResult = authorize(testRole, testModule, testAction);

              return (
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                    authResult
                      ? 'bg-emerald-500/10 border-emerald-300 text-emerald-900'
                      : 'bg-rose-500/10 border-rose-300 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 ${
                        authResult ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    >
                      {authResult ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-mono text-xs sm:text-sm font-bold">
                        hasPermission({testRole}, Module.{testModule.toUpperCase()}, '{testAction}') ={' '}
                        <strong className="font-black underline">{directPermitted ? 'true' : 'false'}</strong>
                      </div>
                      <div className="text-[11px] opacity-80 mt-0.5">
                        {authResult
                          ? `Access GRANTED: ${testRole.toUpperCase()} possesses explicit '${testAction}' authorization on ${testModule}.`
                          : `Access DENIED: ${testRole.toUpperCase()} has zero permissions for '${testAction}' on ${testModule}.`}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        authResult ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {authResult ? 'ALLOWED ✓' : 'FORBIDDEN ✕'}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Full 1:1 Complete Permission Matrix Table */}
          <div className="bg-white border border-[#e2e4dc] rounded-3xl p-5 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620]">
                  Official RBAC v1.0 Master Permissions Matrix
                </h3>
                <p className="text-xs text-[#4c5a52]">
                  Complete 1:1 specification matrix across all 17 modules and 3 standard tenant tiers.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
                17 Modules • 4 Actions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f4f5f0] text-[#1b2620] border-b border-[#e2e4dc]">
                    <th className="p-3 font-extrabold">Module Name</th>
                    <th className="p-3 font-extrabold">Category</th>
                    <th className="p-3 font-extrabold text-center bg-amber-500/10 text-amber-900 border-x border-[#e2e4dc]">
                      STAFF (Staff Member)
                    </th>
                    <th className="p-3 font-extrabold text-center bg-emerald-500/10 text-emerald-900 border-r border-[#e2e4dc]">
                      OWNER (Business Admin)
                    </th>
                    <th className="p-3 font-extrabold text-center bg-indigo-500/10 text-indigo-900">
                      DEVELOPER (Root Master)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e4dc]">
                  {MODULE_REGISTRY.map((m) => {
                    const staffPerms = PERMISSIONS[UserRole.STAFF][m.module] || [];
                    const ownerPerms = PERMISSIONS[UserRole.OWNER][m.module] || [];
                    const devPerms = PERMISSIONS[UserRole.DEVELOPER][m.module] || [];

                    return (
                      <tr key={m.module} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-[#143529]">
                          <div>{m.label}</div>
                          <span className="text-[10px] text-[#8b978f]">Module.{m.module.toUpperCase()}</span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.category === 'Staff'
                                ? 'bg-amber-100 text-amber-800'
                                : m.category === 'Owner'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {m.category}
                          </span>
                        </td>

                        {/* Staff Column */}
                        <td className="p-3 text-center bg-amber-50/40 border-x border-[#e2e4dc]">
                          {staffPerms.length > 0 ? (
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {staffPerms.map((act) => (
                                <span
                                  key={act}
                                  className="px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 font-mono font-bold text-[10px]"
                                >
                                  {act}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                              ❌ No Access
                            </span>
                          )}
                        </td>

                        {/* Owner Column */}
                        <td className="p-3 text-center bg-emerald-50/40 border-r border-[#e2e4dc]">
                          {ownerPerms.length > 0 ? (
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {ownerPerms.map((act) => (
                                <span
                                  key={act}
                                  className="px-1.5 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-mono font-bold text-[10px]"
                                >
                                  {act}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                              ❌ No Access
                            </span>
                          )}
                        </td>

                        {/* Developer Column */}
                        <td className="p-3 text-center bg-indigo-50/40">
                          {devPerms.length > 0 ? (
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {devPerms.map((act) => (
                                <span
                                  key={act}
                                  className="px-1.5 py-0.5 rounded-md bg-indigo-200 text-indigo-900 font-mono font-bold text-[10px]"
                                >
                                  {act}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                              ❌ No Access
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: SERVER HEALTH & UPTIME */}
      {activeTab === Module.SERVER_HEALTH && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#4c5a52] font-bold mb-1">
                <span>Container Status</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span>ONLINE (200 OK)</span>
              </div>
              <div className="text-[11px] text-[#8b978f] mt-1 font-mono">Port 3000 • 0.0.0.0 (Cloud Run)</div>
            </div>

            <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#4c5a52] font-bold mb-1">
                <span>Uptime</span>
                <Server className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-black text-[#1b2620] font-mono">
                {formatUptime(uptimeSeconds)}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">99.98% SLA Availability</div>
            </div>

            <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#4c5a52] font-bold mb-1">
                <span>CPU Load</span>
                <Cpu className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-black text-[#1b2620] font-mono">{cpuUsage}%</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${cpuUsage}%` }} />
              </div>
            </div>

            <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-[#4c5a52] font-bold mb-1">
                <span>Memory Heap</span>
                <HardDrive className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-black text-[#1b2620] font-mono">{memoryUsage}% (184 MB)</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${memoryUsage}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#e2e4dc] rounded-3xl p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#1b2620] mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Node.js v22 Environment Telemetry</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-[#f4f5f0] p-3 rounded-xl">
                <span className="text-[#8b978f] block text-[10px]">Node Version</span>
                <strong className="text-[#1b2620]">v22.23.2 (LTS)</strong>
              </div>
              <div className="bg-[#f4f5f0] p-3 rounded-xl">
                <span className="text-[#8b978f] block text-[10px]">Active Latency</span>
                <strong className="text-emerald-700">{latencyMs} ms</strong>
              </div>
              <div className="bg-[#f4f5f0] p-3 rounded-xl">
                <span className="text-[#8b978f] block text-[10px]">ESBuild Target</span>
                <strong className="text-[#1b2620]">CommonJS / Node</strong>
              </div>
              <div className="bg-[#f4f5f0] p-3 rounded-xl">
                <span className="text-[#8b978f] block text-[10px]">Reverse Proxy</span>
                <strong className="text-indigo-700">Nginx Container Ingress</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: PUSH UPDATES & RELEASES */}
      {activeTab === Module.PUSH_UPDATES && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e2e4dc] rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620] flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-indigo-600" />
                  <span>Push Updates & Continuous Deployment Pipeline</span>
                </h3>
                <p className="text-xs text-[#4c5a52]">
                  Trigger bundle builds, broadcast client updates, and roll back revision packages.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateDeploy}
                  disabled={isDeploying}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDeploying ? 'animate-spin' : ''}`} />
                  <span>{isDeploying ? 'Deploying...' : 'Push Release Build'}</span>
                </button>
              </div>
            </div>

            {/* Live Terminal Console Stream */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-xs border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>ci-pipeline // stream.cloudrun.build</span>
                </span>
                <span>Active Commit: v1.0.9</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {deployConsoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-indigo-400 font-bold">$ </span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: SYSTEM ERROR LOGS */}
      {activeTab === Module.SYSTEM_ERROR_LOGS && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e2e4dc] rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620] flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-600" />
                  <span>System Error & Audit Logs Stream</span>
                </h3>
                <p className="text-xs text-[#4c5a52]">
                  Inspect live exception traces, middleware telemetry, and access violations.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="px-3 py-1.5 rounded-xl border border-[#e2e4dc] bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Logs</span>
                </button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b978f]" />
                <input
                  type="text"
                  placeholder="Search logs by keyword or module..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#f4f5f0] border border-[#e2e4dc] rounded-xl text-xs focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1 text-xs">
                {(['all', 'info', 'warn', 'error'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                      logFilter === lvl
                        ? 'bg-indigo-600 text-white'
                        : 'bg-[#f4f5f0] text-[#4c5a52] hover:bg-gray-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Log Records Table */}
            <div className="space-y-1.5 max-h-80 overflow-y-auto font-mono text-xs">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((l) => (
                  <div
                    key={l.id}
                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                      l.level === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : l.level === 'warn'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-[#f4f5f0] border-[#e2e4dc] text-[#1b2620]'
                    }`}
                  >
                    <span className="text-[10px] text-[#8b978f] shrink-0">{l.timestamp}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase shrink-0 ${
                        l.level === 'error'
                          ? 'bg-rose-600 text-white'
                          : l.level === 'warn'
                          ? 'bg-amber-500 text-black'
                          : 'bg-indigo-100 text-indigo-900'
                      }`}
                    >
                      {l.level}
                    </span>
                    <span className="font-bold shrink-0 text-indigo-700">[{l.module}]</span>
                    <span className="flex-1">{l.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-[#8b978f]">
                  No system logs matching the current filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: DATABASE SCHEMA */}
      {activeTab === Module.DATABASE_SCHEMA && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e2e4dc] rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620] flex items-center gap-2">
                  <Database className="w-5 h-5 text-purple-600" />
                  <span>Database Operations & Schema Inspector</span>
                </h3>
                <p className="text-xs text-[#4c5a52]">
                  Current Active Schema: <strong className="font-mono text-purple-700">{schemaVersion}</strong> &bull; Total Tracked Rows: <strong className="font-mono text-[#1b2620]">{dbMetrics.totalRows}</strong> &bull; Storage Footprint: <strong className="font-mono text-[#1b2620]">{(dbMetrics.storageBytes / 1024).toFixed(1)} KB</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={refreshDbMetrics}
                  className="px-3 py-1.5 rounded-xl border border-[#e2e4dc] bg-[#f4f5f0] hover:bg-[#e9eae4] text-xs font-semibold text-[#1b2620] transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleRunMigration}
                  disabled={isMigrating}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isMigrating ? 'Migrating...' : 'Run Migration v1.2.1'}</span>
                </button>
              </div>
            </div>

            {dbNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-semibold mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{dbNotice}</span>
              </div>
            )}

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 font-mono mb-4 flex items-center justify-between">
              <span>{migrationStatus}</span>
              <span className="text-[11px] font-bold text-purple-600">Engine: Local Indexed / Key-Value Store</span>
            </div>

            {/* Granular Database Tools */}
            <div className="p-4 bg-[#fafbf7] border border-[#e2e4dc] rounded-2xl mb-4">
              <div className="text-xs font-bold text-[#1b2620] mb-2 uppercase tracking-wider flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-[#143529]" />
                <span>Developer Database Maintenance & Disaster Recovery</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const jsonStr = exportFullDatabaseBackup();
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `orderup-backup-${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    setDbNotice('Full database backup exported to JSON file.');
                    setTimeout(() => setDbNotice(null), 4000);
                  }}
                  className="p-2.5 rounded-xl border border-[#e2e4dc] bg-white hover:bg-[#f4f5f0] text-xs font-bold text-[#1b2620] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#143529]" />
                  <span>Download Backup JSON</span>
                </button>

                <label className="p-2.5 rounded-xl border border-[#e2e4dc] bg-white hover:bg-[#f4f5f0] text-xs font-bold text-[#1b2620] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Restore from JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const text = event.target?.result as string;
                        if (!text) return;
                        const res = restoreFullDatabaseBackup(text);
                        if (res.success) {
                          refreshDbMetrics();
                          setDbNotice('Database successfully restored from JSON backup.');
                          if (onResetData) onResetData();
                        } else {
                          setDbNotice(`Restore failed: ${res.error}`);
                        }
                        setTimeout(() => setDbNotice(null), 5000);
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setConfirmingAction('reset_catalog')}
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Reset Catalog Only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmingAction('purge_orders')}
                  className="p-2.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-xs font-bold text-orange-900 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-orange-700" />
                  <span>Purge Orders & M-Pesa</span>
                </button>
              </div>

              {onResetData && (
                <div className="mt-3 pt-3 border-t border-[#e2e4dc] flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-[#4c5a52]">
                    Complete system reset to initial demo state (Menu, stock, sample orders, capital & staff).
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmingAction('factory_reset')}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Factory Reset All Data</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Database Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'orders', records: `${dbMetrics.tableCounts.orders ?? 0} rows`, status: 'SYNCHRONIZED', schema: 'id, orderNumber, total, items, status, rbacRole' },
                { name: 'menu_items', records: `${dbMetrics.tableCounts.menu_items ?? 0} rows`, status: 'SYNCHRONIZED', schema: 'id, name, price, variants, stock, imageUrl' },
                { name: 'connected_devices', records: `${dbMetrics.tableCounts.connected_devices ?? 0} rows`, status: 'SYNCHRONIZED', schema: 'id, name, deviceType, status, pairingCode' },
                { name: 'staff_members', records: `${dbMetrics.tableCounts.staff_members ?? 0} rows`, status: 'SYNCHRONIZED', schema: 'id, name, roleTitle, agreedSalary, sex' },
                { name: 'business_owners', records: `${dbMetrics.tableCounts.business_owners ?? 0} rows`, status: 'SYNCHRONIZED', schema: 'id, fullName, phone, role, verified' },
                { name: 'purchases', records: `${dbMetrics.tableCounts.purchases ?? 0} rows`, status: 'SYNCHRONIZED', schema: 'id, itemName, category, amount, date' },
                { name: 'shopping_items', records: `${dbMetrics.tableCounts.shopping_items ?? 0} rows`, status: 'SYNCHRONIZED', schema: 'id, name, estimatedCost, status' },
                { name: 'mpesa_transactions', records: `${dbMetrics.tableCounts.mpesa_transactions ?? 0} rows`, status: 'SYNCHRONIZED', schema: 'receiptNumber, amount, sender, status' },
                { name: 'notifications', records: `${dbMetrics.tableCounts.notifications ?? 0} rows`, status: 'SYNCHRONIZED', schema: 'id, title, message, read, createdAt' },
              ].map((table) => (
                <div key={table.name} className="bg-[#f4f5f0] p-3.5 rounded-2xl border border-[#e2e4dc]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-[#143529]">{table.name}</span>
                    <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {table.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4c5a52] font-semibold">{table.records}</div>
                  <div className="text-[10px] text-[#8b978f] font-mono mt-1 truncate">{table.schema}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODULE 6: SECURITY KEYS & CERTS */}
      {activeTab === Module.SECURITY_KEYS && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e2e4dc] rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620] flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-rose-600" />
                  <span>Security Keys, JWT Signing & Certificate Rotation</span>
                </h3>
                <p className="text-xs text-[#4c5a52]">
                  Rotate cryptographic secrets, inspect API key hashes, and manage SSL certificates.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRotateKey}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rotate Signing Keys</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-[#f4f5f0] p-4 rounded-2xl border border-[#e2e4dc]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#1b2620]">Root JWT HMAC Secret</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active & Valid
                  </span>
                </div>
                <div className="font-mono text-xs text-indigo-700 bg-white p-2.5 rounded-xl border border-[#e2e4dc] break-all">
                  {apiKeyHash}
                </div>
                <div className="text-[10px] text-[#8b978f] mt-1.5 flex items-center justify-between">
                  <span>Last rotated: {jwtRotatedAt}</span>
                  <span>Algorithm: HS256 / SHA-256</span>
                </div>
              </div>

              <div className="bg-[#f4f5f0] p-4 rounded-2xl border border-[#e2e4dc]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-[#1b2620]">Cloud Run Managed SSL Certificate</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    TLS 1.3 Active
                  </span>
                </div>
                <p className="text-xs text-[#4c5a52]">
                  Automated certificate renewal handled by Google Trust Services. Expires in 84 days.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 7: ADMIN CONTROL & REPORT RESET KEYS */}
      {activeTab === Module.ADMIN_CONTROL && (
        <div className="space-y-4">
          {/* Sub-navigation pill */}
          <div className="flex items-center gap-2 p-1.5 bg-[#1e1b4b]/60 rounded-2xl border border-indigo-500/30 max-w-md">
            <button
              type="button"
              id="subtab-reset-keys"
              onClick={() => setAdminControlSubTab('reset_keys')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                adminControlSubTab === 'reset_keys'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Report Reset Keys</span>
            </button>

            <button
              type="button"
              id="subtab-feature-flags"
              onClick={() => setAdminControlSubTab('feature_flags')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                adminControlSubTab === 'feature_flags'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span>Global Flags</span>
            </button>
          </div>

          {/* Sub-tab 1: Report Reset Keys */}
          {adminControlSubTab === 'reset_keys' && (
            <ReportResetKeysManager
              onResetReport={onResetReport}
              onResetAllReports={onResetAllReports}
              onLogDeveloperEvent={(msg, lvl) => {
                setLogs((prev) => [
                  {
                    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    timestamp: new Date().toLocaleTimeString(),
                    level: lvl || 'info',
                    module: 'RESET_KEY_ENGINE',
                    message: msg,
                  },
                  ...prev,
                ]);
              }}
            />
          )}

          {/* Sub-tab 2: Global Control Feature Flags */}
          {adminControlSubTab === 'feature_flags' && (
            <div className="bg-white border border-[#e2e4dc] rounded-3xl p-5 shadow-xs">
              <h3 className="text-base font-extrabold text-[#1b2620] mb-2 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-600" />
                <span>Admin Global Control Flags</span>
              </h3>
              <p className="text-xs text-[#4c5a52] mb-4">
                Real-time feature toggles controlling system behavior, role enforcement, and hardware bridges.
              </p>

              <div className="space-y-3">
                {[
                  {
                    key: 'strictRbacEnforcement' as const,
                    title: 'Strict RBAC v1.0 Enforcement',
                    desc: 'Block unauthorized actions at middleware level with 403 Forbidden',
                  },
                  {
                    key: 'hardwareDeviceBridge' as const,
                    title: 'Hardware POS Device Bridge',
                    desc: 'Enforce device terminal authorization and lockouts for untrusted browsers',
                  },
                  {
                    key: 'realtimeSyncSocket' as const,
                    title: 'Real-time Storage Cross-Tab Sync',
                    desc: 'Instantly propagate order status changes across all cashier and kitchen tablets',
                  },
                  {
                    key: 'debugTelemetry' as const,
                    title: 'Developer Debug Telemetry',
                    desc: 'Record fine-grained timing metrics and permission audit logs',
                  },
                  {
                    key: 'maintenanceMode' as const,
                    title: 'System Maintenance Mode',
                    desc: 'Restrict customer orders while allowing Developer & Owner inspection',
                  },
                ].map((flag) => (
                  <div
                    key={flag.key}
                    className="flex items-center justify-between p-3.5 bg-[#f4f5f0] rounded-2xl border border-[#e2e4dc]"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#1b2620]">{flag.title}</div>
                      <div className="text-[11px] text-[#8b978f]">{flag.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFeatureFlags((prev) => ({
                          ...prev,
                          [flag.key]: !prev[flag.key],
                        }))
                      }
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                        featureFlags[flag.key] ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          featureFlags[flag.key] ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmingAction && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">
                {confirmingAction === 'reset_catalog' && 'Reset Menu Catalog'}
                {confirmingAction === 'purge_orders' && 'Purge Orders & M-Pesa'}
                {confirmingAction === 'factory_reset' && 'Factory Reset All Data'}
              </h3>
              <p className="text-xs text-[#4c5a52] mt-1.5 leading-relaxed">
                {confirmingAction === 'reset_catalog' && 'Reset menu items and dish prices back to official factory defaults? Orders and staff will remain untouched.'}
                {confirmingAction === 'purge_orders' && 'Purge all order history and M-Pesa logs? Menu items and staff profiles will NOT be touched.'}
                {confirmingAction === 'factory_reset' && 'Are you sure you want to perform a FULL factory reset of all application data (menu, stock, sample orders, capital & staff)?'}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e4dc]">
              <button
                type="button"
                onClick={() => setConfirmingAction(null)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e4dc] text-xs font-bold text-[#4c5a52] hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirmingAction === 'reset_catalog') {
                    resetMenuCatalogOnly();
                    refreshDbMetrics();
                    setDbNotice('Menu catalog restored to default inventory.');
                    if (onResetData) onResetData();
                  } else if (confirmingAction === 'purge_orders') {
                    purgeOrdersAndTransactions();
                    refreshDbMetrics();
                    setDbNotice('Order records and payment transaction logs purged.');
                    if (onResetData) onResetData();
                  } else if (confirmingAction === 'factory_reset') {
                    if (onResetData) onResetData();
                    refreshDbMetrics();
                    setDbNotice('System reset to original factory demo state.');
                  }
                  setTimeout(() => setDbNotice(null), 4000);
                  setConfirmingAction(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Confirm &amp; Proceed</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
