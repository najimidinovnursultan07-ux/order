const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID_HERE';

export async function sendTelegramMessage(text) {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    },
  );

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(data.description || 'Не удалось отправить в Telegram');
  }
  return data;
}

export function formatServiceAlertMessage(type, tableLabel) {
  if (type === 'waiter') {
    return `🔔 *ВЫЗОВ ОФИЦИАНТА*\n📍 *Столик:* ${tableLabel}\n\nГость просит подойти официанта.`;
  }
  return `💳 *ПРОСЬБА ПРИНЕСТИ СЧЁТ*\n📍 *Столик:* ${tableLabel}\n\nГость готов оплатить.`;
}
