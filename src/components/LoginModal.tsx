import { useState, useEffect } from 'react';
import { User } from '../types';
import { Phone, Lock, User as UserIcon, ArrowRight, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  users?: User[];
  onLogin: (user: User) => void;
}

export function LoginModal({ onLogin }: LoginModalProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [existingAccount, setExistingAccount] = useState<{
    exists: boolean;
    name?: string;
    hasPendingDebts?: boolean;
    debtsCount?: number;
    totalOwed?: number;
    totalReceivable?: number;
  } | null>(null);

  // Auto-detect if phone has an account or pending debts on the server
  useEffect(() => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 8) {
      setExistingAccount(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const res = await fetch(`/api/auth/check-phone?phone=${encodeURIComponent(clean)}`);
        const info = await res.json();
        if (info.exists) {
          setExistingAccount(info);
          if (info.name && !name) {
            setName(info.name);
          }
        } else if (info.hasPendingDebts) {
          setExistingAccount(info);
        } else {
          setExistingAccount(null);
        }
      } catch (e) {
        // quiet error
      } finally {
        setCheckingPhone(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setError('Por favor, informe um número de telefone válido.');
      return;
    }
    if (!pin || pin.length < 4) {
      setError('Por favor, defina uma senha de pelo menos 4 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin, name: name || existingAccount?.name || 'Usuário' })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao autenticar');
      }
      onLogin(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 overflow-hidden relative">
        {/* Decorative header glow */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <span className="text-3xl">🤝</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">TeDevo</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comunidade inteligente de dívidas e contas compartilhadas por telefone. Sem burocracia.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Seu Número de Telefone (WhatsApp / Celular)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="(11) 99999-9999"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Informative Cloud Recovery Banner if account exists */}
          {existingAccount?.exists && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-emerald-800 dark:text-emerald-300">
                  Conta encontrada no servidor!
                </strong>
                <span>
                  Olá, <strong>{existingAccount.name}</strong>! Digite seu PIN para restaurar automaticamente suas contas a pagar e a receber.
                </span>
              </div>
            </div>
          )}

          {existingAccount?.hasPendingDebts && !existingAccount.exists && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5 animate-fadeIn">
              <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-indigo-800 dark:text-indigo-300">
                  Dívidas pendentes encontradas para o seu número!
                </strong>
                <span>
                  Identificamos contas compartilhadas com este telefone. Defina seu nome e crie seu PIN para acessar.
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Seu Nome (Como apareces na comunidade)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Ex: Clodas, Cátia, Tatiane..."
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Senha / PIN de Acesso (4 dígitos ou mais)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••"
                maxLength={8}
                value={pin}
                onChange={e => setPin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-widest"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Usado apenas para proteger sua conta neste número. Sem cadastros complexos!
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 text-xs rounded-xl border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>{loading ? 'Entrando...' : 'Acessar TeDevo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Privacidade garantida via número de telefone e PIN</span>
        </div>
      </div>
    </div>
  );
}
