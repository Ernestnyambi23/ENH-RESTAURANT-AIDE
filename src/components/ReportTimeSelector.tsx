import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Download,
  Send,
  FileSpreadsheet,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronDown,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Order, MenuItem, RestaurantSettings, StaffMember } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  ReportTimeFilter,
  downloadMonthlyReportPDF,
  getWhatsAppShareUrl,
  getTimeRangeTimestamps,
  filterOrdersByTimeFilter,
} from '../utils/pdfReport';
import { sound } from '../utils/sound';

interface ReportTimeSelectorProps {
  orders: Order[];
  items: MenuItem[];
  staffList: StaffMember[];
  settings: RestaurantSettings;
  whatsAppNumber?: string;
  onSendEmail?: (filter: ReportTimeFilter) => void;
  inline?: boolean;
  onCloseModal?: () => void;
}

const getTodayDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ReportTimeSelector: React.FC<ReportTimeSelectorProps> = ({
  orders,
  items,
  staffList,
  settings,
  whatsAppNumber,
  onSendEmail,
  inline = true,
  onCloseModal,
}) => {
  const todayStr = useMemo(() => getTodayDateString(), []);

  // Filter state
  const [periodType, setPeriodType] = useState<ReportTimeFilter['periodType']>('this_month');
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('00:00');
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [endTime, setEndTime] = useState<string>('23:59');
  const [toastMessage, setToastMessage] = useState<string>('');

  const currentFilter: ReportTimeFilter = useMemo(() => {
    let label = '';
    if (periodType === 'today') label = `Today (${startDate})`;
    else if (periodType === 'yesterday') label = 'Yesterday';
    else if (periodType === 'this_week') label = 'This Week';
    else if (periodType === 'this_month') label = 'This Month';
    else if (periodType === 'last_month') label = 'Last Month';
    else {
      label = `${startDate} ${startTime} to ${endDate} ${endTime}`;
    }

    return {
      periodType,
      startDate,
      startTime,
      endDate,
      endTime,
      label,
    };
  }, [periodType, startDate, startTime, endDate, endTime]);

  // Compute live statistics for selected time range
  const filteredOrders = useMemo(() => {
    return filterOrdersByTimeFilter(orders, currentFilter);
  }, [orders, currentFilter]);

  const stats = useMemo(() => {
    const valid = filteredOrders.filter((o) => o.status !== 'cancelled');
    const totalRev = valid.reduce((sum, o) => sum + o.total, 0);
    const paidRev = valid
      .filter((o) => o.settlementStatus === 'paid' || o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
    const debtRev = valid
      .filter((o) => o.settlementStatus === 'debt' || o.paymentStatus === 'debt')
      .reduce((sum, o) => sum + o.total, 0);
    return {
      count: valid.length,
      totalRev,
      paidRev,
      debtRev,
    };
  }, [filteredOrders]);

  const handleApplyShift = (sTime: string, eTime: string, sDate?: string, eDate?: string) => {
    setPeriodType('custom');
    setStartTime(sTime);
    setEndTime(eTime);
    if (sDate) setStartDate(sDate);
    if (eDate) setEndDate(eDate);
    sound.playClick();
  };

  const handleDownloadPDF = () => {
    try {
      const fileName = downloadMonthlyReportPDF(orders, items, staffList, settings, currentFilter);
      setToastMessage(`Report PDF downloaded for ${currentFilter.label}`);
      sound.playCash();
      setTimeout(() => setToastMessage(''), 4500);
    } catch (e) {
      console.error('Download PDF error:', e);
    }
  };

  const handleDownloadCSV = () => {
    try {
      const rows = [
        ['Order ID', 'Date & Time', 'Customer/Debtor', 'Type', 'Status', 'Total', 'Payment Status', 'Debt Amount'],
        ...filteredOrders.map((o) => [
          o.orderNumber,
          new Date(o.createdAt).toLocaleString(),
          o.debtorName || o.customerName || 'Walk-in',
          o.orderType,
          o.status,
          o.total.toString(),
          o.settlementStatus === 'debt' || o.paymentStatus === 'debt' ? 'DEBT (UNPAID)' : 'PAID',
          (o.debtAmount || 0).toString(),
        ]),
      ];

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      const safeLabel = currentFilter.label?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'custom_period';
      link.setAttribute('download', `OrderUp_Report_${safeLabel}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToastMessage(`CSV export ready for ${currentFilter.label}`);
      sound.playCash();
      setTimeout(() => setToastMessage(''), 4500);
    } catch (e) {
      console.error('CSV Export Error:', e);
    }
  };

  const handleSendWhatsApp = () => {
    try {
      const waUrl = getWhatsAppShareUrl(orders, items, staffList, settings, whatsAppNumber, currentFilter);
      window.open(waUrl, '_blank');
      setToastMessage(`Report prepared for WhatsApp with selected period!`);
      sound.playNotification();
      setTimeout(() => setToastMessage(''), 4500);
    } catch (e) {
      console.error('WhatsApp share error:', e);
    }
  };

  const handleSendAll = () => {
    handleDownloadPDF();
    handleSendWhatsApp();
    if (onSendEmail) {
      onSendEmail(currentFilter);
    }
  };

  return (
    <div className={`space-y-4 ${inline ? '' : 'p-4 sm:p-6 bg-white rounded-2xl shadow-xl border border-[#e2e4dc]'}`}>
      {/* Title & Presets Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#e2e4dc]">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1f4d3e]" />
            <h4 className="text-xs sm:text-sm font-bold text-[#1b2620]">
              Report Time Selection &amp; Custom Range
            </h4>
          </div>
          <p className="text-2xs sm:text-xs text-[#8b978f] mt-0.5">
            Choose standard intervals or define specific hours and dates for report download &amp; dispatch.
          </p>
        </div>

        {/* Preset Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#f4f5f0] rounded-xl border border-[#e2e4dc]">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'custom', label: 'Custom Time...' },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              type="button"
              id={`report-preset-${preset.id}`}
              onClick={() => {
                setPeriodType(preset.id);
                sound.playClick();
              }}
              className={`px-2.5 py-1 text-2xs font-extrabold rounded-lg transition-all cursor-pointer ${
                periodType === preset.id
                  ? 'bg-[#1f4d3e] text-white shadow-xs'
                  : 'text-[#4c5a52] hover:text-[#1b2620]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Specific Date & Time Picker Controls */}
      {periodType === 'custom' && (
        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold text-[#1f4d3e] uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3 h-3" />
              Specify Exact Dates &amp; Specific Times
            </span>
            <span className="text-2xs text-[#4c5a52]">24-Hour Format</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Start Window */}
            <div className="space-y-1">
              <label className="text-2xs font-bold text-[#1b2620] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#1f4d3e]" />
                <span>Start Date &amp; Time</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  id="report-custom-start-date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-[#c4cfc8] bg-white font-mono text-[#1b2620]"
                />
                <input
                  type="time"
                  id="report-custom-start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-[#c4cfc8] bg-white font-mono text-[#1b2620]"
                />
              </div>
            </div>

            {/* End Window */}
            <div className="space-y-1">
              <label className="text-2xs font-bold text-[#1b2620] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#1f4d3e]" />
                <span>End Date &amp; Time</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  id="report-custom-end-date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-[#c4cfc8] bg-white font-mono text-[#1b2620]"
                />
                <input
                  type="time"
                  id="report-custom-end-time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="px-2 py-1.5 text-xs rounded-lg border border-[#c4cfc8] bg-white font-mono text-[#1b2620]"
                />
              </div>
            </div>
          </div>

          {/* Quick Shift Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-2xs text-[#4c5a52] font-semibold">Quick Shift Times:</span>
            <button
              type="button"
              onClick={() => handleApplyShift('06:00', '14:00')}
              className="px-2 py-0.5 rounded-md bg-white border border-[#c4cfc8] text-2xs text-[#1b2620] hover:bg-emerald-100/50"
            >
              Morning (06:00 - 14:00)
            </button>
            <button
              type="button"
              onClick={() => handleApplyShift('14:00', '22:00')}
              className="px-2 py-0.5 rounded-md bg-white border border-[#c4cfc8] text-2xs text-[#1b2620] hover:bg-emerald-100/50"
            >
              Evening (14:00 - 22:00)
            </button>
            <button
              type="button"
              onClick={() => handleApplyShift('18:00', '03:00')}
              className="px-2 py-0.5 rounded-md bg-white border border-[#c4cfc8] text-2xs text-[#1b2620] hover:bg-emerald-100/50"
            >
              Night / Bar (18:00 - 03:00)
            </button>
            <button
              type="button"
              onClick={() => handleApplyShift('00:00', '23:59')}
              className="px-2 py-0.5 rounded-md bg-white border border-[#c4cfc8] text-2xs text-[#1b2620] hover:bg-emerald-100/50"
            >
              Full 24h (00:00 - 23:59)
            </button>
          </div>
        </div>
      )}

      {/* Live Statistics for Chosen Period */}
      <div className="p-3 bg-[#fafbfa] rounded-xl border border-[#e2e4dc] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-extrabold text-[#4c5a52] uppercase">Period Scope:</span>
            <span className="text-xs font-bold text-[#1f4d3e] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {currentFilter.label}
            </span>
          </div>
          <p className="text-2xs text-[#8b978f]">
            {stats.count} valid order transactions recorded during this specific window.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div>
            <div className="text-2xs text-[#8b978f] uppercase font-bold">Window Revenue</div>
            <div className="font-extrabold text-[#1b2620]">
              {formatCurrency(stats.totalRev, settings.currency)}
            </div>
          </div>
          <div className="h-6 w-px bg-[#e2e4dc]" />
          <div>
            <div className="text-2xs text-emerald-700 uppercase font-bold">Settled / Paid</div>
            <div className="font-extrabold text-emerald-700">
              {formatCurrency(stats.paidRev, settings.currency)}
            </div>
          </div>
          <div className="h-6 w-px bg-[#e2e4dc]" />
          <div>
            <div className="text-2xs text-amber-700 uppercase font-bold">On Tab / Debt</div>
            <div className="font-extrabold text-amber-700">
              {formatCurrency(stats.debtRev, settings.currency)}
            </div>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Action Buttons: Download PDF, Export CSV, WhatsApp, Send All */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <button
          type="button"
          id="report-action-download-pdf"
          onClick={handleDownloadPDF}
          className="px-3 py-2 rounded-xl bg-white border border-[#e2e4dc] hover:bg-[#fafbfa] text-[#1b2620] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#1f4d3e]" />
          <span>Download PDF</span>
        </button>

        <button
          type="button"
          id="report-action-export-csv"
          onClick={handleDownloadCSV}
          className="px-3 py-2 rounded-xl bg-white border border-[#e2e4dc] hover:bg-[#fafbfa] text-[#1b2620] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
          <span>Export CSV</span>
        </button>

        <button
          type="button"
          id="report-action-whatsapp"
          onClick={handleSendWhatsApp}
          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Send WhatsApp</span>
        </button>

        <button
          type="button"
          id="report-action-send-now"
          onClick={handleSendAll}
          className="px-3 py-2 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Generate &amp; Send</span>
        </button>
      </div>
    </div>
  );
};
