from django.contrib import admin

from .models import Category, Order, OrderItem, Product, ServiceAlert


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price_at_order',)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'sort_order')
    list_editable = ('sort_order',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_available', 'is_bestseller', 'is_spicy')
    list_filter = ('category', 'is_available', 'is_bestseller', 'is_spicy')
    search_fields = ('name', 'description')


@admin.register(ServiceAlert)
class ServiceAlertAdmin(admin.ModelAdmin):
    list_display = ('alert_type', 'table_number', 'is_read', 'created_at')
    list_filter = ('alert_type', 'is_read')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'table_number', 'status', 'total_price', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline]
    readonly_fields = ('created_at', 'updated_at')
