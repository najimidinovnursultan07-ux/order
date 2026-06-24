/**
 * Нормализует ответ DRF (массив или { results: [...] }) в массив.
 * При ошибочном ответе возвращает [] — без падения .map().
 */
export function normalizeListResponse(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/**
 * Собирает URL API без двойных слэшей и с обязательным суффиксом /api.
 */
export function resolveApiBaseUrl() {
  const raw =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE ||
    '/api';

  let url = String(raw).trim().replace(/\/+$/, '');

  if (url.startsWith('http') && !url.endsWith('/api')) {
    url = `${url}/api`;
  }

  return url;
}
