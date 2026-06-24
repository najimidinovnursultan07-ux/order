from django.db import models


class Category(models.Model):
    name = models.CharField('Название', max_length=100)
    icon = models.CharField('Иконка', max_length=10, default='🍽️')
    sort_order = models.PositiveIntegerField('Порядок', default=0)

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name='Категория',
    )
    name = models.CharField('Название', max_length=200)
    description = models.TextField('Описание', blank=True)
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    image = models.ImageField('Фото', upload_to='products/', blank=True, null=True)
    is_available = models.BooleanField('В наличии', default=True)
    is_bestseller = models.BooleanField('Хит продаж', default=False)
    is_spicy = models.BooleanField('Острое', default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_NEW = 'new'
    STATUS_PREPARING = 'preparing'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_NEW, 'Новый'),
        (STATUS_PREPARING, 'Готовится'),
        (STATUS_COMPLETED, 'Завершен'),
        (STATUS_CANCELLED, 'Отменен'),
    ]

    table_number = models.CharField('Номер столика', max_length=50)
    customer_phone = models.CharField(
        'Телефон клиента',
        max_length=20,
        blank=True,
        default='',
    )
    status = models.CharField(
        'Статус',
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_NEW,
    )
    total_price = models.DecimalField('Сумма', max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлен', auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'

    def __str__(self):
        return f'Столик {self.table_number} — {self.get_status_display()}'


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Заказ',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='order_items',
        verbose_name='Товар',
    )
    quantity = models.PositiveIntegerField('Количество', default=1)
    price_at_order = models.DecimalField(
        'Цена на момент заказа',
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    class Meta:
        verbose_name = 'Позиция заказа'
        verbose_name_plural = 'Позиции заказа'

    def __str__(self):
        return f'{self.quantity}x {self.product.name}'

    @property
    def subtotal(self):
        return self.quantity * self.price_at_order


class ServiceAlert(models.Model):
    TYPE_WAITER = 'waiter'
    TYPE_BILL = 'bill'

    TYPE_CHOICES = [
        (TYPE_WAITER, 'Вызов официанта'),
        (TYPE_BILL, 'Просьба счёт'),
    ]

    alert_type = models.CharField('Тип', max_length=20, choices=TYPE_CHOICES)
    table_number = models.CharField('Номер столика', max_length=50)
    is_read = models.BooleanField('Прочитано', default=False)
    created_at = models.DateTimeField('Создан', auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Сервисный вызов'
        verbose_name_plural = 'Сервисные вызовы'

    def __str__(self):
        return f'{self.get_alert_type_display()} — столик {self.table_number}'
