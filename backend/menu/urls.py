from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, OrderViewSet, ProductViewSet, ServiceAlertViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='product')
router.register('orders', OrderViewSet, basename='order')
router.register('alerts', ServiceAlertViewSet, basename='alert')

urlpatterns = [
    path('', include(router.urls)),
]
