import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Utensils,
  X,
} from 'lucide-react';
import { Order, RestaurantSettings } from '../types';
import { formatCurrency, formatClockTime } from '../utils/formatters';
import { BrandLogo } from './BrandLogo';

interface OrderConfirmationModalProps {
  order: Order;
  settings: RestaurantSettings;
  onClose: () => void;
  onViewReceipt: (order: Order) => void;
  onTrackOrders: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  settings,
  onClose,
  onViewReceipt,
  onTrackOrders,
}) => {
  useEffect(() => {
    // Fire festive confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#1f4d3e', '#c8791f', '#143529', '#e3ede8', '#ffffff'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#e2e4dc]">
        {/* Top Celebration Card */}
        <div className="bg-[#1f4d3e] text-white p-6 text-center relative overflow-hidden">
          <div className="absolute top-3 right-3">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-center mb-3">
            <div className="relative">
              <BrandLogo size="lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#1f4d3e]">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <span className="text-xs uppercase tracking-widest text-[#cfe0d7] font-extrabold">
            Order Sent to Kitchen
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-0.5">
            {order.orderNumber}
          </h2>
          <p className="text-xs text-[#cfe0d7] mt-1">
            Customer: <span className="font-bold text-white">{order.customerName}</span>
            {order.tableNumber && ` • ${order.tableNumber}`}
          </p>
        </div>

        {/* Order Details & Progress */}
        <div className="p-5 space-y-4">
          {/* Estimated Prep Timer */}
          <div className="bg-[#f7e9d6] border border-[#c8791f]/30 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#c8791f]" />
              <div>
                <p className="text-xs font-bold text-[#8a540f]">Est. Prep Time</p>
                <p className="text-sm font-extrabold text-[#1b2620]">
                  ~{order.estimatedPrepMinutes} mins
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-[#c8791f] text-white px-2.5 py-1 rounded-full">
              Received {formatClockTime(order.createdAt)}
            </span>
          </div>

          {/* Items Summary list */}
          <div className="bg-[#f4f5f0] rounded-2xl p-3.5 space-y-2 border border-[#e2e4dc]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b978f] block">
              Items Ordered ({order.items.reduce((a, b) => a + b.quantity, 0)})
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-[#1b2620]">
                    {item.quantity}x {item.name}
                    {item.variantLabel && ` (${item.variantLabel})`}
                  </span>
                  <span className="font-semibold text-[#4c5a52]">
                    {formatCurrency(item.unitPrice * item.quantity, settings.currency)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#e2e4dc] pt-2 flex justify-between items-baseline">
              <span className="text-xs font-bold text-[#1b2620]">Total Paid / Due</span>
              <span className="text-sm font-extrabold text-[#143529]">
                {formatCurrency(order.total, settings.currency)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              id="view-receipt-btn"
              onClick={() => onViewReceipt(order)}
              className="w-full py-3 rounded-xl border border-[#1f4d3e] text-[#143529] font-bold text-xs hover:bg-[#e3ede8] transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download Thermal Receipt</span>
            </button>

            <button
              type="button"
              id="track-orders-btn"
              onClick={onTrackOrders}
              className="w-full py-3.5 rounded-xl bg-[#1f4d3e] text-white font-extrabold text-xs hover:bg-[#143529] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Track in Kitchen Display</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
