import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Utensils,
  Package,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  AlertCircle,
  ArrowRight,
  Zap,
  QrCode,
} from 'lucide-react';
import { CartItem, OrderType, PaymentMethod, RestaurantSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CartSheetProps {
  cart: CartItem[];
  settings: RestaurantSettings;
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (orderPayload: {
    customerName: string;
    phone: string;
    orderType: OrderType;
    tableNumber?: string;
    deliveryAddress?: string;
    notes?: string;
    paymentMethod: PaymentMethod;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    total: number;
  }) => void;
}

export const CartSheet: React.FC<CartSheetProps> = ({
  cart,
  settings,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
}) => {
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const tax = Math.round(subtotal * settings.taxRate);
  const deliveryFee = orderType === 'delivery' ? settings.defaultDeliveryFee : 0;
  const total = subtotal + tax + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Please enter customer name');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Please enter delivery address');
      return;
    }
    setErrorMsg('');
    onPlaceOrder({
      customerName: customerName.trim(),
      phone: phone.trim(),
      orderType,
      tableNumber: undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      notes: notes.trim() || undefined,
      paymentMethod,
      subtotal,
      tax,
      deliveryFee,
      total,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#f4f5f0] rounded-t-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Handle / Header */}
        <div className="bg-white p-4 px-5 border-b border-[#e2e4dc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e3ede8] flex items-center justify-center text-[#1f4d3e]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1b2620]">Your Order Basket</h3>
              <p className="text-xs text-[#8b978f]">
                {cart.length} unique {cart.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[#4c5a52] hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {cart.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e4dc] p-6">
              <ShoppingBag className="w-12 h-12 text-[#8b978f] mx-auto mb-2 opacity-40" />
              <p className="text-base font-bold text-[#1b2620]">Your basket is empty</p>
              <p className="text-xs text-[#8b978f] mt-1">Browse the delicious menu and add some items</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-5 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold shadow-xs"
              >
                Back to Menu
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#8b978f] uppercase tracking-wider px-1">
                  <span>Selected Items</span>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-[#b3402f] hover:underline normal-case font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-[#e2e4dc] rounded-xl p-3 flex items-center gap-3 shadow-2xs"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#1b2620] truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-[#8b978f] mt-0.5">
                        {item.variantLabel && (
                          <span className="font-semibold text-[#1f4d3e] bg-[#e3ede8] px-1.5 py-0.2 rounded">
                            {item.variantLabel}
                          </span>
                        )}
                        <span>{formatCurrency(item.unitPrice, settings.currency)}</span>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-[11px] text-[#c8791f] bg-[#f7e9d6] px-2 py-0.5 rounded-md mt-1 italic">
                          "{item.specialInstructions}"
                        </p>
                      )}
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1.5 bg-[#f4f5f0] p-1 rounded-lg border border-[#e2e4dc]">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-white text-[#143529] font-bold flex items-center justify-center shadow-2xs hover:bg-gray-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-extrabold text-[#143529] px-1 min-w-[16px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-[#1f4d3e] text-white font-bold flex items-center justify-center shadow-2xs hover:bg-[#143529]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right shrink-0 min-w-[70px]">
                      <span className="text-xs font-extrabold text-[#143529]">
                        {formatCurrency(item.unitPrice * item.quantity, settings.currency)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-[#8b978f] hover:text-[#b3402f] p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Order Options */}
              <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 space-y-3.5">
                <h4 className="text-xs font-bold text-[#1b2620] uppercase tracking-wider">
                  Order Details
                </h4>

                {/* Order Type Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType('dine_in')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border-1.5 transition-all ${
                      orderType === 'dine_in'
                        ? 'border-[#1f4d3e] bg-[#e3ede8] text-[#143529]'
                        : 'border-[#e2e4dc] bg-white text-[#4c5a52] hover:bg-gray-50'
                    }`}
                  >
                    <Utensils className="w-4 h-4" />
                    <span>Dine-In</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border-1.5 transition-all ${
                      orderType === 'takeaway'
                        ? 'border-[#1f4d3e] bg-[#e3ede8] text-[#143529]'
                        : 'border-[#e2e4dc] bg-white text-[#4c5a52] hover:bg-gray-50'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Takeaway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border-1.5 transition-all ${
                      orderType === 'delivery'
                        ? 'border-[#1f4d3e] bg-[#e3ede8] text-[#143529]'
                        : 'border-[#e2e4dc] bg-white text-[#4c5a52] hover:bg-gray-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Delivery</span>
                  </button>
                </div>

                {/* Customer Details Inputs */}
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#4c5a52] mb-1">
                      Customer Name <span className="text-[#b3402f]">*</span>
                    </label>
                    <input
                      type="text"
                      id="cart-customer-name"
                      placeholder="e.g. Kelvin / Grace"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4c5a52] mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      id="cart-customer-phone"
                      placeholder="e.g. +255 713 057 325"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                    />
                  </div>

                  {orderType === 'delivery' && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#4c5a52] mb-1">
                        Delivery Address & Landmark <span className="text-[#b3402f]">*</span>
                      </label>
                      <textarea
                        id="cart-delivery-address"
                        rows={2}
                        placeholder="House #, Street name, Nearest landmark..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#4c5a52] mb-1">
                      Kitchen Notes (Optional)
                    </label>
                    <input
                      type="text"
                      id="cart-kitchen-notes"
                      placeholder="e.g. Serve food all together"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1b2620] uppercase tracking-wider">
                    Payment Method
                  </h4>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Instant Settlement
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border-1.5 transition-all text-left ${
                      paymentMethod === 'cash'
                        ? 'border-[#1f4d3e] bg-[#e3ede8] text-[#143529]'
                        : 'border-[#e2e4dc] bg-white text-[#4c5a52]'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <span className="block font-black">Cash</span>
                      <span className="text-[10px] text-gray-500 font-normal">Pay at counter</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border-1.5 transition-all text-left ${
                      paymentMethod === 'mpesa'
                        ? 'border-[#1f4d3e] bg-[#e3ede8] text-[#143529]'
                        : 'border-[#e2e4dc] bg-white text-[#4c5a52]'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-red-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="block font-black">Auto-Push</span>
                        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      </div>
                      <span className="text-[10px] text-gray-500 font-normal">M-Pesa &amp; Mixx USSD</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tips')}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border-1.5 transition-all text-left ${
                      paymentMethod === 'tips'
                        ? 'border-[#1f4d3e] bg-[#e3ede8] text-[#143529]'
                        : 'border-[#e2e4dc] bg-white text-[#4c5a52]'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <span className="block font-black">Bank TIPS Push</span>
                      <span className="text-[10px] text-gray-500 font-normal">NMB, CRDB &amp; Universal</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 border-1.5 transition-all text-left ${
                      paymentMethod === 'card'
                        ? 'border-[#1f4d3e] bg-[#e3ede8] text-[#143529]'
                        : 'border-[#e2e4dc] bg-white text-[#4c5a52]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-purple-600 shrink-0" />
                    <div>
                      <span className="block font-black">POS Card</span>
                      <span className="text-[10px] text-gray-500 font-normal">Visa / Mastercard</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Cost Summary */}
              <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-[#4c5a52]">
                  <span>Items Subtotal</span>
                  <span className="font-bold">{formatCurrency(subtotal, settings.currency)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-xs text-[#4c5a52]">
                    <span>Delivery Fee</span>
                    <span className="font-bold">{formatCurrency(deliveryFee, settings.currency)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-xs text-[#4c5a52]">
                    <span>VAT ({settings.taxRate * 100}%)</span>
                    <span className="font-bold">{formatCurrency(tax, settings.currency)}</span>
                  </div>
                )}
                <div className="border-t border-[#e2e4dc] pt-2.5 flex justify-between items-baseline">
                  <span className="text-sm font-extrabold text-[#1b2620]">Total Due</span>
                  <span className="text-lg font-extrabold text-[#143529]">
                    {formatCurrency(total, settings.currency)}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-[#f6e2de] text-[#b3402f] text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Place Order CTA */}
        {cart.length > 0 && (
          <div className="p-4 px-5 border-t border-[#e2e4dc] bg-white">
            <button
              type="button"
              id="confirm-place-order-btn"
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-[#1f4d3e] text-white font-extrabold text-sm hover:bg-[#143529] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Confirm & Place Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
