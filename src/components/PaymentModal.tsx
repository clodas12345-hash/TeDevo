import { useState } from 'react';
import { User, Debt } from '../types';
import { X, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  currentUser: User;
  users: User[];
  selectedDebt: Debt | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ currentUser, users, selectedDebt, onClose, onSuccess }: PaymentModalProps) {
  const [debtId, setDebtId] = useState(selectedDebt ? selectedDebt.id : '');
  const [amount, setAmount] = useState(selectedDebt ? selectedDebt.amount.toString() : '');
  const [note, setNote] = useState(selectedDebt ? `Pagamento referente a: ${selectedDebt.description}` : 'Pagamento parcial/total');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getUserName = (phone: string) => {
    const u = users.find(user => user.phone === phone);
    return u ? u.name : phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Informe um valor de pagamento válido.');
      return;
    }

    // Determine receiver and payer
    // If selectedDebt is present:
    // If currentUser is debtor, receiver is creditor.
    let receiverPhone = '';
    if (selectedDebt) {
      receiverPhone = selectedDebt.creditorPhone === currentUser.phone ? selectedDebt.debtorPhone : selectedDebt.creditorPhone;
    } else {
      // Find someone
      receiverPhone = users.find(u => u.phone !== currentUser.phone)?.phone || '';
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debtId: debtId || undefined,
          payerPhone: currentUser.phone,
          receiverPhone,
          amount: numAmount,
          note
        })
      });

      if (!res.ok) {
        throw new Error('Erro ao registrar pagamento');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>Registrar Pagamento</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Abatimento parcial ou quitação de débito.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedDebt && (
          <div className={`mb-4 p-3.5 rounded-2xl border-2 text-xs ${
            selectedDebt.debtorPhone === currentUser.phone
              ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20'
              : 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedDebt.description}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedDebt.debtorPhone === currentUser.phone
                  ? 'bg-red-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}>
                {selectedDebt.debtorPhone === currentUser.phone ? '🔴 Você deve' : '🟢 A receber'}
              </span>
            </div>
            <div className="text-slate-600 dark:text-slate-300 mt-1.5">
              Saldo pendente atual: <strong className={selectedDebt.debtorPhone === currentUser.phone ? 'text-red-600 dark:text-red-400 font-bold' : 'text-emerald-600 dark:text-emerald-400 font-bold'}>R$ {selectedDebt.amount.toFixed(2)}</strong>
            </div>
            <div className="text-slate-500 mt-0.5 text-[11px]">
              Credor: <strong className="text-slate-700 dark:text-slate-200">{getUserName(selectedDebt.creditorPhone)}</strong>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Valor Pago (R$) {selectedDebt && `(Máx: R$ ${selectedDebt.amount.toFixed(2)})`}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <DollarSign className="w-4 h-4" />
              </span>
              <input
                type="number"
                step="0.01"
                max={selectedDebt ? selectedDebt.amount : undefined}
                placeholder="50.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums font-bold"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Se for pagamento parcial, o restante continuará pendente automaticamente.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Observação / Descrição do Pagamento
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <FileText className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Ex: Pix parcial da faxina"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
            >
              {loading ? 'Salvando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
