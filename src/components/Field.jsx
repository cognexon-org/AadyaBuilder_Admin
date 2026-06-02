export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function TextInput({ label, value, onChange, type = 'text', placeholder, required, hint, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <input className="input" type={type} value={value ?? ''} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} required={required} {...props} />
    </Field>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 4, required, hint, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <textarea className="input min-h-28" rows={rows} value={value ?? ''} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} required={required} {...props} />
    </Field>
  );
}

export function SelectInput({ label, value, onChange, options = [], required, hint, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <select className="input" value={value ?? ''} onChange={(event) => onChange?.(event.target.value)} required={required} {...props}>
        {options.map((option) => {
          const item = typeof option === 'string' ? { label: option, value: option } : option;
          return <option key={item.value} value={item.value}>{item.label}</option>;
        })}
      </select>
    </Field>
  );
}

export function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange?.(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
      {label}
    </label>
  );
}
