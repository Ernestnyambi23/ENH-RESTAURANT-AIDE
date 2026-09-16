import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Search,
  Calendar,
  Phone,
  User,
  CreditCard,
  Receipt,
  FileText,
  Clock,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Order, RestaurantSettings } from '../types';
import { formatCurrency, formatClockTime } from '../utils/formatters';

interface DebtsViewProps {
  orders: Order[];
  settings: RestaurantSettings;
  onPayDebt: (orderId: string, paymentAmount: number, paymentMethod: 'cash' | 'card' | 'mpesa', notes?: string) => void;
  onOpenReceipt: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  trashCount?: number;
  onOpenTrashBin?: () => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({
  orders,
  settings,
  onPayDebt,
  onOpenReceipt,
  onDeleteOrder,
  trashCount,
  onOpenTrashBin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'mpesa'>('cash');
  const [payNotes, setPayNotes] = useState('');

  // Find all non-deleted orders that have debt
  const debtOrders = orders.filter((o) => {
    if (o.isDeleted) return false;
    const debt = o.debtAmount !== undefined ? o.debtAmount : (o.isPaid ? 0 : Math.max(0, o.total - (o.paidAmount || 0)));
    return debt > 0 || o.settlementStatus === 'debt' || o.paymentStatus === 'debt';
  });

  const totalDebt = debtOrders.reduce((sum, o) => {
    const debt = o.debtAmount !== undefined ? o.debtAmount : (o.isPaid ? 0 : Math.max(0, o.total - (o.paidAmount || 0)));
    return sum + debt;
  }, 0);

  const filteredDebtOrders = debtOrders.filter((o) => {
    const search = searchTerm.toLowerCase();
    return (
      (o.debtorName && o.debtorName.toLowerCase().includes(search)) ||
      (o.customerName && o.customerName.toLowerCase().includes(search)) ||
      (o.phone && o.phone.toLowerCase().includes(search)) ||
      o.orderNumber.toLowerCase().includes(search)
    );
  });

  const handleOpenPayModal = (order: Order) => {
    const remaining = order.debtAmount !== undefined ? order.debtAmount : (order.isPaid ? 0 : Math.max(0, order.total - (order.paidAmount || 0)));
    setSelectedOrder(order);
    setPayAmount(String(remaining));
    setPayNotes('');
    setPayMethod('cash');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) return;

    onPayDebt(selectedOrder.id, amount, payMethod, payNotes);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2e4dc] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#1b2620]">
              Customer Debt & Credit Ledger
            </h2>
            <p className="text-xs text-[#4c5a52]">
              Track unpaid balances, customer tabs, credit repayments, and M-Pesa settlements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenTrashBin && (
            <button
              type="button"
              id="debts-open-trash-bin-btn"
              onClick={onOpenTrashBin}
              className="text-xs font-bold bg-white text-[#5f6f65] hover:text-[#1b2620] px-3.5 py-2 rounded-2xl border border-[#e2e4dc] hover:bg-stone-50 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
              title="Open Trash Bin (30-day retention)"
            >
              <Trash2 className="w-4 h-4 text-amber-700" />
              <span>Trash Bin</span>
              {trashCount !== undefined && trashCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-extrabold min-w-[16px] text-center">
                  {trashCount}
                </span>
              )}
            </button>
          )}

          <div className="bg-red-50 border border-red-200 px-5 py-3 rounded-2xl text-right">
            <span className="text-[11px] font-bold text-red-800 uppercase tracking-wider block">
              Total Outstanding Debt
            </span>
            <span className="text-xl font-black text-red-700 font-mono">
              {formatCurrency(totalDebt, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#e2e4dc] shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search debts by debtor name, customer, phone number, or order #..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#e2e4dc] rounded-2xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#1f4d3e] focus:bg-white"
          />
        </div>
      </div>

      {/* Debt Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDebtOrders.map((order) => {
          const debt = order.debtAmount !== undefined ? order.debtAmount : (order.isPaid ? 0 : Math.max(0, order.total - (order.paidAmount || 0)));
          const paid = order.paidAmount !== undefined ? order.paidAmount : (order.isPaid ? order.total : 0);

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 border border-red-200/80 shadow-xs space-y-4 hover:border-red-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#1b2620]">
                        {order.debtorName || order.customerName || 'Walk-in Customer'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-extrabold uppercase">
                        Unpaid
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                      <span>Order #{order.orderNumber}</span>
                      <span>•</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()} {formatClockTime(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-400 font-bold">Remaining Debt</div>
                    <div className="text-base font-black text-red-700 font-mono">
                      {formatCurrency(debt, settings.currency)}
                    </div>
                  </div>
                </div>

                {order.phone && (
                  <div className="text-xs text-gray-600 flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-semibold">{order.phone}</span>
                  </div>
                )}

                {order.debtNotes && (
                  <div className="text-xs text-gray-600 bg-red-50/50 p-2 rounded-xl border border-red-100">
                    <span className="font-bold text-red-900">Notes: </span>
                    <span className="italic">{order.debtNotes}</span>
                  </div>
                )}

                {order.debtDueDate && (
                  <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Due by: <strong className="text-gray-800">{new Date(order.debtDueDate).toLocaleDateString()}</strong></span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-600">
                  <span>Total Order Value: <strong>{formatCurrency(order.total, settings.currency)}</strong></span>
                  <span>Already Paid: <strong className="text-emerald-700">{formatCurrency(paid, settings.currency)}</strong></span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPayModal(order)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Settle / Pay Debt</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenReceipt(order)}
                  className="py-2 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Receipt className="w-3.5 h-3.5 text-gray-500" />
                  <span>Receipt</span>
                </button>
                <button
                  type="button"
                  id={`delete-debt-record-${order.id}`}
                  onClick={() => setOrderToDelete(order)}
                  className="py-2 px-2.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Delete debt record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredDebtOrders.length === 0 && (
          <div className="col-span-2 bg-white rounded-3xl p-12 border border-[#e2e4dc] text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-[#1b2620]">No Outstanding Debts!</h3>
            <p className="text-xs text-gray-500">All customer tabs and credit orders have been settled in full.</p>
          </div>
        )}
      </div>

      {/* Pay Debt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e4dc] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-black text-[#1b2620] flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  Settle Debt Payment
                </h3>
                <p className="text-xs text-gray-500">
                  Order #{selectedOrder.orderNumber} • {selectedOrder.debtorName || selectedOrder.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
                <span className="font-bold text-red-900">Total Unpaid Balance:</span>
                <span className="text-base font-black text-red-700 font-mono">
                  {formatCurrency(
                    selectedOrder.debtAmount !== undefined
                      ? selectedOrder.debtAmount
                      : Math.max(0, selectedOrder.total - (selectedOrder.paidAmount || 0)),
                    settings.currency
                  )}
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Payment Amount ({settings.currency}) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-black text-base text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  You can enter a partial payment or the full balance.
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'mpesa', 'card'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2 px-3 rounded-xl font-bold uppercase text-[11px] border transition-all ${
                        payMethod === m
                          ? 'bg-[#1f4d3e] text-white border-[#1f4d3e]'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {m === 'mpesa' ? 'M-PESA' : m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reconciliation Notes / Reference</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid via M-Pesa transaction #QWE123"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-xs"
                >
                  Confirm & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Debt Record */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620]">
                  Delete Debt Record #{orderToDelete.orderNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  {orderToDelete.debtorName || orderToDelete.customerName || 'Walk-in Customer'}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#fdf8f6] border border-[#f6e2de] rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between items-center text-[#1b2620]">
                <span className="text-[#8b978f]">Remaining Debt:</span>
                <span className="font-extrabold text-sm text-[#b3402f]">
                  {formatCurrency(
                    orderToDelete.debtAmount !== undefined
                      ? orderToDelete.debtAmount
                      : Math.max(0, orderToDelete.total - (orderToDelete.paidAmount || 0)),
                    settings.currency
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#1b2620]">
                <span className="text-[#8b978f]">Total Order:</span>
                <span className="font-semibold text-gray-700">
                  {formatCurrency(orderToDelete.total, settings.currency)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This order and debt record will be moved to the <strong>Trash Bin</strong> and retained safely for 30 days before permanent removal. You can click <strong>Undo</strong> on the notification snackbar or restore it from the Trash Bin anytime.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                id="cancel-delete-debt-btn"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Keep Record
              </button>
              <button
                type="button"
                id="confirm-delete-debt-btn"
                onClick={() => {
                  if (onDeleteOrder) {
                    onDeleteOrder(orderToDelete.id);
                  }
                  setOrderToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Move to Trash</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
