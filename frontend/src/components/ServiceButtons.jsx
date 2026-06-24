import { useState } from 'react';
import { Bell, Receipt } from 'lucide-react';
import { createAlert } from '../api';
import { getTableLabel } from '../config';
import { useTable } from '../context/TableContext';
import { formatServiceAlertMessage, sendTelegramMessage } from '../utils/telegram';
import TableInputModal from './TableInputModal';

const MODAL_COPY = {
  waiter: {
    title: 'Номер столика',
    description:
      'Пожалуйста, введите номер вашего столика, чтобы вызвать официанта.',
  },
  bill: {
    title: 'Номер столика',
    description:
      'Пожалуйста, введите номер вашего столика, чтобы запросить счёт.',
  },
};

export default function ServiceButtons() {
  const { tableNumber, isTableSelected, setTableNumber } = useTable();
  const [loading, setLoading] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [pendingType, setPendingType] = useState(null);

  const executeRequest = async (alertType, table) => {
    setLoading(alertType);
    setFeedback(null);
    const tableLabel = getTableLabel(table);

    try {
      await createAlert({
        alert_type: alertType,
        table_number: tableLabel,
      });

      try {
        await sendTelegramMessage(formatServiceAlertMessage(alertType, tableLabel));
      } catch {
        /* Telegram optional */
      }

      setFeedback({
        type: 'success',
        text:
          alertType === 'waiter'
            ? 'Официант уведомлён!'
            : 'Запрос на счёт отправлен!',
      });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({
        type: 'error',
        text: 'Не удалось отправить. Проверьте связь с сервером.',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleClick = (alertType) => {
    if (isTableSelected) {
      executeRequest(alertType, tableNumber);
      return;
    }
    setPendingType(alertType);
  };

  const handleModalSubmit = (value) => {
    const alertType = pendingType;
    setPendingType(null);
    setTableNumber(value);
    if (alertType) {
      executeRequest(alertType, value);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            disabled={!!loading}
            onClick={() => handleClick('waiter')}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-white border border-apple-border shadow-sm hover:shadow-md hover:border-apple-accent/30 transition-all text-sm font-semibold text-apple-text disabled:opacity-50"
          >
            <Bell
              className={`w-5 h-5 text-apple-accent ${loading === 'waiter' ? 'animate-pulse' : ''}`}
            />
            {loading === 'waiter' ? 'Отправка...' : 'Вызов официанта'}
          </button>
          <button
            type="button"
            disabled={!!loading}
            onClick={() => handleClick('bill')}
            className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-white border border-apple-border shadow-sm hover:shadow-md hover:border-amber-400/40 transition-all text-sm font-semibold text-apple-text disabled:opacity-50"
          >
            <Receipt
              className={`w-5 h-5 text-amber-600 ${loading === 'bill' ? 'animate-pulse' : ''}`}
            />
            {loading === 'bill' ? 'Отправка...' : 'Принести счёт'}
          </button>
        </div>
        {feedback && (
          <p
            className={`text-center text-xs mt-2 font-medium ${
              feedback.type === 'success' ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>

      <TableInputModal
        open={Boolean(pendingType)}
        onClose={() => setPendingType(null)}
        onSubmit={handleModalSubmit}
        initialValue=""
        title={pendingType ? MODAL_COPY[pendingType]?.title : undefined}
        description={pendingType ? MODAL_COPY[pendingType]?.description : undefined}
      />
    </>
  );
}
