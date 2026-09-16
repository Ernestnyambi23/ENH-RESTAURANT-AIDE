import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Settings,
  Shield,
  ShieldCheck,
  Palette,
  Sliders,
  BarChart3,
  Users,
  Share2,
  Copy,
  Check,
  Phone,
  PhoneCall,
  Globe,
  Sun,
  Moon,
  Image as ImageIcon,
  FileText,
  Save,
  KeyRound,
  RefreshCw,
  Trash2,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Send,
  MessageSquare,
  Mail,
  UserPlus,
  Edit2,
  Pencil,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Upload,
  Eye,
  EyeOff,
  Layers,
  Crop,
  FileImage,
  Terminal,
  Zap,
  Boxes,
  ShoppingBag,
  Wallet,
  Crown,
  Maximize2,
  Lock,
  Search,
  RotateCcw,
  Info,
  ShieldAlert,
  Store,
} from 'lucide-react';
import {
  RestaurantSettings,
  StaffMember,
  OneTimePasscode,
  Order,
  MenuItem,
  ConnectedDevice,
  Language,
  AppTheme,
  Purchase,
  Capital,
  MpesaTransaction,
  BusinessOwnerAccount,
  TopBarLayoutConfig,
  TenantRestaurant,
  RestaurantBranch,
} from '../types';
import { UserRole } from '../utils/rbac';
import { DeveloperInfraPanel } from './DeveloperInfraPanel';
import { formatCurrency, formatTimeAgo } from '../utils/formatters';
import { useAppTranslation } from '../utils/translations';
import { downloadMonthlyReportPDF, getWhatsAppShareUrl } from '../utils/pdfReport';
import { DailySalesSummary } from './DailySalesSummary';
import { ReportTimeSelector } from './ReportTimeSelector';
import { NewStaffModal } from './NewStaffModal';
import { StaffPayrollSection } from './StaffPayrollSection';
import { PaymentTillManager } from './PaymentTillManager';
import { ColorSchemeSettings } from './ColorSchemeSettings';
import { UnifiedSettingsCard } from './UnifiedSettingsCard';
import { InventoryView } from './InventoryView';
import { PurchasesView } from './PurchasesView';
import { FinancesView } from './FinancesView';
import { BusinessOwnerAccountsPanel } from './BusinessOwnerAccountsPanel';
import { TopBarSettingsPanel } from './TopBarSettingsPanel';
import { MyBranchesSettingsPanel } from './MyBranchesSettingsPanel';
import { sound } from '../utils/sound';
import { compressImageFile } from '../utils/imageCompressor';
import { triggerHaptic } from '../utils/haptics';

export type SettingsTab =
  | 'appearance'
  | 'top_bar'
  | 'admin_control'
  | 'branches'
  | 'inventory'
  | 'staff_mgmt'
  | 'purchases'
  | 'capital'
  | 'analytics_reports'
  | 'payment_tills'
  | 'business_owners'
  | 'developer_infra';

interface SettingsAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RestaurantSettings;
  onUpdateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  staffList: StaffMember[];
  onAddStaff: (staff: StaffMember) => void;
  onUpdateStaff: (staff: StaffMember) => void;
  onDeleteStaff: (staffId: string) => void;
  onToggleStaffSalaryPaid: (staffId: string) => void;
  otps: OneTimePasscode[];
  onGenerateOTP: (note?: string) => OneTimePasscode;
  onRevokeOTP: (otpId: string) => void;
  onAuthorizeDeviceByOTP: (code: string) => boolean;
  orders: Order[];
  items: MenuItem[];
  devices: ConnectedDevice[];
  onResetAnalytics: () => void;
  onResetData?: () => void;
  onResetReport?: (reportId: string, resetKey: string) => boolean | void;
  onResetAllReports?: (masterKey: string) => boolean | void;
  onLockAdmin: () => void;
  currentRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onOpenAuthModal?: () => void;
  initialTab?: SettingsTab;

  // Full Admin Components
  onUpdateStock?: (itemId: string, newStock: number) => void;
  onUpdatePrice?: (itemId: string, newPrice: number, variantLabel?: string) => void;
  onAddNewItem?: () => void;
  onDeleteItem?: (itemId: string) => void;
  onEditItem?: (item: MenuItem) => void;
  onChangeDishImage?: (item: MenuItem) => void;

  purchases?: Purchase[];
  onAddPurchase?: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  onDeletePurchase?: (id: string) => void;

  capital?: Capital;
  onUpdateCapital?: (newAmount: number, notes?: string) => void;
  mpesaTransactions?: MpesaTransaction[];

  businessOwners?: BusinessOwnerAccount[];
  onAddBusinessOwner?: (owner: BusinessOwnerAccount) => void;
  onUpdateBusinessOwner?: (owner: BusinessOwnerAccount) => void;
  onDeleteBusinessOwner?: (ownerId: string) => void;

  onToggleDeviceStatus?: (deviceId: string) => void;
  onApproveDevice?: (deviceId: string) => void;
  onRejectDevice?: (deviceId: string) => void;
  onAddNewDevice?: (device: Partial<ConnectedDevice>) => void;
  onDeleteDevice?: (deviceId: string) => void;
  onDisableAllRemoteDevices?: () => void;
  onEnableAllDevices?: () => void;
  onToggleDeviceControlFunction?: () => void;
  onSimulatePendingAndroidDevice?: () => void;
  onNavigateToFullAdminView?: () => void;
  topBarConfig?: TopBarLayoutConfig;
  onUpdateTopBarConfig?: (newConfig: TopBarLayoutConfig) => void;
  tenants?: TenantRestaurant[];
  currentTenantId?: string;
  onDeleteTenant?: (tenantId: string) => void;
  onSelectTenant?: (tenant: TenantRestaurant) => void;
  onAddBranch?: (branchData: Omit<RestaurantBranch, 'id' | 'createdAt'>) => void;
  onUpdateBranch?: (branchId: string, updates: Partial<RestaurantBranch>) => void;
  onDeleteBranch?: (branchId: string) => void;
  onSelectBranch?: (branchId: string) => void;
}

