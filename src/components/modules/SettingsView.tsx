import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PermissionNotice } from '../common/PermissionNotice';
import {
  Settings,
  Shield,
  UserCheck,
  KeyRound,
  Save,
  Download,
  Trash2,
  CheckCircle2,
  Lock,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  User,
  ShieldAlert,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    users,
    isAdmin,
    updateAdminProfile,
    createEmployee,
    resetEmployeePassword,
    toggleEmployeeStatus,
    deleteEmployee,
    exportDatabaseJSON,
    resetDatabaseToDefault,
  } = useApp();

  const adminUser = users.find(u => u.role === 'ADMIN') || currentUser;

  // Admin Profile form states
  const [adminName, setAdminName] = useState(adminUser?.name || 'Mian Rashid Saleem');
  const [adminEmail, setAdminEmail] = useState(adminUser?.email || '');
  const [phonePrimary, setPhonePrimary] = useState(adminUser?.phonePrimary || '03009654471');
  const [phoneSecondary, setPhoneSecondary] = useState(adminUser?.phoneSecondary || '03129654471');
  const [adminPassword, setAdminPassword] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Employee creation form state
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [empModalOpen, setEmpModalOpen] = useState(false);

  const handleAdminProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile({
      name: adminName,
      email: adminEmail,
      phonePrimary,
      phoneSecondary,
      password: adminPassword || undefined,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCreateEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;
    createEmployee({
      name: newEmpName.trim(),
      password: newEmpPassword || '123456',
    });
    setNewEmpName('');
    setNewEmpPassword('');
    setEmpModalOpen(false);
  };

  const registeredEmployees = users.filter(u => u.role === 'EMPLOYEE');

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-900 text-white rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">System & Account Settings</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage CEO Admin profile details, Employee login credentials, and database backups.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Admin Profile updated successfully! Changes applied immediately across all portals.</span>
        </div>
      )}

      {/* 1. ADMIN PROFILE SETTINGS (Mian Rashid Saleem) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            <h3 className="font-extrabold text-slate-900 text-base">CEO Admin Account Credentials</h3>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-red-100 text-red-700 uppercase">
            Full Control
          </span>
        </div>

        <form onSubmit={handleAdminProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  required
                  disabled={!isAdmin}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-900 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Admin Email (Login ID)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  required
                  disabled={!isAdmin}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-900 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={phonePrimary}
                  onChange={e => setPhonePrimary(e.target.value)}
                  required
                  disabled={!isAdmin}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-900 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Secondary Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={phoneSecondary}
                  onChange={e => setPhoneSecondary(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-900 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                New Admin Password (Leave blank to keep current)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={!isAdmin}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-900 disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" /> Save Admin Profile
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 2. EMPLOYEE ACCOUNT MANAGEMENT */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-900" />
            <h3 className="font-extrabold text-slate-900 text-base">Employee Login Management</h3>
          </div>
          {isAdmin && (
            <button
              onClick={() => setEmpModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Employee Account
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Employees log in using <span className="font-bold text-slate-900">Employee Name + Password</span> only.
        </p>

        <div className="space-y-2">
          {registeredEmployees.length === 0 ? (
            <p className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
              No employee accounts created yet. Click "Create Employee Account" above to register workers.
            </p>
          ) : (
            registeredEmployees.map(emp => (
              <div key={emp.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm">{emp.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${emp.active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {emp.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Password: {emp.password || '••••••'}</p>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleEmployeeStatus(emp.id)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    >
                      {emp.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteEmployee(emp.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. DATABASE BACKUP & RESTORE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Download className="w-5 h-5 text-emerald-600" />
          <h3 className="font-extrabold text-slate-900 text-base">Database Backup & Auto Restore</h3>
        </div>

        <p className="text-xs text-slate-500">
          Export full enterprise records as JSON file or reset to clean state.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportDatabaseJSON}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Backup (.JSON)
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all data to default clean state (0 values)?')) {
                  resetDatabaseToDefault();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 font-bold text-xs flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reset Database To Clean Default
            </button>
          )}
        </div>
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      {empModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-black text-sm">Create Employee Account</h3>
              <button onClick={() => setEmpModalOpen(false)} className="p-1 text-white hover:bg-white/10 rounded">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEmpSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Employee Name</label>
                <input
                  type="text"
                  value={newEmpName}
                  onChange={e => setNewEmpName(e.target.value)}
                  required
                  placeholder="e.g. Ali Raza"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Set Password</label>
                <input
                  type="password"
                  value={newEmpPassword}
                  onChange={e => setNewEmpPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md mt-2"
              >
                Register Employee Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
