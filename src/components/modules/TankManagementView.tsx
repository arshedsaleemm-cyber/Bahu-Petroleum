import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tank } from '../../types';
import { TankVisualizer } from '../common/TankVisualizer';
import { formatLiters } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { Container, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

export const TankManagementView: React.FC = () => {
  const { tanks, addTank, updateTank, deleteTank, canDelete, canEdit } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<Tank | null>(null);

  // Form State
  const [tankName, setTankName] = useState('');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel'>('Petrol');
  const [capacity, setCapacity] = useState<number>(25000);
  const [currentFuel, setCurrentFuel] = useState<number>(18000);
  const [openingStock, setOpeningStock] = useState<number>(18000);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5000);
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingTank(null);
    setTankName(`Tank ${tanks.length + 1} - Super Petrol`);
    setFuelType('Petrol');
    setCapacity(25000);
    setCurrentFuel(15000);
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
    setCurrentFuel(tank.currentFuel);
    setOpeningStock(tank.openingStock);
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
        currentFuel,
        openingStock,
        closingStock: currentFuel,
        lowStockThreshold,
        notes,
      });
    } else {
      addTank({
        tankName,
        fuelType,
        capacity,
        currentFuel,
        openingStock,
        closingStock: currentFuel,
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
            <h2 className="text-xl font-black text-slate-900">Tank Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure unlimited underground fuel storage tanks and monitor live gauge heights.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Underground Tank
        </button>
      </div>

      {/* Tank Gauges Grid */}
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
              {canDelete && tanks.length > 1 && (
                <button
                  onClick={() => deleteTank(tank.id)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-600 hover:text-white text-slate-600 transition-all shadow-sm"
                  title="Delete Tank"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

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
                    onChange={e => setFuelType(e.target.value as 'Petrol' | 'Diesel')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-600"
                  >
                    <option value="Petrol">Super Petrol</option>
                    <option value="Diesel">High Speed Diesel</option>
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
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Stock (Liters)</label>
                  <input
                    type="number"
                    value={currentFuel}
                    onChange={e => setCurrentFuel(Number(e.target.value))}
                    required
                    min={0}
                    max={capacity}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-600"
                  />
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
