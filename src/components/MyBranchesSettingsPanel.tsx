import React, { useState } from 'react';
import {
  Store,
  Building2,
  MapPin,
  Phone,
  User,
  Clock,
  Plus,
  Check,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { TenantRestaurant, RestaurantBranch } from '../types';

interface MyBranchesSettingsPanelProps {
  currentTenant: TenantRestaurant;
  onAddBranch: (branchData: Omit<RestaurantBranch, 'id' | 'createdAt'>) => void;
  onUpdateBranch: (branchId: string, updates: Partial<RestaurantBranch>) => void;
  onDeleteBranch: (branchId: string) => void;
  onSelectBranch: (branchId: string) => void;
}

export const MyBranchesSettingsPanel: React.FC<MyBranchesSettingsPanelProps> = ({
  currentTenant,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onSelectBranch,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<RestaurantBranch | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [openingHours, setOpeningHours] = useState('08:00 AM - 11:00 PM');
  const [isPrimary, setIsPrimary] = useState(false);
  const [formError, setFormError] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const branches = currentTenant.branches || [];
  const activeBranchId = currentTenant.activeBranchId || branches[0]?.id;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

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

  const handleSubmit = (e: React.FormEvent) => {
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
      setFormError('Contact phone is required.');
      return;
    }

    if (editingBranchId) {
      onUpdateBranch(editingBranchId, {
        name: name.trim(),
        code: code.trim() || `BR-0${branches.length}`,
        address: address.trim(),
        phone: phone.trim(),
        managerName: managerName.trim() || undefined,
        openingHours: openingHours.trim(),
        isPrimary,
      });
      showToast(`Branch "${name.trim()}" updated successfully.`);
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
      showToast(`New branch "${name.trim()}" created successfully.`);
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Registered Business Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-xs"
              style={{ backgroundColor: currentTenant.themeColor || '#1f4d3e' }}
            >
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-900">{currentTenant.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Registered Business Enterprise
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                  Code: {currentTenant.uniqueCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Owner: <strong className="text-slate-800">{currentTenant.ownerName}</strong> ({currentTenant.ownerEmail}) • Registered Business TIN / License: <span className="font-mono text-slate-700">{currentTenant.businessRegistrationNumber || 'BRELA-ACTIVE'}</span>
              </p>
            </div>
          </div>

          {!isAdding && (
            <button
              type="button"
              id="owner-add-branch-btn"
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Branch</span>
            </button>
          )}
        </div>

        {/* Informational callout */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
          <Store className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Owner-Managed Branch Architecture:</span> As the registered owner of <strong>{currentTenant.name}</strong>, you can add and operate multiple branches across any region. Your staff, kitchen orders, inventory, and POS devices operate under the selected active branch.
          </div>
        </div>
      </div>

      {/* Add / Edit Branch Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-emerald-500/40 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {editingBranchId ? <Edit2 className="w-4 h-4 text-emerald-700" /> : <Plus className="w-4 h-4 text-emerald-700" />}
              <span>{editingBranchId ? 'Edit Branch Details' : 'Register New Operating Branch'}</span>
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
            <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Branch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Downtown Posta Branch"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Branch Identifier / Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`e.g. BR-0${branches.length + 1}`}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Physical Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Samora Ave & Azikiwe St, City Centre"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Branch Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +255 714 889 120"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Branch Manager Name
              </label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Kelvin Mushi"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="e.g. 08:30 AM - 11:30 PM"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="settings-branch-is-primary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <label htmlFor="settings-branch-is-primary" className="text-xs text-slate-700 font-medium cursor-pointer">
              Set as Primary Flagship Branch for {currentTenant.name}
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer shadow-xs"
            >
              {editingBranchId ? 'Save Changes' : 'Register Branch'}
            </button>
          </div>
        </form>
      )}

      {/* Branches List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
          <span>Operating Branches ({branches.length})</span>
          <span className="text-slate-400 font-normal">Click &quot;Set as Active&quot; to switch live store operations</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {branches.map((b) => {
            const isActive = b.id === activeBranchId;
            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all ${
                  isActive
                    ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
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
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Primary Flagship
                          </span>
                        )}
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                            <Check className="w-3 h-3" /> Active Operating Branch
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{b.address}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{b.phone}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-600 flex-wrap">
                        {b.managerName && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            Manager: <strong className="text-slate-800">{b.managerName}</strong>
                          </span>
                        )}
                        {b.openingHours && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {b.openingHours}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(b)}
                      title="Edit branch details"
                      className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition border border-slate-200 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {branches.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setBranchToDelete(b)}
                        title="Delete branch"
                        className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition border border-slate-200 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {isActive ? (
                      <div className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectBranch(b.id);
                          showToast(`Switched active branch to "${b.name}".`);
                        }}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs"
                      >
                        Set as Active
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Branch Confirmation Modal */}
      {branchToDelete && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-red-900">Delete Branch Location</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Are you sure you want to delete branch <strong>"{branchToDelete.name}"</strong>? Orders and device terminals tied to this branch will be unassigned.
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
                  onDeleteBranch(branchToDelete.id);
                  showToast(`Branch "${branchToDelete.name}" deleted.`);
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
  );
};
