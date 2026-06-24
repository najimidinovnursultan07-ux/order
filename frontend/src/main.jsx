import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

registerSW({
  onNeedRefresh() {
    if (confirm('Доступно обновление. Перезагрузить?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('PWA готово к оффлайн работе');
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
