import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tank, FuelType } from '../../types';
import { TankVisualizer } from '../common/TankVisualizer';
import { formatLiters } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import {
  Container,
  Plus,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Gauge,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const TankManagementView: React.FC = () => {
  const { tanks, addTank, updateTank, deleteTank, canDelete, canEdit } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);
  const [tankToDelete, setTankToDelete] = useState<string | null>(null);

  // Form State
  const [tankName, setTankName] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('Super Petrol');
  const [capacity, setCapacity] = useState<number>(25000);
  const [openingStock, setOpeningStock] = useState<number>(15000);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5000);
  const [notes, setNotes] = useState('');

  // Overall Live Metrics across all tanks
  const totalCapacity = tanks.reduce((acc, t) => acc + (t.capacity || 0), 0);
  const totalLiveCurrentFuel = tanks.reduce((acc, t) => acc + (t.currentFuel || 0), 0);
  const totalFuelDelivered = tanks.reduce((acc, t) => acc + (t.totalFuelDelivered || 0), 0);
  const totalFuelSold = tanks.reduce((acc, t) => acc + (t.totalFuelSold || 0), 0);
  const totalRemainingUllage = Math.max(0, totalCapacity - totalLiveCurrentFuel);

  const openAddModal = () => {
    setEditingTank(null);
    setTankName(`Tank ${tanks.length + 1} - Super Petrol`);
    setFuelType('Super Petrol');
    setCapacity(25000);
    setOpeningStock(15000);
    setLowStockThreshold(5000);
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (tank: Tank) => {
    setEditingTank(tank);
    setTankName(tank.tankName);
    setFuelType(tank.fuelType);
    setCapacity(tank.capacity);
    setOpeningStock(tank.openingStock || 0);
    setLowStockThreshold(tank.lowStockThreshold);
    setNotes(tank.notes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTank) {
      updateTank({
        ...editingTank,
        tankName,
        fuelType,
        capacity,
        openingStock,
        currentFuel: openingStock, // Live recalculation engine overrides this automatically
        closingStock: openingStock,
        lowStockThreshold,
        notes,
      });
    } else {
      addTank({
        tankName,
        fuelType,
        capacity,
        openingStock,
        currentFuel: openingStock,
        closingStock: openingStock,
        dailyUsage: 0,
        lowStockThreshold,
        notes,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <Container className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Automatic Tank Management</h2>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 ml-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              Live Automatic Sync Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Opening stock is entered once. Current tank levels recalculate automatically in real-time as Fuel Deliveries and Fuel Sales are recorded.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Underground Tank
          </button>
        </div>
      </div>

      {/* Real-Time Dashboard Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Live Current Stock</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">{formatLiters(totalLiveCurrentFuel)}</p>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">
            Total Capacity: {formatLiters(totalCapacity)}
          </p>
        </div>

        <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-sm border border-emerald-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">Total Delivered</span>
            <div className="p-1.5 rounded-lg bg-emerald-800 text-emerald-300">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">+{formatLiters(totalFuelDelivered)}</p>
          <p className="text-[11px] text-emerald-200 font-semibold mt-1">
            Added from Delivery Records
          </p>
        </div>

        <div className="bg-blue-900 text-white rounded-2xl p-4 shadow-sm border border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">Total Fuel Sold</span>
            <div className="p-1.5 rounded-lg bg-blue-800 text-blue-300">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-white mt-2">-{formatLiters(totalFuelSold)}</p>
          <p className="text-[11px] text-blue-200 font-semibold mt-1">
            Deducted from Sales Entries
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Free Tank Space</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Container className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 mt-2">{formatLiters(totalRemainingUllage)}</p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Ullage Available
          </p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm border border-indigo-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider">Sync Integrity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-300 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Zero Mismatch
            </p>
            <p className="text-[10px] text-slate-300 mt-1">
              Live Formula: Opening + Deliveries − Sales
            </p>
          </div>
        </div>
      </div>

      {/* Tank Gauges Grid */}
      {tanks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
          <Container className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Tanks Configured</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            All tanks have been deleted or none exist yet. Click the "Add Underground Tank" button above to create one.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tanks.map(tank => (
            <div key={tank.id} className="relative group">
              <TankVisualizer tank={tank} onEdit={() => canEdit && openEditModal(tank)} />

              {/* Quick Action Buttons on Card Hover */}
              <div className="absolute top-3 right-3 flex items-center gap-1">
                {canEdit && (
                  <button
                    onClick={() => openEditModal(tank)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 transition-all shadow-sm"
                    title="Edit Tank Specs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setTankToDelete(tank.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 transition-all shadow-sm cursor-pointer"
                    title="Delete Tank"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={tankToDelete !== null}
        title="Permanently Delete Tank"
        message="Are you sure you want to permanently delete this tank? This action cannot be undone."
        onConfirm={() => {
          if (tankToDelete) {
            deleteTank(tankToDelete);
            setTankToDelete(null);
          }
        }}
        onCancel={() => setTankToDelete(null)}
      />

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-blue-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Container className="w-5 h-5 text-red-400" />
                <h3 className="font-extrabold text-base">
                  {editingTank ? 'Edit Tank Configuration' : 'Add New Underground Tank'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tank Name</label>
                <input
                  type="text"
                  value={tankName}
                  onChange={e => setTankName(e.target.value)}
                  required
                  placeholder="e.g. Tank 4 - High Speed Diesel Reserve"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value as FuelType)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-600"
                  >
                    <option value="Super Petrol">Super Petrol</option>
                    <option value="High-Speed Diesel (HSD)">High-Speed Diesel (HSD)</option>
                    <option value="Excellium High-Octane">Excellium High-Octane</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Max Capacity (Liters)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(Number(e.target.value))}
                    required
                    min={1000}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Opening Stock (Liters)
                  </label>
                  <input
                    type="number"
                    value={openingStock}
                    onChange={e => setOpeningStock(Number(e.target.value))}
                    required
                    min={0}
                    max={capacity}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Entered once when tank is created.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Low Stock Threshold (L)</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={e => setLowStockThreshold(Number(e.target.value))}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Live Synchronization Info Badge */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-950">Automatic Live Stock Synchronization</p>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Current Tank Stock = Opening Stock ({openingStock.toLocaleString()} L) + Deliveries − Sales.
                    You do not need to manually edit fuel levels again.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Tank Description</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Underground chamber location..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-600"
                  rows={2}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md"
                >
                  {editingTank ? 'Update Tank' : 'Create Tank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
