export default function CategoryTabs({ categories, activeId, onSelect }) {
  if (!Array.isArray(categories) || !categories.length) return null;

  return (
    <div className="sticky top-[73px] z-20 bg-apple-bg/95 backdrop-blur-sm py-3">
      <div className="flex gap-2 overflow-x-auto px-4 md:px-6 max-w-6xl mx-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
            activeId === null
              ? 'bg-apple-text text-white shadow-card'
              : 'bg-white text-apple-text border border-apple-border'
          }`}
        >
          <span>🍽️</span>
          <span>Все</span>
        </button>
        {Array.isArray(categories)
          ? categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeId === cat.id
                ? 'bg-apple-text text-white shadow-card'
                : 'bg-white text-apple-text border border-apple-border'
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))
          : null}
      </div>
    </div>
  );
}
