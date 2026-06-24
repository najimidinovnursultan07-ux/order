import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  LayoutDashboard,
  QrCode,
  UtensilsCrossed,
} from 'lucide-react';
import { APP_CONFIG } from '../config';
import AdminAlertsPanel from '../components/admin/AdminAlertsPanel';
import AdminMenuTab from './admin/AdminMenuTab';
import AdminOrdersTab from './admin/AdminOrdersTab';
import AdminQrTab from './admin/AdminQrTab';

const NAV_ITEMS = [
  { id: 'orders', label: 'Заказы', icon: ClipboardList },
  { id: 'menu', label: 'Меню', icon: UtensilsCrossed },
  { id: 'qr', label: 'QR-коды', icon: QrCode },
];

const PAGE_TITLES = {
  orders: 'Активные заказы',
  menu: 'Управление меню',
  qr: 'Генератор QR-кодов',
};

export default function AdminView() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-wide">QR-Menu</h1>
              <p className="text-xs text-slate-400">Панель управления</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white text-slate-900'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться в меню
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="font-semibold text-slate-900">Админ-панель</h1>
            <Link to="/" className="text-sm text-blue-600 font-medium">
              ← Меню
            </Link>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold ${
                  activeTab === item.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </header>

        <header className="hidden md:flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {PAGE_TITLES[activeTab]}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{APP_CONFIG.cafeName}</p>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {activeTab === 'orders' && <AdminAlertsPanel />}
          {activeTab === 'orders' && <AdminOrdersTab />}
          {activeTab === 'menu' && <AdminMenuTab />}
          {activeTab === 'qr' && <AdminQrTab />}
        </main>
      </div>
    </div>
  );
}
