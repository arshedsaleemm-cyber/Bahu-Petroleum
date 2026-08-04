import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportModulePDF, ModuleReportKey } from '../../utils/moduleReportExporter';
import { DateFilterRange } from '../../utils/pdfGenerator';
import {
  FileText,
  BarChart3,
  Truck,
  Droplet,
  Container,
  Package,
  Users,
  CalendarCheck,
  Banknote,
  Receipt,
  Building2,
  Wallet,
  CreditCard,
  CircleDot,
  Car,
  ShoppingBag,
  ChefHat,
  PieChart,
  ShieldCheck,
  Sparkles,
  Calendar,
  X,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface ReportCategoryItem {
  id: ModuleReportKey;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

export const ReportsPDFCenter: React.FC = () => {
  const appState = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ReportCategoryItem | null>(null);
  const [reportType, setReportType] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-indexed
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const yearsList = [2026, 2025, 2024, 2023, 2022];

  const categories: ReportCategoryItem[] = [
    {
      id: 'COMPLETE_BUSINESS',
      title: 'Complete Business Report',
      description: 'Full station financial statement & consolidated master PDF audit.',
      icon: PieChart,
      color: 'bg-blue-900',
    },
    {
      id: 'DELIVERIES',
      title: 'Fuel Delivery Report',
      description: 'Tanker deliveries received, purchase rates per litre, and invoice costs.',
      icon: Truck,
      color: 'bg-emerald-600',
    },
    {
      id: 'FUEL_SALES',
      title: 'Fuel Sales Report',
      description: 'Daily petrol, diesel, and high-octane sales revenue and dispenser volume.',
      icon: Droplet,
      color: 'bg-red-600',
    },
    {
      id: 'TANKS',
      title: 'Tank Management Report',
      description: 'Underground tank capacities, opening stock, received fuel, sold fuel, and closing stock.',
      icon: Container,
      color: 'bg-amber-600',
    },
    {
      id: 'SHORTAGE',
      title: 'Fuel Dip & Shortage Report',
      description: 'Tank dip readings, calculated vs physical stock, shortage and overage audit.',
      icon: Droplet,
      color: 'bg-rose-600',
    },
    {
      id: 'LUBRICANTS',
      title: 'Lubricant Report',
      description: 'Engine oil sales, quantities sold, unit prices, and monthly total.',
      icon: Package,
      color: 'bg-purple-600',
    },
    {
      id: 'CREDIT_CUSTOMERS',
      title: 'Credit Customer Report',
      description: 'Complete udhaar customer ledgers, chronological transactions, credit added & payments.',
      icon: Users,
      color: 'bg-blue-800',
    },
    {
      id: 'CREDIT_CARD',
      title: 'Credit Card Report',
      description: 'POS credit card terminal transactions and monthly sales total.',
      icon: CreditCard,
      color: 'bg-blue-700',
    },
    {
      id: 'INFINI_CARD',
      title: 'Infinity Card Report',
      description: 'Infini fleet card transactions, corporate accounts, and monthly total.',
      icon: CreditCard,
      color: 'bg-indigo-700',
    },
    {
      id: 'WORKERS',
      title: 'Employee Report',
      description: 'Worker profiles directory, designations, monthly salaries, and status.',
      icon: Users,
      color: 'bg-teal-600',
    },
    {
      id: 'ATTENDANCE',
      title: 'Attendance Report',
      description: 'Worker attendance register, present days, absent days, and leave days.',
      icon: CalendarCheck,
      color: 'bg-cyan-600',
    },
    {
      id: 'SALARY',
      title: 'Salary Report',
      description: 'Worker basic salaries, disbursements, advances, and pending balances.',
      icon: Banknote,
      color: 'bg-green-600',
    },
    {
      id: 'ADVANCES',
      title: 'Employee Advance Report',
      description: 'Worker salary advance vouchers and emergency payouts audit.',
      icon: Banknote,
      color: 'bg-lime-600',
    },
    {
      id: 'PENDING_SALARY',
      title: 'Pending Salary Report',
      description: 'Outstanding worker salary payables and remaining dues audit.',
      icon: Banknote,
      color: 'bg-amber-700',
    },
    {
      id: 'EXPENSES',
      title: 'Expense Report',
      description: 'General business expenses (utilities, salaries, maintenance, office). Excludes fuel purchases.',
      icon: Receipt,
      color: 'bg-rose-700',
    },
    {
      id: 'BANK',
      title: 'Bank Report',
      description: 'Bank account deposits, withdrawals, and closing balances statement.',
      icon: Building2,
      color: 'bg-slate-700',
    },
    {
      id: 'CAR_WASH',
      title: 'Car Wash Report',
      description: 'Daily car wash sales, vehicle packages, and monthly total revenue.',
      icon: Car,
      color: 'bg-sky-600',
    },
    {
      id: 'TYRE_SHOP',
      title: 'Tire Shop Report',
      description: 'Daily tire repair services, wheel alignment sales, and monthly total.',
      icon: CircleDot,
      color: 'bg-zinc-700',
    },
    {
      id: 'TUCK_SHOP',
      title: 'Tuck Shop Report',
      description: 'Daily mart retail item sales, quantities, and monthly total.',
      icon: ShoppingBag,
      color: 'bg-amber-800',
    },
    {
      id: 'RESTAURANT',
      title: 'Restaurant Report',
      description: 'Daily fast food sales receipts, customer orders, and monthly total.',
      icon: ChefHat,
      color: 'bg-red-700',
    },
  ];

  const handleGeneratePDF = () => {
    if (!selectedCategory) return;

    const filter: DateFilterRange = {
      type: reportType,
      selectedMonth,
      selectedYear,
    };

    exportModulePDF(selectedCategory.id, filter, appState);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-3 bg-red-600 text-white rounded-2xl shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">📄 PDF Downloads</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dedicated PDF Reporting Center for CEO Mian Rashid Saleem • Bahu Petroleum Enterprise.
              </p>
            </div>
          </div>
        </div>

        <div>
          <span className="px-3.5 py-1.5 bg-red-50 text-red-700 border border-red-200 text-xs font-extrabold rounded-xl flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span>Monthly & Yearly PDF Reports</span>
          </span>
        </div>
      </div>

      {/* Featured Master PDF Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-900/60 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileText className="w-48 h-48 text-white" />
        </div>

        <div className="flex items-center gap-2 text-xs font-black uppercase text-red-400 tracking-wider">
          <Sparkles className="w-4 h-4 text-red-500" />
          <span>Consolidated Enterprise Master Audit</span>
        </div>

        <div className="max-w-2xl space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Complete Business Report PDF
          </h3>
          <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed font-medium">
            Generate a single consolidated master PDF containing complete audits for Fuel Sales, Tankers, Tanks, Expenses, Salaries, Cards, Sub-Businesses, and Net Profit & Loss.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              const compCategory = categories.find(c => c.id === 'COMPLETE_BUSINESS');
              if (compCategory) setSelectedCategory(compCategory);
            }}
            className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Generate Complete Business Report PDF
          </button>
        </div>
      </div>

      {/* Grid of All 22 Report Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <span>Report Categories</span>
            <span className="text-xs font-bold text-slate-400">({categories.length} Categories)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer hover:border-red-300 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl text-white ${cat.color} shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-md">
                      Monthly / Yearly
                    </span>
                  </div>

                  <h4 className="font-black text-slate-900 text-base group-hover:text-red-700 transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{cat.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-red-600 group-hover:text-red-700">
                  <span>Open Report Screen</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CATEGORY REPORT SCREEN MODAL */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl text-white ${selectedCategory.color} shadow-md`}>
                  {React.createElement(selectedCategory.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">{selectedCategory.title}</h3>
                  <p className="text-xs text-slate-500">Choose report period & generate PDF</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Choose Report Type Section */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Choose Report Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReportType('MONTHLY')}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    reportType === 'MONTHLY'
                      ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Calendar className="w-5 h-5" />
                    {reportType === 'MONTHLY' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="font-black text-sm">Monthly PDF</p>
                    <p className={`text-[11px] ${reportType === 'MONTHLY' ? 'text-blue-200' : 'text-slate-500'}`}>
                      Select specific month & year
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('YEARLY')}
                  className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    reportType === 'YEARLY'
                      ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <BarChart3 className="w-5 h-5" />
                    {reportType === 'YEARLY' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="font-black text-sm">Yearly PDF</p>
                    <p className={`text-[11px] ${reportType === 'YEARLY' ? 'text-blue-200' : 'text-slate-500'}`}>
                      Full 12-month annual summary
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              {reportType === 'MONTHLY' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      {monthsList.map((m, idx) => (
                        <option key={m} value={idx}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      {yearsList.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {reportType === 'YEARLY' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-900"
                  >
                    {yearsList.map((y) => (
                      <option key={y} value={y}>
                        Annual Audit Year {y}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGeneratePDF}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
