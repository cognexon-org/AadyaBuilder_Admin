export const unwrapList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.data?.docs)) return response.data.docs;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.docs)) return response.docs;
  if (Array.isArray(response?.projects)) return response.projects;
  if (Array.isArray(response?.builders)) return response.builders;
  if (Array.isArray(response?.cities)) return response.cities;
  if (Array.isArray(response?.localities)) return response.localities;
  if (Array.isArray(response?.feedback)) return response.feedback;
  if (Array.isArray(response?.shorts)) return response.shorts;
  if (Array.isArray(response?.plans)) return response.plans;
  if (Array.isArray(response?.orders)) return response.orders;
  return [];
};

export const unwrapMeta = (response) => response?.meta || response?.pagination || response?.data?.meta || response?.data?.pagination || null;

export const compactObject = (object) => Object.fromEntries(
  Object.entries(object || {}).filter(([, value]) => value !== undefined && value !== null && value !== '')
);

export const parseCsv = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);

export const parseNumber = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
};
