import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DailySalesEntry, DailySalesSection } from '../../types';
import { PermissionNotice } from './PermissionNotice';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { PDFExportButton } from './PDFExportButton';
import {
  DollarSign,
  Plus,
  Search,
  Calendar,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  X,
  FileText,
  Clock,
  TrendingUp,
  BarChart3,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';

interface SingleSectionDailySalesViewProps {
  sectionKey: DailySalesSection;
  title: string;
  subtitle: string;
  amountLabel: string;
  icon: React.FC<{ className?: string }>;
  badgeColorBg?: string;
  badgeColorText?: string;
}

export const SingleSectionDailySalesView: React.FC<SingleSectionDailySalesViewProps> = ({
  sectionKey,
  title,
  subtitle,
  amountLabel,
  icon: IconComponent,
  badgeColorBg = 'bg-blue-100',
  badgeColorText = 'text-blue-900',
}) => {
  const {
    dailySalesEntries,
    addDailySalesEntry,
    updateDailySalesEntry,
    deleteDailySalesEntry,
    isAdmin,
  } = useApp();

  // Filters & Search
  const [dateSearch, setDateSearch] = useState<string>('');
  const [timePeriod, setTimePeriod] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<DailySalesEntry | null>(null);

  // Form State
  const todayStr = new Date().toISOString().slice(0, 10);
  const [formDate, setFormDate] = useState<string>(todayStr);
  const [formSales, setFormSales] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Date Calculations
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);

  const getWeekRange = () => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(d.setDate(diff)).toISOString().slice(0, 10);
  };

  const startOfWeek = getWeekRange();
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const startOfYear = `${now.getFullYear()}-01-01`;

  // Module Specific Entries
  const moduleEntries = useMemo(() => {
    return (dailySalesEntries || []).filter(e => e.section === sectionKey);
  }, [dailySalesEntries, sectionKey]);

  // Totals for today, week, month, year
  const todayTotal = useMemo(() => {
    return moduleEntries
      .filter(e => e.date === todayIso)
      .reduce((acc, curr) => acc + (curr.totalSales || 0), 0);
  }, [moduleEntries, todayIso]);

  const weekTotal = useMemo(() => {
    return moduleEntries
      .filter(e => e.date >= startOfWeek)
      .reduce((acc, curr) => acc + (curr.totalSales || 0), 0);
  }, [moduleEntries, startOfWeek]);

  const monthTotal = useMemo(() => {
    return moduleEntries
      .filter(e => e.date >= startOfMonth)
      .reduce((acc, curr) => acc + (curr.totalSales || 0), 0);
  }, [moduleEntries, startOfMonth]);

  const yearTotal = useMemo(() => {
    return moduleEntries
      .filter(e => e.date >= startOfYear)
      .reduce((acc, curr) => acc + (curr.totalSales || 0), 0);
  }, [moduleEntries, startOfYear]);

  // Filtered Entries based on search & time period
  const filteredEntries = useMemo(() => {
    return moduleEntries
      .filter(entry => {
        // Date Search
        if (dateSearch && !entry.date.includes(dateSearch)) {
          return false;
        }
        // Time Period Filter
        if (timePeriod === 'TODAY' && entry.date !== todayIso) {
          return false;
        }
        if (timePeriod === 'WEEK' && entry.date < startOfWeek) {
          return false;
        }
        if (timePeriod === 'MONTH' && entry.date < startOfMonth) {
          return false;
        }
        if (timePeriod === 'YEAR' && entry.date < startOfYear) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [moduleEntries, dateSearch, timePeriod, todayIso, startOfWeek, startOfMonth, startOfYear]);

  const filteredTotalAmount = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => acc + (curr.totalSales || 0), 0);
  }, [filteredEntries]);

  // Handle Modal Open
  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setFormDate(todayStr);
    setFormSales('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (entry: DailySalesEntry) => {
    setEditingEntry(entry);
    setFormDate(entry.date);
    setFormSales(String(entry.totalSales));
    setFormNotes(entry.notes || '');
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const salesNum = parseFloat(formSales);
    if (isNaN(salesNum) || salesNum < 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (editingEntry) {
      updateDailySalesEntry(editingEntry.id, {
        date: formDate,
        section: sectionKey,
        totalSales: salesNum,
        notes: formNotes.trim() || undefined,
      });
      setSuccessMsg(`Updated daily entry for ${sectionKey} on ${formDate}!`);
    } else {
      addDailySalesEntry({
        date: formDate,
        section: sectionKey,
        totalSales: salesNum,
        notes: formNotes.trim() || undefined,
      });
      setSuccessMsg(`Recorded Rs. ${salesNum.toLocaleString()} for ${sectionKey} on ${formDate}!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Export PDF Report
  const handleExportPDF = () => {
    const headers = ['Date', 'Module', amountLabel, 'Recorded By', 'Notes'];
    const rows = filteredEntries.map(e => [
      e.date,
      e.section,
      `Rs. ${e.totalSales.toLocaleString()}`,
      e.createdBy || 'Admin',
      e.notes || '-',
    ]);

    exportToPDF(
      `${title} - Summary Report`,
      headers,
      rows,
      `${sectionKey.toLowerCase().replace(/\s+/g, '_')}_daily_report_${new Date().toISOString().slice(0, 10)}`
    );
  };

  const handleExportExcel = () => {
    const data = filteredEntries.map(e => ({
      Date: e.date,
      Section: e.section,
      Amount_PKR: e.totalSales,
      RecordedBy: e.createdBy || 'Admin',
      Notes: e.notes || '',
    }));
    exportToExcel(data, `${sectionKey.toLowerCase().replace(/\s+/g, '_')}_sales`);
  };

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-900 text-amber-400 rounded-2xl shadow-sm">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{title}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${badgeColorBg} ${badgeColorText}`}>
                Daily Total Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportExcel}
            className="px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Export Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Daily Sales Entry
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Analytics Summary Cards (Today, Week, Month, Year) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Today's Total</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-2">
            Rs. {todayTotal.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Date: {todayIso}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>This Week</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-2">
            Rs. {weekTotal.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">From Monday</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>This Month</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-2">
            Rs. {monthTotal.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Current Month</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>This Year</span>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900 mt-2">
            Rs. {yearTotal.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Calendar Year</p>
        </div>
      </div>

      {/* Filter and Date Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by date (YYYY-MM-DD)..."
            value={dateSearch}
            onChange={e => setDateSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-blue-900"
          />
          {dateSearch && (
            <button
              onClick={() => setDateSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Time Period Filter */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 max-w-full overflow-x-auto">
          {(['ALL', 'TODAY', 'WEEK', 'MONTH', 'YEAR'] as const).map(tp => (
            <button
              key={tp}
              onClick={() => setTimePeriod(tp)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all whitespace-nowrap ${
                timePeriod === tp
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              {title} Records ({filteredEntries.length})
            </h3>
          </div>
          <span className="text-xs font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Total Amount: Rs. {filteredTotalAmount.toLocaleString()}
          </span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">No daily entries found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click "Add Daily Sales Entry" to record total daily amount for {sectionKey}.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-blue-900 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Daily Sales Entry
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-black">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">{amountLabel}</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4">Recorded By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredEntries.map(entry => {
                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="py-3.5 px-4 font-black text-blue-900 text-sm whitespace-nowrap">
                        Rs. {entry.totalSales.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {entry.notes || <span className="text-slate-300 italic">No notes</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {entry.createdBy || 'Admin'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(entry)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                            title="Edit Entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (isAdmin) {
                                if (window.confirm(`Delete daily entry for ${entry.section} on ${entry.date}?`)) {
                                  deleteDailySalesEntry(entry.id);
                                }
                              } else {
                                alert('Admin permission required to delete entries.');
                              }
                            }}
                            className={`p-1.5 rounded-lg border ${
                              isAdmin
                                ? 'border-slate-200 bg-white hover:bg-red-50 text-red-600 hover:border-red-200'
                                : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                            }`}
                            title={isAdmin ? 'Delete Entry' : 'Admin Only'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-blue-900 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconComponent className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm">
                  {editingEntry ? `Edit Entry - ${sectionKey}` : `Record Daily Total - ${sectionKey}`}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Date Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Entry Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              {/* Total Daily Sales Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {amountLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-xs">PKR</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="e.g. 25000"
                    value={formSales}
                    onChange={e => setFormSales(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-black text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Enter only the overall daily total amount for this module.
                </p>
              </div>

              {/* Notes Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Daily shift settlement notes or transaction summary"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-blue-900 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs shadow-md"
                >
                  {editingEntry ? 'Update Entry' : 'Save Daily Total'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
