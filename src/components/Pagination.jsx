export default function Pagination({ meta, page, onPageChange }) {
  if (!meta && !page) return null;
  const current = Number(meta?.page || page || 1);
  const totalPages = Number(meta?.totalPages || 1);
  const total = Number(meta?.total || 0);

  if (totalPages <= 1 && total === 0) return null;

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 sm:flex-row">
      <p>
        Page <span className="font-bold text-slate-900">{current}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
        {total ? <> · <span className="font-bold text-slate-900">{total}</span> records</> : null}
      </p>
      <div className="flex gap-2">
        <button className="btn-secondary" disabled={current <= 1} onClick={() => onPageChange(current - 1)}>Previous</button>
        <button className="btn-secondary" disabled={current >= totalPages} onClick={() => onPageChange(current + 1)}>Next</button>
      </div>
    </div>
  );
}
