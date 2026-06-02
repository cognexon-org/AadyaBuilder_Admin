import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import DataTable from '../components/DataTable';
import { TextArea, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { formatDate, getId } from '../utils/formatters';

export default function Notifications() {
  const [broadcast, setBroadcast] = useState({ title: '', message: '', dataText: '{}' });
  const [recommendation, setRecommendation] = useState({ title: '', message: '', propertyId: '', userIdsText: '' });
  const [state, setState] = useState({ loading: true, error: null, rows: [], meta: null, message: '' });
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await adminApi.notifications({ page, limit: 20 });
      const payload = response.data || {};
      setState({ loading: false, error: null, rows: payload.notifications || [], meta: payload.pagination ? { page: payload.pagination.page, totalPages: payload.pagination.pages, total: payload.pagination.total } : null, message: '' });
    } catch (error) {
      setState({ loading: false, error, rows: [], meta: null, message: '' });
    }
  };

  useEffect(() => { load(); }, [page]);

  const sendBroadcast = async () => {
    setSending(true);
    try {
      let data = {};
      try { data = JSON.parse(broadcast.dataText || '{}'); } catch { throw new Error('Broadcast data must be valid JSON.'); }
      const response = await adminApi.broadcastNotification({ title: broadcast.title, message: broadcast.message, data });
      setState((current) => ({ ...current, message: response.message || 'Broadcast sent.' }));
      setBroadcast({ title: '', message: '', dataText: '{}' });
      await load();
    } catch (error) {
      setState((current) => ({ ...current, error }));
    } finally {
      setSending(false);
    }
  };

  const sendRecommendation = async () => {
    setSending(true);
    try {
      const userIds = recommendation.userIdsText.split(',').map((item) => item.trim()).filter(Boolean);
      const response = await adminApi.propertyRecommendation({ title: recommendation.title, message: recommendation.message, propertyId: recommendation.propertyId, userIds });
      setState((current) => ({ ...current, message: response.message || 'Recommendation sent.' }));
      setRecommendation({ title: '', message: '', propertyId: '', userIdsText: '' });
      await load();
    } catch (error) {
      setState((current) => ({ ...current, error }));
    } finally {
      setSending(false);
    }
  };

  const markRead = async (notification) => {
    await adminApi.markNotificationRead(getId(notification));
    await load();
  };

  return (
    <div>
      <PageHeader title="Notifications" description="Send global broadcast notifications, send property recommendations, and view the logged-in admin notification inbox." />
      {state.message ? <div className="mb-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{state.message}</div> : null}
      {state.error ? <div className="mb-4"><ErrorState error={state.error} /></div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-black text-slate-950">Broadcast notification</h2>
          <div className="mt-4 space-y-4">
            <TextInput label="Title" value={broadcast.title} onChange={(value) => setBroadcast((current) => ({ ...current, title: value }))} />
            <TextArea label="Message" value={broadcast.message} onChange={(value) => setBroadcast((current) => ({ ...current, message: value }))} />
            <TextArea label="Data JSON" value={broadcast.dataText} onChange={(value) => setBroadcast((current) => ({ ...current, dataText: value }))} rows={3} />
            <button className="btn-primary" onClick={sendBroadcast} disabled={sending || !broadcast.title || !broadcast.message}>Send broadcast</button>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-black text-slate-950">Property recommendation</h2>
          <div className="mt-4 space-y-4">
            <TextInput label="Title" value={recommendation.title} onChange={(value) => setRecommendation((current) => ({ ...current, title: value }))} />
            <TextArea label="Message" value={recommendation.message} onChange={(value) => setRecommendation((current) => ({ ...current, message: value }))} />
            <TextInput label="Property ID" value={recommendation.propertyId} onChange={(value) => setRecommendation((current) => ({ ...current, propertyId: value }))} />
            <TextInput label="User IDs" value={recommendation.userIdsText} onChange={(value) => setRecommendation((current) => ({ ...current, userIdsText: value }))} hint="Comma-separated. Leave empty to broadcast recommendation to all active users." />
            <button className="btn-primary" onClick={sendRecommendation} disabled={sending || !recommendation.title || !recommendation.message || !recommendation.propertyId}>Send recommendation</button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <PageHeader title="My notification inbox" actions={<button className="btn-secondary" onClick={load}>Refresh</button>} />
        <DataTable
          columns={[
            { header: 'Title', render: (row) => <div><b>{row.title}</b><p className="text-xs text-slate-500">{row.message}</p></div> },
            { header: 'Type', render: (row) => row.type || '—' },
            { header: 'Read', render: (row) => row.read ? 'Yes' : 'No' },
            { header: 'Created', render: (row) => formatDate(row.createdAt) },
            { header: 'Actions', render: (row) => row.read ? '—' : <button className="btn-secondary px-3 py-1.5" onClick={() => markRead(row)}>Mark read</button> }
          ]}
          rows={state.rows}
          loading={state.loading}
          emptyTitle="No notifications"
        />
        <Pagination meta={state.meta} page={page} onPageChange={setPage} />
      </div>
    </div>
  );
}
