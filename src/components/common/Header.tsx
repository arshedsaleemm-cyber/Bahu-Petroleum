import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Bell,
  RefreshCw,
  Wifi,
  WifiOff,
  UserCheck,
  ShieldCheck,
  Fuel,
  Menu,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    syncStatus,
    triggerManualSync,
    setIsSearchOpen,
    notifications,
    setCurrentView,
    setIsMobileDrawerOpen,
  } = useApp();

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-blue-950 text-white shadow-md border-b border-blue-900">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Mobile Hamburger & Brand Logo */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-xl bg-blue-900/80 hover:bg-blue-900 text-white border border-blue-800 transition-all flex items-center justify-center"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white shadow-inner border border-red-500/50">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-sans">
                  BAHU PETROLEUM
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-red-600 text-white rounded-full">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 font-medium hidden sm:block">
                Founder & CEO: <span className="text-white font-semibold">Mian Rashid Saleem</span>
              </p>
            </div>
          </div>
        </div>

        {/* Search & Status Bar */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-blue-100 border border-blue-800 text-xs sm:text-sm font-medium transition-all"
            title="Global Search"
          >
            <Search className="w-4 h-4 text-blue-300" />
            <span className="hidden md:inline">Search records...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-blue-950 text-blue-300 rounded border border-blue-800">
              ⌘K
            </kbd>
          </button>

          {/* Sync Status Badge */}
          <button
            onClick={triggerManualSync}
            disabled={syncStatus.syncing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-900 text-white border border-blue-800 text-xs transition-all cursor-pointer"
            title={syncStatus.syncing ? "Auto Syncing in background..." : syncStatus.online ? "Online - Cloud Live Sync Active" : "Offline Mode - Data saved locally & will auto-sync"}
          >
            {syncStatus.syncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-blue-300 animate-spin shrink-0" />
                <span className="text-[11px] font-bold text-blue-200">🔄 Syncing</span>
              </>
            ) : syncStatus.online ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[11px] font-bold text-emerald-300">🟢 Online</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <WifiOff className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="text-[11px] font-bold text-red-300">🔴 Offline</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setCurrentView('notifications')}
            className="relative p-2 rounded-xl bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-800 transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse border-2 border-blue-950">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Active User Role Badge (No switch role, no header logout) */}
          <div className="flex items-center gap-1.5 bg-blue-900/80 px-2.5 py-1.5 rounded-xl border border-blue-800">
            {currentUser?.role === 'ADMIN' ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline text-white font-extrabold">ADMIN</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="hidden sm:inline text-white font-extrabold">EMPLOYEE</span>
              </div>
            )}
            <span className="text-[11px] text-blue-200 font-medium border-l border-blue-800 pl-2 max-w-[120px] truncate hidden md:inline">
              {currentUser?.name || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
