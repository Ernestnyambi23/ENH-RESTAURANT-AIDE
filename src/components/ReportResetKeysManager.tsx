import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Shield,
  ShieldAlert,
  Trash2,
  Lock,
  Unlock,
  Sliders,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  ShoppingBag,
  Boxes,
  Terminal,
  Sparkles,
  X,
} from 'lucide-react';
import { sound } from '../utils/sound';

export interface ReportResetKeyItem {
  id: string;
  title: string;
  moduleName: string;
  category: 'Sales & Revenue' | 'Business Analytics' | 'Financial Audits' | 'Staff & Operations';
  description: string;
  key: string;
  masked: boolean;
  lastResetAt?: string;
  lastResetKey?: string;
  status: 'active' | 'rotated';
}

const DEFAULT_REPORT_RESET_KEYS: ReportResetKeyItem[] = [
  {
    id: 'sales_report',
    title: 'Sales & Orders Revenue Report',
    moduleName: 'Module.SALES_REPORT',
    category: 'Sales & Revenue',
    description: 'Transaction journals, cashier batches, gross sales receipts, and line-item sales orders.',
    key: 'RST-SALES-72019A',
    masked: true,
    status: 'active',
  },
  {
    id: 'analytics',
    title: 'Business Analytics & Sales Velocity',
    moduleName: 'Module.ANALYTICS',
    category: 'Business Analytics',
    description: 'Hourly sales velocity aggregations, popular dish rankings, traffic curves, and category share analytics.',
    key: 'RST-ANALYTICS-48192B',
    masked: true,
    status: 'active',
  },
  {
    id: 'business_pl',
    title: 'Business P&L Statement Report',
    moduleName: 'Module.BUSINESS_REPORT',
    category: 'Financial Audits',
    description: 'Profit & Loss statements, COGS expenditure balancing, net margin tracking, and financial audit logs.',
    key: 'RST-FINANCE-31048C',
    masked: true,
    status: 'active',
  },
  {
    id: 'staff_payroll',
    title: 'Staff Payroll & Attendance Report',
    moduleName: 'Module.STAFF_MANAGEMENT',
    category: 'Staff & Operations',
    description: 'Staff workday shifts, dynamic AI payroll deductions, salary payout flags, and wage payout journals.',
    key: 'RST-PAYROLL-66421D',
    masked: true,
    status: 'active',
  },
  {
    id: 'debt_ledger',
    title: 'Customer Debts & Tab Ledger',
    moduleName: 'Module.COMPLETED_ORDER',
    category: 'Sales & Revenue',
    description: 'Customer credit statements, tab receivables, partial repayment logs, and debtor collection histories.',
    key: 'RST-DEBTS-85193E',
    masked: true,
    status: 'active',
  },
  {
    id: 'procurement',
    title: 'Procurement & Purchase Expense Report',
    moduleName: 'Module.PROCUREMENT',
    category: 'Financial Audits',
    description: 'Raw goods shopping list archives, supplier invoices, restock expenses, and vendor payment tracking.',
    key: 'RST-PROCURE-54210F',
    masked: true,
    status: 'active',
  },
  {
    id: 'inventory_analytics',
    title: 'Stock & Inventory Movement Analytics',
    moduleName: 'Module.STOCK_PRICING',
    category: 'Staff & Operations',
    description: 'Portion depletion velocity, low-stock threshold triggers, item wastage analytics, and dish usage stats.',
    key: 'RST-STOCK-93021G',
    masked: true,
    status: 'active',
  },
  {
    id: 'system_logs',
    title: 'System Audit & Error Telemetry Logs',
    moduleName: 'Module.SYSTEM_ERROR_LOGS',
    category: 'Staff & Operations',
    description: 'Developer error stack traces, security auth attempts, RBAC audit records, and container telemetry.',
    key: 'RST-LOGS-17849H',
    masked: true,
    status: 'active',
  },
];

const DEFAULT_MASTER_KEY = 'RST-MASTER-SUPER-DEV-888';

interface ReportResetKeysManagerProps {
  onResetReport?: (reportId: string, resetKey: string) => boolean | void;
  onResetAllReports?: (masterKey: string) => boolean | void;
  onLogDeveloperEvent?: (message: string, level?: 'info' | 'warn' | 'error') => void;
}

