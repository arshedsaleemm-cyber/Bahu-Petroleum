import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Gauge, Truck, Receipt, Users, Building2, Bot, X } from 'lucide-react';

export const FAB: React.FC = () => {
  const { setCurrentView } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    { label: 'Bahu AI Assistant', view: 'bahu_ai', icon: Bot, bg: 'bg-gradient-to-r from-red-600 to-blue-600' },
    { label: 'Machine Sale', view: 'machines', icon: Gauge, bg: 'bg-blue-600' },
    { label: 'Fuel Delivery', view: 'deliveries', icon: Truck, bg: 'bg-red-600' },
    { label: 'Expense Entry', view: 'expenses', icon: Receipt, bg: 'bg-amber-600' },
    { label: 'Udhaar Payment', view: 'customers', icon: Users, bg: 'bg-emerald-600' },
    { label: 'Bank Deposit', view: 'bank', icon: Building2, bg: 'bg-purple-600' },
  ];

  return (
    <div className="fixed bottom-16 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
      {/* Action Options Popup */}
      {isOpen && (
        <div className="mb-3 space-y-2 animate-in fade-in slide-in-from-bottom-5">
          {quickActions.map(act => {
            const Icon = act.icon;
            return (
              <button
                key={act.label}
                onClick={() => {
                  setCurrentView(act.view);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 shadow-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all group"
              >
                <div className={`p-1.5 rounded-lg text-white ${act.bg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-slate-800 rotate-45' : 'bg-gradient-to-tr from-red-600 to-blue-800 hover:scale-105 ring-4 ring-blue-500/20'
        }`}
        title="Quick Action"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
