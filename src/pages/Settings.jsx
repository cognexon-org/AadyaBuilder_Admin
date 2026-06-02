import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import { Checkbox, TextInput } from '../components/Field';
import { ErrorState, Loading } from '../components/Loading';
import PageHeader from '../components/PageHeader';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [pattern, setPattern] = useState('');
  const [state, setState] = useState({ loading: true, error: null, message: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setState({ loading: true, error: null, message: '' });
    try {
      const response = await adminApi.settings();
      setSettings(response.data || {});
      setState({ loading: false, error: null, message: '' });
    } catch (error) {
      setState({ loading: false, error, message: '' });
    }
  };

  useEffect(() => { load(); }, []);

  const update = (field, value) => setSettings((current) => ({ ...current, [field]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const response = await adminApi.updateSettings(settings);
      setSettings(response.data || settings);
      setState((current) => ({ ...current, message: response.message || 'Settings updated.' }));
    } catch (error) {
      setState((current) => ({ ...current, error }));
    } finally {
      setSaving(false);
    }
  };

  const clearCache = async () => {
    setSaving(true);
    try {
      const response = await adminApi.clearCache({ pattern: pattern || undefined });
      setState((current) => ({ ...current, message: response.message || 'Cache cleared.' }));
    } catch (error) {
      setState((current) => ({ ...current, error }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="System Settings" description="Update global admin settings and clear Redis cache. The current backend returns default settings and echoes updates." actions={<button className="btn-secondary" onClick={load}>Refresh</button>} />
      {state.loading ? <Loading /> : state.error && !settings ? <ErrorState error={state.error} onRetry={load} /> : settings ? (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="card p-5">
            {state.message ? <div className="mb-4 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{state.message}</div> : null}
            {state.error ? <div className="mb-4"><ErrorState error={state.error} /></div> : null}
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Free listing limit" type="number" value={settings.freeListingLimit} onChange={(value) => update('freeListingLimit', Number(value))} />
              <TextInput label="Featured listing price" type="number" value={settings.featuredListingPrice} onChange={(value) => update('featuredListingPrice', Number(value))} />
              <TextInput label="Max images per property" type="number" value={settings.maxImagesPerProperty} onChange={(value) => update('maxImagesPerProperty', Number(value))} />
              <TextInput label="Lead spam threshold" type="number" value={settings.leadSpamThreshold} onChange={(value) => update('leadSpamThreshold', Number(value))} />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Checkbox label="Cache enabled" checked={settings.cacheEnabled} onChange={(value) => update('cacheEnabled', value)} />
              <Checkbox label="Maintenance mode" checked={settings.maintenanceMode} onChange={(value) => update('maintenanceMode', value)} />
            </div>
            <button className="btn-primary mt-6" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button>
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-black text-slate-950">Cache tools</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Leave pattern blank to clear all cache, or enter a Redis key pattern such as <code>search:*</code>.</p>
            <div className="mt-4"><TextInput label="Pattern" value={pattern} onChange={setPattern} placeholder="search:*" /></div>
            <button className="btn-danger mt-4 w-full" onClick={clearCache} disabled={saving}>{saving ? 'Clearing...' : 'Clear cache'}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
