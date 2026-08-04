import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelType, FuelSale } from '../../types';
import { DateFilterRange } from '../../utils/pdfGenerator';
import { exportModulePDF } from '../../utils/moduleReportExporter';
import {
  Flame,
  Plus,
  Search,
  Calendar,
  Filter,
  Trash2,
  Edit,
  AlertTriangle,
  Droplet,
  CheckCircle2,
  TrendingUp,
  FileText,
  X,
  Gauge,
  ArrowUpRight,
  Sparkles,
  Download,
  DollarSign
} from 'lucide-react';

export const FuelSalesView: React.FC = () => {
  const appState = useApp();
  const {
    fuelSales,
    tanks,
    deliveries,
    addFuelSale,
    updateFuelSale,
    deleteFuelSale,
    canEdit,
    canDelete,
    currentUser,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FuelSale | null>(null);

  // PDF Report Modal
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfReportType, setPdfReportType] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [pdfSelectedMonth, setPdfSelectedMonth] = useState<number>(new Date().getMonth());
  const [pdfSelectedYear, setPdfSelectedYear] = useState<number>(new Date().getFullYear());

  const handleDownloadPDF = () => {
    const filterRange: DateFilterRange = {
      type: pdfReportType,
      selectedMonth: pdfSelectedMonth,
      selectedYear: pdfSelectedYear,
    };
    exportModulePDF('FUEL_SALES', filterRange, appState);
    setIsPdfModalOpen(false);
  };

  // Form states
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType>('Super Petrol');
  const [selectedTankId, setSelectedTankId] = useState<string>('');
  const [quantityLiters, setQuantityLiters] = useState<string>('');
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [manualTotalAmount, setManualTotalAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFuelType, setFilterFuelType] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('');

  // Calculate weighted average purchase rate per fuel type
  const getPurchaseRate = (ft: string) => {
    const ftDeliveries = (deliveries || []).filter(d =>
      d.fuelType === ft ||
      (ft === 'Super Petrol' && (d.fuelType as string) === 'Petrol') ||
      (ft === 'High-Speed Diesel (HSD)' && (d.fuelType as string) === 'Diesel')
    );
    const totalLiters = ftDeliveries.reduce((sum, d) => sum + (d.totalLitersReceived || d.petrolLiters || d.dieselLiters || 0), 0);
    const totalCost = ftDeliveries.reduce((sum, d) => sum + (d.totalPurchaseAmount || 0), 0);
    if (totalLiters > 0 && totalCost > 0) return totalCost / totalLiters;
    if (ftDeliveries.length > 0) {
      const last = ftDeliveries[ftDeliveries.length - 1];
      if (ft === 'Super Petrol' && last.purchaseRatePetrol) return last.purchaseRatePetrol;
      if (ft === 'High-Speed Diesel (HSD)' && last.purchaseRateDiesel) return last.purchaseRateDiesel;
      if (last.fuelRate) return last.fuelRate;
    }
    if (ft === 'Super Petrol') return 250;
    if (ft === 'High-Speed Diesel (HSD)') return 260;
    if (ft === 'Excellium High-Octane') return 280;
    return 250;
  };

  const purchaseRates: Record<string, number> = useMemo(() => ({
    'Super Petrol': getPurchaseRate('Super Petrol'),
    'High-Speed Diesel (HSD)': getPurchaseRate('High-Speed Diesel (HSD)'),
    'Excellium High-Octane': getPurchaseRate('Excellium High-Octane'),
  }), [deliveries]);

  // Available tanks matching selected fuel type
  const availableTanks = useMemo(() => {
    return tanks.filter(t => t.fuelType === selectedFuelType || (selectedFuelType === 'Super Petrol' && (t.fuelType as string) === 'Petrol'));
  }, [tanks, selectedFuelType]);

  // Handle Fuel Type change in form: auto-select first available tank
  const handleFuelTypeChange = (ft: FuelType) => {
    setSelectedFuelType(ft);
    const matching = tanks.filter(t => t.fuelType === ft || (ft === 'Super Petrol' && (t.fuelType as string) === 'Petrol'));
    if (matching.length > 0) {
      setSelectedTankId(matching[0].id);
    } else {
      setSelectedTankId('');
    }
  };

  const openAddModal = () => {
    setEditingSale(null);
    setSelectedDate(new Date().toISOString().slice(0, 10));
    setSelectedFuelType('Super Petrol');
    const initialMatching = tanks.filter(t => t.fuelType === 'Super Petrol' || (t.fuelType as string) === 'Petrol');
    setSelectedTankId(initialMatching.length > 0 ? initialMatching[0].id : '');
    setQuantityLiters('');
    setSellingPrice('');
    setManualTotalAmount('');
    setNotes('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sale: FuelSale) => {
    if (!canEdit) return;
    setEditingSale(sale);
    setSelectedDate(sale.date);
    setSelectedFuelType(sale.fuelType);
    setSelectedTankId(sale.tankId);
    setQuantityLiters(sale.quantityLiters.toString());
    setSellingPrice(sale.sellingPricePerLiter ? sale.sellingPricePerLiter.toString() : '');
    setManualTotalAmount(sale.totalSaleAmount.toString());
    setNotes(sale.notes || '');
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const qty = parseFloat(quantityLiters);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('Please enter a valid positive quantity in litres.');
      return;
    }

    if (!selectedTankId) {
      setErrorMessage('Please select a storage tank for this sale.');
      return;
    }

    const price = sellingPrice ? parseFloat(sellingPrice) : undefined;
    const calcTotal = price ? Math.round(qty * price) : (manualTotalAmount ? parseFloat(manualTotalAmount) : 0);

    if (editingSale) {
      const res = updateFuelSale(editingSale.id, {
        date: selectedDate,
        fuelType: selectedFuelType,
        tankId: selectedTankId,
        quantityLiters: qty,
        sellingPricePerLiter: price,
        totalSaleAmount: calcTotal,
        notes: notes.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Failed to update fuel sale.');
        return;
      }

      setSuccessMessage('Fuel sale entry updated successfully!');
      setTimeout(() => setIsModalOpen(false), 900);
    } else {
      const res = addFuelSale({
        date: selectedDate,
        fuelType: selectedFuelType,
        tankId: selectedTankId,
        quantityLiters: qty,
        sellingPricePerLiter: price,
        totalSaleAmount: calcTotal,
        notes: notes.trim(),
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Failed to record fuel sale.');
        return;
      }

      setSuccessMessage('Fuel sale recorded & tank stock updated immediately!');
      setTimeout(() => setIsModalOpen(false), 900);
    }
  };

  const handleDelete = (sale: FuelSale) => {
    if (!canDelete) return;
    if (window.confirm(`Are you sure you want to delete this fuel sale of ${sale.quantityLiters.toLocaleString()} L (${sale.fuelType})? The sold stock will be restored to the tank.`)) {
      deleteFuelSale(sale.id);
    }
  };

  // KPIs
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7);
  const currentYearStr = todayStr.slice(0, 4);

  const todaySales = useMemo(() => fuelSales.filter(s => s.date === todayStr), [fuelSales, todayStr]);
  const monthSales = useMemo(() => fuelSales.filter(s => s.date.startsWith(currentMonthStr)), [fuelSales, currentMonthStr]);
  const yearSales = useMemo(() => fuelSales.filter(s => s.date.startsWith(currentYearStr)), [fuelSales, currentYearStr]);

  const todayLiters = todaySales.reduce((a, b) => a + b.quantityLiters, 0);
  const todayAmount = todaySales.reduce((a, b) => a + b.totalSaleAmount, 0);

  const monthLiters = monthSales.reduce((a, b) => a + b.quantityLiters, 0);
  const monthAmount = monthSales.reduce((a, b) => a + b.totalSaleAmount, 0);

  const yearLiters = yearSales.reduce((a, b) => a + b.quantityLiters, 0);
  const yearAmount = yearSales.reduce((a, b) => a + b.totalSaleAmount, 0);

  // Fuel Type Breakdown
  const fuelTypeSummary = useMemo(() => {
    const types: FuelType[] = ['Super Petrol', 'High-Speed Diesel (HSD)', 'Excellium High-Octane'];
    return types.map(ft => {
      const ftSalesMonth = monthSales.filter(s => s.fuelType === ft);
      const litersMonth = ftSalesMonth.reduce((a, b) => a + b.quantityLiters, 0);
      const amountMonth = ftSalesMonth.reduce((a, b) => a + b.totalSaleAmount, 0);

      const ftTanks = tanks.filter(t => t.fuelType === ft || (ft === 'Super Petrol' && (t.fuelType as string) === 'Petrol'));
      const totalCapacity = ftTanks.reduce((a, b) => a + b.capacity, 0);
      const remainingFuel = ftTanks.reduce((a, b) => a + b.currentFuel, 0);

      return {
        fuelType: ft,
        litersMonth,
        amountMonth,
        remainingFuel,
        totalCapacity,
      };
    });
  }, [monthSales, tanks]);

  // Filtered Sales Table List
  const filteredSales = useMemo(() => {
    return fuelSales.filter(s => {
      const matchesSearch =
        (s.tankName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.createdBy || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fuelType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterFuelType === 'ALL' || s.fuelType === filterFuelType;
      const matchesMonth = !filterMonth || s.date.startsWith(filterMonth);

      return matchesSearch && matchesType && matchesMonth;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [fuelSales, searchQuery, filterFuelType, filterMonth]);

  const selectedTankObj = tanks.find(t => t.id === selectedTankId);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-red-900/40">
        <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
                <Flame className="w-6 h-6 animate-pulse" />
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Fuel Sales Management</h1>
            </div>
            <p className="text-slate-300 text-sm max-w-xl">
              Record daily fuel sold in litres, auto-deduct stock from connected tanks, and track real-time revenue across Super Petrol, HSD, and Excellium High-Octane.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 shadow-md transition-all hover:scale-[1.02] active:scale-95"
            >
              <Download className="w-5 h-5 mr-2 text-red-400" />
              Download PDF Report
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              Record Fuel Sale
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today's Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-red-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Fuel Sold</span>
            <span className="p-2 bg-red-50 text-red-600 rounded-xl">
              <Flame className="w-5 h-5" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {todayLiters.toLocaleString()} <span className="text-lg font-bold text-slate-500">L</span>
            </div>
            <p className="text-sm font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Rs. {todayAmount.toLocaleString()} Total Revenue
            </p>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium">
            {todaySales.length} sale transaction{todaySales.length === 1 ? '' : 's'} recorded today
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Month's Sales</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Gauge className="w-5 h-5" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {monthLiters.toLocaleString()} <span className="text-lg font-bold text-slate-500">L</span>
            </div>
            <p className="text-sm font-semibold text-blue-600">
              Rs. {monthAmount.toLocaleString()} Revenue
            </p>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium">
            Monthly fuel dispenser aggregate
          </div>
        </div>

        {/* Yearly Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">This Year's Sales</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {yearLiters.toLocaleString()} <span className="text-lg font-bold text-slate-500">L</span>
            </div>
            <p className="text-sm font-semibold text-emerald-600">
              Rs. {yearAmount.toLocaleString()} Revenue
            </p>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 font-medium">
            Annual cumulative total fuel sold
          </div>
        </div>
      </div>

      {/* Automated Profitability Metrics Row */}
      {(() => {
        const monthCost = monthSales.reduce((sum, s) => sum + (s.quantityLiters * (purchaseRates[s.fuelType] || 250)), 0);
        const monthProfit = monthAmount - monthCost;
        const avgSellPrice = monthLiters > 0 ? (monthAmount / monthLiters).toFixed(2) : '0';
        const profitPerLiter = monthLiters > 0 ? (monthProfit / monthLiters).toFixed(2) : '0';

        return (
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-700/80">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/60">
              <h3 className="font-bold text-sm tracking-wide text-slate-200 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-emerald-400" />
                Monthly Fuel Sales Financials & Automated Profit Margins
              </h3>
              <span className="text-xs text-slate-400">Calculated from actual stock delivery rates</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">Total Purchase Cost</span>
                <span className="text-lg font-black text-slate-200">Rs. {Math.round(monthCost).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">Gross Profit</span>
                <span className="text-lg font-black text-emerald-400">Rs. {Math.round(monthProfit).toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">Avg Selling Price / L</span>
                <span className="text-lg font-black text-blue-400">Rs. {avgSellPrice}</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">Profit / Litre</span>
                <span className="text-lg font-black text-emerald-300">Rs. {profitPerLiter} / L</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Fuel Type-wise Stock & Sales Breakdown Cards */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
          <Droplet className="w-5 h-5 mr-2 text-red-600" />
          Fuel Type Stock & Monthly Sales Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fuelTypeSummary.map((item) => {
            const isSuper = item.fuelType === 'Super Petrol';
            const isHSD = item.fuelType === 'High-Speed Diesel (HSD)';
            const pctRemaining = item.totalCapacity > 0 ? Math.round((item.remainingFuel / item.totalCapacity) * 100) : 0;

            return (
              <div
                key={item.fuelType}
                className={`rounded-2xl p-5 border shadow-sm space-y-4 bg-white ${
                  isSuper ? 'border-red-200 hover:border-red-300' : isHSD ? 'border-blue-200 hover:border-blue-300' : 'border-emerald-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                      isSuper
                        ? 'bg-red-100 text-red-800'
                        : isHSD
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.fuelType}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Stock: <strong className="text-slate-900">{pctRemaining}%</strong>
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSuper ? 'bg-red-600' : isHSD ? 'bg-blue-600' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, pctRemaining)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 block">Current Stock</span>
                    <span className="font-extrabold text-slate-900">{item.remainingFuel.toLocaleString()} L</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Sold This Month</span>
                    <span className="font-extrabold text-slate-900">{item.litersMonth.toLocaleString()} L</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sales by tank, notes, or recorder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-red-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Fuel Type Filter */}
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
              {['ALL', 'Super Petrol', 'High-Speed Diesel (HSD)', 'Excellium High-Octane'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterFuelType(type)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterFuelType === type
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'ALL' ? 'All Fuels' : type.replace('High-Speed Diesel (HSD)', 'HSD').replace('Excellium High-Octane', 'High-Octane')}
                </button>
              ))}
            </div>

            {/* Month Filter */}
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Fuel Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-800 text-sm">Fuel Sales History ({filteredSales.length})</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider font-extrabold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Fuel Type</th>
                <th className="p-3.5">Tank Name</th>
                <th className="p-3.5 text-right">Quantity Sold (L)</th>
                <th className="p-3.5 text-right">Selling Price/L</th>
                <th className="p-3.5 text-right">Total Amount (PKR)</th>
                <th className="p-3.5">Recorded By</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    <Droplet className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No fuel sales records found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const isSuper = sale.fuelType === 'Super Petrol';
                  const isHSD = sale.fuelType === 'High-Speed Diesel (HSD)';

                  return (
                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-semibold text-slate-900 whitespace-nowrap">
                        {sale.date}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isSuper
                              ? 'bg-red-100 text-red-800'
                              : isHSD
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {sale.fuelType}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800">
                        {sale.tankName || 'Selected Tank'}
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">
                        {sale.quantityLiters.toLocaleString()} L
                      </td>
                      <td className="p-3.5 text-right text-slate-600">
                        {sale.sellingPricePerLiter ? `Rs. ${sale.sellingPricePerLiter}` : '-'}
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-emerald-700">
                        Rs. {sale.totalSaleAmount.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">
                        {sale.createdBy || 'System'}
                      </td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">
                        {sale.notes || '-'}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          {canEdit && (
                            <button
                              onClick={() => openEditModal(sale)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Sale"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(sale)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Sale & Restore Stock"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {!canEdit && !canDelete && (
                            <span className="text-slate-400 text-[10px]">View Only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record / Edit Fuel Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <Flame className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingSale ? 'Edit Fuel Sale Entry' : 'Record Daily Fuel Sale'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Stock Validation Error:</strong>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Date */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Sale Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:outline-none text-slate-900 font-medium"
                />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Fuel Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Super Petrol', 'High-Speed Diesel (HSD)', 'Excellium High-Octane'] as FuelType[]).map(ft => (
                    <button
                      type="button"
                      key={ft}
                      onClick={() => handleFuelTypeChange(ft)}
                      className={`p-2.5 rounded-xl border text-center transition-all font-bold ${
                        selectedFuelType === ft
                          ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ft === 'Super Petrol' ? 'Super Petrol' : ft === 'High-Speed Diesel (HSD)' ? 'Diesel (HSD)' : 'High-Octane'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tank Dropdown */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Select Tank <span className="text-red-500">*</span>
                </label>
                {availableTanks.length === 0 ? (
                  <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                    No tanks configured for {selectedFuelType}. Please configure a tank in Tank Management first.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedTankId}
                    onChange={(e) => setSelectedTankId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:outline-none text-slate-900 font-semibold"
                  >
                    {availableTanks.map(tank => (
                      <option key={tank.id} value={tank.id}>
                        {tank.tankName} — ({tank.currentFuel.toLocaleString()} L available stock)
                      </option>
                    ))}
                  </select>
                )}

                {selectedTankObj && (
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Selected Tank Available Stock:</span>
                    <strong className="text-slate-900 font-extrabold">{selectedTankObj.currentFuel.toLocaleString()} Litres</strong>
                  </div>
                )}
              </div>

              {/* Quantity Sold & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Quantity Sold (Litres) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 1500"
                    value={quantityLiters}
                    onChange={(e) => {
                      setQuantityLiters(e.target.value);
                      if (sellingPrice && e.target.value) {
                        const calculated = Math.round(parseFloat(e.target.value) * parseFloat(sellingPrice));
                        setManualTotalAmount(calculated.toString());
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:outline-none text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Selling Price / Litre (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 275.5"
                    value={sellingPrice}
                    onChange={(e) => {
                      setSellingPrice(e.target.value);
                      if (quantityLiters && e.target.value) {
                        const calculated = Math.round(parseFloat(quantityLiters) * parseFloat(e.target.value));
                        setManualTotalAmount(calculated.toString());
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:outline-none text-slate-900 font-semibold"
                  />
                </div>
              </div>

              {/* Total Sale Amount */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Total Sale Amount (PKR)
                </label>
                <input
                  type="number"
                  placeholder="Automatically calculated or manual total"
                  value={manualTotalAmount}
                  onChange={(e) => setManualTotalAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none text-emerald-900 font-extrabold text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Notes / Shift Details (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Shift notes, dispenser reading details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:outline-none text-slate-900"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {editingSale ? 'Save Changes' : 'Record Sale & Deduct Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Download PDF Report Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <span className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <Download className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Generate Fuel Sales PDF</h3>
                  <p className="text-xs text-slate-500">Official Bahu Petroleum Fuel Report</p>
                </div>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-2">Report Frequency Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfReportType('MONTHLY')}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                      pdfReportType === 'MONTHLY'
                        ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Monthly Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfReportType('YEARLY')}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold transition-all ${
                      pdfReportType === 'YEARLY'
                        ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Yearly Report
                  </button>
                </div>
              </div>

              {pdfReportType === 'MONTHLY' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Select Month</label>
                  <select
                    value={pdfSelectedMonth}
                    onChange={(e) => setPdfSelectedMonth(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:outline-none text-slate-900 font-medium"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                      <option key={m} value={idx}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Year</label>
                <select
                  value={pdfSelectedYear}
                  onChange={(e) => setPdfSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-red-500 focus:outline-none text-slate-900 font-medium"
                >
                  {[2024, 2025, 2026, 2027].map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                📄 The generated PDF includes complete company branding, Fuel Sales entry details, Total Litres Sold, Sales Revenue, Purchase Cost, Gross Profit, Fuel Type breakdown, and Tank-wise breakdown.
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
