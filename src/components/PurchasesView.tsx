import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  TrendingDown,
  Calendar,
  DollarSign,
  Package,
  Search,
  FileText,
  Filter,
} from 'lucide-react';
import { Purchase, RestaurantSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface PurchasesViewProps {
  purchases: Purchase[];
  settings: RestaurantSettings;
  onAddPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  onDeletePurchase: (id: string) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  settings,
  onAddPurchase,
  onDeletePurchase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<string | null>(null);

  // New Purchase Form state
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const numQty = parseFloat(quantity) || 0;
  const numPrice = parseFloat(pricePerUnit) || 0;
  const calculatedTotal = numQty * numPrice;

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || numQty <= 0 || numPrice <= 0) return;

    onAddPurchase({
      itemName: itemName.trim(),
      quantity: numQty,
      pricePerUnit: numPrice,
      totalCost: calculatedTotal,
      purchaseDate,
      notes: notes.trim() || undefined,
    });

    // Reset form
    setItemName('');
    setQuantity('1');
    setPricePerUnit('');
    setNotes('');
    setShowAddModal(false);
  };

  const filteredPurchases = purchases.filter((p) =>
    p.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalSpent = purchases.reduce((sum, p) => sum + (p.totalCost || p.quantity * p.pricePerUnit), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2e4dc] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-xs">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#1b2620]">
              Purchases & Expense Tracker
            </h2>
            <p className="text-xs text-[#4c5a52]">
              Record raw food inventory, wholesale meat, poultry, drinks, packaging, and operating expenses.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-2xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Purchase</span>
          </button>
        </div>
      </div>

      {/* Expense Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs">
          <div className="text-xs font-bold text-[#4c5a52] mb-1">Total Purchases Expense</div>
          <div className="text-2xl font-black text-amber-900">
            {formatCurrency(totalSpent, settings.currency)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">{purchases.length} total purchase records</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs">
          <div className="text-xs font-bold text-[#4c5a52] mb-1">Average Purchase Cost</div>
          <div className="text-2xl font-black text-[#1b2620]">
            {formatCurrency(purchases.length ? totalSpent / purchases.length : 0, settings.currency)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Per transaction average</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs">
          <div className="text-xs font-bold text-[#4c5a52] mb-1">Stock Procurement Items</div>
          <div className="text-2xl font-black text-emerald-800">
            {purchases.reduce((sum, p) => sum + p.quantity, 0)} Units
          </div>
          <div className="text-[11px] text-gray-500 mt-1">Total bulk volume procured</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#e2e4dc] shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search purchases by item name, ingredient, supplier notes..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#e2e4dc] rounded-2xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#1f4d3e] focus:bg-white"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-3xl border border-[#e2e4dc] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-[#e2e4dc] text-[#4c5a52] font-bold">
              <tr>
                <th className="p-4">Item & Description</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Price / Unit</th>
                <th className="p-4">Total Cost</th>
                <th className="p-4">Purchase Date</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPurchases.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-4 font-bold text-[#1b2620]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <span>{p.itemName}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-gray-700">{p.quantity}</td>
                  <td className="p-4 font-mono text-gray-700">
                    {formatCurrency(p.pricePerUnit, settings.currency)}
                  </td>
                  <td className="p-4 font-bold font-mono text-amber-900">
                    {formatCurrency(p.totalCost || p.quantity * p.pricePerUnit, settings.currency)}
                  </td>
                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{p.purchaseDate}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 italic max-w-xs truncate">
                    {p.notes || '—'}
                  </td>
                  <td className="p-4 text-right">
                    {deletingPurchaseId === p.id ? (
                      <div className="flex items-center justify-end gap-1.5 animate-in fade-in duration-100">
                        <button
                          type="button"
                          onClick={() => {
                            onDeletePurchase(p.id);
                            setDeletingPurchaseId(null);
                          }}
                          className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPurchaseId(null)}
                          className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingPurchaseId(p.id)}
                        className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete purchase"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No purchase records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e4dc] space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-[#1b2620] flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-amber-600" />
                Record New Purchase Expense
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Item / Ingredient Name *</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Mbeya Rice (50kg bag), Fresh Beef 20kg"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-semibold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price per Unit ({settings.currency}) *</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    placeholder="e.g. 9000"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              {/* Calculated Total Live Preview */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <span className="font-bold text-amber-900">Total Purchase Cost:</span>
                <span className="text-base font-black text-amber-950 font-mono">
                  {formatCurrency(calculatedTotal, settings.currency)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Supplier / Batch Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bought from Ifakara Market Stall #14"
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-600"
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
                  className="px-5 py-2 rounded-xl bg-amber-700 text-white font-bold hover:bg-amber-800 shadow-xs"
                >
                  Save Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
