import { resolveApiBaseUrl } from './api/utils';

export const APP_CONFIG = {
  cafeName: 'Coffee House',
  currency: 'сом',
  whatsappNumber: '996700123456',
  /** Публичный URL для QR-кодов (путь /table/N — без ?table=, иначе Xiaomi видит «Т») */
  menuPublicUrl: 'https://order-brown-eight.vercel.app',
  frontendUrl:
    import.meta.env.VITE_FRONTEND_URL || 'https://order-brown-eight.vercel.app',
  apiBaseUrl: resolveApiBaseUrl(),
  pollIntervalMs: 5000,
};

/** Очищает строку URL от пробелов и скрытых символов для QR-сканеров */
export function cleanQrUrl(url) {
  return String(url ?? '').replace(/\s+/g, '').trim();
}

/** Ссылка для QR: https://order-brown-eight.vercel.app/table/5 (без ? — сканеры Xiaomi/Redmi) */
export function buildTableQrUrl(tableNumber) {
  const table = String(tableNumber ?? '').replace(/\s+/g, '').trim();
  const rawUrl = `https://order-brown-eight.vercel.app/table/${table}`;
  return cleanQrUrl(rawUrl);
}

/** Извлекает номер стола из пути /table/номер */
export function parseTableFromPath(pathname = window.location.pathname) {
  const pathParts = pathname.split('/').filter(Boolean);
  const tableIndex = pathParts.indexOf('table');
  if (tableIndex !== -1 && pathParts[tableIndex + 1]) {
    try {
      return decodeURIComponent(pathParts[tableIndex + 1]).trim();
    } catch {
      return pathParts[tableIndex + 1].trim();
    }
  }
  return null;
}

/** Извлекает номер стола из URL (путь /table/N или legacy ?table=N) */
export function parseTableFromLocation(href = window.location.href) {
  try {
    const url = new URL(href);
    const fromPath = parseTableFromPath(url.pathname);
    if (fromPath) return fromPath;

    const fromSearch = url.searchParams.get('table');
    if (fromSearch?.trim()) return fromSearch.trim();
  } catch {
    /* ignore malformed href */
  }

  const match = String(href).match(/[?&]table=([^&#]+)/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]).trim();
  } catch {
    return match[1].trim();
  }
}

export const TABLE_TAKEAWAY = 'takeaway';
export const TABLE_TAKEAWAY_LABEL = 'На вынос (Самовывоз)';

export const ORDER_STATUS = {
  new: { label: 'Новый', color: 'bg-blue-100 text-blue-700' },
  preparing: { label: 'Готовится', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Завершен', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Отменен', color: 'bg-red-100 text-red-700' },
};

export const CLIENT_STATUS_MESSAGES = {
  new: { text: '⏳ Заказ отправлен. Ожидает подтверждения...', color: 'bg-blue-50 border-blue-200 text-blue-800' },
  preparing: { text: '🧑‍🍳 Заказ принят. Повар уже готовит ваше блюдо!', color: 'bg-amber-50 border-amber-200 text-amber-900' },
  completed: { text: '✅ Заказ завершен! Приятного аппетита!', color: 'bg-green-50 border-green-200 text-green-800' },
  cancelled: { text: '❌ Заказ отменён', color: 'bg-red-50 border-red-200 text-red-800' },
};

export function formatPrice(price) {
  const num = Number(price);
  return `${num.toLocaleString('ru-RU')} ${APP_CONFIG.currency}`;
}

export function getTableLabel(tableNumber) {
  if (!tableNumber) return 'Не указан';
  if (tableNumber === TABLE_TAKEAWAY) return TABLE_TAKEAWAY_LABEL;
  return `№${tableNumber}`;
}

export function formatOrderMessage(tableNumber, cartItems, total) {
  const tableLabel = getTableLabel(tableNumber);
  const itemLines = cartItems.map((item) => {
    const name = item.product?.name ?? item.name;
    const price = Number(item.product?.price ?? item.price ?? 0);
    const lineTotal = price * item.quantity;
    return `• ${name} x${item.quantity} — ${lineTotal.toLocaleString('ru-RU')} ${APP_CONFIG.currency}`;
  });

  return [
    '🔔 *НОВЫЙ ЗАКАЗ!*',
    `📍 *Столик:* ${tableLabel}`,
    '🍕 *Состав заказа:*',
    ...itemLines,
    `💵 *Итого:* ${Number(total).toLocaleString('ru-RU')} ${APP_CONFIG.currency}`,
  ].join('\n');
}

export function getWhatsAppUrl(orderText) {
  return `https://api.whatsapp.com/send?phone=${APP_CONFIG.whatsappNumber}&text=${encodeURIComponent(orderText)}`;
}

export function getClientNotifyWhatsAppUrl(phone, order, status = 'preparing') {
  const cleanPhone = phone.replace(/\D/g, '');
  const messages = {
    preparing: `Ваш заказ №${order.id} принят и готовится! Столик: ${order.table_number}`,
    completed: `Ваш заказ №${order.id} готов! Приятного аппетита! Столик: ${order.table_number}`,
  };
  const text = messages[status] || messages.preparing;
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}
