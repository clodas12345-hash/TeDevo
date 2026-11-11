import { User, NotificationItem } from '../types';
import { X, Bell, CheckCircle2, ArrowRight } from 'lucide-react';

interface NotificationsModalProps {
  currentUser: User;
  users: User[];
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onGoToDebts: () => void;
}

export function NotificationsModal({
  currentUser,
  users,
  notifications,
  onClose,
  onMarkRead,
  onGoToDebts
}: NotificationsModalProps) {
  const myNotifs = notifications.filter(n => n.recipientPhone === currentUser.phone);

  const getUserName = (phone: string) => {
    const u = users.find(user => user.phone === phone);
    return u ? u.name : phone;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 relative max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Notificações & Alertas
              </h3>
              <p className="text-xs text-slate-500">
                Avisos de novas dívidas, confirmações e pagamentos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {myNotifs.map(n => {
            const senderName = getUserName(n.senderPhone);

            return (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all ${
                  !n.read
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      De: {senderName} ({n.senderPhone}) · {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-100 text-emerald-600 text-xs font-medium border border-slate-200 dark:border-slate-700 shrink-0"
                      title="Marcar como lida"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {n.type === 'debt_request' && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex justify-end">
                    <button
                      onClick={() => {
                        onMarkRead(n.id);
                        onClose();
                        onGoToDebts();
                      }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <span>Ver Dívida para Confirmar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {myNotifs.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-xs">
              Nenhuma notificação no momento.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
