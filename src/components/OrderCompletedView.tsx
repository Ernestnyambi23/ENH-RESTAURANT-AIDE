import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  Search,
  Printer,
  Calendar,
  DollarSign,
  Utensils,
  Package,
  Truck,
  TrendingUp,
  Receipt,
  User,
  ShoppingBag,
  AlertTriangle,
  FileText,
  Phone,
  Check,
  Edit3,
  Download,
  Plus,
  ArrowRight,
  Send,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { Order, RestaurantSettings, PaymentMethod } from '../types';
import { formatCurrency, formatClockTime, formatTimeAgo } from '../utils/formatters';
import { DebtModal } from './DebtModal';
import { DebtStatementModal } from './DebtStatementModal';
import { triggerHaptic } from '../utils/haptics';
import { sound } from '../utils/sound';

interface OrderCompletedViewProps {
  orders: Order[];
  settings: RestaurantSettings;
  onViewReceipt: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  onUpdateOrderSettlement?: (
    orderId: string,
    settlementStatus: 'paid' | 'debt',
    data?: {
      debtorName?: string;
      debtorPhone?: string;
      debtNotes?: string;
      debtDueDate?: number;
      debtSettledMethod?: PaymentMethod;
    }
  ) => void;
  trashCount?: number;
  onOpenTrashBin?: () => void;
}

