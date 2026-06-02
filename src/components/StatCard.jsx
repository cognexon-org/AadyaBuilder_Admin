import { cx } from '../utils/formatters';

export default function StatCard({ label, value, hint, icon, className }) {
  return (
    <div className={cx('card p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p>
          {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {icon ? <div className="rounded-2xl bg-slate-950 p-3 text-white">{icon}</div> : null}
      </div>
    </div>
  );
}
