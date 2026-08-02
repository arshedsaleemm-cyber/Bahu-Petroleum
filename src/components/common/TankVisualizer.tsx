import React from 'react';
import { Tank } from '../../types';
import { Container, AlertTriangle, ArrowDownRight, ArrowUpRight, Clock, RefreshCw } from 'lucide-react';
import { formatLiters } from '../../utils/formatters';

interface TankVisualizerProps {
  tank: Tank;
  onEdit?: (tank: Tank) => void;
}

export const TankVisualizer: React.FC<TankVisualizerProps> = ({ tank, onEdit }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((tank.currentFuel / tank.capacity) * 100)));
  const isLow = tank.currentFuel <= tank.lowStockThreshold;

  const fuelTypeLower = (tank.fuelType || '').toLowerCase();

  const isSuperPetrol = fuelTypeLower.includes('petrol') || fuelTypeLower.includes('super');
  const isDiesel = fuelTypeLower.includes('diesel') || fuelTypeLower.includes('hsd');
  const isExcellium = fuelTypeLower.includes('excellium') || fuelTypeLower.includes('octane');

  let liquidBg = 'from-blue-600 to-indigo-700';
  let badgeStyle = 'bg-blue-100 text-blue-800';
  let iconColor = 'text-blue-600';

  if (isExcellium) {
    liquidBg = isLow ? 'from-amber-600 to-red-700' : 'from-emerald-500 to-teal-700';
    badgeStyle = 'bg-emerald-100 text-emerald-800';
    iconColor = 'text-emerald-600';
  } else if (isSuperPetrol) {
    liquidBg = isLow ? 'from-red-600 to-rose-700' : 'from-red-500 to-amber-600';
    badgeStyle = 'bg-red-100 text-red-700';
    iconColor = 'text-red-600';
  } else if (isDiesel) {
    liquidBg = isLow ? 'from-amber-600 to-red-700' : 'from-blue-600 to-indigo-800';
    badgeStyle = 'bg-blue-100 text-blue-800';
    iconColor = 'text-blue-600';
  }

  const formattedLastUpdated = tank.lastUpdatedTime
    ? new Date(tank.lastUpdatedTime).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Live';

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
            <Container className={`w-4 h-4 ${iconColor}`} />
            <h4 className="font-bold text-slate-900 text-sm">{tank.tankName}</h4>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${badgeStyle}`}
            >
              {tank.fuelType}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-emerald-600" /> Live Synced
            </span>
          </div>
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
            <span className="text-white font-extrabold text-xs drop-shadow">{percentage}% Filled</span>
          )}
        </div>

        {percentage <= 25 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-extrabold text-xs">
            {percentage}% Filled
          </div>
        )}
      </div>

      {/* 4-Grid Stats Breakdown: Current Stock, Capacity, Delivered, Sold */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div className="bg-slate-900 text-white p-2.5 rounded-xl">
          <p className="text-slate-300 text-[10px] uppercase font-bold">Current Stock (Live)</p>
          <p className="font-black text-white text-base mt-0.5">{formatLiters(tank.currentFuel)}</p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <p className="text-slate-500 text-[10px] uppercase font-bold">Opening Stock</p>
          <p className="font-bold text-slate-800 text-sm mt-0.5">{formatLiters(tank.openingStock || 0)}</p>
        </div>
        <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-100 text-emerald-900">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-700">
            <ArrowDownRight className="w-3 h-3 text-emerald-600" />
            <span>Total Delivered</span>
          </div>
          <p className="font-extrabold text-emerald-800 text-xs mt-0.5">
            +{formatLiters(tank.totalFuelDelivered || 0)}
          </p>
        </div>
        <div className="bg-blue-50/80 p-2 rounded-xl border border-blue-100 text-blue-900">
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-blue-700">
            <ArrowUpRight className="w-3 h-3 text-blue-600" />
            <span>Total Sold</span>
          </div>
          <p className="font-extrabold text-blue-800 text-xs mt-0.5">
            -{formatLiters(tank.totalFuelSold || 0)}
          </p>
        </div>
      </div>

      {/* Bottom Footer Stats: Remaining Free Space & Last Updated */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div>
          <span>Ullage (Free Space): </span>
          <span className="font-bold text-slate-800">{formatLiters(tank.capacity - tank.currentFuel)}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
          <Clock className="w-3 h-3" />
          <span>{formattedLastUpdated}</span>
        </div>
      </div>
    </div>
  );
};
