import { TABLE_TAKEAWAY, TABLE_TAKEAWAY_LABEL } from '../config';
import { useTable } from '../context/TableContext';

const TABLE_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1);

export default function TableSelector() {
  const { tableNumber, setTableNumber, isFromUrl, isTableSelected } = useTable();
  const showError = !isFromUrl && !isTableSelected;

  if (isFromUrl) {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-apple-bg px-4 py-3.5">
        <span className="text-base" aria-hidden="true">
          📍
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-apple-text">
            Ваш столик: №{tableNumber}
          </p>
          <p className="text-xs text-apple-muted mt-0.5">Определён автоматически из QR-кода</p>
        </div>
        <span className="text-apple-muted text-xs bg-white px-2 py-1 rounded-lg border border-apple-border">
          🔒
        </span>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <label
        htmlFor="table-select"
        className={`block text-sm font-medium mb-2 ${
          showError ? 'text-red-600' : 'text-apple-text'
        }`}
      >
        Выберите номер вашего столика:
      </label>
      <div className="relative">
        <select
          id="table-select"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className={`w-full px-4 py-3.5 pr-10 rounded-2xl bg-apple-bg text-sm font-medium text-apple-text appearance-none outline-none transition-all ${
            showError
              ? 'ring-2 ring-red-400 bg-red-50/50'
              : 'focus:ring-2 focus:ring-apple-accent'
          }`}
        >
          <option value="" disabled>
            — Выберите столик —
          </option>
          {TABLE_OPTIONS.map((n) => (
            <option key={n} value={String(n)}>
              Столик №{n}
            </option>
          ))}
          <option value={TABLE_TAKEAWAY}>{TABLE_TAKEAWAY_LABEL}</option>
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-apple-muted text-xs">
          ▼
        </span>
      </div>
      {showError && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
          <span aria-hidden="true">⚠️</span>
          Укажите столик, чтобы оформить заказ
        </p>
      )}
    </div>
  );
}
