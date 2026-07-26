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
  User as UserIcon,
  Fuel,
  LogOut,
  Layers,
  Menu,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    switchRole,
    logout,
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
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-900/80 text-blue-200 border border-blue-800/80 text-xs transition-all"
            title="Cloud Sync Status - Click to sync"
          >
            {syncStatus.syncing ? (
              <RefreshCw className="w-3.5 h-3.5 text-blue-300 animate-spin" />
            ) : syncStatus.online ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline text-[11px] font-medium">
              {syncStatus.syncing ? 'Syncing...' : syncStatus.online ? 'Synced' : 'Offline'}
            </span>
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

          {/* User Role Switcher Quick Bar */}
          <div className="flex items-center gap-1 bg-blue-900/80 p-1 rounded-xl border border-blue-800">
            {currentUser?.role === 'ADMIN' ? (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">ADMIN</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-sm">
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">EMPLOYEE</span>
              </div>
            )}

            {/* Switch Role Quick Dropdown Toggle */}
            <button
              onClick={() => switchRole(currentUser?.role === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN')}
              className="px-1.5 py-1 text-[10px] sm:text-[11px] text-blue-200 hover:text-white bg-blue-950 hover:bg-blue-800 rounded-lg font-medium transition-all"
              title="Toggle Role for testing permissions"
            >
              <span className="hidden sm:inline">Switch Role</span>
              <span className="sm:hidden">↻</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-1.5 text-red-300 hover:text-red-100 hover:bg-red-900/50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
