import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Truck,
  Droplet,
  Container,
  Package,
  Users,
  UserCheck,
  CalendarCheck,
  Banknote,
  Receipt,
  Building2,
  Wallet,
  CreditCard,
  CreditCard as InfiniIcon,
  CircleDot,
  Car,
  ShoppingBag,
  Building,
  BarChart3,
  Bell,
  Settings,
  ChevronRight,
  ChefHat,
  DollarSign,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  category?: string;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, notifications, lubricants, tanks } = useApp();

  const unreadNotifs = (notifications || []).filter(n => !n.read).length;
  const lowLubricants = (lubricants || []).filter(l => l.remainingStock <= l.lowStockAlert).length;
  const lowTanks = (tanks || []).filter(t => t.currentFuel <= t.lowStockThreshold).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'deliveries', label: 'Fuel Deliveries', icon: Truck, category: 'Fuel Operations' },
    { id: 'inventory', label: 'Fuel Inventory', icon: Droplet, category: 'Fuel Operations' },
    {
      id: 'tanks',
      label: 'Tank Management',
      icon: Container,
      badge: lowTanks > 0 ? lowTanks : undefined,
      badgeColor: 'bg-red-600',
      category: 'Fuel Operations',
    },
    { id: 'daily_petrol_cash', label: 'Daily Petrol Cash', icon: Droplet, category: 'Fuel Operations' },
    { id: 'customers', label: 'Credit Customers (Udhaar)', icon: Users, category: 'Accounts & People' },
    { id: 'workers', label: 'Workers', icon: UserCheck, category: 'Accounts & People' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, category: 'Accounts & People' },
    { id: 'salary', label: 'Salary & Advances', icon: Banknote, category: 'Accounts & People' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, category: 'Finance & Payments' },
    { id: 'bank', label: 'Bank Management', icon: Building2, category: 'Finance & Payments' },
    { id: 'cash', label: 'Cash Management', icon: Wallet, category: 'Finance & Payments' },
    { id: 'credit_card', label: 'Credit Card', icon: CreditCard, category: 'Finance & Payments' },
    { id: 'infini_card', label: 'Infini Card', icon: InfiniIcon, category: 'Finance & Payments' },
    { id: 'lubricants', label: 'Lubricants', icon: Package, category: 'Sub-Business Modules' },
    { id: 'tyre_shop', label: 'Tyre Shop', icon: CircleDot, category: 'Sub-Business Modules' },
    { id: 'car_wash', label: 'Car Wash', icon: Car, category: 'Sub-Business Modules' },
    { id: 'tuck_shop', label: 'Tuck Shop', icon: ShoppingBag, category: 'Sub-Business Modules' },
    { id: 'restaurant', label: 'Fast Food', icon: ChefHat, category: 'Sub-Business Modules' },
    { id: 'rentals', label: 'Rental Income', icon: Building, category: 'Sub-Business Modules' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, category: 'System' },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifs > 0 ? unreadNotifs : undefined,
      badgeColor: 'bg-red-600',
      category: 'System',
    },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'System' },
  ];

  // Group by category
  const categories = Array.from(new Set(navItems.map(item => item.category || 'General')));

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex-col shrink-0 h-[calc(100vh-57px)] overflow-y-auto custom-scrollbar select-none">
      <div className="p-3 space-y-5">
        {categories.map(cat => {
          const items = navItems.filter(item => (item.category || 'General') === cat);
          return (
            <div key={cat} className="space-y-1">
              <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {cat}
              </div>
              <div className="space-y-0.5 mt-1">
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-md border-l-4 border-red-500 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${
                              item.badgeColor || 'bg-blue-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="p-2.5 rounded-xl bg-blue-950/80 border border-blue-900 text-xs text-blue-200 space-y-1">
          <p className="font-bold text-white flex items-center justify-between">
            <span>Bahu Petroleum</span>
            <span className="text-[10px] px-1.5 py-0.5 bg-red-600 text-white rounded font-bold">v1.0</span>
          </p>
          <p className="text-[11px] text-slate-300">Offline-First Engine Active</p>
        </div>
      </div>
    </aside>
  );
};
