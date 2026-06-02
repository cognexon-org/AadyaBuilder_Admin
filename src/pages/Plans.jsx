import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import { Checkbox, SelectInput, TextArea, TextInput } from '../components/Field';
import { ErrorState, Loading } from '../components/Loading';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import { planTypes } from '../utils/constants';
import { formatCurrency, formatDateOnly, getId, toTitle } from '../utils/formatters';

const defaultForm = {
  name: '',
  code: '',
  description: '',
  type: 'dealer',
  price: 0,
  discountPrice: '',
  duration: 30,
  listingLimit: 1,
  featuredListingLimit: 0,
  premiumListingLimit: 0,
  searchPriority: 0,
  displayOrder: 0,
  featuresText: '',
  benefitsText: '',
  isActive: true,
  isPopular: false,
  isRecommended: false,
  includes: {
    bannerAds: false,
    projectGallery: false,
    dedicatedRM: false,
    propertyVerification: false,
    photoShoot: false,
    socialMediaPromotion: false,
    emailMarketing: false,
    analytics: false,
    leadExport: false
  },
  termsAndConditions: '',
  cancellationPolicy: ''
};

const fromPlan = (plan) => ({
  ...defaultForm,
  ...plan,
  discountPrice: plan.discountPrice ?? '',
  featuresText: (plan.features || []).join('\n'),
  benefitsText: (plan.benefits || []).join('\n'),
  includes: { ...defaultForm.includes, ...(plan.includes || {}) }
});

const toPayload = (form) => ({
  name: form.name,
  code: form.code || undefined,
  description: form.description,
  type: form.type,
  price: Number(form.price || 0),
  discountPrice: form.discountPrice === '' ? undefined : Number(form.discountPrice),
  duration: Number(form.duration || 1),
  listingLimit: Number(form.listingLimit || 1),
  featuredListingLimit: Number(form.featuredListingLimit || 0),
  premiumListingLimit: Number(form.premiumListingLimit || 0),
  searchPriority: Number(form.searchPriority || 0),
  displayOrder: Number(form.displayOrder || 0),
  features: form.featuresText.split('\n').map((item) => item.trim()).filter(Boolean),
  benefits: form.benefitsText.split('\n').map((item) => item.trim()).filter(Boolean),
  isActive: Boolean(form.isActive),
  isPopular: Boolean(form.isPopular),
  isRecommended: Boolean(form.isRecommended),
  includes: form.includes,
  termsAndConditions: form.termsAndConditions,
  cancellationPolicy: form.cancellationPolicy
});

