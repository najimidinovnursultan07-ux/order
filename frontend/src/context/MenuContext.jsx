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
      setCategories(cats);
      setProducts(prods);
      await cacheMenuData(cats, prods);
    } catch (err) {
      const cached = await getCachedMenuData();
      if (cached.categories && cached.products) {
        setCategories(cached.categories);
        setProducts(cached.products);
        setError('Оффлайн режим — показано сохранённое меню');
      } else {
        const hint = err?.message?.includes('Network')
          ? 'Сервер недоступен. Запустите Django: python manage.py runserver'
          : 'Не удалось загрузить меню. Проверьте, что бэкенд запущен на :8000';
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
