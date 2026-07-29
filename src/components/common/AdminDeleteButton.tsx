import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface AdminDeleteButtonProps {
  onDelete: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  variant?: 'icon' | 'button' | 'text' | 'danger-button' | 'menu-item' | 'small-icon';
  label?: string;
  className?: string;
}

export const AdminDeleteButton: React.FC<AdminDeleteButtonProps> = ({
  onDelete,
  title = 'Delete Record',
  message,
  itemName,
  variant = 'icon',
  label = 'Delete',
  className = '',
}) => {
  const { isAdmin, canDelete } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // EMPLOYEES MUST NEVER SEE OR BE ABLE TO DELETE ANY RECORD
  if (!isAdmin && !canDelete) {
    return null;
  }

  const handleConfirm = () => {
    setIsModalOpen(false);
    onDelete();
  };

  const defaultMsg = itemName
    ? `Are you sure you want to permanently delete "${itemName}"?`
    : 'Are you sure you want to permanently delete this record?';

  return (
    <>
      {variant === 'icon' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          title="Delete record (Admin)"
          className={`p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ${className}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {variant === 'small-icon' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          title="Delete record (Admin)"
          className={`p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer ${className}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {variant === 'button' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className={`px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${className}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}

      {variant === 'danger-button' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer ${className}`}
        >
          <Trash2 className="w-4 h-4" />
          <span>{label}</span>
        </button>
      )}

      {variant === 'text' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className={`text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer ${className}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}

      {variant === 'menu-item' && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className={`w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${className}`}
        >
          <Trash2 className="w-4 h-4" />
          <span>{label}</span>
        </button>
      )}

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        title={title}
        message={message || defaultMsg}
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
      />
    </>
  );
};
