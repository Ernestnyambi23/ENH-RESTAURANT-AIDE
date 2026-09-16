import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  AlertCircle,
  Plus,
  Save,
  CheckCircle2,
  Receipt,
  FileSpreadsheet,
  Zap,
  QrCode,
} from 'lucide-react';
import { Order, Purchase, Capital, MpesaTransaction, RestaurantSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface FinancesViewProps {
  orders: Order[];
  purchases: Purchase[];
  capital: Capital;
  mpesaTransactions: MpesaTransaction[];
  settings: RestaurantSettings;
  onUpdateCapital: (newAmount: number, notes?: string) => void;
  onOpenPurchases: () => void;
  onOpenMpesa: () => void;
  onOpenDebts: () => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  orders,
  purchases,
  capital,
  mpesaTransactions,
  settings,
  onUpdateCapital,
  onOpenPurchases,
  onOpenMpesa,
  onOpenDebts,
}) => {
  const [editingCapital, setEditingCapital] = useState(false);
  const [capitalInput, setCapitalInput] = useState(String(capital.amount));
  const [capitalNotes, setCapitalNotes] = useState(capital.notes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Financial calculations
  const totalRevenue = orders.reduce((sum, ord) => {
    const paid = ord.paidAmount !== undefined ? ord.paidAmount : (ord.isPaid ? ord.total : 0);
    return sum + paid;
  }, 0);

  const totalPurchases = purchases.reduce((sum, p) => sum + (p.totalCost || p.quantity * p.pricePerUnit), 0);

  const totalOutstandingDebt = orders.reduce((sum, ord) => {
    const debt = ord.debtAmount !== undefined ? ord.debtAmount : (ord.isPaid ? 0 : Math.max(0, ord.total - (ord.paidAmount || 0)));
    return sum + debt;
  }, 0);

  const totalMpesa = mpesaTransactions.reduce((sum, m) => sum + m.amount, 0);

  // Net Cash Flow = Capital + Total Paid Revenue - Total Purchases
  const netCashFlow = capital.amount + totalRevenue - totalPurchases;

  const handleSaveCapital = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(capitalInput);
    if (!isNaN(num) && num >= 0) {
      onUpdateCapital(num, capitalNotes);
      setEditingCapital(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2e4dc] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-[#1b2620]">
                Financial Overview & Capital
              </h2>
              <p className="text-xs text-[#4c5a52]">
                Track working capital, paid sales revenue, inventory purchases, and ledger balance for {settings.restaurantName}.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditingCapital(!editingCapital)}
            className="px-4 py-2.5 rounded-2xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <DollarSign className="w-4 h-4" />
            <span>{editingCapital ? 'Cancel Edit' : 'Edit Working Capital'}</span>
          </button>
        </div>
      </div>

      {/* Capital Edit Form */}
      {editingCapital && (
        <form
          onSubmit={handleSaveCapital}
          className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 animate-in slide-in-from-top-2 duration-150 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-700" />
              Adjust Working Capital ({settings.currency})
            </h3>
            <span className="text-xs text-emerald-700">Initial operational funds</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Capital Amount ({settings.currency})
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={capitalInput}
                onChange={(e) => setCapitalInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-2xl text-sm font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                placeholder="e.g. 2500000"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Notes & Allocation Details
              </label>
              <input
                type="text"
                value={capitalNotes}
                onChange={(e) => setCapitalNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-emerald-300 rounded-2xl text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                placeholder="e.g. Village House initial operational capital"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingCapital(false)}
              className="px-4 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-gray-700 hover:bg-emerald-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              Save Capital
            </button>
          </div>
        </form>
      )}

      {savedSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          Working Capital successfully updated and persisted!
        </div>
      )}

      {/* 4-Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Working Capital */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#4c5a52]">Working Capital</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#1b2620]">
            {formatCurrency(capital.amount, settings.currency)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 truncate">
            {capital.notes || 'Operating balance'}
          </div>
        </div>

        {/* Total Paid Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#4c5a52]">Paid Sales Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-800">
            {formatCurrency(totalRevenue, settings.currency)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {orders.length} total orders recorded
          </div>
        </div>

        {/* Total Purchases/Expenses */}
        <div
          onClick={onOpenPurchases}
          className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs cursor-pointer hover:border-amber-400 transition-colors relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#4c5a52]">Purchases & Expenses</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-900">
            {formatCurrency(totalPurchases, settings.currency)}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
            <span>{purchases.length} expense items</span> &rarr;
          </div>
        </div>

        {/* Total Outstanding Debt */}
        <div
          onClick={onOpenDebts}
          className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs cursor-pointer hover:border-red-400 transition-colors relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#4c5a52]">Outstanding Debts</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-red-700">
            {formatCurrency(totalOutstandingDebt, settings.currency)}
          </div>
          <div className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
            <span>View credit tabs</span> &rarr;
          </div>
        </div>
      </div>

      {/* Net Position Banner */}
      <div className="bg-gradient-to-r from-[#1f4d3e] to-[#143529] text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-200">
            Net Operational Balance
          </span>
          <div className="text-2xl md:text-3xl font-black mt-1">
            {formatCurrency(netCashFlow, settings.currency)}
          </div>
          <p className="text-xs text-emerald-100 mt-1">
            Formula: Capital ({formatCurrency(capital.amount, settings.currency)}) + Sales ({formatCurrency(totalRevenue, settings.currency)}) - Purchases ({formatCurrency(totalPurchases, settings.currency)})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMpesa}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-2 border border-white/20"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Mobile Money ({formatCurrency(totalMpesa, settings.currency)})</span>
          </button>
        </div>
      </div>

      {/* Dual Tables: Recent Purchases & Recent M-Pesa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-[#1b2620] flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-600" />
              Recent Inventory Purchases
            </h3>
            <button
              type="button"
              onClick={onOpenPurchases}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Manage All ({purchases.length})
            </button>
          </div>

          <div className="space-y-2">
            {purchases.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs"
              >
                <div>
                  <div className="font-bold text-[#1b2620]">{p.itemName}</div>
                  <div className="text-[11px] text-gray-500">
                    {p.quantity} units @ {formatCurrency(p.pricePerUnit, settings.currency)} • {p.purchaseDate}
                  </div>
                </div>
                <div className="font-extrabold text-amber-900">
                  {formatCurrency(p.totalCost || p.quantity * p.pricePerUnit, settings.currency)}
                </div>
              </div>
            ))}
            {purchases.length === 0 && (
              <div className="text-center py-6 text-xs text-gray-400">No purchases recorded yet.</div>
            )}
          </div>
        </div>

        {/* Recent M-Pesa & Mobile Money Transactions */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-[#1b2620] flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              Cashless &amp; Mobile Money Ledger
            </h3>
            <button
              type="button"
              onClick={onOpenMpesa}
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              View All ({mpesaTransactions.length})
            </button>
          </div>

          <div className="space-y-2">
            {mpesaTransactions.slice(0, 4).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs"
              >
                <div>
                  <div className="font-bold text-emerald-950">{m.customerName || 'Customer'}</div>
                  <div className="text-[11px] text-emerald-700 font-mono">
                    Ref: {m.reference} {m.orderNumber ? `• #${m.orderNumber}` : ''}
                  </div>
                </div>
                <div className="font-extrabold text-emerald-800">
                  {formatCurrency(m.amount, settings.currency)}
                </div>
              </div>
            ))}
            {mpesaTransactions.length === 0 && (
              <div className="text-center py-6 text-xs text-gray-400">No M-Pesa transactions yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
