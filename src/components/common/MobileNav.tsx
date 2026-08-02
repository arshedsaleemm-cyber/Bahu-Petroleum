import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Bot,
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
  X,
  ChevronRight,
  ChefHat,
  Fuel,
  Flame,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  category?: string;
}

export const MobileNav: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    notifications,
    lubricants,
    tanks,
  } = useApp();

  const unreadNotifs = (notifications || []).filter(n => !n.read).length;
  const lowLubricants = (lubricants || []).filter(l => l.remainingStock <= l.lowStockAlert).length;
  const lowTanks = (tanks || []).filter(t => t.currentFuel <= t.lowStockThreshold).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'bahu_ai',
      label: 'Bahu AI Assistant',
      icon: Bot,
      badge: 'PRO',
      badgeColor: 'bg-emerald-600',
      category: 'Executive AI Intelligence',
    },
    { id: 'deliveries', label: 'Fuel Deliveries', icon: Truck, category: 'Fuel Operations' },
    { id: 'fuel_sales', label: 'Fuel Sales', icon: Flame, category: 'Fuel Operations' },
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
    {
      id: 'lubricants',
      label: 'Lubricants',
      icon: Package,
      badge: lowLubricants > 0 ? lowLubricants : undefined,
      badgeColor: 'bg-amber-600',
      category: 'Sub-Business Modules',
    },
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

  const categories = Array.from(new Set(navItems.map(item => item.category || 'General')));

  const handleSelect = (id: string) => {
    setCurrentView(id);
    setIsMobileDrawerOpen(false);
  };

  return (
    <>
      {/* Slide-In Left Hamburger Drawer Overlay for Mobile */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Menu Sliding in from LEFT */}
          <div className="relative z-10 w-80 max-w-[85vw] bg-slate-900 text-slate-200 h-full flex flex-col shadow-2xl border-r border-slate-800 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-blue-950 border-b border-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-white tracking-wide">BAHU PETROLEUM</h2>
                  <p className="text-[10px] text-blue-200">Navigation Menu</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg bg-blue-900/60 text-blue-200 hover:text-white border border-blue-800"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Categorized Menu List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
              {categories.map(cat => {
                const items = navItems.filter(item => (item.category || 'General') === cat);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {cat}
                    </div>
                    <div className="space-y-1 mt-1">
                      {items.map(item => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white font-bold shadow-md border-l-4 border-red-500'
                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white'
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

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 text-center text-[11px] text-slate-400">
              Bahu Petroleum Enterprise • Real-Time Sync
            </div>
          </div>
        </div>
      )}

      {/* Bottom Quick Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-blue-950 text-white border-t border-blue-900 px-2 py-1.5 md:hidden flex items-center justify-around shadow-lg">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'deliveries', label: 'Deliveries', icon: Truck },
          { id: 'daily_petrol_cash', label: 'Daily Cash', icon: Droplet },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
        ].map(tab => {
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
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center px-2 py-1 rounded-lg text-[10px] font-medium text-blue-200 hover:text-white"
        >
          <X className="w-5 h-5 text-red-400 rotate-45" />
          <span className="mt-0.5">☰ Menu</span>
        </button>
      </nav>
    </>
  );
};
