import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Store,
  MapPin,
  Check,
  Plus,
  X,
  Phone,
  User,
  Clock,
  Building2,
  Trash2,
  Edit2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { TenantRestaurant, RestaurantBranch, AuthUser, UserRole } from '../types';

interface BranchSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTenant: TenantRestaurant;
  currentBranchId?: string;
  onSelectBranch: (branchId: string) => void;
  onAddBranch: (branchData: Omit<RestaurantBranch, 'id' | 'createdAt'>) => void;
  onUpdateBranch?: (branchId: string, updates: Partial<RestaurantBranch>) => void;
  onDeleteBranch?: (branchId: string) => void;
  currentUser?: AuthUser | null;
  onOpenSuperAdminDirectory?: () => void;
}

export const BranchSwitcherModal: React.FC<BranchSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentTenant,
  currentBranchId,
  onSelectBranch,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  currentUser,
  onOpenSuperAdminDirectory,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);

  // New Branch Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [openingHours, setOpeningHours] = useState('08:00 AM - 11:00 PM');
  const [isPrimary, setIsPrimary] = useState(false);
  const [formError, setFormError] = useState('');
  const [branchToDelete, setBranchToDelete] = useState<RestaurantBranch | null>(null);

  if (!isOpen) return null;

  const branches = currentTenant.branches || [];
  const activeBranchId = currentBranchId || currentTenant.activeBranchId || branches[0]?.id;

  const isOwnerOrDev =
    !currentUser ||
    currentUser.role === UserRole.DEVELOPER ||
    currentUser.role === UserRole.OWNER;

  const resetForm = () => {
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setManagerName('');
    setOpeningHours('08:00 AM - 11:00 PM');
    setIsPrimary(false);
    setFormError('');
    setIsAdding(false);
    setEditingBranchId(null);
  };

  const handleStartEdit = (b: RestaurantBranch) => {
    setEditingBranchId(b.id);
    setName(b.name);
    setCode(b.code);
    setAddress(b.address);
    setPhone(b.phone);
    setManagerName(b.managerName || '');
    setOpeningHours(b.openingHours || '08:00 AM - 11:00 PM');
    setIsPrimary(b.isPrimary);
    setIsAdding(true);
    setFormError('');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Branch name is required.');
      return;
    }
    if (!address.trim()) {
      setFormError('Physical address is required.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Contact phone number is required.');
      return;
    }

    if (editingBranchId && onUpdateBranch) {
      onUpdateBranch(editingBranchId, {
        name: name.trim(),
        code: code.trim() || `BR-0${branches.length}`,
        address: address.trim(),
        phone: phone.trim(),
        managerName: managerName.trim() || undefined,
        openingHours: openingHours.trim(),
        isPrimary,
      });
      resetForm();
    } else {
      const generatedCode = code.trim() || `BR-0${branches.length + 1}`;
      onAddBranch({
        restaurant_id: currentTenant.id,
        name: name.trim(),
        code: generatedCode,
        address: address.trim(),
        phone: phone.trim(),
        managerName: managerName.trim() || undefined,
        email: currentTenant.ownerEmail,
        isPrimary: isPrimary || branches.length === 0,
        status: 'active',
        openingHours: openingHours.trim(),
      });
      resetForm();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs shrink-0"
                style={{ backgroundColor: currentTenant.themeColor || '#1f4d3e' }}
              >
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {currentTenant.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Registered Business
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Owner: <span className="font-semibold text-slate-700">{currentTenant.ownerName}</span> • Manage Operating Branches & Outlets
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

          {/* Sub-header info bar explaining the model */}
          <div className="px-6 py-2.5 bg-emerald-50/60 border-b border-emerald-100/80 flex items-center justify-between gap-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                One registered restaurant owner can operate multiple store branches. Orders, receipts, and inventory sync to the active branch.
              </span>
            </div>
            {isOwnerOrDev && !isAdding && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsAdding(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-2xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Branch
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-3 flex-1">
            {isAdding ? (
              /* Add/Edit Branch Form */
              <form onSubmit={handleSubmitForm} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {editingBranchId ? <Edit2 className="w-4 h-4 text-emerald-700" /> : <Plus className="w-4 h-4 text-emerald-700" />}
                    {editingBranchId ? 'Edit Restaurant Branch' : 'Add New Operating Branch'}
                  </h4>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {formError && (
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Branch Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Downtown Posta Branch"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Branch Code
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. BR-0${branches.length + 1}`}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Physical Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samora Ave, City Centre"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +255 714 889 120"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Branch Manager Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kelvin Mushi"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Opening Hours
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 08:00 AM - 11:00 PM"
                      value={openingHours}
                      onChange={(e) => setOpeningHours(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="branch-is-primary"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="branch-is-primary" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Set as Primary / Flagship Branch for {currentTenant.name}
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer shadow-2xs"
                  >
                    {editingBranchId ? 'Save Branch Changes' : 'Register Branch'}
                  </button>
                </div>
              </form>
            ) : null}

            {/* List of Branches */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
                <span>All Branches of {currentTenant.name} ({branches.length})</span>
                <span className="text-[11px] text-slate-400">Click to switch active branch</span>
              </div>

              {branches.map((b) => {
                const isActive = b.id === activeBranchId;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBranch(b.id);
                      onClose();
                    }}
                    className={`p-4 rounded-xl border transition-all relative cursor-pointer ${
                      isActive
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                            isActive ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Store className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-sm">{b.name}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {b.code}
                            </span>
                            {b.isPrimary && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                                Flagship
                              </span>
                            )}
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                                <Check className="w-3 h-3" /> Active Operating Branch
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[280px]">{b.address}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{b.phone}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 flex-wrap">
                            {b.managerName && (
                              <span className="flex items-center gap-1 text-slate-700 font-medium">
                                <User className="w-3 h-3 text-slate-400" />
                                Manager: {b.managerName}
                              </span>
                            )}
                            {b.openingHours && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {b.openingHours}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isOwnerOrDev && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(b);
                            }}
                            title="Edit branch details"
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isOwnerOrDev && branches.length > 1 && onDeleteBranch && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setBranchToDelete(b);
                            }}
                            title="Delete branch"
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isActive ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectBranch(b.id);
                              onClose();
                            }}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition shrink-0 cursor-pointer"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Registered Business: <strong className="text-slate-800">{currentTenant.name}</strong> ({currentTenant.uniqueCode})</span>
            </div>

            {currentUser?.role === UserRole.DEVELOPER && onOpenSuperAdminDirectory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSuperAdminDirectory();
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                Switch Registered Business (Developer)
              </button>
            )}
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {branchToDelete && (
          <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4 animate-in fade-in duration-150">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-red-900">Delete Branch Location</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Are you sure you want to delete branch <strong>"{branchToDelete.name}"</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBranchToDelete(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteBranch?.(branchToDelete.id);
                    setBranchToDelete(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Branch</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
