import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UdhaarCustomer } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { PDFExportButton } from '../common/PDFExportButton';
import { Users, Plus, Search, Phone, Truck, CreditCard, DollarSign, X, History, ChevronRight } from 'lucide-react';

export const UdhaarView: React.FC = () => {
  const { udhaarCustomers, addUdhaarCustomer, addUdhaarTransaction } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCust, setSelectedCust] = useState<UdhaarCustomer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('0300-1234567');
  const [vehicleNumber, setVehicleNumber] = useState('LES-1022');
  const [address, setAddress] = useState('Multan Road Terminal, Lahore');
  const [creditLimit, setCreditLimit] = useState<number>(300000);
  const [totalCredit, setTotalCredit] = useState<number>(50000);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(20000);
  const [paymentDesc, setPaymentDesc] = useState('Cash payment received');

  const openAddModal = () => {
    setCustomerName('Daewoo Bus Fleet');
    setPhoneNumber('0321-8890123');
    setVehicleNumber('LHR-9902 (10 Buses)');
    setAddress('Thokar Niaz Baig Terminal, Lahore');
    setCreditLimit(500000);
    setTotalCredit(100000);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUdhaarCustomer({
      customerName,
      phoneNumber,
      vehicleNumber,
      address,
      creditLimit,
      totalCredit,
      paymentReceived: 0,
      notes: 'New credit customer account',
    });
    setIsAddModalOpen(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCust && paymentAmount > 0) {
      addUdhaarTransaction(selectedCust.id, 'PAYMENT_RECEIVED', paymentAmount, paymentDesc);
    }
    setIsPaymentModalOpen(false);
  };

  const filtered = udhaarCustomers.filter(
    c =>
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery)
  );

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Credit Customers (Udhaar Register)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage commercial vehicle fleets, local credit accounts, and track remaining balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Udhaar Customer
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, vehicle number, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(cust => {
          const isOverLimit = cust.remainingBalance > cust.creditLimit;
          return (
            <div key={cust.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{cust.customerName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{cust.vehicleNumber}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Remaining Balance</p>
                  <p className={`text-base font-black ${isOverLimit ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatCurrency(cust.remainingBalance)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Credit Limit</p>
                  <p className="font-bold text-slate-700 mt-0.5">{formatCurrency(cust.creditLimit)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-red-600 uppercase">Total Credit</p>
                  <p className="font-bold text-red-800 mt-0.5">{formatCurrency(cust.totalCredit)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Received</p>
                  <p className="font-bold text-emerald-800 mt-0.5">{formatCurrency(cust.paymentReceived)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 font-medium">Phone: {cust.phoneNumber}</span>
                <button
                  onClick={() => {
                    setSelectedCust(cust);
                    setIsPaymentModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Receive Udhaar Payment
                </button>
              </div>

              {/* Transactions History */}
              {cust.transactions && cust.transactions.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Recent Ledger Activity</p>
                  <div className="space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
                    {cust.transactions.map(tx => (
                      <div
                        key={tx.id}
                        className={`flex items-center justify-between text-xs p-2 rounded-lg border ${
                          tx.type === 'CREDIT_PURCHASE'
                            ? 'bg-rose-50 border-rose-100 text-rose-900'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-900'
                        }`}
                      >
                        <div>
                          <span className="font-bold">{formatCurrency(tx.amount)}</span>
                          <span className="text-[11px] ml-2 font-medium">{tx.description}</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-mono">{formatDate(tx.date)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-red-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">Add Udhaar Credit Customer</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer / Fleet Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                  placeholder="Al-Rehman Goods Transport"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    required
                    placeholder="0300-1234567"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                    required
                    placeholder="LES-9922"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Credit Limit (Rs)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Initial Udhaar Balance</label>
                  <input
                    type="number"
                    value={totalCredit}
                    onChange={e => setTotalCredit(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                Create Credit Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {isPaymentModalOpen && selectedCust && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">Receive Udhaar Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 rounded bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <p className="text-xs font-bold text-slate-800">{selectedCust.customerName}</p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Amount Received (Rs)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method / Notes</label>
                <input
                  type="text"
                  value={paymentDesc}
                  onChange={e => setPaymentDesc(e.target.value)}
                  placeholder="Cash, cheque deposit..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
              >
                Deposit & Reduce Balance
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
