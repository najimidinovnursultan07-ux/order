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

/** Axios: убрать Content-Type, чтобы браузер сам выставил boundary для FormData. */
export const MULTIPART_REQUEST_CONFIG = {
  transformRequest: [
    (data, headers) => {
      delete headers['Content-Type'];
      return data;
    },
  ],
};

/**
 * Собирает FormData для создания/обновления товара в формате DRF.
 */
export function buildProductFormData({
  name,
  description = '',
  price,
  category,
  is_available = true,
  is_bestseller = false,
  is_spicy = false,
  image = null,
}) {
  const categoryId = Number(category);
  const priceValue = Number(price);

  const fd = new FormData();
  fd.append('name', String(name).trim());
  fd.append('description', String(description ?? ''));
  fd.append('price', String(priceValue));
  fd.append('category', String(categoryId));
  fd.append('is_available', is_available ? 'true' : 'false');
  fd.append('is_bestseller', is_bestseller ? 'true' : 'false');
  fd.append('is_spicy', is_spicy ? 'true' : 'false');

  if (image instanceof File) {
    fd.append('image', image);
  }

  return fd;
}

/** Человекочитаемый текст ошибок валидации DRF (400). */
export function formatValidationErrors(data) {
  if (!data) return 'Неизвестная ошибка сервера';
  if (typeof data === 'string') return data;
  if (data.detail) {
    return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
  }

  return Object.entries(data)
    .map(([field, messages]) => {
      const text = Array.isArray(messages) ? messages.join(', ') : String(messages);
      return `${field}: ${text}`;
    })
    .join('\n');
}
