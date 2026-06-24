import { useMemo } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { CLIENT_STATUS_MESSAGES } from '../config';
import { useOrderStatus } from '../context/OrderStatusContext';

const CONFETTI_COLORS = ['#0071e3', '#34c759', '#ff9500', '#ff2d55', '#af52de'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 13) % 100}%`,
        delay: `${(i % 8) * 0.1}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + (i % 6),
      })),
    [],
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[70] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 rounded-sm"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function OrderStatusBanner() {
  const { order, showConfetti, dismissOrder, setShowConfetti } = useOrderStatus();

  if (!order) return null;

  const statusInfo = CLIENT_STATUS_MESSAGES[order.status] || CLIENT_STATUS_MESSAGES.new;
  const isFinished = order.status === 'completed' || order.status === 'cancelled';

  return (
    <>
      {showConfetti && order.status === 'completed' && <Confetti />}

      <div className="sticky top-[73px] z-20 px-4 py-3 max-w-6xl mx-auto">
        <div
          className={`relative flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-sm ${statusInfo.color}`}
        >
          {order.status === 'completed' ? (
            <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
          ) : (
            <span className="text-xl flex-shrink-0" aria-hidden="true">
              {order.status === 'preparing' ? '🧑‍🍳' : order.status === 'cancelled' ? '❌' : '⏳'}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug">{statusInfo.text}</p>
            <p className="text-xs opacity-70 mt-1">Заказ №{order.id}</p>
          </div>
          {isFinished && (
            <button
              type="button"
              onClick={() => {
                setShowConfetti(false);
                dismissOrder();
              }}
              className="p-1 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
