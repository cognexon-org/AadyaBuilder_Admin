import { useEffect, useState } from 'react';
import { adminApi } from '../api/adminApi';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import { SelectInput, TextArea, TextInput } from '../components/Field';
import { ErrorState } from '../components/Loading';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import Pagination from '../components/Pagination';
import { articleStatuses } from '../utils/constants';
import { formatDate, formatNumber, getId, toTitle } from '../utils/formatters';

const filterDefaults = { page: 1, limit: 20, status: '', category: '', search: '' };
const formDefaults = {
  title: '',
  excerpt: '',
  content: '',
  category: 'Buyer Guides',
  subCategory: '',
  targetAudienceText: 'all',
  featuredImage: '',
  tagsText: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywordsText: '',
  status: 'draft'
};

const fromArticle = (article) => ({
  ...formDefaults,
  ...article,
  featuredImage: article.featuredImage?.url || article.featuredImage || '',
  targetAudienceText: (article.targetAudience || ['all']).join(', '),
  tagsText: (article.tags || []).join(', '),
  metaKeywordsText: (article.metaKeywords || []).join(', ')
});

const toPayload = (form, isCreate) => {
  const payload = {
    title: form.title,
    excerpt: form.excerpt,
    content: form.content,
    category: form.category,
    subCategory: form.subCategory,
    targetAudience: form.targetAudienceText.split(',').map((item) => item.trim()).filter(Boolean),
    featuredImage: form.featuredImage || undefined,
    tags: form.tagsText.split(',').map((item) => item.trim()).filter(Boolean),
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    metaKeywords: form.metaKeywordsText.split(',').map((item) => item.trim()).filter(Boolean)
  };
  if (isCreate) payload.status = form.status;
  return payload;
};