export const SettingsAdminPanel: React.FC<SettingsAdminPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  staffList,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onToggleStaffSalaryPaid,
  otps,
  onGenerateOTP,
  onRevokeOTP,
  onAuthorizeDeviceByOTP,
  orders,
  items,
  devices,
  onResetAnalytics,
  onResetData,
  onResetReport,
  onResetAllReports,
  onLockAdmin,
  currentRole = UserRole.OWNER,
  onSwitchRole,
  onOpenAuthModal,
  initialTab,

  // Full Admin Components
  onUpdateStock,
  onUpdatePrice,
  onAddNewItem,
  onDeleteItem,
  onEditItem,
  onChangeDishImage,
  purchases = [],
  onAddPurchase,
  onDeletePurchase,
  capital,
  onUpdateCapital,
  mpesaTransactions = [],
  businessOwners = [],
  onAddBusinessOwner,
  onUpdateBusinessOwner,
  onDeleteBusinessOwner,
  onToggleDeviceStatus,
  onApproveDevice,
  onRejectDevice,
  onAddNewDevice,
  onDeleteDevice,
  onDisableAllRemoteDevices,
  onEnableAllDevices,
  onToggleDeviceControlFunction,
  onSimulatePendingAndroidDevice,
  onNavigateToFullAdminView,
  topBarConfig,
  onUpdateTopBarConfig,
  tenants = [],
  currentTenantId,
  onDeleteTenant,
  onSelectTenant,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onSelectBranch,
}) => {
  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];

  const getInitialTab = (): SettingsTab => {
    if (currentRole === UserRole.DEVELOPER) {
      return (initialTab as SettingsTab) || 'appearance';
    }
    if (currentRole === UserRole.OWNER) {
      if (!initialTab || initialTab === 'appearance' || initialTab === 'developer_infra' || initialTab === 'top_bar') {
        return 'admin_control';
      }
      return initialTab as SettingsTab;
    }
    return 'admin_control';
  };

  const [activeTab, setActiveTab] = useState<SettingsTab>(getInitialTab());
  const { t } = useAppTranslation(settings.language || 'en');

  // Ensure activeTab stays in bounds if role changes or unauthorized role selects developer-only tabs
  React.useEffect(() => {
    if (currentRole !== UserRole.DEVELOPER) {
      if (activeTab === 'appearance' || activeTab === 'developer_infra' || activeTab === 'top_bar') {
        setActiveTab('admin_control');
      }
    }
  }, [currentRole, activeTab]);

  // Appearance Tab States
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [admissionPolicyText, setAdmissionPolicyText] = useState<string>(settings.admissionPolicy || '');
  const [policySavedToast, setPolicySavedToast] = useState<boolean>(false);
  const [appearanceSavedToast, setAppearanceSavedToast] = useState<boolean>(false);

  // Appearance controls local state
  const [localTheme, setLocalTheme] = useState<AppTheme>(settings.theme || 'light');
  const [localLanguage, setLocalLanguage] = useState<Language>(settings.language || 'en');
  const [localBgImage, setLocalBgImage] = useState<string>(settings.backgroundImage || '');
  const [localBgOpacity, setLocalBgOpacity] = useState<number>(settings.backgroundOpacity ?? 0.18);
  const [localBgBlur, setLocalBgBlur] = useState<number>(settings.backgroundBlur ?? 0);
  const [localReduceBlur, setLocalReduceBlur] = useState<boolean>(settings.reduceBlur !== false);
  const [localBgFit, setLocalBgFit] = useState<'cover' | 'contain' | 'tile'>(settings.backgroundFit || 'cover');
  const [localBgOverlay, setLocalBgOverlay] = useState<'none' | 'light' | 'dark' | 'emerald' | 'warm'>(settings.backgroundOverlay || 'none');
  const [localHeaderWallpaper, setLocalHeaderWallpaper] = useState<string>(settings.headerBgImage || '');
  const [customBgUrlInput, setCustomBgUrlInput] = useState<string>('');
  const [isUploadingBg, setIsUploadingBg] = useState<boolean>(false);
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Store Profile & Admin Details States
  const [storeLogoUrl, setStoreLogoUrl] = useState<string>(settings.logoUrl || '/logo.jpg');
  const [storeName, setStoreName] = useState<string>(settings.restaurantName || '');
  const [storeTagline, setStoreTagline] = useState<string>(settings.tagline || '');
  const [storeCurrency, setStoreCurrency] = useState<string>(settings.currency || 'TZS');
  const [storeOwnerName, setStoreOwnerName] = useState<string>(settings.ownerName || '');
  const [storeOwnerEmail, setStoreOwnerEmail] = useState<string>(settings.ownerEmail || '');
  const [storeAddress, setStoreAddress] = useState<string>(settings.address || '');
  const [storePhone, setStorePhone] = useState<string>(settings.phone || '');
  const [storeTaxRate, setStoreTaxRate] = useState<number>(settings.taxRate ?? 18);
  const [storeVatEnabled, setStoreVatEnabled] = useState<boolean>(settings.vatEnabled ?? false);
  const [storeReceiptHeader, setStoreReceiptHeader] = useState<string>(settings.receiptHeader || '');
  const [storeReceiptFooter, setStoreReceiptFooter] = useState<string>(settings.receiptFooter || '');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');

  // Master Admin Password States
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState<string>('');
  const [showAdminPassword, setShowAdminPassword] = useState<boolean>(false);
  const [showCurrentAdminPassword, setShowCurrentAdminPassword] = useState<boolean>(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string>('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>('');

  // Admin Control Tab States (OTP & Diagnostics)
  const [otpNote, setOtpNote] = useState<string>('');
  const [testOtpCode, setTestOtpCode] = useState<string>('');
  const [otpVerifyMsg, setOtpVerifyMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [showDeleteRestaurantModal, setShowDeleteRestaurantModal] = useState<boolean>(false);
  const [tenantToDeleteId, setTenantToDeleteId] = useState<string>(currentTenantId || '');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Analytics & Reporting States
  const [newEmailInput, setNewEmailInput] = useState<string>('');
  const [whatsAppInput, setWhatsAppInput] = useState<string>(settings.reportWhatsAppNumber || '+255713057325');
  const [reportSuccessToast, setReportSuccessToast] = useState<string>('');

  // Staff Management States
  const [staffSubTab, setStaffSubTab] = useState<'directory' | 'ai_payroll'>('directory');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState<string>('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null);

  // Sync state if initialTab or settings change
  useEffect(() => {
    if (isOpen) {
      setLocalTheme(settings.theme || 'light');
      setLocalLanguage(settings.language || 'en');
      setLocalBgImage(settings.backgroundImage || '');
      setLocalBgOpacity(settings.backgroundOpacity ?? 0.18);
      setLocalBgBlur(settings.backgroundBlur ?? 0);
      setLocalBgFit(settings.backgroundFit || 'cover');
      setLocalBgOverlay(settings.backgroundOverlay || 'none');
      setLocalHeaderWallpaper(settings.headerBgImage || '');
      setAdmissionPolicyText(settings.admissionPolicy || '');
      setCustomBgUrlInput('');
      setUploadErrorMsg(null);
      setWhatsAppInput(settings.reportWhatsAppNumber || '+255713057325');

      // Store Details & Master Password
      setStoreLogoUrl(settings.logoUrl || '/logo.jpg');
      setStoreName(settings.restaurantName || '');
      setStoreTagline(settings.tagline || '');
      setStoreCurrency(settings.currency || 'TZS');
      setStoreOwnerName(settings.ownerName || '');
      setStoreOwnerEmail(settings.ownerEmail || '');
      setStoreAddress(settings.address || '');
      setStorePhone(settings.phone || '');
      setStoreTaxRate(settings.taxRate ?? 18);
      setStoreVatEnabled(settings.vatEnabled ?? false);
      setStoreReceiptHeader(settings.receiptHeader || '');
      setStoreReceiptFooter(settings.receiptFooter || '');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setPasswordSuccessMsg('');
      setPasswordErrorMsg('');
      setProfileSuccessMsg('');
    }
  }, [isOpen, settings]);

  const handleSaveStoreProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      logoUrl: storeLogoUrl.trim() || '/logo.jpg',
      restaurantName: storeName.trim() || settings.restaurantName,
      tagline: storeTagline.trim(),
      currency: storeCurrency,
      ownerName: storeOwnerName.trim() || settings.ownerName,
      ownerEmail: storeOwnerEmail.trim() || settings.ownerEmail,
      address: storeAddress.trim() || settings.address,
      phone: storePhone.trim() || settings.phone,
      taxRate: Number(storeTaxRate) || 0,
      vatEnabled: storeVatEnabled,
      receiptHeader: storeReceiptHeader.trim(),
      receiptFooter: storeReceiptFooter.trim(),
    });
    setProfileSuccessMsg('Store profile, unique address, and taxation rules saved successfully!');
    sound.playSuccess();
    setTimeout(() => setProfileSuccessMsg(''), 3500);
  };

  const handleSaveAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!newAdminPassword.trim()) {
      setPasswordErrorMsg('Please enter a valid new password.');
      return;
    }
    if (newAdminPassword.length < 4) {
      setPasswordErrorMsg('Password must be at least 4 characters long.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    onUpdateSettings({ adminPassword: newAdminPassword });
    setPasswordSuccessMsg('Master Admin Password successfully updated!');
    sound.playSuccess();
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    setTimeout(() => setPasswordSuccessMsg(''), 4000);
  };

  const handleResetAdminPasswordToDefault = () => {
    onUpdateSettings({ adminPassword: '7419Fgwandu@' });
    setPasswordSuccessMsg('Admin password reset to system default ("7419Fgwandu@")!');
    sound.playSuccess();
    setTimeout(() => setPasswordSuccessMsg(''), 4000);
  };

  if (!isOpen) return null;

  const appShareUrl = window.location.href.split('#')[0];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appShareUrl);
      setCopiedLink(true);
      sound.playSuccess();
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: settings.restaurantName,
          text: `Live POS & Online Order Kiosk for ${settings.restaurantName}`,
          url: appShareUrl,
        });
      } catch {
        // ignore share cancellation
      }
    } else {
      handleCopyLink();
    }
  };

  // Master Save Changes handler for Appearance
  const handleSaveAllAppearance = () => {
    onUpdateSettings({
      theme: localTheme,
      language: localLanguage,
      backgroundImage: localBgImage,
      backgroundOpacity: localBgOpacity,
      backgroundBlur: localBgBlur,
      reduceBlur: localReduceBlur,
      backgroundFit: localBgFit,
      backgroundOverlay: localBgOverlay,
      headerBgImage: localHeaderWallpaper,
      admissionPolicy: admissionPolicyText,
    });
    setAppearanceSavedToast(true);
    sound.playSuccess();
    triggerHaptic('success');
    setTimeout(() => setAppearanceSavedToast(false), 3500);
  };

  // Handle gallery file selection with client-side image compression
  const handleProcessGalleryFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadErrorMsg('Please select a valid image file (JPEG, PNG, WebP, GIF, SVG).');
      sound.playCancel();
      return;
    }
    setUploadErrorMsg(null);
    setIsUploadingBg(true);
    try {
      // Compresses high-res camera/gallery photo to crisp WebP/JPEG under 300KB
      const dataUrl = await compressImageFile(file, 1440, 1440, 0.82);
      setLocalBgImage(dataUrl);
      // Also apply live preview directly to settings so the user sees background update instantly
      onUpdateSettings({
        backgroundImage: dataUrl,
        backgroundOpacity: localBgOpacity,
        backgroundBlur: localBgBlur,
        backgroundFit: localBgFit,
        backgroundOverlay: localBgOverlay,
      });
      sound.playSuccess();
      triggerHaptic('light');
    } catch (err) {
      console.error('Error processing gallery image:', err);
      setUploadErrorMsg('Failed to process image from gallery. Please try another file.');
      sound.playCancel();
    } finally {
      setIsUploadingBg(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessGalleryFile(file);
    }
    // reset input value so re-selecting same image triggers change
    if (e.target) e.target.value = '';
  };

  const handleDropGalleryFile = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessGalleryFile(file);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = customBgUrlInput.trim();
    if (!url) return;
    setLocalBgImage(url);
    onUpdateSettings({
      backgroundImage: url,
      backgroundOpacity: localBgOpacity,
      backgroundBlur: localBgBlur,
      backgroundFit: localBgFit,
      backgroundOverlay: localBgOverlay,
    });
    setCustomBgUrlInput('');
    sound.playSuccess();
    triggerHaptic('light');
  };

  const handleRemoveBgImage = () => {
    setLocalBgImage('');
    onUpdateSettings({ backgroundImage: '' });
    sound.playClick();
    triggerHaptic('light');
  };

  const handleLanguageChange = (lang: Language) => {
    setLocalLanguage(lang);
    onUpdateSettings({ language: lang });
    sound.playClick();
    triggerHaptic('light');
  };

  const handleThemeChange = (theme: AppTheme) => {
    setLocalTheme(theme);
    onUpdateSettings({ theme });
    sound.playClick();
    triggerHaptic('light');
  };

  const handleSavePolicy = () => {
    onUpdateSettings({ admissionPolicy: admissionPolicyText });
    setPolicySavedToast(true);
    sound.playSuccess();
    setTimeout(() => setPolicySavedToast(false), 3000);
  };

  const handleCreateOTP = () => {
    const newOtp = onGenerateOTP(otpNote || 'Manual Generated Passcode');
    setOtpNote('');
    sound.playSuccess();
  };

  const handleCopyOTP = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtpId(id);
    sound.playClick();
    setTimeout(() => setCopiedOtpId(null), 2000);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testOtpCode.trim()) return;
    const ok = onAuthorizeDeviceByOTP(testOtpCode.trim());
    if (ok) {
      setOtpVerifyMsg({ success: true, text: 'Device successfully authorized and approved!' });
      setTestOtpCode('');
      sound.playSuccess();
    } else {
      setOtpVerifyMsg({ success: false, text: 'Invalid or expired passcode. Please verify or generate a new code.' });
      sound.playCancel();
    }
    setTimeout(() => setOtpVerifyMsg(null), 4000);
  };

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    const existing = settings.reportEmails || [];
    if (!existing.includes(email)) {
      onUpdateSettings({ reportEmails: [...existing, email] });
    }
    setNewEmailInput('');
    sound.playClick();
  };

  const handleDeleteEmail = (emailToDelete: string) => {
    const existing = settings.reportEmails || [];
    onUpdateSettings({ reportEmails: existing.filter((e) => e !== emailToDelete) });
    sound.playClick();
  };

  const handleSaveWhatsApp = () => {
    onUpdateSettings({ reportWhatsAppNumber: whatsAppInput.trim() });
    setReportSuccessToast('WhatsApp recipient updated!');
    sound.playSuccess();
    setTimeout(() => setReportSuccessToast(''), 2500);
  };

  const handleDownloadPDF = () => {
    sound.playClick();
    const fileName = downloadMonthlyReportPDF(orders, items, staffList, settings);
    setReportSuccessToast(`Monthly PDF "${fileName}" downloaded!`);
    setTimeout(() => setReportSuccessToast(''), 3000);
  };

  const handleSendReportNow = () => {
    sound.playSuccess();
    // 1. Download the PDF
    downloadMonthlyReportPDF(orders, items, staffList, settings);
    // 2. Open WhatsApp share with pre-filled message
    const waUrl = getWhatsAppShareUrl(orders, items, staffList, settings, whatsAppInput);
    window.open(waUrl, '_blank');
    setReportSuccessToast('Monthly report dispatched to WhatsApp & downloaded!');
    setTimeout(() => setReportSuccessToast(''), 3500);
  };

  // Staff Calculations
  const totalMonthlyPayroll = staffList.reduce((sum, s) => sum + (s.agreedSalary || 0), 0);

  // Background presets
  const bgPresets = [
    { name: 'Default Forest Emerald', value: '' },
    { name: 'Rustic Pizza Hearth', value: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Warm Bistro Wood', value: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Dark Slate Italian', value: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1200&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-[#e2e4dc] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Panel Header */}
        <div className="bg-[#143529] text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-emerald-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  {t('settings.title', 'Settings & Admin Control')}
                </h2>
                {currentRole === UserRole.DEVELOPER ? (
                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    <span>Dev Root Admin</span>
                  </span>
                ) : currentRole === UserRole.OWNER ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Business Owner</span>
                  </span>
                ) : (
                  <span className="bg-amber-500/25 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-300" />
                    <span>Staff (Restricted Access)</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#cfe0d7] hidden sm:block">
                {currentRole === UserRole.STAFF
                  ? 'Access restricted. Settings, appearance, and management controls require Developer or Owner authorization.'
                  : currentRole === UserRole.DEVELOPER
                  ? 'Developer Space: Full access to Appearance, Navigation, Store Profile, and System Infrastructure.'
                  : t('settings.subtitle', 'Consolidated configuration, administrative controls, inventory, finances, reports, and staff management')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToFullAdminView && (
              <button
                type="button"
                id="settings-open-fullscreen-admin"
                onClick={onNavigateToFullAdminView}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Switch to Full-Page Admin Mode"
              >
                <Maximize2 className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden md:inline">Full-Page Mode</span>
              </button>
            )}
            {currentRole === UserRole.STAFF && onOpenAuthModal ? (
              <button
                type="button"
                id="settings-unlock-admin-btn"
                onClick={onOpenAuthModal}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                title="Unlock Owner/Developer Management Controls"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Unlock Admin Controls</span>
              </button>
            ) : (
              <button
                type="button"
                id="settings-lock-btn"
                onClick={() => {
                  onLockAdmin();
                  onClose();
                }}
                title="Lock Admin Session"
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">{t('admin.lock_admin', 'Lock Admin')}</span>
              </button>
            )}
            <button
              type="button"
              id="settings-close-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="bg-[#1f4d3e] px-4 py-2 flex items-center gap-1.5 overflow-x-auto border-b border-white/10 shrink-0 scrollbar-none">
          {/* Tab: Appearance (Relocated to Developer Accessibility Only) */}
          {currentRole === UserRole.DEVELOPER && (
            <button
              type="button"
              id="panel-tab-appearance"
              onClick={() => {
                setActiveTab('appearance');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'appearance'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#10b981]" />
              <span>{t('tab.appearance', 'Appearance & General')}</span>
              <span className="bg-indigo-500/25 text-indigo-200 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-indigo-400/30">
                Dev Only
              </span>
            </button>
          )}

          {/* Tab: Admin Control & Store Profile */}
          {(currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER) && (
            <button
              type="button"
              id="panel-tab-admin-control"
              onClick={() => {
                setActiveTab('admin_control');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'admin_control'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('tab.admin_control', 'Store Profile & Security')}</span>
            </button>
          )}

          {/* Tab: My Branches & Outlets */}
          {(currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER) && (
            <button
              type="button"
              id="panel-tab-branches"
              onClick={() => {
                setActiveTab('branches');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'branches'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <Store className="w-3.5 h-3.5 text-teal-300" />
              <span>My Branches</span>
              <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {currentTenant?.branches?.length || 1}
              </span>
            </button>
          )}

          {/* Tab: Top Bar & Navigation Layout (Relocated to Developer Space / Developer only) */}
          {currentRole === UserRole.DEVELOPER && (
            <button
              type="button"
              id="panel-tab-top-bar"
              onClick={() => {
                setActiveTab('top_bar');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'top_bar'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-300" />
              <span>Top Bar & Nav</span>
            </button>
          )}

          {/* Tab: Stock & Pricing */}
          {(currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER) && (
            <button
              type="button"
              id="panel-tab-inventory"
              onClick={() => {
                setActiveTab('inventory');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'inventory'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <Boxes className="w-3.5 h-3.5 text-emerald-300" />
              <span>Stock & Pricing</span>
              <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {items.length}
              </span>
            </button>
          )}

          {/* Tab: Staff & Hardware Devices */}
          {(currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER) && (
            <button
              type="button"
              id="panel-tab-staff-mgmt"
              onClick={() => {
                setActiveTab('staff_mgmt');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'staff_mgmt'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-300" />
              <span>{t('tab.staff_mgmt', 'Staff & Terminals')}</span>
              <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {staffList.length}
              </span>
            </button>
          )}

          {/* Tab: Procurement & Purchases */}
          {(currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER) && (
            <button
              type="button"
              id="panel-tab-purchases"
              onClick={() => {
                setActiveTab('purchases');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'purchases'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span>Purchases</span>
              {purchases.length > 0 && (
                <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {purchases.length}
                </span>
              )}
            </button>
          )}

          {/* Tab: Capital & Finances */}
          {(currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER) && (
            <button
              type="button"
              id="panel-tab-capital"
              onClick={() => {
                setActiveTab('capital');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'capital'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-300" />
              <span>Capital & Finances</span>
            </button>
          )}

          {/* Tab: Analytics & Reports */}
          {(currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER) && (
            <button
              type="button"
              id="panel-tab-analytics-reports"
              onClick={() => {
                setActiveTab('analytics_reports');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'analytics_reports'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-300" />
              <span>{t('tab.analytics_reports', 'Analytics & Reports')}</span>
            </button>
          )}

          {/* Tab: Merchant Tills & Auto-Push Gateway */}
          {(currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER) && (
            <button
              type="button"
              id="panel-tab-payment-tills"
              onClick={() => {
                setActiveTab('payment_tills');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'payment_tills'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Merchant Tills</span>
            </button>
          )}

          {/* Tab: Business Owners Accounts */}
          {(currentRole === UserRole.OWNER || currentRole === UserRole.DEVELOPER) && (
            <button
              type="button"
              id="panel-tab-business-owners"
              onClick={() => {
                setActiveTab('business_owners');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'business_owners'
                  ? 'bg-white text-[#143529] shadow-sm'
                  : 'text-[#dcebe3] hover:bg-white/10'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-yellow-300" />
              <span>Business Owners</span>
              {businessOwners.length > 0 && (
                <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {businessOwners.length}
                </span>
              )}
            </button>
          )}

          {/* Tab: Developer-Only Infra & RBAC Matrix */}
          {currentRole === UserRole.DEVELOPER && (
            <button
              type="button"
              id="panel-tab-developer-infra"
              onClick={() => {
                setActiveTab('developer_infra');
                sound.playClick();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'developer_infra'
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                  : 'text-indigo-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-300" />
              <span>Dev Infra & RBAC</span>
            </button>
          )}

          {/* Staff Mode: Button to Unlock all other management settings */}
          {currentRole === UserRole.STAFF && onOpenAuthModal && (
            <button
              type="button"
              id="panel-tab-unlock-controls"
              onClick={onOpenAuthModal}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 text-amber-200/90 hover:text-white hover:bg-white/10 whitespace-nowrap border border-amber-400/30 cursor-pointer"
              title="Click to unlock Admin Control, Analytics, Staff Management, and Payment Tills"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Unlock Admin & Management (5 Tabs)</span>
            </button>
          )}
        </div>

        {/* Panel Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8f9f7] space-y-6">
          {/* ========================================================= */}
          {/* TAB: TOP BAR & NAVIGATION CUSTOMIZER                      */}
          {/* ========================================================= */}
          {activeTab === 'top_bar' && currentRole === UserRole.DEVELOPER && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <TopBarSettingsPanel
                currentConfig={topBarConfig}
                settings={settings}
                onSaveConfig={(newConfig) => {
                  onUpdateTopBarConfig?.(newConfig);
                }}
                isModal={false}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: APPEARANCE & GENERAL SETTINGS (DEVELOPER ONLY)     */}
          {/* ========================================================= */}
          {activeTab === 'appearance' && currentRole === UserRole.DEVELOPER && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top Master Save & Status Banner */}
              <div className="bg-gradient-to-r from-[#143529] via-[#1f4d3e] to-[#143529] text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner shrink-0">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">
                        {t('appearance.theme_title', 'Appearance & Background Settings')}
                      </h3>
                      {localBgImage ? (
                        <span className="text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5" />
                          Custom Gallery Wallpaper
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Default Brand Watermark
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#cfe0d7] mt-0.5">
                      {t('appearance.save_all_desc', 'Accept and apply all appearance changes immediately to the live app.')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    id="save-appearance-top-btn"
                    onClick={handleSaveAllAppearance}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0c241b] text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0c241b]" />
                    <span>{t('appearance.save_all_btn', 'Accept & Save Appearance Changes')}</span>
                  </button>
                </div>
              </div>

              {/* Success Notification Banner */}
              {appearanceSavedToast && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('appearance.saved_success', 'Appearance settings saved and applied successfully!')}</span>
                </div>
              )}

              {/* Reactive Unified App Settings (Jetpack DataStore Equivalence) */}
              <UnifiedSettingsCard
                settings={settings}
                onUpdateSettings={onUpdateSettings}
                currentRole={currentRole}
                mode="general_only"
              />

              {/* 1. ATTACHMENT FOR BACKGROUND IMAGE FROM GALLERY */}
              <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1b2620]">
                        {t('appearance.gallery_attach_title', 'Background Image from Gallery')}
                      </h3>
                      <p className="text-xs text-[#8b978f]">
                        {t('appearance.gallery_attach_desc', 'Attach a custom photo or wallpaper from your device gallery, camera, or file storage.')}
                      </p>
                    </div>
                  </div>

                  {localBgImage && (
                    <button
                      type="button"
                      onClick={handleRemoveBgImage}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all border border-red-200 flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('appearance.remove_custom_image', 'Remove & Revert to Default')}</span>
                    </button>
                  )}
                </div>

                {/* Hidden Native File Input (accepts camera & gallery photos) */}
                <input
                  type="file"
                  ref={galleryFileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  className="hidden"
                  id="gallery-background-file-input"
                />

                {/* Upload / Dropzone Box */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDropGalleryFile}
                  onClick={() => galleryFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/70 scale-[1.01]'
                      : 'border-[#cfd5cd] hover:border-[#1f4d3e] bg-[#fafbfa] hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#e2e4dc] flex items-center justify-center text-[#1f4d3e] shadow-xs">
                    {isUploadingBg ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                    ) : (
                      <Upload className="w-6 h-6 text-[#1f4d3e]" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1f4d3e] hover:underline">
                      {isUploadingBg
                        ? 'Optimizing & Attaching Photo...'
                        : t('appearance.upload_from_device', 'Choose Image from Gallery / Camera')}
                    </span>
                    <p className="text-[11px] text-[#8b978f] mt-0.5">
                      {t('appearance.drag_drop_hint', 'Click to choose image or drag & drop (JPG, PNG, WebP)')}
                    </p>
                  </div>
                </div>

                {uploadErrorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadErrorMsg}</span>
                  </div>
                )}

                {/* Live Background Thumbnail Preview Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="md:col-span-1 bg-[#101713] rounded-2xl p-2.5 border border-[#e2e4dc] relative overflow-hidden flex flex-col items-center justify-center min-h-[160px] shadow-inner">
                    {/* Background representation in mini viewport */}
                    <div
                      className="absolute inset-0 transition-all duration-200"
                      style={{
                        opacity: localBgOpacity,
                        filter: localBgBlur > 0 ? `blur(${localBgBlur}px)` : undefined,
                      }}
                    >
                      {localBgImage ? (
                        localBgFit === 'tile' ? (
                          <div
                            className="w-full h-full"
                            style={{
                              backgroundImage: `url(${localBgImage})`,
                              backgroundRepeat: 'repeat',
                              backgroundSize: '80px auto',
                            }}
                          />
                        ) : (
                          <img
                            src={localBgImage}
                            alt="Preview"
                            className={`w-full h-full ${localBgFit === 'contain' ? 'object-contain' : 'object-cover'}`}
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4">
                          <span className="text-[10px] text-emerald-400/80 font-bold uppercase text-center">
                            Official Brand Watermark Active
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tint filter representation */}
                    {localBgOverlay === 'light' && <div className="absolute inset-0 bg-white/30" />}
                    {localBgOverlay === 'dark' && <div className="absolute inset-0 bg-black/40" />}
                    {localBgOverlay === 'emerald' && <div className="absolute inset-0 bg-[#143529]/30" />}
                    {localBgOverlay === 'warm' && <div className="absolute inset-0 bg-[#8c4b26]/25" />}

                    {/* Foreground mockup text */}
                    <div className="relative z-10 bg-black/60 backdrop-blur-xs px-3 py-2 rounded-xl text-center border border-white/20">
                      <p className="text-[11px] font-black text-white">Live Background Preview</p>
                      <p className="text-[9px] text-emerald-300 font-mono mt-0.5">
                        {localBgImage ? 'Custom Photo' : 'Default Watermark'} • {Math.round(localBgOpacity * 100)}%
                      </p>
                    </div>
                  </div>

                  {/* Tuning Sliders */}
                  <div className="md:col-span-2 space-y-3.5">
                    {/* Opacity Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-[#1b2620] mb-1">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#1f4d3e]" />
                          <span>{t('appearance.bg_opacity', 'Background Opacity')}</span>
                        </span>
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                          {Math.round(localBgOpacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.80"
                        step="0.01"
                        value={localBgOpacity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setLocalBgOpacity(val);
                          onUpdateSettings({ backgroundOpacity: val });
                        }}
                        className="w-full h-2 bg-[#e2e4dc] rounded-lg appearance-none cursor-pointer accent-[#1f4d3e]"
                      />
                      <div className="flex justify-between text-[10px] text-[#8b978f] mt-0.5 font-medium">
                        <span>Subtle (5%)</span>
                        <span>Balanced (18%)</span>
                        <span>Vibrant (80%)</span>
                      </div>
                    </div>

                    {/* Reduce Blur & Crisp Clarity Appearance Toggle */}
                    <div className="p-3 rounded-xl bg-[#f8faf8] border border-[#e2e4dc] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1b2620] block">Reduce Blur & High Clarity Mode</span>
                            <span className="text-[10px] text-[#55635a]">Sharp, high-contrast surfaces without fuzzy blur</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !localReduceBlur;
                            setLocalReduceBlur(next);
                            if (next) {
                              setLocalBgBlur(0);
                              onUpdateSettings({ reduceBlur: true, backgroundBlur: 0 });
                            } else {
                              onUpdateSettings({ reduceBlur: false });
                            }
                            sound.playSuccess();
                          }}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                            localReduceBlur ? 'bg-[#1f4d3e]' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              localReduceBlur ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Blur Slider */}
                      <div className="pt-2 border-t border-[#e2e4dc]/70">
                        <div className="flex items-center justify-between text-xs font-bold text-[#1b2620] mb-1">
                          <span className="flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#1f4d3e]" />
                            <span>{t('appearance.bg_blur', 'Background Blur Filter')}</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            {localBgBlur > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setLocalBgBlur(0);
                                  onUpdateSettings({ backgroundBlur: 0, reduceBlur: true });
                                  setLocalReduceBlur(true);
                                  sound.playClick();
                                }}
                                className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                              >
                                Crisp (0px)
                              </button>
                            )}
                            <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                              {localBgBlur}px
                            </span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="8"
                          step="1"
                          value={localBgBlur}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setLocalBgBlur(val);
                            if (val > 0 && localReduceBlur) {
                              setLocalReduceBlur(false);
                            }
                            onUpdateSettings({ backgroundBlur: val, reduceBlur: val === 0 });
                          }}
                          className="w-full h-2 bg-[#e2e4dc] rounded-lg appearance-none cursor-pointer accent-[#1f4d3e]"
                        />
                        <div className="flex justify-between text-[10px] text-[#8b978f] mt-0.5 font-medium">
                          <span className="text-emerald-700 font-bold">Crisp Zero Blur (0px)</span>
                          <span>Soft (4px)</span>
                          <span>Max Filter (8px)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display Fit Mode & Ambient Tint Overlay */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#e2e4dc]">
                  {/* Fit Mode */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#4c5a52]">
                      {t('appearance.bg_fit', 'Background Display Mode')}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'cover', label: t('appearance.fit_cover', 'Full Cover'), icon: Crop },
                        { id: 'contain', label: t('appearance.fit_contain', 'Emblem'), icon: Eye },
                        { id: 'tile', label: t('appearance.fit_tile', 'Repeating'), icon: Layers },
                      ].map((mode) => {
                        const Icon = mode.icon;
                        const isSelected = localBgFit === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => {
                              const val = mode.id as 'cover' | 'contain' | 'tile';
                              setLocalBgFit(val);
                              onUpdateSettings({ backgroundFit: val });
                              sound.playClick();
                            }}
                            className={`p-2 rounded-xl border text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-[#143529] text-white border-[#143529] shadow-xs'
                                : 'bg-[#fafbfa] text-[#4c5a52] border-[#e2e4dc] hover:bg-white'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{mode.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ambient Overlay Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#4c5a52]">
                      {t('appearance.bg_overlay', 'Ambient Color Overlay')}
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        { id: 'none', name: 'Natural', color: 'bg-stone-100 text-stone-800' },
                        { id: 'light', name: 'Daylight', color: 'bg-sky-100 text-sky-800' },
                        { id: 'dark', name: 'Dark Slate', color: 'bg-zinc-800 text-zinc-100' },
                        { id: 'emerald', name: 'Emerald', color: 'bg-emerald-800 text-emerald-100' },
                        { id: 'warm', name: 'Warm', color: 'bg-amber-800 text-amber-100' },
                      ].map((tint) => {
                        const isSelected = localBgOverlay === tint.id;
                        return (
                          <button
                            key={tint.id}
                            type="button"
                            onClick={() => {
                              const val = tint.id as any;
                              setLocalBgOverlay(val);
                              onUpdateSettings({ backgroundOverlay: val });
                              sound.playClick();
                            }}
                            className={`p-1.5 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                              isSelected
                                ? 'border-[#143529] ring-2 ring-[#1f4d3e] shadow-xs font-black'
                                : 'border-[#e2e4dc] hover:opacity-90'
                            } ${tint.color}`}
                          >
                            <span className="truncate w-full text-center">{tint.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Quick Preset Wallpapers */}
                <div className="space-y-2 pt-2 border-t border-[#e2e4dc]">
                  <label className="block text-xs font-bold text-[#4c5a52]">
                    {t('appearance.preset_wallpapers', 'Quick Wallpaper Presets')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: 'Default Brand Logo', value: '' },
                      { name: 'Rustic Pizza Hearth', value: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80' },
                      { name: 'Warm Bistro Dining', value: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80' },
                      { name: 'Dark Slate Italian', value: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1200&q=80' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setLocalBgImage(preset.value);
                          onUpdateSettings({ backgroundImage: preset.value });
                          sound.playClick();
                        }}
                        className={`p-2.5 rounded-xl border text-left text-[11px] font-semibold transition-all ${
                          localBgImage === preset.value
                            ? 'bg-emerald-50 border-[#1f4d3e] text-[#143529] ring-2 ring-[#1f4d3e]'
                            : 'bg-[#fafbfa] border-[#e2e4dc] text-[#4c5a52] hover:bg-white'
                        }`}
                      >
                        <div className="font-bold">{preset.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Web URL Direct Attachment */}
                <form onSubmit={handleApplyCustomUrl} className="pt-2 border-t border-[#e2e4dc] flex gap-2">
                  <input
                    type="url"
                    value={customBgUrlInput}
                    onChange={(e) => setCustomBgUrlInput(e.target.value)}
                    placeholder={t('appearance.custom_url_placeholder', 'https://example.com/restaurant-wallpaper.jpg')}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#e2e4dc] bg-[#fafbfa] text-xs font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold transition-all shrink-0"
                  >
                    Apply URL
                  </button>
                </form>
              </div>

              {/* 2. THEME & LANGUAGE CHOICE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Theme Mode */}
                <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1b2620]">
                        {t('appearance.theme_title', 'Theme & Color Palette')}
                      </h3>
                      <p className="text-xs text-[#8b978f]">
                        {t('appearance.theme_desc', 'Toggle between clean light mode and high-contrast night mode.')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <button
                      type="button"
                      id="admin-theme-white-btn"
                      onClick={() => handleThemeChange('white')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        localTheme === 'white' || !localTheme
                          ? 'bg-[#1f4d3e] text-white border-[#1f4d3e] shadow-xs'
                          : 'bg-[#fafbfa] text-[#4c5a52] border-[#e2e4dc] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-white border border-slate-400" />
                        <span>White Theme</span>
                      </div>
                      <span className={`text-[10px] font-normal ${localTheme === 'white' || !localTheme ? 'text-emerald-100' : 'text-[#8b978f]'}`}>
                        High Visibility
                      </span>
                    </button>

                    <button
                      type="button"
                      id="admin-theme-light-btn"
                      onClick={() => handleThemeChange('light')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        localTheme === 'light'
                          ? 'bg-[#1f4d3e] text-white border-[#1f4d3e] shadow-xs'
                          : 'bg-[#fafbfa] text-[#4c5a52] border-[#e2e4dc] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Warm Light</span>
                      </div>
                      <span className={`text-[10px] font-normal ${localTheme === 'light' ? 'text-emerald-100' : 'text-[#8b978f]'}`}>
                        Classic Cream
                      </span>
                    </button>

                    <button
                      type="button"
                      id="admin-theme-dark-btn"
                      onClick={() => handleThemeChange('dark')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                        localTheme === 'dark'
                          ? 'bg-[#1f4d3e] text-white border-[#1f4d3e] shadow-xs'
                          : 'bg-[#fafbfa] text-[#4c5a52] border-[#e2e4dc] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-indigo-300" />
                        <span>Dark Mode</span>
                      </div>
                      <span className={`text-[10px] font-normal ${localTheme === 'dark' ? 'text-emerald-100' : 'text-[#8b978f]'}`}>
                        Night Terminal
                      </span>
                    </button>
                  </div>
                </div>

                {/* Language Choice */}
                <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1b2620]">
                        {t('appearance.language_title', 'Language Choice')}
                      </h3>
                      <p className="text-xs text-[#8b978f]">
                        {t('appearance.language_desc', 'Select UI language for orders, receipts & displays.')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleLanguageChange('en')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        localLanguage === 'en'
                          ? 'bg-[#143529] text-white border-[#143529] shadow-sm'
                          : 'bg-[#fafbfa] text-[#4c5a52] border-[#e2e4dc] hover:bg-white'
                      }`}
                    >
                      <span>🇬🇧 English</span>
                      {localLanguage === 'en' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLanguageChange('sw')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        localLanguage === 'sw'
                          ? 'bg-[#143529] text-white border-[#143529] shadow-sm'
                          : 'bg-[#fafbfa] text-[#4c5a52] border-[#e2e4dc] hover:bg-white'
                      }`}
                    >
                      <span>🇹🇿 Kiswahili</span>
                      {localLanguage === 'sw' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Color Scheme Picker & Live Contrast Tool */}
              <ColorSchemeSettings />

              {/* 3. SHARE APP LINK & SUPPORT HELPLINE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Share App Link */}
                <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1f4d3e] flex items-center justify-center">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1b2620]">
                        {t('appearance.share_title', 'Share App Link')}
                      </h3>
                      <p className="text-xs text-[#8b978f]">
                        {t('appearance.share_desc', 'Distribute the live POS link to waitstaff, kitchen displays, or customer tables.')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                    <div className="flex-1 w-full bg-[#f4f5f0] border border-[#e2e4dc] rounded-xl px-3 py-2 text-xs font-mono text-[#1b2620] truncate select-all">
                      {appShareUrl}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          copiedLink
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white hover:bg-[#fafbfa] text-[#1b2620] border-[#e2e4dc]'
                        }`}
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? t('appearance.link_copied', 'Copied!') : t('appearance.copy_link', 'Copy Link')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNativeShare}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>{t('appearance.native_share', 'Share...')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Fixed Support Helpline */}
                <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1b2620]">
                        {t('appearance.help_title', 'Help & Support Line')}
                      </h3>
                      <p className="text-xs text-[#8b978f]">
                        {t('appearance.help_desc', 'Fixed customer support and technical care helpline.')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#fdfaf5] border border-amber-200">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-extrabold text-[#1b2620] tracking-wide">
                        +255713057325
                      </span>
                    </div>

                    <a
                      href="tel:+255713057325"
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>{t('appearance.call_btn', 'Call Support')}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 4. ADMISSION POLICY & HOUSE RULES */}
              <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1f4d3e] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1b2620]">
                        {t('appearance.policy_title', 'Admission Policy & House Rules')}
                      </h3>
                      <p className="text-xs text-[#8b978f]">
                        {t('appearance.policy_desc', 'View and edit admission policy text.')}
                      </p>
                    </div>
                  </div>

                  {policySavedToast && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('appearance.policy_saved', 'Saved!')}</span>
                    </span>
                  )}
                </div>

                <textarea
                  rows={5}
                  value={admissionPolicyText}
                  onChange={(e) => setAdmissionPolicyText(e.target.value)}
                  placeholder={t('appearance.policy_placeholder', 'Enter restaurant admission policy and house rules...')}
                  className="w-full p-3 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e] font-sans leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSavePolicy}
                    className="px-4 py-2 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{t('appearance.save_policy', 'Save Policy Changes')}</span>
                  </button>
                </div>
              </div>

              {/* 5. BOTTOM MASTER ACTION BAR: ACCEPT & SAVE APPEARANCE CHANGES */}
              <div className="bg-[#f0f4f1] border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5 text-xs text-[#143529]">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-extrabold">Ready to apply changes?</span>
                    <p className="text-[11px] text-[#4c5a52]">
                      Clicking Accept & Save commits your custom gallery wallpaper, theme, and language choices across the entire POS.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="save-appearance-bottom-btn"
                  onClick={handleSaveAllAppearance}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0"
                >
                  <Save className="w-4 h-4 text-emerald-300" />
                  <span>{t('appearance.save_all_btn', 'Accept & Save Appearance Changes')}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STAFF RESTRICTED ACCESS SCREEN                             */}
          {/* ========================================================= */}
          {currentRole === UserRole.STAFF && (
            <div className="bg-white rounded-2xl p-8 border border-amber-200 shadow-sm text-center max-w-lg mx-auto my-8 space-y-4 animate-in fade-in duration-150">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Management &amp; Appearance Controls Restricted</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Appearance customization, administrative controls, finances, and system navigation configurations are restricted to Developer and Business Owner credentials.
                </p>
              </div>
              {onOpenAuthModal && (
                <button
                  type="button"
                  id="staff-restricted-unlock-btn"
                  onClick={onOpenAuthModal}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 mx-auto cursor-pointer active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Admin Controls</span>
                </button>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ADMIN CONTROL SECTION                              */}
          {/* ========================================================= */}
          {activeTab === 'admin_control' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Admin Full Control Status Banner */}
              <div className="bg-[#143529] text-white rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                        {t('admin.full_control_title', 'Admin Full Control Active')}
                      </h3>
                      <p className="text-xs text-[#cfe0d7]">
                        Owner: <strong>{settings.ownerName}</strong> • License: {settings.ownershipLicense}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold bg-white/10 px-2.5 py-1 rounded-lg text-emerald-200">
                      Live Persistence Enabled
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. STORE PROFILE & IDENTITY */}
              <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e2e4dc] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1f4d3e] flex items-center justify-center">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1b2620]">Store Identity &amp; Contact</h3>
                      <p className="text-xs text-[#8b978f]">Configure restaurant name, currency, tagline, and business owner details.</p>
                    </div>
                  </div>
                </div>

                {profileSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveStoreProfile} className="space-y-4">
                  {/* Business Circular Logo Editor Section */}
                  <div className="p-3.5 bg-[#f5f8f6] border border-[#e2e4dc] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative shrink-0 group">
                      <div className="w-16 h-16 rounded-full aspect-square ring-4 ring-emerald-600/30 overflow-hidden bg-white shadow-md flex items-center justify-center p-0.5">
                        <img
                          src={storeLogoUrl || '/logo.jpg'}
                          alt={storeName}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = '/logo.jpg';
                          }}
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 p-1 rounded-full shadow-xs border border-white">
                        <Pencil className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2 w-full text-center sm:text-left">
                      <div>
                        <h4 className="text-xs font-bold text-[#1b2620]">Business Logo Icon (Circular Top-Left)</h4>
                        <p className="text-[11px] text-[#718277]">
                          Enter an image URL or choose a preset logo to represent this restaurant.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                          type="text"
                          value={storeLogoUrl}
                          onChange={(e) => setStoreLogoUrl(e.target.value)}
                          placeholder="https://... or /logo.jpg"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#e2e4dc] bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 font-mono"
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setStoreLogoUrl('/logo.jpg')}
                            className="px-2.5 py-1.5 rounded-xl border border-[#d2d6cb] bg-white hover:bg-[#fafbfa] text-[11px] font-bold text-[#1b2620] cursor-pointer"
                          >
                            Default
                          </button>
                          <label className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (evt) => {
                                    if (evt.target?.result) {
                                      setStoreLogoUrl(evt.target.result as string);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">Restaurant / Store Name</label>
                      <input
                        type="text"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="e.g. My Restaurant POS"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">Business Tagline</label>
                      <input
                        type="text"
                        value={storeTagline}
                        onChange={(e) => setStoreTagline(e.target.value)}
                        placeholder="e.g. Fresh Authentic Flavors"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">POS Currency Code</label>
                      <select
                        value={storeCurrency}
                        onChange={(e) => setStoreCurrency(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none font-bold text-[#1f4d3e]"
                      >
                        <option value="TZS">TZS - Tanzanian Shilling</option>
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="UGX">UGX - Ugandan Shilling</option>
                        <option value="USD">USD - US Dollar ($)</option>
                        <option value="EUR">EUR - Euro (€)</option>
                        <option value="GBP">GBP - British Pound (£)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">Owner / Manager Name</label>
                      <input
                        type="text"
                        value={storeOwnerName}
                        onChange={(e) => setStoreOwnerName(e.target.value)}
                        placeholder="e.g. Chef Ernest"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">Owner Email Address</label>
                      <input
                        type="email"
                        value={storeOwnerEmail}
                        onChange={(e) => setStoreOwnerEmail(e.target.value)}
                        placeholder="e.g. owner@restaurant.com"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">Standard VAT / Tax Rate (%)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={storeTaxRate}
                          onChange={(e) => setStoreTaxRate(parseFloat(e.target.value) || 0)}
                          className="w-24 px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white font-bold"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-[#4c5a52] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={storeVatEnabled}
                            onChange={(e) => setStoreVatEnabled(e.target.checked)}
                            className="w-4 h-4 rounded text-[#1f4d3e] focus:ring-[#1f4d3e]"
                          />
                          <span>Enable VAT</span>
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">
                        Restaurant Physical Address <span className="text-emerald-700 font-semibold">(Unique Per Restaurant • Appears on Receipts & Reports)</span>
                      </label>
                      <textarea
                        rows={2}
                        value={storeAddress}
                        onChange={(e) => setStoreAddress(e.target.value)}
                        placeholder="e.g. Village House (Kijiji), Lipangalala Street, The Place Rd., Ifakara, Tanzania"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 font-medium leading-relaxed resize-y"
                      />
                      <span className="text-[11px] text-[#55695e] mt-0.5 block">
                        This address prints at the top of customer receipts and on all monthly audit reports generated for this restaurant.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">Official Contact / Support Phone</label>
                      <input
                        type="text"
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                        placeholder="e.g. +255 713 057 325"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 font-medium"
                      />
                      <span className="text-[11px] text-[#55695e] mt-0.5 block">
                        Customer receipt hotline & printed support contact.
                      </span>
                    </div>
                  </div>

                  {/* Receipt Header & Footer */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#e2e4dc]">
                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">Printed Receipt Header Message</label>
                      <input
                        type="text"
                        value={storeReceiptHeader}
                        onChange={(e) => setStoreReceiptHeader(e.target.value)}
                        placeholder="e.g. Welcome to Our Restaurant • Tel: +255 700 000 000"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">Printed Receipt Footer Thank You</label>
                      <input
                        type="text"
                        value={storeReceiptFooter}
                        onChange={(e) => setStoreReceiptFooter(e.target.value)}
                        placeholder="e.g. Asante Sana kwa kutembelea • Karibu Tena!"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Store Identity &amp; Tax Rules</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. MASTER ADMIN PASSWORD MANAGEMENT */}
              <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#e2e4dc] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1b2620]">Master Admin &amp; Management Password</h3>
                      <p className="text-xs text-[#8b978f]">Update the master credentials required to unlock admin management and sensitive controls.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetAdminPasswordToDefault}
                    className="text-xs text-[#8b978f] hover:text-amber-700 flex items-center gap-1 font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Default</span>
                  </button>
                </div>

                {passwordSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{passwordSuccessMsg}</span>
                  </div>
                )}

                {passwordErrorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{passwordErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveAdminPassword} className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#fafbfa] border border-[#e2e4dc] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#8b978f] block">Current Active Admin Password:</span>
                      <span className="text-sm font-mono font-bold text-[#1b2620]">
                        {showCurrentAdminPassword ? (settings.adminPassword || '7419Fgwandu@') : '••••••••••••'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCurrentAdminPassword(!showCurrentAdminPassword)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#e2e4dc] bg-white text-xs font-bold text-[#4c5a52] hover:bg-gray-50 flex items-center gap-1"
                    >
                      {showCurrentAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showCurrentAdminPassword ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">New Master Password</label>
                      <div className="relative">
                        <input
                          type={showAdminPassword ? 'text' : 'password'}
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="Enter new admin password"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1b2620] mb-1">Confirm New Master Password</label>
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={confirmAdminPassword}
                        onChange={(e) => setConfirmAdminPassword(e.target.value)}
                        placeholder="Re-type new admin password"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#143529] hover:bg-[#0e241c] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Update Master Password</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Reactive Unified Admin Controls (Automated Backups, System Logging, Debug Diagnostics) */}
              <UnifiedSettingsCard
                settings={settings}
                onUpdateSettings={onUpdateSettings}
                currentRole={currentRole}
                mode="admin_only"
              />

              {/* Admin Bar Navigation Visibility Toggle */}
              <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1b2620]">
                        {t('admin.nav_bar_title', 'Admin Navigation Bar Visibility')}
                      </h3>
                      <p className="text-xs text-[#8b978f]">
                        {t('admin.nav_bar_desc', 'Hide the admin tab from the main navigation bar for regular users.')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ hideAdminFromNav: !settings.hideAdminFromNav })}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      settings.hideAdminFromNav
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    <span>{settings.hideAdminFromNav ? 'Hidden from Main Bar' : 'Visible on Main Bar'}</span>
                  </button>
                </div>
              </div>

              {/* New Device Access (One-Time Passcode) */}
              <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1f4d3e] flex items-center justify-center">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1b2620]">
                        {t('admin.otp_title', 'New Device Access (One-Time Passcode)')}
                      </h3>
                      <p className="text-xs text-[#8b978f]">
                        {t('admin.otp_desc', 'Generate 6-digit numeric passcodes for authenticating new devices.')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={otpNote}
                      onChange={(e) => setOtpNote(e.target.value)}
                      placeholder="Device Note (e.g. Waiter Tablet #3)..."
                      className="px-3 py-1.5 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] max-w-[200px]"
                    />
                    <button
                      type="button"
                      onClick={handleCreateOTP}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('admin.generate_otp', 'Generate OTP')}</span>
                    </button>
                  </div>
                </div>

                {/* Active OTP List */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-[#8b978f] uppercase tracking-wider block">
                    {t('admin.otp_active', 'Active Passcodes')} ({otps.length})
                  </span>

                  {otps.length === 0 ? (
                    <div className="p-4 rounded-xl bg-[#fafbfa] border border-dashed border-[#e2e4dc] text-center text-xs text-[#8b978f]">
                      {t('admin.otp_none', 'No active passcodes. Generate a new one when onboarding a device.')}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {otps.map((otp) => {
                        const isExpired = Date.now() > otp.expiresAt;
                        const minutesLeft = Math.max(0, Math.round((otp.expiresAt - Date.now()) / 60000));
                        return (
                          <div
                            key={otp.id}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                              isExpired || otp.isUsed
                                ? 'bg-gray-50 border-gray-200 opacity-60'
                                : 'bg-[#f7faf8] border-emerald-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-base font-black tracking-widest text-[#143529]">
                                  {otp.code}
                                </span>
                                {otp.isUsed ? (
                                  <span className="text-[9px] font-bold bg-gray-200 text-gray-700 px-1.5 rounded">
                                    Used
                                  </span>
                                ) : isExpired ? (
                                  <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 rounded">
                                    Expired
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 rounded">
                                    {minutesLeft}m left
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#8b978f] block truncate">
                                {otp.note || 'Device Passcode'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {!otp.isUsed && !isExpired && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyOTP(otp.code, otp.id)}
                                  className="p-1.5 rounded-lg bg-white border border-[#e2e4dc] hover:bg-gray-50 text-xs font-bold text-[#1f4d3e]"
                                  title="Copy Passcode"
                                >
                                  {copiedOtpId === otp.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onRevokeOTP(otp.id)}
                                className="p-1.5 rounded-lg bg-white border border-[#e2e4dc] hover:bg-red-50 text-red-600 text-xs"
                                title="Revoke Passcode"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Test OTP authorization input */}
                <form onSubmit={handleVerifyOTP} className="pt-3 border-t border-[#e2e4dc] flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      maxLength={6}
                      value={testOtpCode}
                      onChange={(e) => setTestOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={t('admin.otp_test_placeholder', 'Enter 6-digit passcode to verify...')}
                      className="w-full px-3 py-2 text-xs font-mono tracking-wider rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529] transition-all"
                  >
                    {t('admin.otp_test_btn', 'Authorize Device')}
                  </button>
                </form>

                {otpVerifyMsg && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      otpVerifyMsg.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {otpVerifyMsg.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{otpVerifyMsg.text}</span>
                  </div>
                )}
              </div>

              {/* Clear Analytics & Reports Section */}
              <div className="bg-white border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-rose-900">
                        {t('admin.clear_analytics_reports_title', 'Clear Analytics & Reports')}
                      </h3>
                      <p className="text-xs text-[#8b978f]">
                        {t('admin.clear_analytics_reports_desc', 'Wipe sales histories, orders, customer debts, and reset daily & monthly report metrics.')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="admin-clear-analytics-reports-btn"
                    onClick={() => setShowResetConfirmModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Analytics &amp; Reports</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone: Delete a Restaurant Section */}
              <div className="bg-white border-2 border-red-200/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-red-950">
                          Delete Registered Business
                        </h3>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200 uppercase">
                          Danger Zone
                        </span>
                      </div>
                      <p className="text-xs text-red-700/70">
                        Permanently purge this registered restaurant enterprise, all its operating branches, catalog items, staff associations, and database records.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    id="admin-delete-restaurant-btn"
                    onClick={() => {
                      setTenantToDeleteId(currentTenantId || (tenants && tenants[0]?.id) || '');
                      setShowDeleteRestaurantModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Registered Business</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: MY BRANCHES & OUTLETS                                */}
          {/* ========================================================= */}
          {activeTab === 'branches' && currentTenant && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <MyBranchesSettingsPanel
                currentTenant={currentTenant}
                onAddBranch={(branchData) => {
                  if (onAddBranch) onAddBranch(branchData);
                }}
                onUpdateBranch={(branchId, updates) => {
                  if (onUpdateBranch) onUpdateBranch(branchId, updates);
                }}
                onDeleteBranch={(branchId) => {
                  if (onDeleteBranch) onDeleteBranch(branchId);
                }}
                onSelectBranch={(branchId) => {
                  if (onSelectBranch) onSelectBranch(branchId);
                }}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ANALYTICS & REPORTING SECTION                       */}
          {/* ========================================================= */}
          {activeTab === 'analytics_reports' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Quick Action Header Bar for Reports */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#e2e4dc] rounded-2xl p-3.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Analytics &amp; Report Management</span>
                    <span className="text-[11px] text-slate-500 block">Review and manage aggregated business intelligence</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="analytics-clear-reports-btn"
                    onClick={() => setShowResetConfirmModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    <span>Clear Analytics &amp; Reports</span>
                  </button>
                </div>
              </div>

              {/* Daily Sales Summary Visualization */}
              <DailySalesSummary orders={orders} settings={settings} />

              {/* Monthly Business Audit Report (PDF & WhatsApp) */}
              <div className="bg-white border border-[#e2e4dc] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1f4d3e] flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#1b2620]">
                        {t('reports.monthly_pdf_title', 'Monthly Business Report (PDF)')}
                      </h3>
                      <p className="text-xs text-[#8b978f]">
                        {t('reports.monthly_pdf_desc', 'Comprehensive audit report with revenue breakdown, top dishes, staff payroll, and debts.')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report Time Selector with Custom Specific Time & Shift Presets */}
                <ReportTimeSelector
                  orders={orders}
                  items={items}
                  staffList={staffList}
                  settings={settings}
                  whatsAppNumber={settings.reportWhatsAppNumber}
                  inline={true}
                />

                {reportSuccessToast && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{reportSuccessToast}</span>
                  </div>
                )}

                {/* Email Recipients & WhatsApp Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#e2e4dc]">
                  {/* Email Mailing List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-[#1b2620]">
                        {t('reports.email_recipients_title', 'Monthly Email Recipients')}
                      </span>
                    </div>

                    <form onSubmit={handleAddEmail} className="flex items-center gap-2">
                      <input
                        type="email"
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        placeholder={t('reports.add_email_placeholder', 'Add recipient email...')}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-[#1f4d3e] text-white text-xs font-bold hover:bg-[#143529]"
                      >
                        {t('reports.add_email_btn', 'Add')}
                      </button>
                    </form>

                    {/* Email List */}
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {(settings.reportEmails || []).map((email) => (
                        <div
                          key={email}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#fafbfa] border border-[#e2e4dc] text-xs text-[#1b2620]"
                        >
                          <span className="truncate">{email}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteEmail(email)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove email"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp Recipient Number */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-[#1b2620]">
                        {t('reports.whatsapp_title', 'WhatsApp Recipient Number')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={whatsAppInput}
                        onChange={(e) => setWhatsAppInput(e.target.value)}
                        placeholder="+255 713 057 325"
                        className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleSaveWhatsApp}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e4dc] hover:bg-gray-50 text-xs font-bold text-[#1b2620]"
                      >
                        {t('btn.save', 'Save')}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const waUrl = getWhatsAppShareUrl(orders, items, staffList, settings, whatsAppInput);
                        window.open(waUrl, '_blank');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{t('reports.whatsapp_share_btn', 'Send Summary via WhatsApp')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: STAFF & HARDWARE TERMINALS MANAGEMENT              */}
          {/* ========================================================= */}
          {activeTab === 'staff_mgmt' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Sub-tab Navigation Pill Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#e2e4dc] rounded-2xl p-3 sm:p-4 shadow-2xs">
                <div className="flex items-center gap-1.5 p-1 bg-[#f4f5f0] rounded-xl flex-wrap">
                  <button
                    type="button"
                    id="staff-subtab-payroll"
                    onClick={() => setStaffSubTab('ai_payroll')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      staffSubTab === 'ai_payroll'
                        ? 'bg-[#1f4d3e] text-white shadow-xs'
                        : 'text-[#4c5a52] hover:text-[#1b2620]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Dynamic AI Payroll &amp; Deductions</span>
                  </button>

                  <button
                    type="button"
                    id="staff-subtab-directory"
                    onClick={() => setStaffSubTab('directory')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      staffSubTab === 'directory'
                        ? 'bg-[#1f4d3e] text-white shadow-xs'
                        : 'text-[#4c5a52] hover:text-[#1b2620]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Staff Directory &amp; Logins ({staffList.length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="add-staff-btn"
                    onClick={() => {
                      setEditingStaff(null);
                      setIsStaffModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{t('staff.add_btn', 'Add New Staff Member')}</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tab 1: Dynamic AI Calendar-Month Payroll & Deductions */}
              {staffSubTab === 'ai_payroll' && (
                <StaffPayrollSection
                  staffList={staffList}
                  settings={settings}
                  onToggleStaffSalaryPaid={onToggleStaffSalaryPaid}
                  onUpdateStaff={onUpdateStaff}
                />
              )}

              {/* Sub-Tab 2: Staff Directory & Login Credentials */}
              {staffSubTab === 'directory' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                    <p className="text-xs text-[#8b978f]">
                      {staffList.length} registered staff members • Total Gross Payroll: <strong>{formatCurrency(totalMonthlyPayroll, settings.currency)}</strong>
                    </p>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={staffSearchQuery}
                        onChange={(e) => setStaffSearchQuery(e.target.value)}
                        placeholder="Search staff by name or role..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#e2e4dc] bg-white focus:outline-none focus:ring-1 focus:ring-[#1f4d3e]"
                      />
                    </div>
                  </div>

                  {/* Staff Cards / List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {staffList
                      .filter((s) => {
                        if (!staffSearchQuery.trim()) return true;
                        const q = staffSearchQuery.toLowerCase();
                        return (
                          s.name.toLowerCase().includes(q) ||
                          s.roleTitle.toLowerCase().includes(q) ||
                          (s.username && s.username.toLowerCase().includes(q))
                        );
                      })
                      .map((staff) => {
                        const hireDate = new Date(staff.employmentDate);
                        const anniversaryDay = hireDate.getDate();
                        const isPwRevealed = !!revealedPasswords[staff.id];

                        return (
                          <div
                            key={staff.id}
                            className="bg-white border border-[#e2e4dc] rounded-2xl p-4 shadow-2xs space-y-3 relative hover:border-[#1f4d3e]/40 transition-all"
                          >
                            {/* Staff Card Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-sm text-[#1b2620]">
                                    {staff.name}
                                  </h4>
                                  <span className="text-[10px] font-bold bg-[#f4f5f0] text-[#4c5a52] px-2 py-0.5 rounded-full">
                                    {staff.roleTitle}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#8b978f] mt-0.5">
                                  {staff.age} yrs • {staff.sex} • From: {staff.fromLocation}
                                </p>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStaff(staff);
                                    setIsStaffModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 cursor-pointer"
                                  title="Edit Staff"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStaffToDelete(staff)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                                  title="Delete Staff"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* System Login Credentials & Quick PIN */}
                            <div className="p-2.5 rounded-xl bg-[#fafbfa] border border-[#e2e4dc] space-y-1 text-xs">
                              <div className="flex items-center justify-between text-[#4c5a52]">
                                <span className="text-[10px] font-bold uppercase text-[#8b978f]">Login Username:</span>
                                <span className="font-mono font-bold text-[#1f4d3e] bg-white px-2 py-0.5 rounded border border-[#e2e4dc]">
                                  {staff.username || staff.name.toLowerCase().replace(/\s+/g, '.')}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[#4c5a52]">
                                <span className="text-[10px] font-bold uppercase text-[#8b978f]">Password:</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-[#1b2620]">
                                    {isPwRevealed ? (staff.password || '1234') : '••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setRevealedPasswords((prev) => ({
                                        ...prev,
                                        [staff.id]: !prev[staff.id],
                                      }))
                                    }
                                    className="p-0.5 text-gray-400 hover:text-gray-600"
                                    title={isPwRevealed ? 'Hide Password' : 'Show Password'}
                                  >
                                    {isPwRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(staff.password || '1234');
                                      setCopiedStaffId(staff.id);
                                      setTimeout(() => setCopiedStaffId(null), 2000);
                                    }}
                                    className="p-0.5 text-gray-400 hover:text-emerald-700"
                                    title="Copy Password"
                                  >
                                    {copiedStaffId === staff.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>
                              {staff.pin && (
                                <div className="flex items-center justify-between text-[#4c5a52]">
                                  <span className="text-[10px] font-bold uppercase text-[#8b978f]">Quick PIN:</span>
                                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    {staff.pin}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Contact & Guardian Details */}
                            <div className="p-2.5 rounded-xl bg-white border border-[#e2e4dc] space-y-1.5 text-xs">
                              <div className="flex items-center justify-between text-[#4c5a52]">
                                <span className="text-[10px] font-bold uppercase text-[#8b978f]">Emergency #1:</span>
                                <a href={`tel:${staff.emergencyPhone1}`} className="font-bold text-[#1f4d3e] hover:underline">
                                  {staff.emergencyPhone1}
                                </a>
                              </div>
                              {staff.emergencyPhone2 && (
                                <div className="flex items-center justify-between text-[#4c5a52]">
                                  <span className="text-[10px] font-bold uppercase text-[#8b978f]">Emergency #2:</span>
                                  <a href={`tel:${staff.emergencyPhone2}`} className="font-bold text-[#1f4d3e] hover:underline">
                                    {staff.emergencyPhone2}
                                  </a>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-[#4c5a52]">
                                <span className="text-[10px] font-bold uppercase text-[#8b978f]">Guardian:</span>
                                <span className="font-medium text-[#1b2620]">{staff.guardianName}</span>
                              </div>
                            </div>

                            {/* Salary & Monthly Anniversary Payment Status */}
                            <div className="flex items-center justify-between pt-1 border-t border-[#e2e4dc]/70">
                              <div>
                                <span className="text-[10px] font-bold text-[#8b978f] uppercase block">
                                  Salary ({settings.currency})
                                </span>
                                <span className="text-sm font-extrabold text-[#143529]">
                                  {formatCurrency(staff.agreedSalary, settings.currency)}/mo
                                </span>
                                <span className="text-[10px] text-[#8b978f] block">
                                  Due on {anniversaryDay}th of month
                                </span>
                              </div>

                              <div>
                                <button
                                  type="button"
                                  onClick={() => onToggleStaffSalaryPaid(staff.id)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                    staff.salaryPaymentStatus === 'paid'
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                                  }`}
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span>
                                    {staff.salaryPaymentStatus === 'paid'
                                      ? t('staff.paid_badge', 'Paid for Month')
                                      : t('staff.pay_salary', 'Mark Paid')}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: STOCK & INVENTORY PRICING                            */}
          {/* ========================================================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-in fade-in duration-150">
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
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: PROCUREMENT & PURCHASES                              */}
          {/* ========================================================= */}
          {activeTab === 'purchases' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <PurchasesView
                purchases={purchases}
                settings={settings}
                onAddPurchase={onAddPurchase || (() => {})}
                onDeletePurchase={onDeletePurchase || (() => {})}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: CAPITAL INVESTED & FINANCES                          */}
          {/* ========================================================= */}
          {activeTab === 'capital' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <FinancesView
                orders={orders}
                purchases={purchases}
                capital={capital}
                mpesaTransactions={mpesaTransactions}
                settings={settings}
                onUpdateCapital={onUpdateCapital || (() => {})}
                onOpenPurchases={() => setActiveTab('purchases')}
                onOpenMpesa={() => {}}
                onOpenDebts={() => {}}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: BUSINESS OWNER ACCOUNTS                              */}
          {/* ========================================================= */}
          {activeTab === 'business_owners' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <BusinessOwnerAccountsPanel
                businessOwners={businessOwners}
                settings={settings}
                onAddOwner={onAddBusinessOwner || (() => {})}
                onUpdateOwner={onUpdateBusinessOwner || (() => {})}
                onDeleteOwner={onDeleteBusinessOwner || (() => {})}
                onUpdateSettings={onUpdateSettings}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: MERCHANT TILLS & AUTO-PUSH GATEWAY                    */}
          {/* ========================================================= */}
          {activeTab === 'payment_tills' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <PaymentTillManager currency={settings.currency} />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: DEVELOPER-ONLY INFRA & RBAC MATRIX                  */}
          {/* ========================================================= */}
          {activeTab === 'developer_infra' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <DeveloperInfraPanel
                currentRole={currentRole}
                onSwitchRole={onSwitchRole}
                restaurantName={settings.restaurantName}
                onResetReport={onResetReport}
                onResetAllReports={onResetAllReports}
                onResetData={onResetData}
              />
            </div>
          )}
        </div>

        {/* Panel Footer */}
        <div className="bg-[#f0f2ec] px-5 py-3 border-t border-[#e2e4dc] flex items-center justify-between shrink-0 text-xs text-[#8b978f]">
          <span>
            {settings.restaurantName} • Administrative System v2.6
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-[#e2e4dc] text-[#1b2620] font-bold hover:bg-gray-50 transition-all"
          >
            {t('btn.close', 'Close Panel')}
          </button>
        </div>
      </div>

      {/* Staff Create/Edit Modal */}
      {isStaffModalOpen && (
        <NewStaffModal
          isOpen={isStaffModalOpen}
          onClose={() => {
            setIsStaffModalOpen(false);
            setEditingStaff(null);
          }}
          onSave={(staff) => {
            if (editingStaff) {
              onUpdateStaff(staff);
            } else {
              onAddStaff(staff);
            }
          }}
          editingStaff={editingStaff}
          settings={settings}
        />
      )}

      {/* Delete Staff Confirmation Dialog */}
      {staffToDelete && (
        <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-red-200 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-red-900">Delete Staff Member</h3>
              <p className="text-xs text-[#4c5a52] mt-1">
                Are you sure you want to remove <strong>{staffToDelete.name}</strong> ({staffToDelete.roleTitle}) from employed staff records?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#e2e4dc] text-xs font-bold text-[#4c5a52]"
              >
                {t('btn.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStaff(staffToDelete.id);
                  setStaffToDelete(null);
                  sound.playCancel();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {t('btn.delete', 'Delete Staff')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Analytics & Reports Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-70 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-red-900">
                {t('admin.reset_confirm_title', 'Confirm Clear Analytics & Reports')}
              </h3>
              <p className="text-xs text-[#4c5a52] mt-2 leading-relaxed">
                {t('admin.reset_confirm_msg', 'Are you sure you want to reset all order histories, revenue metrics, customer debt ledgers, and generated reports? This action cannot be reversed.')}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl border border-[#e2e4dc] text-xs font-bold text-[#4c5a52] hover:bg-gray-50 transition"
              >
                {t('btn.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                id="modal-confirm-clear-analytics-btn"
                onClick={() => {
                  onResetAnalytics();
                  onResetAllReports?.('CONFIRM_RESET');
                  setShowResetConfirmModal(false);
                  sound.playCancel();
                  setFeedbackToast('Analytics and reports cleared successfully.');
                  setTimeout(() => setFeedbackToast(null), 3500);
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('btn.confirm', 'Yes, Clear All Analytics & Reports')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Restaurant Confirmation Modal */}
      {showDeleteRestaurantModal && (
        <div className="fixed inset-0 z-70 bg-black/65 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-300 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-red-900">
                Confirm Delete Registered Business
              </h3>
              <p className="text-xs text-[#4c5a52] mt-2 leading-relaxed">
                Are you sure you want to permanently delete this registered business? All of its branches, menu items, recipes, tables, active orders, customer debts, and configuration will be permanently purged.
              </p>
            </div>

            {tenants && tenants.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Select Registered Business to Delete:
                </label>
                <select
                  value={tenantToDeleteId}
                  onChange={(e) => setTenantToDeleteId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-red-200 bg-red-50/50 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.id})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDeleteRestaurantModal(false)}
                className="px-4 py-2 rounded-xl border border-[#e2e4dc] text-xs font-bold text-[#4c5a52] hover:bg-gray-50 transition"
              >
                {t('btn.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                id="modal-confirm-delete-restaurant-btn"
                onClick={() => {
                  const targetId = tenantToDeleteId || currentTenantId;
                  if (targetId && onDeleteTenant) {
                    onDeleteTenant(targetId);
                    setShowDeleteRestaurantModal(false);
                    sound.playCancel();
                    setFeedbackToast('Restaurant permanently deleted.');
                    setTimeout(() => setFeedbackToast(null), 3500);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operation Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-80 bg-emerald-800 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-emerald-600 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{feedbackToast}</span>
        </div>
      )}
    </div>
  );
};
