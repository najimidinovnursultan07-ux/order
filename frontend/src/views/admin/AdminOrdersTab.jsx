import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  MessageCircle,
  Phone,
  XCircle,
} from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '../../api';
import { APP_CONFIG, formatPrice, getClientNotifyWhatsAppUrl } from '../../config';
import { playNotificationSound, primeNotificationSound } from '../../utils/notificationSound';

const KANBAN_COLUMNS = [
  { key: 'new', title: 'Новые', icon: Clock, accent: 'border-t-blue-500' },
  { key: 'preparing', title: 'Готовятся', icon: ChefHat, accent: 'border-t-amber-500' },
  { key: 'completed', title: 'Завершены', icon: CheckCircle2, accent: 'border-t-green-500' },
];

function KanbanCard({ order, onStatusChange }) {
  const time = new Date(order.created_at).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleWhatsApp = (status) => {
    if (!order.customer_phone) return;
    window.open(getClientNotifyWhatsAppUrl(order.customer_phone, order, status), '_blank');
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden border-t-4 ${
      order.status === 'new' ? 'border-t-blue-500' : order.status === 'preparing' ? 'border-t-amber-500' : 'border-t-green-500'
    }`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              Столик {order.table_number}
            </p>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {time} · №{order.id}
            </p>
          </div>
          <p className="text-xl font-bold text-slate-900 whitespace-nowrap">
            {formatPrice(order.total_price)}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Состав заказа
          </p>
          <ul className="space-y-1.5">
            {order.items?.map((item) => (
              <li key={item.id} className="text-sm text-slate-700 flex justify-between gap-2">
                <span>
                  {item.quantity}× {item.product_name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {order.customer_phone && (
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
            <Phone className="w-3.5 h-3.5" />
            {order.customer_phone}
          </p>
        )}

        {order.status === 'new' && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onStatusChange(order.id, 'preparing', order)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors"
            >
              Принять заказ
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(order.id, 'cancelled', order)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Отменить
            </button>
          </div>
        )}

        {order.status === 'preparing' && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onStatusChange(order.id, 'completed', order)}
              className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
            >
              Завершить заказ
            </button>
            {order.customer_phone && (
              <button
                type="button"
                onClick={() => handleWhatsApp('preparing')}
                className="w-full py-2 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp: заказ принят
              </button>
            )}
          </div>
        )}

        {order.status === 'completed' && order.customer_phone && (
          <button
            type="button"
            onClick={() => handleWhatsApp('completed')}
            className="w-full py-2 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp: заказ готов
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const knownOrderIdsRef = useRef(new Set());
  const initializedRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchOrders();
      data.forEach((order) => {
        if (
          order.status === 'new' &&
          !knownOrderIdsRef.current.has(order.id)
        ) {
          if (initializedRef.current) {
            playNotificationSound();
          }
          knownOrderIdsRef.current.add(order.id);
        }
      });
      initializedRef.current = true;
      setOrders(data);
    } catch {
      /* keep previous data */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    primeNotificationSound();
    load();
    const interval = setInterval(load, APP_CONFIG.pollIntervalMs);
    return () => clearInterval(interval);
  }, [load]);

  const handleStatusChange = async (orderId, status, order) => {
    try {
      await updateOrderStatus(orderId, status);
      if (status === 'preparing' && order.customer_phone) {
        window.open(
          getClientNotifyWhatsAppUrl(order.customer_phone, order, 'preparing'),
          '_blank',
        );
      }
      if (status === 'completed' && order.customer_phone) {
        window.open(
          getClientNotifyWhatsAppUrl(order.customer_phone, order, 'completed'),
          '_blank',
        );
      }
      load();
    } catch {
      alert('Не удалось обновить статус');
    }
  };

  const columns = useMemo(() => {
    const grouped = { new: [], preparing: [], completed: [] };
    orders.forEach((o) => {
      if (o.status === 'cancelled') return;
      if (grouped[o.status]) grouped[o.status].push(o);
    });
    return grouped;
  }, [orders]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {KANBAN_COLUMNS.map((col) => {
          const Icon = col.icon;
          const items = columns[col.key] || [];
          return (
            <div key={col.key} className="flex flex-col min-h-[400px]">
              <div className={`flex items-center gap-2 mb-4 pb-3 border-b-2 ${col.accent}`}>
                <Icon className="w-5 h-5 text-slate-600" />
                <h3 className="font-semibold text-slate-800">{col.title}</h3>
                <span className="ml-auto text-xs font-bold bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <div className="space-y-4 flex-1">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8 bg-white/60 rounded-2xl border border-dashed border-slate-200">
                    Нет заказов
                  </p>
                ) : (
                  items.map((order) => (
                    <KanbanCard
                      key={order.id}
                      order={order}
                      onStatusChange={handleStatusChange}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-400 mt-8">
        Автообновление каждые {APP_CONFIG.pollIntervalMs / 1000} сек
      </p>
    </div>
  );
}
