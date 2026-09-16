import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Search,
} from 'lucide-react';
import { ShoppingItem, RestaurantSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  settings: RestaurantSettings;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onTransferToPurchase: (item: ShoppingItem) => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  settings,
  onAddItem,
  onToggleItem,
  onDeleteItem,
  onTransferToPurchase,
}) => {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    onAddItem({
      itemName: itemName.trim(),
      quantity: quantity.trim() || undefined,
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      isBought: false,
    });

    setItemName('');
    setQuantity('');
    setEstimatedPrice('');
  };

  const filteredItems = items.filter((i) =>
    i.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingItems = filteredItems.filter((i) => !i.isBought);
  const boughtItems = filteredItems.filter((i) => i.isBought);

  const totalEstimatedPending = pendingItems.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2e4dc] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#1b2620]">
              Market Shopping & Asset List
            </h2>
            <p className="text-xs text-[#4c5a52]">
              Plan restaurant groceries, market errands, and convert purchased items into expense records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-gray-500 font-bold block">Estimated Pending Cost</span>
            <span className="text-sm font-black text-emerald-800">
              {formatCurrency(totalEstimatedPending, settings.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Add Shopping Item Bar */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-3xl p-4 border border-[#e2e4dc] shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
      >
        <div className="sm:col-span-2">
          <input
            type="text"
            required
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Add shopping item (e.g. 50kg Rice, Cooking oil, Foil wrap)..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-[#e2e4dc] rounded-2xl font-semibold text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1f4d3e]"
          />
        </div>
        <div>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qty (e.g. 2 Crates, 10kg)"
            className="w-full px-4 py-2.5 bg-gray-50 border border-[#e2e4dc] rounded-2xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1f4d3e]"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="500"
            value={estimatedPrice}
            onChange={(e) => setEstimatedPrice(e.target.value)}
            placeholder={`Est. Price (${settings.currency})`}
            className="w-full px-3 py-2.5 bg-gray-50 border border-[#e2e4dc] rounded-2xl text-gray-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1f4d3e]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-[#1f4d3e] text-white font-bold hover:bg-[#143529] flex items-center justify-center shrink-0 shadow-xs"
            title="Add Item to Shopping List"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Dual Columns: To Buy & Bought */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending / To Buy */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-[#1b2620] flex items-center gap-2">
              <Square className="w-4 h-4 text-emerald-700" />
              To Buy ({pendingItems.length})
            </h3>
            <span className="text-xs font-bold text-gray-500">
              Est: {formatCurrency(totalEstimatedPending, settings.currency)}
            </span>
          </div>

          <div className="space-y-2">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 hover:bg-gray-100/70 border border-gray-200/70 transition-colors text-xs"
              >
                <div
                  onClick={() => onToggleItem(item.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <button
                    type="button"
                    className="w-5 h-5 rounded-lg border-2 border-gray-400 hover:border-emerald-600 flex items-center justify-center"
                  >
                    <Square className="w-3.5 h-3.5 text-transparent" />
                  </button>
                  <div>
                    <div className="font-bold text-[#1b2620]">{item.itemName}</div>
                    <div className="text-[11px] text-gray-500">
                      {item.quantity && <span className="font-medium">{item.quantity} • </span>}
                      {item.estimatedPrice ? formatCurrency(item.estimatedPrice, settings.currency) : 'No price set'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onTransferToPurchase(item)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] flex items-center gap-1"
                    title="Mark bought and add directly to Purchases/Expenses"
                  >
                    <span>Bought</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {pendingItems.length === 0 && (
              <div className="text-center py-10 text-xs text-gray-400">
                All shopping items purchased! Add new items above.
              </div>
            )}
          </div>
        </div>

        {/* Bought Items (Asset History) */}
        <div className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-black text-[#1b2620] flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              Purchased & Completed ({boughtItems.length})
            </h3>
          </div>

          <div className="space-y-2">
            {boughtItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 text-xs"
              >
                <div
                  onClick={() => onToggleItem(item.id)}
                  className="flex items-center gap-3 cursor-pointer flex-1 line-through text-gray-500"
                >
                  <div className="w-5 h-5 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <CheckSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">{item.itemName}</div>
                    <div className="text-[11px] text-gray-400">
                      {item.quantity && <span>{item.quantity} • </span>}
                      {item.estimatedPrice && formatCurrency(item.estimatedPrice, settings.currency)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {boughtItems.length === 0 && (
              <div className="text-center py-10 text-xs text-gray-400">
                No completed items yet. Check off items as you buy them.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
