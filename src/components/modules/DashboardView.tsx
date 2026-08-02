import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatLiters } from '../../utils/formatters';
import { TankVisualizer } from '../common/TankVisualizer';
import { PermissionNotice } from '../common/PermissionNotice';
import { PDFExportButton } from '../common/PDFExportButton';
import {
  TrendingUp,
  DollarSign,
  Fuel,
  Droplet,
  Truck,
  Wallet,
  Building2,
  CreditCard,
  Users,
  Receipt,
  Package,
  UserCheck,
  Building,
  CircleDot,
  Car,
  ShoppingBag,
  AlertTriangle,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    tanks,
    deliveries,
    lubricants,
    workers,
    attendance,
    salaries,
    udhaarCustomers,
    expenses,
    cashRegister,
    creditCardSales,
    infiniCardSales,
    shops,
    rentalAgreements,
    notifications,
    dailySalesEntries,
    fuelSales,
    setCurrentView,
  } = useApp();

  const todayIso = new Date().toISOString().slice(0, 10);
  const currentMonthIso = todayIso.slice(0, 7);
  const currentYearIso = todayIso.slice(0, 4);

  // Fuel Sales Litres Metrics
  const todayFuelSoldLiters = (fuelSales || []).filter(s => s.date === todayIso).reduce((a, b) => a + b.quantityLiters, 0);
  const monthlyFuelSoldLiters = (fuelSales || []).filter(s => s.date.startsWith(currentMonthIso)).reduce((a, b) => a + b.quantityLiters, 0);
  const yearlyFuelSoldLiters = (fuelSales || []).filter(s => s.date.startsWith(currentYearIso)).reduce((a, b) => a + b.quantityLiters, 0);
  const todayDailySalesTotal = (dailySalesEntries || [])
    .filter(e => e.date === todayIso)
    .reduce((a, b) => a + (b.totalSales || 0), 0);

  // Metric Calculations
  const todaySalesAmount = todayDailySalesTotal;
  const monthlySalesAmount = todaySalesAmount * 28; // Estimated monthly run rate

  const totalPetrolStock = tanks.filter(t => (t.fuelType as string) === 'Petrol' || t.fuelType === 'Super Petrol').reduce((a, b) => a + b.currentFuel, 0);
  const totalDieselStock = tanks.filter(t => (t.fuelType as string) === 'Diesel' || t.fuelType === 'High-Speed Diesel (HSD)').reduce((a, b) => a + b.currentFuel, 0);

  const todayFuelReceived = deliveries.reduce((acc, curr) => acc + curr.totalLitersReceived, 0);

  const cashCollection = cashRegister?.cashReceived || 0;
  const ccCollection = (creditCardSales || []).reduce((a, b) => a + b.amount, 0);
  const infiniCollection = (infiniCardSales || []).reduce((a, b) => a + b.amount, 0);

  const totalUdhaarBalance = (udhaarCustomers || []).reduce((a, b) => a + b.remainingBalance, 0);

  const todayExpenses = (expenses || []).reduce((a, b) => a + b.amount, 0);
  const monthlyExpenses = todayExpenses * 12;

  const totalLubricantsStock = (lubricants || []).reduce((a, b) => a + b.remainingStock, 0);
  const lowStockLubs = (lubricants || []).filter(l => l.remainingStock <= l.lowStockAlert);

  const presentWorkersToday = (attendance || []).filter(a => a.status === 'Present').length;
  const pendingSalariesTotal = (salaries || []).reduce((a, b) => a + b.pendingSalary, 0);

  const tyreShopIncome = (shops || []).find(s => s.shopType === 'Tyre Shop')?.dailyIncome || 0;
  const carWashIncome = (shops || []).find(s => s.shopType === 'Car Wash')?.dailyIncome || 0;
  const tuckShopIncome = (shops || []).find(s => s.shopType === 'Tuck Shop')?.dailyIncome || 0;
  const totalRentalIncome = (rentalAgreements || []).reduce((a, b) => a + b.monthlyRent, 0);

  // Profit calculation (Sales + Sub-shops - Expenses - Purchases)
  const todayProfit = todaySalesAmount + tyreShopIncome + carWashIncome + tuckShopIncome - todayExpenses;
  const monthlyProfit = todayProfit * 26;

  // Chart Data
  const salesChartData = [
    { name: 'Mon', Petrol: 420000, Diesel: 610000 },
    { name: 'Tue', Petrol: 480000, Diesel: 680000 },
    { name: 'Wed', Petrol: 510000, Diesel: 720000 },
    { name: 'Thu', Petrol: 490000, Diesel: 690000 },
    { name: 'Fri', Petrol: 610000, Diesel: 880000 },
    { name: 'Sat', Petrol: 650000, Diesel: 910000 },
    { name: 'Sun', Petrol: 580000, Diesel: 820000 },
  ];

  const stockPieData = [
    { name: 'Super Petrol Main', value: tanks[0]?.currentFuel || 0, color: '#DC2626' },
    { name: 'Diesel Main', value: tanks[1]?.currentFuel || 0, color: '#1D4ED8' },
    { name: 'Super Petrol Reserve', value: tanks[2]?.currentFuel || 0, color: '#F59E0B' },
  ];

  const incomeDistribution = [
    { name: 'Fuel Sales', amount: todaySalesAmount, color: '#1E3A8A' },
    { name: 'Car Wash', amount: carWashIncome, color: '#0284C7' },
    { name: 'Tuck Shop', amount: tuckShopIncome, color: '#059669' },
    { name: 'Tyre Shop', amount: tyreShopIncome, color: '#D97706' },
    { name: 'Rentals', amount: totalRentalIncome / 30, color: '#7C3AED' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Top Welcome Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-800">
              Station Operational Overview
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Bahu Petroleum Executive Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Founder & CEO: <span className="font-bold text-white">Mian Rashid Saleem</span> • Live Pump Activity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentView('daily_petrol_cash')}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Daily Petrol Cash
          </button>
          <button
            onClick={() => setCurrentView('deliveries')}
            className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" /> Add Fuel Delivery
          </button>
        </div>
      </div>

      {/* Low Stock Alert Warnings Banner if any */}
      {(tanks.some(t => t.currentFuel <= t.lowStockThreshold) || lowStockLubs.length > 0) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-900 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-sm text-amber-950">Immediate Inventory Attention Required</h4>
            <div className="text-xs space-y-0.5 mt-1">
              {tanks.filter(t => t.currentFuel <= t.lowStockThreshold).map(t => (
                <p key={t.id}>
                  • <span className="font-bold">{t.tankName}</span> level is low: {formatLiters(t.currentFuel)} remaining (Below {formatLiters(t.lowStockThreshold)} threshold).
                </p>
              ))}
              {lowStockLubs.map(l => (
                <p key={l.id}>
                  • <span className="font-bold">{l.productName}</span> stock low: {l.remainingStock} units left.
                </p>
              ))}
            </div>
          </div>
          <button
            onClick={() => setCurrentView('tanks')}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            Manage Stock
          </button>
        </div>
      )}

      {/* Key Financial Metric KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Fuel Sales (Litres) */}
        <div
          onClick={() => setCurrentView('fuel_sales')}
          className="bg-gradient-to-br from-red-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm hover:border-red-500 border border-red-800 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-200 uppercase tracking-wider">Fuel Sold (Litres)</span>
            <div className="p-2 rounded-xl bg-red-800/80 text-red-200 group-hover:scale-110 transition-transform">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">
            {todayFuelSoldLiters.toLocaleString()} <span className="text-xs font-bold text-red-300">L Today</span>
          </p>
          <p className="text-[11px] text-red-300 font-semibold mt-1">
            Month: {monthlyFuelSoldLiters.toLocaleString()} L • Year: {yearlyFuelSoldLiters.toLocaleString()} L
          </p>
        </div>

        {/* Today's Sales */}
        <div
          onClick={() => setCurrentView('daily_petrol_cash')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-blue-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Sales</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2">{formatCurrency(todaySalesAmount)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Est. Monthly: {formatCurrency(monthlySalesAmount)}
          </p>
        </div>

        {/* Today's Profit */}
        <div
          onClick={() => setCurrentView('reports')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-emerald-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Profit</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-emerald-700 mt-2">{formatCurrency(todayProfit)}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Monthly Est: <span className="font-bold text-slate-800">{formatCurrency(monthlyProfit)}</span>
          </p>
        </div>

        {/* Total Petrol Stock */}
        <div
          onClick={() => setCurrentView('inventory')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-red-400 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Petrol Stock</span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2">{formatLiters(totalPetrolStock)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across Petrol Storage Tanks</p>
        </div>

        {/* Total Diesel Stock */}
        <div
          onClick={() => setCurrentView('inventory')}
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Diesel Stock</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-800 group-hover:scale-110 transition-transform">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2">{formatLiters(totalDieselStock)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Commercial High Speed Diesel</p>
        </div>
      </div>

      {/* Daily Total Sales Sub-Business Overview Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 text-white shadow-md space-y-3 border border-blue-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-900 rounded-xl font-black text-base">
              Rs
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base">Sub-Businesses & Cash Daily Revenue</h3>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  Daily Mode
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Today ({todayIso}): <strong className="text-white font-black">Rs. {todayDailySalesTotal.toLocaleString()}</strong> combined total across sections
              </p>
            </div>
          </div>
        </div>

        {/* Quick Module Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1 border-t border-blue-800/60">
          {[
            { key: 'daily_petrol_cash', label: 'Petrol Cash', section: 'Daily Petrol Cash' },
            { key: 'credit_card', label: 'Credit Card', section: 'Credit Card' },
            { key: 'infini_card', label: 'Infini Card', section: 'Infinity Card' },
            { key: 'lubricants', label: 'Lubricants', section: 'Lubricants' },
            { key: 'tyre_shop', label: 'Tyre Shop', section: 'Tyre Shop' },
            { key: 'car_wash', label: 'Car Wash', section: 'Car Wash' },
            { key: 'tuck_shop', label: 'Tuck Shop', section: 'Tuck Shop' },
            { key: 'restaurant', label: 'Fast Food', section: 'Fast Food' },
          ].map(mod => {
            const sum = (dailySalesEntries || [])
              .filter(e => e.date === todayIso && e.section === mod.section)
              .reduce((a, b) => a + (b.totalSales || 0), 0);
            return (
              <button
                key={mod.key}
                onClick={() => setCurrentView(mod.key)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-left border border-white/10"
              >
                <span className="text-[10px] font-bold text-blue-200 block truncate">{mod.label}</span>
                <span className="text-xs font-black text-amber-300 block">Rs. {sum.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Operational Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Cash In Vault</p>
          <p className="font-black text-slate-900 text-base mt-0.5">{formatCurrency(cashCollection)}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Credit Card POS</p>
          <p className="font-black text-slate-900 text-base mt-0.5">{formatCurrency(ccCollection)}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Infini Fleet Card</p>
          <p className="font-black text-slate-900 text-base mt-0.5">{formatCurrency(infiniCollection)}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Udhaar Balance</p>
          <p className="font-black text-red-600 text-base mt-0.5">{formatCurrency(totalUdhaarBalance)}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Today Expenses</p>
          <p className="font-black text-amber-600 text-base mt-0.5">{formatCurrency(todayExpenses)}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Attendance Today</p>
          <p className="font-black text-emerald-600 text-base mt-0.5">
            {presentWorkersToday} / {workers.length} Workers
          </p>
        </div>
      </div>

      {/* Tanks Visual Gauge Meters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Fuel className="w-5 h-5 text-red-600" /> Fuel Tanks Live Levels
          </h3>
          <button
            onClick={() => setCurrentView('tanks')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900"
          >
            Manage Tanks →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tanks.map(tank => (
            <TankVisualizer key={tank.id} tank={tank} onEdit={() => setCurrentView('tanks')} />
          ))}
        </div>
      </div>

      {/* Analytics Charts & Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Weekly Fuel Sales Trend</h3>
              <p className="text-xs text-slate-500">Petrol vs High Speed Diesel Sales Comparison</p>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={v => `Rs.${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Sales']}
                  contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="Petrol" fill="#DC2626" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Diesel" fill="#1D4ED8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1">Revenue Share by Department</h3>
            <p className="text-xs text-slate-500 mb-4">Fuel vs Sub-Shops & Rentals</p>

            <div className="space-y-3">
              {incomeDistribution.map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="text-slate-900 font-bold">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(8, (item.amount / (todaySalesAmount + 50000)) * 100)
                        )}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 text-center font-medium">
            Calculated across all active station operations
          </div>
        </div>
      </div>

      {/* Sub-Shops Quick Snapshot Cards */}
      <div>
        <h3 className="font-extrabold text-slate-900 text-base mb-3">Station Sub-Business Income</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => setCurrentView('tyre_shop')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-400 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
              <CircleDot className="w-4 h-4" /> Tyre Shop
            </div>
            <p className="font-black text-slate-900 text-lg">{formatCurrency(tyreShopIncome)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Rent: Rs. 35,000/mo (Paid)</p>
          </div>

          <div
            onClick={() => setCurrentView('car_wash')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-400 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-sky-700 font-bold text-xs mb-1">
              <Car className="w-4 h-4" /> Car Wash
            </div>
            <p className="font-black text-slate-900 text-lg">{formatCurrency(carWashIncome)}</p>
            <p className="text-[11px] text-slate-500 mt-1">Cars Washed Today: 38</p>
          </div>

          <div
            onClick={() => setCurrentView('tuck_shop')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
              <ShoppingBag className="w-4 h-4" /> Tuck Shop
            </div>
            <p className="font-black text-slate-900 text-lg">{formatCurrency(tuckShopIncome)}</p>
            <p className="text-[11px] text-slate-500 mt-1">24/7 Bahu Mart Sales</p>
          </div>

          <div
            onClick={() => setCurrentView('rentals')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-400 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs mb-1">
              <Building className="w-4 h-4" /> Rental Leases
            </div>
            <p className="font-black text-slate-900 text-lg">{formatCurrency(totalRentalIncome)}/mo</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">All Leases Up to Date</p>
          </div>
        </div>
      </div>
    </div>
  );
};
