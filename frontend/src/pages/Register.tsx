import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onNavigate: (view: string) => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        onNavigate('LOGIN');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-900/5 dark:bg-slate-950/20 relative">
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-[80px]" />

      <div className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-xl space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
          <p className="text-xs text-muted-foreground">Sign up to kickstart your WAEC/UTME science preparation.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/25 text-xs font-semibold text-destructive flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <AlertCircle size={16} className="text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adebayo Chukwu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-muted-foreground">
          <span>Already have an account? </span>
          <button onClick={() => onNavigate('LOGIN')} className="text-primary font-bold hover:underline">
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
