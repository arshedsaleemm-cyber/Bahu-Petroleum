import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { formatDate } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { PDFExportButton } from '../common/PDFExportButton';
import { CalendarCheck, Check, X, Clock, AlertCircle, Calendar } from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { workers, attendance, markAttendance } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const activeWorkers = workers.filter(w => w.status === 'Active');

  const getWorkerStatusForDate = (workerId: string): AttendanceStatus => {
    const rec = attendance.find(a => a.workerId === workerId && a.date === selectedDate);
    return rec ? rec.status : 'Present';
  };

  const handleStatusChange = (workerId: string, status: AttendanceStatus) => {
    markAttendance(workerId, status, selectedDate);
  };

  // Stats for selected date
  const presentCount = activeWorkers.filter(w => getWorkerStatusForDate(w.id) === 'Present').length;
  const absentCount = activeWorkers.filter(w => getWorkerStatusForDate(w.id) === 'Absent').length;
  const leaveCount = activeWorkers.filter(w => getWorkerStatusForDate(w.id) === 'Leave').length;
  const halfDayCount = activeWorkers.filter(w => getWorkerStatusForDate(w.id) === 'Half Day').length;

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Daily Worker Attendance Matrix</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mark staff daily attendance status (Present, Absent, Leave, Half Day).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-emerald-700 uppercase">Present</p>
          <p className="font-black text-emerald-900 text-xl mt-0.5">{presentCount}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-rose-700 uppercase">Absent</p>
          <p className="font-black text-rose-900 text-xl mt-0.5">{absentCount}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-amber-700 uppercase">On Leave</p>
          <p className="font-black text-amber-900 text-xl mt-0.5">{leaveCount}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-center">
          <p className="text-[10px] font-bold text-blue-700 uppercase">Half Day</p>
          <p className="font-black text-blue-900 text-xl mt-0.5">{halfDayCount}</p>
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Attendance Matrix for {formatDate(selectedDate)}
          </h3>
          <span className="text-xs font-semibold text-slate-500">{activeWorkers.length} Active Staff</span>
        </div>

        <div className="divide-y divide-slate-100">
          {activeWorkers.map(w => {
            const currentStatus = getWorkerStatusForDate(w.id);
            return (
              <div key={w.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      w.photoUrl ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={w.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{w.name}</p>
                    <p className="text-xs text-slate-500">{w.designation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  {(['Present', 'Absent', 'Leave', 'Half Day'] as AttendanceStatus[]).map(st => {
                    const isSelected = currentStatus === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(w.id, st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? st === 'Present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : st === 'Absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : st === 'Leave'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
