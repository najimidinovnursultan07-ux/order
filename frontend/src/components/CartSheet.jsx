import { useState } from 'react';
import { createOrder } from '../api';
import { formatOrderMessage, formatPrice } from '../config';
import { useCart } from '../context/CartContext';
import { useOrderStatus } from '../context/OrderStatusContext';
import { useTable } from '../context/TableContext';
import { sendTelegramMessage } from '../utils/telegram';
import TableSelector from './TableSelector';

function SuccessAlert({ onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Закрыть уведомление"
      />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h3 className="text-lg font-semibold text-apple-text mb-2">Заказ отправлен!</h3>
        <p className="text-sm text-apple-muted leading-relaxed">
          Заказ успешно отправлен! Следите за статусом на экране меню.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-2xl bg-apple-accent text-white font-semibold text-sm hover:bg-apple-accentHover transition-colors"
        >
          Отлично
        </button>
      </div>
    </div>
  );
}

export default function CartSheet() {
  const {
    items,
    isOpen,
    total,
    itemCount,
    updateQuantity,
    removeItem,
    clearCart,
    closeCart,
    openCart,
  } = useCart();

  const { tableNumber, isTableSelected } = useTable();
  const { trackOrder } = useOrderStatus();

  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  const canSubmit = items.length > 0 && isTableSelected && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setOrderError(null);

    const orderText = formatOrderMessage(tableNumber, items, total);

    const payload = {
      table_number: String(tableNumber),
      customer_phone: customerPhone.trim(),
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    };

    try {
      const result = await createOrder(payload);
      if (result.offline) {
        throw new Error('Нет связи с сервером. Попробуйте позже.');
      }
      if (result.data?.id) {
        trackOrder(result.data.id);
      }

      try {
        await sendTelegramMessage(orderText);
      } catch {
        /* Telegram не блокирует сохранение заказа на бэкенде */
      }

      clearCart();
      closeCart();
      setCustomerPhone('');
      setShowSuccessAlert(true);
    } catch (err) {
      const message =
        err?.response?.data
          ? JSON.stringify(err.response.data)
          : err?.message || 'Не удалось отправить заказ. Убедитесь, что бэкенд запущен.';
      setOrderError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!itemCount && !isOpen && !showSuccessAlert) return null;

  return (
    <>
      {showSuccessAlert && (
        <SuccessAlert onClose={() => setShowSuccessAlert(false)} />
      )}

      {!isOpen && itemCount > 0 && (
        <button
          type="button"
          onClick={openCart}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-apple-text text-white px-6 py-3.5 rounded-full shadow-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-sm font-semibold">
            {itemCount}
          </span>
          <span className="font-medium">Корзина · {formatPrice(total)}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={closeCart}
            aria-label="Закрыть корзину"
          />
          <div className="relative bg-white rounded-t-3xl shadow-sheet animate-slide-up max-h-[85vh] flex flex-col">
            <div className="w-10 h-1 bg-apple-border rounded-full mx-auto mt-3 mb-2" />

            <div className="px-5 py-3 border-b border-apple-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-apple-text">Корзина</h2>
              <button
                type="button"
                onClick={closeCart}
                className="text-apple-muted text-sm font-medium"
              >
                Закрыть
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {items.length === 0 ? (
                <p className="text-center text-apple-muted py-8">Корзина пуста</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.product.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-apple-text text-sm truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-apple-muted">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-full bg-apple-bg text-apple-text flex items-center justify-center text-lg"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-full bg-apple-bg text-apple-text flex items-center justify-center text-lg"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-500 text-xs ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="px-5 py-4 border-t border-apple-border bg-white pb-safe">
              <TableSelector />

              <div className="mb-4">
                <label htmlFor="customer-phone" className="block text-sm font-medium text-apple-text mb-2">
                  Телефон для уведомлений (необязательно)
                </label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="+996 700 123 456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-apple-bg text-sm outline-none focus:ring-2 focus:ring-apple-accent"
                />
              </div>

              {orderError && (
                <div className="mb-3 p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">
                  {orderError}
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-apple-muted">Итого</span>
                <span className="text-xl font-bold text-apple-text">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full py-4 rounded-2xl bg-apple-accent text-white font-semibold text-[17px] hover:bg-apple-accentHover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Отправка...' : 'Оформить заказ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
