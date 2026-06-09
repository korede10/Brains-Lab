import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onNavigate: (view: string) => void;
}

export default function Login({ onLoginSuccess, onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please verify credentials.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-900/5 dark:bg-slate-950/20 relative">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-500/10 blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-[80px]" />

      <div className="w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-xl space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
          <p className="text-xs text-muted-foreground">Sign in to your EduExcel account to access your courses.</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/25 text-xs font-semibold text-destructive flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-muted-foreground">
          <span>Don't have an account? </span>
          <button onClick={() => onNavigate('REGISTER')} className="text-primary font-bold hover:underline">
            Sign Up
          </button>
        </div>

        {/* Quick Testing Accounts Note */}
        <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-[10px] leading-relaxed text-muted-foreground">
          <span className="font-bold text-indigo-500 block mb-1">Sandbox Testing Credentials:</span>
          • Admin/Teacher: <code className="text-slate-800 dark:text-slate-200">admin@lms.com</code> / <code className="text-slate-800 dark:text-slate-200">password123</code><br/>
          • Student: <code className="text-slate-800 dark:text-slate-200">student@lms.com</code> / <code className="text-slate-800 dark:text-slate-200">password123</code>
        </div>
      </div>
    </div>
  );
}
