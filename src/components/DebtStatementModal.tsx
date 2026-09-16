import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FileText,
  User,
  Phone,
  Building2,
} from 'lucide-react';
import { Order, RestaurantSettings } from '../types';
import { formatCurrency, formatClockTime } from '../utils/formatters';
import { BrandLogo } from './BrandLogo';

interface DebtStatementModalProps {
  orders: Order[];
  settings: RestaurantSettings;
  isOpen: boolean;
  onClose: () => void;
  defaultPeriod?: 'this_week' | 'this_month' | 'last_week' | 'last_month' | 'all';
}

export const DebtStatementModal: React.FC<DebtStatementModalProps> = ({
  orders,
  settings,
  isOpen,
  onClose,
  defaultPeriod = 'this_week',
}) => {
  if (!isOpen) return null;

  const [period, setPeriod] = useState<'this_week' | 'this_month' | 'last_week' | 'last_month' | 'all'>(
    defaultPeriod
  );
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'settled'>('all');

  // Compute period dates
  const now = new Date();

  const periodLabel = useMemo(() => {
    switch (period) {
      case 'this_week':
        return 'End of Week Debt Statement (Current Week)';
      case 'this_month':
        return `End of Month Debt Statement (${now.toLocaleString('default', { month: 'long', year: 'numeric' })})`;
      case 'last_week':
        return 'Previous Week Debt Summary';
      case 'last_month':
        return 'Previous Month Debt Summary';
      case 'all':
        return 'All-Time Debt & Credit Ledger';
    }
  }, [period, now]);

  // Filter orders by debt status and period
  const debtOrders = useMemo(() => {
    // Start by getting orders that have either settlementStatus === 'debt' or paymentStatus === 'debt' or previously had debt
    const allDebts = orders.filter(
      (o) =>
        o.settlementStatus === 'debt' ||
        o.paymentStatus === 'debt' ||
        o.debtorName ||
        o.debtSettledAt
    );

    const currentTime = Date.now();
    const oneDay = 86400000;

    return allDebts.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const isUnpaid = order.settlementStatus === 'debt' || order.paymentStatus === 'debt';

      // Status filter
      if (filterStatus === 'unpaid' && !isUnpaid) return false;
      if (filterStatus === 'settled' && isUnpaid) return false;

      // Period filter
      if (period === 'all') return true;

      if (period === 'this_week') {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 is Sunday
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfWeek.setHours(0, 0, 0, 0);
        return order.createdAt >= startOfWeek.getTime();
      }

      if (period === 'last_week') {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfThisWeek = new Date(today);
        startOfThisWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfThisWeek.setHours(0, 0, 0, 0);
        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
        return order.createdAt >= startOfLastWeek.getTime() && order.createdAt < startOfThisWeek.getTime();
      }

      if (period === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return order.createdAt >= startOfMonth;
      }

      if (period === 'last_month') {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        return order.createdAt >= startOfLastMonth && order.createdAt < startOfThisMonth;
      }

      return true;
    });
  }, [orders, period, filterStatus, now]);

  // Aggregate metrics
  const totalDebtAmount = debtOrders.reduce((sum, o) => sum + o.total, 0);
  const unpaidOrders = debtOrders.filter(
    (o) => o.settlementStatus === 'debt' || o.paymentStatus === 'debt'
  );
  const unpaidTotal = unpaidOrders.reduce((sum, o) => sum + o.total, 0);
  const settledTotal = totalDebtAmount - unpaidTotal;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    try {
      const rows = [
        ['Order #', 'Debtor Name', 'Phone', 'Date', 'Due Date', 'Status', 'Notes', 'Amount (' + settings.currency + ')'],
        ...debtOrders.map((o) => [
          o.orderNumber,
          o.debtorName || o.customerName,
          o.debtorPhone || o.phone || 'N/A',
          new Date(o.createdAt).toLocaleDateString(),
          o.debtDueDate ? new Date(o.debtDueDate).toLocaleDateString() : 'N/A',
          o.settlementStatus === 'debt' || o.paymentStatus === 'debt' ? 'UNPAID DEBT' : 'SETTLED',
          o.debtNotes || '',
          o.total.toString(),
        ]),
      ];

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Debts_Report_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to export CSV', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e2e4dc] flex flex-col max-h-[94vh]">
        {/* Header Controls */}
        <div className="p-4 bg-[#f4f5f0] border-b border-[#e2e4dc] flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-base font-extrabold text-[#1b2620] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#b3402f]" />
              <span>Debts Statement & Periodic Report</span>
            </h2>
            <p className="text-xs text-[#8b978f]">
              End of week / month debt ledger & customer credit accounting
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl border border-[#e2e4dc] bg-white hover:bg-gray-50 text-[#1b2620] text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#1f4d3e]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Statement</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#e2e4dc] hover:bg-gray-100 flex items-center justify-center text-[#4c5a52] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="p-3 bg-white border-b border-[#e2e4dc] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'this_week', label: '📅 End of Week' },
              { id: 'this_month', label: '📅 End of Month' },
              { id: 'last_week', label: 'Last Week' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'all', label: 'All Time' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  period === p.id
                    ? 'bg-[#b3402f] text-white shadow-xs'
                    : 'bg-[#f4f5f0] text-[#4c5a52] hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#f4f5f0] p-1 rounded-xl shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'all' ? 'bg-white shadow-xs text-[#1b2620]' : 'text-[#8b978f]'
              }`}
            >
              All ({debtOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('unpaid')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                filterStatus === 'unpaid' ? 'bg-[#f6e2de] text-[#8a2c1f] shadow-xs' : 'text-[#8b978f]'
              }`}
            >
              Unpaid ({unpaidOrders.length})
            </button>
          </div>
        </div>

        {/* Printable Statement Document Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6 text-xs" id="printable-debt-statement">
          {/* Statement Header */}
          <div className="border-b-2 border-dashed border-[#1b2620]/40 pb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BrandLogo size="md" />
                <h1 className="text-base font-extrabold uppercase tracking-tight text-[#1b2620]">
                  {settings.restaurantName}
                </h1>
              </div>
              <p className="text-xs font-medium text-[#4c5a52]">{settings.tagline}</p>
              <p className="text-[11px] text-[#8b978f]">{settings.address} • Tel: {settings.phone}</p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block bg-[#f6e2de] text-[#8a2c1f] font-extrabold text-[11px] px-2.5 py-0.5 rounded-full uppercase border border-[#b3402f]/30">
                Official Debts Ledger
              </span>
              <p className="text-[11px] text-[#8b978f]">
                Generated: {new Date().toLocaleDateString()} {formatClockTime(Date.now())}
              </p>
              <p className="text-xs font-bold text-[#1b2620]">{periodLabel}</p>
            </div>
          </div>

          {/* Statement Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#fdf8f6] border border-[#f6e2de] rounded-2xl p-3.5">
              <span className="text-[10.5px] font-extrabold text-[#b3402f] uppercase tracking-wider block">
                Total Unpaid / Outstanding Debt
              </span>
              <div className="text-xl font-extrabold text-[#8a2c1f] mt-1">
                {formatCurrency(unpaidTotal, settings.currency)}
              </div>
              <span className="text-[10px] text-[#b3402f] font-semibold mt-0.5 block">
                {unpaidOrders.length} pending debtor ticket(s)
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5">
              <span className="text-[10.5px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                Total Recovered / Settled
              </span>
              <div className="text-xl font-extrabold text-emerald-900 mt-1">
                {formatCurrency(settledTotal, settings.currency)}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                Cleared debts in selected period
              </span>
            </div>

            <div className="bg-[#f4f5f0] border border-[#e2e4dc] rounded-2xl p-3.5">
              <span className="text-[10.5px] font-extrabold text-[#4c5a52] uppercase tracking-wider block">
                Total Period Credit Volume
              </span>
              <div className="text-xl font-extrabold text-[#143529] mt-1">
                {formatCurrency(totalDebtAmount, settings.currency)}
              </div>
              <span className="text-[10px] text-[#8b978f] font-semibold mt-0.5 block">
                Across {debtOrders.length} recorded credit order(s)
              </span>
            </div>
          </div>

          {/* Detailed Itemized Debts Table */}
          <div>
            <h3 className="text-xs font-extrabold text-[#1b2620] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Itemized Debtor Accounts List</span>
              <span className="text-[11px] font-normal text-[#8b978f]">
                Showing {debtOrders.length} record(s)
              </span>
            </h3>

            {debtOrders.length === 0 ? (
              <div className="p-8 text-center bg-[#f4f5f0] rounded-2xl border border-[#e2e4dc]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-bold text-[#1b2620]">No debts recorded for this period</p>
                <p className="text-xs text-[#8b978f] mt-0.5">
                  All customer tickets in this timeframe are fully settled with zero outstanding credit.
                </p>
              </div>
            ) : (
              <div className="border border-[#e2e4dc] rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f4f5f0] border-b border-[#e2e4dc] text-[10.5px] font-extrabold uppercase text-[#4c5a52]">
                      <th className="py-2.5 px-3">Order #</th>
                      <th className="py-2.5 px-3">Debtor / Customer</th>
                      <th className="py-2.5 px-3">Date Incurred</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Notes / Promise</th>
                      <th className="py-2.5 px-3 text-right">Amount ({settings.currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e4dc]/70 text-xs">
                    {debtOrders.map((ord) => {
                      const isUnpaid = ord.settlementStatus === 'debt' || ord.paymentStatus === 'debt';
                      return (
                        <tr key={ord.id} className={isUnpaid ? 'bg-[#fffaf9]' : 'bg-white'}>
                          <td className="py-2.5 px-3 font-extrabold text-[#143529]">
                            {ord.orderNumber}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-[#1b2620]">
                              {ord.debtorName || ord.customerName}
                            </div>
                            {(ord.debtorPhone || ord.phone) && (
                              <div className="text-[10px] text-[#8b978f]">
                                Tel: {ord.debtorPhone || ord.phone}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[#4c5a52]">
                            <div>{new Date(ord.createdAt).toLocaleDateString()}</div>
                            <div className="text-[10px] text-[#8b978f]">
                              {formatClockTime(ord.createdAt)}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            {isUnpaid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#f6e2de] text-[#8a2c1f] border border-[#b3402f]/30">
                                <AlertTriangle className="w-2.5 h-2.5" /> Unpaid Debt
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Settled
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[#4c5a52] text-[11px] max-w-[200px]">
                            {ord.debtNotes ? (
                              <span className="italic">{ord.debtNotes}</span>
                            ) : (
                              <span className="text-[#8b978f]">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-[#1b2620]">
                            {formatCurrency(ord.total, settings.currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#f4f5f0] border-t-2 border-[#1b2620]/30 font-extrabold text-xs">
                      <td colSpan={5} className="py-3 px-3 uppercase text-[#1b2620]">
                        Total Outstanding Debt for Period:
                      </td>
                      <td className="py-3 px-3 text-right text-sm text-[#b3402f]">
                        {formatCurrency(unpaidTotal, settings.currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Authorization & Sign-off Block */}
          <div className="pt-8 border-t border-dashed border-[#1b2620]/30 grid grid-cols-2 gap-8 text-[11px] text-[#4c5a52]">
            <div>
              <div className="border-b border-gray-400 pb-1 mb-1 font-bold">
                Prepared By (Cashier / Head Waiter):
              </div>
              <p className="text-[10px] text-[#8b978f]">Name & Signature / Date</p>
            </div>
            <div>
              <div className="border-b border-gray-400 pb-1 mb-1 font-bold">
                Verified By (Manager / Owner):
              </div>
              <p className="text-[10px] text-[#8b978f]">{settings.ownerName || 'Restaurant Management'} / Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
