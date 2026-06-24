export default function OfflineBanner({ isOffline, message }) {
  if (!isOffline && !message) return null;

  return (
    <div
      className={`text-center text-xs py-2 px-4 ${
        isOffline ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
      }`}
    >
      {isOffline ? '📡 Оффлайн режим — меню из кэша' : message}
    </div>
  );
}