export default function Plans() {
  const [state, setState] = useState({ loading: true, error: null, rows: [] });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [working, setWorking] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateInclude = (field, value) => setForm((current) => ({ ...current, includes: { ...current.includes, [field]: value } }));

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await adminApi.plans();
      setState({ loading: false, error: null, rows: response.data || [] });
    } catch (error) {
      setState({ loading: false, error, rows: [] });
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing({ mode: 'create' }); setForm(defaultForm); };
  const openEdit = (plan) => { setEditing({ mode: 'edit', plan }); setForm(fromPlan(plan)); };

  const save = async () => {
    setWorking(true);
    try {
      if (editing.mode === 'edit') await adminApi.updatePlan(getId(editing.plan), toPayload(form));
      else await adminApi.createPlan(toPayload(form));
      setEditing(null);
      await load();
    } finally {
      setWorking(false);
    }
  };

  const toggle = async (plan) => {
    setWorking(true);
    try {
      await adminApi.togglePlan(getId(plan));
      setConfirm(null);
      await load();
    } finally {
      setWorking(false);
    }
  };

  const columns = [
    { header: 'Plan', render: (plan) => <div><b className="text-slate-950">{plan.name}</b><p className="text-xs text-slate-500">{plan.code}</p><p className="text-xs text-slate-500">{plan.description}</p></div> },
    { header: 'Type', render: (plan) => <Badge value={plan.type} /> },
    { header: 'Price', render: (plan) => <div><b>{formatCurrency(plan.price)}</b>{plan.discountPrice ? <p className="text-xs text-emerald-600">Offer {formatCurrency(plan.discountPrice)}</p> : null}</div> },
    { header: 'Limits', render: (plan) => <div className="text-xs leading-5"><p><b>{plan.duration}</b> days</p><p><b>{plan.listingLimit}</b> listings</p><p><b>{plan.featuredListingLimit || 0}</b> featured</p></div> },
    { header: 'Status', render: (plan) => <Badge value={plan.isActive ? 'active' : 'inactive'}>{plan.isActive ? 'Active' : 'Inactive'}</Badge> },
    { header: 'Validity', render: (plan) => <div className="text-xs leading-5"><p>{formatDateOnly(plan.validFrom)}</p><p>{formatDateOnly(plan.validTill)}</p></div> },
    { header: 'Actions', render: (plan) => <div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-1.5" onClick={() => openEdit(plan)}>Edit</button><button className="btn-secondary px-3 py-1.5" onClick={() => setConfirm({ title: plan.isActive ? 'Deactivate plan' : 'Activate plan', message: `${plan.isActive ? 'Deactivate' : 'Activate'} ${plan.name}?`, confirmText: plan.isActive ? 'Deactivate' : 'Activate', onConfirm: () => toggle(plan) })}>{plan.isActive ? 'Deactivate' : 'Activate'}</button></div> }
  ];

  return (
    <div>
      <PageHeader title="Subscription Plans" description="Create, edit, activate, or deactivate owner, dealer, builder, and featured-only monetization plans." actions={<><button className="btn-secondary" onClick={load}>Refresh</button><button className="btn-primary" onClick={openCreate}>Create plan</button></>} />

      {state.loading ? <Loading /> : state.error ? <ErrorState error={state.error} onRetry={load} /> : <DataTable columns={columns} rows={state.rows} emptyTitle="No plans found" />}

      <Modal
        open={Boolean(editing)}
        title={editing?.mode === 'edit' ? 'Edit plan' : 'Create plan'}
        subtitle={editing?.plan?.name}
        onClose={() => setEditing(null)}
        size="max-w-5xl"
        footer={<div className="flex justify-end gap-2"><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" disabled={working} onClick={save}>{working ? 'Saving...' : 'Save plan'}</button></div>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput label="Plan name" value={form.name} onChange={(value) => update('name', value)} required />
          <TextInput label="Code" value={form.code} onChange={(value) => update('code', value)} hint="Optional. Backend generates code from name if blank." />
          <SelectInput label="Type" value={form.type} onChange={(value) => update('type', value)} options={planTypes.map((type) => ({ label: toTitle(type), value: type }))} />
          <TextInput label="Price" type="number" value={form.price} onChange={(value) => update('price', value)} required />
          <TextInput label="Discount price" type="number" value={form.discountPrice} onChange={(value) => update('discountPrice', value)} />
          <TextInput label="Duration days" type="number" value={form.duration} onChange={(value) => update('duration', value)} required />
          <TextInput label="Listing limit" type="number" value={form.listingLimit} onChange={(value) => update('listingLimit', value)} required />
          <TextInput label="Featured limit" type="number" value={form.featuredListingLimit} onChange={(value) => update('featuredListingLimit', value)} />
          <TextInput label="Premium limit" type="number" value={form.premiumListingLimit} onChange={(value) => update('premiumListingLimit', value)} />
          <TextInput label="Search priority" type="number" value={form.searchPriority} onChange={(value) => update('searchPriority', value)} />
          <TextInput label="Display order" type="number" value={form.displayOrder} onChange={(value) => update('displayOrder', value)} />
          <TextArea label="Description" value={form.description} onChange={(value) => update('description', value)} required />
          <TextArea label="Features" value={form.featuresText} onChange={(value) => update('featuresText', value)} hint="One feature per line." />
          <TextArea label="Benefits" value={form.benefitsText} onChange={(value) => update('benefitsText', value)} hint="One benefit per line." />
        </div>
        <div className="mt-6">
          <p className="label">Flags</p>
          <div className="grid gap-3 sm:grid-cols-3"><Checkbox label="Active" checked={form.isActive} onChange={(value) => update('isActive', value)} /><Checkbox label="Popular" checked={form.isPopular} onChange={(value) => update('isPopular', value)} /><Checkbox label="Recommended" checked={form.isRecommended} onChange={(value) => update('isRecommended', value)} /></div>
        </div>
        <div className="mt-6">
          <p className="label">Included services</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.keys(defaultForm.includes).map((key) => <Checkbox key={key} label={toTitle(key)} checked={form.includes[key]} onChange={(value) => updateInclude(key, value)} />)}</div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <TextArea label="Terms and conditions" value={form.termsAndConditions} onChange={(value) => update('termsAndConditions', value)} />
          <TextArea label="Cancellation policy" value={form.cancellationPolicy} onChange={(value) => update('cancellationPolicy', value)} />
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} {...confirm} loading={working} onCancel={() => setConfirm(null)} />
    </div>
  );
}
