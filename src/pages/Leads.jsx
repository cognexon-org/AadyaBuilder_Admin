import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { SelectInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { booleanOptions, leadStatuses } from '../utils/constants';
import { formatDate, getId, toTitle } from '../utils/formatters';

const defaults = { page: 1, limit: 20, status: '', isSpam: '' };

export default function Leads() {
  const [filters, setFilters] = useState(defaults);
  const [state, setState] = useState({ loading: true, error: null, rows: [], meta: null });
  const [selected, setSelected] = useState(null);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: field === 'page' ? value : 1 }));

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await adminApi.leads(filters);
      setState({ loading: false, error: null, rows: response.data || [], meta: response.meta });
    } catch (error) {
      setState({ loading: false, error, rows: [], meta: null });
    }
  };

  useEffect(() => { load(); }, [filters.page]);

  const columns = [
    { header: 'Property', render: (lead) => <div><b>{lead.property?.title || '—'}</b><p className="text-xs text-slate-500">{lead.property?.propertyCode || '—'}</p></div> },
    { header: 'Buyer', render: (lead) => <div><b>{lead.buyer?.name || '—'}</b><p className="text-xs text-slate-500">{lead.buyer?.email || '—'}</p></div> },
    { header: 'Owner', render: (lead) => <div><b>{lead.owner?.name || '—'}</b><p className="text-xs text-slate-500">{lead.owner?.email || '—'}</p></div> },
    { header: 'Status', render: (lead) => <Badge value={lead.status} /> },
    { header: 'Spam', render: (lead) => <Badge value={lead.isSpam ? 'spam' : 'false'}>{lead.isSpam ? 'Spam' : 'Clean'}</Badge> },
    { header: 'Created', render: (lead) => formatDate(lead.createdAt) },
    { header: 'Actions', render: (lead) => <button className="btn-secondary px-3 py-1.5" onClick={() => setSelected(lead)}>View</button> }
  ];

  return (
    <div>
      <PageHeader title="Lead Management" description="Monitor all marketplace inquiries, lead status, buyer-owner flow, and spam flags." actions={<button className="btn-primary" onClick={load}>Refresh</button>} />

      <div className="card mb-6 p-4">
        <div className="grid gap-4 md:grid-cols-4">
          <SelectInput label="Status" value={filters.status} onChange={(value) => updateFilter('status', value)} options={[{ label: 'All statuses', value: '' }, ...leadStatuses.map((status) => ({ label: toTitle(status), value: status }))]} />
          <SelectInput label="Spam" value={filters.isSpam} onChange={(value) => updateFilter('isSpam', value)} options={booleanOptions} />
          <SelectInput label="Page size" value={filters.limit} onChange={(value) => updateFilter('limit', value)} options={[10, 20, 50, 100].map((n) => ({ label: `${n} rows`, value: n }))} />
          <div className="flex items-end gap-2"><button className="btn-primary w-full" onClick={load}>Apply</button><button className="btn-secondary" onClick={() => setFilters(defaults)}>Reset</button></div>
        </div>
      </div>

      {state.error ? <ErrorState error={state.error} onRetry={load} /> : <DataTable columns={columns} rows={state.rows} loading={state.loading} emptyTitle="No leads found" />}
      <Pagination meta={state.meta} page={filters.page} onPageChange={(page) => updateFilter('page', page)} />

      <Modal open={Boolean(selected)} title="Lead details" subtitle={getId(selected)} onClose={() => setSelected(null)} size="max-w-3xl">
        {selected ? (
          <div className="space-y-5 text-sm">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="label">Status</p><Badge value={selected.status} /></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="label">Spam</p><p className="font-bold">{selected.isSpam ? 'Yes' : 'No'}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="label">Created</p><p className="font-bold">{formatDate(selected.createdAt)}</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card p-4 shadow-none"><p className="label">Buyer</p><p className="font-bold">{selected.buyer?.name || '—'}</p><p className="text-slate-500">{selected.buyer?.email || '—'}</p></div>
              <div className="card p-4 shadow-none"><p className="label">Owner</p><p className="font-bold">{selected.owner?.name || '—'}</p><p className="text-slate-500">{selected.owner?.email || '—'}</p></div>
            </div>
            <div className="card p-4 shadow-none"><p className="label">Property</p><p className="font-bold">{selected.property?.title || '—'}</p><p className="text-slate-500">{selected.property?.propertyCode || '—'}</p></div>
            <div className="card p-4 shadow-none"><p className="label">Message</p><p className="whitespace-pre-wrap leading-6 text-slate-600">{selected.message || 'No message provided.'}</p></div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
