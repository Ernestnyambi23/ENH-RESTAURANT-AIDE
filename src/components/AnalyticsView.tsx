import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  Download,
  Utensils,
  CheckCircle2,
  PieChart,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Order, MenuItem, RestaurantSettings, StaffMember } from '../types';
import { formatCurrency } from '../utils/formatters';
import { DailySalesSummary } from './DailySalesSummary';
import { ReportTimeSelector } from './ReportTimeSelector';

interface AnalyticsViewProps {
  orders: Order[];
  items: MenuItem[];
  settings: RestaurantSettings;
  staffList?: StaffMember[];
  onResetData?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  orders,
  items,
  settings,
  staffList = [],
}) => {
  const [showReportSelector, setShowReportSelector] = useState(false);
  // Aggregate sales metrics
  const {
    totalGrossRevenue,
    completedOrdersCount,
    avgTicketValue,
    topSellers,
    categorySales,
    typeBreakdown,
    unpaidDebtsCount,
    totalOutstandingDebt,
    totalSettledDebt,
  } = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRev = validOrders.reduce((sum, o) => sum + o.total, 0);
    const completed = orders.filter((o) => o.status === 'completed').length;
    const avg = validOrders.length > 0 ? totalRev / validOrders.length : 0;

    // Item popularity map
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number; category: string }>();
    const catMap = new Map<string, number>();
    const typeMap = { dine_in: 0, takeaway: 0, delivery: 0 };

    validOrders.forEach((o) => {
      typeMap[o.orderType] = (typeMap[o.orderType] || 0) + 1;

      o.items.forEach((item) => {
        const existing = itemMap.get(item.menuItemId) || {
          name: item.name,
          quantity: 0,
          revenue: 0,
          category: item.category,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.unitPrice * item.quantity;
        itemMap.set(item.menuItemId, existing);

        const curCat = catMap.get(item.category) || 0;
        catMap.set(item.category, curCat + item.unitPrice * item.quantity);
      });
    });

    const sortedTop = Array.from(itemMap.values()).sort((a, b) => b.quantity - a.quantity);

    // Debt metrics
    const unpaidDebts = orders.filter((o) => o.settlementStatus === 'debt' || o.paymentStatus === 'debt');
    const totalOutstandingDebt = unpaidDebts.reduce((sum, o) => sum + o.total, 0);
    const settledDebts = orders.filter((o) => o.debtSettledAt && (o.settlementStatus === 'paid' || o.paymentStatus === 'paid'));
    const totalSettledDebt = settledDebts.reduce((sum, o) => sum + o.total, 0);

    return {
      totalGrossRevenue: totalRev,
      completedOrdersCount: completed,
      avgTicketValue: avg,
      topSellers: sortedTop.slice(0, 5),
      categorySales: Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]),
      typeBreakdown: typeMap,
      unpaidDebtsCount: unpaidDebts.length,
      totalOutstandingDebt,
      totalSettledDebt,
    };
  }, [orders]);

  const handleExportCSV = () => {
    try {
      const rows = [
        ['Order ID', 'Customer/Debtor', 'Type', 'Status', 'Total', 'Payment Status', 'Debtor Notes', 'Date'],
        ...orders.map((o) => [
          o.orderNumber,
          o.debtorName || o.customerName,
          o.orderType,
          o.status,
          o.total.toString(),
          o.settlementStatus === 'debt' || o.paymentStatus === 'debt' ? 'DEBT (UNPAID)' : 'PAID',
          o.debtNotes || '',
          new Date(o.createdAt).toISOString(),
        ]),
      ];

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `OrderUp_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Failed to export CSV', e);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1b2620] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#1f4d3e]" />
            <span>Sales & Restaurant Analytics</span>
          </h2>
          <p className="text-xs text-[#8b978f]">Performance metrics, top dishes & reports</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="toggle-custom-time-report-btn"
            onClick={() => setShowReportSelector(!showReportSelector)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
              showReportSelector
                ? 'bg-[#1f4d3e] text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-[#1f4d3e] border border-emerald-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Select Time &amp; Report</span>
            {showReportSelector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-white border border-[#e2e4dc] hover:bg-[#e3ede8] text-[#143529] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Expandable Custom Time Range & Report Generator */}
      {showReportSelector && (
        <div className="bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-sm animate-in fade-in slide-in-from-top-2">
          <ReportTimeSelector
            orders={orders}
            items={items}
            staffList={staffList}
            settings={settings}
            inline={true}
          />
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-[#8b978f] uppercase tracking-wider block">
            Gross Sales
          </span>
          <p className="text-xl font-extrabold text-[#143529] mt-1 truncate">
            {formatCurrency(totalGrossRevenue, settings.currency)}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> Live revenue
          </span>
        </div>

        <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-2xs">
          <span className="text-[11px] font-bold text-[#8b978f] uppercase tracking-wider block">
            Total Orders
          </span>
          <p className="text-xl font-extrabold text-[#1b2620] mt-1">
            {orders.length} <span className="text-xs text-[#8b978f] font-normal">({completedOrdersCount} done)</span>
          </p>
          <span className="text-[11px] text-[#4c5a52] font-semibold mt-0.5 block">
            Avg: {formatCurrency(Math.round(avgTicketValue), settings.currency)}
          </span>
        </div>

        <div className="bg-[#fdf8f6] border border-[#f6e2de] rounded-2xl p-4 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-[#b3402f] uppercase tracking-wider block">
            Outstanding Debts
          </span>
          <p className="text-xl font-extrabold text-[#8a2c1f] mt-1 truncate">
            {formatCurrency(totalOutstandingDebt, settings.currency)}
          </p>
          <span className="text-[11px] text-[#b3402f] font-semibold flex items-center gap-1 mt-0.5">
            <span>{unpaidDebtsCount} unpaid debtor account(s)</span>
          </span>
        </div>
      </div>

      {/* Recharts Daily Sales Summary Visualization */}
      <DailySalesSummary orders={orders} settings={settings} />

      {/* Top Selling Dishes Leaderboard */}
      <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-[#1b2620] uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#c8791f]" />
            <span>Top Selling Dishes</span>
          </h3>
          <span className="text-[11px] text-[#8b978f]">By units sold</span>
        </div>

        {topSellers.length === 0 ? (
          <p className="text-xs text-[#8b978f] py-4 text-center">No item sales recorded yet</p>
        ) : (
          <div className="space-y-2">
            {topSellers.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f4f5f0] border border-[#e2e4dc]/70"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
                    idx === 0
                      ? 'bg-[#c8791f] text-white'
                      : idx === 1
                      ? 'bg-[#1f4d3e] text-white'
                      : idx === 2
                      ? 'bg-[#2c4a83] text-white'
                      : 'bg-gray-200 text-[#4c5a52]'
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#1b2620] truncate">{item.name}</h4>
                  <span className="text-[10px] text-[#8b978f]">{item.category}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold text-[#143529]">
                    {item.quantity} sold
                  </span>
                  <span className="text-[10px] text-[#8b978f] block">
                    {formatCurrency(item.revenue, settings.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders By Channel Breakdown */}
      <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-2xs space-y-2.5">
        <h3 className="text-xs font-extrabold text-[#1b2620] uppercase tracking-wider">
          Dining Channel Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#e3ede8] p-2.5 rounded-xl">
            <span className="text-[11px] font-bold text-[#1f4d3e] block">Dine-In</span>
            <span className="text-base font-extrabold text-[#143529] mt-0.5 block">
              {typeBreakdown.dine_in}
            </span>
          </div>
          <div className="bg-[#f7e9d6] p-2.5 rounded-xl">
            <span className="text-[11px] font-bold text-[#8a540f] block">Takeaway</span>
            <span className="text-base font-extrabold text-[#c8791f] mt-0.5 block">
              {typeBreakdown.takeaway}
            </span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-xl">
            <span className="text-[11px] font-bold text-blue-800 block">Delivery</span>
            <span className="text-base font-extrabold text-blue-900 mt-0.5 block">
              {typeBreakdown.delivery}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
