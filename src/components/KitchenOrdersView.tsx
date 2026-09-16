import React, { useState, useMemo } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Printer,
  Plus,
  Play,
  Check,
  XCircle,
  Bell,
  Utensils,
  Truck,
  Package,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus, RestaurantSettings } from '../types';
import { formatCurrency, formatTimeAgo, formatClockTime, isOrderOverdue } from '../utils/formatters';

interface KitchenOrdersViewProps {
  orders: Order[];
  settings: RestaurantSettings;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onViewReceipt: (order: Order) => void;
  onCreateWalkInOrder: () => void;
}

export const KitchenOrdersView: React.FC<KitchenOrdersViewProps> = ({
  orders,
  settings,
  onUpdateOrderStatus,
  onViewReceipt,
  onCreateWalkInOrder,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      let matchStatus = true;
      if (selectedStatus === 'active') {
        matchStatus = order.status === 'pending' || order.status === 'preparing' || order.status === 'ready';
      } else if (selectedStatus !== 'all') {
        matchStatus = order.status === selectedStatus;
      }

      // Search filter
      const matchSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.phone && order.phone.includes(searchQuery)) ||
        (order.tableNumber && order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchStatus && matchSearch;
    });
  }, [orders, selectedStatus, searchQuery]);

  // Count active stats
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const overdueCount = orders.filter((o) =>
    isOrderOverdue(o.createdAt, o.status, settings.overdueThresholdMinutes)
  ).length;

  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#f7e9d6] text-[#8a540f] border border-[#c8791f]/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c8791f] animate-ping" />
            Pending (New)
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#dde6f5] text-[#2c4a83] border border-[#2c4a83]/20 flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5" />
            In Kitchen
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#e3ede8] text-[#143529] border border-[#1f4d3e]/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Ready for Pickup
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-[#8b978f]">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f6e2de] text-[#8a2c1f]">
            Cancelled
          </span>
        );
    }
  };

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case 'dine_in':
        return <Utensils className="w-3.5 h-3.5 text-[#1f4d3e]" />;
      case 'takeaway':
        return <Package className="w-3.5 h-3.5 text-[#c8791f]" />;
      case 'delivery':
        return <Truck className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header & Quick Walk-in */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#1b2620] flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-[#1f4d3e]" />
            <span>Kitchen & Cashier Orders</span>
          </h2>
          <p className="text-xs text-[#8b978f]">
            Real-time ticket display and status management
          </p>
        </div>
        <button
          type="button"
          id="kitchen-new-order-btn"
          onClick={onCreateWalkInOrder}
          className="px-3.5 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-all shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New POS Order</span>
        </button>
      </div>

      {/* Overdue Warning Banner */}
      {overdueCount > 0 && (
        <div className="p-3 bg-[#f6e2de] border border-[#b3402f]/40 rounded-2xl flex items-center justify-between text-[#8a2c1f]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#b3402f]" />
            <span className="text-xs font-bold">
              {overdueCount} {overdueCount === 1 ? 'order is' : 'orders are'} past target prep time ({settings.overdueThresholdMinutes}m)!
            </span>
          </div>
          <span className="text-[11px] font-extrabold uppercase bg-[#b3402f] text-white px-2 py-0.5 rounded-md">
            Priority
          </span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b978f]" />
        <input
          type="text"
          id="orders-search-input"
          placeholder="Filter by Order #, Customer, Phone, or Table..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-[#e2e4dc] rounded-xl text-xs placeholder-[#8b978f] focus:outline-none focus:border-[#1f4d3e]"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedStatus('active')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedStatus === 'active'
              ? 'bg-[#1f4d3e] text-white shadow-xs'
              : 'bg-white text-[#4c5a52] border border-[#e2e4dc]'
          }`}
        >
          Active ({pendingCount + preparingCount + readyCount})
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('pending')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            selectedStatus === 'pending'
              ? 'bg-[#c8791f] text-white'
              : 'bg-white text-[#4c5a52] border border-[#e2e4dc]'
          }`}
        >
          <span>Pending</span>
          {pendingCount > 0 && (
            <span className="bg-white text-[#c8791f] text-[10px] font-extrabold px-1.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('preparing')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            selectedStatus === 'preparing'
              ? 'bg-[#2c4a83] text-white'
              : 'bg-white text-[#4c5a52] border border-[#e2e4dc]'
          }`}
        >
          <span>Preparing</span>
          {preparingCount > 0 && (
            <span className="bg-white text-[#2c4a83] text-[10px] font-extrabold px-1.5 rounded-full">
              {preparingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('ready')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            selectedStatus === 'ready'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-[#4c5a52] border border-[#e2e4dc]'
          }`}
        >
          <span>Ready</span>
          {readyCount > 0 && (
            <span className="bg-white text-emerald-800 text-[10px] font-extrabold px-1.5 rounded-full">
              {readyCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('completed')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedStatus === 'completed'
              ? 'bg-gray-800 text-white'
              : 'bg-white text-[#4c5a52] border border-[#e2e4dc]'
          }`}
        >
          Completed
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus('all')}
          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedStatus === 'all'
              ? 'bg-gray-700 text-white'
              : 'bg-white text-[#4c5a52] border border-[#e2e4dc]'
          }`}
        >
          All
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e4dc] p-6">
            <ChefHat className="w-10 h-10 text-[#8b978f] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-[#1b2620]">No orders found in this view</p>
            <p className="text-xs text-[#8b978f] mt-1">Orders placed by customers will appear here live</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const overdue = isOrderOverdue(order.createdAt, order.status, settings.overdueThresholdMinutes);

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className={`bg-white border rounded-2xl p-4 transition-all shadow-xs ${
                  overdue
                    ? 'border-[#b3402f] ring-1 ring-[#b3402f]/50'
                    : 'border-[#e2e4dc]'
                }`}
              >
                {/* Order Top Bar */}
                <div className="flex items-start justify-between gap-2 border-b border-[#e2e4dc]/70 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-extrabold text-[#143529]">
                        {order.orderNumber}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1f4d3e] bg-[#e3ede8] px-2 py-0.5 rounded-md">
                        {renderTypeIcon(order.orderType)}
                        <span className="capitalize">{order.orderType.replace('_', ' ')}</span>
                      </span>
                      {order.source && (
                        <span className="text-[10px] font-semibold text-[#8b978f] bg-gray-100 px-1.5 py-0.5 rounded">
                          {order.source}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-[#1b2620] mt-1">
                      {order.customerName}
                      {order.tableNumber && (
                        <span className="text-[#1f4d3e] ml-1.5 font-extrabold">
                          • {order.tableNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#8b978f] mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(order.createdAt)} ({formatClockTime(order.createdAt)})
                      </span>
                      {order.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {order.phone}
                        </span>
                      )}
                    </div>
                    {order.deliveryAddress && (
                      <p className="text-[11px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{order.deliveryAddress}</span>
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {renderStatusBadge(order.status)}
                    {overdue && (
                      <span className="text-[10px] font-extrabold text-[#b3402f] bg-[#f6e2de] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="py-3 space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between text-xs py-1 border-b border-dashed border-[#e2e4dc]/60 last:border-0"
                    >
                      <div className="flex-1 pr-2">
                        <span className="font-extrabold text-[#1b2620] text-sm mr-2">
                          {item.quantity}x
                        </span>
                        <span className="font-bold text-[#1b2620]">{item.name}</span>
                        {item.variantLabel && (
                          <span className="ml-1.5 text-[11px] font-semibold text-[#1f4d3e] bg-[#e3ede8] px-1.5 py-0.2 rounded">
                            {item.variantLabel}
                          </span>
                        )}
                        {item.specialInstructions && (
                          <p className="text-[11px] font-bold text-[#c8791f] bg-[#f7e9d6] px-2 py-0.5 rounded mt-0.5">
                            Note: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-[#4c5a52] shrink-0 text-right">
                        {formatCurrency(item.unitPrice * item.quantity, settings.currency)}
                      </span>
                    </div>
                  ))}
                  {order.notes && (
                    <div className="text-[11.5px] font-semibold text-[#8a540f] bg-[#f7e9d6] p-2 rounded-xl mt-1">
                      Kitchen Instruction: {order.notes}
                    </div>
                  )}
                </div>

                {/* Order Footer & Actions */}
                <div className="border-t border-[#e2e4dc]/70 pt-3 flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs">
                    <span className="text-[#8b978f]">Total: </span>
                    <span className="text-sm font-extrabold text-[#143529]">
                      {formatCurrency(order.total, settings.currency)}
                    </span>
                    <span className="text-[10px] text-[#8b978f] ml-2">
                      ({order.paymentMethod.toUpperCase()} • {order.paymentStatus})
                    </span>
                  </div>

                  {/* Status advance action buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onViewReceipt(order)}
                      className="p-2 rounded-xl border border-[#e2e4dc] hover:bg-gray-100 text-[#4c5a52] transition-colors"
                      title="Print ticket"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                        className="px-3.5 py-2 rounded-xl bg-[#2c4a83] text-white text-xs font-bold hover:bg-[#203660] transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {order.status === 'preparing' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, 'ready')}
                        className="px-3.5 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, 'completed')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors flex items-center gap-1 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Complete & Handover</span>
                      </button>
                    )}

                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, 'cancelled')}
                        className="p-2 rounded-xl border border-[#f6e2de] text-[#b3402f] hover:bg-[#f6e2de] transition-colors"
                        title="Cancel Order"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
