import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cx } from '../utils/formatters';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▣' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/properties', label: 'Properties', icon: '🏢' },
  { to: '/leads', label: 'Leads', icon: '☎' },
  { to: '/plans', label: 'Plans', icon: '₹' },
  { to: '/content', label: 'Content', icon: '✎' },
  { to: '/reports', label: 'Reports', icon: '⇩' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
  { to: '/system', label: 'System', icon: '⌁' }
];

function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      <div className={cx('fixed inset-0 z-30 bg-slate-950/40 lg:hidden', mobileOpen ? 'block' : 'hidden')} onClick={() => setMobileOpen(false)} />
      <aside className={cx('fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Admin Panel</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">AadyaBuilders</h2>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cx(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition',
                isActive ? 'bg-slate-950 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              )}
            >
              <span className="grid h-7 w-7 place-items-center rounded-xl bg-white/10 text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const page = navItems.find((item) => item.to === location.pathname)?.label || 'Admin';

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 lg:hidden" onClick={() => setMobileOpen(true)}>☰</button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current section</p>
              <h1 className="text-base font-black text-slate-950">{page}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-500">{user?.email || 'Authenticated'}</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">
              {(user?.name || 'A').slice(0, 1).toUpperCase()}
            </div>
            <button className="btn-secondary" onClick={logout}>Logout</button>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
