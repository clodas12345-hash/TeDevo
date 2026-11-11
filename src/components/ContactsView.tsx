import { useState } from 'react';
import { User, Debt } from '../types';
import { Users, Phone, ShieldCheck, ArrowRight, Trash2, UserPlus, X, AlertTriangle } from 'lucide-react';

interface ContactsViewProps {
  currentUser: User;
  users: User[];
  debts: Debt[];
  onOpenAddDebtWithPerson: (phone: string) => void;
  onDeleteUser: (phone: string, deleteDebts: boolean) => Promise<void>;
  onAddUser?: (user: { name: string; phone: string; avatar?: string }) => Promise<void>;
}

export function ContactsView({
  currentUser,
  users,
  debts,
  onOpenAddDebtWithPerson,
  onDeleteUser,
  onAddUser
}: ContactsViewProps) {
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  const [deleteDebtsOption, setDeleteDebtsOption] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Add user modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserAvatar, setNewUserAvatar] = useState('👤');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteUser) return;
    setIsDeleting(true);
    try {
      await onDeleteUser(confirmDeleteUser.phone, deleteDebtsOption);
      setConfirmDeleteUser(null);
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserPhone.trim()) {
      setAddError('Por favor, informe o nome e o telefone.');
      return;
    }
    const cleanPhone = newUserPhone.replace(/\D/g, '');
    if (cleanPhone.length < 8) {
      setAddError('Telefone inválido (mínimo 8 dígitos).');
      return;
    }

    setIsAdding(true);
    setAddError('');
    try {
      if (onAddUser) {
        await onAddUser({
          name: newUserName.trim(),
          phone: cleanPhone,
          avatar: newUserAvatar
        });
      }
      setShowAddModal(false);
      setNewUserName('');
      setNewUserPhone('');
      setNewUserAvatar('👤');
    } catch (err: any) {
      setAddError(err.message || 'Erro ao adicionar pessoa.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Comunidade & Pessoas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Membros conectados na rede TeDevo identificados por número de celular.
          </p>
        </div>

        {onAddUser && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Adicionar Pessoa</span>
          </button>
        )}
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

          // Debts count between currentUser and u
          const relatedDebtsCount = debts.filter(
            d => (d.debtorPhone === currentUser.phone && d.creditorPhone === u.phone) ||
                 (d.debtorPhone === u.phone && d.creditorPhone === currentUser.phone)
          ).length;

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
              key={u.id || u.phone}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 transition-all relative flex flex-col justify-between ${cardBorder}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                      isMe ? 'bg-slate-100 dark:bg-slate-800' :
                      balanceWithUser < 0 ? 'bg-red-100 text-red-600' :
                      balanceWithUser > 0 ? 'bg-emerald-100 text-emerald-600' :
                      'bg-slate-100 dark:bg-slate-800'
                    }`}>
                      {u.avatar || '👤'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
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

                  {/* Delete button at the top right of contact card */}
                  {!isMe && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteUser(u)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-all border border-transparent hover:border-red-200 dark:hover:border-red-900/60 shrink-0"
                      title={`Excluir ${u.name}`}
                      aria-label={`Excluir ${u.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {!isMe && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Balanço com {u.name}:</span>
                    <span className={`font-black tabular-nums text-sm ${balanceWithUser > 0 ? 'text-emerald-600 dark:text-emerald-400' : balanceWithUser < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-600'}`}>
                      {balanceWithUser > 0 ? `+ R$ ${balanceWithUser.toFixed(2)}` : balanceWithUser < 0 ? `- R$ ${Math.abs(balanceWithUser).toFixed(2)}` : 'R$ 0,00 (Quitações em dia)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenAddDebtWithPerson(u.phone)}
                      className="flex-1 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98"
                    >
                      <span>Nova Dívida</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteUser(u)}
                      className="px-3 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-98"
                      title={`Excluir ${u.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              )}

              {isMe && (
                <div className="pt-3 border-t border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sua conta principal ativa</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal to Delete Person */}
      {confirmDeleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Excluir Pessoa
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Remoção de contato da comunidade
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Person Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 flex items-center gap-3 border border-slate-200/80 dark:border-slate-700 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-2xl shrink-0">
                {confirmDeleteUser.avatar || '👤'}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {confirmDeleteUser.name}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 font-mono mt-0.5">
                  <Phone className="w-3 h-3" />
                  <span>{confirmDeleteUser.phone}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Tem certeza de que deseja excluir <strong>{confirmDeleteUser.name}</strong> da sua lista de pessoas no TeDevo?
            </p>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl mb-4">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteDebtsOption}
                  onChange={e => setDeleteDebtsOption(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">
                    Excluir também todas as dívidas e histórico com esta pessoa
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Remove contas a pagar, a receber e notificações vinculadas a este telefone.
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteUser(null)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Excluindo...' : 'Sim, Excluir'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Person Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <UserPlus className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Adicionar Nova Pessoa
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Pessoa
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cátia, Tatiane, Pedro..."
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone / Celular (WhatsApp)
                </label>
                <input
                  type="text"
                  placeholder="(11) 98888-7777"
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emoji de Identificação
                </label>
                <div className="flex gap-2 text-xl">
                  {['👤', '👩', '👨', '👧', '👵', '🧹', '💼', '🚗'].map(emoji => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setNewUserAvatar(emoji)}
                      className={`p-2 rounded-xl border text-xl transition-all ${
                        newUserAvatar === emoji
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 scale-105'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {addError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-900">
                  {addError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-98"
                >
                  {isAdding ? 'Adicionando...' : 'Adicionar Pessoa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
