import { User, Debt, Payment } from '../types';
import { ArrowUpRight, ArrowDownLeft, Plus, DollarSign, Calendar, Clock, CheckCircle2, AlertCircle, Smartphone, Cloud } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  users: User[];
  debts: Debt[];
  payments: Payment[];
  onOpenAddDebt: () => void;
  onOpenPayment: () => void;
  onQuickDiarista: () => void;
  onSelectTab: (tab: string) => void;
  onOpenPermissions?: () => void;
}

export function Dashboard({
  currentUser,
  users,
  debts,
  payments,
  onOpenAddDebt,
  onOpenPayment,
  onQuickDiarista,
  onSelectTab,
  onOpenPermissions
}: DashboardProps) {
  // Calculate totals
  // If I am the debtor (debtorPhone === currentUser.phone) and status === 'confirmed' -> I owe this amount
  // If I am the creditor (creditorPhone === currentUser.phone) and status === 'confirmed' -> Others owe me this amount
  
  const myConfirmedDebts = debts.filter(
    d => d.debtorPhone === currentUser.phone && d.status === 'confirmed' && d.amount > 0
  );
  const totalIOwe = myConfirmedDebts.reduce((acc, d) => acc + d.amount, 0);

  const othersOweMe = debts.filter(
    d => d.creditorPhone === currentUser.phone && d.status === 'confirmed' && d.amount > 0 && d.debtorPhone !== currentUser.phone
  );
  const totalOwedToMe = othersOweMe.reduce((acc, d) => acc + d.amount, 0);

  const netBalance = totalOwedToMe - totalIOwe;

  const pendingConfirmationCount = debts.filter(
    d => d.debtorPhone === currentUser.phone && d.status === 'pending_confirmation'
  ).length;

  const getUserName = (phone: string) => {
    const u = users.find(user => user.phone === phone);
    return u ? u.name : phone;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium">
                <span>{currentUser.avatar || '🤝'}</span>
                <span>Conectado como {currentUser.name} ({currentUser.phone})</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 backdrop-blur-md rounded-full text-[11px] font-semibold text-emerald-200 border border-emerald-400/30">
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span>Nuvem Ativa: Se desinstalar o app, tudo será restaurado pelo seu telefone</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Controle suas contas sem burocracia
            </h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Gerencie dívidas com a Cátia, Tatiane ou qualquer pessoa apenas pelo número do celular. Confirmações instantâneas via notificação.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={onOpenAddDebt}
              className="px-4 py-2.5 bg-white text-emerald-800 font-semibold rounded-xl text-xs sm:text-sm shadow-lg hover:bg-emerald-50 transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Dívida</span>
            </button>
            <button
              onClick={onOpenPayment}
              className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm backdrop-blur-md border border-emerald-500/40 transition-all flex items-center gap-2 active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              <span>Registrar Pagamento</span>
            </button>
            {onOpenPermissions && (
              <button
                onClick={onOpenPermissions}
                className="px-3.5 py-2.5 bg-emerald-900/60 hover:bg-emerald-900/80 text-white font-semibold rounded-xl text-xs sm:text-sm backdrop-blur-md border border-emerald-400/30 transition-all flex items-center gap-1.5 active:scale-95"
                title="Permissões nativas e compilação do APK"
              >
                <Smartphone className="w-4 h-4 text-emerald-300" />
                <span>Gerar APK & Permissões</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pending Confirmation Alert if any */}
      {pendingConfirmationCount > 0 && (
        <div 
          onClick={() => onSelectTab('debts')}
          className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-100/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Você tem {pendingConfirmationCount} {pendingConfirmationCount === 1 ? 'dívida pendente' : 'dívidas pendentes'} de confirmação!
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Alguém registrou uma conta em seu nome. Clique para revisar e confirmar.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/60 px-3 py-1.5 rounded-xl">
            Revisar &rarr;
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Owed By Me - Red outline in volta */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-red-500 shadow-md shadow-red-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🔴</span>
              <span>Você Deve</span>
            </span>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-950/60 text-red-600 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-600 dark:text-red-400 tabular-nums">
            R$ {totalIOwe.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {myConfirmedDebts.length} {myConfirmedDebts.length === 1 ? 'conta ativa' : 'contas ativas'} pendentes de acerto
          </p>
        </div>

        {/* Total Owed To Me - Green outline in volta */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-emerald-500 shadow-md shadow-emerald-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🟢</span>
              <span>Te Devem (Para Receber)</span>
            </span>
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            R$ {totalOwedToMe.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {othersOweMe.length} {othersOweMe.length === 1 ? 'pessoa te deve' : 'pessoas te devem'}
          </p>
        </div>

        {/* Net Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Líquido Comunitário</span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${netBalance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-black tabular-nums ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {netBalance >= 0 ? `+ R$ ${netBalance.toFixed(2)}` : `- R$ ${Math.abs(netBalance).toFixed(2)}`}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {netBalance >= 0 ? 'Você tem saldo positivo geral' : 'Você está devendo no total geral'}
          </p>
        </div>
      </div>

      {/* Quick Diarista Shortcut Card (per user requirement) */}
      <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-md">
            🧹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-teal-950 dark:text-teal-200">
                Atalho Rápido: Diarista (Faxina Quinzenal)
              </h3>
              <span className="px-2 py-0.5 bg-teal-200 dark:bg-teal-900 text-teal-800 dark:text-teal-300 text-[10px] font-bold rounded-full">
                R$ 150 / 15 dias
              </span>
            </div>
            <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">
              "A diarista faz faxina no meu apartamento de 15 em 15 dias. Fico devendo média de R$ 150, pago com 30 dias."
            </p>
          </div>
        </div>
        <button
          onClick={onQuickDiarista}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95"
        >
          Adicionar Faxina R$ 150
        </button>
      </div>

      {/* Recent Debts & Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Debts Involving Me */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span>Dívidas Recentes Envolvendo Você</span>
            </h3>
            <button
              onClick={() => onSelectTab('debts')}
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Ver todas &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {debts
              .filter(d => d.debtorPhone === currentUser.phone || d.creditorPhone === currentUser.phone)
              .slice(0, 4)
              .map(debt => {
                const isIOwe = debt.debtorPhone === currentUser.phone;
                const otherPhone = isIOwe ? debt.creditorPhone : debt.debtorPhone;
                const otherName = getUserName(otherPhone);

                return (
                  <div
                    key={debt.id}
                    className={`p-3.5 rounded-xl border-2 flex items-center justify-between gap-3 transition-all ${
                      isIOwe
                        ? 'border-red-500 bg-red-50/25 dark:bg-red-950/20 shadow-xs'
                        : 'border-emerald-500 bg-emerald-50/25 dark:bg-emerald-950/20 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIOwe ? 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                      }`}>
                        {isIOwe ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {debt.description}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                            isIOwe ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {isIOwe ? '🔴 Devo' : '🟢 Receber'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {isIOwe ? `Você deve para ${otherName}` : `${otherName} te deve`} · {debt.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-sm font-black tabular-nums ${isIOwe ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        R$ {debt.amount.toFixed(2)}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        debt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                        debt.status === 'pending_confirmation' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {debt.status === 'confirmed' ? 'Confirmada' : debt.status === 'pending_confirmation' ? 'Pendente' : 'Quitada'}
                      </span>
                    </div>
                  </div>
                );
              })}

            {debts.filter(d => d.debtorPhone === currentUser.phone || d.creditorPhone === currentUser.phone).length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Nenhuma dívida registrada ainda. Adicione a primeira!
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments Feed */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-500" />
              <span>Últimos Pagamentos Realizados</span>
            </h3>
            <span className="text-xs text-slate-400">Abatimentos e Quitações</span>
          </div>

          <div className="space-y-3">
            {payments.slice(0, 4).map(pay => {
              const payerName = getUserName(pay.payerPhone);
              const receiverName = getUserName(pay.receiverPhone);
              const isMyPayment = pay.payerPhone === currentUser.phone;
              const isMyReceipt = pay.receiverPhone === currentUser.phone;

              return (
                <div
                  key={pay.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-teal-100 dark:bg-teal-950/60 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                      💸
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {pay.note}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {payerName} pagou para {receiverName} · {pay.date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                      R$ {pay.amount.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isMyPayment ? 'Você pagou' : isMyReceipt ? 'Você recebeu' : 'Registrado'}
                    </span>
                  </div>
                </div>
              );
            })}

            {payments.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">
                Nenhum pagamento registrado ainda.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
