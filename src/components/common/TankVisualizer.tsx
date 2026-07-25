import React from 'react';
import { Tank } from '../../types';
import { Container, AlertTriangle } from 'lucide-react';
import { formatLiters } from '../../utils/formatters';

interface TankVisualizerProps {
  tank: Tank;
  onEdit?: (tank: Tank) => void;
}

export const TankVisualizer: React.FC<TankVisualizerProps> = ({ tank, onEdit }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((tank.currentFuel / tank.capacity) * 100)));
  const isLow = tank.currentFuel <= tank.lowStockThreshold;

  const isPetrol = tank.fuelType === 'Petrol';
  // Petrol color gradient: Red/Orange accent; Diesel: Deep Blue/Amber accent
  const liquidBg = isPetrol
    ? isLow
      ? 'from-red-600 to-rose-700'
      : 'from-red-500 to-amber-600'
    : isLow
    ? 'from-amber-600 to-red-700'
    : 'from-blue-600 to-indigo-700';

  return (
    <div
      onClick={() => onEdit && onEdit(tank)}
      className={`relative bg-white rounded-2xl p-4 border transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${
        isLow ? 'border-red-500/80 ring-2 ring-red-500/20' : 'border-slate-200 hover:border-blue-400'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Container className={`w-4 h-4 ${isPetrol ? 'text-red-600' : 'text-blue-600'}`} />
            <h4 className="font-bold text-slate-900 text-sm">{tank.tankName}</h4>
          </div>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
              isPetrol ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {tank.fuelType} Tank
          </span>
        </div>

        {isLow && (
          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>LOW FUEL</span>
          </div>
        )}
      </div>

      {/* Tank Liquid Container Animation Visualizer */}
      <div className="relative h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-end mb-3">
        {/* Fill Level */}
        <div
          className={`w-full bg-gradient-to-t ${liquidBg} transition-all duration-700 ease-out flex items-center justify-center relative`}
          style={{ height: `${percentage}%` }}
        >
          {/* Surface wave shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 animate-pulse" />
          {percentage > 25 && (
            <span className="text-white font-extrabold text-xs drop-shadow">{percentage}%</span>
          )}
        </div>

        {percentage <= 25 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-extrabold text-xs">
            {percentage}%
          </div>
        )}
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <p className="text-slate-500 text-[10px] uppercase font-bold">Current Level</p>
          <p className="font-extrabold text-slate-900 text-sm mt-0.5">{formatLiters(tank.currentFuel)}</p>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <p className="text-slate-500 text-[10px] uppercase font-bold">Total Capacity</p>
          <p className="font-semibold text-slate-700 text-sm mt-0.5">{formatLiters(tank.capacity)}</p>
        </div>
      </div>

      {/* Remaining Capacity */}
      <div className="mt-2 text-[11px] text-slate-500 flex justify-between font-medium">
        <span>Ullage (Remaining Space):</span>
        <span className="font-bold text-slate-800">{formatLiters(tank.capacity - tank.currentFuel)}</span>
      </div>
    </div>
  );
};
