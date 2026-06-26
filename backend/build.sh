#!/usr/bin/env bash
# Render Build Command — только установка и статика (БД на этом этапе может быть недоступна)
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --noinput
