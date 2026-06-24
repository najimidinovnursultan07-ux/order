import { Plus } from 'lucide-react';
import { formatPrice } from '../config';

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect fill="#f5f5f7" width="200" height="200"/>
      <text x="100" y="110" text-anchor="middle" font-size="48">🍽️</text>
    </svg>`,
  );

export default function ProductCard({ product, onAdd }) {
  const imageSrc = product.image_url || product.image || PLACEHOLDER;

  return (
    <article className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-row md:flex-col h-full">
      <div className="flex-shrink-0 p-3 md:p-0">
        <img
          src={imageSrc}
          alt={product.name}
          className="w-24 h-24 md:w-full md:h-40 object-cover rounded-xl md:rounded-none"
          loading="lazy"
          onError={(e) => {
            e.target.src = PLACEHOLDER;
          }}
        />
      </div>
      <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {product.is_bestseller && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                🔥 Хит
              </span>
            )}
            {product.is_spicy && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">
                🌶️ Острое
              </span>
            )}
          </div>
          <h3 className="font-semibold text-apple-text text-[15px] md:text-base leading-tight line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs md:text-sm text-apple-muted mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[15px] md:text-base font-semibold text-apple-text">
            {formatPrice(product.price)}
          </span>
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-apple-accent text-white flex items-center justify-center hover:bg-apple-accentHover active:scale-95 transition-all shadow-sm"
            aria-label={`Добавить ${product.name}`}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </article>
  );
}
