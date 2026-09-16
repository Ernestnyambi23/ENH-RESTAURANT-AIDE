import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Hash,
  FileText,
} from 'lucide-react';
import { MpesaTransaction, RestaurantSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MpesaViewProps {
  transactions: MpesaTransaction[];
  settings: RestaurantSettings;
  onAddTransaction: (tx: Omit<MpesaTransaction, 'id' | 'createdAt'>) => void;
}

export const MpesaView: React.FC<MpesaViewProps> = ({
  transactions,
  settings,
  onAddTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Transaction State
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !reference.trim()) return;

    onAddTransaction({
      amount: num,
      reference: reference.trim().toUpperCase(),
      customerName: customerName.trim() || undefined,
      orderNumber: orderNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setAmount('');
    setReference('');
    setCustomerName('');
    setOrderNumber('');
    setNotes('');
    setShowAddModal(false);
  };

  const filtered = transactions.filter((t) => {
    const s = searchTerm.toLowerCase();
    return (
      t.reference.toLowerCase().includes(s) ||
      (t.customerName && t.customerName.toLowerCase().includes(s)) ||
      (t.orderNumber && t.orderNumber.toLowerCase().includes(s))
    );
  });

  const totalMpesa = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2e4dc] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#1b2620]">
              Vodacom M-Pesa Mobile Money Ledger
            </h2>
            <p className="text-xs text-[#4c5a52]">
              Track cashless mobile money collections, reference codes, and customer payment verifications for {settings.restaurantName}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-2xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record M-Pesa Payment</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs">
          <div className="text-xs font-bold text-[#4c5a52] mb-1">Total M-Pesa Collected</div>
          <div className="text-2xl font-black text-emerald-800">
            {formatCurrency(totalMpesa, settings.currency)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">{transactions.length} cashless transactions</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs">
          <div className="text-xs font-bold text-[#4c5a52] mb-1">Average M-Pesa Ticket</div>
          <div className="text-2xl font-black text-[#1b2620]">
            {formatCurrency(transactions.length ? totalMpesa / transactions.length : 0, settings.currency)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Per transaction average</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs">
          <div className="text-xs font-bold text-[#4c5a52] mb-1">Till / Paybill Status</div>
          <div className="text-sm font-black text-emerald-700 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Till Active & Ready</span>
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Lipa Kwa M-Pesa verified</div>
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
            placeholder="Search by M-Pesa Reference code (e.g. QWE12345), customer name, or order #..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#e2e4dc] rounded-2xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#1f4d3e] focus:bg-white"
          />
        </div>
      </div>

      {/* M-Pesa Ledger Table */}
      <div className="bg-white rounded-3xl border border-[#e2e4dc] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-[#e2e4dc] text-[#4c5a52] font-bold">
              <tr>
                <th className="p-4">Reference Code</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Order #</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="p-4 font-mono font-bold text-emerald-950">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-extrabold">
                      {t.reference}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">{t.customerName || 'Walk-in'}</td>
                  <td className="p-4 text-gray-600 font-mono">{t.orderNumber ? `#${t.orderNumber}` : '—'}</td>
                  <td className="p-4 font-bold font-mono text-emerald-800 text-sm">
                    {formatCurrency(t.amount, settings.currency)}
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4 text-gray-500 italic max-w-xs truncate">{t.notes || '—'}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No M-Pesa transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add M-Pesa Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e4dc] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#1b2620] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Record M-Pesa Payment
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">M-Pesa Reference Code *</label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. QWE123XYZ9"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono uppercase font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Amount Received ({settings.currency}) *
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ernest"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Order #</label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. 1001"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Dinner settlement via Lipa Namba"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-bold hover:bg-emerald-800 shadow-xs"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