export const OrderCompletedView: React.FC<OrderCompletedViewProps> = ({
  orders,
  settings,
  onViewReceipt,
  onDeleteOrder,
  onUpdateOrderSettlement,
  trashCount,
  onOpenTrashBin,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all_completed' | 'debts_ledger'>('all_completed');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<'this_week' | 'this_month' | 'last_week' | 'last_month' | 'all'>('this_week');
  const [debtStatusFilter, setDebtStatusFilter] = useState<'all' | 'unpaid' | 'settled'>('all');

  // Modal states
  const [editingDebtOrder, setEditingDebtOrder] = useState<Order | null>(null);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Filter completed orders (excluding soft-deleted)
  const completedOrders = useMemo(() => {
    return orders
      .filter((o) => !o.isDeleted && o.status === 'completed')
      .filter((o) => {
        const query = searchQuery.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          (o.debtorName && o.debtorName.toLowerCase().includes(query)) ||
          (o.tableNumber && o.tableNumber.toLowerCase().includes(query)) ||
          (o.phone && o.phone.includes(query)) ||
          (o.debtorPhone && o.debtorPhone.includes(query))
        );
      })
      .sort((a, b) => (b.completedAt || b.updatedAt) - (a.completedAt || a.updatedAt));
  }, [orders, searchQuery]);

  // Overall financial stats
  const totalCompletedRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // Debts Calculation & Filtering for Weekly / Monthly Reports
  const now = new Date();

  const allDebtRecords = useMemo(() => {
    return orders.filter(
      (o) =>
        !o.isDeleted &&
        (o.settlementStatus === 'debt' ||
          o.paymentStatus === 'debt' ||
          o.debtorName ||
          o.debtSettledAt)
    );
  }, [orders]);

  const outstandingDebtsAllTime = useMemo(() => {
    return orders.filter(
      (o) => !o.isDeleted && (o.settlementStatus === 'debt' || o.paymentStatus === 'debt')
    );
  }, [orders]);

  const totalOutstandingDebtAllTime = outstandingDebtsAllTime.reduce((sum, o) => sum + o.total, 0);

  // Filter debts by selected period (Week, Month, etc.)
  const filteredDebts = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

    return allDebtRecords.filter((order) => {
      const isUnpaid = order.settlementStatus === 'debt' || order.paymentStatus === 'debt';

      // Status filter
      if (debtStatusFilter === 'unpaid' && !isUnpaid) return false;
      if (debtStatusFilter === 'settled' && isUnpaid) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          order.orderNumber.toLowerCase().includes(q) ||
          order.customerName.toLowerCase().includes(q) ||
          (order.debtorName && order.debtorName.toLowerCase().includes(q)) ||
          (order.debtorPhone && order.debtorPhone.includes(q)) ||
          (order.phone && order.phone.includes(q));
        if (!matches) return false;
      }

      // Period filter
      if (periodFilter === 'all') return true;
      if (periodFilter === 'this_week') return order.createdAt >= startOfThisWeek.getTime();
      if (periodFilter === 'last_week')
        return order.createdAt >= startOfLastWeek.getTime() && order.createdAt < startOfThisWeek.getTime();
      if (periodFilter === 'this_month') return order.createdAt >= startOfThisMonth;
      if (periodFilter === 'last_month')
        return order.createdAt >= startOfLastMonth && order.createdAt < startOfThisMonth;

      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [allDebtRecords, periodFilter, debtStatusFilter, searchQuery, now]);

  // Period debt totals
  const periodUnpaidDebts = filteredDebts.filter(
    (o) => o.settlementStatus === 'debt' || o.paymentStatus === 'debt'
  );
  const periodUnpaidTotal = periodUnpaidDebts.reduce((sum, o) => sum + o.total, 0);
  const periodSettledTotal = filteredDebts.reduce((sum, o) => {
    const isUnpaid = o.settlementStatus === 'debt' || o.paymentStatus === 'debt';
    return isUnpaid ? sum : sum + o.total;
  }, 0);

  // Quick 1-click status toggles
  const handleQuickMarkPaid = (order: Order) => {
    sound.playKitchenBell();
    triggerHaptic('success');
    if (onUpdateOrderSettlement) {
      onUpdateOrderSettlement(order.id, 'paid', {
        debtorName: order.debtorName || order.customerName,
        debtorPhone: order.debtorPhone || order.phone,
        debtSettledMethod: order.paymentMethod || 'cash',
      });
    }
  };

  const handleQuickMarkDebt = (order: Order) => {
    sound.playClick();
    triggerHaptic('warning');
    // Open debt modal so user can confirm debtor name/notes/due date or quickly save
    setEditingDebtOrder(order);
  };

  const handleSaveDebtModal = (
    orderId: string,
    settlementStatus: 'paid' | 'debt',
    data: {
      debtorName?: string;
      debtorPhone?: string;
      debtNotes?: string;
      debtDueDate?: number;
      debtSettledMethod?: PaymentMethod;
    }
  ) => {
    if (onUpdateOrderSettlement) {
      onUpdateOrderSettlement(orderId, settlementStatus, data);
    }
  };

  const renderTypeBadge = (type: string) => {
    switch (type) {
      case 'dine_in':
        return (
          <span className="text-[10px] font-bold text-[#1f4d3e] bg-[#e3ede8] px-2 py-0.5 rounded flex items-center gap-1">
            <Utensils className="w-3 h-3" /> Dine-In
          </span>
        );
      case 'takeaway':
        return (
          <span className="text-[10px] font-bold text-[#8a540f] bg-[#f7e9d6] px-2 py-0.5 rounded flex items-center gap-1">
            <Package className="w-3 h-3" /> Takeaway
          </span>
        );
      case 'delivery':
        return (
          <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded flex items-center gap-1">
            <Truck className="w-3 h-3" /> Delivery
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Sub-Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-[#1b2620] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>Order Completed History & Debts</span>
          </h2>
          <p className="text-xs text-[#8b978f]">
            Indicate OK Paid or Debt on completed orders & inspect end-of-week/month debts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenTrashBin && (
            <button
              type="button"
              id="completed-open-trash-bin-btn"
              onClick={onOpenTrashBin}
              className="text-xs font-bold bg-white text-[#5f6f65] hover:text-[#1b2620] px-3 py-1.5 rounded-xl border border-[#e2e4dc] hover:bg-stone-50 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Open Trash Bin (30-day retention)"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-700" />
              <span>Trash Bin</span>
              {trashCount !== undefined && trashCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-extrabold min-w-[16px] text-center">
                  {trashCount}
                </span>
              )}
            </button>
          )}

          {outstandingDebtsAllTime.length > 0 && (
            <button
              type="button"
              id="header-debts-badge-btn"
              onClick={() => setActiveSubTab('debts_ledger')}
              className="text-xs font-bold bg-[#f6e2de] text-[#8a2c1f] px-3 py-1.5 rounded-full border border-[#b3402f]/40 flex items-center gap-1.5 shadow-2xs hover:bg-[#ebd0ca] transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#b3402f]" />
              <span>{outstandingDebtsAllTime.length} Unpaid Debt(s)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Sub Navigation (All Completed vs Debts Ledger & Reports) */}
      <div className="grid grid-cols-2 gap-2 bg-[#f4f5f0] p-1.5 rounded-2xl border border-[#e2e4dc]">
        <button
          type="button"
          id="tab-all-completed"
          onClick={() => setActiveSubTab('all_completed')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'all_completed'
              ? 'bg-white text-[#143529] shadow-xs'
              : 'text-[#4c5a52] hover:text-[#1b2620]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>All Completed Orders ({completedOrders.length})</span>
        </button>

        <button
          type="button"
          id="tab-debts-ledger"
          onClick={() => setActiveSubTab('debts_ledger')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'debts_ledger'
              ? 'bg-[#b3402f] text-white shadow-xs'
              : 'text-[#4c5a52] hover:text-[#1b2620]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Debts Ledger (Week & Month)</span>
          {outstandingDebtsAllTime.length > 0 && (
            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
              activeSubTab === 'debts_ledger' ? 'bg-white text-[#b3402f]' : 'bg-[#b3402f] text-white'
            }`}>
              {outstandingDebtsAllTime.length}
            </span>
          )}
        </button>
      </div>

      {/* ================= VIEW 1: ALL COMPLETED ORDERS ================= */}
      {activeSubTab === 'all_completed' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-[#e2e4dc] rounded-2xl p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold text-[#8b978f] uppercase tracking-wider block">
                Fulfilled Sales
              </span>
              <div className="text-xl font-extrabold text-[#143529] mt-1 truncate">
                {formatCurrency(totalCompletedRevenue, settings.currency)}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" /> {completedOrders.length} completed tickets
              </span>
            </div>

            <div className="bg-white border border-[#e2e4dc] rounded-2xl p-3.5 shadow-2xs">
              <span className="text-[11px] font-bold text-[#8b978f] uppercase tracking-wider block">
                Outstanding Debts
              </span>
              <div className="text-xl font-extrabold text-[#b3402f] mt-1 truncate">
                {formatCurrency(totalOutstandingDebtAllTime, settings.currency)}
              </div>
              <span className="text-[10px] text-[#b3402f] font-semibold flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3" /> {outstandingDebtsAllTime.length} pending credit
              </span>
            </div>

            <div className="bg-white border border-[#e2e4dc] rounded-2xl p-3.5 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-[#8b978f] uppercase tracking-wider block">
                Average Ticket
              </span>
              <div className="text-xl font-extrabold text-[#1b2620] mt-1">
                {completedOrders.length > 0
                  ? formatCurrency(Math.round(totalCompletedRevenue / completedOrders.length), settings.currency)
                  : '0 ' + settings.currency}
              </div>
              <span className="text-[10px] text-[#4c5a52] font-semibold mt-0.5 block">
                Per fulfilled order
              </span>
            </div>
          </div>

          {/* Search Filter */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b978f]" />
            <input
              type="text"
              id="completed-orders-search"
              placeholder="Search by Order #, Customer / Debtor Name, Table, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#e2e4dc] rounded-xl text-xs placeholder-[#8b978f] focus:outline-none focus:border-[#1f4d3e]"
            />
          </div>

          {/* Completed Orders List */}
          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e4dc] p-6">
                <CheckCircle2 className="w-10 h-10 text-[#8b978f] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-[#1b2620]">No completed orders found</p>
                <p className="text-xs text-[#8b978f] mt-1">
                  Orders marked as complete in the "Order Received" queue will appear here.
                </p>
              </div>
            ) : (
              completedOrders.map((order) => {
                const completionTime = order.completedAt || order.updatedAt;
                const prepMinutes = Math.max(1, Math.round((completionTime - order.createdAt) / 60000));
                const isDebt = order.settlementStatus === 'debt' || order.paymentStatus === 'debt';

                return (
                  <div
                    key={order.id}
                    id={`completed-order-${order.id}`}
                    className={`bg-white border rounded-2xl p-4 transition-all shadow-2xs ${
                      isDebt
                        ? 'border-[#b3402f]/50 bg-[#fffdfc] ring-1 ring-[#b3402f]/20'
                        : 'border-[#e2e4dc]'
                    }`}
                  >
                    {/* Top Row: Order info & Receipt */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#e2e4dc]/70 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-extrabold text-[#143529]">
                            {order.orderNumber}
                          </span>
                          {renderTypeBadge(order.orderType)}
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fulfilled ({prepMinutes}m)
                          </span>
                        </div>

                        <div className="text-xs font-bold text-[#1b2620] mt-1 flex items-center gap-2">
                          <User className="w-3 h-3 text-[#8b978f]" />
                          <span>{order.debtorName || order.customerName}</span>
                          {order.tableNumber && (
                            <span className="text-[#1f4d3e] font-extrabold">• {order.tableNumber}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[#8b978f] mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Completed at {formatClockTime(completionTime)} ({formatTimeAgo(completionTime)})
                          </span>
                          {(order.debtorPhone || order.phone) && (
                            <span>• Tel: {order.debtorPhone || order.phone}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onViewReceipt(order)}
                          className="px-3 py-1.5 rounded-xl border border-[#e2e4dc] hover:bg-[#e3ede8] text-[#143529] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="py-2.5 space-y-1 text-xs text-[#4c5a52]">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            <strong className="text-[#1b2620]">{item.quantity}x</strong> {item.name}
                            {item.variantLabel && ` (${item.variantLabel})`}
                          </span>
                          <span className="font-semibold text-[#1b2620]">
                            {formatCurrency(item.unitPrice * item.quantity, settings.currency)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Debt details alert if on debt */}
                    {isDebt && (
                      <div className="bg-[#f6e2de]/60 border border-[#b3402f]/30 rounded-xl p-2.5 my-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-[#b3402f] shrink-0" />
                          <div className="text-xs">
                            <span className="font-extrabold text-[#8a2c1f]">
                              RECORDED AS UNPAID DEBT:
                            </span>{' '}
                            <span className="text-[#8a2c1f] font-medium">
                              {order.debtNotes || 'Customer promised settlement.'}
                            </span>
                            {order.debtDueDate && (
                              <span className="block text-[10.5px] text-[#b3402f] font-bold mt-0.5">
                                Due date: {new Date(order.debtDueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditingDebtOrder(order)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#b3402f]/40 hover:bg-[#f6e2de] text-[#8a2c1f] text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0 shadow-2xs"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Debt Info</span>
                        </button>
                      </div>
                    )}

                    {/* Status Toggle & Settlement Buttons (OK Paid vs Debt) */}
                    <div className="border-t border-[#e2e4dc]/70 pt-3 flex items-center justify-between gap-3 flex-wrap">
                      {/* Left: Total */}
                      <div className="text-xs">
                        <span className="text-[#8b978f]">Total Amount: </span>
                        <span className="text-base font-extrabold text-[#143529]">
                          {formatCurrency(order.total, settings.currency)}
                        </span>
                      </div>

                      {/* Right: Payment Status Toggle Buttons */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#8b978f] mr-1 hidden sm:inline">
                          Payment:
                        </span>

                        {/* Button 1: OK Paid */}
                        <button
                          type="button"
                          id={`btn-mark-paid-${order.id}`}
                          onClick={() => handleQuickMarkPaid(order)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                            !isDebt
                              ? 'bg-emerald-700 text-white ring-2 ring-emerald-700/40 shadow-xs'
                              : 'bg-white border border-[#e2e4dc] text-[#4c5a52] hover:bg-emerald-50 hover:text-emerald-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>OK Paid</span>
                        </button>

                        {/* Button 2: Debt */}
                        <button
                          type="button"
                          id={`btn-mark-debt-${order.id}`}
                          onClick={() => handleQuickMarkDebt(order)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                            isDebt
                              ? 'bg-[#b3402f] text-white ring-2 ring-[#b3402f]/40 shadow-xs'
                              : 'bg-white border border-[#e2e4dc] text-[#4c5a52] hover:bg-[#f6e2de] hover:text-[#8a2c1f]'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Debt</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          id={`delete-completed-order-${order.id}`}
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Delete completed order record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: DEBTS LEDGER (WEEK & MONTH REPORTS) ================= */}
      {activeSubTab === 'debts_ledger' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Top Actions: Period Filters & Statement Print */}
          <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-sm font-extrabold text-[#1b2620] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#b3402f]" />
                  <span>Weekly & Monthly Debts Accounting</span>
                </h3>
                <p className="text-xs text-[#8b978f]">
                  Track debtor accounts, overdue credit, and generate period statements
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-open-debt-statement"
                  onClick={() => setIsStatementModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Debt Statement</span>
                </button>
              </div>
            </div>

            {/* Period Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'this_week', label: '📅 End of Week (This Week)' },
                { id: 'this_month', label: '📅 End of Month (This Month)' },
                { id: 'last_week', label: 'Last Week' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'all', label: 'All Time' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriodFilter(p.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    periodFilter === p.id
                      ? 'bg-[#b3402f] text-white shadow-xs'
                      : 'bg-[#f4f5f0] text-[#4c5a52] hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards for Debts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#fdf8f6] border border-[#f6e2de] rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-extrabold text-[#b3402f] uppercase tracking-wider block">
                Outstanding Unpaid Debt
              </span>
              <div className="text-2xl font-extrabold text-[#8a2c1f] mt-1">
                {formatCurrency(periodUnpaidTotal, settings.currency)}
              </div>
              <span className="text-[10px] text-[#b3402f] font-semibold mt-0.5 block">
                {periodUnpaidDebts.length} debtor(s) in selected period
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                Recovered / Settled Debt
              </span>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1">
                {formatCurrency(periodSettledTotal, settings.currency)}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                Paid balances in selected period
              </span>
            </div>

            <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-extrabold text-[#4c5a52] uppercase tracking-wider block">
                Total All-Time Debt Volume
              </span>
              <div className="text-2xl font-extrabold text-[#143529] mt-1">
                {formatCurrency(totalOutstandingDebtAllTime, settings.currency)}
              </div>
              <span className="text-[10px] text-[#8b978f] font-semibold mt-0.5 block">
                Across {outstandingDebtsAllTime.length} unpaid tickets
              </span>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b978f]" />
              <input
                type="text"
                id="debts-search-input"
                placeholder="Search debtor name, phone, or order #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#e2e4dc] rounded-xl text-xs placeholder-[#8b978f] focus:outline-none focus:border-[#b3402f]"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#f4f5f0] p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setDebtStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  debtStatusFilter === 'all' ? 'bg-white shadow-xs text-[#1b2620]' : 'text-[#8b978f]'
                }`}
              >
                All ({filteredDebts.length})
              </button>
              <button
                type="button"
                onClick={() => setDebtStatusFilter('unpaid')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  debtStatusFilter === 'unpaid' ? 'bg-[#f6e2de] text-[#8a2c1f] shadow-xs' : 'text-[#8b978f]'
                }`}
              >
                Unpaid Only ({periodUnpaidDebts.length})
              </button>
              <button
                type="button"
                onClick={() => setDebtStatusFilter('settled')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  debtStatusFilter === 'settled' ? 'bg-emerald-100 text-emerald-800 shadow-xs' : 'text-[#8b978f]'
                }`}
              >
                Settled
              </button>
            </div>
          </div>

          {/* List of Debts for End of Week / End of Month */}
          <div className="space-y-3">
            {filteredDebts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e4dc] p-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-[#1b2620]">No debts in this timeframe</p>
                <p className="text-xs text-[#8b978f] mt-1">
                  You have zero outstanding customer debts recorded for the selected period filter.
                </p>
              </div>
            ) : (
              filteredDebts.map((order) => {
                const isUnpaid = order.settlementStatus === 'debt' || order.paymentStatus === 'debt';
                const debtorPhone = order.debtorPhone || order.phone;
                const cleanPhone = (debtorPhone || '').replace(/\s+/g, '');
                const whatsappMessage = encodeURIComponent(
                  `Hello ${order.debtorName || order.customerName}, gentle reminder from ${settings.restaurantName} regarding your pending balance of ${formatCurrency(order.total, settings.currency)} for order ${order.orderNumber}. Thank you!`
                );

                return (
                  <div
                    key={order.id}
                    id={`debt-card-${order.id}`}
                    className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all ${
                      isUnpaid
                        ? 'border-[#b3402f]/40 ring-1 ring-[#b3402f]/20 bg-[#fffdfc]'
                        : 'border-emerald-200 bg-[#fbfdfb]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-[#e2e4dc]/70 pb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-extrabold text-[#143529]">
                            {order.orderNumber}
                          </span>
                          {isUnpaid ? (
                            <span className="text-[10px] font-extrabold text-[#8a2c1f] bg-[#f6e2de] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-[#b3402f]/30">
                              <AlertTriangle className="w-3 h-3 text-[#b3402f]" /> UNPAID DEBT
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> SETTLED / PAID
                            </span>
                          )}
                          <span className="text-[11px] text-[#8b978f]">
                            Incurred {new Date(order.createdAt).toLocaleDateString()} ({formatTimeAgo(order.createdAt)})
                          </span>
                        </div>

                        <div className="text-sm font-extrabold text-[#1b2620] mt-1.5 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-[#b3402f]" />
                          <span>{order.debtorName || order.customerName}</span>
                          {order.tableNumber && (
                            <span className="text-xs text-[#8b978f] font-normal">• {order.tableNumber}</span>
                          )}
                        </div>

                        {debtorPhone && (
                          <div className="text-xs text-[#4c5a52] mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#8b978f]" />
                            <span>Tel: {debtorPhone}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-bold text-[#8b978f] uppercase block">
                          Amount Due
                        </span>
                        <div className={`text-base font-extrabold ${isUnpaid ? 'text-[#b3402f]' : 'text-[#143529]'}`}>
                          {formatCurrency(order.total, settings.currency)}
                        </div>
                      </div>
                    </div>

                    {/* Notes & Due date */}
                    <div className="py-2.5 space-y-1.5 text-xs">
                      {order.debtNotes && (
                        <div className="bg-[#f4f5f0] p-2 rounded-xl text-[#4c5a52]">
                          <strong>Debt Notes:</strong> {order.debtNotes}
                        </div>
                      )}

                      {order.debtDueDate && (
                        <div className="text-[11px] font-semibold text-[#8a2c1f]">
                          📅 Payment Promised Due: {new Date(order.debtDueDate).toLocaleDateString()}
                        </div>
                      )}

                      {/* Items brief */}
                      <div className="text-[11px] text-[#8b978f] pt-1">
                        Items: {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>
                    </div>

                    {/* Bottom Actions Bar */}
                    <div className="border-t border-[#e2e4dc]/70 pt-3 flex items-center justify-between gap-2 flex-wrap">
                      {/* Left: Contact actions */}
                      <div className="flex items-center gap-1.5">
                        {cleanPhone && (
                          <>
                            <a
                              href={`tel:${cleanPhone}`}
                              className="px-2.5 py-1.5 rounded-xl border border-[#e2e4dc] bg-white hover:bg-gray-50 text-[#1b2620] text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Phone className="w-3 h-3 text-[#1f4d3e]" />
                              <span>Call</span>
                            </a>

                            <a
                              href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${whatsappMessage}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/40 hover:bg-[#25D366]/25 text-[#075E54] text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Send className="w-3 h-3 text-[#25D366]" />
                              <span>WhatsApp</span>
                            </a>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => onViewReceipt(order)}
                          className="px-2.5 py-1.5 rounded-xl border border-[#e2e4dc] bg-white hover:bg-gray-50 text-[#4c5a52] text-xs font-bold flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </div>

                      {/* Right: Settle & Edit */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingDebtOrder(order)}
                          className="px-3 py-1.5 rounded-xl border border-[#e2e4dc] bg-white hover:bg-gray-100 text-[#4c5a52] text-xs font-bold flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        {isUnpaid ? (
                          <button
                            type="button"
                            onClick={() => handleQuickMarkPaid(order)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Paid (Settle)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleQuickMarkDebt(order)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#f6e2de] hover:bg-[#ebd0ca] text-[#8a2c1f] border border-[#b3402f]/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Re-open as Debt</span>
                          </button>
                        )}

                        <button
                          type="button"
                          id={`delete-debt-ledger-order-${order.id}`}
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Delete order record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Completed Order */}
      {orderToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620]">
                  Delete Order Record #{orderToDelete.orderNumber}
                </h3>
                <p className="text-xs text-gray-500">
                  {orderToDelete.customerName} {orderToDelete.tableNumber ? `• ${orderToDelete.tableNumber}` : ''}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#fdf8f6] border border-[#f6e2de] rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between items-center text-[#1b2620]">
                <span className="text-[#8b978f]">Total Value:</span>
                <span className="font-extrabold text-sm text-[#b3402f]">
                  {formatCurrency(orderToDelete.total, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#1b2620]">
                <span className="text-[#8b978f]">Items ({orderToDelete.items.length}):</span>
                <span className="font-medium text-gray-700 max-w-[200px] truncate text-right">
                  {orderToDelete.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#1b2620]">
                <span className="text-[#8b978f]">Status:</span>
                <span className="capitalize font-semibold text-gray-700">
                  {orderToDelete.settlementStatus === 'debt' ? 'Debt (Unsettled)' : 'Completed & Settled'}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This order will be moved to the <strong>Trash Bin</strong> and safely stored in a soft-delete state for 30 days before permanent removal. You can click <strong>Undo</strong> on the immediate snackbar or restore it from the Trash Bin anytime.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                id="cancel-delete-completed-btn"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                id="confirm-delete-completed-btn"
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

      {/* Debt Edit / Settlement Modal */}
      <DebtModal
        order={editingDebtOrder}
        settings={settings}
        isOpen={Boolean(editingDebtOrder)}
        onClose={() => setEditingDebtOrder(null)}
        onSaveDebt={handleSaveDebtModal}
      />

      {/* Printable Weekly / Monthly Debt Statement Modal */}
      <DebtStatementModal
        orders={orders}
        settings={settings}
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        defaultPeriod={periodFilter}
      />
    </div>
  );
};
