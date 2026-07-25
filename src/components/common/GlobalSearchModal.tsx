import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, Truck, Gauge, Package, Users, Receipt, Building2, UserCheck, ChevronRight, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    deliveries,
    machineSales,
    lubricants,
    workers,
    udhaarCustomers,
    expenses,
    bankAccounts,
    dailySalesEntries,
    setCurrentView,
  } = useApp();

  if (!isSearchOpen) return null;

  const query = searchQuery.toLowerCase().trim();

  const filteredDeliveries = query
    ? (deliveries || []).filter(
        d =>
          (d.supplierName || '').toLowerCase().includes(query) ||
          (d.invoiceNumber || '').toLowerCase().includes(query) ||
          (d.vehicleNumber || '').toLowerCase().includes(query) ||
          (d.driverName || '').toLowerCase().includes(query)
      )
    : [];

  const filteredSales = query
    ? (machineSales || []).filter(
        s =>
          (s.machineName || '').toLowerCase().includes(query) ||
          (s.operatorName || '').toLowerCase().includes(query) ||
          (s.shift || '').toLowerCase().includes(query)
      )
    : [];

  const filteredLubs = query
    ? (lubricants || []).filter(
        l =>
          (l.productName || '').toLowerCase().includes(query) ||
          (l.brand || '').toLowerCase().includes(query) ||
          (l.barcode || '').includes(query)
      )
    : [];

  const filteredWorkers = query
    ? (workers || []).filter(
        w =>
          (w.name || '').toLowerCase().includes(query) ||
          (w.cnic || '').includes(query) ||
          (w.phoneNumber || '').includes(query) ||
          (w.designation || '').toLowerCase().includes(query)
      )
    : [];

  const filteredCustomers = query
    ? (udhaarCustomers || []).filter(
        c =>
          (c.customerName || '').toLowerCase().includes(query) ||
          (c.vehicleNumber || '').toLowerCase().includes(query) ||
          (c.phoneNumber || '').includes(query)
      )
    : [];

  const filteredExpenses = query
    ? (expenses || []).filter(
        e =>
          (e.title || '').toLowerCase().includes(query) ||
          (e.category || '').toLowerCase().includes(query) ||
          (e.description || '').toLowerCase().includes(query)
      )
    : [];

  const filteredDailySales = query
    ? (dailySalesEntries || []).filter(
        ds =>
          (ds.section || '').toLowerCase().includes(query) ||
          (ds.date || '').includes(query) ||
          (ds.notes || '').toLowerCase().includes(query)
      )
    : [];

  const totalResults =
    filteredDeliveries.length +
    filteredSales.length +
    filteredLubs.length +
    filteredWorkers.length +
    filteredCustomers.length +
    filteredExpenses.length +
    filteredDailySales.length;

  const navigateTo = (view: string) => {
    setCurrentView(view);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-20">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search workers, customers, invoices, expenses, lubricants, sales..."
            autoFocus
            className="w-full bg-transparent text-slate-900 font-medium text-sm sm:text-base outline-none placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-700 bg-slate-200 px-2 py-1 rounded-md"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar space-y-4">
          {!query && (
            <div className="text-center py-8 text-slate-400 text-sm">
              Type anything to search across Bahu Petroleum database records.
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No matching records found for "{query}".
            </div>
          )}

          {/* Deliveries */}
          {filteredDeliveries.length > 0 && (
            <div>
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" /> Fuel Deliveries ({filteredDeliveries.length})
              </div>
              <div className="space-y-1.5">
                {filteredDeliveries.map(d => (
                  <div
                    key={d.id}
                    onClick={() => navigateTo('deliveries')}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 bg-slate-50/80 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{d.supplierName}</p>
                      <p className="text-[11px] text-slate-500">
                        Inv: {d.invoiceNumber} • Vehicle: {d.vehicleNumber} • {d.totalLitersReceived} L
                      </p>
                    </div>
                    <span className="font-extrabold text-blue-900 text-xs">{formatCurrency(d.totalPurchaseAmount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workers */}
          {filteredWorkers.length > 0 && (
            <div>
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Workers ({filteredWorkers.length})
              </div>
              <div className="space-y-1.5">
                {filteredWorkers.map(w => (
                  <div
                    key={w.id}
                    onClick={() => navigateTo('workers')}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 bg-slate-50/80 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{w.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {w.designation} • CNIC: {w.cnic} • {w.phoneNumber}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{formatCurrency(w.monthlySalary)}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div>
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Udhaar Customers ({filteredCustomers.length})
              </div>
              <div className="space-y-1.5">
                {filteredCustomers.map(c => (
                  <div
                    key={c.id}
                    onClick={() => navigateTo('customers')}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 bg-slate-50/80 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{c.customerName}</p>
                      <p className="text-[11px] text-slate-500">
                        Vehicle: {c.vehicleNumber} • Phone: {c.phoneNumber}
                      </p>
                    </div>
                    <span className="font-bold text-red-600 text-xs">Bal: {formatCurrency(c.remainingBalance)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Sales Entry Results */}
          {filteredDailySales.length > 0 && (
            <div>
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" /> Daily Sales Entries ({filteredDailySales.length})
              </div>
              <div className="space-y-1.5">
                {filteredDailySales.map(ds => {
                  const getSectionViewKey = (sec: string) => {
                    switch (sec) {
                      case 'Tyre Shop': return 'tyre_shop';
                      case 'Car Wash': return 'car_wash';
                      case 'Fast Food': return 'restaurant';
                      case 'Tuck Shop': return 'tuck_shop';
                      case 'Lubricants': return 'lubricants';
                      case 'Credit Card': return 'credit_card';
                      case 'Infinity Card': return 'infini_card';
                      case 'Daily Petrol Cash': return 'daily_petrol_cash';
                      default: return 'dashboard';
                    }
                  };
                  return (
                    <div
                      key={ds.id}
                      onClick={() => navigateTo(getSectionViewKey(ds.section))}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 bg-slate-50/80 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{ds.section}</p>
                        <p className="text-[11px] text-slate-500">Date: {ds.date} {ds.notes ? `• ${ds.notes}` : ''}</p>
                      </div>
                      <span className="font-bold text-blue-900 text-xs">Rs. {ds.totalSales.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expenses */}
          {filteredExpenses.length > 0 && (
            <div>
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-blue-600" /> Expenses ({filteredExpenses.length})
              </div>
              <div className="space-y-1.5">
                {filteredExpenses.map(e => (
                  <div
                    key={e.id}
                    onClick={() => navigateTo('expenses')}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 bg-slate-50/80 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{e.title}</p>
                      <p className="text-[11px] text-slate-500">Category: {e.category} • Date: {e.date}</p>
                    </div>
                    <span className="font-bold text-amber-600 text-xs">{formatCurrency(e.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lubricants */}
          {filteredLubs.length > 0 && (
            <div>
              <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-600" /> Lubricants ({filteredLubs.length})
              </div>
              <div className="space-y-1.5">
                {filteredLubs.map(l => (
                  <div
                    key={l.id}
                    onClick={() => navigateTo('lubricants')}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-blue-300 bg-slate-50/80 hover:bg-blue-50 cursor-pointer flex items-center justify-between transition-all"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{l.productName}</p>
                      <p className="text-[11px] text-slate-500">
                        Brand: {l.brand} • Stock: {l.remainingStock} units
                      </p>
                    </div>
                    <span className="font-bold text-slate-800 text-xs">{formatCurrency(l.sellingPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
