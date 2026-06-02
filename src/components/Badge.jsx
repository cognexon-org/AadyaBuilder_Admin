import { cx, toTitle } from '../utils/formatters';

const toneMap = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  true: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  published: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  captured: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  pending_review: 'bg-amber-50 text-amber-700 ring-amber-200',
  draft: 'bg-slate-50 text-slate-600 ring-slate-200',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  false: 'bg-slate-100 text-slate-600 ring-slate-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  archived: 'bg-rose-50 text-rose-700 ring-rose-200',
  spam: 'bg-rose-50 text-rose-700 ring-rose-200',
  admin: 'bg-purple-50 text-purple-700 ring-purple-200',
  dealer: 'bg-blue-50 text-blue-700 ring-blue-200',
  builder: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  owner: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  buyer: 'bg-slate-50 text-slate-700 ring-slate-200',
  rent: 'bg-orange-50 text-orange-700 ring-orange-200',
  buy: 'bg-sky-50 text-sky-700 ring-sky-200',
  new_launch: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200'
};

export default function Badge({ value, children, tone, className }) {
  const key = String(tone || value || '').toLowerCase();
  return (
    <span className={cx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset', toneMap[key] || 'bg-slate-50 text-slate-700 ring-slate-200', className)}>
      {children || toTitle(value)}
    </span>
  );
}
