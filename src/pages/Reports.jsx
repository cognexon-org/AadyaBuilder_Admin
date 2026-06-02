import { useState } from 'react';
import { adminApi } from '../api/adminApi';
import DataTable from '../components/DataTable';
import { SelectInput, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import PageHeader from '../components/PageHeader';
import { reportTypes } from '../utils/constants';
import { downloadBlob, formatCurrency, formatDate, getId, toTitle } from '../utils/formatters';

export default function Reports() {
  const [filters, setFilters] = useState({ type: 'users', format: 'json', startDate: '', endDate: '' });
  const [state, setState] = useState({ loading: false, error: null, rows: [] });

  const update = (field, value) => setFilters((current) => ({ ...current, [field]: value }));

  const exportReport = async () => {
    setState({ loading: true, error: null, rows: [] });
    try {
      if (filters.format === 'csv') {
        const response = await adminApi.exportReport(filters.type, { startDate: filters.startDate, endDate: filters.endDate, format: 'csv' });
        const blob = await response.blob();
        downloadBlob(blob, `${filters.type}_report.csv`);
        setState({ loading: false, error: null, rows: [] });
      } else {
        const response = await adminApi.exportReport(filters.type, { startDate: filters.startDate, endDate: filters.endDate, format: 'json' });
        setState({ loading: false, error: null, rows: response.data || [] });
      }
    } catch (error) {
      setState({ loading: false, error, rows: [] });
    }
  };

  const commonColumns = [
    { header: 'ID', render: (row) => <code className="text-xs">{getId(row)}</code> },
    { header: 'Primary', render: (row) => row.name || row.title || row.property?.title || row.user?.name || '—' },
    { header: 'Status/Role', render: (row) => row.status || row.role || row.transactionType || '—' },
    { header: 'Amount/Price', render: (row) => row.amount || row.price ? formatCurrency(row.amount || row.price) : '—' },
    { header: 'Created', render: (row) => formatDate(row.createdAt) }
  ];

  return (
    <div>
      <PageHeader title="Reports & Exports" description="Export users, properties, leads, and captured transactions as JSON preview or CSV downloads." />

      <div className="card mb-6 p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <SelectInput label="Report type" value={filters.type} onChange={(value) => update('type', value)} options={reportTypes.map((type) => ({ label: toTitle(type), value: type }))} />
          <SelectInput label="Format" value={filters.format} onChange={(value) => update('format', value)} options={[{ label: 'JSON preview', value: 'json' }, { label: 'CSV download', value: 'csv' }]} />
          <TextInput label="Start date" type="date" value={filters.startDate} onChange={(value) => update('startDate', value)} />
          <TextInput label="End date" type="date" value={filters.endDate} onChange={(value) => update('endDate', value)} />
          <div className="flex items-end"><button className="btn-primary w-full" onClick={exportReport} disabled={state.loading}>{state.loading ? 'Exporting...' : 'Export'}</button></div>
        </div>
      </div>

      {state.error ? <ErrorState error={state.error} /> : filters.format === 'json' ? <DataTable columns={commonColumns} rows={state.rows} loading={state.loading} emptyTitle="No report preview" emptyDescription="Choose a report type and click Export to preview JSON data." /> : <div className="card p-6 text-sm text-slate-500">CSV files download directly after export.</div>}
    </div>
  );
}
