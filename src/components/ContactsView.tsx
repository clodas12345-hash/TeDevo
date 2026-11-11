import { User, Debt } from '../types';
import { Users, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

interface ContactsViewProps {
  currentUser: User;
  users: User[];
  debts: Debt[];
  onOpenAddDebtWithPerson: (phone: string) => void;
}

export function ContactsView({ currentUser, users, debts, onOpenAddDebtWithPerson }: ContactsViewProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600" />
          <span>Comunidade & Pessoas</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Membros conectados na rede TeDevo identificados por número de celular.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(u => {
          const isMe = u.phone === currentUser.phone;

          // Calculate net balance with this user
          // Debts where I owe u
          const iOweThem = debts
            .filter(d => d.debtorPhone === currentUser.phone && d.creditorPhone === u.phone && d.status === 'confirmed')
            .reduce((acc, d) => acc + d.amount, 0);

          // Debts where u owe me
          const theyOweMe = debts
            .filter(d => d.debtorPhone === u.phone && d.creditorPhone === currentUser.phone && d.status === 'confirmed')
            .reduce((acc, d) => acc + d.amount, 0);

          const balanceWithUser = theyOweMe - iOweThem;

          // Visual rule: se eu devo = borda vermelha em volta; se tenho a receber = borda verde em volta
          let cardBorder = '';
          if (isMe) {
            cardBorder = 'border-2 border-slate-300 dark:border-slate-700 shadow-sm bg-slate-50/50 dark:bg-slate-800/40';
          } else if (balanceWithUser < 0) {
            // Eu devo para esta pessoa
            cardBorder = 'border-2 border-red-500 shadow-md shadow-red-500/10 bg-red-50/20 dark:bg-red-950/20';
          } else if (balanceWithUser > 0) {
            // Tenho para receber desta pessoa
            cardBorder = 'border-2 border-emerald-500 shadow-md shadow-emerald-500/10 bg-emerald-50/20 dark:bg-emerald-950/20';
          } else {
            cardBorder = 'border border-slate-200 dark:border-slate-800 shadow-sm';
          }

          return (
            <div
              key={u.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 transition-all ${cardBorder}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                    isMe ? 'bg-slate-100 dark:bg-slate-800' :
                    balanceWithUser < 0 ? 'bg-red-100 text-red-600' :
                    balanceWithUser > 0 ? 'bg-emerald-100 text-emerald-600' :
                    'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    {u.avatar || '👤'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {isMe && (
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-[10px] font-bold">
                          Você
                        </span>
                      )}
                      {!isMe && balanceWithUser < 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white rounded-md text-[10px] font-bold">
                          🔴 Você deve
                        </span>
                      )}
                      {!isMe && balanceWithUser > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold">
                          🟢 A receber
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-400 font-mono mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{u.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {!isMe && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Balanço com {u.name}:</span>
                    <span className={`font-black tabular-nums text-sm ${balanceWithUser > 0 ? 'text-emerald-600 dark:text-emerald-400' : balanceWithUser < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600'}`}>
                      {balanceWithUser > 0 ? `+ R$ ${balanceWithUser.toFixed(2)}` : balanceWithUser < 0 ? `- R$ ${Math.abs(balanceWithUser).toFixed(2)}` : 'R$ 0,00 (Quitações em dia)'}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenAddDebtWithPerson(u.phone)}
                    className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
                  >
                    <span>Nova Dívida com {u.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {isMe && (
                <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sua conta principal ativa</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
