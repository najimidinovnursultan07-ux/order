import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function TableInputModal({
  open,
  onClose,
  onSubmit,
  initialValue = '',
  title = 'Укажите номер столика',
  description = 'Пожалуйста, введите номер вашего столика, чтобы вызвать официанта.',
}) {
  const [input, setInput] = useState(initialValue);

  useEffect(() => {
    if (open) setInput(initialValue);
  }, [open, initialValue]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-slide-up">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-apple-bg transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4 text-apple-muted" />
        </button>

        <div className="text-center mb-5 pt-2">
          <span className="text-3xl" aria-hidden="true">
            🪑
          </span>
          <h3 className="text-lg font-semibold text-apple-text mt-3">{title}</h3>
          <p className="text-sm text-apple-muted mt-2 leading-relaxed">{description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Например: 5"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
            className="w-full px-4 py-3.5 rounded-2xl bg-apple-bg text-center text-lg font-semibold text-apple-text outline-none focus:ring-2 focus:ring-apple-accent"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full py-3.5 rounded-2xl bg-apple-accent text-white font-semibold text-sm hover:bg-apple-accentHover transition-colors disabled:opacity-50"
          >
            Подтвердить
          </button>
        </form>
      </div>
    </div>
  );
}
