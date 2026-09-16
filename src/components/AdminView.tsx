import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Radio,
  Power,
  PowerOff,
  Plus,
  Trash2,
  Lock,
  KeyRound,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  BarChart3,
  RefreshCw,
  LogOut,
  Sliders,
  Settings,
  Info,
  QrCode,
  Sparkles,
  Download,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Terminal,
  Crown,
  Shield,
  Activity,
  ShoppingBag,
  Wallet,
  Users,
  UserPlus,
  UserX,
  Copy,
  Search,
  Phone,
  AtSign,
  AlertCircle,
  Edit,
} from 'lucide-react';
import { ConnectedDevice, MenuItem, Order, RestaurantSettings, Purchase, Capital, MpesaTransaction, StaffMember, BusinessOwnerAccount } from '../types';
import { InventoryView } from './InventoryView';
import { AnalyticsView } from './AnalyticsView';
import { FinancesView } from './FinancesView';
import { PurchasesView } from './PurchasesView';
import { DeveloperInfraPanel } from './DeveloperInfraPanel';
import { BusinessOwnerAccountsPanel } from './BusinessOwnerAccountsPanel';
import { BrandLogo } from './BrandLogo';
import { NewStaffModal } from './NewStaffModal';
import { formatTimeAgo } from '../utils/formatters';
import { UserRole } from '../utils/rbac';

