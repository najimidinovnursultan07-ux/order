from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import Category, Order, OrderItem, Product, ServiceAlert


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'sort_order']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'category',
            'category_name',
            'name',
            'description',
            'price',
            'image',
            'image_url',
            'is_available',
            'is_bestseller',
            'is_spicy',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_id = serializers.IntegerField(source='product.id', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'product_name', 'quantity', 'price_at_order', 'subtotal']
        read_only_fields = ['price_at_order', 'subtotal']


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'table_number',
            'customer_phone',
            'status',
            'status_display',
            'total_price',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['total_price', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    table_number = serializers.CharField(max_length=50)
    customer_phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Заказ должен содержать хотя бы один товар.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        table_number = validated_data['table_number']
        items_data = validated_data['items']

        order = Order.objects.create(
            table_number=table_number,
            customer_phone=validated_data.get('customer_phone', ''),
            status=Order.STATUS_NEW,
            total_price=Decimal('0'),
        )

        total = Decimal('0')
        for item_data in items_data:
            try:
                product = Product.objects.get(
                    pk=item_data['product_id'],
                    is_available=True,
                )
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    {'items': f'Товар с id={item_data["product_id"]} недоступен.'}
                )

            quantity = item_data['quantity']
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price_at_order=product.price,
            )
            total += product.price * quantity

        order.total_price = total
        order.save(update_fields=['total_price'])
        return order


class ServiceAlertSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_alert_type_display', read_only=True)

    class Meta:
        model = ServiceAlert
        fields = ['id', 'alert_type', 'type_display', 'table_number', 'is_read', 'created_at']
        read_only_fields = ['is_read', 'created_at']
