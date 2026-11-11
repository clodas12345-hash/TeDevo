import { User, NotificationItem } from '../types';
import { Bell, LogOut, Users, Calendar, DollarSign, PieChart, Smartphone } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenPermissions: () => void;
  onLogout: () => void;
}

export function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  notifications,
  onOpenNotifications,
  onOpenPermissions,
  onLogout
}: NavbarProps) {
  const unreadCount = notifications.filter(
    n => n.recipientPhone === currentUser.phone && !n.read
  ).length;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-600/20">
            🤝
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              TeDevo
            </h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              Comunidade de Dívidas
            </span>
          </div>
        </div>

        {/* Zone 2: 3-4 Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Resumo</span>
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'debts'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Dívidas</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'calendar'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendário & Diarista</span>
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'contacts'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pessoas</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Permissions/APK, Notifications & Profile) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPermissions}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors"
            title="Permissões nativas e compilação do APK no GitHub"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gerar APK / Permissões</span>
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Notificações e Confirmações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentUser.phone}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-500 transition-colors"
              title="Trocar de Conta / Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar (Bottom or Sub-header) */}
      <div className="md:hidden flex items-center justify-around bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium ${
            activeTab === 'dashboard' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
        >
          <PieChart className="w-4 h-4 mb-0.5" />
          <span>Resumo</span>
        </button>
        <button
          onClick={() => setActiveTab('debts')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium ${
            activeTab === 'debts' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
        >
          <DollarSign className="w-4 h-4 mb-0.5" />
          <span>Dívidas</span>
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium ${
            activeTab === 'calendar' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>Agenda</span>
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[11px] font-medium ${
            activeTab === 'contacts' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
          }`}
        >
          <Users className="w-4 h-4 mb-0.5" />
          <span>Pessoas</span>
        </button>
      </div>
    </header>
  );
}
