import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { SelectInput, TextArea, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { compactObject, parseNumber, unwrapList, unwrapMeta } from '../utils/apiData';
import { formatDate, formatNumber, getId, toTitle } from '../utils/formatters';

const defaults = { page: 1, limit: 20, city: '', status: '' };
const emptyForm = { property: '', videoUrl: '', thumbnail: '', caption: '', city: '', locality: '', status: 'pending' };
const statuses = ['pending', 'active', 'rejected', 'inactive'];

export default function Shorts() {
  const [filters, setFilters] = useState(defaults);
  const [state, setState] = useState({ loading: true, error: null, rows: [], meta: null });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: field === 'page' ? value : 1 }));
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await adminApi.shorts(filters);
      setState({ loading: false, error: null, rows: unwrapList(response), meta: unwrapMeta(response) });
    } catch (error) {
      setState({ loading: false, error, rows: [], meta: null });
    }
  };
  useEffect(() => { load(); }, [filters.page]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ property: row.property?._id || row.property || '', videoUrl: row.videoUrl || '', thumbnail: row.thumbnail || '', caption: row.caption || '', city: row.city || '', locality: row.locality || '', status: row.status || 'pending' }); setModalOpen(true); };
  const save = async () => {
    try {
      const payload = compactObject(form);
      if (editing) await adminApi.updateShort(getId(editing), payload); else await adminApi.createShort(payload);
      setModalOpen(false); await load();
    } catch (error) { setState((current) => ({ ...current, error })); }
  };
  const changeStatus = async (row, status) => { await adminApi.updateShortStatus(getId(row), { status }); await load(); };
  const remove = async (row) => { if (!confirm('Delete this short?')) return; await adminApi.deleteShort(getId(row)); await load(); };

  return (
    <div>
      <PageHeader title="Shorts" description="Moderate short-video feed content shown under the mobile Shorts tab." actions={<><button className="btn-secondary" onClick={load}>Refresh</button><button className="btn-primary" onClick={openCreate}>Add short</button></>} />
      <div className="card mb-6 p-4"><div className="grid gap-4 md:grid-cols-5"><TextInput label="City" value={filters.city} onChange={(value) => updateFilter('city', value)} /><SelectInput label="Status" value={filters.status} onChange={(value) => updateFilter('status', value)} options={[{ label: 'All', value: '' }, ...statuses.map((status) => ({ label: toTitle(status), value: status }))]} /><SelectInput label="Page size" value={filters.limit} onChange={(value) => updateFilter('limit', value)} options={[10, 20, 50, 100].map((n) => ({ label: `${n} rows`, value: n }))} /><div className="flex items-end gap-2"><button className="btn-primary w-full" onClick={load}>Apply</button><button className="btn-secondary" onClick={() => setFilters(defaults)}>Reset</button></div></div></div>
      {state.error ? <ErrorState error={state.error} onRetry={load} /> : <DataTable rows={state.rows} loading={state.loading} emptyTitle="No shorts" columns={[
        { header: 'Short', render: (row) => <div><b>{row.caption || 'Untitled short'}</b><p className="text-xs text-slate-500">{row.locality}, {row.city}</p></div> },
        { header: 'Property', render: (row) => row.property?.title || row.property || '—' },
        { header: 'Stats', render: (row) => `${formatNumber(row.views)} views · ${formatNumber(row.likes)} likes` },
        { header: 'Status', render: (row) => <Badge value={row.status} /> },
        { header: 'Created', render: (row) => formatDate(row.createdAt) },
        { header: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-1.5" onClick={() => openEdit(row)}>Edit</button><button className="btn-success px-3 py-1.5" onClick={() => changeStatus(row, 'active')}>Approve</button><button className="btn-secondary px-3 py-1.5" onClick={() => changeStatus(row, 'rejected')}>Reject</button><button className="btn-danger px-3 py-1.5" onClick={() => remove(row)}>Delete</button></div> }
      ]} />}
      <Pagination meta={state.meta} page={filters.page} onPageChange={(page) => updateFilter('page', page)} />
      <Modal open={modalOpen} title={editing ? 'Edit short' : 'Add short'} onClose={() => setModalOpen(false)} size="max-w-3xl">
        <div className="grid gap-4 md:grid-cols-2"><TextInput label="Property ID" value={form.property} onChange={(value) => updateForm('property', value)} /><TextInput label="Video URL" value={form.videoUrl} onChange={(value) => updateForm('videoUrl', value)} /><TextInput label="Thumbnail URL" value={form.thumbnail} onChange={(value) => updateForm('thumbnail', value)} /><TextInput label="City" value={form.city} onChange={(value) => updateForm('city', value)} /><TextInput label="Locality" value={form.locality} onChange={(value) => updateForm('locality', value)} /><SelectInput label="Status" value={form.status} onChange={(value) => updateForm('status', value)} options={statuses.map((status) => ({ label: toTitle(status), value: status }))} /><div className="md:col-span-2"><TextArea label="Caption" value={form.caption} onChange={(value) => updateForm('caption', value)} /></div></div>
        <div className="mt-6 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></div>
      </Modal>
    </div>
  );
}
