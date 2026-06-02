import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1fr_520px]">
      <section className="relative hidden overflow-hidden p-12 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.25),_transparent_35%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-300">AadyaBuilders</p>
            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-tight tracking-tight">Control the full real estate marketplace from one admin console.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Manage users, verify properties, monitor leads, create monetization plans, publish content, export reports, send notifications, and watch system health.</p>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-slate-50 p-6">
        <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Admin Login</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Welcome back</h2>
          </div>

          {error ? <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</div> : null}

          <div className="mt-8 space-y-4">
            <label className="block">
              <span className="label">Email</span>
              <input className="input" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="admin@example.com" required />
            </label>
            <label className="block">
              <span className="label">Password</span>
              <input className="input" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="••••••••" required />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input type="checkbox" checked={form.rememberMe} onChange={(event) => update('rememberMe', event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
              Remember this device
            </label>
          </div>

          <button className="btn-primary mt-8 w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in to admin'}</button>
        </form>
      </section>
    </main>
  );
}
