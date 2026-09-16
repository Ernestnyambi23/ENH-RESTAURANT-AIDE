import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingBag,
  ArrowUpRight,
  BarChart3,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Order, RestaurantSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface DailySalesSummaryProps {
  orders: Order[];
  settings: RestaurantSettings;
  className?: string;
}

interface DayData {
  dayKey: string;
  shortLabel: string;
  dateFormatted: string;
  label: string;
  revenue: number;
  paidRevenue: number;
  debtRevenue: number;
  orderCount: number;
  isToday: boolean;
}

export const DailySalesSummary: React.FC<DailySalesSummaryProps> = ({
  orders,
  settings,
  className = '',
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [activeMetric, setActiveMetric] = useState<'all' | 'paid_vs_debt'>('all');

  // Compute 7 days of the current week (Monday through Sunday)
  const { weekData, weekTotal, avgDaily, peakDay, weekOrderCount, todayData } = useMemo(() => {
    const now = new Date();
    
    // Determine Monday of current week
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, ...
    const distanceToMonday = (currentDay + 6) % 7; // days since Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const validOrders = orders.filter((o) => o.status !== 'cancelled');

    const days: DayData[] = Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      const dayStart = new Date(dayDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = validOrders.filter(
        (o) => o.createdAt >= dayStart.getTime() && o.createdAt <= dayEnd.getTime()
      );

      const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      const paidRevenue = dayOrders
        .filter((o) => o.settlementStatus === 'paid' || o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.total, 0);
      const debtRevenue = dayOrders
        .filter((o) => o.settlementStatus === 'debt' || o.paymentStatus === 'debt')
        .reduce((sum, o) => sum + o.total, 0);

      const isToday =
        now.getFullYear() === dayDate.getFullYear() &&
        now.getMonth() === dayDate.getMonth() &&
        now.getDate() === dayDate.getDate();

      const shortLabel = daysOfWeek[i];
      const dateFormatted = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      return {
        dayKey: shortLabel,
        shortLabel,
        dateFormatted,
        label: `${shortLabel} (${dateFormatted})`,
        revenue,
        paidRevenue,
        debtRevenue,
        orderCount: dayOrders.length,
        isToday,
      };
    });

    const total = days.reduce((sum, d) => sum + d.revenue, 0);
    const orderCount = days.reduce((sum, d) => sum + d.orderCount, 0);
    const avg = total / 7;

    let maxDay = days[0];
    for (const d of days) {
      if (d.revenue > maxDay.revenue) {
        maxDay = d;
      }
    }

    const today = days.find((d) => d.isToday) || days[days.length - 1];

    return {
      weekData: days,
      weekTotal: total,
      avgDaily: avg,
      peakDay: maxDay,
      weekOrderCount: orderCount,
      todayData: today,
    };
  }, [orders]);

  // Format currency helper for chart axes
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}k`;
    }
    return `${value}`;
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DayData = payload[0].payload;
      return (
        <div className="bg-[#143529] text-white p-3 rounded-xl shadow-xl border border-emerald-700/50 text-xs space-y-1.5 min-w-[170px]">
          <div className="flex items-center justify-between gap-2 border-b border-emerald-800/60 pb-1.5">
            <span className="font-bold text-emerald-200">{data.label}</span>
            {data.isToday && (
              <span className="bg-emerald-400/20 text-emerald-300 font-extrabold text-[9px] px-1.5 py-0.2 rounded-full uppercase">
                Today
              </span>
            )}
          </div>
          
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-center text-sm font-extrabold text-white">
              <span>Total Revenue:</span>
              <span className="text-emerald-300">{formatCurrency(data.revenue, settings.currency)}</span>
            </div>
            
            <div className="flex justify-between items-center text-[#cfe0d7] text-[11px]">
              <span>Orders:</span>
              <span className="font-bold text-white">{data.orderCount} order{data.orderCount !== 1 ? 's' : ''}</span>
            </div>

            {activeMetric === 'paid_vs_debt' && (
              <>
                <div className="flex justify-between items-center text-emerald-400 text-[10px] pt-1 border-t border-emerald-900">
                  <span>Paid Settled:</span>
                  <span>{formatCurrency(data.paidRevenue, settings.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-amber-300 text-[10px]">
                  <span>On Debt / Tab:</span>
                  <span>{formatCurrency(data.debtRevenue, settings.currency)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 ${className}`}>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1f4d3e]/10 text-[#1f4d3e] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#1b2620] tracking-tight">
                Daily Sales Summary
              </h3>
              <p className="text-xs text-[#8b978f]">
                Total revenue trends for the current week (Monday – Sunday)
              </p>
            </div>
          </div>
        </div>

        {/* Visualization & metric toggles */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Metric breakdown toggle */}
          <div className="bg-[#f4f5f0] p-1 rounded-xl border border-[#e2e4dc] flex items-center text-[11px] font-bold text-[#4c5a52]">
            <button
              type="button"
              onClick={() => setActiveMetric('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeMetric === 'all'
                  ? 'bg-white text-[#143529] shadow-xs'
                  : 'hover:text-[#1b2620]'
              }`}
            >
              Total Sales
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('paid_vs_debt')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeMetric === 'paid_vs_debt'
                  ? 'bg-white text-[#143529] shadow-xs'
                  : 'hover:text-[#1b2620]'
              }`}
            >
              Paid vs Debt
            </button>
          </div>

          {/* Chart type toggle */}
          <div className="bg-[#f4f5f0] p-1 rounded-xl border border-[#e2e4dc] flex items-center text-[11px] font-bold text-[#4c5a52]">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                chartType === 'area'
                  ? 'bg-white text-[#143529] shadow-xs'
                  : 'hover:text-[#1b2620]'
              }`}
              title="Area Trend Chart"
            >
              <Activity className="w-3 h-3" />
              <span className="hidden xs:inline">Trend</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                chartType === 'bar'
                  ? 'bg-white text-[#143529] shadow-xs'
                  : 'hover:text-[#1b2620]'
              }`}
              title="Bar Chart Breakdown"
            >
              <BarChart3 className="w-3 h-3" />
              <span className="hidden xs:inline">Bars</span>
            </button>
          </div>
        </div>
      </div>

      {/* Week Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#f7faf8] border border-emerald-100 rounded-xl p-3">
          <span className="text-[10px] font-bold text-[#1f4d3e] uppercase tracking-wider block">
            This Week Total
          </span>
          <p className="text-base sm:text-lg font-extrabold text-[#143529] mt-0.5 truncate">
            {formatCurrency(weekTotal, settings.currency)}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
            {weekOrderCount} orders this week
          </span>
        </div>

        <div className="bg-[#fcfdfd] border border-[#e2e4dc] rounded-xl p-3">
          <span className="text-[10px] font-bold text-[#8b978f] uppercase tracking-wider block">
            Daily Average
          </span>
          <p className="text-base sm:text-lg font-extrabold text-[#1b2620] mt-0.5 truncate">
            {formatCurrency(Math.round(avgDaily), settings.currency)}
          </p>
          <span className="text-[10px] text-[#4c5a52] font-medium mt-0.5 block">
            Across 7 days
          </span>
        </div>

        <div className="bg-[#fcfdfd] border border-[#e2e4dc] rounded-xl p-3">
          <span className="text-[10px] font-bold text-[#8b978f] uppercase tracking-wider block">
            Peak Sales Day
          </span>
          <p className="text-base sm:text-lg font-extrabold text-[#c8791f] mt-0.5 truncate">
            {peakDay.revenue > 0 ? peakDay.shortLabel : '—'}
          </p>
          <span className="text-[10px] text-[#8a540f] font-medium mt-0.5 block truncate">
            {peakDay.revenue > 0 ? formatCurrency(peakDay.revenue, settings.currency) : 'No sales recorded'}
          </span>
        </div>

        <div className="bg-[#fcfdfd] border border-[#e2e4dc] rounded-xl p-3">
          <span className="text-[10px] font-bold text-[#8b978f] uppercase tracking-wider block">
            Today's Sales
          </span>
          <p className="text-base sm:text-lg font-extrabold text-[#1f4d3e] mt-0.5 truncate">
            {formatCurrency(todayData.revenue, settings.currency)}
          </p>
          <span className="text-[10px] text-[#4c5a52] font-medium mt-0.5 block">
            {todayData.orderCount} order{todayData.orderCount !== 1 ? 's' : ''} today
          </span>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={weekData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1f4d3e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1f4d3e" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0ea" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                stroke="#8b978f"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e4dc' }}
                tick={({ x, y, payload }) => {
                  const day = weekData.find((d) => d.shortLabel === payload.value);
                  const isToday = day?.isToday;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={14}
                        textAnchor="middle"
                        fill={isToday ? '#1f4d3e' : '#64746b'}
                        fontWeight={isToday ? '800' : '500'}
                        fontSize={11}
                      >
                        {payload.value}
                      </text>
                      {isToday && (
                        <circle cx={0} cy={22} r={2} fill="#1f4d3e" />
                      )}
                    </g>
                  );
                }}
              />
              <YAxis
                stroke="#8b978f"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              {activeMetric === 'all' ? (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1f4d3e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Total Revenue"
                  dot={{ r: 4, fill: '#1f4d3e', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#143529', stroke: '#a7f3d0', strokeWidth: 3 }}
                />
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="paidRevenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorPaid)"
                    name="Paid Revenue"
                    dot={{ r: 3, fill: '#10b981' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="debtRevenue"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDebt)"
                    name="Debt Revenue"
                    dot={{ r: 3, fill: '#f59e0b' }}
                  />
                </>
              )}
            </AreaChart>
          ) : (
            <BarChart data={weekData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0ea" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                stroke="#8b978f"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e4dc' }}
                tick={({ x, y, payload }) => {
                  const day = weekData.find((d) => d.shortLabel === payload.value);
                  const isToday = day?.isToday;
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text
                        x={0}
                        y={0}
                        dy={14}
                        textAnchor="middle"
                        fill={isToday ? '#1f4d3e' : '#64746b'}
                        fontWeight={isToday ? '800' : '500'}
                        fontSize={11}
                      >
                        {payload.value}
                      </text>
                      {isToday && (
                        <circle cx={0} cy={22} r={2} fill="#1f4d3e" />
                      )}
                    </g>
                  );
                }}
              />
              <YAxis
                stroke="#8b978f"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxis}
              />
              <Tooltip content={<CustomTooltip />} />
              {activeMetric === 'all' ? (
                <Bar
                  dataKey="revenue"
                  fill="#1f4d3e"
                  radius={[6, 6, 0, 0]}
                  name="Total Revenue"
                />
              ) : (
                <>
                  <Bar
                    dataKey="paidRevenue"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    name="Paid Revenue"
                    stackId="salesStack"
                  />
                  <Bar
                    dataKey="debtRevenue"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                    name="Debt Revenue"
                    stackId="salesStack"
                  />
                </>
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Week Day-by-Day breakdown mini-list */}
      <div className="pt-2 border-t border-[#e2e4dc]/70">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-[#8b978f] uppercase tracking-wider">
            Daily Performance Breakdown
          </span>
          <span className="text-[11px] text-[#8b978f]">
            Currency: <strong className="text-[#1b2620]">{settings.currency}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-7 gap-1.5">
          {weekData.map((d) => {
            const maxRev = peakDay.revenue > 0 ? peakDay.revenue : 1;
            const percentOfPeak = Math.round((d.revenue / maxRev) * 100);

            return (
              <div
                key={d.dayKey}
                className={`p-2.5 rounded-xl border transition-all ${
                  d.isToday
                    ? 'bg-[#e3ede8]/60 border-[#1f4d3e]/40 ring-1 ring-[#1f4d3e]/20'
                    : 'bg-[#fafbfa] border-[#e2e4dc]/80'
                }`}
              >
                <div className="flex sm:flex-col justify-between items-center sm:items-start gap-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        d.isToday ? 'text-[#143529]' : 'text-[#4c5a52]'
                      }`}
                    >
                      {d.shortLabel}
                    </span>
                    {d.isToday && (
                      <span className="text-[9px] font-black uppercase bg-[#1f4d3e] text-white px-1.5 py-0.2 rounded-full">
                        Today
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8b978f] block">{d.dateFormatted}</span>
                </div>

                <div className="mt-1.5">
                  <span className="text-xs font-extrabold text-[#1b2620] block truncate">
                    {formatCurrency(d.revenue, settings.currency)}
                  </span>
                  <span className="text-[10px] text-[#8b978f] block">
                    {d.orderCount} order{d.orderCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Progress bar visual indicator */}
                <div className="w-full bg-[#e2e4dc] h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      d.isToday ? 'bg-[#1f4d3e]' : 'bg-[#4c5a52]'
                    }`}
                    style={{ width: `${Math.max(percentOfPeak, 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