export default function Content() {
  const [filters, setFilters] = useState(filterDefaults);
  const [state, setState] = useState({ loading: true, error: null, rows: [], meta: null });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(formDefaults);
  const [confirm, setConfirm] = useState(null);
  const [working, setWorking] = useState(false);

  const updateFilter = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: field === 'page' ? value : 1 }));
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const load = async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const response = await adminApi.articles(filters);
      setState({ loading: false, error: null, rows: response.data || [], meta: response.meta });
    } catch (error) {
      setState({ loading: false, error, rows: [], meta: null });
    }
  };

  useEffect(() => { load(); }, [filters.page]);

  const openCreate = () => { setEditing({ mode: 'create' }); setForm(formDefaults); };
  const openEdit = (article) => { setEditing({ mode: 'edit', article }); setForm(fromArticle(article)); };

  const save = async () => {
    setWorking(true);
    try {
      if (editing.mode === 'edit') await adminApi.updateArticle(getId(editing.article), toPayload(form, false));
      else await adminApi.createArticle(toPayload(form, true));
      setEditing(null);
      await load();
    } finally {
      setWorking(false);
    }
  };

  const runAction = async (action) => {
    setWorking(true);
    try {
      await action();
      setConfirm(null);
      await load();
    } finally {
      setWorking(false);
    }
  };

  const columns = [
    { header: 'Article', render: (article) => <div className="max-w-md"><b className="text-slate-950">{article.title}</b><p className="text-xs text-slate-500">/{article.slug}</p><p className="line-clamp-2 text-xs text-slate-500">{article.excerpt}</p></div> },
    { header: 'Category', render: (article) => <span className="text-sm font-semibold">{article.category}</span> },
    { header: 'Status', render: (article) => <Badge value={article.status} /> },
    { header: 'Audience', render: (article) => <div className="flex flex-wrap gap-1">{(article.targetAudience || []).map((target) => <Badge key={target} value={target} />)}</div> },
    { header: 'Views', render: (article) => formatNumber(article.views) },
    { header: 'Updated', render: (article) => formatDate(article.updatedAt || article.createdAt) },
    { header: 'Actions', render: (article) => <div className="flex flex-wrap gap-2"><button className="btn-secondary px-3 py-1.5" onClick={() => openEdit(article)}>Edit</button>{article.status !== 'published' ? <button className="btn-success px-3 py-1.5" onClick={() => setConfirm({ title: 'Publish article', message: `Publish ${article.title}?`, confirmText: 'Publish', onConfirm: () => runAction(() => adminApi.publishArticle(getId(article))) })}>Publish</button> : null}{article.status !== 'archived' ? <button className="btn-secondary px-3 py-1.5" onClick={() => setConfirm({ title: 'Archive article', message: `Archive ${article.title}?`, confirmText: 'Archive', onConfirm: () => runAction(() => adminApi.archiveArticle(getId(article))) })}>Archive</button> : null}<button className="btn-danger px-3 py-1.5" onClick={() => setConfirm({ title: 'Delete article', message: `Delete ${article.title}?`, confirmText: 'Delete', danger: true, onConfirm: () => runAction(() => adminApi.deleteArticle(getId(article))) })}>Delete</button></div> }
  ];

  return (
    <div>
      <PageHeader title="Content Management" description="Create, edit, publish, archive, and delete guides, articles, and market content." actions={<><button className="btn-secondary" onClick={load}>Refresh</button><button className="btn-primary" onClick={openCreate}>Create article</button></>} />

      <div className="card mb-6 p-4">
        <div className="grid gap-4 md:grid-cols-5">
          <TextInput label="Search" value={filters.search} onChange={(value) => updateFilter('search', value)} placeholder="Title or tag" />
          <TextInput label="Category" value={filters.category} onChange={(value) => updateFilter('category', value)} placeholder="Buyer Guides" />
          <SelectInput label="Status" value={filters.status} onChange={(value) => updateFilter('status', value)} options={[{ label: 'All statuses', value: '' }, ...articleStatuses.map((status) => ({ label: toTitle(status), value: status }))]} />
          <SelectInput label="Page size" value={filters.limit} onChange={(value) => updateFilter('limit', value)} options={[10, 20, 50, 100].map((n) => ({ label: `${n} rows`, value: n }))} />
          <div className="flex items-end gap-2"><button className="btn-primary w-full" onClick={load}>Apply</button><button className="btn-secondary" onClick={() => setFilters(filterDefaults)}>Reset</button></div>
        </div>
      </div>

      {state.error ? <ErrorState error={state.error} onRetry={load} /> : <DataTable columns={columns} rows={state.rows} loading={state.loading} emptyTitle="No articles found" />}
      <Pagination meta={state.meta} page={filters.page} onPageChange={(page) => updateFilter('page', page)} />

      <Modal open={Boolean(editing)} title={editing?.mode === 'edit' ? 'Edit article' : 'Create article'} subtitle={editing?.article?.slug} onClose={() => setEditing(null)} size="max-w-6xl" footer={<div className="flex justify-end gap-2"><button className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn-primary" disabled={working} onClick={save}>{working ? 'Saving...' : 'Save article'}</button></div>}>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextInput label="Title" value={form.title} onChange={(value) => update('title', value)} required />
          <TextInput label="Category" value={form.category} onChange={(value) => update('category', value)} required />
          <TextInput label="Sub category" value={form.subCategory} onChange={(value) => update('subCategory', value)} />
          <TextInput label="Target audience" value={form.targetAudienceText} onChange={(value) => update('targetAudienceText', value)} hint="Comma-separated: buyer, tenant, owner, dealer, builder, investor, all" />
          <TextInput label="Featured image URL" value={form.featuredImage} onChange={(value) => update('featuredImage', value)} />
          <TextInput label="Tags" value={form.tagsText} onChange={(value) => update('tagsText', value)} hint="Comma-separated tags" />
          {editing?.mode === 'create' ? <SelectInput label="Initial status" value={form.status} onChange={(value) => update('status', value)} options={[{ label: 'Draft', value: 'draft' }, { label: 'Pending review', value: 'pending_review' }]} /> : null}
          <TextInput label="Meta title" value={form.metaTitle} onChange={(value) => update('metaTitle', value)} />
          <div className="lg:col-span-2"><TextArea label="Excerpt" value={form.excerpt} onChange={(value) => update('excerpt', value)} rows={3} /></div>
          <div className="lg:col-span-2"><TextArea label="Content HTML" value={form.content} onChange={(value) => update('content', value)} rows={12} required /></div>
          <TextArea label="Meta description" value={form.metaDescription} onChange={(value) => update('metaDescription', value)} />
          <TextArea label="Meta keywords" value={form.metaKeywordsText} onChange={(value) => update('metaKeywordsText', value)} hint="Comma-separated keywords" />
        </div>
      </Modal>

      <ConfirmDialog open={Boolean(confirm)} {...confirm} loading={working} onCancel={() => setConfirm(null)} />
    </div>
  );
}
