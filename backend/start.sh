#!/usr/bin/env bash
# Render Start Command — миграции и сидирование при старте контейнера (БД уже доступна)
set -o errexit

mkdir -p media/products

python manage.py migrate --noinput
python manage.py create_admin
python manage.py seed_demo

exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}"
