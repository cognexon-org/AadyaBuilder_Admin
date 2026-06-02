import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { ErrorState, Loading } from '../components/Loading';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function System() {
  const [state, setState] = useState({ loading: true, error: null, health: null, analytics: null });

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const [healthResponse, analyticsResponse] = await Promise.all([adminApi.health(), adminApi.subscriptionAnalytics()]);
      setState({ loading: false, error: null, health: healthResponse.data, analytics: analyticsResponse.data });
    } catch (error) {
      setState({ loading: false, error, health: null, analytics: null });
    }
  };

  useEffect(() => { load(); }, []);

  const analytics = state.analytics || {};
  const revenue = (analytics.activeSubscriptions || []).reduce((sum, item) => sum + Number(item.revenue || 0), 0);

  return (
    <div>
      <PageHeader title="System Health & Subscription Analytics" description="Check database/Redis status, runtime details, memory usage, active plans, active subscriptions, and expiring subscriptions." actions={<button className="btn-primary" onClick={load}>Refresh</button>} />
      {state.loading ? <Loading /> : state.error ? <ErrorState error={state.error} onRetry={load} /> : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Database" value={<Badge value={state.health?.database === 'connected' ? 'active' : 'inactive'}>{state.health?.database || '—'}</Badge>} hint="MongoDB connection state" />
            <StatCard label="Redis" value={<Badge value={state.health?.redis === 'connected' ? 'active' : 'inactive'}>{state.health?.redis || '—'}</Badge>} hint="Cache/session/queue status" />
            <StatCard label="Uptime" value={`${Math.floor((state.health?.uptime || 0) / 60)}m`} hint={`Node ${state.health?.nodeVersion || '—'} · ${state.health?.environment || '—'}`} />
            <StatCard label="Expiring soon" value={formatNumber(analytics.expiringSoon)} hint="Subscriptions ending within 7 days" />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="card p-5">
              <h2 className="text-lg font-black text-slate-950">Memory usage</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {Object.entries(state.health?.memory || {}).map(([key, value]) => <div key={key} className="rounded-2xl bg-slate-50 p-4"><p className="label">{key}</p><p className="font-black">{value}</p></div>)}
              </div>
            </div>
            <div className="card p-5">
              <h2 className="text-lg font-black text-slate-950">Subscription summary</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><p className="label">Active plans</p><p className="text-2xl font-black">{formatNumber((analytics.plans || []).length)}</p></div>
                <div className="rounded-2xl bg-slate-50 p-4"><p className="label">Estimated revenue</p><p className="text-2xl font-black">{formatCurrency(revenue)}</p></div>
              </div>
            </div>
          </div>

          <DataTable
            columns={[
              { header: 'Plan', render: (row) => row.name || row.planName },
              { header: 'Type', render: (row) => row.type ? <Badge value={row.type} /> : '—' },
              { header: 'Price', render: (row) => row.price ? formatCurrency(row.price) : '—' },
              { header: 'Limit', render: (row) => row.listingLimit || '—' },
              { header: 'Status', render: (row) => <Badge value={row.isActive ? 'active' : 'inactive'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> }
            ]}
            rows={analytics.plans || []}
            emptyTitle="No active plans"
          />

          <DataTable
            columns={[
              { header: 'Plan', render: (row) => row.planName },
              { header: 'Subscribers', render: (row) => formatNumber(row.count) },
              { header: 'Revenue', render: (row) => formatCurrency(row.revenue) }
            ]}
            rows={analytics.activeSubscriptions || []}
            emptyTitle="No active subscriptions"
          />
        </div>
      )}
    </div>
  );
}
