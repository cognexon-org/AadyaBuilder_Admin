import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import DataTable from '../components/DataTable';
import { SelectInput, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import PageHeader from '../components/PageHeader';
import { unwrapList } from '../utils/apiData';
import { formatCurrency, formatNumber } from '../utils/formatters';

export default function Locations() {
  const [city, setCity] = useState('Mumbai');
  const [period, setPeriod] = useState('1Y');
  const [state, setState] = useState({ loading: true, error: null, cities: [], localities: [], gainers: [], typeStats: [], bhkStats: [], postedByStats: [] });

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const [cities, localities, gainers, typeStats, bhkStats, postedByStats] = await Promise.all([
        adminApi.popularCities({ limit: 50 }),
        adminApi.recommendedLocalities({ city }),
        adminApi.topGainers({ city, period }),
        adminApi.propertyTypeStats({ city }),
        adminApi.bhkStats({ city }),
        adminApi.postedByStats({ city })
      ]);
      setState({ loading: false, error: null, cities: unwrapList(cities), localities: unwrapList(localities), gainers: unwrapList(gainers), typeStats: unwrapList(typeStats), bhkStats: unwrapList(bhkStats), postedByStats: unwrapList(postedByStats) });
    } catch (error) {
      setState((current) => ({ ...current, loading: false, error }));
    }
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <PageHeader title="Locations & Homepage Stats" description="Validate city cards, localities you may like, top gainers, BHK stats, property-type stats, and posted-by counts used by mobile home sections." actions={<button className="btn-primary" onClick={load}>Refresh</button>} />
      <div className="card mb-6 p-4"><div className="grid gap-4 md:grid-cols-4"><TextInput label="City" value={city} onChange={setCity} /><SelectInput label="Period" value={period} onChange={setPeriod} options={['3M', '6M', '1Y', '3Y', '5Y'].map((item) => ({ label: item, value: item }))} /><div className="flex items-end"><button className="btn-primary w-full" onClick={load}>Apply</button></div></div></div>
      {state.error ? <ErrorState error={state.error} onRetry={load} /> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <section><h2 className="mb-3 text-lg font-black">Popular cities</h2><DataTable rows={state.cities} loading={state.loading} emptyTitle="No cities" columns={[{ header: 'City', render: (r) => <b>{r.name || r.city}</b> }, { header: 'Properties', render: (r) => formatNumber(r.propertyCount || r.totalProperties) }, { header: 'Buy/Rent', render: (r) => `${formatNumber(r.buyCount)} / ${formatNumber(r.rentCount)}` }, { header: 'Average price', render: (r) => r.averagePrice ? formatCurrency(r.averagePrice) : '—' }]} rowKey={(r) => r._id || r.name || r.city} /></section>
        <section><h2 className="mb-3 text-lg font-black">Recommended localities</h2><DataTable rows={state.localities} loading={state.loading} emptyTitle="No localities" columns={[{ header: 'Locality', render: (r) => <b>{r.locality || r.name}</b> }, { header: 'City', render: (r) => r.city || city }, { header: 'Listings', render: (r) => formatNumber(r.listingsCount || r.propertyCount) }, { header: 'Rate/sq.ft', render: (r) => r.avgPricePerSqft ? `₹${formatNumber(r.avgPricePerSqft)}` : '—' }]} rowKey={(r) => r._id || r.locality || r.name} /></section>
        <section><h2 className="mb-3 text-lg font-black">Top gainers</h2><DataTable rows={state.gainers} loading={state.loading} emptyTitle="No gainers" columns={[{ header: 'Rank', render: (r, i) => r.rank || i + 1 }, { header: 'Locality', render: (r) => <b>{r.locality || r.name}</b> }, { header: 'Appreciation', render: (r) => r.appreciationPercent ? `${r.appreciationPercent}%` : '—' }, { header: 'Listings', render: (r) => formatNumber(r.listingsCount) }]} rowKey={(r, i) => r._id || r.locality || i} /></section>
        <section><h2 className="mb-3 text-lg font-black">Stats for cards</h2><div className="grid gap-4 md:grid-cols-3"><Mini title="Types" rows={state.typeStats} labelKey="type" /><Mini title="BHK" rows={state.bhkStats} labelKey="bhk" /><Mini title="Posted by" rows={state.postedByStats} labelKey="postedBy" /></div></section>
      </div>
    </div>
  );
}

function Mini({ title, rows, labelKey }) {
  return <div className="card p-4"><h3 className="text-sm font-black uppercase text-slate-500">{title}</h3><div className="mt-3 space-y-2">{rows?.length ? rows.map((row, index) => <div key={row._id || row[labelKey] || index} className="flex justify-between text-sm"><span className="font-semibold">{row.label || row[labelKey] || row._id}</span><b>{formatNumber(row.count || row.total)}</b></div>) : <p className="text-sm text-slate-500">No data</p>}</div></div>;
}
