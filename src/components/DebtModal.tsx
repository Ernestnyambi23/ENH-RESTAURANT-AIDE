import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Phone,
  User,
  Calendar,
  FileText,
  DollarSign,
  Send,
  CreditCard,
  Banknote,
  Smartphone,
  RotateCcw,
  Zap,
  QrCode,
} from 'lucide-react';
import { Order, PaymentMethod, RestaurantSettings } from '../types';
import { formatCurrency, formatClockTime } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { sound } from '../utils/sound';

interface DebtModalProps {
  order: Order | null;
  settings: RestaurantSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveDebt: (
    orderId: string,
    settlementStatus: 'paid' | 'debt',
    data: {
      debtorName?: string;
      debtorPhone?: string;
      debtNotes?: string;
      debtDueDate?: number;
      debtSettledMethod?: PaymentMethod;
    }
  ) => void;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  order,
  settings,
  isOpen,
  onClose,
  onSaveDebt,
}) => {
  if (!isOpen || !order) return null;

  const [settlementStatus, setSettlementStatus] = useState<'paid' | 'debt'>(
    order.settlementStatus || (order.paymentStatus === 'debt' ? 'debt' : 'paid')
  );
  const [debtorName, setDebtorName] = useState<string>(
    order.debtorName || order.customerName || ''
  );
  const [debtorPhone, setDebtorPhone] = useState<string>(
    order.debtorPhone || order.phone || ''
  );
  const [debtNotes, setDebtNotes] = useState<string>(order.debtNotes || '');
  const [dueDateString, setDueDateString] = useState<string>(
    order.debtDueDate
      ? new Date(order.debtDueDate).toISOString().slice(0, 10)
      : ''
  );
  const [settledMethod, setSettledMethod] = useState<PaymentMethod>(
    order.debtSettledMethod || order.paymentMethod || 'cash'
  );

  const handleSetQuickDueDate = (days: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    setDueDateString(targetDate.toISOString().slice(0, 10));
  };

  const handleSetEndOfWeek = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday
    const diff = (7 - day) % 7; // days until Sunday
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + (diff === 0 ? 7 : diff));
    setDueDateString(endOfWeek.toISOString().slice(0, 10));
  };

  const handleSetEndOfMonth = () => {
    const today = new Date();
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setDueDateString(endOfMonth.toISOString().slice(0, 10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(settlementStatus === 'paid' ? 'success' : 'medium');
    if (settlementStatus === 'paid') {
      sound.playOrderPlaced();
    } else {
      sound.playClick();
    }

    const dueTimestamp = dueDateString ? new Date(dueDateString).getTime() : undefined;

    onSaveDebt(order.id, settlementStatus, {
      debtorName: debtorName.trim() || order.customerName,
      debtorPhone: debtorPhone.trim() || order.phone,
      debtNotes: debtNotes.trim(),
      debtDueDate: dueTimestamp,
      debtSettledMethod: settledMethod,
    });

    onClose();
  };

  const cleanPhone = (debtorPhone || '').replace(/\s+/g, '');
  const whatsappMessage = encodeURIComponent(
    `Hello ${debtorName || order.customerName}, gentle reminder from ${settings.restaurantName} regarding order ${order.orderNumber} for ${formatCurrency(order.total, settings.currency)}. Please settle your pending balance when convenient. Thank you!`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#e2e4dc] flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 px-5 bg-[#f4f5f0] border-b border-[#e2e4dc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
              settlementStatus === 'debt' ? 'bg-[#b3402f]' : 'bg-[#1f4d3e]'
            }`}>
              {settlementStatus === 'debt' ? '!' : '✓'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1b2620]">
                {settlementStatus === 'debt' ? 'Manage Debt / Credit' : 'Payment Status & Settlement'}
              </h2>
              <p className="text-[11px] text-[#8b978f]">
                Order {order.orderNumber} • {order.customerName} • {formatCurrency(order.total, settings.currency)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#e2e4dc] hover:bg-gray-100 flex items-center justify-center text-[#4c5a52] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Main Status Toggle (OK Paid vs Debt) */}
          <div>
            <label className="block font-bold text-[#4c5a52] mb-1.5 uppercase tracking-wider text-[11px]">
              Select Order Payment Status
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="btn-set-status-paid"
                onClick={() => setSettlementStatus('paid')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  settlementStatus === 'paid'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/30 shadow-xs'
                    : 'bg-white border-[#e2e4dc] text-[#4c5a52] hover:bg-gray-50'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xs">OK Paid / Settled</span>
                <span className="text-[10px] text-emerald-700 font-medium">Customer paid in full</span>
              </button>

              <button
                type="button"
                id="btn-set-status-debt"
                onClick={() => setSettlementStatus('debt')}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                  settlementStatus === 'debt'
                    ? 'bg-[#f6e2de] border-[#b3402f] text-[#8a2c1f] ring-2 ring-[#b3402f]/30 shadow-xs'
                    : 'bg-white border-[#e2e4dc] text-[#4c5a52] hover:bg-gray-50'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#b3402f] text-white flex items-center justify-center shadow-2xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xs">Debt / Unpaid (Credit)</span>
                <span className="text-[10px] text-[#b3402f] font-medium">Add to weekly/monthly debt list</span>
              </button>
            </div>
          </div>

          {/* If marked as DEBT */}
          {settlementStatus === 'debt' ? (
            <div className="space-y-3 bg-[#fdf8f6] border border-[#f6e2de] rounded-2xl p-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#b3402f] font-bold text-xs pb-1 border-b border-[#f6e2de]">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Debtor Account & Follow-up Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4c5a52] mb-1">
                    Debtor / Customer Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b978f]" />
                    <input
                      type="text"
                      required
                      value={debtorName}
                      onChange={(e) => setDebtorName(e.target.value)}
                      placeholder="e.g. Baraka Mwangi"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-[#e2e4dc] rounded-xl text-xs focus:outline-none focus:border-[#b3402f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4c5a52] mb-1">
                    Debtor Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b978f]" />
                    <input
                      type="tel"
                      value={debtorPhone}
                      onChange={(e) => setDebtorPhone(e.target.value)}
                      placeholder="+255 7XX XXX XXX"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-[#e2e4dc] rounded-xl text-xs focus:outline-none focus:border-[#b3402f]"
                    />
                  </div>
                </div>
              </div>

              {/* Due Date & Quick presets */}
              <div>
                <label className="block text-[11px] font-bold text-[#4c5a52] mb-1">
                  Expected Payment Due Date
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b978f]" />
                    <input
                      type="date"
                      value={dueDateString}
                      onChange={(e) => setDueDateString(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-[#e2e4dc] rounded-xl text-xs focus:outline-none focus:border-[#b3402f]"
                    />
                  </div>
                </div>

                {/* Quick Due Date Presets */}
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  <span className="text-[10px] text-[#8b978f]">Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDueDate(3)}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#e2e4dc] hover:bg-gray-100 text-[10.5px] font-bold text-[#4c5a52]"
                  >
                    +3 Days
                  </button>
                  <button
                    type="button"
                    onClick={handleSetEndOfWeek}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#e2e4dc] hover:bg-gray-100 text-[10.5px] font-bold text-[#b3402f]"
                  >
                    End of Week
                  </button>
                  <button
                    type="button"
                    onClick={handleSetEndOfMonth}
                    className="px-2 py-0.5 rounded-md bg-white border border-[#e2e4dc] hover:bg-gray-100 text-[10.5px] font-bold text-[#1f4d3e]"
                  >
                    End of Month
                  </button>
                </div>
              </div>

              {/* Debt Note / Guarantee */}
              <div>
                <label className="block text-[11px] font-bold text-[#4c5a52] mb-1">
                  Debt Reason / Promise Note
                </label>
                <div className="relative">
                  <FileText className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8b978f]" />
                  <textarea
                    rows={2}
                    value={debtNotes}
                    onChange={(e) => setDebtNotes(e.target.value)}
                    placeholder="e.g. Regular patron, will clear balance next visit / salary day"
                    className="w-full pl-8 pr-3 py-2 bg-white border border-[#e2e4dc] rounded-xl text-xs focus:outline-none focus:border-[#b3402f]"
                  />
                </div>
              </div>

              {/* Contact actions */}
              {cleanPhone && (
                <div className="flex items-center gap-2 pt-1 border-t border-[#f6e2de]">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e4dc] hover:bg-gray-50 text-[#1b2620] text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3 h-3 text-[#1f4d3e]" />
                    <span>Call Debtor</span>
                  </a>
                  <a
                    href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40 hover:bg-[#25D366]/25 text-[#075E54] text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3 h-3 text-[#25D366]" />
                    <span>WhatsApp Reminder</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            /* If OK PAID */
            <div className="space-y-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs pb-1 border-b border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Payment Confirmation</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4c5a52] mb-1.5">
                  Payment Method Received
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'cash', label: 'Cash', icon: Banknote },
                    { id: 'mpesa', label: 'Mobile Money', icon: Smartphone },
                    { id: 'tips', label: 'TIPS Lipa', icon: QrCode },
                    { id: 'card', label: 'Card / POS', icon: CreditCard },
                  ].map((method) => {
                    const Icon = method.icon;
                    const isSelected = settledMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSettledMethod(method.id as PaymentMethod)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                          isSelected
                            ? 'bg-[#1f4d3e] text-white border-[#1f4d3e] shadow-xs'
                            : 'bg-white text-[#4c5a52] border-[#e2e4dc] hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-bold">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {order.debtSettledAt && (
                <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Previously recovered on {new Date(order.debtSettledAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Amount Due Summary */}
          <div className="bg-[#f4f5f0] border border-[#e2e4dc] rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#8b978f] font-bold uppercase tracking-wider block">
                Total Order Bill
              </span>
              <span className="text-base font-extrabold text-[#143529]">
                {formatCurrency(order.total, settings.currency)}
              </span>
            </div>

            <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
              settlementStatus === 'debt'
                ? 'bg-[#f6e2de] text-[#8a2c1f] border-[#b3402f]/30'
                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
              {settlementStatus === 'debt' ? 'UNPAID DEBT' : 'SETTLED / PAID'}
            </span>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#e2e4dc] bg-white hover:bg-gray-100 text-[#4c5a52] font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 ${
                settlementStatus === 'debt'
                  ? 'bg-[#b3402f] hover:bg-[#8a2c1f]'
                  : 'bg-[#1f4d3e] hover:bg-[#143529]'
              }`}
            >
              {settlementStatus === 'debt' ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Save as Debt</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Confirm as OK Paid</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
