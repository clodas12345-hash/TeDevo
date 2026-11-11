import { useState } from 'react';
import { User, RecurringItem } from '../types';
import { Calendar as CalendarIcon, Plus, Sparkles, Clock } from 'lucide-react';

interface CalendarViewProps {
  currentUser: User;
  users: User[];
  recurring: RecurringItem[];
  onAddRecurring: (item: { title: string; amount: number; frequencyDays: number; description: string; targetPhone: string }) => void;
}

export function CalendarView({ currentUser, users, recurring, onAddRecurring }: CalendarViewProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('Faxina Quinzenal');
  const [amount, setAmount] = useState('150');
  const [frequencyDays, setFrequencyDays] = useState('15');
  const [targetPhone, setTargetPhone] = useState(users.find(u => u.phone !== currentUser.phone)?.phone || '');
  const [description, setDescription] = useState('Faxina regular no apartamento, pago com até 30 dias.');

  const getUserName = (phone: string) => {
    const u = users.find(user => user.phone === phone);
    return u ? u.name : phone;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    onAddRecurring({
      title,
      amount: Number(amount),
      frequencyDays: Number(frequencyDays),
      description,
      targetPhone: targetPhone || currentUser.phone
    });
    setShowAdd(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-emerald-600" />
            <span>Calendário & Compromissos Recorrentes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Programe compromissos automáticos (como a faxina da diarista a cada 15 dias) e controle vencimentos.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Recorrência / Lembrete</span>
        </button>
      </div>

      {/* Diarista Spotlight Card */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shrink-0">
            🧹
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/20 rounded-full text-xs font-medium text-teal-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regra Especial: Diarista</span>
            </div>
            <h3 className="text-xl font-bold">Faxina do Apartamento a cada 15 dias</h3>
            <p className="text-xs text-teal-100 mt-1 max-w-2xl leading-relaxed">
              O aplicativo lembra automaticamente quando a faxina quinzenal é realizada (~R$ 150,00), com prazo estimado de pagamento em 30 dias para facilitar o fluxo de caixa da comunidade.
            </p>
          </div>
        </div>
      </div>

      {/* Recurring List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recurring.map(item => {
          const targetName = getUserName(item.targetPhone);

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Frequência: a cada {item.frequencyDays} dias · Participante: {targetName}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                    R$ {item.amount.toFixed(2)}
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    Próximo: {item.nextDueDate}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Add Recurring Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Nova Recorrência
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Título do Compromisso
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Valor Médio (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white tabular-nums font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Frequência (Dias)
                  </label>
                  <input
                    type="number"
                    value={frequencyDays}
                    onChange={e => setFrequencyDays(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Descrição / Regra
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  Salvar Recorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
