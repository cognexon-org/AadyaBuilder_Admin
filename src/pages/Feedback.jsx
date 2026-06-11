import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { SelectInput, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { unwrapList, unwrapMeta } from '../utils/apiData';
import { formatDate, getId, toTitle } from '../utils/formatters';

const defaults = { page: 1, limit: 20, type: '', status: '', city: '' };
const types = ['helpful', 'app-rating', 'locality-rating', 'society-rating'];
const statuses = ['new', 'reviewed', 'resolved', 'ignored'];

export default function Feedback() {
  const [filters, setFilters] = useState(defaults);
  const [state, setState] = useState({ loading: true, error: null, rows: [], meta: null, stats: null });
  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: field === 'page' ? value : 1 }));

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const [list, stats] = await Promise.allSettled([adminApi.feedback(filters), adminApi.feedbackStats(filters)]);
      if (list.status === 'rejected') throw list.reason;
      setState({ loading: false, error: null, rows: unwrapList(list.value), meta: unwrapMeta(list.value), stats: stats.status === 'fulfilled' ? stats.value?.data || stats.value : null });
    } catch (error) {
      setState({ loading: false, error, rows: [], meta: null, stats: null });
    }
  };
  useEffect(() => { load(); }, [filters.page]);

  const setStatus = async (row, status) => {
    await adminApi.updateFeedbackStatus(getId(row), { status });
    await load();
  };
  const remove = async (row) => {
    if (!confirm('Delete this feedback?')) return;
    await adminApi.deleteFeedback(getId(row));
    await load();
  };

  return (
    <div>
      <PageHeader title="Feedback" description="Review app helpful votes, star ratings, locality ratings, and society feedback from mobile screens." actions={<button className="btn-primary" onClick={load}>Refresh</button>} />
      {state.stats ? <div className="mb-6 grid gap-4 md:grid-cols-4">{Object.entries(state.stats).slice(0, 4).map(([key, value]) => <div className="card p-4" key={key}><p className="label">{toTitle(key)}</p><p className="text-2xl font-black">{typeof value === 'object' ? JSON.stringify(value) : value}</p></div>)}</div> : null}
      <div className="card mb-6 p-4"><div className="grid gap-4 md:grid-cols-5"><SelectInput label="Type" value={filters.type} onChange={(value) => updateFilter('type', value)} options={[{ label: 'All', value: '' }, ...types.map((type) => ({ label: toTitle(type), value: type }))]} /><SelectInput label="Status" value={filters.status} onChange={(value) => updateFilter('status', value)} options={[{ label: 'All', value: '' }, ...statuses.map((status) => ({ label: toTitle(status), value: status }))]} /><TextInput label="City" value={filters.city} onChange={(value) => updateFilter('city', value)} /><SelectInput label="Page size" value={filters.limit} onChange={(value) => updateFilter('limit', value)} options={[10, 20, 50, 100].map((n) => ({ label: `${n} rows`, value: n }))} /><div className="flex items-end gap-2"><button className="btn-primary w-full" onClick={load}>Apply</button><button className="btn-secondary" onClick={() => setFilters(defaults)}>Reset</button></div></div></div>
      {state.error ? <ErrorState error={state.error} onRetry={load} /> : <DataTable rows={state.rows} loading={state.loading} emptyTitle="No feedback" columns={[
        { header: 'Type', render: (row) => <Badge value={row.type || row.feedbackType}>{toTitle(row.type || row.feedbackType || 'feedback')}</Badge> },
        { header: 'User', render: (row) => <div><b>{row.user?.name || row.userName || 'Guest'}</b><p className="text-xs text-slate-500">{row.user?.email || row.email || '—'}</p></div> },
        { header: 'Context', render: (row) => <div><b>{row.city || row.locality || row.screen || '—'}</b><p className="text-xs text-slate-500">{row.section || row.society || '—'}</p></div> },
        { header: 'Value', render: (row) => row.rating ? `${row.rating} ★` : row.helpful === true ? 'Yes' : row.helpful === false ? 'No' : row.value || '—' },
        { header: 'Comment', render: (row) => <p className="max-w-xs truncate">{row.comment || row.message || '—'}</p> },
        { header: 'Status', render: (row) => <Badge value={row.status || 'new'} /> },
        { header: 'Created', render: (row) => formatDate(row.createdAt) },
        { header: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-1.5" onClick={() => setStatus(row, 'reviewed')}>Reviewed</button><button className="btn-success px-3 py-1.5" onClick={() => setStatus(row, 'resolved')}>Resolve</button><button className="btn-danger px-3 py-1.5" onClick={() => remove(row)}>Delete</button></div> }
      ]} />}
      <Pagination meta={state.meta} page={filters.page} onPageChange={(page) => updateFilter('page', page)} />
    </div>
  );
}
