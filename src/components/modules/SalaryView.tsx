import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SalaryRecord, Worker } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { Banknote, Plus, History, DollarSign, X, CheckCircle } from 'lucide-react';

export const SalaryView: React.FC = () => {
  const { workers, salaries, addSalaryAdvance, paySalary } = useApp();

  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(workers[0]?.id || '');

  const [advanceAmount, setAdvanceAmount] = useState<number>(3000);
  const [advanceNotes, setAdvanceNotes] = useState('Personal / Medical advance');
  const [payAmount, setPayAmount] = useState<number>(10000);

  const handleAddAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkerId && advanceAmount > 0) {
      addSalaryAdvance(selectedWorkerId, advanceAmount, advanceNotes);
    }
    setIsAdvanceModalOpen(false);
  };

  const handlePaySalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkerId && payAmount > 0) {
      paySalary(selectedWorkerId, payAmount);
    }
    setIsPayModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Banknote className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Salary & Advance Ledger</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated salary calculations: Monthly Salary - Total Advances - Paid = Remaining Salary.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAdvanceModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Issue Salary Advance
          </button>
          <button
            onClick={() => setIsPayModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all"
          >
            <DollarSign className="w-4 h-4" /> Pay Monthly Salary
          </button>
        </div>
      </div>

      {/* Salary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workers.map(w => {
          const sal = salaries.find(s => s.workerId === w.id);
          const monthlySal = sal?.monthlySalary || w.monthlySalary;
          const totalAdv = sal?.totalAdvance || 0;
          const paid = sal?.salaryPaid || 0;
          const remaining = sal?.remainingSalary ?? (monthlySal - totalAdv - paid);

          return (
            <div key={w.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      w.photoUrl ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={w.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-200"
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{w.name}</h3>
                    <p className="text-xs text-slate-500">{w.designation}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Monthly Base</p>
                  <p className="text-sm font-black text-slate-900">{formatCurrency(monthlySal)}</p>
                </div>
              </div>

              {/* Automatic Math Breakdown Bar */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-amber-600 uppercase">Total Advance</p>
                  <p className="font-extrabold text-amber-800 mt-0.5">{formatCurrency(totalAdv)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Salary Paid</p>
                  <p className="font-extrabold text-emerald-800 mt-0.5">{formatCurrency(paid)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-600 uppercase">Remaining Payable</p>
                  <p className="font-extrabold text-blue-900 mt-0.5">{formatCurrency(remaining)}</p>
                </div>
              </div>

              {/* Advance History Log if any */}
              {sal && sal.advanceHistory && sal.advanceHistory.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Advance Log History</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                    {sal.advanceHistory.map(adv => (
                      <div
                        key={adv.id}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-50/80 border border-amber-100 text-amber-950"
                      >
                        <div>
                          <span className="font-bold">{formatCurrency(adv.amount)}</span>
                          <span className="text-[11px] text-amber-700 ml-2">({adv.notes || 'Advance'})</span>
                        </div>
                        <span className="text-[10px] text-amber-600 font-medium">{formatDate(adv.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Advance Modal */}
      {isAdvanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-amber-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">Issue Salary Advance</h3>
              <button onClick={() => setIsAdvanceModalOpen(false)} className="p-1 rounded bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdvance} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Worker</label>
                <select
                  value={selectedWorkerId}
                  onChange={e => setSelectedWorkerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                >
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Advance Amount (Rs)</label>
                <input
                  type="number"
                  value={advanceAmount}
                  onChange={e => setAdvanceAmount(Number(e.target.value))}
                  required
                  min={100}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={advanceNotes}
                  onChange={e => setAdvanceNotes(e.target.value)}
                  placeholder="Medical, family need, etc."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md"
              >
                Deduct & Record Advance
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Pay Salary Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">Pay Salary Disbursement</h3>
              <button onClick={() => setIsPayModalOpen(false)} className="p-1 rounded bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaySalary} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Worker</label>
                <select
                  value={selectedWorkerId}
                  onChange={e => setSelectedWorkerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                >
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Amount (Rs)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  required
                  min={100}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                Disburse Salary Payment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
