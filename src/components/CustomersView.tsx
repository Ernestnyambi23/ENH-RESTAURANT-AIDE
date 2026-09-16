import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  MessageSquare,
  DollarSign,
  ShoppingBag,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Order, RestaurantSettings } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CustomersViewProps {
  orders: Order[];
  settings: RestaurantSettings;
  onFilterCustomerOrders?: (customerName: string) => void;
}

interface CustomerSummary {
  name: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  totalDebt: number;
  lastVisit: number;
  lastArrivalTime?: string;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  orders,
  settings,
  onFilterCustomerOrders,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Aggregate customers from orders
  const customerMap = new Map<string, CustomerSummary>();

  orders.forEach((ord) => {
    const rawName = (ord.customerName || ord.debtorName || 'Walk-in Guest').trim();
    const existing = customerMap.get(rawName) || {
      name: rawName,
      phone: ord.phone,
      totalOrders: 0,
      totalSpent: 0,
      totalDebt: 0,
      lastVisit: ord.createdAt,
      lastArrivalTime: ord.arrivalTime,
    };

    existing.totalOrders += 1;
    const paid = ord.paidAmount !== undefined ? ord.paidAmount : (ord.isPaid ? ord.total : 0);
    existing.totalSpent += paid;
    const debt = ord.debtAmount !== undefined ? ord.debtAmount : (ord.isPaid ? 0 : Math.max(0, ord.total - (ord.paidAmount || 0)));
    existing.totalDebt += debt;

    if (ord.phone && !existing.phone) {
      existing.phone = ord.phone;
    }
    if (ord.createdAt > existing.lastVisit) {
      existing.lastVisit = ord.createdAt;
      existing.lastArrivalTime = ord.arrivalTime || existing.lastArrivalTime;
    }

    customerMap.set(rawName, existing);
  });

  const customerList = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  const filtered = customerList.filter((c) => {
    const s = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(s) || (c.phone && c.phone.toLowerCase().includes(s));
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#e2e4dc] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1f4d3e] text-white flex items-center justify-center font-bold shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#1b2620]">
              Customer Directory & VIPs
            </h2>
            <p className="text-xs text-[#4c5a52]">
              Customer profiles, dining frequency, lifetime spending, and direct communication.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-gray-500 font-bold block">Total Guests Profiled</span>
          <span className="text-lg font-black text-[#1b2620]">{customerList.length} Customers</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-[#e2e4dc] shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers by name or phone number..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-[#e2e4dc] rounded-2xl text-xs text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#1f4d3e] focus:bg-white"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.name}
            className="bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-xs hover:border-[#1f4d3e]/50 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[#1b2620]">{c.name}</h3>
                  {c.phone ? (
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span>{c.phone}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-400">No phone on record</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Visits</span>
                  <span className="text-xs font-black text-[#1b2620] bg-gray-100 px-2 py-0.5 rounded-full">
                    {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                  </span>
                </div>
              </div>

              {/* Spend & Debt stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                <div className="bg-emerald-50/70 p-2.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-emerald-800 block">Total Spent</span>
                  <span className="font-black text-emerald-950 font-mono">
                    {formatCurrency(c.totalSpent, settings.currency)}
                  </span>
                </div>

                <div className={`p-2.5 rounded-2xl ${c.totalDebt > 0 ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-600'}`}>
                  <span className="text-[10px] font-bold block">Current Debt</span>
                  <span className={`font-black font-mono ${c.totalDebt > 0 ? 'text-red-700' : 'text-gray-500'}`}>
                    {formatCurrency(c.totalDebt, settings.currency)}
                  </span>
                </div>
              </div>

              {c.lastArrivalTime && (
                <div className="text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Expected: {c.lastArrivalTime.replace('T', ' ')}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              {c.phone ? (
                <>
                  <a
                    href={`tel:${c.phone}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-gray-600" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </>
              ) : (
                <span className="text-[11px] text-gray-400 italic py-1">In-person walk-in guest</span>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400 text-xs bg-white rounded-3xl border border-[#e2e4dc]">
            No customers match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};
