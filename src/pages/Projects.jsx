import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { SelectInput, TextArea, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { compactObject, parseCsv, parseNumber, unwrapList, unwrapMeta } from '../utils/apiData';
import { formatCurrency, formatDate, getId, toTitle } from '../utils/formatters';

const defaults = { page: 1, limit: 20, city: '', locality: '', status: '', isFeatured: '' };
const emptyForm = { name: '', builder: '', city: '', locality: '', address: '', minPrice: '', maxPrice: '', configurationsText: '', amenitiesText: '', possessionDate: '', reraNumber: '', totalUnits: '', availableUnits: '', status: 'active', isFeatured: false, description: '' };

const toPayload = (form) => compactObject({
  name: form.name,
  builder: form.builder,
  city: form.city,
  locality: form.locality,
  address: form.address,
  description: form.description,
  priceRange: compactObject({ min: parseNumber(form.minPrice), max: parseNumber(form.maxPrice) }),
  configurations: parseCsv(form.configurationsText),
  amenities: parseCsv(form.amenitiesText),
  possessionDate: form.possessionDate,
  reraNumber: form.reraNumber,
  totalUnits: parseNumber(form.totalUnits),
  availableUnits: parseNumber(form.availableUnits),
  status: form.status,
  isFeatured: Boolean(form.isFeatured)
});

export default function Projects() {
  const [filters, setFilters] = useState(defaults);
  const [state, setState] = useState({ loading: true, error: null, rows: [], meta: null, message: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: field === 'page' ? value : 1 }));
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await adminApi.projects(filters);
      setState({ loading: false, error: null, rows: unwrapList(response), meta: unwrapMeta(response), message: '' });
    } catch (error) {
      setState({ loading: false, error, rows: [], meta: null, message: '' });
    }
  };

  useEffect(() => { load(); }, [filters.page]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (project) => {
    setEditing(project);
    setForm({
      name: project.name || '',
      builder: project.builder?._id || project.builder || '',
      city: project.city || '',
      locality: project.locality || '',
      address: project.address || '',
      minPrice: project.priceRange?.min || '',
      maxPrice: project.priceRange?.max || '',
      configurationsText: (project.configurations || []).join(', '),
      amenitiesText: (project.amenities || []).join(', '),
      possessionDate: project.possessionDate ? String(project.possessionDate).slice(0, 10) : '',
      reraNumber: project.reraNumber || '',
      totalUnits: project.totalUnits || '',
      availableUnits: project.availableUnits || '',
      status: project.status || 'active',
      isFeatured: Boolean(project.isFeatured),
      description: project.description || ''
    });
    setModalOpen(true);
  };

  const save = async () => {
    try {
      const payload = toPayload(form);
      if (editing) await adminApi.updateProject(getId(editing), payload);
      else await adminApi.createProject(payload);
      setModalOpen(false);
      await load();
    } catch (error) {
      setState((current) => ({ ...current, error }));
    }
  };

  const remove = async (project) => {
    if (!confirm(`Delete project ${project.name || getId(project)}?`)) return;
    await adminApi.deleteProject(getId(project));
    await load();
  };

  const toggleFeatured = async (project) => {
    await adminApi.featureProject(getId(project), { isFeatured: !project.isFeatured });
    await load();
  };

  return (
    <div>
      <PageHeader title="Projects" description="Manage recommended and popular projects used by the mobile homepage, search, and builder pages." actions={<><button className="btn-secondary" onClick={load}>Refresh</button><button className="btn-primary" onClick={openCreate}>Add project</button></>} />
      <div className="card mb-6 p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <TextInput label="City" value={filters.city} onChange={(value) => updateFilter('city', value)} placeholder="Mumbai" />
          <TextInput label="Locality" value={filters.locality} onChange={(value) => updateFilter('locality', value)} placeholder="Andheri East" />
          <SelectInput label="Status" value={filters.status} onChange={(value) => updateFilter('status', value)} options={[{ label: 'All', value: '' }, 'active', 'pending', 'rejected', 'inactive'].map((v) => typeof v === 'string' ? { label: toTitle(v), value: v } : v)} />
          <SelectInput label="Featured" value={filters.isFeatured} onChange={(value) => updateFilter('isFeatured', value)} options={[{ label: 'All', value: '' }, { label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]} />
          <div className="flex items-end gap-2"><button className="btn-primary w-full" onClick={load}>Apply</button><button className="btn-secondary" onClick={() => setFilters(defaults)}>Reset</button></div>
        </div>
      </div>
      {state.error ? <ErrorState error={state.error} onRetry={load} /> : <DataTable columns={[
        { header: 'Project', render: (row) => <div><b>{row.name}</b><p className="text-xs text-slate-500">{row.locality}, {row.city}</p></div> },
        { header: 'Builder', render: (row) => row.builder?.name || row.builder || '—' },
        { header: 'Price', render: (row) => row.priceRange?.min || row.priceRange?.max ? `${formatCurrency(row.priceRange?.min)} - ${formatCurrency(row.priceRange?.max)}` : '—' },
        { header: 'Units', render: (row) => `${row.availableUnits ?? '—'} / ${row.totalUnits ?? '—'}` },
        { header: 'Status', render: (row) => <Badge value={row.status} /> },
        { header: 'Featured', render: (row) => <Badge value={row.isFeatured ? 'active' : 'inactive'}>{row.isFeatured ? 'Yes' : 'No'}</Badge> },
        { header: 'Updated', render: (row) => formatDate(row.updatedAt || row.createdAt) },
        { header: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-1.5" onClick={() => openEdit(row)}>Edit</button><button className="btn-secondary px-3 py-1.5" onClick={() => toggleFeatured(row)}>{row.isFeatured ? 'Unfeature' : 'Feature'}</button><button className="btn-danger px-3 py-1.5" onClick={() => remove(row)}>Delete</button></div> }
      ]} rows={state.rows} loading={state.loading} emptyTitle="No projects found" />}
      <Pagination meta={state.meta} page={filters.page} onPageChange={(page) => updateFilter('page', page)} />

      <Modal open={modalOpen} title={editing ? 'Edit project' : 'Add project'} subtitle="Project data powers mobile Recommended Projects and project search." onClose={() => setModalOpen(false)} size="max-w-4xl">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Name" value={form.name} onChange={(value) => updateForm('name', value)} required />
          <TextInput label="Builder user ID" value={form.builder} onChange={(value) => updateForm('builder', value)} hint="Use builder user _id when available." />
          <TextInput label="City" value={form.city} onChange={(value) => updateForm('city', value)} />
          <TextInput label="Locality" value={form.locality} onChange={(value) => updateForm('locality', value)} />
          <TextInput label="Min price" type="number" value={form.minPrice} onChange={(value) => updateForm('minPrice', value)} />
          <TextInput label="Max price" type="number" value={form.maxPrice} onChange={(value) => updateForm('maxPrice', value)} />
          <TextInput label="Configurations" value={form.configurationsText} onChange={(value) => updateForm('configurationsText', value)} placeholder="2 BHK, 3 BHK" />
          <TextInput label="Amenities" value={form.amenitiesText} onChange={(value) => updateForm('amenitiesText', value)} placeholder="Pool, Gym, Parking" />
          <TextInput label="Possession date" type="date" value={form.possessionDate} onChange={(value) => updateForm('possessionDate', value)} />
          <TextInput label="RERA number" value={form.reraNumber} onChange={(value) => updateForm('reraNumber', value)} />
          <TextInput label="Total units" type="number" value={form.totalUnits} onChange={(value) => updateForm('totalUnits', value)} />
          <TextInput label="Available units" type="number" value={form.availableUnits} onChange={(value) => updateForm('availableUnits', value)} />
          <SelectInput label="Status" value={form.status} onChange={(value) => updateForm('status', value)} options={['active', 'pending', 'rejected', 'inactive'].map((status) => ({ label: toTitle(status), value: status }))} />
          <SelectInput label="Featured" value={form.isFeatured ? 'true' : 'false'} onChange={(value) => updateForm('isFeatured', value === 'true')} options={[{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]} />
          <div className="md:col-span-2"><TextInput label="Address" value={form.address} onChange={(value) => updateForm('address', value)} /></div>
          <div className="md:col-span-2"><TextArea label="Description" value={form.description} onChange={(value) => updateForm('description', value)} /></div>
        </div>
        <div className="mt-6 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>{editing ? 'Save changes' : 'Create project'}</button></div>
      </Modal>
    </div>
  );
}
