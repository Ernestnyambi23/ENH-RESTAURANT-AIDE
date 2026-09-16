import React from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Info,
  Trash2,
  Phone,
  Check,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 px-6 bg-gray-50 border-b border-[#e2e4dc] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#1f4d3e] text-white flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#1b2620]">Live Notifications</h2>
              <p className="text-[11px] text-[#4c5a52]">
                {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[11px] font-bold text-emerald-800 hover:underline px-2 py-1"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((n) => {
            const isArrival = n.type === 'customer_arrival';
            const isReady = n.type === 'order_ready';
            const isDebt = n.type === 'debt_due';

            return (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all text-xs space-y-2 ${
                  !n.isRead
                    ? isArrival
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                      : isDebt
                      ? 'bg-red-50/80 border-red-300 shadow-xs'
                      : 'bg-amber-50/80 border-amber-300 shadow-xs'
                    : 'bg-gray-50/50 border-gray-200 text-gray-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold">
                    {isArrival && <Clock className="w-4 h-4 text-emerald-700" />}
                    {isReady && <CheckCircle2 className="w-4 h-4 text-amber-700" />}
                    {isDebt && <AlertTriangle className="w-4 h-4 text-red-700" />}
                    {!isArrival && !isReady && !isDebt && <Info className="w-4 h-4 text-blue-700" />}
                    <span className={!n.isRead ? 'text-[#1b2620]' : 'text-gray-700'}>{n.title}</span>
                  </div>

                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-[11px] text-gray-700 leading-relaxed">{n.message}</p>

                {n.customerPhone && (
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${n.customerPhone}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-white px-2 py-1 rounded-lg border border-emerald-200 shadow-2xs hover:bg-emerald-50"
                    >
                      <Phone className="w-3 h-3" />
                      Call {n.customerPhone}
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-gray-200/50 text-[10px]">
                  {!n.isRead ? (
                    <button
                      type="button"
                      onClick={() => onMarkRead(n.id)}
                      className="font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Mark Read
                    </button>
                  ) : (
                    <span className="text-gray-400 font-medium">Read</span>
                  )}

                  <button
                    type="button"
                    onClick={() => onDelete(n.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {notifications.length === 0 && (
            <div className="text-center py-16 text-xs text-gray-400 space-y-2">
              <Bell className="w-8 h-8 text-gray-300 mx-auto" />
              <p>No notifications right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
