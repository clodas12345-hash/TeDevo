import { useState } from 'react';
import { User, Debt } from '../types';
import { Plus, CheckCircle, XCircle, DollarSign, Filter, Search } from 'lucide-react';

interface DebtsViewProps {
  currentUser: User;
  users: User[];
  debts: Debt[];
  onOpenAddDebt: () => void;
  onOpenPaymentForDebt: (debt: Debt) => void;
  onConfirmDebt: (debtId: string, status: 'confirmed' | 'rejected') => void;
}

export function DebtsView({
  currentUser,
  users,
  debts,
  onOpenAddDebt,
  onOpenPaymentForDebt,
  onConfirmDebt
}: DebtsViewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getUserName = (phone: string) => {
    const u = users.find(user => user.phone === phone);
    return u ? `${u.name} (${phone})` : phone;
  };

  const filteredDebts = debts.filter(d => {
    const involvesMe = d.debtorPhone === currentUser.phone || d.creditorPhone === currentUser.phone || d.creatorPhone === currentUser.phone;
    if (!involvesMe) return false;

    if (filterStatus === 'pending' && d.status !== 'pending_confirmation') return false;
    if (filterStatus === 'confirmed' && d.status !== 'confirmed') return false;
    if (filterStatus === 'settled' && d.status !== 'settled') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const descMatch = d.description.toLowerCase().includes(q);
      const debtorName = getUserName(d.debtorPhone).toLowerCase();
      const creditorName = getUserName(d.creditorPhone).toLowerCase();
      if (!descMatch && !debtorName.includes(q) && !creditorName.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gerenciamento de Dívidas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Veja quem deve a quem, confirme solicitações pendentes e realize abatimentos parciais.
          </p>
        </div>
        <button
          onClick={onOpenAddDebt}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Dívida / Conta Compartilhada</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Todas ({debts.filter(d => d.debtorPhone === currentUser.phone || d.creditorPhone === currentUser.phone).length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
              filterStatus === 'pending'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Pendentes de Confirmação
          </button>
          <button
            onClick={() => setFilterStatus('confirmed')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
              filterStatus === 'confirmed'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Confirmadas / Ativas
          </button>
          <button
            onClick={() => setFilterStatus('settled')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
              filterStatus === 'settled'
                ? 'bg-teal-600 text-white font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Quitadas
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por descrição ou pessoa..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Debts Table / Cards */}
      <div className="space-y-4">
        {filteredDebts.map(debt => {
          const isDebtor = debt.debtorPhone === currentUser.phone;
          const isCreditor = debt.creditorPhone === currentUser.phone;
          const isPending = debt.status === 'pending_confirmation';
          const isSettled = debt.status === 'settled';
          const debtorName = getUserName(debt.debtorPhone);
          const creditorName = getUserName(debt.creditorPhone);

          // Visual rule: Quando eu devo = vermelho em volta; quando tenho pra receber = verde em volta
          let cardStyle = '';
          if (isSettled) {
            cardStyle = 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70';
          } else if (isDebtor) {
            // Eu devo -> Borda vermelha marcante em volta
            cardStyle = 'border-2 border-red-500 shadow-md shadow-red-500/10 bg-red-50/25 dark:bg-red-950/20';
          } else if (isCreditor) {
            // Tenho pra receber -> Borda verde marcante em volta
            cardStyle = 'border-2 border-emerald-500 shadow-md shadow-emerald-500/10 bg-emerald-50/25 dark:bg-emerald-950/20';
          } else {
            cardStyle = 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm';
          }

          return (
            <div
              key={debt.id}
              className={`p-5 rounded-2xl transition-all ${cardStyle}`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    isSettled ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' :
                    isDebtor ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 ring-2 ring-red-400/30' :
                    'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 ring-2 ring-emerald-400/30'
                  }`}>
                    {debt.category === 'Serviços' ? '🧹' : debt.category === 'Alimentação' ? '🍽️' : debt.category === 'Transporte' ? '🚗' : '💳'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {debt.description}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {debt.category}
                      </span>
                      {/* Badge explícita de status de cobrança */}
                      {!isSettled && isDebtor && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-500 text-white shadow-xs">
                          🔴 Você deve
                        </span>
                      )}
                      {!isSettled && isCreditor && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-xs">
                          🟢 Você tem para receber
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5">
                      Devedor: <strong className={isDebtor ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-700 dark:text-slate-200'}>{debtorName}</strong> → Credor: <strong className={isCreditor ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-700 dark:text-slate-200'}>{creditorName}</strong>
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span>Criado em: {debt.date}</span>
                      {debt.dueDate && <span>Vencimento: {debt.dueDate}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-between gap-3 w-full md:w-auto">
                  <div className="text-left md:text-right">
                    <div className={`text-xl font-black tabular-nums ${
                      isSettled ? 'text-slate-500' :
                      isDebtor ? 'text-red-600 dark:text-red-400' :
                      'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      R$ {debt.amount.toFixed(2)}
                      {debt.originalAmount !== debt.amount && (
                        <span className="text-xs font-normal text-slate-400 line-through ml-2">
                          R$ {debt.originalAmount.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                      debt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' :
                      debt.status === 'pending_confirmation' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' :
                      debt.status === 'settled' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {debt.status === 'confirmed' ? 'Confirmada' :
                       debt.status === 'pending_confirmation' ? 'Pendente de Confirmação' :
                       debt.status === 'settled' ? 'Quitada' : 'Recusada'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* If pending and I am the debtor, show Confirm / Reject */}
                    {isPending && isDebtor && (
                      <>
                        <button
                          onClick={() => onConfirmDebt(debt.id, 'confirmed')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Confirmar Dívida</span>
                        </button>
                        <button
                          onClick={() => onConfirmDebt(debt.id, 'rejected')}
                          className="px-3 py-1.5 bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Recusar</span>
                        </button>
                      </>
                    )}

                    {/* If confirmed and I am debtor, can pay (partial or full) */}
                    {debt.status === 'confirmed' && isDebtor && (
                      <button
                        onClick={() => onOpenPaymentForDebt(debt)}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Pagar (Parcial / Total)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDebts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhuma dívida encontrada</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Não há registros correspondentes a este filtro ou termo de busca.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
