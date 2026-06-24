import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import ServiceButtons from '../components/ServiceButtons';
import CartSheet from '../components/CartSheet';
import CategoryTabs from '../components/CategoryTabs';
import Header from '../components/Header';
import OfflineBanner from '../components/OfflineBanner';
import OrderStatusBanner from '../components/OrderStatusBanner';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { OrderStatusProvider } from '../context/OrderStatusContext';
import { useMenu } from '../context/MenuContext';

export default function MenuView() {
  const { categories, products, loading, error, isOffline } = useMenu();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState(null);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <OrderStatusProvider>
      <div className="min-h-screen bg-apple-bg pb-28">
      <Header />
      <OrderStatusBanner />
      <OfflineBanner isOffline={isOffline} message={error} />

      <CategoryTabs
        categories={categories}
        activeId={activeCategory}
        onSelect={setActiveCategory}
      />

      <ServiceButtons />

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 py-4">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-apple-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-apple-muted">Загрузка меню...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="col-span-full text-center text-apple-muted py-20">Меню пока пусто</p>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addItem} />
          ))
        )}
      </main>

      <CartSheet />

      <Link
        to="/admin"
        className="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur border border-apple-border flex items-center justify-center shadow-card opacity-40 hover:opacity-100 transition-opacity"
        title="Админ-панель"
      >
        <Settings className="w-4 h-4 text-apple-muted" />
      </Link>
    </div>
    </OrderStatusProvider>
  );
}
