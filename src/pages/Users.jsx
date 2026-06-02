import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import { SelectInput, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { booleanOptions, roles } from '../utils/constants';
import { formatCurrency, formatDate, getId, toTitle } from '../utils/formatters';

const blankFilters = { search: '', role: '', isVerified: '', isActive: '', page: 1, limit: 20 };

export default function Users() {
  const [filters, setFilters] = useState(blankFilters);
  const [state, setState] = useState({ loading: true, error: null, rows: [], meta: null });
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState({ loading: false, data: null, error: null });
  const [confirm, setConfirm] = useState(null);
  const [working, setWorking] = useState(false);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: field === 'page' ? value : 1 }));

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await adminApi.users(filters);
      setState({ loading: false, error: null, rows: response.data || [], meta: response.meta });
    } catch (error) {
      setState({ loading: false, error, rows: [], meta: null });
    }
  };

  const loadDetails = async (user) => {
    setSelected(user);
    setDetails({ loading: true, data: null, error: null });
    try {
      const response = await adminApi.userDetails(getId(user));
      setDetails({ loading: false, data: response.data, error: null });
    } catch (error) {
      setDetails({ loading: false, data: null, error });
    }
  };

  const runAction = async (action, successCallback = load) => {
    setWorking(true);
    try {
      await action();
      setConfirm(null);
      await successCallback();
      if (selected) await loadDetails(selected);
    } finally {
      setWorking(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters.page]);

  const columns = [
    {
      header: 'User',
      render: (user) => (
        <div>
          <button className="font-bold text-slate-950 hover:underline" onClick={() => loadDetails(user)}>{user.name || 'Unnamed'}</button>
          <p className="text-xs text-slate-500">{user.email}</p>
          <p className="text-xs text-slate-500">{user.phone || '—'}</p>
        </div>
      )
    },
    { header: 'Role', render: (user) => <Badge value={user.role} /> },
    { header: 'Verified', render: (user) => <Badge value={user.isVerified ? 'verified' : 'false'}>{user.isVerified ? 'Verified' : 'Unverified'}</Badge> },
    { header: 'Status', render: (user) => <Badge value={user.isActive ? 'active' : 'inactive'}>{user.isActive ? 'Active' : 'Inactive'}</Badge> },
    { header: 'Joined', render: (user) => formatDate(user.createdAt) },
    {
      header: 'Actions',
      render: (user) => (
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary px-3 py-1.5" onClick={() => loadDetails(user)}>View</button>
          {!user.isVerified ? <button className="btn-success px-3 py-1.5" onClick={() => setConfirm({ title: 'Verify user', message: `Verify ${user.name}?`, confirmText: 'Verify', onConfirm: () => runAction(() => adminApi.verifyUser(getId(user))) })}>Verify</button> : null}
          <button className="btn-secondary px-3 py-1.5" onClick={() => setConfirm({ title: user.isActive ? 'Deactivate user' : 'Activate user', message: `${user.isActive ? 'Deactivate' : 'Activate'} ${user.name}?`, confirmText: user.isActive ? 'Deactivate' : 'Activate', danger: user.isActive, onConfirm: () => runAction(() => adminApi.updateUserStatus(getId(user), { isActive: !user.isActive, blockReason: user.isActive ? 'Blocked by admin' : '' })) })}>{user.isActive ? 'Block' : 'Activate'}</button>
          <button className="btn-danger px-3 py-1.5" onClick={() => setConfirm({ title: 'Delete user', message: `Delete ${user.name}? This also deletes the user's properties and leads.`, confirmText: 'Delete', danger: true, onConfirm: () => runAction(() => adminApi.deleteUser(getId(user))) })}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader title="User Management" description="Search users, inspect activity, verify accounts, change roles, activate/deactivate accounts, and delete users." actions={<button className="btn-primary" onClick={load}>Refresh</button>} />

      <div className="card mb-6 p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <TextInput label="Search" value={filters.search} onChange={(value) => updateFilter('search', value)} placeholder="Name, email or phone" />
          <SelectInput label="Role" value={filters.role} onChange={(value) => updateFilter('role', value)} options={[{ label: 'All roles', value: '' }, ...roles.map((role) => ({ label: toTitle(role), value: role }))]} />
          <SelectInput label="Verified" value={filters.isVerified} onChange={(value) => updateFilter('isVerified', value)} options={booleanOptions} />
          <SelectInput label="Active" value={filters.isActive} onChange={(value) => updateFilter('isActive', value)} options={booleanOptions} />
          <div className="flex items-end gap-2">
            <button className="btn-primary w-full" onClick={load}>Apply</button>
            <button className="btn-secondary" onClick={() => setFilters(blankFilters)}>Reset</button>
          </div>
        </div>
      </div>

      {state.error ? <ErrorState error={state.error} onRetry={load} /> : <DataTable columns={columns} rows={state.rows} loading={state.loading} emptyTitle="No users found" />}
      <Pagination meta={state.meta} page={filters.page} onPageChange={(page) => updateFilter('page', page)} />

      <Modal open={Boolean(selected)} title="User details" subtitle={selected?.email} onClose={() => setSelected(null)} size="max-w-5xl">
        {details.loading ? <p className="text-sm text-slate-500">Loading details...</p> : details.error ? <ErrorState error={details.error} /> : details.data ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="label">Name</p><p className="font-bold">{details.data.user?.name}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="label">Role</p><Badge value={details.data.user?.role} /></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="label">Joined</p><p className="font-bold">{formatDate(details.data.user?.createdAt)}</p></div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="card p-4 shadow-none">
                <h3 className="mb-3 font-black">Account controls</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectInput label="Change role" value={details.data.user?.role} onChange={(role) => runAction(() => adminApi.updateUserRole(getId(details.data.user), role), async () => load())} options={roles.map((role) => ({ label: toTitle(role), value: role }))} />
                  <div className="flex items-end gap-2">
                    <button className="btn-success w-full" disabled={details.data.user?.isVerified} onClick={() => runAction(() => adminApi.verifyUser(getId(details.data.user)), async () => load())}>Verify</button>
                  </div>
                </div>
              </div>
              <div className="card p-4 shadow-none">
                <h3 className="mb-3 font-black">Subscription</h3>
                <p className="text-sm text-slate-600">Plan: <b>{details.data.user?.subscription?.planName || details.data.user?.subscription?.plan?.name || 'Free/none'}</b></p>
                <p className="text-sm text-slate-600">Active: <b>{details.data.user?.subscription?.isActive ? 'Yes' : 'No'}</b></p>
                <p className="text-sm text-slate-600">Listings remaining: <b>{details.data.user?.subscription?.listingsRemaining ?? '—'}</b></p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-1">
                <h3 className="mb-3 font-black">Recent properties</h3>
                <div className="space-y-2">
                  {(details.data.properties || []).map((property) => <div key={property._id} className="rounded-2xl border border-slate-100 p-3 text-sm"><b>{property.title}</b><p className="text-xs text-slate-500">{formatCurrency(property.price)} · {property.status}</p></div>)}
                  {!(details.data.properties || []).length ? <p className="text-sm text-slate-500">No properties.</p> : null}
                </div>
              </div>
              <div>
                <h3 className="mb-3 font-black">Recent leads</h3>
                <div className="space-y-2">
                  {(details.data.leads || []).map((lead) => <div key={lead._id} className="rounded-2xl border border-slate-100 p-3 text-sm"><b>{lead.status}</b><p className="text-xs text-slate-500">{formatDate(lead.createdAt)}</p></div>)}
                  {!(details.data.leads || []).length ? <p className="text-sm text-slate-500">No leads.</p> : null}
                </div>
              </div>
              <div>
                <h3 className="mb-3 font-black">Recent transactions</h3>
                <div className="space-y-2">
                  {(details.data.transactions || []).map((transaction) => <div key={transaction._id} className="rounded-2xl border border-slate-100 p-3 text-sm"><b>{formatCurrency(transaction.amount)}</b><p className="text-xs text-slate-500">{transaction.status} · {formatDate(transaction.createdAt)}</p></div>)}
                  {!(details.data.transactions || []).length ? <p className="text-sm text-slate-500">No transactions.</p> : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} {...confirm} loading={working} onCancel={() => setConfirm(null)} />
    </div>
  );
}
