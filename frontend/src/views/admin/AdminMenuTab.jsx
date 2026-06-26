import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  buildProductFormData,
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  formatValidationErrors,
  updateProduct,
} from '../../api';
import { formatPrice } from '../../config';

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="#f5f5f7" width="80" height="80"/><text x="40" y="50" text-anchor="middle" font-size="24">🍽️</text></svg>`,
  );

function ProductForm({ categories, onSave, onCancel, initial }) {
  const defaultCategoryId =
    initial?.category != null && initial.category !== ''
      ? Number(initial.category)
      : categories[0]?.id != null
        ? Number(categories[0].id)
        : '';

  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    price: initial?.price ?? '',
    category: defaultCategoryId,
    is_available: initial?.is_available ?? true,
    is_bestseller: initial?.is_bestseller ?? false,
    is_spicy: initial?.is_spicy ?? false,
  });
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const categoryId = Number(form.category);
  const hasValidCategory = Number.isInteger(categoryId) && categoryId > 0;
  const hasValidPrice = form.price !== '' && !Number.isNaN(Number(form.price)) && Number(form.price) >= 0;
  const canSubmit = hasValidCategory && hasValidPrice && form.name.trim().length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');

    if (!hasValidCategory) {
      setSaveError('Выберите категорию перед сохранением.');
      return;
    }

    if (!hasValidPrice) {
      setSaveError('Укажите корректную цену.');
      return;
    }

    setSaving(true);

    const fd = buildProductFormData({
      name: form.name,
      description: form.description,
      price: form.price,
      category: categoryId,
      is_available: form.is_available,
      is_bestseller: form.is_bestseller,
      is_spicy: form.is_spicy,
      image,
    });

    try {
      if (initial?.id) {
        await updateProduct(initial.id, fd);
      } else {
        await createProduct(fd);
      }
      onSave();
    } catch (error) {
      console.error('ПОЛНЫЙ ОТВЕТ ОШИБКИ БЭКЕНДА:', error.response?.data);
      const message = formatValidationErrors(error.response?.data);
      setSaveError(message);
      alert(`Ошибка сохранения:\n\n${message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-card space-y-4">
      <h3 className="font-semibold text-apple-text">
        {initial ? 'Редактировать блюдо' : 'Новое блюдо'}
      </h3>

      {saveError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 whitespace-pre-wrap">
          {saveError}
        </div>
      )}

      {!Array.isArray(categories) || categories.length === 0 ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          Нет категорий на сервере. Сначала добавьте категории через Django Admin или команду{' '}
          <code className="text-xs">seed_demo</code>.
        </p>
      ) : null}

      <input
        type="text"
        placeholder="Название"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
        className="w-full px-4 py-3 rounded-xl bg-apple-bg border-0 text-sm focus:ring-2 focus:ring-apple-accent outline-none"
      />

      <textarea
        placeholder="Описание"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        className="w-full px-4 py-3 rounded-xl bg-apple-bg border-0 text-sm focus:ring-2 focus:ring-apple-accent outline-none resize-none"
      />

      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Цена"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          min="0"
          step="0.01"
          className="flex-1 px-4 py-3 rounded-xl bg-apple-bg border-0 text-sm focus:ring-2 focus:ring-apple-accent outline-none"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: Number(e.target.value) })}
          required
          disabled={!categories.length}
          className="flex-1 px-4 py-3 rounded-xl bg-apple-bg border-0 text-sm focus:ring-2 focus:ring-apple-accent outline-none disabled:opacity-50"
        >
          {!hasValidCategory && (
            <option value="" disabled>
              Выберите категорию
            </option>
          )}
          {Array.isArray(categories)
            ? categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))
            : null}
        </select>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] ?? null)}
        className="text-sm text-apple-muted"
      />

      <label className="flex items-center gap-2 text-sm text-apple-text">
        <input
          type="checkbox"
          checked={form.is_available}
          onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
          className="rounded"
        />
        В наличии
      </label>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-apple-text">
          <input
            type="checkbox"
            checked={form.is_bestseller}
            onChange={(e) => setForm({ ...form, is_bestseller: e.target.checked })}
            className="rounded"
          />
          🔥 Хит продаж
        </label>
        <label className="flex items-center gap-2 text-sm text-apple-text">
          <input
            type="checkbox"
            checked={form.is_spicy}
            onChange={(e) => setForm({ ...form, is_spicy: e.target.checked })}
            className="rounded"
          />
          🌶️ Острое
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving || !canSubmit}
          className="flex-1 py-3 rounded-xl bg-apple-accent text-white font-medium text-sm disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 rounded-xl bg-apple-bg text-apple-text font-medium text-sm"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

export default function AdminMenuTab() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([fetchCategories(), fetchProducts()]);
      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch {
      alert('Не удалось загрузить меню');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleAvailable = async (product) => {
    const fd = buildProductFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      is_available: !product.is_available,
      is_bestseller: product.is_bestseller,
      is_spicy: product.is_spicy,
    });
    try {
      await updateProduct(product.id, fd);
      load();
    } catch (error) {
      console.error('ПОЛНЫЙ ОТВЕТ ОШИБКИ БЭКЕНДА:', error.response?.data);
      alert(`Ошибка обновления:\n\n${formatValidationErrors(error.response?.data)}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить блюдо?')) return;
    await deleteProduct(id);
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-apple-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showForm && !editing && (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full py-3.5 rounded-2xl bg-apple-accent text-white font-semibold text-sm"
        >
          + Добавить блюдо
        </button>
      )}

      {showForm && (
        <ProductForm
          categories={categories}
          onSave={() => {
            setShowForm(false);
            load();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editing && (
        <ProductForm
          categories={categories}
          initial={editing}
          onSave={() => {
            setEditing(null);
            load();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="space-y-3">
        {Array.isArray(products)
          ? products.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-2xl p-4 shadow-card flex gap-3 ${
              !product.is_available ? 'opacity-50' : ''
            }`}
          >
            <img
              src={product.image_url || PLACEHOLDER}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-semibold text-sm text-apple-text">{product.name}</h4>
                    {product.is_bestseller && <span className="text-xs">🔥</span>}
                    {product.is_spicy && <span className="text-xs">🌶️</span>}
                  </div>
                  <p className="text-xs text-apple-muted">{product.category_name}</p>
                </div>
                <span className="text-sm font-semibold text-apple-text whitespace-nowrap">
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditing(product)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-apple-bg text-apple-text font-medium"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAvailable(product)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    product.is_available
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-green-50 text-green-700'
                  }`}
                >
                  {product.is_available ? 'Нет в наличии' : 'Вернуть'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-medium"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))
          : null}
      </div>
    </div>
  );
}
