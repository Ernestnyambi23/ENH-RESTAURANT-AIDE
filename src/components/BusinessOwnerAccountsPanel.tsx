import React, { useState } from 'react';
import {
  Crown,
  KeyRound,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Building2,
  Mail,
  Phone,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Share2,
  HelpCircle,
} from 'lucide-react';
import { BusinessOwnerAccount, RestaurantSettings } from '../types';
import { sound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

interface BusinessOwnerAccountsPanelProps {
  businessOwners: BusinessOwnerAccount[];
  settings: RestaurantSettings;
  onAddOwner: (owner: BusinessOwnerAccount) => void;
  onUpdateOwner: (owner: BusinessOwnerAccount) => void;
  onDeleteOwner: (ownerId: string) => void;
  onUpdateSettings?: (settings: RestaurantSettings) => void;
}

export const BusinessOwnerAccountsPanel: React.FC<BusinessOwnerAccountsPanelProps> = ({
  businessOwners,
  settings,
  onAddOwner,
  onUpdateOwner,
  onDeleteOwner,
  onUpdateSettings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<BusinessOwnerAccount | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [ownerToDelete, setOwnerToDelete] = useState<BusinessOwnerAccount | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('8888');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState(settings.restaurantName || '');
  const [ownerType, setOwnerType] = useState<'primary' | 'co_owner' | 'franchisee' | 'director'>('primary');
  const [accessEnabled, setAccessEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [showFormPassword, setShowFormPassword] = useState(false);

  const openCreateModal = () => {
    setEditingOwner(null);
    setName('');
    setUsername('');
    setPassword('Owner@' + Math.floor(1000 + Math.random() * 9000));
    setPin(String(Math.floor(1000 + Math.random() * 9000)));
    setEmail('');
    setPhone('+255');
    setBusinessName(settings.restaurantName || "OLLI'S PIZZA HOUSE");
    setOwnerType('primary');
    setAccessEnabled(true);
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (owner: BusinessOwnerAccount) => {
    setEditingOwner(owner);
    setName(owner.name);
    setUsername(owner.username || '');
    setPassword(owner.password || '');
    setPin(owner.pin || '8888');
    setEmail(owner.email || '');
    setPhone(owner.phone || '');
    setBusinessName(owner.businessName || settings.restaurantName || '');
    setOwnerType(owner.ownerType || 'primary');
    setAccessEnabled(owner.accessEnabled !== false);
    setNotes(owner.notes || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
    let res = 'Owner_';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleGeneratePin = () => {
    const newPin = String(Math.floor(1000 + Math.random() * 9000));
    setPin(newPin);
  };

  const handleAutoFillUsername = (fullName: string) => {
    setName(fullName);
    if (!editingOwner) {
      const clean = fullName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .slice(0, 16);
      if (clean) {
        setUsername(`${clean}_owner`);
      }
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    const cleanPass = password.trim();

    if (!cleanName) {
      setFormError('Business Owner Full Name is required.');
      return;
    }
    if (!cleanUser || cleanUser.length < 3) {
      setFormError('Username must be at least 3 characters long.');
      return;
    }
    if (!cleanPass || cleanPass.length < 4) {
      setFormError('Password must be at least 4 characters long.');
      return;
    }

    // Check username duplicates against other owners
    const isDuplicate = businessOwners.some(
      (o) => o.id !== editingOwner?.id && o.username?.toLowerCase() === cleanUser
    );
    if (isDuplicate) {
      setFormError(`The username "@${cleanUser}" is already assigned to another owner.`);
      return;
    }

    if (editingOwner) {
      const updated: BusinessOwnerAccount = {
        ...editingOwner,
        name: cleanName,
        username: cleanUser,
        password: cleanPass,
        pin: pin.trim() || '8888',
        email: email.trim(),
        phone: phone.trim(),
        businessName: businessName.trim() || settings.restaurantName,
        ownerType,
        accessEnabled,
        notes: notes.trim(),
      };
      onUpdateOwner(updated);

      // If updating primary owner, sync with settings
      if (ownerType === 'primary' && onUpdateSettings) {
        onUpdateSettings({
          ...settings,
          ownerName: cleanName,
          ownerEmail: email.trim() || settings.ownerEmail,
          adminPassword: cleanPass,
        });
      }
    } else {
      const newOwner: BusinessOwnerAccount = {
        id: `owner-${Date.now()}`,
        name: cleanName,
        username: cleanUser,
        password: cleanPass,
        pin: pin.trim() || '8888',
        email: email.trim(),
        phone: phone.trim(),
        businessName: businessName.trim() || settings.restaurantName,
        ownerType,
        accessEnabled,
        createdAt: Date.now(),
        notes: notes.trim(),
      };
      onAddOwner(newOwner);

      // If primary owner created and settings need sync
      if (ownerType === 'primary' && onUpdateSettings && (!settings.ownerName || settings.ownerName === 'Ernest Nyambi')) {
        onUpdateSettings({
          ...settings,
          ownerName: cleanName,
          ownerEmail: email.trim() || settings.ownerEmail,
          adminPassword: cleanPass,
        });
      }
    }

    sound.playSuccess();
    triggerHaptic('medium');
    setIsModalOpen(false);
  };

  const handleCopySlip = (owner: BusinessOwnerAccount) => {
    const slip = `===========================================
🔐 BUSINESS OWNER LOGIN CREDENTIALS
===========================================
🏢 Business: ${owner.businessName || settings.restaurantName}
👤 Owner Name: ${owner.name}
🏷️ Role / Tier: ${
      owner.ownerType === 'primary'
        ? 'Primary Licensee & Franchise Owner'
        : owner.ownerType === 'co_owner'
        ? 'Co-Owner & Managing Partner'
        : owner.ownerType === 'director'
        ? 'Executive Director'
        : 'Franchisee'
    }
-------------------------------------------
🔑 Login Username: @${owner.username}
🔒 Login Password: ${owner.password}
🔢 Quick PIN Code: ${owner.pin || '8888'}
📱 Registered Phone: ${owner.phone || 'N/A'}
📧 Email Address: ${owner.email || 'N/A'}
🚦 Access Status: ${owner.accessEnabled ? 'ACTIVE & ENABLED' : 'LOCKED / DISABLED'}
-------------------------------------------
🌐 Login Screen: Select "Business Owner" or enter @${owner.username} on terminal.
===========================================`;

    navigator.clipboard.writeText(slip);
    setCopiedId(owner.id);
    sound.playClick();
    triggerHaptic('light');
    setTimeout(() => setCopiedId(null), 3000);
  };

  const togglePasswordReveal = (ownerId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [ownerId]: !prev[ownerId],
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/40 border border-indigo-400/50 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>Business Owner Usernames & Passwords</span>
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Developer Root Master Control</span>
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-1">
                Create and manage login usernames, master passwords, and access locks for restaurant business owners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="create-business-owner-btn"
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 border border-indigo-400/40"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>Create Business Owner</span>
            </button>
          </div>
        </div>
      </div>

      {/* List of Registered Business Owners */}
      <div className="bg-white border border-[#e2e4dc] rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-[#e2e4dc] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1f4d3e]" />
            <h4 className="text-sm font-bold text-[#1b2620]">
              Provisioned Business Owner Accounts ({businessOwners.length})
            </h4>
          </div>
          <span className="text-xs text-[#8b978f]">
            Full ownership privileges (Admin, KDS, POS, Debts & Master Settings)
          </span>
        </div>

        {businessOwners.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#fbfbf9] rounded-2xl border border-dashed border-[#e2e4dc]">
            <Crown className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#1b2620]">No Business Owner Accounts Configured</p>
            <p className="text-xs text-[#8b978f] mt-1 max-w-sm mx-auto">
              Click the "Create Business Owner" button above to generate a new username and password for the business owner.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-all"
            >
              Create Owner Account Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {businessOwners.map((owner) => {
              const isRevealed = Boolean(revealedPasswords[owner.id]);
              const isCopied = copiedId === owner.id;
              const isPrimary = owner.ownerType === 'primary' || owner.id === 'owner-01';

              return (
                <div
                  key={owner.id}
                  className={`rounded-2xl border transition-all p-4 relative flex flex-col justify-between ${
                    owner.accessEnabled !== false
                      ? 'bg-gradient-to-b from-[#fbfcf9] to-white border-[#d8dcd3] shadow-xs hover:border-[#1f4d3e]/40'
                      : 'bg-red-50/40 border-red-200 opacity-90'
                  }`}
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                            owner.accessEnabled !== false
                              ? 'bg-amber-100/70 border-amber-300 text-amber-800'
                              : 'bg-red-100 border-red-300 text-red-700'
                          }`}
                        >
                          <Crown className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="text-sm font-extrabold text-[#1b2620] truncate">
                              {owner.name}
                            </h5>
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                isPrimary
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-indigo-100 text-indigo-900 border-indigo-200'
                              }`}
                            >
                              {owner.ownerType === 'primary'
                                ? 'Primary Owner'
                                : owner.ownerType === 'co_owner'
                                ? 'Co-Owner'
                                : owner.ownerType === 'director'
                                ? 'Director'
                                : 'Franchisee'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#526359] flex-wrap">
                            <span className="font-mono font-bold text-[#1f4d3e] bg-[#eef3f0] px-2 py-0.5 rounded border border-[#d2dfd8]">
                              @{owner.username}
                            </span>
                            {owner.businessName && (
                              <span className="truncate max-w-[140px]" title={owner.businessName}>
                                • {owner.businessName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 flex items-center gap-1 ${
                          owner.accessEnabled !== false
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {owner.accessEnabled !== false ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                            <span>Suspended</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Credentials Info Box */}
                    <div className="mt-3.5 p-3 rounded-xl bg-[#f4f6f1] border border-[#e2e6dd] space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#65736b] font-medium flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-[#1f4d3e]" />
                          <span>Owner Password:</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#1b2620] bg-white px-2 py-0.5 rounded border border-[#dcded6]">
                            {isRevealed ? owner.password : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordReveal(owner.id)}
                            className="p-1 text-[#65736b] hover:text-[#1b2620] rounded hover:bg-white"
                            title={isRevealed ? 'Hide Password' : 'Show Password'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 border-t border-[#e2e6dd] pt-1.5">
                        <span className="text-[#65736b] font-medium flex items-center gap-1">
                          <KeyRound className="w-3.5 h-3.5 text-[#1f4d3e]" />
                          <span>Quick 4-Digit PIN:</span>
                        </span>
                        <span className="font-mono font-bold text-[#1b2620] bg-white px-2 py-0.5 rounded border border-[#dcded6]">
                          {owner.pin || '8888'}
                        </span>
                      </div>

                      {(owner.email || owner.phone) && (
                        <div className="flex items-center justify-between gap-2 border-t border-[#e2e6dd] pt-1.5 text-[11px] text-[#65736b]">
                          {owner.email && (
                            <span className="truncate flex items-center gap-1" title={owner.email}>
                              <Mail className="w-3 h-3 text-[#8b978f]" />
                              <span>{owner.email}</span>
                            </span>
                          )}
                          {owner.phone && (
                            <span className="font-mono shrink-0 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#8b978f]" />
                              <span>{owner.phone}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-[#e8ece3] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {/* Copy Login Slip Button */}
                      <button
                        type="button"
                        onClick={() => handleCopySlip(owner)}
                        className="px-2.5 py-1.5 rounded-xl bg-white border border-[#dcded6] hover:bg-gray-50 text-[#1b2620] text-xs font-bold transition-all flex items-center gap-1"
                        title="Copy full formatted login credentials slip to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied Slip!</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="w-3.5 h-3.5 text-[#1f4d3e]" />
                            <span>Copy Login Slip</span>
                          </>
                        )}
                      </button>

                      {/* Enable / Disable Access Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = {
                            ...owner,
                            accessEnabled: owner.accessEnabled === false ? true : false,
                          };
                          onUpdateOwner(updated);
                          sound.playClick();
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                          owner.accessEnabled !== false
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                        }`}
                        title={owner.accessEnabled !== false ? 'Lock & suspend owner login' : 'Unlock & allow owner login'}
                      >
                        {owner.accessEnabled !== false ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Lock Access</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Unlock Access</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(owner)}
                        className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#1b2620] transition-colors"
                        title="Edit Owner Details & Password"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button (with safe confirmation modal) */}
                      <button
                        type="button"
                        onClick={() => setOwnerToDelete(owner)}
                        className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 transition-colors border border-red-200 cursor-pointer"
                        title="Delete Business Owner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Developer Info Notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/70 text-xs text-indigo-950 space-y-1">
          <div className="flex items-center gap-1.5 font-extrabold text-indigo-900">
            <Info className="w-4 h-4 text-indigo-700" />
            <span>Developer Provisioning & Authentication Protocol</span>
          </div>
          <p className="text-[11.5px] leading-relaxed text-indigo-900/80">
            Business owners log in at the start screen using their designated <strong>@username</strong> and <strong>password</strong> (or 4-digit PIN). When logged in as Business Owner, they have full access to management, reporting, POS, inventory, staff, and pricing controls.
          </p>
        </div>
      </div>

      {/* Modal: Create / Edit Business Owner */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#e2e4dc] max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e4dc]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-300 text-indigo-900 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#1b2620]">
                    {editingOwner ? 'Edit Business Owner Account' : 'Create Business Owner Account'}
                  </h4>
                  <p className="text-xs text-[#8b978f]">Developer Root Access Provisioning</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name & Owner Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    Owner Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ernest Nyambi"
                    value={name}
                    onChange={(e) => handleAutoFillUsername(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    Ownership Tier / Role
                  </label>
                  <select
                    value={ownerType}
                    onChange={(e) => setOwnerType(e.target.value as any)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-indigo-600 font-medium"
                  >
                    <option value="primary">Primary Owner & Franchisee</option>
                    <option value="co_owner">Co-Owner & Managing Partner</option>
                    <option value="director">Executive Director</option>
                    <option value="franchisee">Franchise Branch Owner</option>
                  </select>
                </div>
              </div>

              {/* Login Username & Quick Auto-Gen */}
              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1 flex items-center justify-between">
                  <span>Login Username <span className="text-red-500">*</span></span>
                  <span className="text-[11px] text-gray-500 font-normal">Used to sign in</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">@</span>
                  <input
                    type="text"
                    required
                    placeholder="ernest_owner"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-7 pr-3 p-2.5 text-xs sm:text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-indigo-600 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Password & PIN with Generator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1 flex items-center justify-between">
                    <span>Login Password <span className="text-red-500">*</span></span>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Gen
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter strong password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2.5 pr-8 text-xs sm:text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-indigo-600 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1 flex items-center justify-between">
                    <span>4-Digit Quick PIN</span>
                    <button
                      type="button"
                      onClick={handleGeneratePin}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                    >
                      <Sparkles className="w-3 h-3" /> Gen PIN
                    </button>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="8888"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-indigo-600 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    Owner Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="ernest@restaurant.co.tz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    Owner Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="+255713057325"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-indigo-600 font-mono"
                  />
                </div>
              </div>

              {/* Business Name & Access Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    Restaurant / Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="OLLI'S PIZZA HOUSE"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    App Access Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setAccessEnabled(!accessEnabled)}
                    className={`w-full p-2.5 text-xs sm:text-sm rounded-xl border font-bold flex items-center justify-between transition-colors ${
                      accessEnabled
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-red-50 border-red-300 text-red-900'
                    }`}
                  >
                    <span>{accessEnabled ? 'Active & Enabled' : 'Locked / Suspended'}</span>
                    <span className="text-[11px] underline">Change</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                  Developer Provisioning Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional notes, branch permissions or license agreement details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#e2e4dc]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingOwner ? 'Update Owner Account' : 'Save & Provision Owner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {ownerToDelete && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-red-900">Delete Business Owner</h3>
              <p className="text-xs text-[#4c5a52] mt-1.5 leading-relaxed">
                Are you sure you want to delete the business owner account for <strong>{ownerToDelete.name}</strong> (@{ownerToDelete.username})? They will immediately lose administrative access.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e4dc]">
              <button
                type="button"
                onClick={() => setOwnerToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e4dc] text-xs font-bold text-[#4c5a52] hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOwner(ownerToDelete.id);
                  sound.playTrash();
                  setOwnerToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
