import React, { useState } from 'react';
import { FileText, Download, Calendar, X, Check } from 'lucide-react';
import { DateFilterType, DateFilterRange } from '../../utils/pdfGenerator';
import { ModuleReportKey, exportModulePDF } from '../../utils/moduleReportExporter';
import { useApp } from '../../context/AppContext';

interface PDFExportButtonProps {
  moduleKey?: ModuleReportKey;
  onExport?: (filter: DateFilterRange) => void;
  buttonLabel?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'compact';
  title?: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  moduleKey,
  onExport,
  buttonLabel = '📄 Export PDF',
  variant = 'primary',
  title = 'Export Professional PDF Report',
}) => {
  const appState = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<DateFilterType>('THIS_MONTH');
  const [customStartDate, setCustomStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  );
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().slice(0, 10));

  const handleConfirmDownload = () => {
    const range: DateFilterRange = {
      type: filterType,
      customStartDate,
      customEndDate,
    };
    if (onExport) {
      onExport(range);
    } else if (moduleKey) {
      exportModulePDF(moduleKey, range, appState);
    }
    setIsOpen(false);
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'compact':
        return 'px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer';
      case 'outline':
        return 'px-3 py-1.5 rounded-xl border border-red-200 hover:border-red-400 bg-red-50/50 hover:bg-red-50 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer';
      case 'secondary':
        return 'px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-all cursor-pointer';
      case 'primary':
      default:
        return 'px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer';
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={getButtonStyles()} title={title}>
        <FileText className="w-4 h-4" />
        <span>{buttonLabel}</span>
      </button>

      {/* Date Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{title}</h3>
                  <p className="text-xs text-slate-500">Select reporting period filter</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Select Date Range Filter
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'TODAY', label: 'Today' },
                  { id: 'YESTERDAY', label: 'Yesterday' },
                  { id: 'THIS_WEEK', label: 'This Week' },
                  { id: 'LAST_WEEK', label: 'Last Week' },
                  { id: 'THIS_MONTH', label: 'This Month' },
                  { id: 'LAST_MONTH', label: 'Last Month' },
                  { id: 'CUSTOM', label: 'Custom Range' },
                ].map((opt) => {
                  const isSelected = filterType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setFilterType(opt.id as DateFilterType)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Date Input */}
            {filterType === 'CUSTOM' && (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDownload}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
