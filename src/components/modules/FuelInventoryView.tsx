import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatLiters, formatCurrency } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { Droplet, Fuel, Container, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';

export const FuelInventoryView: React.FC = () => {
  const { tanks, deliveries, machineSales } = useApp();

  const petrolTanks = tanks.filter(t => t.fuelType === 'Petrol');
  const dieselTanks = tanks.filter(t => t.fuelType === 'Diesel');

  const petrolCurrent = petrolTanks.reduce((a, b) => a + b.currentFuel, 0);
  const petrolCapacity = petrolTanks.reduce((a, b) => a + b.capacity, 0);
  const petrolOpening = petrolTanks.reduce((a, b) => a + b.openingStock, 0);

  const dieselCurrent = dieselTanks.reduce((a, b) => a + b.currentFuel, 0);
  const dieselCapacity = dieselTanks.reduce((a, b) => a + b.capacity, 0);
  const dieselOpening = dieselTanks.reduce((a, b) => a + b.openingStock, 0);

  const petrolReceived = deliveries.reduce((acc, curr) => acc + curr.petrolLiters, 0);
  const dieselReceived = deliveries.reduce((acc, curr) => acc + curr.dieselLiters, 0);

  const petrolSold = machineSales
    .filter(s => s.fuelType === 'Petrol')
    .reduce((acc, curr) => acc + curr.totalLitersSold, 0);
  const dieselSold = machineSales
    .filter(s => s.fuelType === 'Diesel')
    .reduce((acc, curr) => acc + curr.totalLitersSold, 0);

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <Droplet className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Fuel Inventory Audit & Calculations</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time automated audit log: Opening Stock + Received Stock - Sold Stock = Closing Stock.
          </p>
        </div>
      </div>

      {/* Super Petrol Stock Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Super Petrol Inventory</h3>
              <p className="text-xs text-slate-500">Across {petrolTanks.length} Underground Storage Tanks</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 font-extrabold text-xs">
            {formatLiters(petrolCurrent)} Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Opening Stock</p>
            <p className="font-extrabold text-slate-800 text-sm mt-1">{formatLiters(petrolOpening)}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">+ Received Stock</p>
            <p className="font-extrabold text-emerald-800 text-sm mt-1">{formatLiters(petrolReceived)}</p>
          </div>
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
            <p className="text-[10px] font-bold text-rose-600 uppercase">- Sold Stock</p>
            <p className="font-extrabold text-rose-800 text-sm mt-1">{formatLiters(petrolSold)}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <p className="text-[10px] font-bold text-blue-600 uppercase">= Closing Stock</p>
            <p className="font-extrabold text-blue-900 text-sm mt-1">{formatLiters(petrolCurrent)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Capacity</p>
            <p className="font-extrabold text-slate-700 text-sm mt-1">{formatLiters(petrolCapacity)}</p>
          </div>
        </div>
      </div>

      {/* High Speed Diesel Stock Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <Droplet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">High Speed Diesel Inventory</h3>
              <p className="text-xs text-slate-500">Commercial Heavy Vehicle Fuel Storage</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs">
            {formatLiters(dieselCurrent)} Available
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Opening Stock</p>
            <p className="font-extrabold text-slate-800 text-sm mt-1">{formatLiters(dieselOpening)}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-600 uppercase">+ Received Stock</p>
            <p className="font-extrabold text-emerald-800 text-sm mt-1">{formatLiters(dieselReceived)}</p>
          </div>
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
            <p className="text-[10px] font-bold text-rose-600 uppercase">- Sold Stock</p>
            <p className="font-extrabold text-rose-800 text-sm mt-1">{formatLiters(dieselSold)}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
            <p className="text-[10px] font-bold text-blue-600 uppercase">= Closing Stock</p>
            <p className="font-extrabold text-blue-900 text-sm mt-1">{formatLiters(dieselCurrent)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Capacity</p>
            <p className="font-extrabold text-slate-700 text-sm mt-1">{formatLiters(dieselCapacity)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
