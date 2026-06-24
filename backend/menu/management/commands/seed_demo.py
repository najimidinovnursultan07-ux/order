from decimal import Decimal

from django.core.management.base import BaseCommand

from menu.models import Category, Product


class Command(BaseCommand):
    help = 'Заполняет базу демо-данными для QR-меню'

    def handle(self, *args, **options):
        Category.objects.all().delete()
        Product.objects.all().delete()

        categories = [
            {'name': 'Пицца', 'icon': '🍕', 'sort_order': 1},
            {'name': 'Кофе', 'icon': '☕', 'sort_order': 2},
            {'name': 'Десерты', 'icon': '🍰', 'sort_order': 3},
            {'name': 'Напитки', 'icon': '🥤', 'sort_order': 4},
        ]

        cat_map = {}
        for cat_data in categories:
            cat = Category.objects.create(**cat_data)
            cat_map[cat.name] = cat
            self.stdout.write(f'  + Категория: {cat.name}')

        products = [
            ('Пицца', 'Пепперони', 'Классическая пицца с пепперони и моцареллой', Decimal('450')),
            ('Пицца', 'Маргарита', 'Томаты, моцарелла, свежий базилик', Decimal('380')),
            ('Пицца', '4 Сыра', 'Горгонзола, пармезан, моцарелла, чеддер', Decimal('520')),
            ('Кофе', 'Капучино', 'Эспрессо с молочной пенкой', Decimal('180')),
            ('Кофе', 'Латте', 'Нежный кофе с молоком', Decimal('200')),
            ('Кофе', 'Американо', 'Классический черный кофе', Decimal('150')),
            ('Кофе', 'Раф', 'Кофе со сливками и ванилью', Decimal('220')),
            ('Десерты', 'Чизкейк', 'Нью-Йоркский чизкейк', Decimal('280')),
            ('Десерты', 'Тирамису', 'Итальянский десерт с маскарпоне', Decimal('320')),
            ('Десерты', 'Медовик', 'Классический медовый торт', Decimal('250')),
            ('Напитки', 'Лимонад', 'Домашний лимонад с мятой', Decimal('160')),
            ('Напитки', 'Смузи', 'Ягодный смузи', Decimal('240')),
        ]

        for cat_name, name, desc, price in products:
            Product.objects.create(
                category=cat_map[cat_name],
                name=name,
                description=desc,
                price=price,
                is_available=True,
            )
            self.stdout.write(f'  + Товар: {name}')

        self.stdout.write(self.style.SUCCESS('Демо-данные успешно загружены!'))
