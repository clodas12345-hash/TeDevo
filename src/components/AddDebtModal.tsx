import { useState } from 'react';
import { User } from '../types';
import { X, DollarSign, Calendar, Users, Phone, FileText } from 'lucide-react';

interface AddDebtModalProps {
  currentUser: User;
  users: User[];
  onClose: () => void;
  onSuccess: () => void;
  initialValues?: { description?: string; amount?: number; category?: string };
}

export function AddDebtModal({ currentUser, users, onClose, onSuccess, initialValues }: AddDebtModalProps) {
  const [description, setDescription] = useState(initialValues?.description || '');
  const [amount, setAmount] = useState(initialValues?.amount ? initialValues.amount.toString() : '');
  const [category, setCategory] = useState(initialValues?.category || 'Geral');
  
  // By default, I am creditor (I paid or someone owes me), or I am debtor (I owe someone).
  const [role, setRole] = useState<'i_am_creditor' | 'i_am_debtor'>('i_am_creditor');
  
  // Other person's phone
  const [otherPhone, setOtherPhone] = useState('');
  const [selectedContactPhone, setSelectedContactPhone] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [isSplit, setIsSplit] = useState(false);
  const [splitPhones, setSplitPhones] = useState<string[]>([currentUser.phone]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const targetPhone = selectedContactPhone || otherPhone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Informe a descrição da dívida/conta.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Informe um valor válido.');
      return;
    }
    if (!targetPhone || targetPhone.length < 8) {
      setError('Informe o número de telefone da outra pessoa.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const creditorPhone = role === 'i_am_creditor' ? currentUser.phone : targetPhone;
      const debtorPhone = role === 'i_am_creditor' ? targetPhone : currentUser.phone;

      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorPhone: currentUser.phone,
          creditorPhone,
          debtorPhone,
          amount: numAmount,
          description,
          category,
          dueDate,
          sharedPhones: isSplit ? splitPhones : []
        })
      });

      if (!res.ok) {
        throw new Error('Erro ao registrar dívida');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = (phone: string) => {
    setSelectedContactPhone(phone);
    setOtherPhone('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Nova Dívida / Conta
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Informe os dados da conta compartilhada com base no número do celular.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setRole('i_am_creditor')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                role === 'i_am_creditor'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Outra pessoa me deve
            </button>
            <button
              type="button"
              onClick={() => setRole('i_am_debtor')}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                role === 'i_am_debtor'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Eu devo para outra pessoa
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Descrição do que aconteceu (Ex: Faxina, Jantar, Uber...)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <FileText className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Ex: Faxina quinzenal no apartamento"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Valor (R$)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <DollarSign className="w-4 h-4" />
                </span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="150.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Serviços">Serviços / Diarista</option>
                <option value="Alimentação">Alimentação / Jantar</option>
                <option value="Transporte">Transporte / Uber</option>
                <option value="Moradia">Moradia / Contas</option>
                <option value="Geral">Outros / Geral</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {role === 'i_am_creditor' ? 'Quem deve para você?' : 'A quem você deve?'} (Selecione ou digite o telefone)
            </label>
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {users.filter(u => u.phone !== currentUser.phone).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectContact(u.phone)}
                    className={`p-2 rounded-xl border text-left text-xs font-medium flex items-center gap-1.5 transition-all ${
                      selectedContactPhone === u.phone
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{u.avatar || '👤'}</span>
                    <div className="truncate">
                      <div className="font-bold">{u.name}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Ou digite o celular (Ex: 11988882222)"
                  value={otherPhone}
                  onChange={e => {
                    setOtherPhone(e.target.value);
                    setSelectedContactPhone('');
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Data de Vencimento Prevista
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Multi-person split option */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Dividir entre 3 ou 4 pessoas?
                </span>
              </div>
              <input
                type="checkbox"
                checked={isSplit}
                onChange={e => setIsSplit(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>
            {isSplit && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-[11px] text-slate-500">
                  Todas as pessoas selecionadas receberão notificação para confirmar a parte delas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {users.map(u => (
                    <label key={u.phone} className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <input
                        type="checkbox"
                        checked={splitPhones.includes(u.phone)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSplitPhones([...splitPhones, u.phone]);
                          } else {
                            setSplitPhones(splitPhones.filter(p => p !== u.phone));
                          }
                        }}
                        className="rounded text-emerald-600"
                      />
                      <span>{u.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
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
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              {loading ? 'Salvando...' : 'Salvar & Notificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
