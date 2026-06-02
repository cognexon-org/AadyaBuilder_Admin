import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { ErrorState, Loading } from '../components/Loading';
import { formatCurrency, formatDate, formatNumber, toTitle } from '../utils/formatters';

const first = (array) => (Array.isArray(array) && array.length ? array[0] : {});

function MiniBarList({ title, items = [], valueKey = 'count', labelKey = '_id', formatter = formatNumber }) {
  const max = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 1);
  return (
    <div className="card p-5">
      <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length ? items.map((item) => {
          const value = Number(item[valueKey] || 0);
          return (
            <div key={String(item[labelKey])}>
              <div className="mb-1 flex justify-between gap-2 text-sm">
                <span className="font-semibold text-slate-700">{toTitle(item[labelKey] || 'Unknown')}</span>
                <span className="font-black text-slate-950">{formatter(value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.max(6, (value / max) * 100)}%` }} />
              </div>
            </div>
          );
        }) : <p className="text-sm text-slate-500">No data available.</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [state, setState] = useState({ loading: true, error: null, data: null });

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await adminApi.dashboard(filters);
      setState({ loading: false, error: null, data: response.data });
    } catch (error) {
      setState({ loading: false, error, data: null });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const data = state.data || {};
  const overview = data.overview || {};
  const userOverview = first(overview.users?.overview);
  const propertyOverview = first(overview.properties?.overview);
  const leadOverview = first(overview.leads?.overview);
  const revenueOverview = first(overview.revenue?.overview);
  const contentOverview = first(overview.content?.overview);

  const cards = useMemo(() => [
    { label: 'Total users', value: formatNumber(userOverview.totalUsers), hint: `${formatNumber(userOverview.activeUsers)} active · ${formatNumber(userOverview.verifiedUsers)} verified`, icon: '👥' },
    { label: 'Properties', value: formatNumber(propertyOverview.totalProperties), hint: `${formatNumber(propertyOverview.activeProperties)} active · ${formatNumber(propertyOverview.pendingProperties)} pending`, icon: '🏢' },
    { label: 'Leads', value: formatNumber(leadOverview.totalLeads), hint: `${formatNumber(leadOverview.spamLeads)} spam flagged`, icon: '☎' },
    { label: 'Revenue', value: formatCurrency(revenueOverview.totalRevenue), hint: `${formatNumber(revenueOverview.totalTransactions)} captured transactions`, icon: '₹' },
    { label: 'Articles', value: formatNumber(contentOverview.totalArticles), hint: `${formatNumber(contentOverview.publishedArticles)} published · ${formatNumber(contentOverview.totalViews)} views`, icon: '✎' },
    { label: 'Pending approvals', value: formatNumber(data.pendingApprovals?.total), hint: `${formatNumber(data.pendingApprovals?.properties)} properties · ${formatNumber(data.pendingApprovals?.users)} users · ${formatNumber(data.pendingApprovals?.articles)} articles`, icon: '!' }
  ], [data]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of marketplace users, property inventory, leads, revenue, content, pending approvals, and recent activity."
        actions={
          <>
            <input className="input w-auto" type="date" value={filters.startDate} onChange={(event) => setFilters((f) => ({ ...f, startDate: event.target.value }))} />
            <input className="input w-auto" type="date" value={filters.endDate} onChange={(event) => setFilters((f) => ({ ...f, endDate: event.target.value }))} />
            <button className="btn-primary" onClick={load}>Apply</button>
          </>
        }
      />

      {state.loading ? <Loading /> : state.error ? <ErrorState error={state.error} onRetry={load} /> : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => <StatCard key={card.label} {...card} />)}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <MiniBarList title="Users by role" items={overview.users?.byRole || []} />
            <MiniBarList title="Properties by purpose" items={overview.properties?.byPurpose || []} />
            <MiniBarList title="Leads by status" items={overview.leads?.byStatus || []} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="card p-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Recent activity</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="mb-3 text-sm font-bold text-slate-900">New users</h4>
                  <div className="space-y-2">
                    {(data.recentActivity?.users || []).map((user) => (
                      <div key={user._id} className="rounded-2xl border border-slate-100 p-3">
                        <div className="flex justify-between gap-2"><b>{user.name}</b><Badge value={user.role} /></div>
                        <p className="mt-1 text-xs text-slate-500">{user.email} · {formatDate(user.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-sm font-bold text-slate-900">New properties</h4>
                  <div className="space-y-2">
                    {(data.recentActivity?.properties || []).map((property) => (
                      <div key={property._id} className="rounded-2xl border border-slate-100 p-3">
                        <div className="flex justify-between gap-2"><b className="line-clamp-1">{property.title}</b><Badge value={property.status} /></div>
                        <p className="mt-1 text-xs text-slate-500">{property.location?.city || '—'} · {formatCurrency(property.price)} · {formatDate(property.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-sm font-black uppercase tracking-wide text-slate-500">Top dealers/builders</h3>
              <div className="mt-4 space-y-3">
                {(data.topPerformers || []).map((item, index) => (
                  <div key={item._id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">{index + 1}</div>
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.email}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p><b className="text-slate-900">{formatNumber(item.propertyCount)}</b> properties</p>
                      <p><b className="text-slate-900">{formatNumber(item.leadCount)}</b> leads</p>
                    </div>
                  </div>
                ))}
                {!(data.topPerformers || []).length ? <p className="text-sm text-slate-500">No top performers yet.</p> : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