export const ReportResetKeysManager: React.FC<ReportResetKeysManagerProps> = ({
  onResetReport,
  onResetAllReports,
  onLogDeveloperEvent,
}) => {
  const [reportKeys, setReportKeys] = useState<ReportResetKeyItem[]>(() => {
    try {
      const stored = localStorage.getItem('restaurant_report_reset_keys');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading report reset keys:', e);
    }
    return DEFAULT_REPORT_RESET_KEYS;
  });

  const [masterKey, setMasterKey] = useState<string>(() => {
    return localStorage.getItem('restaurant_master_reset_key') || DEFAULT_MASTER_KEY;
  });
  const [isMasterKeyMasked, setIsMasterKeyMasked] = useState<boolean>(true);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Reset Execution Modal State
  const [executingItem, setExecutingItem] = useState<ReportResetKeyItem | null>(null);
  const [inputKey, setInputKey] = useState<string>('');
  const [keyError, setKeyError] = useState<string>('');

  // Master Reset Modal State
  const [isMasterResetModalOpen, setIsMasterResetModalOpen] = useState<boolean>(false);
  const [inputMasterKey, setInputMasterKey] = useState<string>('');
  const [masterKeyError, setMasterKeyError] = useState<string>('');

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('restaurant_report_reset_keys', JSON.stringify(reportKeys));
    } catch (e) {
      console.error('Failed to save report reset keys:', e);
    }
  }, [reportKeys]);

  useEffect(() => {
    try {
      localStorage.setItem('restaurant_master_reset_key', masterKey);
    } catch (e) {
      console.error('Failed to save master key:', e);
    }
  }, [masterKey]);

  const generateRandomKey = (prefix: string) => {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const checksum = Math.floor(1000 + Math.random() * 9000);
    return `RST-${prefix}-${checksum}${randomHex.slice(0, 2)}`;
  };

  const handleCopyKey = (id: string, keyVal: string) => {
    try {
      navigator.clipboard.writeText(keyVal);
      setCopiedId(id);
      sound.playClick();
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Copy error', e);
    }
  };

  const handleRotateKey = (id: string) => {
    setReportKeys((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const prefix = item.id.toUpperCase().slice(0, 5);
          const newKey = generateRandomKey(prefix);
          return {
            ...item,
            key: newKey,
            status: 'rotated',
          };
        }
        return item;
      })
    );
    sound.playNotification();
    setToastMessage(`Reset key rotated successfully!`);
    if (onLogDeveloperEvent) {
      onLogDeveloperEvent(`Rotated reset key for module: ${id}`, 'info');
    }
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleRotateAllKeys = () => {
    setReportKeys((prev) =>
      prev.map((item) => {
        const prefix = item.id.toUpperCase().slice(0, 5);
        return {
          ...item,
          key: generateRandomKey(prefix),
          status: 'rotated',
        };
      })
    );
    const newMaster = `RST-MASTER-SUPER-${Math.floor(100 + Math.random() * 900)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setMasterKey(newMaster);
    sound.playSuccess();
    setToastMessage('All 8 report reset keys & master key regenerated!');
    if (onLogDeveloperEvent) {
      onLogDeveloperEvent('Master key rotation executed across all 8 report modules.', 'warn');
    }
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleToggleMask = (id: string) => {
    setReportKeys((prev) =>
      prev.map((item) => (item.id === id ? { ...item, masked: !item.masked } : item))
    );
    sound.playClick();
  };

  const handleEditKeyCustom = (id: string, newKey: string) => {
    setReportKeys((prev) =>
      prev.map((item) => (item.id === id ? { ...item, key: newKey.trim() } : item))
    );
  };

  const handleOpenResetModal = (item: ReportResetKeyItem) => {
    setExecutingItem(item);
    setInputKey('');
    setKeyError('');
    sound.playClick();
  };

  const handleConfirmReset = () => {
    if (!executingItem) return;
    const cleanInput = inputKey.trim();

    if (cleanInput !== executingItem.key && cleanInput !== masterKey) {
      setKeyError('Invalid Reset Key! Key must match the authorized module key or Master Super-Root key.');
      sound.playError();
      return;
    }

    // Key authorized!
    const timestamp = new Date().toLocaleString();
    setReportKeys((prev) =>
      prev.map((item) =>
        item.id === executingItem.id
          ? {
              ...item,
              lastResetAt: timestamp,
              lastResetKey: cleanInput,
            }
          : item
      )
    );

    if (onResetReport) {
      onResetReport(executingItem.id, cleanInput);
    }

    if (onLogDeveloperEvent) {
      onLogDeveloperEvent(
        `[SECURITY_RESET_KEY] Developer authorized and executed reset on ${executingItem.title} using key ${cleanInput}`,
        'warn'
      );
    }

    sound.playSuccess();
    setToastMessage(`Reset executed on "${executingItem.title}"! Data refreshed.`);
    setExecutingItem(null);
    setInputKey('');
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleConfirmMasterReset = () => {
    const cleanInput = inputMasterKey.trim();
    if (cleanInput !== masterKey) {
      setMasterKeyError('Invalid Master Super-Root Key! Authorization rejected.');
      sound.playError();
      return;
    }

    const timestamp = new Date().toLocaleString();
    setReportKeys((prev) =>
      prev.map((item) => ({
        ...item,
        lastResetAt: timestamp,
        lastResetKey: cleanInput,
      }))
    );

    if (onResetAllReports) {
      onResetAllReports(cleanInput);
    }

    if (onLogDeveloperEvent) {
      onLogDeveloperEvent(
        `[GLOBAL_MASTER_RESET] Developer executed complete wipe across all reports and analytics using Master Key`,
        'fatal'
      );
    }

    sound.playSuccess();
    setToastMessage('Global Master Reset successfully executed across all reports & analytics!');
    setIsMasterResetModalOpen(false);
    setInputMasterKey('');
    setTimeout(() => setToastMessage(''), 5000);
  };

  const getModuleIcon = (id: string) => {
    switch (id) {
      case 'sales_report':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'analytics':
        return <BarChart3 className="w-4 h-4 text-teal-600" />;
      case 'business_pl':
        return <TrendingUp className="w-4 h-4 text-indigo-600" />;
      case 'staff_payroll':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'debt_ledger':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'procurement':
        return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case 'inventory_analytics':
        return <Boxes className="w-4 h-4 text-orange-600" />;
      case 'system_logs':
        return <Terminal className="w-4 h-4 text-rose-600" />;
      default:
        return <KeyRound className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white border border-[#e2e4dc] rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#1b2620] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <span>Report &amp; Analytics Reset Keys (Developer Admin Control)</span>
            </h3>
            <p className="text-xs text-[#4c5a52] mt-0.5">
              Granular cryptographic reset keys per report and analytics feed. Requires authorized key verification before data flush.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="rotate-all-keys-btn"
              onClick={handleRotateAllKeys}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#e2e4dc] hover:bg-[#fafbfa] text-[#1b2620] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
              <span>Rotate All Keys</span>
            </button>

            <button
              type="button"
              id="master-reset-all-btn"
              onClick={() => {
                setIsMasterResetModalOpen(true);
                setInputMasterKey('');
                setMasterKeyError('');
                sound.playClick();
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Master Reset All</span>
            </button>
          </div>
        </div>

        {/* Master Developer Key Card */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl text-white shadow-sm border border-indigo-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-extrabold tracking-wide uppercase text-indigo-200">
                Master Super-Root Key
              </span>
              <span className="text-3xs bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                Full Authorization
              </span>
            </div>
            <p className="text-2xs text-indigo-200/80">
              Universal bypass key that can authorize resets on any report or trigger a complete system wipe.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-xl border border-white/10">
            <span className="font-mono text-xs text-amber-300 font-bold px-2 tracking-wider">
              {isMasterKeyMasked ? '••••••••••••••••••••' : masterKey}
            </span>
            <button
              type="button"
              onClick={() => setIsMasterKeyMasked(!isMasterKeyMasked)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              title={isMasterKeyMasked ? 'Show Key' : 'Hide Key'}
            >
              {isMasterKeyMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => handleCopyKey('master', masterKey)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              title="Copy Master Key"
            >
              {copiedId === 'master' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Grid of 8 Report & Analytics Reset Key Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportKeys.map((item) => (
          <div
            key={item.id}
            id={`reset-card-${item.id}`}
            className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-2xs space-y-3.5 transition-all hover:border-indigo-200"
          >
            {/* Title Bar */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#f4f5f0] border border-[#e2e4dc] flex items-center justify-center shrink-0">
                  {getModuleIcon(item.id)}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#1b2620] leading-tight">
                    {item.title}
                  </h4>
                  <span className="text-3xs font-mono text-[#8b978f] uppercase tracking-wider block mt-0.5">
                    {item.moduleName}
                  </span>
                </div>
              </div>

              <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Key Active
              </span>
            </div>

            <p className="text-2xs text-[#4c5a52] leading-relaxed">
              {item.description}
            </p>

            {/* Reset Key Display & Action Box */}
            <div className="p-2.5 bg-[#fafbfa] rounded-xl border border-[#e2e4dc] space-y-2">
              <div className="flex items-center justify-between text-2xs text-[#8b978f]">
                <span className="font-bold flex items-center gap-1 text-[#1b2620]">
                  <Lock className="w-3 h-3 text-indigo-600" />
                  Authorized Reset Key:
                </span>
                {item.lastResetAt ? (
                  <span className="text-amber-700 font-medium">Last Reset: {item.lastResetAt}</span>
                ) : (
                  <span className="text-emerald-700 font-medium">Never Reset</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex-1 relative">
                  <input
                    type={item.masked ? 'password' : 'text'}
                    value={item.key}
                    onChange={(e) => handleEditKeyCustom(item.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-[#d2d8d4] bg-white text-[#1b2620] font-bold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleMask(item.id)}
                  className="p-1.5 rounded-lg border border-[#e2e4dc] bg-white hover:bg-gray-50 text-[#4c5a52]"
                  title={item.masked ? 'Reveal Key' : 'Hide Key'}
                >
                  {item.masked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyKey(item.id, item.key)}
                  className="p-1.5 rounded-lg border border-[#e2e4dc] bg-white hover:bg-gray-50 text-[#4c5a52]"
                  title="Copy Key"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleRotateKey(item.id)}
                  className="p-1.5 rounded-lg border border-[#e2e4dc] bg-white hover:bg-gray-50 text-[#4c5a52]"
                  title="Rotate / Generate New Key"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
                </button>
              </div>
            </div>

            {/* Execute Reset Button */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <span className="text-3xs text-[#8b978f]">
                Requires matching key verification
              </span>

              <button
                type="button"
                id={`btn-reset-report-${item.id}`}
                onClick={() => handleOpenResetModal(item)}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Reset with Key</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Execute Specific Report Reset */}
      {executingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-red-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e4dc]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#1b2620]">
                    Authorize Reset: {executingItem.title}
                  </h4>
                  <span className="text-2xs text-[#8b978f]">Developer Security Gateway</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setExecutingItem(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-2xs text-red-800 space-y-1">
              <p className="font-bold">⚠️ Warning: Irreversible Report Reset</p>
              <p>
                Executing this reset will immediately flush historical records for {executingItem.title}. This action is logged permanently to Developer Infrastructure Telemetry.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1b2620] flex items-center justify-between">
                <span>Enter Reset Key to Authorize:</span>
                <button
                  type="button"
                  onClick={() => setInputKey(executingItem.key)}
                  className="text-2xs text-indigo-600 hover:underline font-bold"
                >
                  Auto-Fill Authorized Key
                </button>
              </label>
              <input
                type="text"
                id="report-reset-key-input"
                placeholder={executingItem.key}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setKeyError('');
                }}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#c4cfc8] bg-[#fafbfa] focus:bg-white text-[#1b2620] font-bold"
              />
              {keyError && (
                <p className="text-2xs font-bold text-red-600">{keyError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setExecutingItem(null)}
                className="px-4 py-2 rounded-xl bg-white border border-[#e2e4dc] hover:bg-gray-50 text-xs font-bold text-[#1b2620]"
              >
                Cancel
              </button>

              <button
                type="button"
                id="btn-confirm-report-reset"
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Verify Key &amp; Execute Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Master Super-Root Reset All */}
      {isMasterResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-red-300 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e4dc]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#1b2620]">
                    Super-Root Master Reset (All Reports)
                  </h4>
                  <span className="text-2xs text-[#8b978f]">Global Data Flush</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMasterResetModalOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-red-100 rounded-xl border border-red-300 text-2xs text-red-900 space-y-1">
              <p className="font-bold">CRITICAL SYSTEM WARNING</p>
              <p>
                This will reset ALL 8 reports and analytics modules simultaneously (sales, orders, velocity, P&L, payroll notes, debts, and procurement).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1b2620] flex items-center justify-between">
                <span>Enter Master Developer Key:</span>
                <button
                  type="button"
                  onClick={() => setInputMasterKey(masterKey)}
                  className="text-2xs text-indigo-600 hover:underline font-bold"
                >
                  Auto-Fill Master Key
                </button>
              </label>
              <input
                type="text"
                id="master-reset-key-input"
                placeholder={masterKey}
                value={inputMasterKey}
                onChange={(e) => {
                  setInputMasterKey(e.target.value);
                  setMasterKeyError('');
                }}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#c4cfc8] bg-[#fafbfa] focus:bg-white text-[#1b2620] font-bold"
              />
              {masterKeyError && (
                <p className="text-2xs font-bold text-red-600">{masterKeyError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsMasterResetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#e2e4dc] hover:bg-gray-50 text-xs font-bold text-[#1b2620]"
              >
                Cancel
              </button>

              <button
                type="button"
                id="btn-confirm-master-reset"
                onClick={handleConfirmMasterReset}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Authorize Master Wipe</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
