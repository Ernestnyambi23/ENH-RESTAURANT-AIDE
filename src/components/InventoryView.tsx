import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  PackageCheck,
  Filter,
  Camera,
  Utensils,
  Image as ImageIcon,
  Sparkles,
  Flame,
  ChefHat,
  Star,
} from 'lucide-react';
import { MenuItem, RestaurantSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface InventoryViewProps {
  items: MenuItem[];
  settings: RestaurantSettings;
  onUpdateStock: (itemId: string, newStock: number) => void;
  onUpdatePrice: (itemId: string, newPrice: number, variantLabel?: string) => void;
  onAddNewItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onEditItem?: (item: MenuItem) => void;
  onChangeDishImage?: (item: MenuItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  settings,
  onUpdateStock,
  onUpdatePrice,
  onAddNewItem,
  onDeleteItem,
  onEditItem,
  onChangeDishImage,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState<boolean>(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPriceValue, setTempPriceValue] = useState<string>('');
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchLowStock = filterLowStockOnly ? item.stock <= 5 : true;
      return matchSearch && matchLowStock;
    });
  }, [items, searchQuery, filterLowStockOnly]);

  const lowStockCount = items.filter((i) => i.stock <= 5).length;
  const outOfStockCount = items.filter((i) => i.stock === 0).length;

  const handleStartEditPrice = (itemId: string, currentPrice: number) => {
    setEditingPriceId(itemId);
    setTempPriceValue(currentPrice.toString());
  };

  const handleSavePrice = (itemId: string, variantLabel?: string) => {
    const parsed = parseInt(tempPriceValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdatePrice(itemId, parsed, variantLabel);
    }
    setEditingPriceId(null);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-[#1b2620] flex items-center gap-2">
              <Boxes className="w-5 h-5 text-[#1f4d3e]" />
              <span>Stock & Menu Inventory</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1f4d3e]/10 text-[#1f4d3e] border border-[#1f4d3e]/20">
              {settings.restaurantName || 'Independent Restaurant'}
            </span>
          </div>
          <p className="text-xs text-[#8b978f]">
            Fully isolated dishes, live stock, and pricing for this restaurant
          </p>
        </div>
        <button
          type="button"
          id="inventory-add-item-btn"
          onClick={onAddNewItem}
          className="px-3.5 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-all shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Dish</span>
        </button>
      </div>

      {/* Stock Health Badges */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
            filterLowStockOnly
              ? 'bg-[#f7e9d6] border-[#c8791f] ring-2 ring-[#c8791f]/40'
              : 'bg-white border-[#e2e4dc]'
          }`}
        >
          <span className="text-[11px] font-bold text-[#8a540f] uppercase tracking-wider block">
            Low Stock Alert (≤5)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[#c8791f]">
              {lowStockCount} items
            </span>
            <span className="text-[11px] font-bold text-[#c8791f] underline">
              {filterLowStockOnly ? 'Show All' : 'Filter View'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#e2e4dc]">
          <span className="text-[11px] font-bold text-[#8b978f] uppercase tracking-wider block">
            Out of Stock
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-[#b3402f]">
              {outOfStockCount} items
            </span>
            <span className="text-[11px] text-[#8b978f]">Auto-disabled</span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b978f]" />
        <input
          type="text"
          id="inventory-search-input"
          placeholder="Search items by name or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#e2e4dc] rounded-xl text-xs placeholder-[#8b978f] focus:outline-none focus:border-[#1f4d3e]"
        />
      </div>

      {/* Inventory Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const hasVariants = Boolean(item.variants && item.variants.length > 0);
          const isLow = item.stock <= 5;
          const isOut = item.stock === 0;

          return (
            <div
              key={item.id}
              id={`inv-row-${item.id}`}
              className={`bg-white border rounded-2xl p-4 transition-all shadow-2xs ${
                isOut
                  ? 'border-red-200 bg-red-50/20'
                  : isLow
                  ? 'border-amber-200'
                  : 'border-[#e2e4dc]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Clickable Dish Image with Edit Photo Indicator */}
                  <div
                    onClick={() => onChangeDishImage ? onChangeDishImage(item) : onEditItem ? onEditItem(item) : undefined}
                    className="relative group w-14 h-14 rounded-2xl overflow-hidden bg-[#e3ede8] border border-[#1f4d3e]/15 flex items-center justify-center shrink-0 cursor-pointer shadow-2xs hover:ring-2 hover:ring-[#1f4d3e] transition-all"
                    title="Click to change dish image"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#1f4d3e] bg-emerald-50">
                        <Utensils className="w-5 h-5 opacity-70" />
                        <span className="text-[9px] font-bold mt-0.5 opacity-60">No Photo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-[#1b2620] truncate">
                        {item.name}
                      </h3>
                      <span className="text-[10px] font-semibold text-[#1f4d3e] bg-[#e3ede8] px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      {item.isChefSpecial && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#f7e9d6] text-[#c8791f]">
                          <ChefHat className="w-2.5 h-2.5" /> Chef Special
                        </span>
                      )}
                      {item.isSpicy && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#f6e2de] text-[#b3402f]">
                          <Flame className="w-2.5 h-2.5" /> Spicy
                        </span>
                      )}
                      {item.isPopular && !item.isChefSpecial && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Popular
                        </span>
                      )}
                    </div>

                    {/* Pricing Display / Inline Price Editor */}
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      {hasVariants ? (
                        <div className="flex items-center gap-1.5 flex-wrap text-xs">
                          {item.variants!.map((v) => (
                            <span
                              key={v.label}
                              className="bg-gray-100 px-2 py-0.5 rounded-md text-[11px] font-semibold text-[#4c5a52]"
                            >
                              {v.label}: <strong className="text-[#143529]">{formatCurrency(v.price, settings.currency)}</strong>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs">
                          {editingPriceId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                value={tempPriceValue}
                                onChange={(e) => setTempPriceValue(e.target.value)}
                                className="w-24 px-2 py-1 text-xs border border-[#1f4d3e] rounded-md font-bold focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSavePrice(item.id)}
                                className="px-2 py-1 bg-[#1f4d3e] text-white text-[10px] font-bold rounded-md"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPriceId(null)}
                                className="px-2 py-1 bg-gray-200 text-[#4c5a52] text-[10px] rounded-md"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[#143529] text-sm">
                                {formatCurrency(item.price || 0, settings.currency)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStartEditPrice(item.id, item.price || 0)}
                                className="text-[#8b978f] hover:text-[#1f4d3e] p-0.5"
                                title="Quick edit price"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Controls */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1.5 bg-[#f4f5f0] p-1 rounded-xl border border-[#e2e4dc]">
                    <button
                      type="button"
                      onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                      className="w-7 h-7 rounded-lg bg-white text-[#143529] font-bold flex items-center justify-center shadow-2xs hover:bg-gray-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span
                      className={`text-xs font-extrabold px-1.5 min-w-[28px] text-center ${
                        isOut ? 'text-[#b3402f]' : isLow ? 'text-[#c8791f]' : 'text-[#143529]'
                      }`}
                    >
                      {item.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateStock(item.id, item.stock + 1)}
                      className="w-7 h-7 rounded-lg bg-[#1f4d3e] text-white font-bold flex items-center justify-center shadow-2xs hover:bg-[#143529]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOut
                        ? 'bg-[#f6e2de] text-[#b3402f]'
                        : isLow
                        ? 'bg-[#f7e9d6] text-[#8a540f]'
                        : 'bg-[#e3ede8] text-[#143529]'
                    }`}
                  >
                    {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
              </div>

              {/* Quick Restock Action Buttons */}
              <div className="mt-3 pt-2 border-t border-[#e2e4dc]/70 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-[#8b978f]">
                  <span>Quick Restock:</span>
                  <button
                    type="button"
                    onClick={() => onUpdateStock(item.id, item.stock + 5)}
                    className="px-2 py-1 rounded-md bg-gray-100 hover:bg-[#e3ede8] text-[#143529] font-bold text-[11px] transition-colors"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStock(item.id, item.stock + 10)}
                    className="px-2 py-1 rounded-md bg-gray-100 hover:bg-[#e3ede8] text-[#143529] font-bold text-[11px] transition-colors"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStock(item.id, item.stock + 25)}
                    className="px-2 py-1 rounded-md bg-gray-100 hover:bg-[#e3ede8] text-[#143529] font-bold text-[11px] transition-colors"
                  >
                    +25
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {onEditItem && (
                    <button
                      type="button"
                      id={`edit-item-btn-${item.id}`}
                      onClick={() => onEditItem(item)}
                      className="px-2.5 py-1 rounded-lg bg-[#e3ede8] hover:bg-[#d0e3db] text-[#143529] text-[11px] font-bold transition-all flex items-center gap-1 border border-[#1f4d3e]/20"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit Dish</span>
                    </button>
                  )}

                  {onChangeDishImage && (
                    <button
                      type="button"
                      id={`change-image-btn-${item.id}`}
                      onClick={() => onChangeDishImage(item)}
                      className="px-2 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#4c5a52] text-[11px] font-bold transition-all flex items-center gap-1"
                      title="Attach or change dish photo"
                    >
                      <Camera className="w-3 h-3 text-[#1f4d3e]" />
                      <span className="hidden sm:inline">Photo</span>
                    </button>
                  )}

                  {item.stock > 0 ? (
                    <button
                      type="button"
                      onClick={() => onUpdateStock(item.id, 0)}
                      className="text-[11px] font-semibold text-[#b3402f] hover:underline"
                    >
                      Mark Out of Stock
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateStock(item.id, 15)}
                      className="text-[11px] font-semibold text-[#1f4d3e] hover:underline"
                    >
                      Restock (15)
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    className="p-1 text-[#8b978f] hover:text-[#b3402f] transition-colors cursor-pointer"
                    title="Delete item from menu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal: Delete Menu Item */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620]">
                  Delete Menu Item
                </h3>
                <p className="text-xs text-gray-500">
                  {itemToDelete.name} ({itemToDelete.category})
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#fdf8f6] border border-[#f6e2de] rounded-2xl text-xs space-y-1.5">
              <div className="flex justify-between items-center text-[#1b2620]">
                <span className="text-[#8b978f]">Price:</span>
                <span className="font-extrabold text-sm text-[#143529]">
                  {formatCurrency(itemToDelete.price, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[#1b2620]">
                <span className="text-[#8b978f]">Current Stock:</span>
                <span className="font-semibold text-gray-700">
                  {itemToDelete.stock} units
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>{itemToDelete.name}</strong> from your menu inventory? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                id="cancel-delete-inventory-item-btn"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-inventory-item-btn"
                onClick={() => {
                  onDeleteItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#b3402f] hover:bg-[#8a2c1f] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
