import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import DataTable from '../components/DataTable';
import { SelectInput, TextArea, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { compactObject, parseNumber, unwrapList } from '../utils/apiData';
import { formatCurrency, formatDate, getId } from '../utils/formatters';

const emptyPlan = { name: '', price: '', durationDays: 7, multiplier: 3, description: '', isActive: true };

export default function Boost() {
  const [state, setState] = useState({ loading: true, error: null, plans: [], orders: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [manual, setManual] = useState({ propertyId: '', boostPlanId: '', durationDays: '' });
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const [plans, orders] = await Promise.allSettled([adminApi.boostPlans(), adminApi.boostOrders({ limit: 20 })]);
      if (plans.status === 'rejected') throw plans.reason;
      setState({ loading: false, error: null, plans: unwrapList(plans.value), orders: orders.status === 'fulfilled' ? unwrapList(orders.value) : [] });
    } catch (error) {
      setState({ loading: false, error, plans: [], orders: [] });
    }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyPlan); setModalOpen(true); };
  const openEdit = (plan) => { setEditing(plan); setForm({ name: plan.name || '', price: plan.price || '', durationDays: plan.durationDays || 7, multiplier: plan.multiplier || 3, description: plan.description || '', isActive: plan.isActive !== false }); setModalOpen(true); };
  const save = async () => {
    try {
      const payload = compactObject({ name: form.name, price: parseNumber(form.price), durationDays: parseNumber(form.durationDays), multiplier: parseNumber(form.multiplier), description: form.description, isActive: Boolean(form.isActive) });
      if (editing) await adminApi.updateBoostPlan(getId(editing), payload); else await adminApi.createBoostPlan(payload);
      setModalOpen(false); await load();
    } catch (error) { setState((current) => ({ ...current, error })); }
  };
  const toggle = async (plan) => { await adminApi.toggleBoostPlan(getId(plan)); await load(); };
  const applyManual = async () => {
    try {
      await adminApi.boostProperty(manual.propertyId, compactObject({ boostPlanId: manual.boostPlanId, durationDays: parseNumber(manual.durationDays) }));
      setManual({ propertyId: '', boostPlanId: '', durationDays: '' }); await load();
    } catch (error) { setState((current) => ({ ...current, error })); }
  };

  return (
    <div>
      <PageHeader title="Boost Listings" description="Manage paid boost plans and manually boost listings for testing/support cases." actions={<><button className="btn-secondary" onClick={load}>Refresh</button><button className="btn-primary" onClick={openCreate}>Add boost plan</button></>} />
      {state.error ? <ErrorState error={state.error} onRetry={load} /> : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <section><h2 className="mb-3 text-lg font-black">Boost plans</h2><DataTable rows={state.plans} loading={state.loading} emptyTitle="No boost plans" columns={[
          { header: 'Plan', render: (row) => <div><b>{row.name}</b><p className="text-xs text-slate-500">{row.description || '—'}</p></div> },
          { header: 'Price', render: (row) => formatCurrency(row.price) },
          { header: 'Duration', render: (row) => `${row.durationDays || 0} days` },
          { header: 'Multiplier', render: (row) => `${row.multiplier || 1}x` },
          { header: 'Status', render: (row) => <Badge value={row.isActive !== false ? 'active' : 'inactive'}>{row.isActive !== false ? 'Active' : 'Inactive'}</Badge> },
          { header: 'Actions', render: (row) => <div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-1.5" onClick={() => openEdit(row)}>Edit</button><button className="btn-secondary px-3 py-1.5" onClick={() => toggle(row)}>Toggle</button></div> }
        ]} /></section>
        <section className="card p-5"><h2 className="text-lg font-black">Manual boost</h2><div className="mt-4 space-y-4"><TextInput label="Property ID" value={manual.propertyId} onChange={(value) => setManual((current) => ({ ...current, propertyId: value }))} /><TextInput label="Boost plan ID" value={manual.boostPlanId} onChange={(value) => setManual((current) => ({ ...current, boostPlanId: value }))} /><TextInput label="Duration days" type="number" value={manual.durationDays} onChange={(value) => setManual((current) => ({ ...current, durationDays: value }))} /><button className="btn-primary" disabled={!manual.propertyId} onClick={applyManual}>Apply boost</button></div></section>
      </div>
      <section className="mt-6"><h2 className="mb-3 text-lg font-black">Recent boost orders</h2><DataTable rows={state.orders} loading={false} emptyTitle="No boost orders" columns={[{ header: 'Property', render: (row) => row.property?.title || row.property || '—' }, { header: 'Plan', render: (row) => row.plan?.name || row.boostPlan?.name || row.plan || '—' }, { header: 'Amount', render: (row) => formatCurrency(row.amount || row.price) }, { header: 'Status', render: (row) => <Badge value={row.status || 'created'} /> }, { header: 'Created', render: (row) => formatDate(row.createdAt) }]} /></section>
      <Modal open={modalOpen} title={editing ? 'Edit boost plan' : 'Add boost plan'} onClose={() => setModalOpen(false)}>
        <div className="grid gap-4 md:grid-cols-2"><TextInput label="Name" value={form.name} onChange={(value) => updateForm('name', value)} /><TextInput label="Price" type="number" value={form.price} onChange={(value) => updateForm('price', value)} /><TextInput label="Duration days" type="number" value={form.durationDays} onChange={(value) => updateForm('durationDays', value)} /><TextInput label="View multiplier" type="number" value={form.multiplier} onChange={(value) => updateForm('multiplier', value)} /><SelectInput label="Active" value={form.isActive ? 'true' : 'false'} onChange={(value) => updateForm('isActive', value === 'true')} options={[{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]} /><div className="md:col-span-2"><TextArea label="Description" value={form.description} onChange={(value) => updateForm('description', value)} /></div></div>
        <div className="mt-6 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button><button className="btn-primary" onClick={save}>Save</button></div>
      </Modal>
    </div>
  );
}
