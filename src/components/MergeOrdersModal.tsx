import React, { useState, useMemo } from 'react';
import {
  GitMerge,
  X,
  AlertTriangle,
  CheckCircle2,
  Utensils,
  Receipt,
  User,
  MapPin,
  Phone,
  FileText,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Order, CartItem, RestaurantSettings, OrderType, PaymentMethod } from '../types';
import { formatCurrency, formatClockTime } from '../utils/formatters';

interface MergeOrdersModalProps {
  isOpen: boolean;
  ordersToMerge: Order[];
  settings: RestaurantSettings;
  onClose: () => void;
  onConfirmMerge: (mergedOrder: Order, sourceOrderIds: string[]) => void;
}

export const MergeOrdersModal: React.FC<MergeOrdersModalProps> = ({
  isOpen,
  ordersToMerge,
  settings,
  onClose,
  onConfirmMerge,
}) => {
  if (!isOpen || ordersToMerge.length < 2) return null;

  // Primary default order (e.g. oldest order)
  const primaryOrder = useMemo(() => {
    return [...ordersToMerge].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))[0];
  }, [ordersToMerge]);

  // Analyze matching table and customer
  const tableNumbers = useMemo(() => {
    return Array.from(new Set(ordersToMerge.map((o) => o.tableNumber?.trim()).filter(Boolean) as string[]));
  }, [ordersToMerge]);

  const customerNames = useMemo(() => {
    return Array.from(new Set(ordersToMerge.map((o) => o.customerName?.trim()).filter(Boolean) as string[]));
  }, [ordersToMerge]);

  const phoneNumbers = useMemo(() => {
    return Array.from(new Set(ordersToMerge.map((o) => o.phone?.trim()).filter(Boolean) as string[]));
  }, [ordersToMerge]);

  const isSameTable = tableNumbers.length === 1 && tableNumbers[0].length > 0;
  const isSameCustomer = customerNames.length === 1 && customerNames[0].length > 0;

  // Form states initialized with smart defaults
  const [targetCustomerName, setTargetCustomerName] = useState<string>(() => {
    return customerNames[0] || primaryOrder.customerName || 'Walk-in Customer';
  });

  const [targetTableNumber, setTargetTableNumber] = useState<string>(() => {
    return tableNumbers[0] || primaryOrder.tableNumber || '';
  });

  const [targetPhone, setTargetPhone] = useState<string>(() => {
    return phoneNumbers[0] || primaryOrder.phone || '';
  });

  const [targetOrderType, setTargetOrderType] = useState<OrderType>(() => {
    // If any order is dine_in, default to dine_in
    if (ordersToMerge.some((o) => o.orderType === 'dine_in')) return 'dine_in';
    if (ordersToMerge.some((o) => o.orderType === 'delivery')) return 'delivery';
    return primaryOrder.orderType || 'takeaway';
  });

  const [combineIdenticalItems, setCombineIdenticalItems] = useState<boolean>(true);

  const [customNotes, setCustomNotes] = useState<string>(() => {
    const existingNotes = ordersToMerge
      .map((o) => o.notes?.trim())
      .filter(Boolean)
      .join('; ');
    const sourceOrderNums = ordersToMerge.map((o) => o.orderNumber).join(', ');
    return existingNotes
      ? `Merged from orders [${sourceOrderNums}]: ${existingNotes}`
      : `Merged from orders: [${sourceOrderNums}]`;
  });

  // Consolidated items calculation
  const consolidatedItems = useMemo<CartItem[]>(() => {
    const allItems: CartItem[] = [];
    ordersToMerge.forEach((order) => {
      order.items.forEach((item) => {
        allItems.push({ ...item });
      });
    });

    if (!combineIdenticalItems) {
      return allItems;
    }

    // Combine identical items (same name, variantLabel, unitPrice)
    const itemMap = new Map<string, CartItem>();

    allItems.forEach((item) => {
      // Key by menuItemId + variantLabel + unitPrice
      const key = `${item.menuItemId || item.name}___${item.variantLabel || ''}___${item.unitPrice}`;
      if (itemMap.has(key)) {
        const existing = itemMap.get(key)!;
        const newQty = existing.quantity + item.quantity;
        const combinedInstructions = [existing.specialInstructions, item.specialInstructions]
          .filter(Boolean)
          .join(', ');

        itemMap.set(key, {
          ...existing,
          quantity: newQty,
          specialInstructions: combinedInstructions || undefined,
        });
      } else {
        itemMap.set(key, { ...item });
      }
    });

    return Array.from(itemMap.values());
  }, [ordersToMerge, combineIdenticalItems]);

  // Financial calculations
  const subtotal = useMemo(() => {
    return consolidatedItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  }, [consolidatedItems]);

  const tax = useMemo(() => {
    if (settings.taxRate && settings.taxRate > 0) {
      return Math.round((subtotal * settings.taxRate) / 100);
    }
    // Alternatively sum up taxes from source orders
    return ordersToMerge.reduce((acc, o) => acc + (o.tax || 0), 0);
  }, [subtotal, settings.taxRate, ordersToMerge]);

  const deliveryFee = useMemo(() => {
    if (targetOrderType !== 'delivery') return 0;
    // Take max delivery fee from source orders or settings
    const maxFee = Math.max(...ordersToMerge.map((o) => o.deliveryFee || 0));
    return maxFee > 0 ? maxFee : settings.defaultDeliveryFee || 0;
  }, [targetOrderType, ordersToMerge, settings.defaultDeliveryFee]);

  const grandTotal = subtotal + tax + deliveryFee;

  const totalPaidAmount = useMemo(() => {
    return ordersToMerge.reduce((acc, o) => {
      if (o.isPaid) return acc + (o.total || 0);
      return acc + (o.paidAmount || 0);
    }, 0);
  }, [ordersToMerge]);

  const outstandingDebt = Math.max(0, grandTotal - totalPaidAmount);
  const isFullyPaid = totalPaidAmount >= grandTotal && grandTotal > 0;

  // Determine master payment method
  const primaryPaymentMethod: PaymentMethod = useMemo(() => {
    const paidOrder = ordersToMerge.find((o) => o.isPaid || (o.paidAmount && o.paidAmount > 0));
    return paidOrder?.paymentMethod || primaryOrder.paymentMethod || 'cash';
  }, [ordersToMerge, primaryOrder]);

  const handleExecuteMerge = () => {
    const sourceOrderIds = ordersToMerge.map((o) => o.id);
    const sourceOrderNumbers = ordersToMerge.map((o) => o.orderNumber);

    // Keep primary order's id and base order number (so order references remain stable)
    // or generate consolidated order
    const mergedOrder: Order = {
      ...primaryOrder,
      orderNumber: primaryOrder.orderNumber,
      customerName: targetCustomerName.trim() || 'Walk-in Customer',
      tableNumber: targetTableNumber.trim() || undefined,
      phone: targetPhone.trim() || undefined,
      orderType: targetOrderType,
      items: consolidatedItems,
      subtotal,
      tax,
      deliveryFee,
      total: grandTotal,
      paidAmount: totalPaidAmount,
      debtAmount: outstandingDebt,
      isPaid: isFullyPaid,
      paymentMethod: primaryPaymentMethod,
      paymentStatus: isFullyPaid ? 'paid' : outstandingDebt > 0 ? 'debt' : 'pending',
      settlementStatus: isFullyPaid ? 'paid' : outstandingDebt > 0 ? 'debt' : 'paid',
      notes: customNotes.trim() || undefined,
      status: ordersToMerge.some((o) => o.status === 'preparing')
        ? 'preparing'
        : ordersToMerge.every((o) => o.status === 'ready')
        ? 'ready'
        : 'pending',
      checkedItemIndices: [],
      isDeleted: false,
      isMerged: true,
      mergedFromOrderNumbers: sourceOrderNumbers,
      mergedFromOrderIds: sourceOrderIds,
      mergedAt: Date.now(),
      updatedAt: Date.now(),
    };

    onConfirmMerge(mergedOrder, sourceOrderIds);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl my-auto overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1f4d3e] to-[#143529] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
              <GitMerge className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <span>Merge Orders into Single Bill</span>
                <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {ordersToMerge.length} Orders
                </span>
              </h3>
              <p className="text-xs text-white/80">
                Consolidate multiple table or customer tickets into one unified bill
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Smart Match Banner */}
          {isSameTable && isSameCustomer ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Verified Match:</strong> All selected orders belong to <strong>Table {tableNumbers[0]}</strong> and customer <strong>{customerNames[0]}</strong>.
              </span>
            </div>
          ) : isSameTable ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Same Table Detected:</strong> All selected orders are for <strong>Table {tableNumbers[0]}</strong>.
              </span>
            </div>
          ) : isSameCustomer ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Same Customer Detected:</strong> All selected orders are placed by <strong>{customerNames[0]}</strong>.
              </span>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Different Table or Customer Detected:</strong>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Selected tickets have differing tables or customer names. Confirm the target billing information below.
                </p>
              </div>
            </div>
          )}

          {/* Selected Orders Pills / Mini Overview */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1f4d3e]" />
              <span>Orders being combined ({ordersToMerge.length})</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ordersToMerge.map((ord) => (
                <div
                  key={ord.id}
                  className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-extrabold text-[#1b2620] flex items-center gap-1.5">
                      <span>#{ord.orderNumber}</span>
                      {ord.tableNumber && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          T: {ord.tableNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {ord.customerName} • {ord.items.length} {ord.items.length === 1 ? 'dish' : 'dishes'}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-[#1f4d3e]">
                      {formatCurrency(ord.total, settings.currency)}
                    </div>
                    <div className="text-[10px] font-semibold text-gray-500">
                      {ord.isPaid ? 'Paid' : 'Unpaid'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consolidated Bill Target Details */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="text-xs font-bold text-[#1b2620] flex items-center gap-1.5 border-b border-stone-200 pb-2">
              <Receipt className="w-4 h-4 text-[#1f4d3e]" />
              <span>Consolidated Bill Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Customer Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span>Customer Name</span>
                </label>
                <input
                  type="text"
                  value={targetCustomerName}
                  onChange={(e) => setTargetCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                  placeholder="e.g. John Doe"
                />
                {customerNames.length > 1 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] text-gray-400">Quick pick:</span>
                    {customerNames.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setTargetCustomerName(name)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Table Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  <span>Table Number</span>
                </label>
                <input
                  type="text"
                  value={targetTableNumber}
                  onChange={(e) => setTargetTableNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                  placeholder="e.g. Table 4"
                />
                {tableNumbers.length > 1 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] text-gray-400">Quick pick:</span>
                    {tableNumbers.map((table) => (
                      <button
                        key={table}
                        type="button"
                        onClick={() => setTargetTableNumber(table)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium"
                      >
                        {table}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-500" />
                  <span>Phone Number (Optional)</span>
                </label>
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                  placeholder="e.g. 0712 345 678"
                />
              </div>

              {/* Order Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-gray-500" />
                  <span>Order Type</span>
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['dine_in', 'takeaway', 'delivery'] as OrderType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTargetOrderType(type)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        targetOrderType === type
                          ? 'bg-[#1f4d3e] text-white'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Consolidated Items Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#1f4d3e]" />
                <span>Combined Bill Items ({consolidatedItems.length} lines)</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={combineIdenticalItems}
                  onChange={(e) => setCombineIdenticalItems(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#1f4d3e] focus:ring-[#1f4d3e]"
                />
                <span className="font-semibold text-[11px]">Combine identical items</span>
              </label>
            </div>

            <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 bg-white">
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                {consolidatedItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-gray-50">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-md bg-[#1f4d3e]/10 text-[#1f4d3e] font-extrabold text-[11px] flex items-center justify-center shrink-0">
                        {item.quantity}×
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 truncate block">
                          {item.name}
                          {item.variantLabel && (
                            <span className="text-[10px] text-gray-500 font-normal ml-1">
                              ({item.variantLabel})
                            </span>
                          )}
                        </span>
                        {item.specialInstructions && (
                          <span className="text-[10px] text-amber-700 italic block truncate">
                            Note: {item.specialInstructions}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-gray-900">
                        {formatCurrency(item.unitPrice * item.quantity, settings.currency)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        @{formatCurrency(item.unitPrice, settings.currency)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill Totals Summary */}
              <div className="p-3 bg-stone-50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal ({consolidatedItems.reduce((acc, i) => acc + i.quantity, 0)} items):</span>
                  <span className="font-semibold">{formatCurrency(subtotal, settings.currency)}</span>
                </div>

                {deliveryFee > 0 && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">{formatCurrency(deliveryFee, settings.currency)}</span>
                  </div>
                )}

                {tax > 0 && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Tax / VAT:</span>
                    <span className="font-semibold">{formatCurrency(tax, settings.currency)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1.5 border-t border-gray-200 text-sm font-extrabold text-[#1b2620]">
                  <span>Consolidated Total:</span>
                  <span className="text-base text-[#1f4d3e]">
                    {formatCurrency(grandTotal, settings.currency)}
                  </span>
                </div>

                {totalPaidAmount > 0 && (
                  <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-800 font-medium">
                    <span>Pre-paid Deposits (Sum from source tickets):</span>
                    <span className="font-bold">-{formatCurrency(totalPaidAmount, settings.currency)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-dashed border-gray-200">
                  <span>Balance Due:</span>
                  <span className={outstandingDebt > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                    {outstandingDebt > 0
                      ? formatCurrency(outstandingDebt, settings.currency)
                      : 'PAID IN FULL'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-500" />
              <span>Bill Notes & Audit Trail</span>
            </label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#1f4d3e]"
              placeholder="Notes for kitchen and cashier..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            id="confirm-merge-orders-btn"
            onClick={handleExecuteMerge}
            className="px-5 py-2.5 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <GitMerge className="w-4 h-4 text-emerald-300" />
            <span>Confirm & Merge into 1 Bill ({formatCurrency(grandTotal, settings.currency)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
