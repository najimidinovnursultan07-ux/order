import { APP_CONFIG, getTableLabel } from '../config';
import { useTable } from '../context/TableContext';

export default function Header() {
  const { tableNumber, isTableSelected } = useTable();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-apple-border">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-apple-text tracking-tight">
              {APP_CONFIG.cafeName}
            </h1>
            <p className="text-sm text-apple-muted mt-0.5">Цифровое меню</p>
          </div>
          {isTableSelected && (
            <div className="flex items-center gap-2 bg-apple-bg rounded-full px-4 py-2">
              <span className="text-lg">📍</span>
              <span className="text-sm font-medium text-apple-text">
                {getTableLabel(tableNumber)}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
