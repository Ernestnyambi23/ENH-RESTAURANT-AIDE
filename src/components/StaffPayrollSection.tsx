import React, { useState, useEffect } from 'react';
import {
  StaffMember,
  RestaurantSettings,
  StaffPayrollRecord,
} from '../types';
import {
  Sparkles,
  Calendar,
  DollarSign,
  Download,
  FileCode,
  CheckCircle2,
  Copy,
  Clock,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface StaffPayrollSectionProps {
  staffList: StaffMember[];
  settings: RestaurantSettings;
  onUpdateStaff?: (staff: StaffMember) => void;
  onToggleStaffSalaryPaid?: (staffId: string) => void;
}

const APPS_SCRIPT_CODE = `/**
 * Calculates staff payroll with dynamic calendar-month daily rate deductions
 * using the Google Gen AI API via Google AI Studio.
 */

const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your Gemini API Key

function calculatePayrollForSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  
  // Start from row 2 (skipping headers)
  for (let row = 2; row <= lastRow; row++) {
    const staffName = sheet.getRange(row, 1).getValue();
    const monthlyGrossSalary = sheet.getRange(row, 2).getValue();
    const daysAbsent = sheet.getRange(row, 3).getValue();
    const month = sheet.getRange(row, 4).getValue();
    const year = sheet.getRange(row, 5).getValue();

    // Skip empty rows
    if (!staffName || !monthlyGrossSalary || daysAbsent === "" || !month || !year) {
      continue;
    }

    // Call Gemini API to calculate payroll
    const result = callGeminiPayrollApi(staffName, monthlyGrossSalary, daysAbsent, month, year);

    if (result) {
      // Write calculated values back into Columns F, G, H
      sheet.getRange(row, 6).setValue(result.calculatedDailyRate);
      sheet.getRange(row, 7).setValue(result.totalDeduction);
      sheet.getRange(row, 8).setValue(result.netPayableSalary);
    }
  }
}

function callGeminiPayrollApi(staffName, monthlyGrossSalary, daysAbsent, month, year) {
  // Dynamically get exact calendar days in the specified month
  const totalDaysInMonth = new Date(year, month, 0).getDate();

  const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${GEMINI_API_KEY}\`;

  // Structured JSON Schema for enforcement
  const payload = {
    contents: [
      {
        parts: [
          {
            text: \`
              Calculate staff payroll deductions strictly based on calendar-month flow:
              - Staff Name: \${staffName}
              - Monthly Gross Salary: \${monthlyGrossSalary}
              - Days Absent: \${daysAbsent}
              - Target Month: \${month}/\${year}
              - Total Days in Month: \${totalDaysInMonth}

              Rules:
              1. Daily Rate = Monthly Gross Salary / \${totalDaysInMonth}
              2. Total Deduction = Daily Rate * Days Absent
              3. Net Payable Salary = Monthly Gross Salary - Total Deduction
              4. Return values rounded to 2 decimal places.
            \`
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          calculatedDailyRate: { type: "NUMBER" },
          totalDeduction: { type: "NUMBER" },
          netPayableSalary: { type: "NUMBER" }
        },
        required: ["calculatedDailyRate", "totalDeduction", "netPayableSalary"]
      },
      temperature: 0.1
    }
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    
    if (json.candidates && json.candidates[0].content.parts[0].text) {
      return JSON.parse(json.candidates[0].content.parts[0].text);
    } else {
      Logger.log("API Error: " + response.getContentText());
      return null;
    }
  } catch (error) {
    Logger.log("Execution Error: " + error.toString());
    return null;
  }
}`;

export const StaffPayrollSection: React.FC<StaffPayrollSectionProps> = ({
  staffList,
  settings,
  onToggleStaffSalaryPaid,
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [daysAbsentMap, setDaysAbsentMap] = useState<Record<string, number>>({});
  const [payrollRecords, setPayrollRecords] = useState<Record<string, StaffPayrollRecord>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activePayslip, setActivePayslip] = useState<StaffPayrollRecord | null>(null);

  // Exact calendar days in chosen month (year, month, 0)
  const totalDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper calculation function
  const computeLocalRecord = (staff: StaffMember, daysAbsent: number): StaffPayrollRecord => {
    const gross = staff.agreedSalary || 0;
    const absent = Math.max(0, Math.min(totalDaysInMonth, daysAbsent || 0));
    const dailyRate = Number((gross / totalDaysInMonth).toFixed(2));
    const totalDeduction = Number((dailyRate * absent).toFixed(2));
    const netPayable = Number((gross - totalDeduction).toFixed(2));

    return {
      staffId: staff.id,
      staffName: staff.name,
      roleTitle: staff.roleTitle,
      monthlyGrossSalary: gross,
      daysAbsent: absent,
      month: selectedMonth,
      year: selectedYear,
      totalDaysInMonth,
      calculatedDailyRate: dailyRate,
      totalDeduction,
      netPayableSalary: netPayable,
      status: staff.salaryPaymentStatus === 'paid' ? 'paid' : 'pending',
    };
  };

  // Initialize or update records on month/staff changes
  useEffect(() => {
    const initialRecords: Record<string, StaffPayrollRecord> = {};
    staffList.forEach((staff) => {
      const absent = daysAbsentMap[staff.id] || 0;
      initialRecords[staff.id] = computeLocalRecord(staff, absent);
    });
    setPayrollRecords(initialRecords);
  }, [selectedMonth, selectedYear, staffList]);

  // Handle absent days change
  const handleAbsentChange = (staffId: string, value: number) => {
    const safeVal = Math.max(0, Math.min(totalDaysInMonth, value));
    setDaysAbsentMap((prev) => ({ ...prev, [staffId]: safeVal }));
    const staff = staffList.find((s) => s.id === staffId);
    if (staff) {
      const updated = computeLocalRecord(staff, safeVal);
      setPayrollRecords((prev) => ({ ...prev, [staffId]: updated }));
    }
  };

  // Trigger AI Calculation via server API
  const handleCalculateWithAI = async () => {
    setIsCalculating(true);
    try {
      const items = staffList.map((staff) => ({
        staffId: staff.id,
        staffName: staff.name,
        monthlyGrossSalary: staff.agreedSalary || 0,
        daysAbsent: daysAbsentMap[staff.id] || 0,
        month: selectedMonth,
        year: selectedYear,
      }));

      const res = await fetch('/api/payroll/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          month: selectedMonth,
          year: selectedYear,
        }),
      });

      if (!res.ok) {
        throw new Error('API server returned error');
      }

      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        const newRecords: Record<string, StaffPayrollRecord> = {};
        data.results.forEach((item: any) => {
          if (item.staffId) {
            const staff = staffList.find((s) => s.id === item.staffId);
            newRecords[item.staffId] = {
              staffId: item.staffId,
              staffName: item.staffName,
              roleTitle: staff?.roleTitle,
              monthlyGrossSalary: item.monthlyGrossSalary,
              daysAbsent: item.daysAbsent,
              month: item.month,
              year: item.year,
              totalDaysInMonth: item.totalDaysInMonth,
              calculatedDailyRate: item.calculatedDailyRate,
              totalDeduction: item.totalDeduction,
              netPayableSalary: item.netPayableSalary,
              calculatedByAi: item.calculatedByAi,
              status: staff?.salaryPaymentStatus === 'paid' ? 'paid' : 'pending',
            };
          }
        });
        setPayrollRecords(newRecords);
      }
    } catch (err) {
      console.warn('AI calculation fallback to local formula:', err);
      // Fallback already calculated locally
    } finally {
      setIsCalculating(false);
    }
  };

  // Export CSV matching Google Sheets Apps Script layout
  const handleExportCSV = () => {
    const headers = [
      'Staff Name',
      'Monthly Gross Salary (TZS)',
      'Days Absent',
      'Month',
      'Year',
      'Calculated Daily Rate (TZS)',
      'Total Deduction (TZS)',
      'Net Payable Salary (TZS)',
    ];

    const rows = staffList.map((staff) => {
      const rec = payrollRecords[staff.id] || computeLocalRecord(staff, daysAbsentMap[staff.id] || 0);
      return [
        `"${rec.staffName.replace(/"/g, '""')}"`,
        rec.monthlyGrossSalary,
        rec.daysAbsent,
        rec.month,
        rec.year,
        rec.calculatedDailyRate.toFixed(2),
        rec.totalDeduction.toFixed(2),
        rec.netPayableSalary.toFixed(2),
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Payroll_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy code handler
  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Download .gs file
  const handleDownloadGsFile = () => {
    const blob = new Blob([APPS_SCRIPT_CODE], { type: 'text/javascript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'calculatePayrollForSheet.gs';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Totals
  const totalGross = staffList.reduce((sum, s) => sum + (s.agreedSalary || 0), 0);
  const totalDeductions = (Object.values(payrollRecords) as StaffPayrollRecord[]).reduce(
    (sum, r) => sum + (r.totalDeduction || 0),
    0
  );
  const totalNet = totalGross - totalDeductions;

  return (
    <div className="space-y-4 pt-2">
      {/* Top Banner & AI Explanation */}
      <div className="bg-linear-to-r from-emerald-900 to-[#143529] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 border border-emerald-400/30">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                Google Gen AI • AI Studio
              </div>
              <span className="text-xs text-emerald-200/80 font-mono">
                {monthNames[selectedMonth - 1]} {selectedYear} ({totalDaysInMonth} Days)
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Dynamic Calendar-Month Payroll & Deductions
            </h3>
            <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed">
              Calculates exact daily salary rates based on calendar-month length ({totalDaysInMonth} days), automatically deducting absent days with Google Gen AI verification.
            </p>
          </div>

          {/* Quick Actions & Month Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-white/15 rounded-xl p-1 border border-white/20">
              <select
                id="payroll-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-white text-xs font-bold px-2.5 py-1.5 focus:outline-none cursor-pointer rounded-lg hover:bg-white/10 transition-all"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1} className="text-gray-900 bg-white">
                    {name}
                  </option>
                ))}
              </select>
              <select
                id="payroll-year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-white text-xs font-bold px-2 py-1.5 focus:outline-none cursor-pointer rounded-lg hover:bg-white/10 transition-all border-l border-white/20"
              >
                {[selectedYear - 1, selectedYear, selectedYear + 1].map((y) => (
                  <option key={y} value={y} className="text-gray-900 bg-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              id="payroll-run-ai-btn"
              onClick={handleCalculateWithAI}
              disabled={isCalculating || staffList.length === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isCalculating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isCalculating ? 'Calculating AI...' : 'Calculate with AI'}</span>
            </button>

            <button
              type="button"
              id="payroll-apps-script-btn"
              onClick={() => setIsScriptModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
              title="Google Sheets Apps Script Integration"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-300" />
              <span>Google Sheets Script</span>
            </button>

            <button
              type="button"
              id="payroll-export-csv-btn"
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
              title="Export to CSV / Sheets"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-emerald-800/60 text-xs">
          <div className="bg-black/20 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Calendar Days</span>
            <span className="text-sm font-black">{totalDaysInMonth} Days ({monthNames[selectedMonth - 1]})</span>
          </div>
          <div className="bg-black/20 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Total Gross</span>
            <span className="text-sm font-black">{formatCurrency(totalGross, settings.currency)}</span>
          </div>
          <div className="bg-black/20 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-red-300 uppercase block font-semibold">Absent Deductions</span>
            <span className="text-sm font-black text-red-300">-{formatCurrency(totalDeductions, settings.currency)}</span>
          </div>
          <div className="bg-black/20 p-2 rounded-xl border border-white/5">
            <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Net Payable</span>
            <span className="text-sm font-black text-emerald-300">{formatCurrency(totalNet, settings.currency)}</span>
          </div>
        </div>
      </div>

      {/* Staff Payroll Cards & Calculations List */}
      <div className="space-y-3">
        {staffList.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#e2e4dc] rounded-2xl text-gray-500 space-y-2">
            <AlertCircle className="w-8 h-8 mx-auto text-gray-400" />
            <p className="text-sm font-bold text-gray-700">No staff members registered yet</p>
            <p className="text-xs text-gray-500">Add employees using the "Add New Staff Member" button above to calculate payroll.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {staffList.map((staff) => {
              const rec = payrollRecords[staff.id] || computeLocalRecord(staff, daysAbsentMap[staff.id] || 0);
              const absent = daysAbsentMap[staff.id] || 0;

              return (
                <div
                  key={staff.id}
                  className="bg-white border border-[#e2e4dc] hover:border-emerald-700/40 rounded-2xl p-4 shadow-2xs transition-all space-y-3"
                >
                  {/* Top Line: Staff Info & Quick Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm flex items-center justify-center border border-emerald-200">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-[#1b2620]">{staff.name}</h4>
                          <span className="text-[10px] font-bold bg-[#f4f5f0] text-[#4c5a52] px-2 py-0.5 rounded-md">
                            {staff.roleTitle}
                          </span>
                          {rec.calculatedByAi && (
                            <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 border border-emerald-300">
                              <Sparkles className="w-2.5 h-2.5" />
                              AI Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Gross: <strong>{formatCurrency(staff.agreedSalary, settings.currency)}/mo</strong> • Base Rate: <strong>{formatCurrency(rec.calculatedDailyRate, settings.currency)}/day</strong> ({totalDaysInMonth}d)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePayslip(rec)}
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all flex items-center gap-1"
                        title="Print / View Payslip"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Payslip</span>
                      </button>

                      {onToggleStaffSalaryPaid && (
                        <button
                          type="button"
                          onClick={() => onToggleStaffSalaryPaid(staff.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            staff.salaryPaymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                          }`}
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>{staff.salaryPaymentStatus === 'paid' ? 'Paid' : 'Mark Paid'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Calculations Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-center bg-[#fafbfa] p-3 rounded-xl border border-gray-200 text-xs">
                    {/* Absence Controls */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase block">
                        Days Absent ({monthNames[selectedMonth - 1]})
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAbsentChange(staff.id, absent - 1)}
                          disabled={absent <= 0}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 font-black text-xs disabled:opacity-40 transition-all flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={totalDaysInMonth}
                          value={absent}
                          onChange={(e) => handleAbsentChange(staff.id, parseInt(e.target.value) || 0)}
                          className="w-14 text-center font-black text-sm bg-white border border-gray-300 rounded-lg py-1 focus:outline-none focus:border-emerald-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleAbsentChange(staff.id, absent + 1)}
                          disabled={absent >= totalDaysInMonth}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 font-black text-xs disabled:opacity-40 transition-all flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Daily Rate */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">
                        Daily Rate
                      </span>
                      <p className="font-extrabold text-[#1b2620]">
                        {formatCurrency(rec.calculatedDailyRate, settings.currency)}
                      </p>
                      <span className="text-[10px] text-gray-400 block">
                        (Gross ÷ {totalDaysInMonth} days)
                      </span>
                    </div>

                    {/* Total Deduction */}
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block">
                        Total Deduction
                      </span>
                      <p className="font-extrabold text-red-600">
                        -{formatCurrency(rec.totalDeduction, settings.currency)}
                      </p>
                      <span className="text-[10px] text-gray-400 block">
                        ({absent} days absent × daily rate)
                      </span>
                    </div>

                    {/* Net Payable Salary */}
                    <div className="space-y-0.5 sm:text-right bg-emerald-50 sm:bg-transparent p-2 sm:p-0 rounded-lg border sm:border-0 border-emerald-200">
                      <span className="text-[10px] font-black text-emerald-900 sm:text-gray-500 uppercase block">
                        Net Payable Salary
                      </span>
                      <p className="text-base font-black text-emerald-900 font-mono">
                        {formatCurrency(rec.netPayableSalary, settings.currency)}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-medium block">
                        {rec.daysAbsent > 0 ? `${rec.daysAbsent}d deducted` : 'Full Salary (0 absences)'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Google Sheets Apps Script Modal */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-3xl w-full border border-gray-200 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#1b2620]">
                    Google Sheets Apps Script Integration
                  </h3>
                  <p className="text-xs text-gray-500">
                    Google Gen AI (Gemini 2.5/3.7) dynamic calendar-month payroll calculator script
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScriptModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Instructions */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <p className="font-extrabold flex items-center gap-1 text-emerald-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                How to install in Google Sheets:
              </p>
              <ol className="list-decimal list-inside text-emerald-900/90 space-y-0.5 pl-1 text-[11px]">
                <li>Open your Staff Payroll Google Sheet.</li>
                <li>Ensure columns are: <strong>A: Staff Name, B: Monthly Gross, C: Days Absent, D: Month (1-12), E: Year</strong>.</li>
                <li>Go to <strong>Extensions &gt; Apps Script</strong> in Google Sheets.</li>
                <li>Paste the script below, replace <code className="bg-white px-1 py-0.5 rounded font-mono">YOUR_GEMINI_API_KEY</code>, save, and run <code className="bg-white px-1 py-0.5 rounded font-mono">calculatePayrollForSheet()</code>.</li>
              </ol>
            </div>

            {/* Code Box */}
            <div className="relative flex-1 overflow-hidden rounded-2xl border border-gray-300 bg-gray-950 text-emerald-400 font-mono text-xs p-4 overflow-y-auto max-h-80">
              <pre className="whitespace-pre">{APPS_SCRIPT_CODE}</pre>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200 text-xs">
              <span className="text-gray-500 font-medium text-[11px]">
                Target Columns F, G, H will receive Calculated Daily Rate, Total Deduction, &amp; Net Salary.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadGsFile}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .gs</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Apps Script</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Payslip Voucher Modal */}
      {activePayslip && (
        <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-gray-200 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest block">
                  Staff Payslip Voucher
                </span>
                <h3 className="text-base font-black text-[#1b2620]">
                  {settings.restaurantName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePayslip(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Employee Name:</span>
                <span className="font-extrabold text-gray-900">{activePayslip.staffName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Designation / Role:</span>
                <span className="font-bold text-gray-700">{activePayslip.roleTitle || 'Staff Member'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payroll Month:</span>
                <span className="font-bold text-gray-900">
                  {monthNames[activePayslip.month - 1]} {activePayslip.year} ({activePayslip.totalDaysInMonth} Days)
                </span>
              </div>
              <div className="border-t border-dashed border-gray-300 pt-2 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Gross Salary:</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(activePayslip.monthlyGrossSalary, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 text-[11px]">
                  <span>Daily Rate (Gross ÷ {activePayslip.totalDaysInMonth}d):</span>
                  <span className="font-mono">
                    {formatCurrency(activePayslip.calculatedDailyRate, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Absent Deductions ({activePayslip.daysAbsent} days):</span>
                  <span className="font-mono font-bold">
                    -{formatCurrency(activePayslip.totalDeduction, settings.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-emerald-900 pt-2 border-t border-gray-300">
                  <span>NET PAYABLE SALARY:</span>
                  <span className="font-mono">
                    {formatCurrency(activePayslip.netPayableSalary, settings.currency)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 text-center italic">
              Payment authorized by {settings.ownerName || 'Management'} • Tel: {settings.phone}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#1f4d3e] text-white font-bold text-xs hover:bg-[#143529] transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Voucher</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePayslip(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold text-xs hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
