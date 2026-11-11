import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

interface User {
  id: string;
  name: string;
  phone: string;
  pin: string;
  avatar?: string;
}

interface Debt {
  id: string;
  creatorPhone: string;
  creditorPhone: string; // Quem vai receber
  debtorPhone: string;   // Quem deve
  amount: number;        // Valor restante atual
  originalAmount: number;// Valor original
  description: string;
  category: string;
  date: string;
  dueDate?: string;
  status: 'pending_confirmation' | 'confirmed' | 'settled' | 'rejected';
  sharedPhones?: string[]; // Se for divisão entre vários
}

interface Payment {
  id: string;
  debtId?: string;
  payerPhone: string;
  receiverPhone: string;
  amount: number;
  date: string;
  note: string;
}

interface NotificationItem {
  id: string;
  recipientPhone: string;
  senderPhone: string;
  type: 'debt_request' | 'debt_confirmed' | 'payment_received' | 'rejected';
  title: string;
  message: string;
  relatedId: string;
  read: boolean;
  createdAt: string;
}

interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  creatorPhone: string;
  targetPhone: string;
  frequencyDays: number;
  nextDueDate: string;
  description: string;
}

interface AppData {
  users: User[];
  debts: Debt[];
  payments: Payment[];
  notifications: NotificationItem[];
  recurring: RecurringItem[];
}

const initialData: AppData = {
  users: [
    { id: '1', name: 'Clodas', phone: '11999991111', pin: '1234', avatar: '👨🏽' },
    { id: '2', name: 'Cátia', phone: '11988882222', pin: '1234', avatar: '👩🏼' },
    { id: '3', name: 'Tatiane', phone: '11977773333', pin: '1234', avatar: '👩🏻' },
    { id: '4', name: 'Maria (Diarista)', phone: '11966664444', pin: '1234', avatar: '🧹' }
  ],
  debts: [
    {
      id: 'd1',
      creatorPhone: '11999991111',
      creditorPhone: '11988882222',
      debtorPhone: '11999991111',
      amount: 150,
      originalAmount: 150,
      description: 'Faxina do apartamento quinzenal',
      category: 'Serviços',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'confirmed'
    },
    {
      id: 'd2',
      creatorPhone: '11977773333',
      creditorPhone: '11988882222',
      debtorPhone: '11977773333',
      amount: 90,
      originalAmount: 90,
      description: 'Almoço de domingo em família',
      category: 'Alimentação',
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      status: 'confirmed'
    },
    {
      id: 'd3',
      creatorPhone: '11999991111',
      creditorPhone: '11999991111',
      debtorPhone: '11977773333',
      amount: 45,
      originalAmount: 45,
      description: 'Uber compartilhado aeroporto',
      category: 'Transporte',
      date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      status: 'pending_confirmation'
    }
  ],
  payments: [
    {
      id: 'p1',
      debtId: 'd1',
      payerPhone: '11999991111',
      receiverPhone: '11988882222',
      amount: 50,
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      note: 'Pagamento parcial da faxina'
    }
  ],
  notifications: [
    {
      id: 'n1',
      recipientPhone: '11977773333',
      senderPhone: '11999991111',
      type: 'debt_request',
      title: 'Nova dívida para confirmar',
      message: 'Clodas registrou uma dívida de R$ 45,00 (Uber compartilhado aeroporto) com você.',
      relatedId: 'd3',
      read: false,
      createdAt: new Date().toISOString()
    }
  ],
  recurring: [
    {
      id: 'r1',
      title: 'Faxina Quinzenal Apartamento',
      amount: 150,
      creatorPhone: '11999991111',
      targetPhone: '11966664444',
      frequencyDays: 15,
      nextDueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      description: 'Faxina regular realizada a cada 15 dias, pago em até 30 dias.'
    }
  ]
};

function loadData(): AppData {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return initialData;
    }
  }
  saveData(initialData);
  return initialData;
}

function saveData(data: AppData) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function normalizePhone(p: string | undefined): string {
  if (!p) return '';
  return p.replace(/\D/g, '');
}

