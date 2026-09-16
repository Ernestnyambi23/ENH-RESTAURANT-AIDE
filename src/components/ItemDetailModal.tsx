import React, { useState } from 'react';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { MenuItem, Variant } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ItemDetailModalProps {
  item: MenuItem | null;
  currency: string;
  onClose: () => void;
  onConfirmAdd: (
    item: MenuItem,
    variant: Variant | undefined,
    quantity: number,
    specialInstructions: string
  ) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  currency,
  onClose,
  onConfirmAdd,
}) => {
  if (!item) return null;

  const defaultVariant = item.variants && item.variants.length > 0 ? item.variants[0] : undefined;
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(defaultVariant);
  const [quantity, setQuantity] = useState<number>(1);
  const [instructions, setInstructions] = useState<string>('');

  const unitPrice = selectedVariant ? selectedVariant.price : item.price || 0;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    onConfirmAdd(item, selectedVariant, quantity, instructions.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 px-5 border-b border-[#e2e4dc] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8b978f] uppercase tracking-wider">
              {item.category}
            </span>
            <h3 className="text-lg font-bold text-[#1b2620] leading-tight">
              {item.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#4c5a52] hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {item.description && (
            <p className="text-sm text-[#4c5a52] leading-relaxed bg-[#f4f5f0] p-3.5 rounded-xl border border-[#e2e4dc]/80">
              {item.description}
            </p>
          )}

          {/* Variant Selector */}
          {item.variants && item.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-[#1b2620] uppercase tracking-wider mb-2">
                Choose Portion / Size <span className="text-[#b3402f]">*</span>
              </label>
              <div className="space-y-2">
                {item.variants.map((v) => {
                  const isSelected = selectedVariant?.label === v.label;
                  return (
                    <button
                      key={v.label}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`w-full p-3.5 rounded-xl flex items-center justify-between border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[#1f4d3e] bg-[#e3ede8]/60 text-[#143529]'
                          : 'border-[#e2e4dc] bg-white text-[#4c5a52] hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-[#1f4d3e] bg-[#1f4d3e] text-white'
                              : 'border-[#8b978f] bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-bold text-sm">{v.label}</span>
                      </div>
                      <span className="font-extrabold text-sm text-[#143529]">
                        {formatCurrency(v.price, currency)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="block text-xs font-bold text-[#1b2620] uppercase tracking-wider mb-1.5">
              Special Instructions / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Extra hot sauce, no onions, well-done crust..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3 border border-[#e2e4dc] rounded-xl text-sm placeholder-[#8b978f] focus:outline-none focus:border-[#1f4d3e] focus:ring-1 focus:ring-[#1f4d3e]"
            />
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-[#1b2620] uppercase tracking-wider">
              Quantity
            </span>
            <div className="flex items-center gap-3 bg-[#e3ede8] p-1.5 rounded-xl border border-[#1f4d3e]/20">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-white text-[#143529] font-bold flex items-center justify-center shadow-xs hover:bg-gray-100 transition-colors disabled:opacity-40"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-base font-extrabold text-[#143529] px-2 min-w-[24px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(item.stock, quantity + 1))}
                className="w-8 h-8 rounded-lg bg-[#1f4d3e] text-white font-bold flex items-center justify-center shadow-xs hover:bg-[#143529] transition-colors disabled:opacity-40"
                disabled={quantity >= item.stock}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Submit */}
        <div className="p-4 px-5 border-t border-[#e2e4dc] bg-gray-50 flex items-center gap-3">
          <button
            type="button"
            id="modal-add-to-cart-btn"
            onClick={handleAdd}
            className="w-full py-3.5 px-4 rounded-xl bg-[#1f4d3e] text-white font-bold text-sm hover:bg-[#143529] transition-colors shadow-sm flex items-center justify-between"
          >
            <span>Add to Order</span>
            <span>{formatCurrency(totalPrice, currency)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
