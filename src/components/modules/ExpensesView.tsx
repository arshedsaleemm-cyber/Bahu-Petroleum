import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { PDFExportButton } from '../common/PDFExportButton';
import { Receipt, Plus, Search, Tag, Calendar, Trash2, X, Paperclip, Edit2 } from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { expenses, categories, addExpense, updateExpense, addExpenseCategory, deleteExpense, canEdit, canDelete } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Electricity Bill');
  const [amount, setAmount] = useState<number>(5000);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expenseTime, setExpenseTime] = useState('02:00 PM');
  const [description, setDescription] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const openAddModal = () => {
    setEditingExpense(null);
    setTitle('Office Stationery & Water Dispensers');
    setCategory(categories[0]?.name || 'Office Expenses');
    setAmount(4500);
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setExpenseTime('02:00 PM');
    setDescription('Purchased water bottles and station logbooks');
    setIsAddModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setCategory(exp.category);
    setAmount(exp.amount);
    setExpenseDate(exp.date || new Date().toISOString().slice(0, 10));
    setExpenseTime(exp.time || '02:00 PM');
    setDescription(exp.description || exp.notes || '');
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      updateExpense(editingExpense.id, {
        title,
        category,
        amount,
        date: expenseDate,
        time: expenseTime,
        description,
        notes: description,
      });
    } else {
      addExpense({
        title,
        category,
        amount,
        date: expenseDate,
        time: expenseTime,
        description,
        notes: description,
        receiptPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80',
      });
    }
    setIsAddModalOpen(false);
    setEditingExpense(null);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addExpenseCategory(newCatName.trim());
      setNewCatName('');
    }
    setIsCategoryModalOpen(false);
  };

  const filtered = expenses.filter(e => {
    const matchesQuery =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategoryFilter === 'ALL' || e.category === selectedCategoryFilter;
    return matchesQuery && matchesCat;
  });

  const totalExpenseSum = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Expenses & Bills Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record electricity, maintenance, tea, water, and custom business expenditures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Tag className="w-4 h-4 text-blue-600" /> Custom Category
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search expenses by title, category, or notes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-blue-600"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={e => setSelectedCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="ALL">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Total Sum Display */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase">Filtered Total Expenses</span>
          <p className="text-xl font-black text-amber-950">{formatCurrency(totalExpenseSum)}</p>
        </div>
        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
          {filtered.length} Expense Vouchers
        </span>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5">Title & Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Logged By</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filtered.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{exp.title}</div>
                      <div className="text-[11px] text-slate-500">{exp.description || exp.notes}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900">{formatDate(exp.date)}</div>
                      <div className="text-[11px] text-slate-400">{exp.time}</div>
                    </td>
                    <td className="p-3.5 text-slate-600">{exp.createdBy}</td>
                    <td className="p-3.5 text-right font-black text-amber-700">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all cursor-pointer"
                          title="Edit Expense Record"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => setExpenseToDelete(exp.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Delete Expense Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-amber-600 p-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">
                {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingExpense(null);
                }}
                className="p-1 rounded bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expense Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-amber-600"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (Rs)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    required
                    min={1}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expense Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  placeholder="e.g. LESCO Commercial Electricity Bill"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> Expense Date (Manual Selection)
                </label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-amber-600"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Select today's date, previous date, or future date</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Optional details or notes regarding this expenditure..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none focus:border-amber-600"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {editingExpense ? 'Update Expense Record' : 'Save Expense Entry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm">Add Custom Expense Category</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded bg-slate-800 text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  required
                  placeholder="e.g. CCTV & Security Guard"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Expense Modal */}
      <ConfirmDeleteModal
        isOpen={expenseToDelete !== null}
        title="Permanently Delete Expense Record"
        message="Are you sure you want to permanently delete this expense record? This action cannot be undone."
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpense(expenseToDelete);
            setExpenseToDelete(null);
          }
        }}
        onCancel={() => setExpenseToDelete(null)}
      />
    </div>
  );
};