// API Routes
app.get('/api/data', (req, res) => {
  const data = loadData();
  res.json(data);
});

// Check if phone already has registered debts / account
app.get('/api/auth/check-phone', (req, res) => {
  const phone = req.query.phone as string;
  if (!phone) return res.json({ exists: false });
  const data = loadData();
  const clean = normalizePhone(phone);
  
  const user = data.users.find(u => normalizePhone(u.phone) === clean);
  
  // Calculate debts already linked to this phone (even before they installed or after reinstall)
  const debtsOwed = data.debts.filter(d => normalizePhone(d.debtorPhone) === clean && d.status !== 'settled');
  const debtsToReceive = data.debts.filter(d => normalizePhone(d.creditorPhone) === clean && normalizePhone(d.debtorPhone) !== clean && d.status !== 'settled');

  const totalOwed = debtsOwed.reduce((acc, d) => acc + d.amount, 0);
  const totalReceivable = debtsToReceive.reduce((acc, d) => acc + d.amount, 0);

  if (user) {
    return res.json({
      exists: true,
      name: user.name,
      phone: user.phone,
      totalOwed,
      totalReceivable,
      debtsCount: debtsOwed.length + debtsToReceive.length
    });
  }

  // Even if user hasn't created a PIN yet, someone might have registered a debt against their phone!
  if (debtsOwed.length > 0 || debtsToReceive.length > 0) {
    return res.json({
      exists: false,
      hasPendingDebts: true,
      totalOwed,
      totalReceivable,
      debtsCount: debtsOwed.length + debtsToReceive.length
    });
  }

  res.json({ exists: false });
});

// Auth / User registration & login by phone + pin
app.post('/api/auth/login', (req, res) => {
  const { phone, pin, name } = req.body;
  const data = loadData();
  const clean = normalizePhone(phone);
  
  let user = data.users.find(u => normalizePhone(u.phone) === clean);
  if (!user) {
    // Register new user on first access
    user = {
      id: Date.now().toString(),
      name: name || 'Usuário',
      phone: clean || phone,
      pin: pin || '1234',
      avatar: '👤'
    };
    data.users.push(user);
    saveData(data);
  } else {
    if (user.pin && user.pin !== pin) {
      return res.status(401).json({ error: 'Senha incorreta para este número de telefone.' });
    }
    if (!user.pin && pin) {
      user.pin = pin;
      saveData(data);
    }
    if (name && name !== 'Usuário' && name !== user.name) {
      user.name = name;
      saveData(data);
    }
  }
  res.json(user);
});

