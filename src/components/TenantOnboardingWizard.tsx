import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  X,
  CreditCard,
  Utensils,
  Plus,
  Trash2,
} from 'lucide-react';
import { TenantRestaurant } from '../types';
import { tenantAuthService } from '../services/tenantAuthService';

const INITIAL_FORM_STATE = {
  // Step 1: Basic Info
  businessName: '',
  uniqueCode: '',
  logoUrl: '',
  // Step 2: Owner & Branch Setup
  ownerName: '',
  ownerEmail: '',
  branchName: 'Main Branch',
  address: '',
  phone: '',
  // Step 3: Default Categories & Payments
  categories: ['Appetizers', 'Main Course'],
  paymentMethods: ['Cash', 'M-Pesa'],
};

interface TenantOnboardingWizardProps {
  onTenantCreated?: (tenant: TenantRestaurant) => void;
  onClose?: () => void;
}

export default function TenantOnboardingWizard({
  onTenantCreated,
  onClose,
}: TenantOnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newPaymentInput, setNewPaymentInput] = useState('');

  const validateStep = (currentStep: number): boolean => {
    const errs: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.businessName.trim()) errs.businessName = 'Business Name is required';
      if (!formData.uniqueCode.trim()) errs.uniqueCode = 'Unique Code is required';
      if (!formData.logoUrl.trim()) errs.logoUrl = 'Logo URL is required';
    }
    if (currentStep === 2) {
      if (!formData.ownerName.trim()) errs.ownerName = 'Owner Name is required';
      if (!formData.ownerEmail.trim() || !formData.ownerEmail.includes('@')) {
        errs.ownerEmail = 'Valid email is required';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const generateRandomCode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = formData.businessName
      ? formData.businessName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'REST')
      : 'REST';
    setFormData((prev) => ({ ...prev, uniqueCode: `${prefix}-${randomNum}` }));
    if (errors.uniqueCode) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.uniqueCode;
        return next;
      });
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryInput.trim()) return;
    if (!formData.categories.includes(newCategoryInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategoryInput.trim()],
      }));
    }
    setNewCategoryInput('');
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== catToRemove),
    }));
  };

  const handleAddPayment = () => {
    if (!newPaymentInput.trim()) return;
    if (!formData.paymentMethods.includes(newPaymentInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        paymentMethods: [...prev.paymentMethods, newPaymentInput.trim()],
      }));
    }
    setNewPaymentInput('');
  };

  const handleRemovePayment = (pmToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.filter((p) => p !== pmToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      // Transmit final payload to server
      console.log('Final Payload Transmitted to ENH Management Aide LTD:', formData);

      const newTenant = await tenantAuthService.onboardTenant({
        name: formData.businessName.trim(),
        uniqueCode: formData.uniqueCode.trim().toUpperCase(),
        ownerEmail: formData.ownerEmail.trim(),
        ownerName: formData.ownerName.trim(),
        branchName: formData.branchName.trim(),
        address: formData.address.trim() || 'Tanzania',
        phone: formData.phone.trim() || '+255 713 057 325',
        categories: formData.categories,
        paymentMethods: formData.paymentMethods,
        logoUrl: formData.logoUrl.trim(),
        tagline: `${formData.businessName} - High Velocity Hospitality`,
        currency: 'TZS',
      });

      alert('Tenant Created Successfully by ENH RESTAURANT MANAGEMENT AIDE LTD.');

      if (onTenantCreated) {
        onTenantCreated(newTenant);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error('Failed to create tenant:', err);
      alert(`Tenant Onboarding Notice: ${err.message || 'Tenant registered locally'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto">
      {/* Header banner with Developer Identity */}
      <div className="bg-[#1b2620] text-white p-6 sm:p-7 relative border-b border-[#2d3e35]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              ENH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ENH RESTAURANT MANAGEMENT AIDE LTD.
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Multi-Tenant Onboarding Wizard
              </h2>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Close Wizard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step progress pills */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">
          <div
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
              step === 1
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                : step > 1
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">
              1
            </span>
            <span className="truncate">Business Info</span>
          </div>

          <div
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
              step === 2
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                : step > 2
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">
              2
            </span>
            <span className="truncate">Owner & Branch</span>
          </div>

          <div
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
              step === 3
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-mono">
              3
            </span>
            <span className="truncate">Review & Confirm</span>
          </div>
        </div>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Step 1: Business Identity</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Define the restaurant's public brand name, logo image URL, and unique access code.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Serengeti Smokehouse"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 ${
                  errors.businessName
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.businessName && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">
                  {errors.businessName}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Unique Tenant Code <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Auto-generate
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. REST-1029 or REST-9021"
                value={formData.uniqueCode}
                onChange={(e) =>
                  setFormData({ ...formData, uniqueCode: e.target.value.toUpperCase() })
                }
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono font-bold tracking-wider focus:outline-none focus:ring-2 uppercase ${
                  errors.uniqueCode
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.uniqueCode && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">
                  {errors.uniqueCode}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                This code is entered on the ENH Developer Splash Access Screen to unlock the portal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Logo URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. /logo.jpg or https://images.unsplash.com/photo-..."
                value={formData.logoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                  errors.logoUrl
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.logoUrl && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">
                  {errors.logoUrl}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-slate-500 font-semibold">Quick Sample:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, logoUrl: '/logo.jpg' })}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-700 font-bold"
                >
                  Olli's Local Logo
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      logoUrl:
                        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
                    })
                  }
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] text-slate-700 font-bold"
                >
                  Grill Unsplash Logo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Owner & Branch Setup */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Step 2: Owner & Initial Branch Setup</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign the primary restaurant owner and the initial branch location.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Owner Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ernest Nyambi"
                value={formData.ownerName}
                onChange={(e) =>
                  setFormData({ ...formData, ownerName: e.target.value })
                }
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 ${
                  errors.ownerName
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.ownerName && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">
                  {errors.ownerName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Owner Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. ernestnyambi23@gmail.com"
                value={formData.ownerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, ownerEmail: e.target.value })
                }
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 ${
                  errors.ownerEmail
                    ? 'border-red-500 focus:ring-red-300'
                    : 'border-slate-200 focus:ring-emerald-500'
                }`}
              />
              {errors.ownerEmail && (
                <p className="text-[11px] text-red-500 mt-1 font-semibold">
                  {errors.ownerEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Branch Name
              </label>
              <input
                type="text"
                placeholder="e.g. Main Branch, Posta Branch, or Downtown"
                value={formData.branchName}
                onChange={(e) =>
                  setFormData({ ...formData, branchName: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Owners can manage multiple branches under their master account.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Restaurant Physical Address <span className="text-emerald-600 font-semibold">(Unique Per Restaurant • Printed on Receipts & Reports)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Village House (Kijiji), Lipangalala Street, The Place Rd., Ifakara, Tanzania"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This exact physical location will appear at the top of customer receipts and monthly audit reports.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Support / Order Hotline
              </label>
              <input
                type="text"
                placeholder="e.g. +255 713 057 325"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Review & Confirm */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Step 3: Review & Confirm Tenant Setup</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm your configuration before transmitting the final payload to the server.
              </p>
            </div>

            {/* Formatted Confirmation Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Business Identity
                </span>
                <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  {formData.uniqueCode || 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Business Name:</span>
                  <strong className="text-slate-900 text-sm">{formData.businessName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Default Branch:</span>
                  <strong className="text-slate-900">{formData.branchName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Owner Contact:</span>
                  <strong className="text-slate-900">
                    {formData.ownerName} ({formData.ownerEmail})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Logo Asset:</span>
                  <span className="text-slate-600 truncate block font-mono text-[11px]">
                    {formData.logoUrl || 'Default Logo'}
                  </span>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 block text-[11px]">Physical Address (Receipts & Reports):</span>
                  <strong className="text-slate-900 block">{formData.address || 'Village House (Kijiji), Lipangalala Street, Ifakara, Tanzania'}</strong>
                </div>
                {formData.phone && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Support Phone:</span>
                    <strong className="text-slate-900">{formData.phone}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Customizable Categories */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Default Menu Categories</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {formData.categories.length} categories
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-slate-400 hover:text-red-500 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom category..."
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>

            {/* Customizable Payment Gateways */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Enabled Payment Methods</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  {formData.paymentMethods.length} methods
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.paymentMethods.map((pm) => (
                  <span
                    key={pm}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200"
                  >
                    {pm}
                    <button
                      type="button"
                      onClick={() => handleRemovePayment(pm)}
                      className="text-emerald-500 hover:text-red-500 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add payment method (e.g. Card, Selcom)..."
                  value={newPaymentInput}
                  onChange={(e) => setNewPaymentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPayment();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddPayment}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm active:scale-95"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition shadow-md active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Provisioning Tenant...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Create Tenant Access
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
