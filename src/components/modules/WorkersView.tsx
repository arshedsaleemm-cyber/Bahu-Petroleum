import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Worker } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { PDFExportButton } from '../common/PDFExportButton';
import { UserCheck, Plus, Search, Phone, CreditCard, MapPin, Calendar, Trash2, X, Edit2 } from 'lucide-react';

export const WorkersView: React.FC = () => {
  const { workers, addWorker, updateWorker, deleteWorker, canDelete, canEdit } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('0300-1234567');
  const [cnic, setCnic] = useState('35202-1234567-1');
  const [address, setAddress] = useState('Multan Road, Lahore');
  const [designation, setDesignation] = useState('Dispenser Operator');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().slice(0, 10));
  const [monthlySalary, setMonthlySalary] = useState<number>(30000);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const openAddModal = () => {
    setEditingWorker(null);
    setName('Muhammad Hamza');
    setFatherName('Muhammad Sharif');
    setPhoneNumber('0301-8890123');
    setCnic('35201-9920192-3');
    setAddress('Chung, Multan Road, Lahore');
    setDesignation('Dispenser Operator');
    setJoiningDate(new Date().toISOString().slice(0, 10));
    setMonthlySalary(30000);
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (w: Worker) => {
    setEditingWorker(w);
    setName(w.name);
    setFatherName(w.fatherName);
    setPhoneNumber(w.phoneNumber);
    setCnic(w.cnic);
    setAddress(w.address);
    setDesignation(w.designation);
    setJoiningDate(w.joiningDate);
    setMonthlySalary(w.monthlySalary);
    setStatus(w.status);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker) {
      updateWorker({
        ...editingWorker,
        name,
        fatherName,
        phoneNumber,
        cnic,
        address,
        designation,
        joiningDate,
        monthlySalary,
        status,
      });
    } else {
      addWorker({
        name,
        fatherName,
        phoneNumber,
        cnic,
        address,
        designation,
        joiningDate,
        monthlySalary,
        status,
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      });
    }
    setIsModalOpen(false);
  };

  const filtered = workers.filter(
    w =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.cnic.includes(searchQuery) ||
      w.phoneNumber.includes(searchQuery) ||
      w.designation.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h2 className="text-xl font-black text-slate-900">Workers & Employee Records</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain complete staff records, Pakistani CNIC IDs, contact details, and designations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
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
            placeholder="Search by worker name, CNIC, phone number, or designation..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Worker Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(worker => (
          <div
            key={worker.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      worker.photoUrl ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={worker.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-200 shadow-sm"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{worker.name}</h3>
                    <p className="text-xs text-slate-500">S/O {worker.fatherName}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                      {worker.designation}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    worker.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {worker.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 my-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{worker.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-mono text-[11px]">{worker.cnic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{worker.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Monthly Salary</p>
                <p className="text-sm font-black text-blue-900">{formatCurrency(worker.monthlySalary)}</p>
              </div>

              <div className="flex items-center gap-1.5">
                {canEdit && (
                  <button
                    onClick={() => openEditModal(worker)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 transition-all"
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
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-blue-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-red-400" />
                <h3 className="font-extrabold text-base">
                  {editingWorker ? 'Edit Worker Profile' : 'Add New Worker Record'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Worker Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Muhammad Hamza"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Father Name</label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={e => setFatherName(e.target.value)}
                    required
                    placeholder="Muhammad Sharif"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    required
                    placeholder="0300-1234567"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CNIC Number</label>
                  <input
                    type="text"
                    value={cnic}
                    onChange={e => setCnic(e.target.value)}
                    required
                    placeholder="35201-1234567-1"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    required
                    placeholder="Dispenser Operator"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Monthly Salary (Rs)</label>
                  <input
                    type="number"
                    value={monthlySalary}
                    onChange={e => setMonthlySalary(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Home Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  placeholder="Street 4, Multan Road, Lahore"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold shadow-md"
                >
                  Save Worker Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={workerToDelete !== null}
        title="Permanently Delete Worker Profile"
        message="Are you sure you want to permanently delete this worker profile? Associated salary and attendance records will also be cleaned up."
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
