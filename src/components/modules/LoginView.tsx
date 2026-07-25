import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Fuel, ShieldCheck, UserCheck, Lock, Mail, Phone, Eye, EyeOff, ArrowRight, KeyRound, AlertCircle, CheckSquare, Square, X } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, users } = useApp();
  
  const [loginRole, setLoginRole] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');
  
  // Admin login states
  const [adminIdentifier, setAdminIdentifier] = useState('admin@bahupetroleum.com'); // email or 03009654471
  const [adminPassword, setAdminPassword] = useState('admin');

  // Employee login states
  const [employeeName, setEmployeeName] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(adminIdentifier, adminPassword, 'ADMIN');
    if (!success) {
      setErrorMsg('Invalid Admin Email / Mobile Number or Password. Please try again.');
    }
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!employeeName.trim()) {
      setErrorMsg('Please enter Employee Name.');
      return;
    }
    const success = login(employeeName.trim(), employeePassword, 'EMPLOYEE');
    if (!success) {
      setErrorMsg('Employee account not found or invalid password.');
    }
  };

  const existingEmployees = users.filter(u => u.role === 'EMPLOYEE');

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Top Branding Banner with Red, Blue & White Palette */}
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
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Admin Login Form */}
          {loginRole === 'ADMIN' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Admin Email or Primary Phone
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
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-[11px] font-bold text-blue-700 hover:underline"
                  >
                    Forgot Password?
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

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 text-slate-600 font-medium hover:text-slate-900"
                >
                  {rememberMe ? (
                    <CheckSquare className="w-4 h-4 text-blue-900" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Remember session</span>
                </button>
                <span className="text-[10px] text-slate-400 font-mono">Role: Full Control</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
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

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Sign In as Employee</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Footer Note */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium flex items-center justify-between px-6">
          <span>Bahu Petroleum Enterprise System</span>
          <span className="font-mono text-red-600 font-bold">Secured & Active</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-red-400" /> Admin Password Recovery
              </div>
              <button onClick={() => setIsForgotPasswordOpen(false)} className="p-1 rounded bg-white/10 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-600">
              <p className="font-bold text-slate-900">Admin Account Credentials:</p>
              <ul className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px]">
                <li><span className="font-bold text-slate-500">Name:</span> Mian Rashid Saleem</li>
                <li><span className="font-bold text-slate-500">Email:</span> admin@bahupetroleum.com</li>
                <li><span className="font-bold text-slate-500">Primary Mobile:</span> 03009654471</li>
                <li><span className="font-bold text-slate-500">Secondary Mobile:</span> 03129654471</li>
                <li><span className="font-bold text-emerald-700">Default Password:</span> admin</li>
              </ul>
              <p className="text-[10px] text-slate-400">
                You can change the Admin password anytime inside System Settings after logging in.
              </p>
              <button
                onClick={() => {
                  setAdminIdentifier('admin@bahupetroleum.com');
                  setAdminPassword('admin');
                  setIsForgotPasswordOpen(false);
                }}
                className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Auto-Fill Default Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
