import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { formatDate } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { PDFExportButton } from '../common/PDFExportButton';
import { AdminDeleteButton } from '../common/AdminDeleteButton';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  CalendarDays,
  UserCheck,
  CheckCheck,
  FileSpreadsheet,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { workers, attendance, markAttendance, deleteAttendance, canEdit, canDelete, isAdmin } = useApp();

  // Active view tab: 'daily' | 'monthly' | 'yearly'
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  // Daily view state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Monthly report state
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed
  const [reportMonth, setReportMonth] = useState<number>(currentMonth);
  const [reportYear, setReportYear] = useState<number>(currentYear);

  // Yearly report state
  const [yearlyReportYear, setYearlyReportYear] = useState<number>(currentYear);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Automatically load all active workers (defaulting status to Active)
  const activeWorkers = useMemo(() => {
    return workers.filter(w => w.status !== 'Inactive');
  }, [workers]);

  const filteredWorkers = useMemo(() => {
    return activeWorkers.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeWorkers, searchQuery]);

  // Helper: get worker status for a specific date
  const getWorkerStatusForDate = (workerId: string, dateStr: string): AttendanceStatus => {
    const rec = attendance.find(a => a.workerId === workerId && a.date === dateStr);
    return rec ? rec.status : 'Present';
  };

  const handleStatusChange = (workerId: string, status: AttendanceStatus) => {
    if (!canEdit) return;
    markAttendance(workerId, status, selectedDate);
  };

  // Quick action: Mark all active workers Present for selected date
  const handleMarkAllPresent = () => {
    if (!canEdit) return;
    activeWorkers.forEach(w => {
      markAttendance(w.id, 'Present', selectedDate);
    });
  };

  // Daily stats for selected date
  const dailyPresentCount = activeWorkers.filter(w => getWorkerStatusForDate(w.id, selectedDate) === 'Present').length;
  const dailyAbsentCount = activeWorkers.filter(w => getWorkerStatusForDate(w.id, selectedDate) === 'Absent').length;
  const dailyLeaveCount = activeWorkers.filter(w => getWorkerStatusForDate(w.id, selectedDate) === 'Leave').length;
  const dailyHalfDayCount = activeWorkers.filter(w => getWorkerStatusForDate(w.id, selectedDate) === 'Half Day').length;

  // MONTHLY REPORT COMPUTATIONS
  const monthlyData = useMemo(() => {
    const monthStr = reportMonth < 10 ? `0${reportMonth}` : `${reportMonth}`;
    const prefix = `${reportYear}-${monthStr}`;

    // Attendance records for the selected month
    const monthRecords = attendance.filter(a => a.date.startsWith(prefix));

    // Calculate worker level stats
    const workerStats = activeWorkers.map(w => {
      const wRecs = monthRecords.filter(a => a.workerId === w.id);
      const present = wRecs.filter(a => a.status === 'Present').length;
      const absent = wRecs.filter(a => a.status === 'Absent').length;
      const leave = wRecs.filter(a => a.status === 'Leave').length;
      const halfDay = wRecs.filter(a => a.status === 'Half Day').length;
      const totalMarked = wRecs.length;
      const rate = totalMarked > 0 ? Math.round(((present + halfDay * 0.5) / totalMarked) * 100) : 100;

      return {
        worker: w,
        present,
        absent,
        leave,
        halfDay,
        totalMarked,
        rate,
      };
    });

    const totalMonthPresent = workerStats.reduce((sum, s) => sum + s.present, 0);
    const totalMonthAbsent = workerStats.reduce((sum, s) => sum + s.absent, 0);
    const totalMonthLeave = workerStats.reduce((sum, s) => sum + s.leave, 0);
    const totalMonthHalfDay = workerStats.reduce((sum, s) => sum + s.halfDay, 0);

    return {
      workerStats,
      totalMonthPresent,
      totalMonthAbsent,
      totalMonthLeave,
      totalMonthHalfDay,
      monthRecordsCount: monthRecords.length,
    };
  }, [attendance, activeWorkers, reportMonth, reportYear]);

  // YEARLY REPORT COMPUTATIONS
  const yearlyData = useMemo(() => {
    const yearStr = `${yearlyReportYear}`;
    const yearRecords = attendance.filter(a => a.date.startsWith(yearStr));

    const workerStats = activeWorkers.map(w => {
      const wRecs = yearRecords.filter(a => a.workerId === w.id);
      const present = wRecs.filter(a => a.status === 'Present').length;
      const absent = wRecs.filter(a => a.status === 'Absent').length;
      const leave = wRecs.filter(a => a.status === 'Leave').length;
      const halfDay = wRecs.filter(a => a.status === 'Half Day').length;
      const totalMarked = wRecs.length;
      const rate = totalMarked > 0 ? Math.round(((present + halfDay * 0.5) / totalMarked) * 100) : 100;

      return {
        worker: w,
        present,
        absent,
        leave,
        halfDay,
        totalMarked,
        rate,
      };
    });

    const totalYearPresent = workerStats.reduce((sum, s) => sum + s.present, 0);
    const totalYearAbsent = workerStats.reduce((sum, s) => sum + s.absent, 0);
    const totalYearLeave = workerStats.reduce((sum, s) => sum + s.leave, 0);
    const totalYearHalfDay = workerStats.reduce((sum, s) => sum + s.halfDay, 0);

    return {
      workerStats,
      totalYearPresent,
      totalYearAbsent,
      totalYearLeave,
      totalYearHalfDay,
      yearRecordsCount: yearRecords.length,
    };
  }, [attendance, activeWorkers, yearlyReportYear]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Worker Attendance Management</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 ml-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Auto-Synced
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every newly added worker automatically appears here as an Active Worker. Mark attendance for any selected date and view monthly/yearly attendance reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Navigation Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'daily'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Daily Matrix
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'monthly'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Monthly Report
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'yearly'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Yearly Report
            </button>
          </div>

          <PDFExportButton moduleKey="ATTENDANCE" buttonLabel="Export PDF" variant="secondary" />
        </div>
      </div>

      {/* VIEW 1: DAILY ATTENDANCE MATRIX */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Top Date Selection & Quick Actions Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5 shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" /> Attendance Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-black text-slate-900 outline-none focus:border-blue-600 bg-slate-50 cursor-pointer"
              />
              <span className="text-xs font-extrabold text-slate-600 hidden md:inline">
                ({formatDate(selectedDate)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={handleMarkAllPresent}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Mark all active staff Present for selected date"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-600" /> Mark All Present
                </button>
              )}
            </div>
          </div>

          {/* Daily Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center shadow-sm">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Present</p>
              <p className="font-black text-emerald-950 text-2xl mt-0.5">{dailyPresentCount}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-center shadow-sm">
              <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Absent</p>
              <p className="font-black text-rose-950 text-2xl mt-0.5">{dailyAbsentCount}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-center shadow-sm">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">On Leave</p>
              <p className="font-black text-amber-950 text-2xl mt-0.5">{dailyLeaveCount}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl text-center shadow-sm">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Half Day</p>
              <p className="font-black text-blue-950 text-2xl mt-0.5">{dailyHalfDayCount}</p>
            </div>
          </div>

          {/* Attendance Sheet Card Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Attendance Roster for {formatDate(selectedDate)}
                </h3>
              </div>
              <span className="text-xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                {activeWorkers.length} Active Staff Loaded
              </span>
            </div>

            {activeWorkers.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                No active workers registered in the system. Add workers from Worker Management to record attendance.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeWorkers.map(w => {
                  const attRecord = attendance.find(a => a.workerId === w.id && a.date === selectedDate);
                  const currentStatus = attRecord ? attRecord.status : 'Present';

                  return (
                    <div
                      key={w.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 font-extrabold flex items-center justify-center text-sm border border-blue-200 shrink-0">
                          {w.name ? w.name.charAt(0).toUpperCase() : 'W'}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{w.name}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            Monthly Salary: PKR {(w.monthlySalary || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5">
                          {(['Present', 'Absent', 'Leave', 'Half Day'] as AttendanceStatus[]).map(st => {
                            const isSelected = currentStatus === st;
                            return (
                              <button
                                key={st}
                                disabled={!canEdit}
                                onClick={() => handleStatusChange(w.id, st)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? st === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : st === 'Absent'
                                      ? 'bg-rose-600 text-white shadow-sm'
                                      : st === 'Leave'
                                      ? 'bg-amber-600 text-white shadow-sm'
                                      : 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                } ${!canEdit ? 'opacity-60 cursor-not-allowed' : ''}`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>

                        {attRecord && canDelete && (
                          <AdminDeleteButton
                            onDelete={() => deleteAttendance(attRecord.id)}
                            itemName={`Attendance for ${w.name} (${formatDate(selectedDate)})`}
                            variant="icon"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: MONTHLY ATTENDANCE REPORT */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {/* Month & Year Controls */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Select Month:</label>
                <select
                  value={reportMonth}
                  onChange={e => setReportMonth(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 bg-slate-50 cursor-pointer"
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 uppercase">Select Year:</label>
                <select
                  value={reportYear}
                  onChange={e => setReportYear(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 bg-slate-50 cursor-pointer"
                >
                  {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs font-extrabold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
              Monthly Report for {monthNames[reportMonth - 1]} {reportYear}
            </div>
          </div>

          {/* Monthly Totals Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Total Present Days</p>
              <p className="font-black text-emerald-950 text-2xl mt-1">{monthlyData.totalMonthPresent}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Total Absent Days</p>
              <p className="font-black text-rose-950 text-2xl mt-1">{monthlyData.totalMonthAbsent}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Total Leave Days</p>
              <p className="font-black text-amber-950 text-2xl mt-1">{monthlyData.totalMonthLeave}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Total Half Days</p>
              <p className="font-black text-blue-950 text-2xl mt-1">{monthlyData.totalMonthHalfDay}</p>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Worker Monthly Summary ({monthNames[reportMonth - 1]} {reportYear})
              </h3>
              <span className="text-xs text-slate-500 font-semibold">{activeWorkers.length} Active Workers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Worker Name</th>
                    <th className="p-3.5 text-center">Present Days</th>
                    <th className="p-3.5 text-center">Absent Days</th>
                    <th className="p-3.5 text-center">Leave Days</th>
                    <th className="p-3.5 text-center">Half Days</th>
                    <th className="p-3.5 text-right">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {monthlyData.workerStats.map(s => (
                    <tr key={s.worker.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{s.worker.name}</td>
                      <td className="p-3.5 text-center text-emerald-700 font-black">{s.present}</td>
                      <td className="p-3.5 text-center text-rose-700 font-black">{s.absent}</td>
                      <td className="p-3.5 text-center text-amber-700 font-black">{s.leave}</td>
                      <td className="p-3.5 text-center text-blue-700 font-black">{s.halfDay}</td>
                      <td className="p-3.5 text-right font-black">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            s.rate >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.rate >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: YEARLY ATTENDANCE REPORT */}
      {activeTab === 'yearly' && (
        <div className="space-y-4">
          {/* Year Selector */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase">Select Report Year:</label>
              <select
                value={yearlyReportYear}
                onChange={e => setYearlyReportYear(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-blue-600 bg-slate-50 cursor-pointer"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs font-extrabold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
              Yearly Attendance Summary ({yearlyReportYear})
            </div>
          </div>

          {/* Yearly Totals Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Total Present (Year)</p>
              <p className="font-black text-emerald-950 text-2xl mt-1">{yearlyData.totalYearPresent}</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Total Absent (Year)</p>
              <p className="font-black text-rose-950 text-2xl mt-1">{yearlyData.totalYearAbsent}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Total Leave (Year)</p>
              <p className="font-black text-amber-950 text-2xl mt-1">{yearlyData.totalYearLeave}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Total Half Days (Year)</p>
              <p className="font-black text-blue-950 text-2xl mt-1">{yearlyData.totalYearHalfDay}</p>
            </div>
          </div>

          {/* Yearly Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Worker Yearly Summary ({yearlyReportYear})
              </h3>
              <span className="text-xs text-slate-500 font-semibold">{activeWorkers.length} Active Workers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Worker Name</th>
                    <th className="p-3.5 text-center">Total Present</th>
                    <th className="p-3.5 text-center">Total Absent</th>
                    <th className="p-3.5 text-center">Total Leave</th>
                    <th className="p-3.5 text-center">Total Half Days</th>
                    <th className="p-3.5 text-right">Yearly Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {yearlyData.workerStats.map(s => (
                    <tr key={s.worker.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">{s.worker.name}</td>
                      <td className="p-3.5 text-center text-emerald-700 font-black">{s.present}</td>
                      <td className="p-3.5 text-center text-rose-700 font-black">{s.absent}</td>
                      <td className="p-3.5 text-center text-amber-700 font-black">{s.leave}</td>
                      <td className="p-3.5 text-center text-blue-700 font-black">{s.halfDay}</td>
                      <td className="p-3.5 text-right font-black">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            s.rate >= 80
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.rate >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {s.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
