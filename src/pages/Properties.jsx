import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import { SelectInput, TextArea, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { booleanOptions, propertyStatuses } from '../utils/constants';
import { formatCurrency, formatDate, formatNumber, getId, toTitle } from '../utils/formatters';

const baseFilters = { page: 1, limit: 20, status: '', verified: '' };

export default function Properties() {
  const [mode, setMode] = useState('all');
  const [filters, setFilters] = useState(baseFilters);
  const [state, setState] = useState({ loading: true, error: null, rows: [], meta: null });
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState({ loading: false, data: null, error: null });
  const [review, setReview] = useState(null);
  const [feature, setFeature] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [working, setWorking] = useState(false);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: field === 'page' ? value : 1 }));

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = mode === 'pending'
        ? await adminApi.pendingProperties({ page: filters.page, limit: filters.limit })
        : await adminApi.allProperties(filters);
      setState({ loading: false, error: null, rows: response.data || [], meta: response.meta });
    } catch (error) {
      setState({ loading: false, error, rows: [], meta: null });
    }
  };

  const loadDetails = async (property) => {
    setSelected(property);
    setDetails({ loading: true, data: null, error: null });
    try {
      const response = await adminApi.propertyDetails(getId(property));
      setDetails({ loading: false, data: response.data, error: null });
    } catch (error) {
      setDetails({ loading: false, data: null, error });
    }
  };

  const runAction = async (action) => {
    setWorking(true);
    try {
      await action();
      setReview(null);
      setFeature(null);
      setConfirm(null);
      await load();
      if (selected) await loadDetails(selected);
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => { load(); }, [filters.page, mode]);

  const columns = [
    {
      header: 'Property',
      render: (property) => (
        <div className="max-w-sm">
          <button className="font-bold text-slate-950 hover:underline" onClick={() => loadDetails(property)}>{property.title}</button>
          <p className="text-xs text-slate-500">{property.propertyCode || getId(property)}</p>
          <p className="text-xs text-slate-500">{property.location?.locality ? `${property.location.locality}, ` : ''}{property.location?.city || '—'}</p>
        </div>
      )
    },
    { header: 'Owner', render: (property) => <div><b>{property.owner?.name || '—'}</b><p className="text-xs text-slate-500">{property.owner?.email || property.owner?.phone || '—'}</p></div> },
    { header: 'Purpose', render: (property) => <Badge value={property.purpose} /> },
    { header: 'Price', render: (property) => <b>{formatCurrency(property.price)}</b> },
    { header: 'Area', render: (property) => `${formatNumber(property.area?.value)} ${property.area?.unit || ''}` },
    { header: 'Status', render: (property) => <Badge value={property.status} /> },
    { header: 'Verified', render: (property) => <Badge value={property.isVerified ? 'verified' : 'false'}>{property.isVerified ? 'Verified' : 'No'}</Badge> },
    { header: 'Featured', render: (property) => <Badge value={property.isFeatured ? 'true' : 'false'}>{property.isFeatured ? 'Featured' : 'No'}</Badge> },
    {
      header: 'Actions',
      render: (property) => (
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary px-3 py-1.5" onClick={() => loadDetails(property)}>View</button>
          <button className="btn-success px-3 py-1.5" onClick={() => setReview({ property, isVerified: true, rejectionReason: '' })}>Approve</button>
          <button className="btn-secondary px-3 py-1.5" onClick={() => setReview({ property, isVerified: false, rejectionReason: '' })}>Reject</button>
          <button className="btn-secondary px-3 py-1.5" onClick={() => setFeature({ property, isFeatured: !property.isFeatured, featuredUntil: '' })}>{property.isFeatured ? 'Unfeature' : 'Feature'}</button>
          <button className="btn-danger px-3 py-1.5" onClick={() => setConfirm({ title: 'Delete property', message: `Delete ${property.title}?`, confirmText: 'Delete', danger: true, onConfirm: () => runAction(() => adminApi.deleteProperty(getId(property))) })}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="Property Management" description="Review pending listings, approve or reject verification, manually feature listings, inspect details, and delete violating properties." actions={<button className="btn-primary" onClick={load}>Refresh</button>} />

      <div className="mb-6 flex flex-wrap gap-2">
        <button className={mode === 'all' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setMode('all'); setFilters(baseFilters); }}>All properties</button>
        <button className={mode === 'pending' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setMode('pending'); setFilters(baseFilters); }}>Pending approvals</button>
      </div>

      {mode === 'all' ? (
        <div className="card mb-6 p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <SelectInput label="Status" value={filters.status} onChange={(value) => updateFilter('status', value)} options={[{ label: 'All statuses', value: '' }, ...propertyStatuses.map((status) => ({ label: toTitle(status), value: status }))]} />
            <SelectInput label="Verified" value={filters.verified} onChange={(value) => updateFilter('verified', value)} options={booleanOptions} />
            <SelectInput label="Page size" value={filters.limit} onChange={(value) => updateFilter('limit', value)} options={[10, 20, 50, 100].map((n) => ({ label: `${n} rows`, value: n }))} />
            <div className="flex items-end gap-2"><button className="btn-primary w-full" onClick={load}>Apply</button><button className="btn-secondary" onClick={() => setFilters(baseFilters)}>Reset</button></div>
          </div>
        </div>
      ) : null}

      {state.error ? <ErrorState error={state.error} onRetry={load} /> : <DataTable columns={columns} rows={state.rows} loading={state.loading} emptyTitle="No properties found" />}
      <Pagination meta={state.meta} page={filters.page} onPageChange={(page) => updateFilter('page', page)} />

      <Modal open={Boolean(selected)} title="Property details" subtitle={selected?.propertyCode} onClose={() => setSelected(null)} size="max-w-6xl">
        {details.loading ? <p className="text-sm text-slate-500">Loading details...</p> : details.error ? <ErrorState error={details.error} /> : details.data ? (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div>
                <h2 className="text-2xl font-black text-slate-950">{details.data.title}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{details.data.description}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="label">Price</p><p className="text-2xl font-black">{formatCurrency(details.data.price)}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="label">Type</p><p>{toTitle(details.data.propertyType)}</p></div>
                  <div><p className="label">Purpose</p><p>{toTitle(details.data.purpose)}</p></div>
                  <div><p className="label">Status</p><Badge value={details.data.status} /></div>
                  <div><p className="label">Views</p><p>{formatNumber(details.data.views)}</p></div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 p-4"><p className="label">Location</p><p className="font-semibold">{details.data.location?.address || details.data.location?.city || '—'}</p></div>
              <div className="rounded-2xl border border-slate-100 p-4"><p className="label">Area</p><p className="font-semibold">{formatNumber(details.data.area?.value)} {details.data.area?.unit}</p></div>
              <div className="rounded-2xl border border-slate-100 p-4"><p className="label">BHK</p><p className="font-semibold">{details.data.bedrooms ?? '—'} bed · {details.data.bathrooms ?? '—'} bath</p></div>
              <div className="rounded-2xl border border-slate-100 p-4"><p className="label">Created</p><p className="font-semibold">{formatDate(details.data.createdAt)}</p></div>
            </div>
            {details.data.images?.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{details.data.images.map((image) => <img key={image._id || image.url} src={image.url} alt={image.caption || details.data.title} className="h-40 w-full rounded-2xl object-cover" />)}</div> : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(review)}
        title={review?.isVerified ? 'Approve property' : 'Reject property'}
        subtitle={review?.property?.title}
        onClose={() => setReview(null)}
        size="max-w-lg"
        footer={<div className="flex justify-end gap-2"><button className="btn-secondary" onClick={() => setReview(null)}>Cancel</button><button className={review?.isVerified ? 'btn-success' : 'btn-danger'} disabled={working} onClick={() => runAction(() => adminApi.verifyProperty(getId(review.property), { isVerified: review.isVerified, rejectionReason: review.rejectionReason }))}>{working ? 'Saving...' : review?.isVerified ? 'Approve' : 'Reject'}</button></div>}
      >
        {!review?.isVerified ? <TextArea label="Rejection reason" value={review?.rejectionReason} onChange={(value) => setReview((current) => ({ ...current, rejectionReason: value }))} placeholder="Explain why this listing is rejected" /> : <p className="text-sm text-slate-600">This will mark the property as verified and activate the listing according to the backend verification flow.</p>}
      </Modal>

      <Modal
        open={Boolean(feature)}
        title={feature?.isFeatured ? 'Feature property' : 'Unfeature property'}
        subtitle={feature?.property?.title}
        onClose={() => setFeature(null)}
        size="max-w-lg"
        footer={<div className="flex justify-end gap-2"><button className="btn-secondary" onClick={() => setFeature(null)}>Cancel</button><button className="btn-primary" disabled={working} onClick={() => runAction(() => adminApi.featureProperty(getId(feature.property), { isFeatured: feature.isFeatured, featuredUntil: feature.featuredUntil || undefined }))}>{working ? 'Saving...' : 'Save'}</button></div>}
      >
        {feature?.isFeatured ? <TextInput label="Featured until" type="date" value={feature?.featuredUntil} onChange={(value) => setFeature((current) => ({ ...current, featuredUntil: value }))} hint="Optional. Leave empty for backend default behavior." /> : <p className="text-sm text-slate-600">This will remove featured placement from the property.</p>}
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} {...confirm} loading={working} onCancel={() => setConfirm(null)} />
    </div>
  );
}
