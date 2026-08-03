import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { PDFExportButton } from '../common/PDFExportButton';
import { AdminDeleteButton } from '../common/AdminDeleteButton';
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  History,
  UserCheck,
  Filter,
  Trash2,
  Check,
  AlertCircle,
  CalendarDays,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { workers, attendance, bulkSaveAttendance, markAttendance, deleteAttendance, canEdit, canDelete, isAdmin } = useApp();

  // Active module view: 'mark' | 'history'
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');

  // Mark Attendance State
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local draft selection map: workerId -> AttendanceStatus | undefined
  // Nothing is automatically marked. If a record exists in database for this date, prefill from DB; otherwise undefined.
  const [draftStatus, setDraftStatus] = useState<Record<string, AttendanceStatus | undefined>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Filter active workers (all newly added workers default to Active)
  const activeWorkers = useMemo(() => {
    return workers.filter(w => w.status !== 'Inactive');
  }, [workers]);

  // Load saved attendance for selectedDate into draftStatus whenever selectedDate or attendance changes
  useEffect(() => {
    const newDraft: Record<string, AttendanceStatus | undefined> = {};
    activeWorkers.forEach(w => {
      const existingRecord = attendance.find(a => a.workerId === w.id && a.date === selectedDate);
      newDraft[w.id] = existingRecord ? existingRecord.status : undefined;
    });
    setDraftStatus(newDraft);
    setSaveSuccessMsg(null);
  }, [selectedDate, attendance, activeWorkers]);

  // Filter workers by search query
  const filteredActiveWorkers = useMemo(() => {
    return activeWorkers.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeWorkers, searchQuery]);

  // Handle setting a worker's status choice in draft state
  const handleSelectStatus = (workerId: string, status: AttendanceStatus) => {
    if (!canEdit) return;
    setDraftStatus(prev => ({
      ...prev,
      [workerId]: status,
    }));
    setSaveSuccessMsg(null);
  };

  // Save Attendance handler
  const handleSaveAttendance = () => {
    if (!canEdit) return;

    const recordsToSave: { workerId: string; status: AttendanceStatus; date: string }[] = [];
    
    // Collect all workers that have a draft status selected
    activeWorkers.forEach(w => {
      const status = draftStatus[w.id];
      if (status) {
        recordsToSave.push({
          workerId: w.id,
          status,
          date: selectedDate,
        });
      }
    });

    if (recordsToSave.length === 0) {
      alert('Please select attendance (Present, Absent, or Leave) for at least one worker before saving.');
      return;
    }

    bulkSaveAttendance(recordsToSave);
    setSaveSuccessMsg(`Attendance for ${formatDate(selectedDate)} saved successfully!`);
  };

  // HISTORY TAB STATE & COMPUTATIONS
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const [historyWorkerId, setHistoryWorkerId] = useState<string>('ALL');
  const [historyMonth, setHistoryMonth] = useState<number | 'ALL'>('ALL');
  const [historyYear, setHistoryYear] = useState<number>(currentYear);

  const filteredHistory = useMemo(() => {
    return attendance.filter(record => {
      // Filter by Worker
      if (historyWorkerId !== 'ALL' && record.workerId !== historyWorkerId) {
        return false;
      }
      // Filter by Date (Year and Month)
      const recDate = new Date(record.date);
      const recYear = recDate.getFullYear();
      const recMonth = recDate.getMonth() + 1;

      if (recYear !== historyYear) {
        return false;
      }
      if (historyMonth !== 'ALL' && recMonth !== historyMonth) {
        return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, historyWorkerId, historyMonth, historyYear]);

  // History Metrics
  const historyPresentCount = filteredHistory.filter(r => r.status === 'Present').length;
  const historyAbsentCount = filteredHistory.filter(r => r.status === 'Absent').length;
  const historyLeaveCount = filteredHistory.filter(r => r.status === 'Leave').length;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Count how many marked in current draft
  const markedDraftCount = Object.values(draftStatus).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Main Header & View Mode Selector */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-900 text-white rounded-2xl shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Attendance Module</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manual worker attendance system. Mark status and press "Save Attendance" to store records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('mark')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'mark'
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" /> Mark Attendance
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" /> Attendance History
            </button>
          </div>

          <PDFExportButton moduleKey="ATTENDANCE" buttonLabel="Export PDF" variant="secondary" />
        </div>
      </div>

      {/* SUCCESS NOTIFICATION BANNER */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl text-emerald-900 text-xs font-extrabold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SCREEN 1: MARK ATTENDANCE (CLEAN MANUAL WORKFLOW) */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Top Section: Date Selector & Search Worker */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Select Date */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" /> Select Attendance Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 text-sm font-black text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-slate-50 cursor-pointer"
              />
            </div>

            {/* Search Worker */}
            <div className="space-y-1">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-600" /> Search Worker:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Type worker name to filter..."
                  className="w-full pl-10 pr-4 p-3 rounded-2xl border border-slate-300 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Action Header & Save Button Bar */}
          <div className="bg-blue-950 text-white p-4 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold text-blue-300 uppercase tracking-wider">
                Date: {formatDate(selectedDate)}
              </p>
              <h3 className="text-base font-black text-white mt-0.5">
                {markedDraftCount} of {activeWorkers.length} Active Workers Marked
              </h3>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={!canEdit}
              className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                canEdit
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-5 h-5" /> Save Attendance
            </button>
          </div>

          {/* Worker Cards List */}
          {filteredActiveWorkers.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-base font-black text-slate-800">No active workers found</p>
              <p className="text-xs text-slate-400 mt-1">
                Add worker profiles from the Worker Management module first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActiveWorkers.map(worker => {
                const currentChoice = draftStatus[worker.id];

                return (
                  <div
                    key={worker.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
                  >
                    {/* Worker Info: ONLY Worker Full Name and Monthly Salary */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 font-black flex items-center justify-center text-lg border border-blue-200 shrink-0">
                          {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">{worker.name}</h3>
                          <p className="text-xs font-bold text-slate-500 mt-0.5">
                            Monthly Salary: {formatCurrency(worker.monthlySalary || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Status Indicator Tag */}
                      <div>
                        {currentChoice === 'Present' && (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Present
                          </span>
                        )}
                        {currentChoice === 'Absent' && (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Absent
                          </span>
                        )}
                        {currentChoice === 'Leave' && (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Leave
                          </span>
                        )}
                        {!currentChoice && (
                          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-400 border border-slate-200">
                            Unselected
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Manual Actions: 3 Large Touch Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Present Button */}
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => handleSelectStatus(worker.id, 'Present')}
                        className={`py-3 px-2 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border-2 ${
                          currentChoice === 'Present'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.02]'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <Check className="w-4 h-4" /> Present
                      </button>

                      {/* Absent Button */}
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => handleSelectStatus(worker.id, 'Absent')}
                        className={`py-3 px-2 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border-2 ${
                          currentChoice === 'Absent'
                            ? 'bg-rose-600 text-white border-rose-700 shadow-md scale-[1.02]'
                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <XCircle className="w-4 h-4" /> Absent
                      </button>

                      {/* Leave Button */}
                      <button
                        type="button"
                        disabled={!canEdit}
                        onClick={() => handleSelectStatus(worker.id, 'Leave')}
                        className={`py-3 px-2 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer border-2 ${
                          currentChoice === 'Leave'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <Clock className="w-4 h-4" /> Leave
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Save Attendance Button Bar */}
          {filteredActiveWorkers.length > 0 && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveAttendance}
                disabled={!canEdit}
                className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                  canEdit
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                    : 'bg-slate-400 text-slate-100 cursor-not-allowed'
                }`}
              >
                <Save className="w-5 h-5" /> Save Attendance for {formatDate(selectedDate)}
              </button>
            </div>
          )}
        </div>
      )}

      {/* SCREEN 2: ATTENDANCE HISTORY & REPORTS */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Filter by Worker */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Filter by Worker
              </label>
              <select
                value={historyWorkerId}
                onChange={e => setHistoryWorkerId(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="ALL">All Workers</option>
                {activeWorkers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Month */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Filter by Month
              </label>
              <select
                value={historyMonth}
                onChange={e => setHistoryMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 outline-none focus:border-blue-600 cursor-pointer"
              >
                <option value="ALL">All Months</option>
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Year */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Filter by Year
              </label>
              <select
                value={historyYear}
                onChange={e => setHistoryYear(Number(e.target.value))}
                className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 outline-none focus:border-blue-600 cursor-pointer"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl text-center shadow-sm">
              <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Total Present Days</p>
              <p className="font-black text-emerald-950 text-3xl mt-1">{historyPresentCount}</p>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl text-center shadow-sm">
              <p className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">Total Absent Days</p>
              <p className="font-black text-rose-950 text-3xl mt-1">{historyAbsentCount}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl text-center shadow-sm">
              <p className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">Total Leave Days</p>
              <p className="font-black text-amber-950 text-3xl mt-1">{historyLeaveCount}</p>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Attendance Logs</h3>
              </div>
              <span className="text-xs font-extrabold text-slate-500">
                {filteredHistory.length} Record(s) Found
              </span>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs font-bold">
                No attendance records match the selected filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Date</th>
                      <th className="p-3.5">Worker Name</th>
                      <th className="p-3.5">Monthly Salary</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredHistory.map(record => {
                      const worker = workers.find(w => w.id === record.workerId);

                      return (
                        <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">{formatDate(record.date)}</td>
                          <td className="p-3.5 font-extrabold text-slate-900">{worker?.name || 'Unknown Worker'}</td>
                          <td className="p-3.5 text-slate-600">{formatCurrency(worker?.monthlySalary || 0)}</td>
                          <td className="p-3.5 text-center">
                            {record.status === 'Present' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
                                Present
                              </span>
                            )}
                            {record.status === 'Absent' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200 inline-block">
                                Absent
                              </span>
                            )}
                            {record.status === 'Leave' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200 inline-block">
                                Leave
                              </span>
                            )}
                            {record.status === 'Half Day' && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200 inline-block">
                                Half Day
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Quick edit status */}
                              {canEdit && (
                                <select
                                  value={record.status}
                                  onChange={e =>
                                    markAttendance(record.workerId, e.target.value as AttendanceStatus, record.date)
                                  }
                                  className="px-2 py-1 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-800 bg-white outline-none cursor-pointer"
                                >
                                  <option value="Present">Present</option>
                                  <option value="Absent">Absent</option>
                                  <option value="Leave">Leave</option>
                                </select>
                              )}

                              {/* Admin Delete Record */}
                              {canDelete && (
                                <AdminDeleteButton
                                  onDelete={() => deleteAttendance(record.id)}
                                  itemName={`Attendance record for ${worker?.name || 'Worker'} on ${formatDate(record.date)}`}
                                  variant="icon"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
