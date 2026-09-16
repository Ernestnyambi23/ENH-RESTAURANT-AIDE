import React, { useState } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  Building2,
  QrCode,
  ShieldCheck,
  Send,
  RefreshCw,
} from 'lucide-react';
import { Order } from '../types';
import {
  DEFAULT_MERCHANT_TILLS,
  MerchantTillInfo,
  sendAutoPush,
  TillKey,
} from '../utils/paymentGatewayClient';
import { formatCurrency } from '../utils/formatters';
import { sound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

interface AutoPushCheckoutModalProps {
  order: Order;
  currency: string;
  onClose: () => void;
  onPaymentSuccess: (paymentData: {
    transId: string;
    tillKey: string;
    tillNumber: string;
    provider: string;
    customerPhone: string;
  }) => void;
}

export const AutoPushCheckoutModal: React.FC<AutoPushCheckoutModalProps> = ({
  order,
  currency,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedTillKey, setSelectedTillKey] = useState<TillKey>('MPESA_OLLI');
  const [customerPhone, setCustomerPhone] = useState<string>(order.customerPhone || '0754123456');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message: string;
    provider?: string;
    targetTill?: string;
    channelUsed?: string;
    gatewayDetails?: any;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Timer effect for PIN prompt waiting
  React.useEffect(() => {
    let interval: any;
    if (isTimerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, countdown]);

  const selectedTill: MerchantTillInfo =
    DEFAULT_MERCHANT_TILLS.find((t) => t.key === selectedTillKey) || DEFAULT_MERCHANT_TILLS[0];

  const handleTriggerPush = async () => {
    if (!customerPhone || customerPhone.trim().length < 9) {
      setErrorMessage('Please enter a valid customer phone number.');
      triggerHaptic('warning');
      return;
    }

    setErrorMessage(null);
    setIsSending(true);
    sound.playClick();
    triggerHaptic('medium');

    try {
      const response = await sendAutoPush(
        order.id || order.orderNumber,
        order.total,
        customerPhone.trim(),
        selectedTillKey
      );

      setPushResult(response);
      setIsTimerActive(true);
      setCountdown(60);
      sound.playSuccess();
      triggerHaptic('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to dispatch auto-push notification.');
      triggerHaptic('warning');
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmReceipt = () => {
    sound.playOrderPlaced();
    triggerHaptic('success');
    const transId =
      pushResult?.gatewayDetails?.providerRef ||
      `PUSH-${Date.now().toString().slice(-8)}`;

    onPaymentSuccess({
      transId,
      tillKey: selectedTill.key,
      tillNumber: selectedTill.tillNumber,
      provider: selectedTill.providerName,
      customerPhone,
    });
  };

  return (
    <div
      id="auto-push-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-[#e2e4dc]">
        {/* Header */}
        <div className="bg-[#143529] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <Zap className="w-5 h-5 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Auto-Routing Push Gateway
              </h3>
              <p className="text-xs text-[#dcebe3]">
                Direct USSD / STK PIN Prompt to Phone
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Order Summary Pill */}
          <div className="bg-[#f4f6f0] rounded-2xl p-4 flex items-center justify-between border border-[#e2e4dc]">
            <div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Order #{order.orderNumber}
              </div>
              <div className="text-xs text-gray-700 font-medium">
                {order.customerName || 'Customer'} • {order.items.length} item(s)
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Amount Due
              </div>
              <div className="text-lg font-black text-[#143529]">
                {formatCurrency(order.total, currency)}
              </div>
            </div>
          </div>

          {/* Till Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1b2620] mb-2 uppercase tracking-wider">
              Select Merchant Till Channel
            </label>
            <div className="grid grid-cols-1 gap-2">
              {DEFAULT_MERCHANT_TILLS.map((till) => {
                const isSelected = selectedTillKey === till.key;
                return (
                  <button
                    key={till.key}
                    type="button"
                    onClick={() => {
                      setSelectedTillKey(till.key);
                      sound.playClick();
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#1f4d3e] bg-[#e3ede8] ring-1 ring-[#1f4d3e]'
                        : 'border-[#e2e4dc] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          till.key.startsWith('MPESA')
                            ? 'bg-red-500 text-white'
                            : till.key.startsWith('MIXX')
                            ? 'bg-blue-500 text-white'
                            : till.key.startsWith('NMB')
                            ? 'bg-amber-500 text-white'
                            : till.key.startsWith('CRDB')
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-600 text-white'
                        }`}
                      >
                        {till.key.startsWith('MPESA') ? (
                          <Smartphone className="w-4 h-4" />
                        ) : till.key.startsWith('MIXX') ? (
                          <Zap className="w-4 h-4" />
                        ) : till.key.startsWith('NMB') || till.key.startsWith('CRDB') ? (
                          <Building2 className="w-4 h-4" />
                        ) : (
                          <QrCode className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-[#1b2620]">
                          {till.providerName}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono">
                          Till: <span className="font-bold text-gray-700">{till.tillNumber}</span> • {till.channelType}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-[#143529] text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {till.shortLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Phone Input */}
          <div>
            <label className="block text-xs font-bold text-[#1b2620] mb-1.5 uppercase tracking-wider">
              Customer Mobile Number (TZ)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 0754123456 or 255754123456"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 font-mono text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f4d3e] focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                Auto +255
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Supports Vodacom (074/075/076), Tigo/Mixx (065/067/071), Airtel (068/069), HaloPesa (062).
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Active Push Status Banner */}
          {pushResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>PIN Prompt Dispatched</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {pushResult.message}
              </p>
              <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-2 border-t border-emerald-200/60 font-mono">
                <span>Till: {pushResult.targetTill}</span>
                <span>Channel: {pushResult.channelUsed}</span>
              </div>

              {/* Waiting for PIN countdown indicator */}
              <div className="bg-white/80 rounded-xl p-3 flex items-center justify-between border border-emerald-100 mt-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                  <span className="text-[11px] font-bold text-gray-700">
                    Awaiting customer PIN input...
                  </span>
                </div>
                <span className="font-mono font-black text-xs text-emerald-800">
                  {countdown}s
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {!pushResult ? (
              <button
                type="button"
                onClick={handleTriggerPush}
                disabled={isSending}
                className="w-full py-3.5 px-4 rounded-xl bg-[#143529] hover:bg-[#1f4d3e] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Routing to {selectedTill.providerName}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Auto-Push PIN Prompt</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleConfirmReceipt}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Payment Received (Confirm Order)</span>
                </button>
                <button
                  type="button"
                  onClick={handleTriggerPush}
                  disabled={isSending}
                  className="w-full py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend PIN Prompt</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
            >
              Postpone / Pay with Cash Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
