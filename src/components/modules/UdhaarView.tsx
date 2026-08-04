import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UdhaarCustomer, UdhaarTransaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { PDFExportButton } from '../common/PDFExportButton';
import { AdminDeleteButton } from '../common/AdminDeleteButton';
import { exportCustomerLedgerPDF } from '../../utils/moduleReportExporter';
import {
  Users,
  Plus,
  Search,
  Phone,
  Truck,
  CreditCard,
  DollarSign,
  X,
  History,
  Edit,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  MapPin,
  AlertCircle,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';

export const UdhaarView: React.FC = () => {
  const {
    udhaarCustomers,
    addUdhaarCustomer,
    updateUdhaarCustomer,
    addUdhaarTransaction,
    editUdhaarTransaction,
    deleteUdhaarCustomer,
    deleteUdhaarTransaction,
    canDelete,
    canEdit,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isEditTxModalOpen, setIsEditTxModalOpen] = useState(false);

  // Selected customer & transaction references
  const [selectedCust, setSelectedCust] = useState<UdhaarCustomer | null>(null);
  const [selectedTx, setSelectedTx] = useState<UdhaarTransaction | null>(null);

  // Add Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(300000);
  const [initialCredit, setInitialCredit] = useState<number>(0);

  // Add Credit Transaction Form State
  const [creditAmount, setCreditAmount] = useState<number>(0);
  const [creditDesc, setCreditDesc] = useState('Fuel Credit Purchase');
  const [creditVehicle, setCreditVehicle] = useState('');
  const [creditDate, setCreditDate] = useState(new Date().toISOString().slice(0, 10));
  const [creditTime, setCreditTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Receive Payment Transaction Form State
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDesc, setPaymentDesc] = useState('Cash Payment Received');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentTime, setPaymentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Edit Transaction Form State
  const [editTxAmount, setEditTxAmount] = useState<number>(0);
  const [editTxDesc, setEditTxDesc] = useState('');
  const [editTxVehicle, setEditTxVehicle] = useState('');
  const [editTxDate, setEditTxDate] = useState('');
  const [editTxTime, setEditTxTime] = useState('');

  // Open Handlers
  const openAddCustomerModal = () => {
    setCustomerName('');
    setInitialCredit(0);
    setIsAddCustomerModalOpen(true);
  };

  const openEditCustomerModal = (cust: UdhaarCustomer) => {
    setSelectedCust(cust);
    setCustomerName(cust.customerName || cust.name || '');
    setPhoneNumber(cust.phoneNumber || '');
    setVehicleNumber(cust.vehicleNumber || '');
    setAddress(cust.address || '');
    setCreditLimit(cust.creditLimit || 0);
    setIsEditCustomerModalOpen(true);
  };

  const openAddCreditModal = (cust: UdhaarCustomer) => {
    setSelectedCust(cust);
    setCreditAmount(25000);
    setCreditDesc('Fuel Refill Credit');
    setCreditVehicle(cust.vehicleNumber || '');
    setCreditDate(new Date().toISOString().slice(0, 10));
    setCreditTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsAddCreditModalOpen(true);
  };

  const openReceivePaymentModal = (cust: UdhaarCustomer) => {
    setSelectedCust(cust);
    setPaymentAmount(Math.min(20000, cust.remainingBalance > 0 ? cust.remainingBalance : 20000));
    setPaymentDesc('Cash Payment Received');
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsReceivePaymentModalOpen(true);
  };

  const openLedgerModal = (cust: UdhaarCustomer) => {
    setSelectedCust(cust);
    setIsLedgerModalOpen(true);
  };

  const openEditTxModal = (cust: UdhaarCustomer, tx: UdhaarTransaction) => {
    setSelectedCust(cust);
    setSelectedTx(tx);
    setEditTxAmount(tx.amount);
    setEditTxDesc(tx.description);
    setEditTxVehicle(tx.vehicleNumber || '');
    setEditTxDate(tx.date);
    setEditTxTime(tx.time || '12:00 PM');
    setIsEditTxModalOpen(true);
  };

  // Submit Handlers
  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = customerName.trim();
    if (!trimmedName) return;

    // Check if customer with same name already exists
    const existing = udhaarCustomers.find(
      c => (c.customerName || c.name || '').toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      alert(`Customer profile for "${trimmedName}" already exists! Opening existing customer profile.`);
      setIsAddCustomerModalOpen(false);
      openAddCreditModal(existing);
      return;
    }

    addUdhaarCustomer({
      customerName: trimmedName,
      name: trimmedName,
      phoneNumber: '',
      vehicleNumber: '',
      address: '',
      creditLimit: 0,
      totalCredit: initialCredit || 0,
      paymentReceived: 0,
      notes: 'Customer account created',
    });
    setIsAddCustomerModalOpen(false);
  };

  const handleEditCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCust && customerName.trim()) {
      updateUdhaarCustomer(selectedCust.id, {
        customerName: customerName.trim(),
        name: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        vehicleNumber: vehicleNumber.trim(),
        address: address.trim(),
        creditLimit: creditLimit || 0,
      });
    }
    setIsEditCustomerModalOpen(false);
  };

  const handleAddCreditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCust && creditAmount > 0) {
      addUdhaarTransaction(
        selectedCust.id,
        'CREDIT_PURCHASE',
        creditAmount,
        creditDesc,
        creditVehicle,
        creditDate,
        creditTime
      );
      // Refresh current selectedCust from list
      const updated = udhaarCustomers.find(c => c.id === selectedCust.id);
      if (updated) setSelectedCust(updated);
    }
    setIsAddCreditModalOpen(false);
  };

  const handleReceivePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCust && paymentAmount > 0) {
      addUdhaarTransaction(
        selectedCust.id,
        'PAYMENT_RECEIVED',
        paymentAmount,
        paymentDesc,
        '',
        paymentDate,
        paymentTime
      );
      const updated = udhaarCustomers.find(c => c.id === selectedCust.id);
      if (updated) setSelectedCust(updated);
    }
    setIsReceivePaymentModalOpen(false);
  };

  const handleEditTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCust && selectedTx && editTxAmount > 0) {
      editUdhaarTransaction(selectedCust.id, selectedTx.id, {
        amount: editTxAmount,
        description: editTxDesc,
        vehicleNumber: editTxVehicle,
        date: editTxDate,
        time: editTxTime,
      });
      const updated = udhaarCustomers.find(c => c.id === selectedCust.id);
      if (updated) setSelectedCust(updated);
    }
    setIsEditTxModalOpen(false);
  };

  // Filtering by Name or Mobile Number or Vehicle
  const filteredCustomers = udhaarCustomers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameStr = (c.customerName || c.name || '').toLowerCase();
    const phoneStr = (c.phoneNumber || '').toLowerCase();
    const vehicleStr = (c.vehicleNumber || '').toLowerCase();
    return nameStr.includes(q) || phoneStr.includes(q) || vehicleStr.includes(q);
  });

  // Global Udhaar Metrics
  const totalAccounts = udhaarCustomers.length;
  const totalOutstandingBalance = udhaarCustomers.reduce((sum, c) => sum + (c.remainingBalance || 0), 0);
  const totalCreditGiven = udhaarCustomers.reduce((sum, c) => sum + (c.totalCredit || 0), 0);
  const totalPaymentsReceived = udhaarCustomers.reduce((sum, c) => sum + (c.paymentReceived || 0), 0);

  // Get current active customer in modal from updated state
  const activeCustomer = selectedCust ? udhaarCustomers.find(c => c.id === selectedCust.id) || selectedCust : null;

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Main Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Credit Customer Ledger (Udhaar Register)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Maintain single customer ledger accounts, track outstanding balance, add fuel credit & receive payments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <PDFExportButton moduleKey="CREDIT_CUSTOMERS" buttonLabel="📄 Export Udhaar PDF" variant="secondary" />
          <button
            onClick={openAddCustomerModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Credit Customer
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Credit Accounts</p>
          <p className="text-lg font-black text-slate-900 mt-1">{totalAccounts} Customers</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Total Outstanding Balance</p>
          <p className="text-lg font-black text-red-600 mt-1">{formatCurrency(totalOutstandingBalance)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Total Fuel Credit Given</p>
          <p className="text-lg font-black text-rose-800 mt-1">{formatCurrency(totalCreditGiven)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Payments Received</p>
          <p className="text-lg font-black text-emerald-700 mt-1">{formatCurrency(totalPaymentsReceived)}</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search credit customers by full name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
          />
        </div>
      </div>

      {/* Customer Ledger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No credit customer accounts found</p>
            <p className="text-xs text-slate-400">Try searching with a different name or click "Add Credit Customer".</p>
          </div>
        ) : (
          filteredCustomers.map(cust => {
            const isOverLimit = cust.creditLimit > 0 && cust.remainingBalance > cust.creditLimit;
            const displayName = cust.customerName || cust.name || 'Credit Customer';

            return (
              <div
                key={cust.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base">{displayName}</h3>
                      {isOverLimit && (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Over Limit
                        </span>
                      )}
                    </div>
                    {(cust.phoneNumber || cust.vehicleNumber) && (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        {cust.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-700">{cust.phoneNumber}</span>
                          </div>
                        )}
                        {cust.vehicleNumber && (
                          <div className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span>{cust.vehicleNumber}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Outstanding Credit</p>
                    <p className={`text-lg font-black ${isOverLimit ? 'text-red-600' : 'text-slate-900'}`}>
                      {formatCurrency(cust.remainingBalance)}
                    </p>
                  </div>
                </div>

                {/* Ledger Financial Summary Bar */}
                <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Outstanding</p>
                    <p className="font-black text-slate-900 mt-0.5">{formatCurrency(cust.remainingBalance || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-rose-600 uppercase">Total Credit Given</p>
                    <p className="font-bold text-rose-800 mt-0.5">{formatCurrency(cust.totalCredit || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Total Payments Received</p>
                    <p className="font-bold text-emerald-800 mt-0.5">{formatCurrency(cust.paymentReceived || 0)}</p>
                  </div>
                </div>

                {/* Customer Address if exists */}
                {cust.address && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{cust.address}</span>
                  </div>
                )}

                {/* Action Buttons Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddCreditModal(cust)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Credit
                    </button>
                    <button
                      onClick={() => openReceivePaymentModal(cust)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Receive Payment
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openLedgerModal(cust)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title="View Full Ledger History"
                    >
                      <History className="w-3.5 h-3.5" /> Ledger
                    </button>
                    <button
                      onClick={() => exportCustomerLedgerPDF(cust)}
                      className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-all cursor-pointer"
                      title="Export Customer Statement PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {canEdit && (
                      <button
                        onClick={() => openEditCustomerModal(cust)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                        title="Edit Customer Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {canDelete && (
                      <AdminDeleteButton
                        onDelete={() => deleteUdhaarCustomer(cust.id)}
                        itemName={displayName}
                        message={`Are you sure you want to permanently delete "${displayName}"? This will delete the customer and all associated credit ledger records.`}
                        variant="icon"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Add New Credit Customer Profile */}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-red-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Add New Credit Customer</h3>
              </div>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                  placeholder="Enter customer full name (e.g. Ahmed Ali)"
                  className="w-full p-3 rounded-2xl border border-slate-300 text-sm font-semibold outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Credit Amount (PKR) *</label>
                <input
                  type="number"
                  value={initialCredit}
                  onChange={e => setInitialCredit(Number(e.target.value))}
                  min={0}
                  required
                  placeholder="0"
                  className="w-full p-3 rounded-2xl border border-slate-300 text-sm font-bold text-slate-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Customer Profile */}
      {isEditCustomerModalOpen && selectedCust && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-800 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Edit Customer Profile</h3>
              </div>
              <button
                onClick={() => setIsEditCustomerModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditCustomerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                  className="w-full p-3 rounded-2xl border border-slate-300 text-sm font-semibold outline-none focus:border-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditCustomerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Fuel Credit Transaction */}
      {isAddCreditModalOpen && selectedCust && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-rose-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Add Fuel Credit Transaction</h3>
              </div>
              <button
                onClick={() => setIsAddCreditModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCreditSubmit} className="p-6 space-y-4">
              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-rose-600 uppercase">Customer Profile</p>
                  <p className="font-extrabold text-slate-900 text-sm">{selectedCust.customerName || selectedCust.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Current Outstanding</p>
                  <p className="font-black text-rose-700 text-sm">{formatCurrency(selectedCust.remainingBalance)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Transaction Date</label>
                  <input
                    type="date"
                    value={creditDate}
                    onChange={e => setCreditDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-rose-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Transaction Time</label>
                  <input
                    type="text"
                    value={creditTime}
                    onChange={e => setCreditTime(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Credit Amount (PKR) *</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={e => setCreditAmount(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-extrabold text-rose-700 outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Number (Optional)</label>
                <input
                  type="text"
                  value={creditVehicle}
                  onChange={e => setCreditVehicle(e.target.value)}
                  placeholder="e.g. LES-1022"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Fuel Type</label>
                <input
                  type="text"
                  value={creditDesc}
                  onChange={e => setCreditDesc(e.target.value)}
                  placeholder="e.g. 50 Liters Diesel Refill"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-rose-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Previous Balance:</span>
                  <span>{formatCurrency(selectedCust.remainingBalance)}</span>
                </div>
                <div className="flex justify-between font-medium text-rose-600">
                  <span>New Credit Added:</span>
                  <span>+ {formatCurrency(creditAmount)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-1 text-sm">
                  <span>New Outstanding Balance:</span>
                  <span className="text-rose-700">{formatCurrency(selectedCust.remainingBalance + creditAmount)}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCreditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Add Credit & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Receive Payment Transaction */}
      {isReceivePaymentModalOpen && selectedCust && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Receive Udhaar Payment</h3>
              </div>
              <button
                onClick={() => setIsReceivePaymentModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReceivePaymentSubmit} className="p-6 space-y-4">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Customer Profile</p>
                  <p className="font-extrabold text-slate-900 text-sm">{selectedCust.customerName || selectedCust.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Current Outstanding</p>
                  <p className="font-black text-rose-700 text-sm">{formatCurrency(selectedCust.remainingBalance)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Time</label>
                  <input
                    type="text"
                    value={paymentTime}
                    onChange={e => setPaymentTime(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Amount Received (PKR) *</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-extrabold text-emerald-700 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Payment Method / Description</label>
                <input
                  type="text"
                  value={paymentDesc}
                  onChange={e => setPaymentDesc(e.target.value)}
                  placeholder="Cash deposit, cheque, bank transfer..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-emerald-600"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Previous Balance:</span>
                  <span>{formatCurrency(selectedCust.remainingBalance)}</span>
                </div>
                <div className="flex justify-between font-medium text-emerald-600">
                  <span>Payment Received:</span>
                  <span>- {formatCurrency(paymentAmount)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-1 text-sm">
                  <span>New Remaining Balance:</span>
                  <span className="text-emerald-700">
                    {formatCurrency(Math.max(0, selectedCust.remainingBalance - paymentAmount))}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReceivePaymentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Receive Payment & Reduce Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Full Customer Ledger View */}
      {isLedgerModalOpen && activeCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Ledger Modal Header */}
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-600 text-white rounded-2xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">{activeCustomer.customerName || activeCustomer.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-0.5">
                    <span>Phone: {activeCustomer.phoneNumber || 'N/A'}</span>
                    {activeCustomer.vehicleNumber && <span>• Vehicle: {activeCustomer.vehicleNumber}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportCustomerLedgerPDF(activeCustomer)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Export Ledger PDF
                </button>
                <button
                  onClick={() => setIsLedgerModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Ledger Financial Summary Bar */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 flex-shrink-0 text-center">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Credit Limit</p>
                <p className="text-sm font-black text-slate-700 mt-0.5">{formatCurrency(activeCustomer.creditLimit || 0)}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-rose-600 uppercase">Total Credit</p>
                <p className="text-sm font-black text-rose-700 mt-0.5">{formatCurrency(activeCustomer.totalCredit || 0)}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-emerald-600 uppercase">Total Payments</p>
                <p className="text-sm font-black text-emerald-700 mt-0.5">{formatCurrency(activeCustomer.paymentReceived || 0)}</p>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-900 uppercase">Outstanding Balance</p>
                <p className="text-sm font-black text-red-600 mt-0.5">{formatCurrency(activeCustomer.remainingBalance || 0)}</p>
              </div>
            </div>

            {/* Quick Actions in Ledger */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Transaction History Log</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsLedgerModalOpen(false);
                    openAddCreditModal(activeCustomer);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Credit
                </button>
                <button
                  onClick={() => {
                    setIsLedgerModalOpen(false);
                    openReceivePaymentModal(activeCustomer);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Receive Payment
                </button>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-grow">
              {!activeCustomer.transactions || activeCustomer.transactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <History className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No transactions recorded yet for this customer.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-extrabold text-[11px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3">Date & Time</th>
                        <th className="p-3">Description / Vehicle</th>
                        <th className="p-3 text-right">Credit Added</th>
                        <th className="p-3 text-right">Payment Received</th>
                        <th className="p-3 text-right">Running Balance</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {activeCustomer.transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 whitespace-nowrap">
                            <div className="font-bold text-slate-900">{formatDate(tx.date)}</div>
                            <div className="text-[10px] text-slate-400">{tx.time || '12:00 PM'}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{tx.description || '-'}</div>
                            {tx.vehicleNumber && <div className="text-[10px] text-blue-600 font-bold">{tx.vehicleNumber}</div>}
                          </td>
                          <td className="p-3 text-right font-extrabold text-rose-700 whitespace-nowrap">
                            {tx.type === 'CREDIT_PURCHASE' ? formatCurrency(tx.amount) : '-'}
                          </td>
                          <td className="p-3 text-right font-extrabold text-emerald-700 whitespace-nowrap">
                            {tx.type === 'PAYMENT_RECEIVED' ? formatCurrency(tx.amount) : '-'}
                          </td>
                          <td className="p-3 text-right font-black text-slate-900 whitespace-nowrap">
                            {formatCurrency(tx.runningBalance !== undefined ? tx.runningBalance : tx.amount)}
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {canEdit && (
                                <button
                                  onClick={() => openEditTxModal(activeCustomer, tx)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                                  title="Edit Transaction"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {canDelete && (
                                <AdminDeleteButton
                                  onDelete={() => {
                                    deleteUdhaarTransaction(activeCustomer.id, tx.id);
                                    const updated = udhaarCustomers.find(c => c.id === activeCustomer.id);
                                    if (updated) setSelectedCust(updated);
                                  }}
                                  variant="small-icon"
                                  itemName={`Transaction ${formatCurrency(tx.amount)}`}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Edit Transaction (Admin Only) */}
      {isEditTxModalOpen && selectedCust && selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-800 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Edit Credit Transaction</h3>
              </div>
              <button
                onClick={() => setIsEditTxModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditTxSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={editTxDate}
                    onChange={e => setEditTxDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Time</label>
                  <input
                    type="text"
                    value={editTxTime}
                    onChange={e => setEditTxTime(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Transaction Amount (PKR) *</label>
                <input
                  type="number"
                  value={editTxAmount}
                  onChange={e => setEditTxAmount(Number(e.target.value))}
                  min={1}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-extrabold outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Number</label>
                <input
                  type="text"
                  value={editTxVehicle}
                  onChange={e => setEditTxVehicle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={editTxDesc}
                  onChange={e => setEditTxDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditTxModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Update Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
