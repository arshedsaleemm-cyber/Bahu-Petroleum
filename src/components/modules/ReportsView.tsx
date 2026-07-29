import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatLiters, formatDate } from '../../utils/formatters';
import { exportToExcel } from '../../utils/exportUtils';
import { PermissionNotice } from '../common/PermissionNotice';
import { ReportsPDFCenter } from './ReportsPDFCenter';
import { FileText, FileSpreadsheet, PieChart, BarChart3, Download } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { deliveries, expenses, udhaarCustomers, dailySalesEntries } = useApp();

  const [activeTab, setActiveTab] = useState<'PDF_CENTER' | 'LOGS'>('PDF_CENTER');
  const [reportType, setReportType] = useState<string>('DAILY_SALES');

  const totalDailySalesAmount = (dailySalesEntries || []).reduce((acc, curr) => acc + curr.totalSales, 0);
  const totalDeliveriesCost = deliveries.reduce((acc, curr) => acc + curr.totalPurchaseAmount, 0);
  const totalExpensesAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalDailySalesAmount - totalDeliveriesCost - totalExpensesAmount;

  const handleExportExcel = () => {
    if (reportType === 'DAILY_SALES') {
      exportToExcel(dailySalesEntries || [], 'Bahu_Petroleum_Daily_Sales');
    } else if (reportType === 'DELIVERIES') {
      exportToExcel(deliveries, 'Bahu_Petroleum_Fuel_Deliveries');
    } else {
      exportToExcel(expenses, 'Bahu_Petroleum_Expenses');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-900 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Reports & Analytics Hub</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate formal enterprise PDF & Excel audit logs for CEO Mian Rashid Saleem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Financial P&L Executive Card */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-blue-800/60 pb-3">
          <span className="text-xs font-extrabold uppercase text-red-400 tracking-wider">
            Executive Financial P&L Summary
          </span>
          <span className="text-xs text-blue-300 font-semibold">Bahu Petroleum Main Station</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-blue-300 uppercase">Gross Sales Revenue</p>
            <p className="text-lg sm:text-xl font-black text-emerald-400 mt-1">{formatCurrency(totalDailySalesAmount)}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-blue-300 uppercase">Total Fuel Purchases</p>
            <p className="text-lg sm:text-xl font-black text-rose-400 mt-1">{formatCurrency(totalDeliveriesCost)}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-blue-300 uppercase">Operating Expenses</p>
            <p className="text-lg sm:text-xl font-black text-amber-400 mt-1">{formatCurrency(totalExpensesAmount)}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] font-bold text-blue-300 uppercase">Net Calculated Profit</p>
            <p className={`text-lg sm:text-xl font-black mt-1 ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(netProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveTab('PDF_CENTER')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'PDF_CENTER' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📄 1-Click PDF Center
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === 'LOGS' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📋 Quick Data Logs
        </button>
      </div>

      {/* TAB CONTENT: PDF CENTER */}
      {activeTab === 'PDF_CENTER' && <ReportsPDFCenter />}

      {/* TAB CONTENT: DATA LOGS */}
      {activeTab === 'LOGS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setReportType('DAILY_SALES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                reportType === 'DAILY_SALES' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Daily Cash & Card Sales
            </button>
            <button
              onClick={() => setReportType('DELIVERIES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                reportType === 'DELIVERIES' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tanker Deliveries
            </button>
            <button
              onClick={() => setReportType('EXPENSES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                reportType === 'EXPENSES' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Expenses & Bills
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              {reportType === 'DAILY_SALES'
                ? 'Daily Cash & Card Sales Summary Log'
                : reportType === 'DELIVERIES'
                ? 'Fuel Tanker Shipments Log'
                : 'Expense Vouchers Log'}
            </h3>

            {reportType === 'DAILY_SALES' && (
              <div className="space-y-2">
                {(dailySalesEntries || []).map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900">{entry.section}</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                          {entry.date}
                        </span>
                      </div>
                      {entry.notes && <p className="text-[11px] text-slate-500 mt-0.5">{entry.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-blue-900 text-sm">Rs. {entry.totalSales.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">Recorded by {entry.createdBy || 'Admin'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reportType === 'DELIVERIES' && (
              <div className="space-y-2">
                {deliveries.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{d.supplierName} ({d.fuelType})</p>
                      <p className="text-[11px] text-slate-500">Invoice: {d.invoiceNumber} • Vehicle: {d.vehicleNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-red-600">{formatCurrency(d.totalPurchaseAmount)}</p>
                      <p className="text-[11px] text-slate-500">{formatLiters(d.totalLitersReceived)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {reportType === 'EXPENSES' && (
              <div className="space-y-2">
                {expenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{e.title}</p>
                      <p className="text-[11px] text-slate-500">{e.category} • {formatDate(e.date)}</p>
                    </div>
                    <p className="font-black text-amber-700">{formatCurrency(e.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

