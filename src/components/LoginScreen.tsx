import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  Terminal,
  UserCheck,
  Building2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Mail,
  CheckCircle2,
  KeyRound,
  LogIn,
  RotateCcw,
} from 'lucide-react';
import { UserRole, isDeveloperPasswordValid, DEVELOPER_PASSWORD } from '../utils/rbac';
import { AuthUser, RestaurantSettings, StaffMember, BusinessOwnerAccount } from '../types';
import { sound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';
import { BrandLogo } from './BrandLogo';
import { useFirebase } from '../firebase/FirebaseContext';

interface LoginScreenProps {
  settings: RestaurantSettings;
  staffList: StaffMember[];
  businessOwners?: BusinessOwnerAccount[];
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  settings,
  staffList,
  businessOwners = [],
  onLoginSuccess,
}) => {
  const { signInWithEmail, signUpWithEmail, resetPassword, signInWithGoogle } = useFirebase();

  // Mode: 'username' or 'email'
  const [loginMode, setLoginMode] = useState<'username' | 'email'>('username');
  
  // Terminal Username/Password state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STAFF);

  // Email state
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHints, setShowHints] = useState(false);

  // Authenticate via credentials
  const handleSubmitCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Please enter both username and password.');
      sound.playError();
      triggerHaptic('heavy');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. Developer Check
      const isDevUser =
        cleanUser === 'dev' ||
        cleanUser === 'developer' ||
        cleanUser === 'admin' ||
        cleanUser === 'root' ||
        cleanUser === 'ernest' ||
        cleanUser === 'ernestnyambi23@gmail.com';

      if (
        (isDevUser && isDeveloperPasswordValid(cleanPass, settings.adminPassword)) ||
        (selectedRole === UserRole.DEVELOPER && isDeveloperPasswordValid(cleanPass, settings.adminPassword))
      ) {
        completeLogin({
          id: 'usr_dev_001',
          username: 'developer',
          name: 'Developer (Root Owner)',
          role: UserRole.DEVELOPER,
          businessId: null,
          lastLoginAt: Date.now(),
        });
        return;
      }

      // 2. Provisioned Business Owners Check
      const matchedOwner = businessOwners.find(
        (o) =>
          (o.username && o.username.toLowerCase() === cleanUser) ||
          o.name.toLowerCase() === cleanUser ||
          o.email?.toLowerCase() === cleanUser ||
          (cleanUser === 'owner') ||
          (cleanUser === (settings.ownerName || '').toLowerCase())
      );

      if (matchedOwner) {
        if (matchedOwner.accessEnabled === false) {
          setIsLoading(false);
          setErrorMessage(`Login Suspended: Access for Business Owner "${matchedOwner.name}" has been disabled by Developer Root Master Control.`);
          sound.playError();
          triggerHaptic('heavy');
          return;
        }

        const isOwnerPasswordCorrect =
          cleanPass === matchedOwner.password ||
          (matchedOwner.pin && cleanPass === matchedOwner.pin) ||
          cleanPass === settings.adminPassword ||
          cleanPass === 'owner123' ||
          cleanPass === '8888';

        if (isOwnerPasswordCorrect) {
          completeLogin({
            id: matchedOwner.id,
            username: matchedOwner.username || 'owner',
            name: matchedOwner.name || settings.ownerName || 'Restaurant Owner',
            role: UserRole.OWNER,
            businessId: 'biz_main_001',
            lastLoginAt: Date.now(),
          });
          return;
        }
      }

      // 3. Fallback Legacy Owner Check
      const adminPass = settings.adminPassword || 'admin123';
      if (
        (cleanUser === 'owner' || cleanUser === 'boss' || cleanUser === 'manager' || cleanUser === (settings.ownerName || '').toLowerCase()) &&
        (cleanPass === 'owner123' || cleanPass === adminPass || cleanPass === '8888')
      ) {
        completeLogin({
          id: 'usr_owner_001',
          username: cleanUser,
          name: settings.ownerName || 'Restaurant Owner',
          role: UserRole.OWNER,
          businessId: 'biz_main_001',
          lastLoginAt: Date.now(),
        });
        return;
      }

      // 4. Check custom staff in staffList
      const matchedStaff = staffList.find(
        (s) =>
          (s.username && s.username.toLowerCase() === cleanUser) ||
          s.name.toLowerCase() === cleanUser ||
          s.email?.toLowerCase() === cleanUser ||
          s.phone?.includes(cleanUser) ||
          (cleanUser === 'staff')
      );

      if (matchedStaff) {
        if (matchedStaff.accessEnabled === false) {
          setIsLoading(false);
          setErrorMessage(`Login Disabled: Access for staff member "${matchedStaff.name}" has been disabled by the Owner.`);
          sound.playError();
          triggerHaptic('heavy');
          return;
        }

        const isPasswordCorrect =
          (matchedStaff.password && cleanPass === matchedStaff.password) ||
          (matchedStaff.pin && cleanPass === matchedStaff.pin) ||
          cleanPass === 'staff123' ||
          cleanPass === '1234' ||
          (matchedStaff.phone && cleanPass === matchedStaff.phone);

        if (isPasswordCorrect) {
          completeLogin({
            id: matchedStaff.id,
            username: matchedStaff.username || matchedStaff.name.toLowerCase().replace(/\s+/g, '_'),
            name: matchedStaff.name,
            role: matchedStaff.assignedRole || UserRole.STAFF,
            businessId: 'biz_main_001',
            lastLoginAt: Date.now(),
          });
          return;
        }
      }

      // 5. Fallback Generic Staff credentials
      if (cleanUser === 'staff' && (cleanPass === 'staff123' || cleanPass === '1234' || cleanPass === 'password')) {
        completeLogin({
          id: 'usr_staff_default',
          username: 'staff',
          name: 'POS Staff Member',
          role: UserRole.STAFF,
          businessId: 'biz_main_001',
          lastLoginAt: Date.now(),
        });
        return;
      }

      // 6. If selected role matches standard passwords
      if (selectedRole === UserRole.STAFF && (cleanPass === 'staff123' || cleanPass === '1234')) {
        completeLogin({
          id: `usr_staff_${Date.now()}`,
          username: cleanUser,
          name: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
          role: UserRole.STAFF,
          businessId: 'biz_main_001',
          lastLoginAt: Date.now(),
        });
        return;
      }

      if (selectedRole === UserRole.OWNER && (cleanPass === 'owner123' || cleanPass === adminPass)) {
        completeLogin({
          id: `usr_owner_${Date.now()}`,
          username: cleanUser,
          name: cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1),
          role: UserRole.OWNER,
          businessId: 'biz_main_001',
          lastLoginAt: Date.now(),
        });
        return;
      }

      if (selectedRole === UserRole.DEVELOPER && isDeveloperPasswordValid(cleanPass, settings.adminPassword)) {
        completeLogin({
          id: `usr_dev_${Date.now()}`,
          username: cleanUser,
          name: 'Developer (Root)',
          role: UserRole.DEVELOPER,
          businessId: null,
          lastLoginAt: Date.now(),
        });
        return;
      }

      // Invalid
      setIsLoading(false);
      setErrorMessage('Invalid username or password. Check credentials and try again.');
      sound.playError();
      triggerHaptic('heavy');
    }, 300);
  };

  const completeLogin = (user: Omit<AuthUser, 'restaurant_id'> & { restaurant_id?: string }) => {
    sound.playSuccess();
    triggerHaptic('success');
    setIsLoading(false);
    const fullUser: AuthUser = {
      ...user,
      restaurant_id: user.restaurant_id || (user.role === UserRole.DEVELOPER ? 'ALL' : 'ollis-pizza'),
    };
    onLoginSuccess(fullUser);
  };

  // Email Login Handler
  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = emailPassword.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Please enter both your registered email and password.');
      sound.playError();
      triggerHaptic('heavy');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Developer check
      const isDeveloperEmail =
        cleanEmail === 'ernestnyambi23@gmail.com' ||
        cleanEmail === 'developer@ollispizza.com' ||
        cleanEmail === 'dev@ollispizza.com';

      if (isDeveloperEmail && isDeveloperPasswordValid(cleanPass, settings.adminPassword)) {
        completeLogin({
          id: 'usr_dev_001',
          username: 'developer',
          name: 'Developer (Root Owner)',
          email: cleanEmail,
          role: UserRole.DEVELOPER,
          businessId: null,
          lastLoginAt: Date.now(),
        });
        return;
      }

      // 2. Firebase Auth Email sign-in attempt
      let firebaseUser = null;
      let fbError: any = null;
      try {
        firebaseUser = await signInWithEmail(cleanEmail, cleanPass);
      } catch (err: any) {
        fbError = err;
        console.warn('[LoginScreen] Firebase email authentication:', err?.code || err?.message);
      }

      // 3. Registered Business Owner Check
      const matchedOwner = businessOwners.find(
        (o) =>
          o.email?.toLowerCase() === cleanEmail ||
          (cleanEmail === (settings.ownerEmail || '').toLowerCase() && (o.username === 'owner' || o.id === 'usr_owner_001'))
      );

      if (matchedOwner) {
        if (matchedOwner.accessEnabled === false) {
          setIsLoading(false);
          setErrorMessage(`Login Suspended: Access for Business Owner "${matchedOwner.name}" has been disabled.`);
          sound.playError();
          triggerHaptic('heavy');
          return;
        }

        const isOwnerPasswordCorrect =
          Boolean(firebaseUser) ||
          cleanPass === matchedOwner.password ||
          (matchedOwner.pin && cleanPass === matchedOwner.pin) ||
          cleanPass === settings.adminPassword ||
          cleanPass === 'owner123' ||
          cleanPass === '8888';

        if (isOwnerPasswordCorrect) {
          completeLogin({
            id: matchedOwner.id,
            username: matchedOwner.username || matchedOwner.name.toLowerCase().replace(/\s+/g, '_'),
            name: matchedOwner.name || settings.ownerName || 'Restaurant Owner',
            email: cleanEmail,
            role: UserRole.OWNER,
            businessId: 'biz_main_001',
            lastLoginAt: Date.now(),
          });
          return;
        }
      }

      // Fallback Owner Match
      if (
        (settings.ownerEmail && cleanEmail === settings.ownerEmail.toLowerCase()) ||
        cleanEmail === 'owner@ollispizza.com'
      ) {
        const isDefaultOwnerPass =
          Boolean(firebaseUser) ||
          cleanPass === settings.adminPassword ||
          cleanPass === 'owner123' ||
          cleanPass === '8888';

        if (isDefaultOwnerPass) {
          completeLogin({
            id: 'usr_owner_001',
            username: 'owner',
            name: settings.ownerName || 'Restaurant Owner',
            email: cleanEmail,
            role: UserRole.OWNER,
            businessId: 'biz_main_001',
            lastLoginAt: Date.now(),
          });
          return;
        }
      }

      // 4. Registered Staff Member Check
      const matchedStaff = staffList.find((s) => s.email?.toLowerCase() === cleanEmail);

      if (matchedStaff) {
        if (matchedStaff.accessEnabled === false) {
          setIsLoading(false);
          setErrorMessage(`Login Disabled: Access for staff member "${matchedStaff.name}" has been disabled by Owner.`);
          sound.playError();
          triggerHaptic('heavy');
          return;
        }

        const isStaffPasswordCorrect =
          Boolean(firebaseUser) ||
          (matchedStaff.password && cleanPass === matchedStaff.password) ||
          (matchedStaff.pin && cleanPass === matchedStaff.pin) ||
          cleanPass === 'staff123' ||
          cleanPass === '1234';

        if (isStaffPasswordCorrect) {
          completeLogin({
            id: matchedStaff.id,
            username: matchedStaff.username || matchedStaff.name.toLowerCase().replace(/\s+/g, '_'),
            name: matchedStaff.name,
            email: cleanEmail,
            role: matchedStaff.assignedRole || UserRole.STAFF,
            businessId: 'biz_main_001',
            lastLoginAt: Date.now(),
          });
          return;
        }
      }

      // 5. Firebase authenticated user (if not explicitly registered yet)
      if (firebaseUser) {
        const isOwnerRole =
          cleanEmail.includes('owner') ||
          cleanEmail.includes('admin') ||
          cleanEmail === (settings.ownerEmail || '').toLowerCase();
        completeLogin({
          id: firebaseUser.uid,
          username: cleanEmail.split('@')[0],
          name: firebaseUser.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: isOwnerRole ? UserRole.OWNER : UserRole.STAFF,
          businessId: 'biz_main_001',
          lastLoginAt: Date.now(),
        });
        return;
      }

      // 6. Failed authentication
      setIsLoading(false);
      if (fbError && fbError.code === 'auth/wrong-password') {
        setErrorMessage('Incorrect password for this email account.');
      } else if (fbError && fbError.code === 'auth/user-not-found') {
        setErrorMessage('No account found with this email. Make sure your email is registered in Staff or Owner settings.');
      } else {
        setErrorMessage('Invalid email or password. Verify credentials or register your email below.');
      }
      sound.playError();
      triggerHaptic('heavy');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Authentication error. Please try again.');
      sound.playError();
      triggerHaptic('heavy');
    }
  };

  // Google Sign-In Handler
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const gUser = await signInWithGoogle();
      if (!gUser) {
        setIsLoading(false);
        return;
      }

      const cleanEmail = (gUser.email || '').toLowerCase();

      // Check Developer
      if (cleanEmail === 'ernestnyambi23@gmail.com') {
        completeLogin({
          id: gUser.uid,
          username: 'developer',
          name: gUser.displayName || 'Developer (Root Owner)',
          email: cleanEmail,
          role: UserRole.DEVELOPER,
          businessId: null,
          lastLoginAt: Date.now(),
        });
        return;
      }

      // Check Business Owner
      const matchedOwner = businessOwners.find((o) => o.email?.toLowerCase() === cleanEmail);
      if (matchedOwner) {
        completeLogin({
          id: matchedOwner.id,
          username: matchedOwner.username || matchedOwner.name,
          name: matchedOwner.name,
          email: cleanEmail,
          role: UserRole.OWNER,
          businessId: 'biz_main_001',
          lastLoginAt: Date.now(),
        });
        return;
      }

      // Check Staff Member
      const matchedStaff = staffList.find((s) => s.email?.toLowerCase() === cleanEmail);
      if (matchedStaff) {
        completeLogin({
          id: matchedStaff.id,
          username: matchedStaff.username || matchedStaff.name,
          name: matchedStaff.name,
          email: cleanEmail,
          role: matchedStaff.assignedRole || UserRole.STAFF,
          businessId: 'biz_main_001',
          lastLoginAt: Date.now(),
        });
        return;
      }

      // Default
      const isOwnerEmail =
        cleanEmail.includes('owner') ||
        cleanEmail.includes('admin') ||
        cleanEmail === (settings.ownerEmail || '').toLowerCase();
      completeLogin({
        id: gUser.uid,
        username: cleanEmail.split('@')[0],
        name: gUser.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: isOwnerEmail ? UserRole.OWNER : UserRole.STAFF,
        businessId: 'biz_main_001',
        lastLoginAt: Date.now(),
      });
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Google authentication was cancelled.');
      sound.playError();
      triggerHaptic('heavy');
    }
  };

  // Register New Email Account Handler
  const handleRegisterEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = emailPassword.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMessage('Please enter both email and password.');
      sound.playError();
      triggerHaptic('heavy');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      sound.playError();
      triggerHaptic('heavy');
      return;
    }

    if (cleanPass !== confirmPassword.trim()) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      sound.playError();
      triggerHaptic('heavy');
      return;
    }

    setIsLoading(true);

    try {
      const newUser = await signUpWithEmail(cleanEmail, cleanPass);
      if (newUser) {
        const isDev = cleanEmail === 'ernestnyambi23@gmail.com';
        const matchedOwner = businessOwners.find((o) => o.email?.toLowerCase() === cleanEmail);
        const matchedStaff = staffList.find((s) => s.email?.toLowerCase() === cleanEmail);

        let assignedRole = UserRole.STAFF;
        let displayName = cleanEmail.split('@')[0];
        let userId = newUser.uid;

        if (isDev) {
          assignedRole = UserRole.DEVELOPER;
          displayName = 'Developer (Root Owner)';
        } else if (matchedOwner) {
          assignedRole = UserRole.OWNER;
          displayName = matchedOwner.name;
          userId = matchedOwner.id;
        } else if (matchedStaff) {
          assignedRole = matchedStaff.assignedRole || UserRole.STAFF;
          displayName = matchedStaff.name;
          userId = matchedStaff.id;
        }

        completeLogin({
          id: userId,
          username: cleanEmail.split('@')[0],
          name: displayName,
          email: cleanEmail,
          role: assignedRole,
          businessId: isDev ? null : 'biz_main_001',
          lastLoginAt: Date.now(),
        });
      }
    } catch (err: any) {
      setIsLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('This email is already registered. Please sign in with your password.');
      } else {
        setErrorMessage(err.message || 'Failed to register email account.');
      }
      sound.playError();
      triggerHaptic('heavy');
    }
  };

  // Password Reset Handler
  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter your registered email address.');
      sound.playError();
      triggerHaptic('heavy');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(cleanEmail);
      setIsLoading(false);
      setSuccessMessage(`Password reset email sent to ${cleanEmail}. Check your inbox to set a new password.`);
      sound.playSuccess();
      triggerHaptic('success');
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to send password reset email.');
      sound.playError();
      triggerHaptic('heavy');
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#143529] via-[#102a20] to-[#0a1b14] text-white flex flex-col justify-between p-4 sm:p-6 relative overflow-x-hidden select-none">
      {/* Dynamic Official Restaurant Logo Crisp Subtle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
        <img
          src={settings.logoUrl || '/logo.jpg'}
          alt="Official Restaurant Logo Background"
          className="w-full h-full object-cover opacity-15 filter contrast-110 saturate-125 transition-all duration-700 pointer-events-none crisp-img"
          onError={(e) => {
            e.currentTarget.src = '/logo.jpg';
          }}
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#143529]/80 via-[#102a20]/90 to-[#0a1b14]/95" />
      </div>

      {/* Background Subtle Accent Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full pointer-events-none -z-10" />

      {/* Top Header & Branding */}
      <div className="max-w-md w-full mx-auto text-center pt-3 sm:pt-6">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="p-1 sm:p-2 bg-white rounded-3xl shadow-2xl border border-white/40 flex items-center justify-center">
            <BrandLogo size="full" shape="rounded" alt={settings.restaurantName} />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <span>{settings.restaurantName}</span>
        </h1>
        <p className="text-xs sm:text-sm text-emerald-200/80 font-medium mt-1">
          {settings.tagline || 'POS & Kitchen Management System'}
        </p>
      </div>

      {/* Main Login Card Container */}
      <div className="max-w-md w-full mx-auto my-auto py-4">
        <div className="bg-[#102a20]/95 border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl">
          {/* Top Mode Segmented Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/40 rounded-2xl mb-4 border border-white/10">
            <button
              type="button"
              id="login-mode-username-tab"
              onClick={() => {
                setLoginMode('username');
                setErrorMessage(null);
                setSuccessMessage(null);
                setIsResetMode(false);
                setIsRegisterMode(false);
                sound.playClick();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'username'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Username / PIN</span>
            </button>

            <button
              type="button"
              id="login-mode-email-tab"
              onClick={() => {
                setLoginMode('email');
                setErrorMessage(null);
                setSuccessMessage(null);
                sound.playClick();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginMode === 'email'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Registered Email</span>
            </button>
          </div>

          {/* Success Notification Banner */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="flex-1">{successMessage}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}

          {/* MODE 1: Standard Username + Password Login Form */}
          {loginMode === 'username' && (
            <form onSubmit={handleSubmitCredentials} className="space-y-4">
              {/* Role Preference Pill Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                  Select Access Tier
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(UserRole.STAFF);
                      if (!username) setUsername('staff');
                      sound.playClick();
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all flex flex-col items-center gap-1 ${
                      selectedRole === UserRole.STAFF
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 shadow-xs ring-1 ring-amber-400/50'
                        : 'bg-black/30 border-white/10 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Staff</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(UserRole.OWNER);
                      if (!username) setUsername('owner');
                      sound.playClick();
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all flex flex-col items-center gap-1 ${
                      selectedRole === UserRole.OWNER
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-xs ring-1 ring-emerald-400/50'
                        : 'bg-black/30 border-white/10 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole(UserRole.DEVELOPER);
                      if (!username) setUsername('dev');
                      sound.playClick();
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-all flex flex-col items-center gap-1 ${
                      selectedRole === UserRole.DEVELOPER
                        ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200 shadow-xs ring-1 ring-indigo-400/50'
                        : 'bg-black/30 border-white/10 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Dev Root</span>
                  </button>
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-gray-200 mb-1">
                  Username or Staff Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="login-username-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. staff, owner, dev"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full pl-10 pr-3 py-3 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-500 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-200">
                    Password / Passcode
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHints(!showHints)}
                    className="text-[11px] text-emerald-300 hover:text-emerald-200 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>{showHints ? 'Hide hints' : 'Need credentials?'}</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-500 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Submit Button */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: Registered Email Login Form */}
          {loginMode === 'email' && (
            <div>
              {/* Subview A: Password Reset Flow */}
              {isResetMode ? (
                <form onSubmit={handleSendPasswordReset} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                      <span>Reset Account Password</span>
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      Enter your registered email to receive a password reset link.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        id="reset-email-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. employee@ollispizza.com"
                        required
                        className="w-full pl-10 pr-3 py-3 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-500 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="send-reset-btn"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Password Reset Link</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(false);
                        setErrorMessage(null);
                      }}
                      className="text-xs text-emerald-300 hover:text-emerald-200 font-semibold underline underline-offset-2 cursor-pointer"
                    >
                      Back to Email Login
                    </button>
                  </div>
                </form>
              ) : isRegisterMode ? (
                /* Subview B: Register Email Password */
                <form onSubmit={handleRegisterEmail} className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Register Account Password</span>
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      Set a password for your registered staff or business email.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        id="register-email-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. employee@ollispizza.com"
                        required
                        className="w-full pl-10 pr-3 py-3 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-500 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Create Password (min. 6 characters)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="register-password-input"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        placeholder="New password..."
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-500 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="register-confirm-password-input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password..."
                        required
                        className="w-full pl-10 pr-3 py-3 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-500 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="register-submit-btn"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Create Account Password</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(false);
                        setErrorMessage(null);
                      }}
                      className="text-xs text-emerald-300 hover:text-emerald-200 font-semibold underline underline-offset-2 cursor-pointer"
                    >
                      Already have a password? Sign In
                    </button>
                  </div>
                </form>
              ) : (
                /* Subview C: Standard Email Sign In Form */
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-200 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        id="login-email-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. employee@ollispizza.com"
                        autoCapitalize="none"
                        autoCorrect="off"
                        required
                        className="w-full pl-10 pr-3 py-3 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-500 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-200">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetMode(true);
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-[11px] text-emerald-300 hover:text-emerald-200 font-semibold cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="login-email-password-input"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        placeholder="Account password or PIN..."
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-black/40 border border-white/20 text-white placeholder-gray-500 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Email Login Button */}
                  <button
                    type="submit"
                    id="login-email-submit-btn"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Log In with Email</span>
                      </>
                    )}
                  </button>

                  {/* Register Option Link */}
                  <div className="text-center pt-1">
                    <span className="text-xs text-gray-400">Need to activate password? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegisterMode(true);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs text-emerald-300 hover:text-emerald-200 font-bold underline underline-offset-2 cursor-pointer"
                    >
                      Register Email
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative flex py-1 items-center">
                    <div className="grow border-t border-white/15"></div>
                    <span className="shrink mx-3 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      or
                    </span>
                    <div className="grow border-t border-white/15"></div>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    id="login-google-btn"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-gray-100 active:scale-[0.98] text-gray-800 font-bold text-xs shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign In with Google Account</span>
                  </button>

                  <p className="text-[11px] text-center text-emerald-200/70 pt-1">
                    Accepts any registered email in Staff profiles, Owner accounts, or Google Workspace.
                  </p>
                </form>
              )}
            </div>
          )}

          {/* Credentials Info Helper Accordion */}
          {showHints && loginMode === 'username' && (
            <div className="mt-4 p-3.5 bg-black/50 rounded-2xl border border-white/15 text-[11px] text-gray-300 space-y-2 animate-in fade-in">
              <div className="font-bold text-white flex items-center gap-1 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Default Access Credentials</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 pt-1 text-[11px]">
                <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                  <span className="font-semibold text-amber-300">Staff POS:</span>
                  <span className="font-mono text-gray-200">staff / staff123</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                  <span className="font-semibold text-emerald-300">Restaurant Owner:</span>
                  <span className="font-mono text-gray-200">owner / owner123</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="font-semibold text-indigo-300">Developer Root:</span>
                  <span className="font-mono text-gray-200">dev / {DEVELOPER_PASSWORD}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-emerald-300/60 pb-2 flex flex-col items-center gap-1">
        <span>{settings.restaurantName} &bull; Management Portal</span>
        <span className="text-[10px] text-emerald-400/50">Powered by ENH RESTAURANT MANAGEMENT AIDE LTD.</span>
      </div>
    </div>
  );
};
