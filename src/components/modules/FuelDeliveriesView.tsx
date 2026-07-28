import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FuelDelivery, FuelType } from '../../types';
import { formatCurrency, formatLiters, formatDate } from '../../utils/formatters';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { PermissionNotice } from '../common/PermissionNotice';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  Truck,
  Plus,
  Search,
  FileSpreadsheet,
  FileText,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  Calendar,
  User,
  Hash,
  Gauge,
  Info,
  ShieldAlert,
  ArrowDownRight,
} from 'lucide-react';

export const FuelDeliveriesView: React.FC = () => {
  const { deliveries, addDelivery, deleteDelivery, tanks, canDelete, currentUser } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [deliveryToDelete, setDeliveryToDelete] = useState<string | null>(null);

  // Form State
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryTime, setDeliveryTime] = useState('11:00 AM');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [petrolLiters, setPetrolLiters] = useState<number>(10000);
  const [dieselLiters, setDieselLiters] = useState<number>(0);
  const [supplierName, setSupplierName] = useState('Pakistan State Oil (PSO)');
  const [invoiceNumber, setInvoiceNumber] = useState(`PSO-INV-${Math.floor(10000 + Math.random() * 90000)}`);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [purchaseRatePetrol, setPurchaseRatePetrol] = useState<number>(265.5);
  const [purchaseRateDiesel, setPurchaseRateDiesel] = useState<number>(278.0);
  const [tankId, setTankId] = useState<string>(tanks[0]?.id || '');
  const [receivedByWorker, setReceivedByWorker] = useState(currentUser?.name || '');
  const [notes, setNotes] = useState('');

  // Dip Measurement Verification
  const [expectedDip, setExpectedDip] = useState<number>(174);
  const [actualDip, setActualDip] = useState<number>(174);

  // Dip Calculation
  const dipDifference = actualDip - expectedDip;
  const shortageDip = dipDifference < 0 ? dipDifference : 0; // Only negative values represent shortage
  const estimatedShortageLiters = Math.abs(shortageDip) * 50; // Approx 50L per dip unit

  const totalReceived = fuelType === 'Petrol' ? petrolLiters : fuelType === 'Diesel' ? dieselLiters : petrolLiters + dieselLiters;
  const totalPurchaseAmount =
    fuelType === 'Petrol'
      ? petrolLiters * purchaseRatePetrol
      : fuelType === 'Diesel'
      ? dieselLiters * purchaseRateDiesel
      : petrolLiters * purchaseRatePetrol + dieselLiters * purchaseRateDiesel;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTank = tanks.find(t => t.id === tankId);

    addDelivery({
      deliveryDate,
      deliveryTime,
      fuelType,
      petrolLiters: fuelType === 'Diesel' ? 0 : petrolLiters,
      dieselLiters: fuelType === 'Petrol' ? 0 : dieselLiters,
      supplierName,
      invoiceNumber,
      vehicleNumber,
      driverName,
      totalLitersReceived: totalReceived,
      purchaseRatePetrol: fuelType === 'Diesel' ? 0 : purchaseRatePetrol,
      purchaseRateDiesel: fuelType === 'Petrol' ? 0 : purchaseRateDiesel,
      totalPurchaseAmount,
      tankId,
      tankName: selectedTank?.tankName || 'Main Tank',
      expectedDip,
      actualDip,
      dipDifference,
      shortageDip,
      shortageLiters: estimatedShortageLiters,
      receivedByWorker,
      adminApprovalStatus: shortageDip < 0 ? 'Pending' : 'Approved',
      notes,
    });
    setIsAddModalOpen(false);
  };

  // Filtered Deliveries
  const filtered = deliveries.filter(d => {
    const matchesSearch =
      d.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.vehicleNumber && d.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.driverName && d.driverName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'ALL' || d.fuelType === filterType;
    return matchesSearch && matchesType;
  });

  const totalShortagesCount = deliveries.filter(d => (d.shortageDip || 0) < 0).length;

  const handleExportPDF = () => {
    const headers = ['Date', 'Supplier', 'Invoice', 'Fuel Type', 'Quantity', 'Expected Dip', 'Actual Dip', 'Shortage', 'Total Cost'];
    const rows = filtered.map(d => [
      d.deliveryDate,
      d.supplierName,
      d.invoiceNumber,
      d.fuelType,
      `${d.totalLitersReceived} L`,
      `${d.expectedDip ?? '-'}`,
      `${d.actualDip ?? '-'}`,
      d.shortageDip && d.shortageDip < 0 ? `${d.shortageDip} Dip (${d.shortageLiters} L)` : 'No Shortage',
      `Rs.${d.totalPurchaseAmount}`,
    ]);
    exportToPDF('Bahu Petroleum - Fuel Delivery Verification Audit Report', headers, rows, 'Fuel_Deliveries_Shortage_Report');
  };

  const handleExportExcel = () => {
    exportToExcel(filtered, 'Fuel_Deliveries_Dip_Audit_Bahu_Petroleum');
  };

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Fuel Delivery Verification & Shortage Audit</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Log fuel shipments with mandatory Expected vs. Actual Dip readings & auto-calculated shortages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4 text-red-600" /> Export Shortage PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Excel
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Verify & Log Delivery
          </button>
        </div>
      </div>

      {/* Dip Verification Shortage Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Deliveries Logged</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{deliveries.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-900 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Shortages Detected</p>
            <p className="text-2xl font-black text-red-600 mt-1">{totalShortagesCount} Deliveries</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Verification Standard</p>
            <p className="text-sm font-extrabold text-emerald-700 mt-1">OGRA Dip Calibration</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Gauge className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by supplier name, invoice, vehicle, or driver..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-red-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Filter:</span>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="ALL">All Fuel Types</option>
            <option value="Petrol">Super Petrol</option>
            <option value="Diesel">High Speed Diesel</option>
          </select>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2">
            <Truck className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
            <p className="font-bold text-slate-700 text-base">No Fuel Deliveries Recorded Yet</p>
            <p className="text-xs text-slate-400">
              Click <span className="font-bold text-red-600">"Verify & Log Delivery"</span> above to log your first shipment with Dip measurement.
            </p>
          </div>
        ) : (
          filtered.map(del => {
            const hasShortage = (del.shortageDip || 0) < 0;

            return (
              <div
                key={del.id}
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  hasShortage ? 'border-red-300 ring-2 ring-red-500/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-blue-900 text-white">
                      {del.fuelType}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">{del.supplierName}</h3>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Invoice: {del.invoiceNumber}
                    </span>
                    {hasShortage ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> SHORTAGE DETECTED ({del.shortageDip} Dip)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> NO SHORTAGE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Date & Time</p>
                      <p className="font-bold text-slate-800">{del.deliveryDate} ({del.deliveryTime})</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Volume Delivered</p>
                      <p className="font-extrabold text-slate-900">{formatLiters(del.totalLitersReceived)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Expected Dip</p>
                      <p className="font-bold text-slate-700">{del.expectedDip ?? '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Actual Dip</p>
                      <p className={`font-black ${hasShortage ? 'text-red-600' : 'text-emerald-700'}`}>
                        {del.actualDip ?? '-'}
                      </p>
                    </div>
                  </div>

                  {del.notes && (
                    <p className="text-xs text-slate-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                      Note: {del.notes}
                    </p>
                  )}
                </div>

                <div className="flex lg:flex-col items-end justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-5 gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Total Invoice Cost</p>
                    <p className="text-lg font-black text-red-600">{formatCurrency(del.totalPurchaseAmount)}</p>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => setDeliveryToDelete(del.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white text-slate-500 transition-all cursor-pointer"
                      title="Delete Delivery Log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Verify Delivery Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="bg-blue-900 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Fuel Delivery Verification Form</h3>
                <p className="text-xs text-blue-200">Log incoming tanker delivery with mandatory Dip Verification.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Time</label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={e => setDeliveryTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as FuelType)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-extrabold outline-none"
                  >
                    <option value="Petrol">Super Petrol</option>
                    <option value="Diesel">High Speed Diesel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quantity (Litres)</label>
                  <input
                    type="number"
                    value={fuelType === 'Petrol' ? petrolLiters : dieselLiters}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (fuelType === 'Petrol') setPetrolLiters(val);
                      else setDieselLiters(val);
                    }}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    placeholder="Pakistan State Oil (PSO)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
              </div>

              {/* DIP MEASUREMENT VERIFICATION CARD */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Gauge className="w-5 h-5 text-red-500" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-red-400">
                    Dip Measurement Verification
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                      Expected Dip (Before Delivery)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={expectedDip}
                      onChange={e => setExpectedDip(Number(e.target.value))}
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-black outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                      Actual Dip (After Delivery)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={actualDip}
                      onChange={e => setActualDip(Number(e.target.value))}
                      required
                      className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-black outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Auto Calculated Shortage Display */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Dip Difference</p>
                    <p className={`font-black text-sm mt-0.5 ${shortageDip < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {dipDifference === 0 ? 'No Difference (0)' : `${dipDifference} Dip`}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Calculated Shortage</p>
                    <p className={`font-black text-sm mt-0.5 ${shortageDip < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {shortageDip < 0 ? `${shortageDip} Dip (~${estimatedShortageLiters} Litres Short)` : 'No Shortage (0)'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Tank</label>
                  <select
                    value={tankId}
                    onChange={e => setTankId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                  >
                    {tanks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.tankName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all mt-4"
              >
                Confirm Dip Verification & Save Delivery Log
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Delivery Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deliveryToDelete !== null}
        title="Permanently Delete Fuel Delivery Log"
        message="Are you sure you want to permanently delete this fuel delivery shipment record? This action cannot be undone."
        onConfirm={() => {
          if (deliveryToDelete) {
            deleteDelivery(deliveryToDelete);
            setDeliveryToDelete(null);
          }
        }}
        onCancel={() => setDeliveryToDelete(null)}
      />
    </div>
  );
};
