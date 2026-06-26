from django.conf import settings
from django.http import HttpResponseRedirect
from django.views import View
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Category, Order, Product, ServiceAlert
from .serializers import (
    CategorySerializer,
    OrderCreateSerializer,
    OrderSerializer,
    ProductSerializer,
    ServiceAlertSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = super().get_queryset()
        category_id = self.request.query_params.get('category')
        available_only = self.request.query_params.get('available')

        if category_id:
            qs = qs.filter(category_id=category_id)
        if available_only and available_only.lower() in ('true', '1'):
            qs = qs.filter(is_available=True)
        return qs


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related('items__product').all()
    parser_classes = [JSONParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        output = OrderSerializer(order, context={'request': request})
        return Response(output.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Недопустимый статус. Допустимые: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])
        return Response(OrderSerializer(order, context={'request': request}).data)


class ServiceAlertViewSet(viewsets.ModelViewSet):
    queryset = ServiceAlert.objects.all()
    serializer_class = ServiceAlertSerializer
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        qs = super().get_queryset()
        unread = self.request.query_params.get('unread')
        if unread and unread.lower() in ('true', '1'):
            qs = qs.filter(is_read=False)
        return qs

    @action(detail=True, methods=['patch'])
    def read(self, request, pk=None):
        alert = self.get_object()
        alert.is_read = True
        alert.save(update_fields=['is_read'])
        return Response(ServiceAlertSerializer(alert).data)


class TableQrRedirectView(View):
    """Редирект для QR: .com домен Render → меню на Vercel (MIUI не открывает .app)."""

    def get(self, request, table_id):
        base = settings.FRONTEND_URL.rstrip('/')
        table = str(table_id).strip()
        return HttpResponseRedirect(f'{base}/table/{table}')
