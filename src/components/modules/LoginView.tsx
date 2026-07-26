import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Fuel, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  KeyRound, 
  AlertCircle, 
  CheckSquare, 
  Square, 
  X,
  CheckCircle2,
  Send,
  Smartphone,
  RefreshCw,
  Shield,
  Laptop
} from 'lucide-react';
import { User } from '../../types';

export const LoginView: React.FC = () => {
  const { login, users, sendPasswordResetOTP, resetUserPassword } = useApp();
  
  const [loginRole, setLoginRole] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');
  
  // Admin login states
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Employee login states
  const [employeeName, setEmployeeName] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot Password / OTP Modal states
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1); // 1: Email Input, 2: OTP Input, 3: New Password
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState<string | null>(null);
  const [enteredOTP, setEnteredOTP] = useState('');
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [otpNotice, setOtpNotice] = useState<string>('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState('');
  
  // New password inputs
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Resend OTP countdown
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, resendCountdown]);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!adminIdentifier.trim() || !adminPassword) {
      setErrorMsg('Please enter both Email/Mobile and Password.');
      return;
    }

    const success = login(adminIdentifier, adminPassword, 'ADMIN', rememberMe);
    if (!success) {
      setErrorMsg('Invalid Credentials. Please check your Email / Mobile and Password.');
    }
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!employeeName.trim() || !employeePassword) {
      setErrorMsg('Please select Employee Name and enter Password.');
      return;
    }

    const success = login(employeeName.trim(), employeePassword, 'EMPLOYEE', rememberMe);
    if (!success) {
      setErrorMsg('Invalid Employee credentials or account disabled.');
    }
  };

  // Step 1: Send OTP
  const handleRequestOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    setOtpNotice('');

    if (!recoveryIdentifier.trim()) {
      setRecoveryError('Please enter your registered Email Address or Mobile Number.');
      return;
    }

    const res = sendPasswordResetOTP(recoveryIdentifier);
    if (!res.success || !res.otp || !res.user) {
      setRecoveryError(res.message);
      return;
    }

    setGeneratedOTP(res.otp);
    setTargetUser(res.user);
    setOtpNotice(res.message);
    setRecoveryStep(2);
    setResendCountdown(60);
    setIsTimerActive(true);
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (!enteredOTP.trim()) {
      setRecoveryError('Please enter the 6-digit verification code.');
      return;
    }

    if (enteredOTP.trim() !== generatedOTP) {
      setRecoveryError('Invalid verification code (OTP). Please check and try again.');
      return;
    }

    // OTP Verified successfully! Go to Step 3: Create New Password
    setRecoveryStep(3);
  };

  // Resend OTP
  const handleResendOTP = () => {
    if (!recoveryIdentifier.trim()) return;
    const res = sendPasswordResetOTP(recoveryIdentifier);
    if (res.success && res.otp && res.user) {
      setGeneratedOTP(res.otp);
      setOtpNotice(`New verification code (OTP) sent to ${res.user.email || res.user.phonePrimary || res.user.name}.`);
      setEnteredOTP('');
      setRecoveryError('');
      setResendCountdown(60);
      setIsTimerActive(true);
    }
  };

  // Step 3: Save New Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (!newPassword || newPassword.length < 6) {
      setRecoveryError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!targetUser) {
      setRecoveryError('User session expired. Please restart password recovery.');
      return;
    }

    resetUserPassword(targetUser.id, newPassword);

    // Reset recovery modal state & show success
    setRecoverySuccess('Password successfully updated! Please log in with your new password.');
    setTimeout(() => {
      closeForgotPasswordModal();
    }, 2500);
  };

  const closeForgotPasswordModal = () => {
    setIsForgotPasswordOpen(false);
    setRecoveryStep(1);
    setRecoveryIdentifier('');
    setGeneratedOTP(null);
    setEnteredOTP('');
    setTargetUser(null);
    setOtpNotice('');
    setRecoveryError('');
    setNewPassword('');
    setConfirmPassword('');
    setRecoverySuccess('');
  };

  const existingEmployees = users.filter(u => u.role === 'EMPLOYEE');

  // Calculate password strength score (0 to 4)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Top Branding Banner with Enterprise Palette */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
          {/* Top Red Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-red-500 to-red-700" />

          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-13 h-13 p-2.5 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
              <Fuel className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white font-sans">BAHU PETROLEUM</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-md shadow-sm">
                  ENTERPRISE SYSTEM
                </span>
                <span className="text-[11px] text-blue-200 font-semibold">Official Portal</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-800/60 flex items-center justify-between text-xs text-blue-100">
            <div>
              <p className="text-[10px] uppercase font-bold text-red-300">CEO & Founder</p>
              <p className="font-extrabold text-white text-sm">Mian Rashid Saleem</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-blue-300">Direct Helpline</p>
              <p className="font-bold text-white font-mono text-xs">0300-9654471</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">

          {/* Success Banner if password was reset */}
          {recoverySuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{recoverySuccess}</span>
            </div>
          )}

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setLoginRole('ADMIN');
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginRole === 'ADMIN'
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-red-400" /> Admin Login
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginRole('EMPLOYEE');
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                loginRole === 'EMPLOYEE'
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserCheck className="w-4 h-4 text-blue-300" /> Employee Login
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Admin Login Form */}
          {loginRole === 'ADMIN' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address / Mobile / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={adminIdentifier}
                    onChange={e => setAdminIdentifier(e.target.value)}
                    required
                    placeholder="admin@bahupetroleum.com or 03009654471"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-xs sm:text-sm font-medium outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordOpen(true);
                      setRecoveryStep(1);
                      setRecoveryError('');
                      setRecoverySuccess('');
                    }}
                    className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" /> Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-xs sm:text-sm font-medium outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Trusted Device Option */}
              <div className="pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-start gap-2.5 text-left text-xs text-slate-700 group cursor-pointer"
                >
                  <div className="mt-0.5 shrink-0">
                    {rememberMe ? (
                      <CheckSquare className="w-4 h-4 text-blue-900" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      Remember this device
                      <Laptop className="w-3 h-3 text-slate-400" />
                    </span>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Keep me signed in on this device. Password required on all other devices.
                    </p>
                  </div>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Sign In as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Employee Login Form */
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Employee Name
                </label>
                {existingEmployees.length > 0 ? (
                  <select
                    value={employeeName}
                    onChange={e => setEmployeeName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
                  >
                    <option value="">-- Select Registered Employee --</option>
                    {existingEmployees.map(emp => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={employeeName}
                      onChange={e => setEmployeeName(e.target.value)}
                      required
                      placeholder="Enter Employee Name"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium outline-none focus:border-blue-600"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={employeePassword}
                    onChange={e => setEmployeePassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 text-xs sm:text-sm font-medium outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Trusted Device Option for Employee */}
              <div className="pt-1 pb-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-start gap-2.5 text-left text-xs text-slate-700 group cursor-pointer"
                >
                  <div className="mt-0.5 shrink-0">
                    {rememberMe ? (
                      <CheckSquare className="w-4 h-4 text-blue-900" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Remember this device</span>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Keep signed in on this device.
                    </p>
                  </div>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Sign In as Employee</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Footer Security Note */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-600 font-medium flex items-center justify-between px-6">
          <span className="flex items-center gap-1 text-slate-700 font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-900" /> Password Verification Required
          </span>
          <span className="font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
            AES-256 SECURED
          </span>
        </div>
      </div>

      {/* SECURE FORGOT PASSWORD / OTP MODAL */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-950 p-5 text-white flex items-center justify-between border-b border-blue-800">
              <div className="flex items-center gap-2.5 font-black text-sm">
                <div className="p-2 rounded-xl bg-red-600 text-white shadow-sm">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3>Account Password Recovery</h3>
                  <p className="text-[10px] text-blue-200 font-normal">Secure OTP Verification</p>
                </div>
              </div>
              <button 
                onClick={closeForgotPasswordModal}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Steps Indicator */}
            <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span className={`flex items-center gap-1 ${recoveryStep === 1 ? 'text-blue-900 font-extrabold' : recoveryStep > 1 ? 'text-emerald-700' : ''}`}>
                1. Request OTP
              </span>
              <span className="text-slate-300">➔</span>
              <span className={`flex items-center gap-1 ${recoveryStep === 2 ? 'text-blue-900 font-extrabold' : recoveryStep > 2 ? 'text-emerald-700' : ''}`}>
                2. Verify Code
              </span>
              <span className="text-slate-300">➔</span>
              <span className={`flex items-center gap-1 ${recoveryStep === 3 ? 'text-blue-900 font-extrabold' : ''}`}>
                3. New Password
              </span>
            </div>

            <div className="p-6 space-y-4">

              {recoveryError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{recoveryError}</span>
                </div>
              )}

              {/* STEP 1: Enter Registered Email / Mobile */}
              {recoveryStep === 1 && (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      Enter your registered <strong className="text-slate-900">Email Address</strong> or <strong className="text-slate-900">Mobile Number</strong>. A secure 6-digit verification code (OTP) will be generated to verify your identity.
                    </p>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Registered Email or Mobile Number
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={recoveryIdentifier}
                        onChange={e => setRecoveryIdentifier(e.target.value)}
                        required
                        placeholder="e.g. admin@bahupetroleum.com or 03009654471"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Verification Code (OTP)</span>
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Enter & Verify OTP */}
              {recoveryStep === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  {otpNotice && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-700 shrink-0" />
                      <span>{otpNotice}</span>
                    </div>
                  )}

                  {/* Simulated OTP Email/SMS Dispatch Notice Box for testing */}
                  {generatedOTP && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5 text-amber-800">
                          <Send className="w-3.5 h-3.5 text-amber-600" /> Simulated Security Dispatch:
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-200/80 text-[10px] font-mono font-bold">
                          DEMO MODE
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        In enterprise production, this OTP is delivered via email or SMS.
                      </p>
                      <div className="pt-1 flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Your 6-Digit OTP:</span>
                        <span className="font-mono text-base font-black text-slate-900 tracking-widest">{generatedOTP}</span>
                        <button
                          type="button"
                          onClick={() => setEnteredOTP(generatedOTP)}
                          className="px-2 py-1 text-[10px] font-bold bg-amber-600 text-white rounded hover:bg-amber-700"
                        >
                          Auto-Fill OTP
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOTP}
                        onChange={e => setEnteredOTP(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder="123456"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-base font-mono font-bold text-slate-900 outline-none focus:border-blue-900 tracking-widest text-center"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <button
                      type="button"
                      disabled={isTimerActive}
                      onClick={handleResendOTP}
                      className={`flex items-center gap-1 font-bold ${isTimerActive ? 'text-slate-400 cursor-not-allowed' : 'text-blue-900 hover:underline cursor-pointer'}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isTimerActive ? `Resend OTP in ${resendCountdown}s` : 'Resend Verification Code'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecoveryStep(1)}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      Change Email/Phone
                    </button>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <span>Verify OTP & Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Set New Password */}
              {recoveryStep === 3 && (
                <form onSubmit={handleSaveNewPassword} className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>OTP Verified for {targetUser?.name || 'User Account'}. Set your new password.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium outline-none focus:border-blue-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-500">Password Strength:</span>
                          <span className={strengthScore <= 1 ? 'text-red-600' : strengthScore <= 2 ? 'text-amber-600' : 'text-emerald-600'}>
                            {strengthScore <= 1 ? 'Weak' : strengthScore <= 2 ? 'Moderate' : 'Strong'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                          <div
                            className={`h-full transition-all ${
                              strengthScore <= 1 ? 'w-1/3 bg-red-500' : strengthScore <= 2 ? 'w-2/3 bg-amber-500' : 'w-full bg-emerald-500'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder="Re-enter new password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium outline-none focus:border-blue-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save New Password</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
