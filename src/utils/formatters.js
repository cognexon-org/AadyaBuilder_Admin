export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const toTitle = (value = '') =>
  String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateOnly = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

export const formatCurrency = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(number);
};

export const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));

export const getId = (item) => item?._id || item?.id || '';

export const getNested = (object, path, fallback = '—') => {
  const value = path.split('.').reduce((current, key) => current?.[key], object);
  return value === undefined || value === null || value === '' ? fallback : value;
};

export const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
