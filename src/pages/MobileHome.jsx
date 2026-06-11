import { useState } from 'react';
import { adminApi } from '../api/adminApi';
import DataTable from '../components/DataTable';
import { TextInput } from '../components/Field';
import { ErrorState, Loading } from '../components/Loading';
import PageHeader from '../components/PageHeader';
import { unwrapList } from '../utils/apiData';
import { formatNumber } from '../utils/formatters';

const sections = [
  ['recommendedProperties', 'Recommended Properties'],
  ['recommendedProjects', 'Recommended Projects'],
  ['localitiesYouMayLike', 'Localities You May Like'],
  ['popularCities', 'Popular Cities'],
  ['popularBuilders', 'Popular Builders'],
  ['topGainers', 'Top Gainers'],
  ['propertyTypeStats', 'Property Type Stats'],
  ['bhkStats', 'BHK Stats'],
  ['postedByStats', 'Posted By Stats'],
  ['popularTools', 'Popular Tools'],
  ['articles', 'Articles'],
  ['otherOfferings', 'Other Offerings']
];

export default function MobileHome() {
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState({ loading: false, error: null, data: null });
  const load = async () => {
    setState({ loading: true, error: null, data: null });
    try {
      const response = await adminApi.home({ city });
      setState({ loading: false, error: null, data: response.data || response });
    } catch (error) {
      setState({ loading: false, error, data: null });
    }
  };

  return (
    <div>
      <PageHeader title="Mobile Home API" description="Preview the single aggregated API used by the app homepage screens." actions={<><TextInput label="City" value={city} onChange={setCity} /><button className="btn-primary self-end" onClick={load}>Load home API</button></>} />
      {state.loading ? <Loading /> : state.error ? <ErrorState error={state.error} onRetry={load} /> : state.data ? <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4"><div className="card p-4"><p className="label">Location</p><p className="text-xl font-black">{state.data.location || city}</p></div><div className="card p-4"><p className="label">Unread notifications</p><p className="text-xl font-black">{formatNumber(state.data.unreadNotifications)}</p></div><div className="card p-4"><p className="label">Sections</p><p className="text-xl font-black">{sections.filter(([key]) => Array.isArray(state.data[key])).length}</p></div></div>
        {sections.map(([key, label]) => <section key={key}><h2 className="mb-3 text-lg font-black">{label}</h2><DataTable rows={unwrapList(state.data[key])} emptyTitle={`No ${label.toLowerCase()}`} columns={[{ header: 'Title', render: (row) => <b>{row.title || row.name || row.locality || row.city || row.label || row.type || row.bhk || row.postedBy || '—'}</b> }, { header: 'Subtitle', render: (row) => row.subtitle || row.description || row.locality || row.city || '—' }, { header: 'Count/Value', render: (row) => row.count ?? row.propertyCount ?? row.listingsCount ?? row.totalProjects ?? row.price ?? '—' }]} rowKey={(r, i) => r._id || r.id || r.name || r.title || r.locality || `${key}-${i}`} /></section>)}
      </div> : <div className="card p-8 text-center text-slate-500">Click “Load home API” to preview mobile home payload.</div>}
    </div>
  );
}
