import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Truck,
  Gauge,
  Receipt,
  BarChart3,
  Menu,
  X,
  Container,
  Droplet,
  Package,
  Users,
  UserCheck,
  CalendarCheck,
  Banknote,
  Building2,
  Wallet,
  CreditCard,
  CircleDot,
  Car,
  ShoppingBag,
  Building,
  Bell,
  Settings,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView, notifications } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'deliveries', label: 'Deliveries', icon: Truck },
    { id: 'machines', label: 'Sales', icon: Gauge },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const allModules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'deliveries', label: 'Fuel Deliveries', icon: Truck },
    { id: 'inventory', label: 'Fuel Inventory', icon: Droplet },
    { id: 'tanks', label: 'Tank Management', icon: Container },
    { id: 'machines', label: 'Machine Sales', icon: Gauge },
    { id: 'lubricants', label: 'Lubricants', icon: Package },
    { id: 'customers', label: 'Udhaar Customers', icon: Users },
    { id: 'workers', label: 'Workers', icon: UserCheck },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'salary', label: 'Salary & Advances', icon: Banknote },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'bank', label: 'Bank Management', icon: Building2 },
    { id: 'cash', label: 'Cash Management', icon: Wallet },
    { id: 'credit_card', label: 'Credit Card', icon: CreditCard },
    { id: 'infini_card', label: 'Infini Card', icon: CreditCard },
    { id: 'tyre_shop', label: 'Tyre Shop', icon: CircleDot },
    { id: 'car_wash', label: 'Car Wash', icon: Car },
    { id: 'tuck_shop', label: 'Tuck Shop', icon: ShoppingBag },
    { id: 'rentals', label: 'Rental Income', icon: Building },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Drawer Overlay for Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden flex justify-end">
          <div className="w-4/5 max-w-xs bg-slate-900 h-full p-4 overflow-y-auto flex flex-col justify-between text-white shadow-2xl animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="font-bold text-lg text-white">Bahu Modules</div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {allModules.map(mod => {
                  const Icon = mod.icon;
                  const isActive = currentView === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setCurrentView(mod.id);
                        setIsMenuOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-md'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1 text-blue-400" />
                      <span className="truncate w-full">{mod.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-400">
              Bahu Petroleum Enterprise App
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-blue-950 text-white border-t border-blue-900 px-2 py-1.5 md:hidden flex items-center justify-around shadow-lg">
        {mainTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                isActive ? 'text-white bg-blue-800/80 font-bold' : 'text-blue-200/80 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-red-400 scale-110' : 'text-blue-300'}`} />
              <span className="mt-0.5">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center px-2 py-1 rounded-lg text-[10px] font-medium text-blue-200 hover:text-white"
        >
          <Menu className="w-5 h-5 text-red-400" />
          <span className="mt-0.5">All Modules</span>
        </button>
      </nav>
    </>
  );
};
