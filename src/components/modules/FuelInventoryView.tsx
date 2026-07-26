import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatLiters, formatCurrency } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { Tank } from '../../types';
import {
  Droplet,
  Fuel,
  Container,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Edit2,
  CheckCircle2,
  Truck,
  ArrowUpRight,
  Gauge,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const FuelInventoryView: React.FC = () => {
  const { tanks, updateTank, deliveries, infiniCardSales, canEdit } = useApp();

  const [selectedTank, setSelectedTank] = useState<Tank | null>(null);
  const [dipLiters, setDipLiters] = useState<number>(0);
  const [openingLiters, setOpeningLiters] = useState<number>(0);
  const [dipNotes, setDipNotes] = useState<string>('');
  const [isDipModalOpen, setIsDipModalOpen] = useState<boolean>(false);

  const petrolTanks = tanks.filter(t => t.fuelType === 'Petrol');
  const dieselTanks = tanks.filter(t => t.fuelType === 'Diesel');

  const petrolCurrent = petrolTanks.reduce((a, b) => a + b.currentFuel, 0);
  const petrolCapacity = petrolTanks.reduce((a, b) => a + b.capacity, 0);
  const petrolOpening = petrolTanks.reduce((a, b) => a + b.openingStock, 0);

  const dieselCurrent = dieselTanks.reduce((a, b) => a + b.currentFuel, 0);
  const dieselCapacity = dieselTanks.reduce((a, b) => a + b.capacity, 0);
  const dieselOpening = dieselTanks.reduce((a, b) => a + b.openingStock, 0);

  const petrolReceived = deliveries.reduce((acc, curr) => acc + (curr.petrolLiters || 0), 0);
  const dieselReceived = deliveries.reduce((acc, curr) => acc + (curr.dieselLiters || 0), 0);

  // Calculate sold liters based on Opening Stock + Total Received - Current Closing Stock
  const petrolSold = Math.max(0, petrolOpening + petrolReceived - petrolCurrent);
  const dieselSold = Math.max(0, dieselOpening + dieselReceived - dieselCurrent);

  // Infini card fuel liters sold
  const petrolInfiniLiters = (infiniCardSales || [])
    .filter(s => s.fuelType === 'Petrol')
    .reduce((a, b) => a + (b.liters || 0), 0);
  const dieselInfiniLiters = (infiniCardSales || [])
    .filter(s => s.fuelType === 'Diesel')
    .reduce((a, b) => a + (b.liters || 0), 0);

  const openDipModal = (tank: Tank) => {
    setSelectedTank(tank);
    setDipLiters(tank.currentFuel);
    setOpeningLiters(tank.openingStock);
    setDipNotes('');
    setIsDipModalOpen(true);
  };

  const handleUpdateDip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTank) return;

    updateTank({
      ...selectedTank,
      currentFuel: Number(dipLiters),
      openingStock: Number(openingLiters),
      closingStock: Number(dipLiters),
      notes: dipNotes
        ? `${selectedTank.notes ? selectedTank.notes + ' | ' : ''}Dip Update: ${dipLiters}L (${new Date().toLocaleTimeString()}) - ${dipNotes}`
        : selectedTank.notes,
    });

    setIsDipModalOpen(false);
  };

  const totalFuelAvailable = petrolCurrent + dieselCurrent;
  const totalFuelCapacity = petrolCapacity + dieselCapacity;
  const totalFuelShortage = deliveries.reduce((a, b) => a + (b.shortageLiters || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-blue-100 text-blue-900 rounded-xl">
              <Droplet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Fuel Inventory Audit & Tank Logs</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated Underground Storage Stock Equation: Opening Stock + Received - Sold = Closing Stock.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            Print Audit Log
          </button>
        </div>
      </div>

      {/* Overall Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-950 text-white p-5 rounded-2xl shadow-md border border-blue-800">
          <div className="flex items-center justify-between text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Fuel Stock Available</span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black">{formatLiters(totalFuelAvailable)}</div>
          <div className="text-xs text-blue-200/80 mt-1 flex items-center justify-between">
            <span>Out of {formatLiters(totalFuelCapacity)} Total Tank Space</span>
            <span className="font-extrabold text-emerald-400">
              {Math.round((totalFuelAvailable / (totalFuelCapacity || 1)) * 100)}% Capacity
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900 to-red-950 text-white p-5 rounded-2xl shadow-md border border-red-800">
          <div className="flex items-center justify-between text-red-200 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Super Petrol Reserve</span>
            <Fuel className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black">{formatLiters(petrolCurrent)}</div>
          <div className="text-xs text-red-200/80 mt-1 flex items-center justify-between">
            <span>Ullage: {formatLiters(petrolCapacity - petrolCurrent)}</span>
            <span className="font-bold">{petrolTanks.length} Tanks Online</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-5 rounded-2xl shadow-md border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span>High Speed Diesel Reserve</span>
            <Droplet className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black">{formatLiters(dieselCurrent)}</div>
          <div className="text-xs text-slate-300/80 mt-1 flex items-center justify-between">
            <span>Ullage: {formatLiters(dieselCapacity - dieselCurrent)}</span>
            <span className="font-bold">{dieselTanks.length} Tanks Online</span>
          </div>
        </div>
      </div>

      {/* Super Petrol Inventory Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-red-600">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Super Petrol Stock Breakdown</h3>
              <p className="text-xs text-slate-500">
                Opening Stock ({formatLiters(petrolOpening)}) + Received ({formatLiters(petrolReceived)}) - Sold (
                {formatLiters(petrolSold)})
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-red-100 text-red-700 font-extrabold text-xs border border-red-200">
            {formatLiters(petrolCurrent)} Closing Stock
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opening Stock</p>
            <p className="font-extrabold text-slate-800 text-base mt-1">{formatLiters(petrolOpening)}</p>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">+ Received Stock</p>
            <p className="font-extrabold text-emerald-800 text-base mt-1">{formatLiters(petrolReceived)}</p>
          </div>
          <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-100">
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">- Total Sold Stock</p>
            <p className="font-extrabold text-rose-800 text-base mt-1">{formatLiters(petrolSold)}</p>
            {petrolInfiniLiters > 0 && (
              <p className="text-[10px] text-rose-600/80 font-medium mt-0.5">
                (Incl. {formatLiters(petrolInfiniLiters)} Infini)
              </p>
            )}
          </div>
          <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">= Current Stock (Dip)</p>
            <p className="font-extrabold text-blue-900 text-base mt-1">{formatLiters(petrolCurrent)}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Capacity</p>
            <p className="font-extrabold text-slate-700 text-base mt-1">{formatLiters(petrolCapacity)}</p>
          </div>
        </div>
      </div>

      {/* High Speed Diesel Inventory Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <Droplet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">High Speed Diesel Stock Breakdown</h3>
              <p className="text-xs text-slate-500">
                Opening Stock ({formatLiters(dieselOpening)}) + Received ({formatLiters(dieselReceived)}) - Sold (
                {formatLiters(dieselSold)})
              </p>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs border border-blue-200">
            {formatLiters(dieselCurrent)} Closing Stock
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Opening Stock</p>
            <p className="font-extrabold text-slate-800 text-base mt-1">{formatLiters(dieselOpening)}</p>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">+ Received Stock</p>
            <p className="font-extrabold text-emerald-800 text-base mt-1">{formatLiters(dieselReceived)}</p>
          </div>
          <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-100">
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">- Total Sold Stock</p>
            <p className="font-extrabold text-rose-800 text-base mt-1">{formatLiters(dieselSold)}</p>
            {dieselInfiniLiters > 0 && (
              <p className="text-[10px] text-rose-600/80 font-medium mt-0.5">
                (Incl. {formatLiters(dieselInfiniLiters)} Infini)
              </p>
            )}
          </div>
          <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">= Current Stock (Dip)</p>
            <p className="font-extrabold text-blue-900 text-base mt-1">{formatLiters(dieselCurrent)}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage Capacity</p>
            <p className="font-extrabold text-slate-700 text-base mt-1">{formatLiters(dieselCapacity)}</p>
          </div>
        </div>
      </div>

      {/* Underground Tank Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Container className="w-5 h-5 text-blue-900" />
              Underground Storage Tank Dip Register
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live capacity monitoring & dip level log for every tank at Bahu Petroleum.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Tank Name</th>
                <th className="p-3.5">Fuel Type</th>
                <th className="p-3.5 text-right">Max Capacity</th>
                <th className="p-3.5 text-right">Opening Stock</th>
                <th className="p-3.5 text-right">Current Stock (Dip)</th>
                <th className="p-3.5 text-right">Ullage (Space)</th>
                <th className="p-3.5 text-center">Fill Gauge</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {tanks.map(tank => {
                const fillPct = Math.min(100, Math.max(0, Math.round((tank.currentFuel / (tank.capacity || 1)) * 100)));
                const isLow = tank.currentFuel <= tank.lowStockThreshold;
                const ullage = tank.capacity - tank.currentFuel;

                return (
                  <tr key={tank.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{tank.tankName}</div>
                      {tank.notes && <div className="text-[10px] text-slate-400 truncate max-w-xs">{tank.notes}</div>}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          tank.fuelType === 'Petrol'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {tank.fuelType}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-700">{formatLiters(tank.capacity)}</td>
                    <td className="p-3.5 text-right font-semibold text-slate-600">{formatLiters(tank.openingStock)}</td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      <span className={isLow ? 'text-red-600 font-black' : ''}>{formatLiters(tank.currentFuel)}</span>
                    </td>
                    <td className="p-3.5 text-right font-semibold text-slate-500">{formatLiters(ullage)}</td>
                    <td className="p-3.5 text-center w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isLow
                                ? 'bg-red-600'
                                : tank.fuelType === 'Petrol'
                                ? 'bg-red-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-700 w-8 text-right">{fillPct}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => openDipModal(tank)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-[11px] font-bold border border-blue-200 transition-all flex items-center gap-1 mx-auto"
                      >
                        <Edit2 className="w-3 h-3" /> Dip Reading
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Fuel Delivery Shortage Audit */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-900" />
            <h3 className="font-extrabold text-slate-900 text-base">Recent Delivery Dip Verification Audit</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total Shortage Recorded: <span className="font-bold text-red-600">{formatLiters(totalFuelShortage)}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-2.5">Date & Time</th>
                <th className="p-2.5">Supplier / Invoice</th>
                <th className="p-2.5">Fuel Type</th>
                <th className="p-2.5 text-right">Invoiced Liters</th>
                <th className="p-2.5 text-right">Expected Dip (cm)</th>
                <th className="p-2.5 text-right">Actual Dip (cm)</th>
                <th className="p-2.5 text-right">Shortage</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No fuel deliveries logged yet.
                  </td>
                </tr>
              ) : (
                deliveries.slice(0, 5).map(del => (
                  <tr key={del.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-medium text-slate-700">
                      {del.deliveryDate} <span className="text-[10px] text-slate-400">{del.deliveryTime}</span>
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">
                      {del.supplierName}
                      <span className="block text-[10px] text-slate-400 font-normal">Inv #{del.invoiceNumber}</span>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800">{del.fuelType}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {formatLiters(del.totalLitersReceived)}
                    </td>
                    <td className="p-2.5 text-right font-medium text-slate-600">
                      {del.expectedDip ? `${del.expectedDip} cm` : 'N/A'}
                    </td>
                    <td className="p-2.5 text-right font-medium text-slate-600">
                      {del.actualDip ? `${del.actualDip} cm` : 'N/A'}
                    </td>
                    <td className="p-2.5 text-right">
                      {del.shortageLiters && del.shortageLiters > 0 ? (
                        <span className="font-extrabold text-red-600">-{formatLiters(del.shortageLiters)}</span>
                      ) : (
                        <span className="text-emerald-600 font-bold">No Shortage</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          del.adminApprovalStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : del.adminApprovalStatus === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {del.adminApprovalStatus || 'Approved'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dip Measurement & Stock Adjustment Modal */}
      {isDipModalOpen && selectedTank && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-blue-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Container className="w-5 h-5 text-red-400" />
                <h3 className="font-extrabold text-base">Record Tank Dip Measurement</h3>
              </div>
              <button
                onClick={() => setIsDipModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDip} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">{selectedTank.tankName}</p>
                <p className="text-slate-500">
                  Fuel Type: <span className="font-semibold text-slate-800">{selectedTank.fuelType}</span> | Max
                  Capacity: <span className="font-semibold text-slate-800">{formatLiters(selectedTank.capacity)}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Current Tank Level / Dip Liters
                </label>
                <input
                  type="number"
                  value={dipLiters}
                  onChange={e => setDipLiters(Number(e.target.value))}
                  required
                  min={0}
                  max={selectedTank.capacity}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-bold outline-none focus:border-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Current Ullage (Space Left): {formatLiters(selectedTank.capacity - dipLiters)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Opening Stock (Liters)
                </label>
                <input
                  type="number"
                  value={openingLiters}
                  onChange={e => setOpeningLiters(Number(e.target.value))}
                  required
                  min={0}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Audit Notes / Reason</label>
                <textarea
                  value={dipNotes}
                  onChange={e => setDipNotes(e.target.value)}
                  placeholder="e.g. Daily shift dip reading measurement..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-blue-600"
                  rows={2}
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDipModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md"
                >
                  Save Dip Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
