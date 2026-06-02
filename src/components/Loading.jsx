export function Loading({ label = 'Loading data...' }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-sm font-semibold text-slate-500">
      <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
      {label}
    </div>
  );
}

export function EmptyState({ title = 'No data found', description = 'Try changing filters or creating a new item.' }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
      <p className="text-base font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700">
      <p className="font-bold">Something went wrong</p>
      <p className="mt-1">{error?.message || String(error)}</p>
      {onRetry ? <button className="mt-4 btn-danger" onClick={onRetry}>Retry</button> : null}
    </div>
  );
}
