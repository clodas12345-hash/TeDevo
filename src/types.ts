export interface User {
  id: string;
  name: string;
  phone: string;
  pin: string;
  avatar?: string;
}

export interface Debt {
  id: string;
  creatorPhone: string;
  creditorPhone: string;
  debtorPhone: string;
  amount: number;
  originalAmount: number;
  description: string;
  category: string;
  date: string;
  dueDate?: string;
  status: 'pending_confirmation' | 'confirmed' | 'settled' | 'rejected';
  sharedPhones?: string[];
}

export interface Payment {
  id: string;
  debtId?: string;
  payerPhone: string;
  receiverPhone: string;
  amount: number;
  date: string;
  note: string;
}

export interface NotificationItem {
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

export interface RecurringItem {
  id: string;
  title: string;
  amount: number;
  creatorPhone: string;
  targetPhone: string;
  frequencyDays: number;
  nextDueDate: string;
  description: string;
}
