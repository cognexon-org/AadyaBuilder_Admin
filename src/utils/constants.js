export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const roles = ['buyer', 'owner', 'dealer', 'builder', 'admin'];
export const propertyStatuses = ['pending', 'active', 'sold', 'rented', 'inactive', 'rejected'];
export const leadStatuses = [
  'new',
  'viewed',
  'contacted',
  'negotiating',
  'site_visit_scheduled',
  'site_visit_done',
  'offer_made',
  'closed_won',
  'closed_lost',
  'rejected',
  'spam'
];
export const planTypes = ['dealer', 'builder', 'owner', 'featured_only'];
export const articleStatuses = ['draft', 'pending_review', 'published', 'archived'];
export const reportTypes = ['users', 'properties', 'leads', 'transactions'];
export const booleanOptions = [
  { label: 'All', value: '' },
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' }
];
