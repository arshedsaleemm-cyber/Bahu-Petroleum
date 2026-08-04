import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PermissionNotice } from '../common/PermissionNotice';
import { ReportsPDFCenter } from './ReportsPDFCenter';
import {
  Settings,
  Shield,
  UserCheck,
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
  LogOut,
  FileText,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    users,
    isAdmin,
    updateAdminProfile,
    createEmployee,
    toggleEmployeeStatus,
    deleteEmployee,
    exportDatabaseJSON,
    resetDatabaseToDefault,
    logout,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'REPORTS' | 'PROFILE' | 'EMPLOYEES' | 'BACKUP'>('REPORTS');

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
    if (!isAdmin) return;
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
    if (!isAdmin || !newEmpName.trim()) return;
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
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-900 text-white rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Profile, Reports & System Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Access PDF Reporting Center, Admin Profile Credentials, Employee Accounts & Database Backups.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
              isAdmin ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            Role: {currentUser?.role}
          </span>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'REPORTS'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>📄 Reports & Analytics → PDF Downloads</span>
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'PROFILE'
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Profile Credentials</span>
            </button>

            <button
              onClick={() => setActiveTab('EMPLOYEES')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'EMPLOYEES'
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Employee Accounts</span>
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('BACKUP')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'BACKUP'
              ? 'bg-slate-800 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Database & Session</span>
        </button>
      </div>

      {/* TAB CONTENT: REPORTS & PDF CENTER */}
      {activeTab === 'REPORTS' && <ReportsPDFCenter />}

      {/* TAB CONTENT: ADMIN PROFILE */}
      {activeTab === 'PROFILE' && isAdmin && (
        <div className="space-y-6">
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Admin Profile updated successfully! Changes applied immediately across all portals.</span>
            </div>
          )}

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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-900"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-900"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-900"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-900"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-blue-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Admin Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EMPLOYEES */}
      {activeTab === 'EMPLOYEES' && isAdmin && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-900" />
              <h3 className="font-extrabold text-slate-900 text-base">Employee Login Management</h3>
            </div>
            <button
              onClick={() => setEmpModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer hover:bg-blue-800"
            >
              <Plus className="w-4 h-4" /> Create Employee Account
            </button>
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
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Password: {emp.password ? '••••••' : 'Not set'}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleEmployeeStatus(emp.id)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      {emp.active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => deleteEmployee(emp.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer"
                      title="Delete Employee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BACKUP & LOGOUT */}
      {activeTab === 'BACKUP' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Download className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Database Backup & Export</h3>
            </div>

            <p className="text-xs text-slate-500">
              Export full enterprise records as a backup JSON file to store data securely offline.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportDatabaseJSON}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
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
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Reset Database To Clean Default
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <LogOut className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Session & Account Logout</h3>
                <p className="text-xs text-slate-500">
                  Logged in as <strong className="text-slate-900">{currentUser?.name || 'User'}</strong> ({currentUser?.role})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To log out or switch to another account, click the button below. You will be redirected to the secure login screen.
            </p>

            <div>
              <button
                onClick={logout}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Log Out of Enterprise System</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE EMPLOYEE MODAL */}
      {isAdmin && empModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-black text-sm">Create Employee Account</h3>
              <button onClick={() => setEmpModalOpen(false)} className="p-1 text-white hover:bg-white/10 rounded cursor-pointer">
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
                className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md mt-2 cursor-pointer"
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


