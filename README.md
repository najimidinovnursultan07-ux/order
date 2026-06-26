# QR-Menu & Order

PWA-приложение цифрового меню и заказов для кафе и кофеен.

## Стек

- **Backend:** Django 5 + Django REST Framework
- **Frontend:** React 18 + Vite + Tailwind CSS
- **PWA:** vite-plugin-pwa (Workbox) + IndexedDB для оффлайн-заказов

## Быстрый старт

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py create_admin
python manage.py runserver
```

API: `http://127.0.0.1:8000/api/`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Приложение: `http://localhost:5174/?table=5`

Админ-панель: `http://localhost:5174/admin`

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/categories/` | Список категорий |
| GET | `/api/products/` | Список товаров (`?category=1&available=true`) |
| POST | `/api/products/` | Создать товар (multipart) |
| PATCH | `/api/products/:id/` | Обновить товар |
| DELETE | `/api/products/:id/` | Удалить товар |
| GET | `/api/orders/` | Список заказов |
| POST | `/api/orders/` | Создать заказ |
| PATCH | `/api/orders/:id/status/` | Сменить статус |

### Пример создания заказа

```json
{
  "table_number": "5",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 4, "quantity": 1 }
  ]
}
```

## Конфигурация

Настройки фронтенда в `frontend/src/config.js`:

- `cafeName` — название кафе
- `whatsappNumber` — номер WhatsApp администратора (без +)
- `currency` — валюта (по умолчанию «сом»)

## PWA и оффлайн

- Service Worker кэширует статику и GET-запросы меню (NetworkFirst)
- Меню сохраняется в IndexedDB при успешной загрузке
- Заказы без сети сохраняются в IndexedDB и синхронизируются при восстановлении связи
- `manifest.json` с `display: standalone`

## PostgreSQL (опционально)

```bash
set POSTGRES_DB=qr_menu
set POSTGRES_USER=postgres
set POSTGRES_PASSWORD=your_password
set POSTGRES_HOST=localhost
python manage.py migrate
```

Без переменных окружения используется SQLite.

## Деплой (Render)

В настройках Web Service:

| Поле | Значение |
|------|----------|
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt && python manage.py collectstatic --noinput` |
| **Start Command** | `bash start.sh` |

Или вручную:

**Build Command** (без `migrate` — на этапе сборки БД часто недоступна):

```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput
```

**Start Command** (миграции + данные + запуск сервера):

```bash
python manage.py migrate --noinput && python manage.py create_admin && python manage.py seed_demo && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

**PostgreSQL на Render:** создайте базу и привяжите к Web Service — Render сам добавит переменную `DATABASE_URL`. Дополнительные `POSTGRES_*` не нужны.

**Environment (рекомендуется):**

- `DJANGO_DEBUG=False`
- `DJANGO_SECRET_KEY` — случайная длинная строка

**Миграции в Git** (`backend/menu/migrations/`): `0001`–`0003` — коммитьте в репозиторий, не генерируйте на Render.

> `seed_demo` идемпотентна: при повторном деплое не дублирует категории и товары.

Суперпользователь Django Admin создаётся автоматически (если ещё нет):

- **Логин:** `admin`
- **Пароль:** `admin123`

## Структура проекта

```
├── backend/
│   ├── config/          # Django settings
│   └── menu/            # Models, API, seed
└── frontend/
    └── src/
        ├── api/         # Axios + offline store
        ├── components/  # UI компоненты
        ├── context/     # React Context
        └── views/       # Страницы (меню, админка)
```
