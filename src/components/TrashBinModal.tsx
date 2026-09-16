import React, { useState, useMemo } from 'react';
import {
  Trash2,
  RotateCcw,
  X,
  Search,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Receipt,
  User,
  Phone,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Order, RestaurantSettings } from '../types';
import { formatCurrency, formatClockTime } from '../utils/formatters';
import { getDaysRemainingInTrash, TRASH_RETENTION_DAYS } from '../utils/storage';

export interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  trashOrders: Order[];
  settings: RestaurantSettings;
  onRestoreOrder: (orderId: string) => void;
  onBatchRestoreOrders: (orderIds: string[]) => void;
  onPermanentDeleteOrder: (orderId: string) => void;
  onEmptyTrash: () => void;
  onViewReceipt: (order: Order) => void;
}

export const TrashBinModal: React.FC<TrashBinModalProps> = ({
  isOpen,
  onClose,
  trashOrders,
  settings,
  onRestoreOrder,
  onBatchRestoreOrders,
  onPermanentDeleteOrder,
  onEmptyTrash,
  onViewReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [orderToPermanentDelete, setOrderToPermanentDelete] = useState<Order | null>(null);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [showRestoreAllConfirm, setShowRestoreAllConfirm] = useState(false);

  const filteredOrders = useMemo(() => {
    let list = [...trashOrders];

    // Sort by deletedAt descending (most recently deleted first)
    list.sort((a, b) => (b.deletedAt || b.createdAt || 0) - (a.deletedAt || a.createdAt || 0));

    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase().trim();
    return list.filter((order) => {
      const numMatch = order.orderNumber.toLowerCase().includes(query);
      const custMatch = order.customerName.toLowerCase().includes(query);
      const tableMatch = order.tableNumber?.toLowerCase().includes(query) || false;
      const phoneMatch = order.phone?.toLowerCase().includes(query) || false;
      const debtorMatch = order.debtorName?.toLowerCase().includes(query) || false;
      return numMatch || custMatch || tableMatch || phoneMatch || debtorMatch;
    });
  }, [trashOrders, searchQuery]);

  const totalTrashValue = useMemo(() => {
    return trashOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [trashOrders]);

  if (!isOpen) return null;

  return (
    <div
      id="trash-bin-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-[#e2e4dc] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e4dc] bg-[#fbfbfa] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#1b2620]">
                  Trash Bin
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[11px]">
                  {trashOrders.length} {trashOrders.length === 1 ? 'order' : 'orders'}
                </span>
              </div>
              <p className="text-xs text-[#5f6f65]">
                Deleted orders are kept here for {TRASH_RETENTION_DAYS} days before permanent removal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {trashOrders.length > 0 && (
              <>
                <button
                  type="button"
                  id="trash-restore-all-btn"
                  onClick={() => setShowRestoreAllConfirm(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Restore all deleted orders"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore All</span>
                </button>

                <button
                  type="button"
                  id="trash-empty-bin-btn"
                  onClick={() => setShowEmptyConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  title="Permanently empty trash bin"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Empty Trash</span>
                  <span className="sm:hidden">Empty</span>
                </button>
              </>
            )}

            <button
              type="button"
              id="close-trash-bin-btn"
              onClick={onClose}
              className="p-2 text-[#8b978f] hover:text-[#1b2620] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              title="Close Trash Bin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational Policy Banner */}
        <div className="bg-[#fcf9f2] border-b border-[#f3ebdb] px-4 py-2.5 flex items-center justify-between text-xs text-[#7d612e] shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>30-Day Soft-Delete Protection:</strong> Restorable anytime. Auto-purges when time expires.
            </span>
          </div>
          <span className="font-extrabold text-[#1b2620] shrink-0 ml-2">
            Total in bin: {formatCurrency(totalTrashValue, settings.currency)}
          </span>
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-[#e2e4dc] bg-white shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b978f]" />
            <input
              type="text"
              id="trash-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer Name, Table Number..."
              className="w-full pl-9 pr-4 py-2 bg-[#f8f9f6] border border-[#e2e4dc] rounded-xl text-xs placeholder-[#8b978f] focus:outline-none focus:border-[#1f4d3e] focus:bg-white"
            />
          </div>
        </div>

        {/* Orders List / Empty State */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f9f6]">
          {filteredOrders.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3 max-w-sm mx-auto">
              <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-base font-extrabold text-[#1b2620]">
                {searchQuery ? 'No matching deleted orders' : 'Trash Bin is empty'}
              </h3>
              <p className="text-xs text-[#5f6f65] leading-relaxed">
                {searchQuery
                  ? `No orders matching "${searchQuery}" found in trash.`
                  : 'Whenever you delete an order from the tickets list or completed records, it is safely stored here for 30 days before permanent deletion.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const daysLeft = getDaysRemainingInTrash(order);
              const deletedDateStr = order.deletedAt
                ? new Date(order.deletedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently';
              const deletedTimeStr = order.deletedAt ? formatClockTime(order.deletedAt) : '';

              return (
                <div
                  key={order.id}
                  id={`trash-order-card-${order.id}`}
                  className="bg-white border border-[#e2e4dc] hover:border-amber-300 rounded-2xl p-4 shadow-xs space-y-3 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[#1b2620]">
                          Order {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            order.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'ready'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'preparing'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Status: {order.status}
                        </span>
                        {order.settlementStatus === 'debt' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            Debt Record
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#5f6f65] mt-1 flex-wrap">
                        <span className="font-semibold text-stone-800">
                          {order.debtorName || order.customerName || 'Walk-in Customer'}
                        </span>
                        {order.tableNumber && (
                          <span>• Table {order.tableNumber}</span>
                        )}
                        {order.phone && (
                          <span>• {order.phone}</span>
                        )}
                        <span>
                          • Total: <strong className="text-[#143529]">{formatCurrency(order.total, settings.currency)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* 30-Day Countdown Badge */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</span>
                      </div>
                      <p className="text-[10px] text-[#8b978f] mt-1">
                        Deleted {deletedDateStr} {deletedTimeStr}
                      </p>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="bg-[#fbfbfa] border border-[#ebece6] rounded-xl p-2.5 text-xs text-[#3b4740]">
                    <span className="font-medium text-[#7a8880]">Items: </span>
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, idx) => (
                        <span key={item.id || idx}>
                          {item.quantity}x {item.name}
                          {item.variantLabel ? ` (${item.variantLabel})` : ''}
                          {idx < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    ) : (
                      <span>No detailed line items</span>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 flex-wrap">
                    <button
                      type="button"
                      id={`view-trash-receipt-${order.id}`}
                      onClick={() => onViewReceipt(order)}
                      className="px-2.5 py-1.5 text-xs text-[#5f6f65] hover:text-[#1b2620] hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id={`restore-trash-order-${order.id}`}
                        onClick={() => onRestoreOrder(order.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        title="Restore order to active list"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Order</span>
                      </button>

                      <button
                        type="button"
                        id={`permanent-delete-trash-order-${order.id}`}
                        onClick={() => setOrderToPermanentDelete(order)}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Delete permanently right now"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Forever</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e2e4dc] bg-white flex items-center justify-between text-xs text-[#5f6f65] shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automatic cleanup runs daily for orders older than 30 days.</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Delete Permanently */}
      {orderToPermanentDelete && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620]">
                  Permanently Delete Order?
                </h3>
                <p className="text-xs text-gray-500">
                  Order #{orderToPermanentDelete.orderNumber} • {orderToPermanentDelete.customerName}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete this order record? This will erase it from both local storage, Firestore, and the database. <strong>This action cannot be undone.</strong>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                id="cancel-permanent-delete-btn"
                onClick={() => setOrderToPermanentDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-permanent-delete-btn"
                onClick={() => {
                  onPermanentDeleteOrder(orderToPermanentDelete.id);
                  setOrderToPermanentDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Empty Entire Trash */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620]">
                  Empty Entire Trash Bin?
                </h3>
                <p className="text-xs text-gray-500">
                  {trashOrders.length} deleted orders will be permanently erased.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This will permanently delete all {trashOrders.length} orders currently in the trash bin immediately without waiting for the 30-day retention period. This action cannot be reversed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                id="cancel-empty-trash-btn"
                onClick={() => setShowEmptyConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-empty-trash-btn"
                onClick={() => {
                  onEmptyTrash();
                  setShowEmptyConfirm(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Empty Trash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Restore All */}
      {showRestoreAllConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1b2620]">
                  Restore All Orders?
                </h3>
                <p className="text-xs text-gray-500">
                  Restore {trashOrders.length} orders back to their active/completed lists.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              All {trashOrders.length} orders in the trash bin will be moved back to the restaurant queues and records.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                id="cancel-restore-all-btn"
                onClick={() => setShowRestoreAllConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-restore-all-btn"
                onClick={() => {
                  onBatchRestoreOrders(trashOrders.map((o) => o.id));
                  setShowRestoreAllConfirm(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore All</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
