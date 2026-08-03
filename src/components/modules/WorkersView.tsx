import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Worker } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  UserCheck,
  Plus,
  Search,
  Trash2,
  X,
  Edit2,
  Banknote,
  CalendarCheck,
  DollarSign,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingDown,
} from 'lucide-react';

export const WorkersView: React.FC = () => {
  const { workers, salaries, attendance, addWorker, updateWorker, deleteWorker, canDelete, canEdit } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);

  // Simplified Form State (Only Worker Full Name and Monthly Salary)
  const [name, setName] = useState('');
  const [monthlySalary, setMonthlySalary] = useState<number>(30000);

  const openAddModal = () => {
    setEditingWorker(null);
    setName('');
    setMonthlySalary(30000);
    setIsModalOpen(true);
  };

  const openEditModal = (w: Worker) => {
    setEditingWorker(w);
    setName(w.name);
    setMonthlySalary(w.monthlySalary || 0);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingWorker) {
      updateWorker({
        ...editingWorker,
        name: name.trim(),
        monthlySalary: Number(monthlySalary) || 0,
      });
    } else {
      addWorker({
        name: name.trim(),
        monthlySalary: Number(monthlySalary) || 0,
      });
    }
    setIsModalOpen(false);
  };

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Worker Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simplified employee profiles: Record worker names, monthly salaries, advances, salary payments, and attendance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Worker
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search workers by name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Worker Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-extrabold text-slate-700">No workers found</p>
          <p className="text-xs text-slate-400 mt-1">Click "Add New Worker" to add worker records.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(worker => {
            const sal = salaries.find(s => s.workerId === worker.id);
            const monthlySal = worker.monthlySalary || 0;
            const totalAdvanceTaken = sal?.totalAdvance || 0;
            const totalSalaryPaid = sal?.salaryPaid || 0;
            const pendingSalary = sal?.pendingSalary ?? Math.max(0, monthlySal - totalAdvanceTaken - totalSalaryPaid);

            const workerAttendance = attendance.filter(a => a.workerId === worker.id);
            const presentCount = workerAttendance.filter(a => a.status === 'Present').length;
            const absentCount = workerAttendance.filter(a => a.status === 'Absent').length;
            const leaveCount = workerAttendance.filter(a => a.status === 'Leave').length;
            const halfDayCount = workerAttendance.filter(a => a.status === 'Half Day').length;

            return (
              <div
                key={worker.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header Profile Section */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-900 font-black flex items-center justify-center text-base border border-blue-200 shrink-0">
                      {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{worker.name}</h3>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        Worker Profile
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <button
                        onClick={() => openEditModal(worker)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 transition-all cursor-pointer"
                        title="Edit Worker"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setWorkerToDelete(worker.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 transition-all cursor-pointer"
                        title="Delete Worker Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Financial Overview Grid (4 required Metrics) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold">
                      <Banknote className="w-3 h-3 text-slate-400" />
                      <span>Monthly Salary</span>
                    </div>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{formatCurrency(monthlySal)}</p>
                  </div>

                  <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 uppercase font-bold">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      <span>Total Paid</span>
                    </div>
                    <p className="font-extrabold text-emerald-900 text-sm mt-0.5">{formatCurrency(totalSalaryPaid)}</p>
                  </div>

                  <div className="bg-amber-50/80 p-2.5 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-1 text-[10px] text-amber-700 uppercase font-bold">
                      <TrendingDown className="w-3 h-3 text-amber-600" />
                      <span>Total Advance</span>
                    </div>
                    <p className="font-extrabold text-amber-900 text-sm mt-0.5">{formatCurrency(totalAdvanceTaken)}</p>
                  </div>

                  <div className="bg-blue-900 text-white p-2.5 rounded-xl">
                    <div className="flex items-center gap-1 text-[10px] text-blue-200 uppercase font-bold">
                      <AlertCircle className="w-3 h-3 text-blue-300" />
                      <span>Pending Salary</span>
                    </div>
                    <p className="font-black text-white text-sm mt-0.5">{formatCurrency(pendingSalary)}</p>
                  </div>
                </div>

                {/* Attendance Summary */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
                    <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Attendance Summary</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
                    <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg">
                      <span className="block text-[9px] font-bold text-emerald-700 uppercase">Present</span>
                      <span className="font-black text-emerald-900">{presentCount}</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                      <span className="block text-[9px] font-bold text-rose-700 uppercase">Absent</span>
                      <span className="font-black text-rose-900">{absentCount}</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-1.5 rounded-lg">
                      <span className="block text-[9px] font-bold text-amber-700 uppercase">Leave</span>
                      <span className="font-black text-amber-900">{leaveCount}</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-1.5 rounded-lg">
                      <span className="block text-[9px] font-bold text-blue-700 uppercase">Half Day</span>
                      <span className="font-black text-blue-900">{halfDayCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Simplified Add / Edit Worker Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-blue-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-base">
                  {editingWorker ? 'Edit Worker' : 'Add New Worker'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Worker Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="e.g. Muhammad Hamza"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Monthly Salary (PKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={monthlySalary}
                  onChange={e => setMonthlySalary(Number(e.target.value))}
                  required
                  min={0}
                  step={500}
                  placeholder="30000"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-bold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  {editingWorker ? 'Update Worker' : 'Save Worker Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={workerToDelete !== null}
        title="Delete Worker Profile"
        message="Are you sure you want to delete this worker profile?"
        onConfirm={() => {
          if (workerToDelete) {
            deleteWorker(workerToDelete);
            setWorkerToDelete(null);
          }
        }}
        onCancel={() => setWorkerToDelete(null)}
      />
    </div>
  );
};
