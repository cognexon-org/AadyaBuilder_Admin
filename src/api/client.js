import { API_BASE_URL } from '../utils/constants';

const TOKEN_KEY = 'aadya_admin_access_token';
const REFRESH_TOKEN_KEY = 'aadya_admin_refresh_token';
const USER_KEY = 'aadya_admin_user';

export const tokenStore = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set token(value) {
    value ? localStorage.setItem(TOKEN_KEY, value) : localStorage.removeItem(TOKEN_KEY);
  },
  get refreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set refreshToken(value) {
    value ? localStorage.setItem(REFRESH_TOKEN_KEY, value) : localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  get user() {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },
  set user(value) {
    value ? localStorage.setItem(USER_KEY, JSON.stringify(value)) : localStorage.removeItem(USER_KEY);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

const buildQuery = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.append(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

const parseError = async (response) => {
  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  const message = payload?.error?.message || payload?.message || `Request failed with ${response.status}`;
  const error = new Error(message);
  error.status = response.status;
  error.payload = payload;
  throw error;
};

export async function apiRequest(path, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    headers = {},
    raw = false,
    skipAuth = false,
    retry = true
  } = options;

  const token = tokenStore.token;
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
    method,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
  });

  if (response.status === 401 && retry && tokenStore.refreshToken && !path.includes('/auth/refresh-token')) {
    try {
      const refreshed = await apiRequest('/auth/refresh-token', {
        method: 'POST',
        body: { refreshToken: tokenStore.refreshToken },
        skipAuth: true,
        retry: false
      });
      const accessToken = refreshed?.data?.accessToken;
      if (accessToken) {
        tokenStore.token = accessToken;
        return apiRequest(path, { ...options, retry: false });
      }
    } catch {
      tokenStore.clear();
    }
  }

  if (!response.ok) return parseError(response);
  if (raw) return response;

  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  get: (path, params, options) => apiRequest(path, { ...options, method: 'GET', params }),
  post: (path, body, options) => apiRequest(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' })
};
