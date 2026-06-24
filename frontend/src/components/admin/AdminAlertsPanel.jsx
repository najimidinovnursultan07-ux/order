import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Receipt, X } from 'lucide-react';
import { fetchAlerts, markAlertRead } from '../../api';
import { APP_CONFIG } from '../../config';
import { playNotificationSound, primeNotificationSound } from '../../utils/notificationSound';

const ALERT_ICONS = {
  waiter: Bell,
  bill: Receipt,
};

export default function AdminAlertsPanel() {
  const [alerts, setAlerts] = useState([]);
  const knownIdsRef = useRef(new Set());

  const load = useCallback(async () => {
    try {
      const data = await fetchAlerts({ unread: 'true' });
      const unread = data.filter((a) => !a.is_read);

      unread.forEach((alert) => {
        if (!knownIdsRef.current.has(alert.id)) {
          knownIdsRef.current.add(alert.id);
          playNotificationSound();
        }
      });

      setAlerts(unread);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    primeNotificationSound();
    load();
    const interval = setInterval(load, APP_CONFIG.pollIntervalMs);
    return () => clearInterval(interval);
  }, [load]);

  const handleDismiss = async (alertId) => {
    try {
      await markAlertRead(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }
  };

  if (!alerts.length) return null;

  return (
    <div className="mb-6 space-y-2">
      {alerts.map((alert) => {
        const Icon = ALERT_ICONS[alert.alert_type] || Bell;
        const isWaiter = alert.alert_type === 'waiter';
        return (
          <div
            key={alert.id}
            className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm animate-slide-up ${
              isWaiter
                ? 'bg-blue-50 border-blue-200'
                : 'bg-amber-50 border-amber-200'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                isWaiter ? 'bg-blue-100' : 'bg-amber-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${isWaiter ? 'text-blue-600' : 'text-amber-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm">
                {alert.type_display || (isWaiter ? 'Вызов официанта' : 'Просьба счёт')}
              </p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                Столик {alert.table_number}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleDismiss(alert.id)}
              className="p-2 rounded-xl hover:bg-white/60 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
