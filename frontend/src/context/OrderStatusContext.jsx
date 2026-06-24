import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { fetchOrder } from '../api';

const STORAGE_KEY = 'qr_active_order_id';
const POLL_INTERVAL_MS = 5000;
const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);

const OrderStatusContext = createContext(null);

export function OrderStatusProvider({ children }) {
  const [activeOrderId, setActiveOrderId] = useState(
    () => localStorage.getItem(STORAGE_KEY) || null,
  );
  const [order, setOrder] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentStatusRef = useRef(null);
  const trackedIdRef = useRef(null);
  const intervalRef = useRef(null);
  const inFlightRef = useRef(false);
  const dismissOrderRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const dismissOrder = useCallback(() => {
    stopPolling();
    inFlightRef.current = false;
    localStorage.removeItem(STORAGE_KEY);
    trackedIdRef.current = null;
    currentStatusRef.current = null;
    setActiveOrderId(null);
    setOrder(null);
    setShowConfetti(false);
  }, [stopPolling]);

  dismissOrderRef.current = dismissOrder;

  const trackOrder = useCallback((orderId) => {
    const id = String(orderId);
    localStorage.setItem(STORAGE_KEY, id);

    if (trackedIdRef.current !== id) {
      trackedIdRef.current = id;
      currentStatusRef.current = null;
      setOrder(null);
      setShowConfetti(false);
    }

    setActiveOrderId(id);
  }, []);

  useEffect(() => {
    if (!activeOrderId) {
      stopPolling();
      return undefined;
    }

    const orderId = activeOrderId;
    let cancelled = false;

    const checkStatus = async () => {
      if (cancelled || inFlightRef.current) return;

      inFlightRef.current = true;
      try {
        const data = await fetchOrder(orderId);
        if (cancelled) return;

        const prevStatus = currentStatusRef.current;

        if (data.status !== prevStatus) {
          if (
            prevStatus !== null &&
            prevStatus !== 'completed' &&
            data.status === 'completed'
          ) {
            setShowConfetti(true);
          }
          currentStatusRef.current = data.status;
          setOrder(data);
        }

        if (TERMINAL_STATUSES.has(data.status)) {
          stopPolling();
        }
      } catch (error) {
        if (cancelled) return;
        if (error?.response?.status === 404) {
          dismissOrderRef.current?.();
          return;
        }
        console.error('Ошибка при проверке статуса заказа:', error);
      } finally {
        inFlightRef.current = false;
      }
    };

    checkStatus();
    stopPolling();
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      stopPolling();
      inFlightRef.current = false;
    };
  }, [activeOrderId, stopPolling]);

  const value = useMemo(
    () => ({
      order,
      activeOrderId,
      showConfetti,
      trackOrder,
      dismissOrder,
      setShowConfetti,
    }),
    [order, activeOrderId, showConfetti, trackOrder, dismissOrder],
  );

  return (
    <OrderStatusContext.Provider value={value}>{children}</OrderStatusContext.Provider>
  );
}

export function useOrderStatus() {
  const ctx = useContext(OrderStatusContext);
  if (!ctx) throw new Error('useOrderStatus must be used within OrderStatusProvider');
  return ctx;
}
