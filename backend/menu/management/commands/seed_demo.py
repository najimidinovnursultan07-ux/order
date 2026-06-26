from decimal import Decimal

from django.core.management.base import BaseCommand

from menu.models import Category, Product

DEMO_CATEGORIES = [
    {'name': 'Кофе', 'icon': '☕', 'sort_order': 1},
    {'name': 'Чай', 'icon': '🍵', 'sort_order': 2},
    {'name': 'Десерты', 'icon': '🍰', 'sort_order': 3},
    {'name': 'Выпечка', 'icon': '🥐', 'sort_order': 4},
]

# (category_name, product_name, description, price)
DEMO_PRODUCTS = [
    ('Кофе', 'Капучино', 'Эспрессо с нежной молочной пенкой', Decimal('180')),
    ('Кофе', 'Латте', 'Кофе с молоком и лёгкой пенкой', Decimal('200')),
    ('Кофе', 'Американо', 'Классический чёрный кофе', Decimal('150')),
    ('Чай', 'Зелёный чай', 'Свежезаваренный зелёный чай', Decimal('120')),
    ('Чай', 'Чёрный чай', 'Ароматный чёрный чай с лимоном', Decimal('120')),
    ('Чай', 'Молочный улун', 'Тайваньский улун с карамельными нотами', Decimal('160')),
    ('Десерты', 'Чизкейк', 'Нью-Йоркский чизкейк', Decimal('280')),
    ('Десерты', 'Тирамису', 'Итальянский десерт с маскарпоне', Decimal('320')),
    ('Десерты', 'Медовик', 'Классический медовый торт', Decimal('250')),
    ('Выпечка', 'Круассан', 'Слоёная французская выпечка', Decimal('140')),
    ('Выпечка', 'Булочка с корицей', 'Мягкая булочка с корицей и глазурью', Decimal('130')),
    ('Выпечка', 'Маффин', 'Шоколадный маффин', Decimal('150')),
]


class Command(BaseCommand):
    help = 'Заполняет базу демо-категориями и товарами (без дублирования при повторном запуске)'

    def handle(self, *args, **options):
        if Category.objects.exists():
            self.stdout.write(
                self.style.WARNING('Категории уже есть в базе — создаём только недостающие записи.')
            )

        cat_map = {}
        categories_created = 0

        for cat_data in DEMO_CATEGORIES:
            cat, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'icon': cat_data['icon'],
                    'sort_order': cat_data['sort_order'],
                },
            )
            cat_map[cat.name] = cat
            if created:
                categories_created += 1
                self.stdout.write(f'  + Категория: {cat.name}')
            else:
                self.stdout.write(f'  · Категория уже есть: {cat.name}')

        products_created = 0
        for cat_name, name, desc, price in DEMO_PRODUCTS:
            category = cat_map[cat_name]
            _product, created = Product.objects.get_or_create(
                category=category,
                name=name,
                defaults={
                    'description': desc,
                    'price': price,
                    'is_available': True,
                },
            )
            if created:
                products_created += 1
                self.stdout.write(f'  + Товар: {name}')
            else:
                self.stdout.write(f'  · Товар уже есть: {name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Готово: категорий +{categories_created}, товаров +{products_created}.'
            )
        )