// Add Debt
app.post('/api/debts', (req, res) => {
  const { creatorPhone, creditorPhone, debtorPhone, amount, description, category, dueDate, sharedPhones } = req.body;
  const data = loadData();

  const newDebt: Debt = {
    id: 'd_' + Date.now(),
    creatorPhone,
    creditorPhone,
    debtorPhone,
    amount: Number(amount),
    originalAmount: Number(amount),
    description,
    category: category || 'Geral',
    date: new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: debtorPhone === creatorPhone || creditorPhone === creatorPhone ? 'confirmed' : 'pending_confirmation',
    sharedPhones: sharedPhones || []
  };

  data.debts.push(newDebt);

  // If debtor is someone else, notify debtor
  if (debtorPhone && debtorPhone !== creatorPhone) {
    const creditorUser = data.users.find(u => u.phone === creditorPhone)?.name || 'Alguém';
    data.notifications.push({
      id: 'n_' + Date.now() + Math.random(),
      recipientPhone: debtorPhone,
      senderPhone: creatorPhone,
      type: 'debt_request',
      title: 'Nova Dívida Registrada',
      message: `${creditorUser} registrou que você deve R$ ${Number(amount).toFixed(2)} (${description}). Toque para confirmar.`,
      relatedId: newDebt.id,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  // If shared with other phones
  if (sharedPhones && Array.isArray(sharedPhones)) {
    sharedPhones.forEach(p => {
      if (p !== creatorPhone && p !== debtorPhone) {
        data.notifications.push({
          id: 'n_' + Date.now() + Math.random(),
          recipientPhone: p,
          senderPhone: creatorPhone,
          type: 'debt_request',
          title: 'Conta Compartilhada',
          message: `Você foi incluído(a) em uma despesa dividida: ${description} (R$ ${Number(amount).toFixed(2)}).`,
          relatedId: newDebt.id,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    });
  }

  saveData(data);
  res.json(newDebt);
});

// Confirm or Reject Debt
app.post('/api/debts/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, userPhone } = req.body; // 'confirmed' or 'rejected'
  const data = loadData();

  const debt = data.debts.find(d => d.id === id);
  if (!debt) return res.status(404).json({ error: 'Dívida não encontrada' });

  debt.status = status;
  saveData(data);

  // Notify creator
  const userObj = data.users.find(u => u.phone === userPhone)?.name || 'Alguém';
  data.notifications.push({
    id: 'n_' + Date.now(),
    recipientPhone: debt.creatorPhone,
    senderPhone: userPhone,
    type: status === 'confirmed' ? 'debt_confirmed' : 'rejected',
    title: status === 'confirmed' ? 'Dívida Confirmada! ✅' : 'Dívida Recusada ❌',
    message: `${userObj} ${status === 'confirmed' ? 'confirmou' : 'recusou'} a dívida "${debt.description}" (R$ ${debt.amount.toFixed(2)}).`,
    relatedId: debt.id,
    read: false,
    createdAt: new Date().toISOString()
  });
  saveData(data);

  res.json(debt);
});

// Add Payment (Full or Partial)
app.post('/api/payments', (req, res) => {
  const { debtId, payerPhone, receiverPhone, amount, note } = req.body;
  const data = loadData();

  const paymentAmount = Number(amount);
  const payment: Payment = {
    id: 'p_' + Date.now(),
    debtId,
    payerPhone,
    receiverPhone,
    amount: paymentAmount,
    date: new Date().toISOString().split('T')[0],
    note: note || 'Pagamento realizado'
  };

  data.payments.push(payment);

  if (debtId) {
    const debt = data.debts.find(d => d.id === debtId);
    if (debt) {
      debt.amount = Math.max(0, debt.amount - paymentAmount);
      if (debt.amount === 0) {
        debt.status = 'settled';
      }
    }
  }

  // Notify receiver
  const payerName = data.users.find(u => u.phone === payerPhone)?.name || 'Alguém';
  data.notifications.push({
    id: 'n_' + Date.now(),
    recipientPhone: receiverPhone,
    senderPhone: payerPhone,
    type: 'payment_received',
    title: 'Pagamento Recebido! 💸',
    message: `${payerName} efetuou um pagamento de R$ ${paymentAmount.toFixed(2)} (${note || 'Quitação/Abatimento'}).`,
    relatedId: payment.id,
    read: false,
    createdAt: new Date().toISOString()
  });

  saveData(data);
  res.json({ payment, debts: data.debts });
});

// Mark Notification as Read
app.post('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const data = loadData();
  const notif = data.notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    saveData(data);
  }
  res.json({ success: true });
});

// Add Recurring Item
app.post('/api/recurring', (req, res) => {
  const { title, amount, creatorPhone, targetPhone, frequencyDays, description } = req.body;
  const data = loadData();

  const item: RecurringItem = {
    id: 'r_' + Date.now(),
    title,
    amount: Number(amount),
    creatorPhone,
    targetPhone,
    frequencyDays: Number(frequencyDays) || 15,
    nextDueDate: new Date(Date.now() + (Number(frequencyDays) || 15) * 86400000).toISOString().split('T')[0],
    description
  };

  data.recurring.push(item);
  saveData(data);
  res.json(item);
});

// Vite middleware in dev
if (process.env.NODE_ENV !== 'production') {
  import('vite').then(async ({ createServer }) => {
    const viteServer = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' }
    });
    app.use(viteServer.middlewares);
    
    app.listen(3000, '0.0.0.0', () => {
      console.log('TeDevo running on http://localhost:3000');
    });
  });
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
  app.listen(3000, '0.0.0.0', () => {
    console.log('TeDevo production server on port 3000');
  });
}
