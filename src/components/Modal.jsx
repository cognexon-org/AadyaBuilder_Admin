import { useEffect } from 'react';

export default function Modal({ open, title, subtitle, children, onClose, footer, size = 'max-w-3xl' }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onMouseDown={onClose}>
      <div className={`max-h-[90vh] w-full ${size} overflow-hidden rounded-3xl bg-white shadow-2xl`} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <button className="rounded-xl px-3 py-2 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-900" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <div className="max-h-[65vh] overflow-y-auto p-6 scrollbar-thin">{children}</div>
        {footer ? <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
