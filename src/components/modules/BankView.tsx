import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BankAccount } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PermissionNotice } from '../common/PermissionNotice';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { PDFExportButton } from '../common/PDFExportButton';
import { Building2, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw, Wallet, X, ShieldCheck, Trash2 } from 'lucide-react';

export const BankView: React.FC = () => {
  const { bankAccounts, cashRegister, addBankAccount, addBankTransaction, deleteBankAccount, canDelete } = useApp();

  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<BankAccount | null>(null);
  const [txType, setTxType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [bankToDelete, setBankToDelete] = useState<string | null>(null);

  // Account Form State
  const [bankName, setBankName] = useState('Habib Bank Limited (HBL)');
  const [accountTitle, setAccountTitle] = useState('Bahu Petroleum');
  const [accountNumber, setAccountNumber] = useState('109288192019');
  const [iban, setIban] = useState('PK36HABB00109288192019');
  const [branchName, setBranchName] = useState('Chung Branch, Lahore');
  const [branchCode, setBranchCode] = useState('0219');
  const [currentBalance, setCurrentBalance] = useState<number>(1500000);

  // Transaction Form State
  const [txAmount, setTxAmount] = useState<number>(50000);
  const [txDesc, setTxDesc] = useState('Daily cash sales deposit');

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBankAccount({
      bankName,
      accountTitle,
      accountNumber,
      iban,
      branchName,
      branchCode,
      currentBalance,
    });
    setIsAddAccountModalOpen(false);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAcc && txAmount > 0) {
      addBankTransaction({
        bankId: selectedAcc.id,
        bankName: selectedAcc.bankName,
        type: txType as 'Deposit' | 'Withdrawal' | 'Transfer',
        amount: txAmount,
        referenceNumber: txDesc || `REF-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
      });
    }
    setIsTxModalOpen(false);
  };

  const totalBankBalance = bankAccounts.reduce((acc, curr) => acc + curr.currentBalance, 0);

  return (
    <div className="space-y-6 pb-12">
      <PermissionNotice />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Bank Accounts & Cash Register</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage commercial bank accounts, deposits, withdrawals, and physical safe cash balance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddAccountModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Bank Account
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Total Liquid Bank Balance</span>
              <Building2 className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-3xl font-black">{formatCurrency(totalBankBalance)}</p>
            <p className="text-xs text-blue-200">Across {bankAccounts.length} Linked Commercial Accounts</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Station Cash Register Safe</span>
              <Wallet className="w-6 h-6 text-emerald-300" />
            </div>
            <p className="text-3xl font-black">{formatCurrency(cashRegister.totalCashOnHand)}</p>
            <p className="text-xs text-emerald-200">Physical Cash On-Hand At Station Safe</p>
          </div>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bankAccounts.map(acc => (
          <div key={acc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                  {acc.bankName}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-1">{acc.accountTitle}</h3>
                <p className="text-xs font-mono text-slate-500">{acc.accountNumber}</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Current Balance</p>
                <p className="text-lg font-black text-blue-900">{formatCurrency(acc.currentBalance)}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
              <p>
                <span className="font-bold">IBAN:</span> <span className="font-mono text-[11px]">{acc.iban}</span>
              </p>
              <p>
                <span className="font-bold">Branch:</span> {acc.branchName} (Code: {acc.branchCode})
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              {canDelete ? (
                <button
                  onClick={() => setBankToDelete(acc.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 font-bold text-xs flex items-center gap-1 transition-all"
                  title="Delete Bank Account"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedAcc(acc);
                    setTxType('DEPOSIT');
                    setIsTxModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" /> Deposit Cash
                </button>
                <button
                  onClick={() => {
                    setSelectedAcc(acc);
                    setTxType('WITHDRAWAL');
                    setIsTxModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" /> Withdraw
                </button>
              </div>
            </div>

            {/* Transactions Log */}
            {acc.transactions && acc.transactions.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Recent Transactions</p>
                <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                  {acc.transactions.map(tx => (
                    <div
                      key={tx.id}
                      className={`flex items-center justify-between text-xs p-2 rounded-lg border ${
                        tx.type === 'Deposit'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-950'
                          : 'bg-rose-50 border-rose-100 text-rose-950'
                      }`}
                    >
                      <div>
                        <span className="font-bold">{formatCurrency(tx.amount)}</span>
                        <span className="text-[11px] ml-2 font-medium">{tx.referenceNumber || tx.notes}</span>
                      </div>
                      <span className="text-[10px] opacity-75">{formatDate(tx.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Bank Account Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-blue-950 p-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base">Add New Bank Account</h3>
              <button onClick={() => setIsAddAccountModalOpen(false)} className="p-1 rounded bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  required
                  placeholder="e.g. Meezan Bank Limited"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account Title</label>
                  <input
                    type="text"
                    value={accountTitle}
                    onChange={e => setAccountTitle(e.target.value)}
                    required
                    placeholder="Bahu Petroleum"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Account #</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">IBAN Number</label>
                <input
                  type="text"
                  value={iban}
                  onChange={e => setIban(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Opening Balance (Rs)</label>
                <input
                  type="number"
                  value={currentBalance}
                  onChange={e => setCurrentBalance(Number(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md"
              >
                Link Bank Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Deposit / Withdraw Modal */}
      {isTxModalOpen && selectedAcc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            <div className={`p-4 text-white flex items-center justify-between ${txType === 'DEPOSIT' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              <h3 className="font-extrabold text-base">Bank {txType}</h3>
              <button onClick={() => setIsTxModalOpen(false)} className="p-1 rounded bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="p-6 space-y-4">
              <p className="text-xs font-bold text-slate-800">{selectedAcc.bankName} - {selectedAcc.accountTitle}</p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Amount (Rs)</label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={e => setTxAmount(Number(e.target.value))}
                  required
                  min={1}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Reference</label>
                <input
                  type="text"
                  value={txDesc}
                  onChange={e => setTxDesc(e.target.value)}
                  placeholder="Slip number, cheque number..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium outline-none"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md ${
                  txType === 'DEPOSIT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Execute {txType}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Bank Account Modal */}
      <ConfirmDeleteModal
        isOpen={bankToDelete !== null}
        title="Permanently Delete Bank Account"
        message="Are you sure you want to permanently delete this bank account? All associated transaction logs will be removed."
        onConfirm={() => {
          if (bankToDelete) {
            deleteBankAccount(bankToDelete);
            setBankToDelete(null);
          }
        }}
        onCancel={() => setBankToDelete(null)}
      />
    </div>
  );
};
