import { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { User, Debt, Payment, NotificationItem, RecurringItem } from './types';
import { LoginModal } from './components/LoginModal';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { DebtsView } from './components/DebtsView';
import { CalendarView } from './components/CalendarView';
import { ContactsView } from './components/ContactsView';
import { AddDebtModal } from './components/AddDebtModal';
import { PaymentModal } from './components/PaymentModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PermissionsModal } from './components/PermissionsModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('tedevo_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [recurring, setRecurring] = useState<RecurringItem[]>([]);

  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const tabHistoryRef = useRef<string[]>(['dashboard']);

  const setActiveTab = (tab: string) => {
    if (tab !== activeTab) {
      tabHistoryRef.current.push(tab);
      setActiveTabState(tab);
    }
  };

  // Modals state
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [initialDebtValues, setInitialDebtValues] = useState<{ description?: string; amount?: number; category?: string } | undefined>(undefined);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedDebtForPayment, setSelectedDebtForPayment] = useState<Debt | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  // Keep a reference to current state so the single listener instance accesses fresh values
  const stateRef = useRef({
    showPermissions,
    showNotifications,
    showPayment,
    showAddDebt,
    activeTab
  });

  useEffect(() => {
    stateRef.current = {
      showPermissions,
      showNotifications,
      showPayment,
      showAddDebt,
      activeTab
    };
  });

  // Register App.addListener('backButton') once on app init, and remove on unmount
  useEffect(() => {
    let listenerHandle: { remove: () => Promise<void> | void } | null = null;

    CapacitorApp.addListener('backButton', () => {
      const current = stateRef.current;

      // 1. Se houver um modal, menu ou tela aberta por cima, feche só isso.
      if (current.showPermissions) {
        setShowPermissions(false);
        return;
      }
      if (current.showNotifications) {
        setShowNotifications(false);
        return;
      }
      if (current.showPayment) {
        setShowPayment(false);
        setSelectedDebtForPayment(null);
        return;
      }
      if (current.showAddDebt) {
        setShowAddDebt(false);
        setInitialDebtValues(undefined);
        return;
      }

      // 2. Se estiver em uma tela interna, volte para a tela anterior dentro do app.
      if (tabHistoryRef.current.length > 1) {
        tabHistoryRef.current.pop();
        const prevTab = tabHistoryRef.current[tabHistoryRef.current.length - 1] || 'dashboard';
        setActiveTabState(prevTab);
        return;
      }

      if (current.activeTab !== 'dashboard') {
        setActiveTabState('dashboard');
        return;
      }

      // 3. Se já estiver na tela inicial ('dashboard'), não faça nada. Nunca chame App.exitApp().
    }).then(handle => {
      listenerHandle = handle;
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      const data = await res.json();
      setUsers(data.users || []);
      setDebts(data.debts || []);
      setPayments(data.payments || []);
      setNotifications(data.notifications || []);
      setRecurring(data.recurring || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    // Register Service Worker for push notifications & offline
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('SW registration note:', err);
      });
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('tedevo_current_user', JSON.stringify(user));
    fetchData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tedevo_current_user');
  };

  const handleConfirmDebt = async (debtId: string, status: 'confirmed' | 'rejected') => {
    if (!currentUser) return;
    try {
      await fetch(`/api/debts/${debtId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, userPhone: currentUser.phone })
      });
      await fetchData();
    } catch (err) {
      console.error('Error confirming debt:', err);
    }
  };

  const handleMarkRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: 'POST' });
      await fetchData();
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleAddRecurring = async (item: { title: string; amount: number; frequencyDays: number; description: string; targetPhone: string }) => {
    if (!currentUser) return;
    try {
      await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          creatorPhone: currentUser.phone
        })
      });
      await fetchData();
    } catch (err) {
      console.error('Error adding recurring item:', err);
    }
  };

  const handleDeleteUser = async (phone: string, deleteDebts: boolean = true) => {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(phone)}?deleteDebts=${deleteDebts}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Falha ao excluir pessoa.');
      }
      await fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  const handleAddUser = async (user: { name: string; phone: string; avatar?: string }) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao adicionar pessoa.');
      }
      await fetchData();
    } catch (err) {
      console.error('Error adding user:', err);
      throw err;
    }
  };

  const handleQuickDiarista = () => {
    setInitialDebtValues({
      description: 'Faxina do apartamento quinzenal',
      amount: 150,
      category: 'Serviços'
    });
    setShowAddDebt(true);
  };

  if (!currentUser) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenPermissions={() => setShowPermissions(true)}
        onLogout={handleLogout}
      />

      <main>
        {activeTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            users={users}
            debts={debts}
            payments={payments}
            onOpenAddDebt={() => {
              setInitialDebtValues(undefined);
              setShowAddDebt(true);
            }}
            onOpenPayment={() => {
              setSelectedDebtForPayment(null);
              setShowPayment(true);
            }}
            onQuickDiarista={handleQuickDiarista}
            onSelectTab={setActiveTab}
            onOpenPermissions={() => setShowPermissions(true)}
          />
        )}

        {activeTab === 'debts' && (
          <DebtsView
            currentUser={currentUser}
            users={users}
            debts={debts}
            onOpenAddDebt={() => {
              setInitialDebtValues(undefined);
              setShowAddDebt(true);
            }}
            onOpenPaymentForDebt={debt => {
              setSelectedDebtForPayment(debt);
              setShowPayment(true);
            }}
            onConfirmDebt={handleConfirmDebt}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            currentUser={currentUser}
            users={users}
            recurring={recurring}
            onAddRecurring={handleAddRecurring}
          />
        )}

        {activeTab === 'contacts' && (
          <ContactsView
            currentUser={currentUser}
            users={users}
            debts={debts}
            onOpenAddDebtWithPerson={phone => {
              setInitialDebtValues(undefined);
              setShowAddDebt(true);
            }}
            onDeleteUser={handleDeleteUser}
            onAddUser={handleAddUser}
          />
        )}
      </main>

      {/* Modals */}
      {showAddDebt && (
        <AddDebtModal
          currentUser={currentUser}
          users={users}
          initialValues={initialDebtValues}
          onClose={() => {
            setShowAddDebt(false);
            setInitialDebtValues(undefined);
          }}
          onSuccess={() => {
            setShowAddDebt(false);
            setInitialDebtValues(undefined);
            fetchData();
          }}
        />
      )}

      {showPayment && (
        <PaymentModal
          currentUser={currentUser}
          users={users}
          selectedDebt={selectedDebtForPayment}
          onClose={() => {
            setShowPayment(false);
            setSelectedDebtForPayment(null);
          }}
          onSuccess={() => {
            setShowPayment(false);
            setSelectedDebtForPayment(null);
            fetchData();
          }}
        />
      )}

      {showNotifications && (
        <NotificationsModal
          currentUser={currentUser}
          users={users}
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkRead={handleMarkRead}
          onGoToDebts={() => setActiveTab('debts')}
        />
      )}

      {showPermissions && (
        <PermissionsModal
          onClose={() => setShowPermissions(false)}
        />
      )}
    </div>
  );
}
