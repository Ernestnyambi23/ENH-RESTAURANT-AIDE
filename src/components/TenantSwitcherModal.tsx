import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  MapPin,
  Check,
  Search,
  Plus,
  Sparkles,
  Smartphone,
  ChefHat,
  Receipt,
  X,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { TenantRestaurant, AuthUser, UserRole } from '../types';

interface TenantSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenants: TenantRestaurant[];
  currentTenantId: string;
  onSelectTenant: (tenant: TenantRestaurant) => void;
  currentUser: AuthUser | null;
  onOpenSuperAdmin?: () => void;
}

export const TenantSwitcherModal: React.FC<TenantSwitcherModalProps> = ({
  isOpen,
  onClose,
  tenants,
  currentTenantId,
  onSelectTenant,
  currentUser,
  onOpenSuperAdmin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tagline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSuperAdmin = currentUser?.role === UserRole.DEVELOPER;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[85vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Registered Businesses Directory</h3>
                <p className="text-xs text-slate-500">
                  Switch between registered restaurant enterprises. Each owner manages their independent branches.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered businesses by name, owner, or TIN..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 rounded-xl text-sm border-0 focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Restaurant List */}
          <div className="p-6 overflow-y-auto space-y-3 flex-1">
            {filteredTenants.length === 0 ? (
              <div className="text-center py-10">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium">No registered businesses match your search</p>
                <p className="text-xs text-slate-400 mt-1">Try searching for a different business or owner name</p>
              </div>
            ) : (
              filteredTenants.map((t) => {
                const isSelected = t.id === currentTenantId;
                const branches = t.branches || [];

                // Scope permission check for Staff/Owner
                const canAccess =
                  !currentUser ||
                  currentUser.role === UserRole.DEVELOPER ||
                  currentUser.restaurant_id === 'ALL' ||
                  currentUser.restaurant_id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (!canAccess) return;
                      onSelectTenant(t);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition-all relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 shadow-sm'
                        : canAccess
                        ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 cursor-pointer'
                        : 'border-slate-200 bg-slate-50/80 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                          style={{ backgroundColor: t.themeColor || '#1f4d3e' }}
                        >
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900">{t.name}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Registered Business
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                              {t.uniqueCode}
                            </span>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                                <Check className="w-3 h-3" /> Active Business
                              </span>
                            )}
                            {t.status === 'suspended' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Suspended
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            Owner: <strong className="text-slate-700">{t.ownerName}</strong> ({t.ownerEmail})
                          </p>

                          {/* Branches summary for this business */}
                          <div className="mt-2 text-xs bg-slate-100/70 p-2 rounded-lg border border-slate-200/80">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                              <Store className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{branches.length} Operating Branches:</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-slate-600">
                              {branches.map((b) => (
                                <span
                                  key={b.id}
                                  className={`px-1.5 py-0.5 rounded ${
                                    b.id === t.activeBranchId
                                      ? 'bg-emerald-600 text-white font-bold'
                                      : 'bg-white border border-slate-200 text-slate-700'
                                  }`}
                                >
                                  {b.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {t.address || 'Tanzania'}
                            </span>
                            <span className="font-medium text-slate-700">
                              Currency: <span className="font-bold text-emerald-800">{t.currency}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                      ) : canAccess ? (
                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition shrink-0 cursor-pointer"
                        >
                          Switch
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-medium bg-red-50 text-red-700 rounded border border-red-200 shrink-0">
                          Scoped to {currentUser?.restaurant_id}
                        </span>
                      )}
                    </div>

                    {/* Active Feature Flags */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-medium text-slate-400 mr-1">Features:</span>
                      {t.featureFlags.aiOrderAssistant && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-medium">
                          <Sparkles className="w-2.5 h-2.5" /> AI Assistant
                        </span>
                      )}
                      {t.featureFlags.onlinePayments && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                          <Smartphone className="w-2.5 h-2.5" /> Mobile Pay
                        </span>
                      )}
                      {t.featureFlags.kitchenDisplay && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">
                          <ChefHat className="w-2.5 h-2.5" /> Kitchen Queue
                        </span>
                      )}
                      {t.featureFlags.smsReceipts && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">
                          <Receipt className="w-2.5 h-2.5" /> SMS Receipts
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Super-Admin Access */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Row-Level Tenant Scoping & RBAC Active</span>
            </div>

            {isSuperAdmin && onOpenSuperAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSuperAdmin();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Super-Admin Portal
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
