import React, { useState } from 'react';
import { X, UserPlus, Phone, MapPin, Calendar, DollarSign, UserCheck, Shield, AlertCircle, KeyRound, Eye, EyeOff, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { StaffMember, RestaurantSettings } from '../types';
import { UserRole } from '../utils/rbac';
import { useAppTranslation } from '../utils/translations';

interface NewStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staff: StaffMember) => void;
  editingStaff?: StaffMember | null;
  settings: RestaurantSettings;
}

export const NewStaffModal: React.FC<NewStaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStaff,
  settings,
}) => {
  const { t } = useAppTranslation(settings.language || 'en');

  const [name, setName] = useState<string>(editingStaff?.name || '');
  const [roleTitle, setRoleTitle] = useState<string>(editingStaff?.roleTitle || 'Waiter');
  const [username, setUsername] = useState<string>(
    editingStaff?.username || (editingStaff?.name ? editingStaff.name.toLowerCase().replace(/\s+/g, '_') : '')
  );
  const [password, setPassword] = useState<string>(editingStaff?.password || 'staff123');
  const [pin, setPin] = useState<string>(editingStaff?.pin || '1234');
  const [accessEnabled, setAccessEnabled] = useState<boolean>(
    editingStaff?.accessEnabled !== undefined ? editingStaff.accessEnabled : true
  );
  const [assignedRole, setAssignedRole] = useState<UserRole>(editingStaff?.assignedRole || UserRole.STAFF);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [age, setAge] = useState<number | string>(editingStaff?.age || 24);
  const [sex, setSex] = useState<'Male' | 'Female' | 'Other'>(editingStaff?.sex || 'Male');
  const [fromLocation, setFromLocation] = useState<string>(editingStaff?.fromLocation || '');
  const [emergencyPhone1, setEmergencyPhone1] = useState<string>(editingStaff?.emergencyPhone1 || '');
  const [emergencyPhone2, setEmergencyPhone2] = useState<string>(editingStaff?.emergencyPhone2 || '');
  const [guardianName, setGuardianName] = useState<string>(editingStaff?.guardianName || '');
  const [agreedSalary, setAgreedSalary] = useState<number | string>(editingStaff?.agreedSalary || 350000);
  const [employmentDate, setEmploymentDate] = useState<string>(
    editingStaff?.employmentDate || new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingStaff && (!username || username === name.toLowerCase().replace(/\s+/g, '_'))) {
      setUsername(val.toLowerCase().trim().replace(/[^a-z0-9]/g, '_'));
    }
  };

  const handleGenerateCredentials = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    const cleanUser = name ? name.toLowerCase().trim().split(' ')[0] + randomPin.slice(0, 2) : 'staff_' + randomPin;
    setUsername(cleanUser);
    setPassword('pass_' + randomPin);
    setPin(randomPin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Staff full name is required');
      return;
    }
    if (!emergencyPhone1.trim()) {
      setError('At least one emergency contact number is required');
      return;
    }

    const cleanUsername = username.trim() || name.toLowerCase().trim().replace(/\s+/g, '_');
    const cleanPassword = password.trim() || 'staff123';
    const cleanPin = pin.trim() || '1234';

    const staffData: StaffMember = {
      id: editingStaff?.id || `staff-${Date.now()}`,
      name: name.trim(),
      roleTitle: roleTitle.trim() || 'Staff Member',
      username: cleanUsername,
      password: cleanPassword,
      pin: cleanPin,
      accessEnabled,
      assignedRole,
      age: Number(age) || 20,
      sex,
      fromLocation: fromLocation.trim() || 'Dar es Salaam',
      emergencyPhone1: emergencyPhone1.trim(),
      emergencyPhone2: emergencyPhone2.trim() || emergencyPhone1.trim(),
      guardianName: guardianName.trim() || 'Parent / Relative',
      agreedSalary: Number(agreedSalary) || 300000,
      employmentDate: employmentDate || new Date().toISOString().slice(0, 10),
      salaryPaymentStatus: editingStaff?.salaryPaymentStatus || 'pending',
      lastSalaryPaidDate: editingStaff?.lastSalaryPaidDate,
      createdAt: editingStaff?.createdAt || Date.now(),
    };

    onSave(staffData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#e2e4dc] my-8 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#1f4d3e] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {editingStaff ? 'Edit Staff & App Login' : 'Add Staff & Create Login Credentials'}
              </h3>
              <p className="text-xs text-[#cfe0d7]">
                Set username, password, POS access permissions and employee details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: APP LOGIN CREDENTIALS & ACCESS */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-300 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-800" />
                <span className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                  App Login & Access Control
                </span>
              </div>
              <button
                type="button"
                onClick={handleGenerateCredentials}
                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                title="Auto-generate username, secure password and PIN"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Auto-Generate Login</span>
              </button>
            </div>

            {/* Username & Access Toggle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#143529] mb-1">
                  Login Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#8b978f] font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="e.g. cashier_neema"
                    className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
                  />
                </div>
                <span className="text-[10px] text-[#4c5a52] mt-0.5 block">
                  Staff enters this username at login
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#143529] mb-1">
                  POS App Access Status
                </label>
                <button
                  type="button"
                  onClick={() => setAccessEnabled(!accessEnabled)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-between border transition-all ${
                    accessEnabled
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {accessEnabled ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{accessEnabled ? 'Login ENABLED' : 'Login DISABLED (Locked)'}</span>
                  </span>
                  <span className="text-[10px] underline font-bold">
                    {accessEnabled ? 'Disable' : 'Enable'}
                  </span>
                </button>
              </div>
            </div>

            {/* Password & Quick PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#143529] mb-1">
                  Login Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. cashier123"
                    className="w-full pl-3 pr-8 py-2 text-xs font-mono font-bold rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-[#4c5a52] hover:text-[#1b2620]"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#143529] mb-1">
                  Quick Access 4-Digit PIN
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1234"
                  className="w-full px-3 py-2 text-xs font-mono font-bold tracking-widest text-center rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
                />
              </div>
            </div>
          </div>

          {/* Full Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                Full Staff Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Baraka Juma Mdee"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4c5a52] mb-1">Role / Position Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Head Chef, Cashier, Waiter"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
              />
            </div>
          </div>

          {/* Age, Sex & Location */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4c5a52] mb-1">Age (Years)</label>
              <input
                type="number"
                min="18"
                max="80"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4c5a52] mb-1">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4c5a52] mb-1">Home Location</label>
              <input
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder="e.g. Kinondoni"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
              />
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-3.5 rounded-2xl bg-[#f7faf8] border border-[#e2e4dc] space-y-3">
            <span className="text-[11px] font-extrabold text-[#1f4d3e] uppercase tracking-wider block">
              Emergency Contacts & Guardian
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                  Emergency Phone 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={emergencyPhone1}
                  onChange={(e) => setEmergencyPhone1(e.target.value)}
                  placeholder="e.g. 0714 889 922"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c5a52] mb-1">Emergency Phone 2</label>
                <input
                  type="tel"
                  value={emergencyPhone2}
                  onChange={(e) => setEmergencyPhone2(e.target.value)}
                  placeholder="e.g. 0785 112 233"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4c5a52] mb-1">Guardian Name & Relation</label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Amina Mdee (Mother)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
              />
            </div>
          </div>

          {/* Salary & Employment Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                Agreed Monthly Salary ({settings.currency})
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                value={agreedSalary}
                onChange={(e) => setAgreedSalary(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#4c5a52] mb-1">
                Employment Hire Date
              </label>
              <input
                type="date"
                value={employmentDate}
                onChange={(e) => setEmploymentDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e2e4dc] bg-[#fafbfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1f4d3e]/20 focus:border-[#1f4d3e]"
              />
              <span className="text-[10px] text-[#8b978f] mt-0.5 block">
                Salary is paid monthly on this anniversary date
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#e2e4dc] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#e2e4dc] text-xs font-bold text-[#4c5a52] hover:bg-[#f4f5f0]"
            >
              {t('btn.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#1f4d3e] hover:bg-[#143529] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>{editingStaff ? 'Update Staff Credentials' : 'Create Staff & Login'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
