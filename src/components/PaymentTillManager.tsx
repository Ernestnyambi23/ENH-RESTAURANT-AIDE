import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Zap,
  Building2,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  History,
  ShieldCheck,
  ExternalLink,
  Layers,
} from 'lucide-react';
import {
  DEFAULT_MERCHANT_TILLS,
  sendAutoPush,
  fetchPushHistory,
  TillKey,
} from '../utils/paymentGatewayClient';
import { formatCurrency, formatTimeAgo } from '../utils/formatters';
import { sound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

interface PaymentTillManagerProps {
  currency: string;
}

export const PaymentTillManager: React.FC<PaymentTillManagerProps> = ({ currency }) => {
  const [selectedTillKey, setSelectedTillKey] = useState<TillKey>('MPESA_OLLI');
  const [testPhone, setTestPhone] = useState<string>('0754123456');
  const [testAmount, setTestAmount] = useState<string>('5000');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [pushHistory, setPushHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    const hist = await fetchPushHistory();
    setPushHistory(hist);
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleTestPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone || !testAmount) return;

    setIsSending(true);
    setTestError(null);
    setTestResult(null);
    sound.playClick();
    triggerHaptic('medium');

    try {
      const orderId = `TEST-${Date.now().toString().slice(-6)}`;
      const result = await sendAutoPush(
        orderId,
        parseFloat(testAmount) || 1000,
        testPhone,
        selectedTillKey
      );

      setTestResult(result);
      sound.playSuccess();
      triggerHaptic('success');
      loadHistory();
    } catch (err: any) {
      setTestError(err.message || 'Auto-push request failed');
      triggerHaptic('warning');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#143529] rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-[#1f4d3e]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-black tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            <span>Auto-Routing Channels</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Merchant Tills &amp; Auto-Push Gateway
          </h2>
          <p className="text-xs text-[#dcebe3] max-w-xl">
            Automatically routes incoming checkout prompts to designated Tanzanian Mobile Money
            and TIPS Bank channels with instant USSD / STK push notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Active Router
          </span>
        </div>
      </div>

      {/* Grid of 5 Configured Merchant Tills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#1b2620] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            Configured Merchant Tills ({DEFAULT_MERCHANT_TILLS.length})
          </h3>
          <span className="text-[11px] text-gray-500 font-mono">
            POST /api/payments/auto-push
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEFAULT_MERCHANT_TILLS.map((till) => {
            const isMpesa = till.key === 'MPESA_OLLI';
            const isMixx = till.key === 'MIXX_BAHATI';
            const isNmb = till.key === 'NMB_OLLI';
            const isCrdb = till.key === 'CRDB_BAHATI';

            return (
              <div
                key={till.key}
                className="bg-white rounded-2xl p-4 border border-[#e2e4dc] hover:border-[#1f4d3e] transition-all shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isMpesa
                        ? 'bg-red-500 text-white'
                        : isMixx
                        ? 'bg-blue-600 text-white'
                        : isNmb
                        ? 'bg-amber-500 text-white'
                        : isCrdb
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-600 text-white'
                    }`}
                  >
                    {isMpesa ? (
                      <Smartphone className="w-4 h-4" />
                    ) : isMixx ? (
                      <Zap className="w-4 h-4" />
                    ) : isNmb || isCrdb ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <QrCode className="w-4 h-4" />
                    )}
                  </div>
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {till.channelType}
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-[#1b2620]">{till.providerName}</h4>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xs text-gray-500">Till:</span>
                    <span className="font-mono font-black text-base text-[#143529]">
                      {till.tillNumber}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                  <span>Path: {till.endpointPath}</span>
                  <span className="font-bold text-emerald-700">{till.key}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Push Notification Tester */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2e4dc] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-800" />
            <h3 className="font-black text-sm text-[#1b2620]">
              Test Automatic PIN Prompt (Simulator)
            </h3>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            Dispatches live / simulated prompt to device
          </span>
        </div>

        <form onSubmit={handleTestPush} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Target Till</label>
              <select
                value={selectedTillKey}
                onChange={(e) => setSelectedTillKey(e.target.value as TillKey)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]"
              >
                {DEFAULT_MERCHANT_TILLS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.providerName} ({t.tillNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Customer Phone (TZ)
              </label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="0754123456"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-bold font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Amount ({currency})
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="5000"
                min="100"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-bold font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 rounded-xl bg-[#143529] hover:bg-[#1f4d3e] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching Push...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Test Prompt</span>
                </>
              )}
            </button>
          </div>
        </form>

        {testResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 font-black text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testResult.message}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200 font-mono text-[11px] text-emerald-900">
              <div>
                <span className="text-gray-500 block">Status:</span>
                <span className="font-bold">{testResult.status}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Target Till:</span>
                <span className="font-bold">{testResult.targetTill}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Channel:</span>
                <span className="font-bold">{testResult.channelUsed}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Provider:</span>
                <span className="font-bold">{testResult.provider}</span>
              </div>
            </div>
          </div>
        )}

        {testError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{testError}</span>
          </div>
        )}
      </div>

      {/* Push Dispatch History */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2e4dc] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-800" />
            <h3 className="font-black text-sm text-[#1b2620]">Recent Auto-Push Dispatches</h3>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            className="text-xs font-bold text-emerald-800 hover:underline"
          >
            Refresh
          </button>
        </div>

        {pushHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">
            No auto-push notifications dispatched yet. Try sending a test prompt above or placing an order with Mobile Money.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase text-[10px]">
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Provider &amp; Till</th>
                  <th className="pb-2">Customer Phone</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pushHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-2.5 font-mono text-gray-500">
                      {formatTimeAgo(item.timestamp)}
                    </td>
                    <td className="py-2.5 font-mono font-bold text-gray-800">{item.orderId}</td>
                    <td className="py-2.5">
                      <div className="font-bold text-[#1b2620]">{item.provider}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        Till: {item.targetTill} ({item.channelUsed})
                      </div>
                    </td>
                    <td className="py-2.5 font-mono font-medium text-gray-700">
                      +{item.customerPhone}
                    </td>
                    <td className="py-2.5 font-mono font-bold text-right text-emerald-900">
                      {formatCurrency(item.amount, currency)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
