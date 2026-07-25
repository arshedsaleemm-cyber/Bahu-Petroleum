import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Info } from 'lucide-react';

export const PermissionNotice: React.FC = () => {
  const { currentUser } = useApp();

  if (currentUser?.role === 'ADMIN') return null;

  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3 mb-4 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
      <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-bold text-blue-950">Employee Access Mode: </span>
        You can view every module, report, and record, and add new entries in all modules. Record editing, deletion, user creation, and system settings are restricted to Admin (CEO Mian Rashid Saleem).
      </div>
    </div>
  );
};
