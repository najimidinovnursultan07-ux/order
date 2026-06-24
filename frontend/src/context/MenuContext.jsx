import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCategories, fetchProducts, syncPendingOrders } from '../api';
import { cacheMenuData, getCachedMenuData } from '../api/offlineStore';

const MenuContext = createContext(null);

export function MenuProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [cats, prods] = await Promise.all([
        fetchCategories(),
        fetchProducts({ available: 'true' }),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(prods) ? prods : []);
      await cacheMenuData(
        Array.isArray(cats) ? cats : [],
        Array.isArray(prods) ? prods : [],
      );
    } catch (err) {
      console.error('Не удалось загрузить меню:', err);
      const cached = await getCachedMenuData();
      const cachedCats = Array.isArray(cached.categories) ? cached.categories : [];
      const cachedProds = Array.isArray(cached.products) ? cached.products : [];
      if (cachedCats.length || cachedProds.length) {
        setCategories(cachedCats);
        setProducts(cachedProds);
        setError('Оффлайн режим — показано сохранённое меню');
      } else {
        const status = err?.response?.status;
        const hint =
          status === 404
            ? 'API не найден. Проверьте VITE_API_URL на Vercel.'
            : err?.code === 'ERR_NETWORK' || err?.message?.includes('Network')
              ? 'Сервер недоступен. Проверьте, что Render-бэкенд запущен.'
              : `Не удалось загрузить меню${status ? ` (HTTP ${status})` : ''}.`;
        setError(hint);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      await syncPendingOrders();
      loadMenu();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadMenu]);

  const value = useMemo(
    () => ({
      categories,
      products,
      loading,
      error,
      isOffline,
      reload: loadMenu,
    }),
    [categories, products, loading, error, isOffline, loadMenu],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenu must be used within MenuProvider');
  return ctx;
}