interface AdminViewProps {
  devices: ConnectedDevice[];
  settings: RestaurantSettings;
  items: MenuItem[];
  orders: Order[];
  purchases?: Purchase[];
  capital?: Capital;
  mpesaTransactions?: MpesaTransaction[];
  staffList?: StaffMember[];
  businessOwners?: BusinessOwnerAccount[];
  onAddStaff?: (staff: StaffMember) => void;
  onUpdateStaff?: (staff: StaffMember) => void;
  onDeleteStaff?: (staffId: string) => void;
  onAddBusinessOwner?: (owner: BusinessOwnerAccount) => void;
  onUpdateBusinessOwner?: (owner: BusinessOwnerAccount) => void;
  onDeleteBusinessOwner?: (ownerId: string) => void;
  onAddPurchase?: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  onDeletePurchase?: (id: string) => void;
  onUpdateCapital?: (newAmount: number, notes?: string) => void;
  currentRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onToggleDeviceStatus: (deviceId: string) => void;
  onApproveDevice?: (deviceId: string) => void;
  onRejectDevice?: (deviceId: string) => void;
  onSimulatePendingAndroidDevice?: () => void;
  onAddNewDevice: (device: Partial<ConnectedDevice>) => void;
  onDeleteDevice: (deviceId: string) => void;
  onDisableAllRemoteDevices: () => void;
  onEnableAllDevices?: () => void;
  onToggleDeviceControlFunction?: () => void;
  onUpdateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  onUpdateStock: (itemId: string, newStock: number) => void;
  onUpdatePrice: (itemId: string, newPrice: number, variantLabel?: string) => void;
  onAddNewItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onEditItem?: (item: MenuItem) => void;
  onChangeDishImage?: (item: MenuItem) => void;
  onResetData: () => void;
  onResetReport?: (reportId: string, resetKey: string) => boolean | void;
  onResetAllReports?: (masterKey: string) => boolean | void;
  onLockAdmin: () => void;
  onOpenAndroidAppModal?: () => void;
  onOpenSettings?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  devices,
  settings,
  items,
  orders,
  purchases = [],
  capital = { id: 'cap-1', amount: 50000, updatedAt: Date.now() },
  mpesaTransactions = [],
  staffList = [],
  businessOwners = [],
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onAddBusinessOwner,
  onUpdateBusinessOwner,
  onDeleteBusinessOwner,
  onAddPurchase,
  onDeletePurchase,
  onUpdateCapital,
  currentRole = UserRole.OWNER,
  onSwitchRole,
  onToggleDeviceStatus,
  onApproveDevice,
  onRejectDevice,
  onSimulatePendingAndroidDevice,
  onAddNewDevice,
  onDeleteDevice,
  onDisableAllRemoteDevices,
  onEnableAllDevices,
  onToggleDeviceControlFunction,
  onUpdateSettings,
  onUpdateStock,
  onUpdatePrice,
  onAddNewItem,
  onDeleteItem,
  onEditItem,
  onChangeDishImage,
  onResetData,
  onResetReport,
  onResetAllReports,
  onLockAdmin,
  onOpenAndroidAppModal,
  onOpenSettings,
}) => {
  const [adminTab, setAdminTab] = useState<'devices' | 'inventory' | 'purchases' | 'capital' | 'analytics' | 'ownership' | 'developer' | 'business-owners'>('devices');

  // Staff Credentials and Access State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null);
  const [accessSubView, setAccessSubView] = useState<'all' | 'staff' | 'devices'>('all');
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<ConnectedDevice | null>(null);

  // Password edit state
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string>('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>('');

  // Owner details state
  const [ownerName, setOwnerName] = useState<string>(settings.ownerName || '');
  const [ownerEmail, setOwnerEmail] = useState<string>(settings.ownerEmail || '');
  const [restaurantName, setRestaurantName] = useState<string>(settings.restaurantName || '');
  const [tagline, setTagline] = useState<string>(settings.tagline || '');
  const [currency, setCurrency] = useState<string>(settings.currency || 'TZS');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');

  // Sync state whenever settings props change
  useEffect(() => {
    setOwnerName(settings.ownerName || '');
    setOwnerEmail(settings.ownerEmail || '');
    setRestaurantName(settings.restaurantName || '');
    setTagline(settings.tagline || '');
    setCurrency(settings.currency || 'TZS');
  }, [settings.ownerName, settings.ownerEmail, settings.restaurantName, settings.tagline, settings.currency]);

  // Pair new device modal state
  const [isPairingModalOpen, setIsPairingModalOpen] = useState<boolean>(false);
  const [newDeviceName, setNewDeviceName] = useState<string>('');
  const [newDeviceType, setNewDeviceType] = useState<ConnectedDevice['deviceType']>('kitchen_display');
  const [newDeviceLocation, setNewDeviceLocation] = useState<string>('Kitchen Station');

  const pendingDevices = devices.filter((d) => d.status === 'pending_approval');
  const activeDevicesCount = devices.filter((d) => d.status === 'active').length;
  const disabledDevicesCount = devices.filter((d) => d.status === 'disabled').length;
  const pendingDevicesCount = pendingDevices.length;

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNew = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanNew) {
      setPasswordErrorMsg('Please type a new password or PIN.');
      return;
    }
    if (cleanConfirm && cleanNew !== cleanConfirm) {
      setPasswordErrorMsg('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    onUpdateSettings({ adminPassword: cleanNew });
    setPasswordSuccessMsg(`Master Admin Password successfully updated to "${cleanNew}"!`);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrorMsg('');
    setTimeout(() => setPasswordSuccessMsg(''), 5000);
  };

  const handleApplyQuickPin = (pin: string) => {
    onUpdateSettings({ adminPassword: pin });
    setPasswordSuccessMsg(`Master Admin Password updated to preset PIN: "${pin}"`);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrorMsg('');
    setTimeout(() => setPasswordSuccessMsg(''), 5000);
  };

  const handleResetPasswordToDefault = () => {
    onUpdateSettings({ adminPassword: '7419Fgwandu@_2304....' });
    setPasswordSuccessMsg('Password has been reset to default: "7419Fgwandu@_2304...."');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordErrorMsg('');
    setTimeout(() => setPasswordSuccessMsg(''), 4500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ownerName,
      ownerEmail,
      restaurantName,
      tagline,
      currency,
    });
    setProfileSuccessMsg('Ownership & restaurant details updated!');
    setTimeout(() => setProfileSuccessMsg(''), 3500);
  };

  const handleCreateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    onAddNewDevice({
      name: newDeviceName.trim(),
      deviceType: newDeviceType,
      assignedLocation: newDeviceLocation.trim() || 'Restaurant Floor',
      ipAddress: `192.168.1.${Math.floor(110 + Math.random() * 80)}`,
      browserInfo: 'Order Up KDS / Web Client',
      status: 'active',
      lastActive: Date.now(),
      registeredAt: Date.now(),
    });

    setNewDeviceName('');
    setIsPairingModalOpen(false);
  };

  const renderDeviceIcon = (type: ConnectedDevice['deviceType']) => {
    switch (type) {
      case 'pos':
        return <Monitor className="w-4 h-4 text-[#1f4d3e]" />;
      case 'kitchen_display':
        return <Tablet className="w-4 h-4 text-[#2c4a83]" />;
      case 'kiosk':
        return <Laptop className="w-4 h-4 text-[#c8791f]" />;
      case 'waiter_phone':
        return <Smartphone className="w-4 h-4 text-emerald-700" />;
      default:
        return <Monitor className="w-4 h-4 text-[#4c5a52]" />;
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Admin Top Banner */}
      <div className={`text-white rounded-3xl p-4 sm:p-5 shadow-sm border relative overflow-hidden transition-all duration-300 ${
        currentRole === UserRole.DEVELOPER
          ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-[#143529] border-indigo-500/50 shadow-lg shadow-indigo-950/20'
          : 'bg-[#1f4d3e] border-emerald-800'
      }`}>
        {/* Ambient developer accent */}
        {currentRole === UserRole.DEVELOPER && (
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full pointer-events-none" />
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-white shrink-0 ${
              currentRole === UserRole.DEVELOPER
                ? 'bg-indigo-600/40 border-indigo-400/50 shadow-inner'
                : 'bg-white/15 border-white/20'
            }`}>
              {currentRole === UserRole.DEVELOPER ? (
                <Terminal className="w-5 h-5 text-indigo-300" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold tracking-tight">
                  {currentRole === UserRole.DEVELOPER ? 'Developer Root Master Control' : 'Restaurant Management & Admin'}
                </h2>
                {currentRole === UserRole.DEVELOPER ? (
                  <>
                    <span className="text-[10px] font-extrabold uppercase bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/50 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-300" />
                      <span>App Developer (Full Root Ownership)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdminTab('business-owners')}
                      className="text-[10px] font-extrabold uppercase bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 hover:text-amber-100 px-2.5 py-0.5 rounded-full border border-amber-400/40 flex items-center gap-1 transition-colors cursor-pointer"
                      title="View & manage provisioned business owner credentials"
                    >
                      <Users className="w-3 h-3 text-amber-300" />
                      <span>{businessOwners.length} Owner Account{businessOwners.length !== 1 ? 's' : ''}</span>
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    Business Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-[#cfe0d7] mt-0.5">
                {currentRole === UserRole.DEVELOPER ? (
                  <span>
                    Root Developer Mode • Business Owner Credentials & Access Control • License: <strong className="text-white font-mono">{settings.ownershipLicense}</strong>
                  </span>
                ) : (
                  <span>
                    Owner: <strong className="text-white">{settings.ownerName}</strong> • License: {settings.ownershipLicense}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {currentRole === UserRole.DEVELOPER && (
              <button
                type="button"
                id="admin-top-manage-owners-btn"
                onClick={() => setAdminTab('business-owners')}
                className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="Create & manage usernames and passwords for business owners"
              >
                <Crown className="w-3.5 h-3.5 text-slate-950" />
                <span>Business Owners ({businessOwners.length})</span>
              </button>
            )}

            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                id="admin-open-system-settings-btn"
                className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                title="Open Restaurant & System Settings Panel"
              >
                <Settings className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">Settings & Preferences</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLockAdmin}
              id="admin-lock-session-btn"
              className="px-3 py-2 rounded-xl bg-black/25 hover:bg-black/40 text-[#cfe0d7] hover:text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 shrink-0"
              title="Lock Admin Session"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Session</span>
            </button>
          </div>
        </div>

        {/* Sub-nav tabs within Admin */}
        <div className="flex items-center gap-1.5 mt-4 bg-black/20 p-1.5 rounded-2xl border border-white/10 overflow-x-auto scrollbar-none">
          {/* Business Owner Credentials Tab: STRICTLY ACCESSIBLE TO APP DEVELOPER */}
          {currentRole === UserRole.DEVELOPER && (
            <button
              type="button"
              id="admin-tab-business-owners-btn"
              onClick={() => setAdminTab('business-owners')}
              className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
                adminTab === 'business-owners'
                  ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                  : 'text-amber-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Business Owners ({businessOwners.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setAdminTab('devices')}
            className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
              adminTab === 'devices'
                ? 'bg-white text-[#143529] shadow-sm'
                : 'text-[#dcebe3] hover:text-white hover:bg-white/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Staff & Device Access</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('inventory')}
            className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
              adminTab === 'inventory'
                ? 'bg-white text-[#143529] shadow-sm'
                : 'text-[#dcebe3] hover:text-white hover:bg-white/10'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Stock & Pricing</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('purchases')}
            className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
              adminTab === 'purchases'
                ? 'bg-white text-[#143529] shadow-sm'
                : 'text-[#dcebe3] hover:text-white hover:bg-white/10'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Procurement & Purchases</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('capital')}
            className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
              adminTab === 'capital'
                ? 'bg-white text-[#143529] shadow-sm'
                : 'text-[#dcebe3] hover:text-white hover:bg-white/10'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Capital Invested</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('analytics')}
            className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
              adminTab === 'analytics'
                ? 'bg-white text-[#143529] shadow-sm'
                : 'text-[#dcebe3] hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Reports</span>
          </button>

          {/* Ownership Tab: STRICTLY VISIBLE AND ACCESSIBLE TO APP DEVELOPER ONLY */}
          {currentRole === UserRole.DEVELOPER && (
            <button
              type="button"
              onClick={() => setAdminTab('ownership')}
              className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
                adminTab === 'ownership'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:text-white hover:bg-white/10'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Ownership & Master Keys</span>
            </button>
          )}

          {/* Dev Infra Tab: STRICTLY ENLISTED FOR DEVELOPER ONLY */}
          {currentRole === UserRole.DEVELOPER && (
            <button
              type="button"
              onClick={() => setAdminTab('developer')}
              className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
                adminTab === 'developer'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-300" />
              <span>Dev Infra</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: STAFF USERNAMES & PASSWORDS + CONNECTED DEVICES */}
      {adminTab === 'devices' && (
        <div className="space-y-6">
          {/* Sub-view switcher */}
          <div className="flex items-center justify-between gap-3 flex-wrap bg-white border border-[#e2e4dc] p-2 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setAccessSubView('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  accessSubView === 'all'
                    ? 'bg-[#1f4d3e] text-white shadow-xs'
                    : 'text-[#4c5a52] hover:bg-[#f4f5f0]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>All Access & Controls</span>
              </button>

              <button
                type="button"
                onClick={() => setAccessSubView('staff')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  accessSubView === 'staff'
                    ? 'bg-[#1f4d3e] text-white shadow-xs'
                    : 'text-[#4c5a52] hover:bg-[#f4f5f0]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Staff Usernames & Passwords</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  accessSubView === 'staff' ? 'bg-white text-[#1f4d3e]' : 'bg-[#e3ede8] text-[#143529]'
                }`}>
                  {staffList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAccessSubView('devices')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  accessSubView === 'devices'
                    ? 'bg-[#1f4d3e] text-white shadow-xs'
                    : 'text-[#4c5a52] hover:bg-[#f4f5f0]'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Connected Devices</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  accessSubView === 'devices' ? 'bg-white text-[#1f4d3e]' : 'bg-[#e3ede8] text-[#143529]'
                }`}>
                  {devices.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="create-staff-login-btn-top"
                onClick={() => {
                  setEditingStaffMember(null);
                  setIsStaffModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Create Staff Login</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: STAFF USERNAMES, PASSWORDS & APP ACCESS CONTROL                */}
          {/* ========================================================================= */}
          {(accessSubView === 'all' || accessSubView === 'staff') && (
            <div className="bg-white border border-[#e2e4dc] rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e2e4dc] pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#e3ede8] text-[#1f4d3e] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-extrabold text-[#1b2620]">
                        Staff Usernames, Passwords & App Access
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {staffList.length} Active Staff Accounts
                      </span>
                    </div>
                    <p className="text-xs text-[#4c5a52] mt-0.5">
                      Create, edit, and manage login usernames, passwords, 4-digit PINs, and access permissions for employees.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="add-staff-account-btn"
                    onClick={() => {
                      setEditingStaffMember(null);
                      setIsStaffModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add Staff Account</span>
                  </button>
                </div>
              </div>

              {/* Search & Info Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#8b978f]" />
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search staff by name, username, or role..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#fafbfa] border border-[#e2e4dc] rounded-xl focus:bg-white focus:outline-none focus:border-[#1f4d3e]"
                  />
                </div>

                <div className="text-[11px] text-[#8b978f] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Passwords and PINs are securely authenticated on POS login</span>
                </div>
              </div>

              {/* Staff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {staffList
                  .filter((staff) => {
                    if (!staffSearchQuery.trim()) return true;
                    const q = staffSearchQuery.toLowerCase();
                    return (
                      staff.name.toLowerCase().includes(q) ||
                      (staff.username && staff.username.toLowerCase().includes(q)) ||
                      staff.roleTitle.toLowerCase().includes(q) ||
                      (staff.pin && staff.pin.includes(q))
                    );
                  })
                  .map((staff) => {
                    const isRevealed = !!revealedPasswords[staff.id];
                    const isCopied = copiedStaffId === staff.id;
                    const isAccessDisabled = staff.accessEnabled === false;
                    const cleanUsername = staff.username || staff.name.toLowerCase().replace(/\s+/g, '_');
                    const cleanPassword = staff.password || 'staff123';
                    const cleanPin = staff.pin || '1234';

                    return (
                      <div
                        key={staff.id}
                        id={`staff-credential-card-${staff.id}`}
                        className={`rounded-2xl p-4 border transition-all shadow-2xs space-y-3 ${
                          isAccessDisabled
                            ? 'bg-rose-50/30 border-rose-200'
                            : 'bg-white border-[#e2e4dc] hover:border-emerald-300'
                        }`}
                      >
                        {/* Top Profile */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                              isAccessDisabled
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-[#e3ede8] text-[#143529]'
                            }`}>
                              {staff.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-extrabold text-[#1b2620] truncate">
                                {staff.name}
                              </h4>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] font-bold text-[#4c5a52]">
                                  {staff.roleTitle}
                                </span>
                                <span className={`text-[10px] font-black px-2 py-0.2 rounded-full uppercase border ${
                                  isAccessDisabled
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                }`}>
                                  {isAccessDisabled ? 'Login Locked' : 'Login Active'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStaffMember(staff);
                                setIsStaffModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-[#4c5a52] hover:bg-[#f4f5f0] hover:text-[#1b2620] transition-colors"
                              title="Edit staff details and password"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setStaffToDelete(staff)}
                              className="p-1.5 rounded-lg text-[#8b978f] hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Delete staff account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Credential Details Card */}
                        <div className="p-3 rounded-xl bg-[#fafbfa] border border-[#e2e4dc] space-y-2 text-xs">
                          {/* Username row */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-[#4c5a52] flex items-center gap-1">
                              <AtSign className="w-3 h-3 text-[#1f4d3e]" />
                              <span>Username:</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <code className="font-mono font-bold text-[#143529] bg-white px-2 py-0.5 rounded border border-[#e2e4dc]">
                                {cleanUsername}
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(cleanUsername);
                                  setCopiedStaffId(staff.id);
                                  setTimeout(() => setCopiedStaffId(null), 2000);
                                }}
                                className="p-1 text-[#8b978f] hover:text-[#1b2620]"
                                title="Copy username"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Password row */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-[#4c5a52] flex items-center gap-1">
                              <KeyRound className="w-3 h-3 text-[#1f4d3e]" />
                              <span>Password:</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <code className="font-mono font-bold text-emerald-900 bg-white px-2 py-0.5 rounded border border-[#e2e4dc]">
                                {isRevealed ? cleanPassword : '••••••••'}
                              </code>
                              <button
                                type="button"
                                onClick={() => {
                                  setRevealedPasswords((prev) => ({
                                    ...prev,
                                    [staff.id]: !prev[staff.id],
                                  }));
                                }}
                                className="p-1 text-[#4c5a52] hover:text-[#1b2620]"
                                title={isRevealed ? 'Hide password' : 'Show password'}
                              >
                                {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(cleanPassword);
                                  setCopiedStaffId(staff.id);
                                  setTimeout(() => setCopiedStaffId(null), 2000);
                                }}
                                className="p-1 text-[#8b978f] hover:text-[#1b2620]"
                                title="Copy password"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* PIN row */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-[#4c5a52]">Quick Access PIN:</span>
                            <span className="font-mono font-black text-xs text-[#143529] bg-white px-2 py-0.5 rounded border border-[#e2e4dc] tracking-wider">
                              {cleanPin}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Actions: Enable/Disable Access toggle */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateStaff) {
                                onUpdateStaff({
                                  ...staff,
                                  accessEnabled: staff.accessEnabled === false ? true : false,
                                });
                              }
                            }}
                            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                              isAccessDisabled
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isAccessDisabled ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Enable Login Access</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Disable Login Access</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const details = `OrderUp Staff Credentials\nName: ${staff.name}\nRole: ${staff.roleTitle}\nUsername: ${cleanUsername}\nPassword: ${cleanPassword}\nPIN: ${cleanPin}`;
                              navigator.clipboard?.writeText(details);
                              setCopiedStaffId(staff.id);
                              setTimeout(() => setCopiedStaffId(null), 2500);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-[#e2e4dc] bg-white hover:bg-[#f4f5f0] text-[#4c5a52] text-xs font-bold transition-all flex items-center gap-1"
                            title="Copy full credentials slip"
                          >
                            {isCopied ? (
                              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                                <Check className="w-3 h-3" /> Copied
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Info</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {staffList.length === 0 && (
                  <div className="col-span-full p-8 text-center bg-[#fafbfa] border border-dashed border-[#e2e4dc] rounded-2xl space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#e3ede8] text-[#1f4d3e] flex items-center justify-center mx-auto">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1b2620]">No Staff Accounts Found</h4>
                      <p className="text-xs text-[#8b978f] mt-0.5">
                        Create staff accounts so cashiers, waiters, and kitchen chefs can log in with usernames and passwords.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStaffMember(null);
                        setIsStaffModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-all inline-flex items-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Create First Staff Account</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: CONNECTED DEVICES & TERMINALS CONTROL                          */}
          {/* ========================================================================= */}
          {(accessSubView === 'all' || accessSubView === 'devices') && (
            <div className="space-y-4">
              {/* MASTER DEVICE CONTROL & AUTHORIZATION FUNCTION SWITCH */}
              <div className={`rounded-3xl p-4 sm:p-5 border-2 transition-all shadow-xs ${
                settings.deviceControlEnabled !== false
                  ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white border-emerald-300'
                  : 'bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-white border-rose-400 ring-2 ring-rose-300'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                      settings.deviceControlEnabled !== false
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-rose-600 text-white shadow-xs animate-pulse'
                    }`}>
                      {settings.deviceControlEnabled !== false ? (
                        <ShieldCheck className="w-6 h-6" />
                      ) : (
                        <PowerOff className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#1b2620]">
                          Device Control & Authorization Function
                        </h3>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                          settings.deviceControlEnabled !== false
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}>
                          {settings.deviceControlEnabled !== false ? '● ACTIVE & PROTECTED' : '○ DISABLED / BYPASSED'}
                        </span>
                      </div>
                      <p className="text-xs text-[#4c5a52] mt-1 leading-relaxed max-w-xl">
                        {settings.deviceControlEnabled !== false
                          ? 'Device management security is ENABLED. New terminals require pairing approval, and locked terminals cannot access the POS.'
                          : 'Device management security is DISABLED. All terminal lockout barriers and approval checks are temporarily turned off.'}
                      </p>
                    </div>
                  </div>

                  {/* Master Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      id="toggle-device-control-function-btn"
                      onClick={() => {
                        if (onToggleDeviceControlFunction) {
                          onToggleDeviceControlFunction();
                        } else {
                          onUpdateSettings({
                            deviceControlEnabled: settings.deviceControlEnabled === false,
                          });
                        }
                      }}
                      className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs active:scale-95 ${
                        settings.deviceControlEnabled !== false
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                      <span>
                        {settings.deviceControlEnabled !== false
                          ? 'Disable Device Control Function'
                          : 'Enable Device Control Function'}
                      </span>
                    </button>

                    {onEnableAllDevices && (
                      <button
                        type="button"
                        id="enable-all-devices-btn"
                        onClick={() => {
                          onEnableAllDevices();
                        }}
                        className="px-3 py-2 rounded-xl bg-white border border-[#e2e4dc] hover:bg-[#e3ede8] text-[#143529] text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        title="Enable and approve all devices"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Authorize All</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-white border border-[#e2e4dc] rounded-2xl p-3 sm:p-3.5 shadow-2xs">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#8b978f] uppercase tracking-wider block truncate">
                    Active Terminals
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-700">
                      {activeDevicesCount}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#8b978f] hidden xs:inline">authorized</span>
                  </div>
                </div>

                <div className={`border rounded-2xl p-3 sm:p-3.5 shadow-2xs transition-all ${
                  pendingDevicesCount > 0
                    ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/30'
                    : 'bg-white border-[#e2e4dc]'
                }`}>
                  <span className="text-[10px] sm:text-[11px] font-bold text-amber-900 uppercase tracking-wider block truncate">
                    Pending Approval
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold text-amber-600">
                      {pendingDevicesCount}
                    </span>
                    <span className="text-[10px] sm:text-xs text-amber-700">
                      {pendingDevicesCount > 0 ? 'action needed' : 'none'}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-[#e2e4dc] rounded-2xl p-3 sm:p-3.5 shadow-2xs">
                  <span className="text-[10px] sm:text-[11px] font-bold text-[#8b978f] uppercase tracking-wider block truncate">
                    Disabled / Revoked
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-xl sm:text-2xl font-extrabold text-[#b3402f]">
                      {disabledDevicesCount}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#8b978f] hidden xs:inline">locked out</span>
                  </div>
                </div>
              </div>

              {/* CRITICAL ALERT BANNER: NEW DEVICE AUTHORIZATION REQUESTS */}
              {pendingDevicesCount > 0 && (
                <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-bold animate-bounce shadow-xs">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
                          <span>Device Authorization Alert</span>
                          <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            {pendingDevicesCount} Pending
                          </span>
                        </h3>
                        <p className="text-xs text-amber-900/80 mt-0.5">
                          New app installations require your explicit permission to access the POS system.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pending Device Items */}
                  <div className="space-y-2.5">
                    {pendingDevices.map((device) => (
                      <div
                        key={device.id}
                        className="bg-white border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                            {renderDeviceIcon(device.deviceType)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-[#1b2620] truncate">
                                {device.name}
                              </h4>
                              {device.pairingCode && (
                                <span className="font-mono text-xs font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
                                  Code: {device.pairingCode}
                                </span>
                              )}
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-black">
                                New Install
                              </span>
                            </div>
                            <p className="text-xs text-[#4c5a52] mt-1">
                              Location: <span className="font-semibold">{device.assignedLocation}</span> • IP: <span className="font-mono">{device.ipAddress}</span>
                            </p>
                            <p className="text-[11px] text-[#8b978f]">
                              Client: {device.browserInfo} • Requested: {formatTimeAgo(device.requestedAt || device.lastActive)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            id={`allow-device-${device.id}`}
                            onClick={() => onApproveDevice?.(device.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Allow Device to Start</span>
                          </button>

                          <button
                            type="button"
                            id={`reject-device-${device.id}`}
                            onClick={() => onRejectDevice?.(device.id)}
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                          >
                            <PowerOff className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Header */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-sm font-bold text-[#1b2620] flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#1f4d3e]" />
                    <span>Connected Devices & Terminals</span>
                  </h3>
                  <p className="text-xs text-[#8b978f]">
                    Manage POS, KDS tablets, kiosks, and remote staff terminals
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {onSimulatePendingAndroidDevice && (
                    <button
                      type="button"
                      id="simulate-pending-device-btn"
                      onClick={onSimulatePendingAndroidDevice}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-100 transition-all flex items-center gap-1 shadow-2xs"
                      title="Simulate a new Android device installation request"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                      <span>+ Test Device Alert</span>
                    </button>
                  )}

                  {onOpenAndroidAppModal && (
                    <button
                      type="button"
                      id="admin-android-hub-btn"
                      onClick={onOpenAndroidAppModal}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Android POS Hub</span>
                    </button>
                  )}

                  <button
                    type="button"
                    id="pair-device-btn"
                    onClick={() => setIsPairingModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Pair New</span>
                  </button>

                  {activeDevicesCount > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        onDisableAllRemoteDevices();
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 text-[#b3402f] hover:bg-red-100 text-xs font-bold transition-all cursor-pointer"
                      title="Lockdown remote terminals"
                    >
                      Disable Remotes
                    </button>
                  )}
                </div>
              </div>

              {/* Device Cards List */}
              <div className="space-y-3">
                {devices.map((device) => {
                  const isDisabled = device.status === 'disabled';
                  const isPending = device.status === 'pending_approval';

                  return (
                    <div
                      key={device.id}
                      id={`device-card-${device.id}`}
                      className={`bg-white border rounded-2xl p-4 transition-all shadow-2xs ${
                        isPending
                          ? 'border-amber-300 bg-amber-50/25 ring-1 ring-amber-300'
                          : isDisabled
                          ? 'border-red-200 bg-red-50/20 opacity-85'
                          : 'border-[#e2e4dc]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              isPending
                                ? 'bg-amber-100 text-amber-800'
                                : isDisabled
                                ? 'bg-red-100 text-[#b3402f]'
                                : 'bg-[#e3ede8] text-[#143529]'
                            }`}
                          >
                            {renderDeviceIcon(device.deviceType)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-[#1b2620] truncate">
                                {device.name}
                              </h4>
                              {device.pairingCode && (
                                <span className="font-mono text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200">
                                  {device.pairingCode}
                                </span>
                              )}
                              {device.isCurrent && (
                                <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-[#1f4d3e] text-white">
                                  This Device
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                  isPending
                                    ? 'bg-amber-100 text-amber-800 font-extrabold'
                                    : isDisabled
                                    ? 'bg-[#f6e2de] text-[#b3402f]'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isPending ? 'Pending Approval' : isDisabled ? 'Disabled' : 'Active'}
                              </span>
                            </div>

                            <p className="text-xs text-[#4c5a52] mt-0.5">
                              Location: <span className="font-semibold">{device.assignedLocation}</span> • IP: <span className="font-mono">{device.ipAddress}</span>
                            </p>
                            <p className="text-[11px] text-[#8b978f]">
                              Client: {device.browserInfo} • Last active: {formatTimeAgo(device.lastActive)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                          {isPending ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onApproveDevice?.(device.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Allow</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onRejectDevice?.(device.id)}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              id={`toggle-device-${device.id}`}
                              onClick={() => onToggleDeviceStatus(device.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                                isDisabled
                                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                  : 'bg-[#b3402f] hover:bg-[#8a2c1f] text-white'
                              }`}
                            >
                              {isDisabled ? (
                                <>
                                  <Power className="w-3.5 h-3.5" />
                                  <span>Enable Access</span>
                                </>
                              ) : (
                                <>
                                  <PowerOff className="w-3.5 h-3.5" />
                                  <span>Disable Device</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* DELETE / DISCONNECT DEVICE BUTTON */}
                          <button
                            type="button"
                            id={`delete-device-${device.id}`}
                            onClick={() => setDeviceToDelete(device)}
                            className="px-2.5 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title={`Delete & remove ${device.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Device</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#f4f5f0] border border-[#e2e4dc] rounded-2xl p-4 text-xs text-[#4c5a52] space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#1b2620]">
                  <Info className="w-4 h-4 text-[#1f4d3e]" />
                  <span>Device Security & Deletion Policy</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-[#4c5a52]">
                  Disabling a terminal instantly blocks all order creation and ticket updates on that device. Deleting a device permanently purges its authorized token and hardware pairing record from the restaurant network.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: BUSINESS OWNER USERNAMES & PASSWORDS (DEVELOPER ROOT MASTER CONTROL) */}
      {adminTab === 'business-owners' && currentRole === UserRole.DEVELOPER && (
        <BusinessOwnerAccountsPanel
          businessOwners={businessOwners}
          settings={settings}
          onAddOwner={onAddBusinessOwner || (() => {})}
          onUpdateOwner={onUpdateBusinessOwner || (() => {})}
          onDeleteOwner={onDeleteBusinessOwner || (() => {})}
          onUpdateSettings={onUpdateSettings}
        />
      )}

      {/* TAB 2: OWNERSHIP & MASTER SECURITY (STRICTLY FOR DEVELOPER ROLE) */}
      {adminTab === 'ownership' && currentRole === UserRole.DEVELOPER && (
        <div className="space-y-6">
          {/* Business Owner Credentials Manager */}
          <BusinessOwnerAccountsPanel
            businessOwners={businessOwners}
            settings={settings}
            onAddOwner={onAddBusinessOwner || (() => {})}
            onUpdateOwner={onUpdateBusinessOwner || (() => {})}
            onDeleteOwner={onDeleteBusinessOwner || (() => {})}
            onUpdateSettings={onUpdateSettings}
          />

          {/* Password Update Form */}
          <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[#1b2620] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#1f4d3e]" />
                  <span>Master Admin Password Settings</span>
                </h3>
                <p className="text-xs text-[#8b978f]">
                  Master security key required to unlock Admin, manage prices, authorize devices, and view revenues
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#f4f5f0] text-[#4c5a52] border border-[#e2e4dc] flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#1f4d3e]" />
                  <span>
                    {settings.adminPassword === '7419Fgwandu@_2304....' || settings.adminPassword === 'admin' ? (
                      <span className="text-emerald-800 font-extrabold">Default Admin Password Active</span>
                    ) : (
                      <span className="text-emerald-800 font-extrabold">Custom Password Active</span>
                    )}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleResetPasswordToDefault}
                  title="Reset password back to default"
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#4c5a52] text-[11px] font-bold transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Default</span>
                </button>
              </div>
            </div>

            {/* Current Active Password Card */}
            <div className="bg-[#f8f9f5] border border-[#e2e4dc] rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 text-[#1f4d3e] shrink-0" />
                <div className="text-xs">
                  <span className="text-[#4c5a52] font-semibold">Active Current Password: </span>
                  <span className="font-mono font-bold text-[#1b2620] bg-white px-2 py-0.5 rounded border border-[#e2e4dc] ml-1">
                    {showCurrentPassword ? settings.adminPassword : '••••••••'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="text-xs font-bold text-[#1f4d3e] hover:text-[#143529] px-2.5 py-1 rounded-lg bg-white border border-[#e2e4dc] hover:bg-gray-50 transition-colors flex items-center gap-1 shrink-0"
              >
                {showCurrentPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Reveal</span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    New Master Password or PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="new-admin-password-input"
                      placeholder="Enter new password (e.g. 1234)..."
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordErrorMsg) setPasswordErrorMsg('');
                      }}
                      className="w-full p-2.5 pr-10 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b978f] hover:text-[#1b2620] p-1"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1 flex items-center justify-between">
                    <span>Confirm Master Password</span>
                    {newPassword && confirmPassword && (
                      <span className={`text-[10px] font-bold ${newPassword.trim() === confirmPassword.trim() ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {newPassword.trim() === confirmPassword.trim() ? '✓ Passwords Match' : 'Mismatch'}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm-admin-password-input"
                      placeholder="Re-type new password..."
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordErrorMsg) setPasswordErrorMsg('');
                      }}
                      className="w-full p-2.5 pr-10 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b978f] hover:text-[#1b2620] p-1"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Preset PINs for Convenience */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-[#8b978f] mr-1">Quick PIN presets:</span>
                {['1234', '0000', '2550', 'admin'].map((pin) => (
                  <button
                    key={pin}
                    type="button"
                    onClick={() => {
                      setNewPassword(pin);
                      setConfirmPassword(pin);
                      if (passwordErrorMsg) setPasswordErrorMsg('');
                    }}
                    className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#f4f5f0] hover:bg-[#e2e4dc] text-[#1b2620] rounded-md border border-[#e2e4dc] transition-colors"
                  >
                    {pin}
                  </button>
                ))}
              </div>

              {passwordErrorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-[#b3402f] font-bold flex items-center gap-1.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              {passwordSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 font-bold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-[#8b978f]">
                  Emergency access is always available with master key <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[#1f4d3e] font-bold">admin</code>
                </p>
                <button
                  type="submit"
                  id="save-password-btn"
                  disabled={!newPassword.trim()}
                  className="px-4 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save New Password</span>
                </button>
              </div>
            </form>
          </div>

          {/* Restaurant & Ownership Profile */}
          <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#1b2620] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1f4d3e]" />
                  <span>Restaurant Ownership & Profile</span>
                </h3>
                <p className="text-xs text-[#8b978f]">
                  Brand identity, official logo, owner contact, and currency settings
                </p>
              </div>
              <BrandLogo size="lg" />
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    Owner Email Address
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    Restaurant Brand Name
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-2.5 text-sm bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                />
              </div>

              {profileSuccessMsg && (
                <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {profileSuccessMsg}
                </p>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-all shadow-xs"
                >
                  Save Ownership Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK & INVENTORY */}
      {adminTab === 'inventory' && (
        <InventoryView
          items={items}
          settings={settings}
          onUpdateStock={onUpdateStock}
          onUpdatePrice={onUpdatePrice}
          onAddNewItem={onAddNewItem}
          onDeleteItem={onDeleteItem}
          onEditItem={onEditItem}
          onChangeDishImage={onChangeDishImage}
        />
      )}

      {/* TAB: PROCUREMENT & PURCHASES */}
      {adminTab === 'purchases' && (
        <PurchasesView
          purchases={purchases}
          settings={settings}
          onAddPurchase={onAddPurchase || (() => {})}
          onDeletePurchase={onDeletePurchase || (() => {})}
        />
      )}

      {/* TAB: CAPITAL INVESTED & FINANCES */}
      {adminTab === 'capital' && (
        <FinancesView
          orders={orders}
          purchases={purchases}
          capital={capital}
          mpesaTransactions={mpesaTransactions}
          settings={settings}
          onUpdateCapital={onUpdateCapital || (() => {})}
          onOpenPurchases={() => setAdminTab('purchases')}
          onOpenMpesa={() => {}}
          onOpenDebts={() => {}}
        />
      )}

      {/* TAB 4: ANALYTICS & REPORTS */}
      {adminTab === 'analytics' && (
        <AnalyticsView
          orders={orders}
          items={items}
          settings={settings}
          staffList={staffList}
          onResetData={onResetData}
        />
      )}

      {/* TAB 5: DEVELOPER-ONLY INFRA & RBAC MATRIX */}
      {adminTab === 'developer' && currentRole === UserRole.DEVELOPER && (
        <DeveloperInfraPanel
          currentRole={currentRole}
          onSwitchRole={onSwitchRole}
          restaurantName={settings.restaurantName}
          onResetReport={onResetReport}
          onResetAllReports={onResetAllReports}
          onResetData={onResetData}
        />
      )}

      {/* Modal: Pair New Device */}
      {isPairingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#e2e4dc] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#1b2620]">Pair New Device / Terminal</h4>
              <button
                type="button"
                onClick={() => setIsPairingModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[#4c5a52]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDevice} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                  Device Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kitchen Grill Display 2"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                  Device Type
                </label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                >
                  <option value="kitchen_display">Kitchen Display Tablet (KDS)</option>
                  <option value="pos">Bar / Cashier POS Counter</option>
                  <option value="kiosk">Customer Self-Order Kiosk</option>
                  <option value="waiter_phone">Waiter Handheld Terminal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                  Assigned Location / Zone
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bar Station 1"
                  value={newDeviceLocation}
                  onChange={(e) => setNewDeviceLocation(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-[#e2e4dc] rounded-xl focus:outline-none focus:border-[#1f4d3e]"
                />
              </div>

              <div className="bg-[#e3ede8] p-2.5 rounded-xl text-[11px] text-[#143529] font-medium flex items-center gap-2">
                <QrCode className="w-4 h-4 shrink-0 text-[#1f4d3e]" />
                <span>Device will be immediately authorized on the restaurant local network.</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPairingModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-[#e2e4dc] text-xs font-bold text-[#4c5a52]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529]"
                >
                  Authorize Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Staff Login Credentials */}
      <NewStaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setEditingStaffMember(null);
        }}
        onSave={(staff) => {
          if (editingStaffMember) {
            onUpdateStaff?.(staff);
          } else {
            onAddStaff?.(staff);
          }
          setIsStaffModalOpen(false);
          setEditingStaffMember(null);
        }}
        editingStaff={editingStaffMember}
        settings={settings}
      />

      {/* Staff Delete Confirmation Dialog */}
      {staffToDelete && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-red-900">Delete Staff Member</h3>
              <p className="text-xs text-[#4c5a52] mt-1.5 leading-relaxed">
                Are you sure you want to delete <strong>"{staffToDelete.name}"</strong>? Their login access, PIN, and permissions will be permanently revoked.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e4dc]">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e4dc] text-xs font-bold text-[#4c5a52] hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStaff?.(staffToDelete.id);
                  setStaffToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Staff</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Delete Confirmation Dialog */}
      {deviceToDelete && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4 animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-red-900">Disconnect &amp; Delete Device</h3>
              <p className="text-xs text-[#4c5a52] mt-1.5 leading-relaxed">
                Are you sure you want to delete and disconnect <strong>"{deviceToDelete.name}"</strong>? This device terminal will lose access to order taking and live kitchen sync.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e4dc]">
              <button
                type="button"
                onClick={() => setDeviceToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e4dc] text-xs font-bold text-[#4c5a52] hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDevice(deviceToDelete.id);
                  setDeviceToDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Device</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
