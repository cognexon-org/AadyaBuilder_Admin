import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { SelectInput, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { unwrapList, unwrapMeta } from '../utils/apiData';
import { formatDate, formatNumber, getId } from '../utils/formatters';

const defaults = { page: 1, limit: 20, city: '', q: '', verified: '' };

export default function Builders() {
  const [filters, setFilters] = useState(defaults);
  const [state, setState] = useState({ loading: true, error: null, rows: [], meta: null });
  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: field === 'page' ? value : 1 }));

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await adminApi.builders(filters);
      setState({ loading: false, error: null, rows: unwrapList(response), meta: unwrapMeta(response) });
    } catch (error) {
      setState({ loading: false, error, rows: [], meta: null });
    }
  };
  useEffect(() => { load(); }, [filters.page]);

  const verify = async (builder) => {
    await adminApi.verifyBuilder(getId(builder), { isVerified: true });
    await load();
  };

  return (
    <div>
      <PageHeader title="Builders" description="Review builder profiles shown in Popular Builders and project detail screens." actions={<button className="btn-primary" onClick={load}>Refresh</button>} />
      <div className="card mb-6 p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <TextInput label="Search" value={filters.q} onChange={(value) => updateFilter('q', value)} placeholder="Builder name/email" />
          <TextInput label="City" value={filters.city} onChange={(value) => updateFilter('city', value)} placeholder="Mumbai" />
          <SelectInput label="Verified" value={filters.verified} onChange={(value) => updateFilter('verified', value)} options={[{ label: 'All', value: '' }, { label: 'Verified', value: 'true' }, { label: 'Not verified', value: 'false' }]} />
          <SelectInput label="Page size" value={filters.limit} onChange={(value) => updateFilter('limit', value)} options={[10, 20, 50, 100].map((n) => ({ label: `${n} rows`, value: n }))} />
          <div className="flex items-end gap-2"><button className="btn-primary w-full" onClick={load}>Apply</button><button className="btn-secondary" onClick={() => setFilters(defaults)}>Reset</button></div>
        </div>
      </div>
      {state.error ? <ErrorState error={state.error} onRetry={load} /> : <DataTable columns={[
        { header: 'Builder', render: (row) => <div><b>{row.name || row.companyName || '—'}</b><p className="text-xs text-slate-500">{row.email || row.phone || '—'}</p></div> },
        { header: 'City', render: (row) => row.city || row.location?.city || '—' },
        { header: 'Projects', render: (row) => formatNumber(row.totalProjects ?? row.projectsCount ?? row.projectsInCity) },
        { header: 'Properties', render: (row) => formatNumber(row.totalProperties ?? row.propertiesCount) },
        { header: 'Verified', render: (row) => <Badge value={row.isVerified || row.verified ? 'active' : 'inactive'}>{row.isVerified || row.verified ? 'Verified' : 'Pending'}</Badge> },
        { header: 'Joined', render: (row) => formatDate(row.createdAt) },
        { header: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-1.5" onClick={() => window.open(`/users?id=${getId(row)}`, '_self')}>User</button>{row.isVerified || row.verified ? null : <button className="btn-success px-3 py-1.5" onClick={() => verify(row)}>Verify</button>}</div> }
      ]} rows={state.rows} loading={state.loading} emptyTitle="No builders found" />}
      <Pagination meta={state.meta} page={filters.page} onPageChange={(page) => updateFilter('page', page)} />
    </div>
  );
}
