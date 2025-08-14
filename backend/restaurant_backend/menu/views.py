from django.shortcuts import render
from rest_framework import generics, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from restaurants.models import Restaurant, Table
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer

@api_view(['GET'])
@permission_classes([AllowAny])
def get_menu_by_qr(request, qr_code):
    print(f"[Django][menu.views] get_menu_by_qr called with qr_code={qr_code}, REMOTE_ADDR={request.META.get('REMOTE_ADDR')}")
    try:
        table = Table.objects.select_related('restaurant').get(
            qr_code=qr_code,
            is_active=True,
            restaurant__is_active=True
        )
        
        categories = Category.objects.filter(
            restaurant=table.restaurant,
            is_active=True
        ).prefetch_related('items')
        
        serializer = CategorySerializer(categories, many=True)
        
        return Response({
            'restaurant': {
                'id': table.restaurant.id,
                'name': table.restaurant.name,
                'description': table.restaurant.description,
                'logo': table.restaurant.logo.url if table.restaurant.logo else None
            },
            'table': {
                'id': table.id,
                'table_number': table.table_number,
                'qr_code': str(table.qr_code)
            },
            'menu': serializer.data
        })
    except Table.DoesNotExist:
        return Response(
            {'error': 'Invalid QR code'}, 
            status=404
        )

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        return Category.objects.filter(
            restaurant_id=restaurant_id,
            restaurant__owner=self.request.user
        )

    def perform_create(self, serializer):
        restaurant_id = self.kwargs['restaurant_id']
        restaurant = get_object_or_404(
            Restaurant,
            id=restaurant_id,
            owner=self.request.user
        )
        serializer.save(restaurant=restaurant)

class MenuItemListCreateView(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        return MenuItem.objects.filter(
            restaurant_id=restaurant_id,
            restaurant__owner=self.request.user
        )

    def perform_create(self, serializer):
        restaurant_id = self.kwargs['restaurant_id']
        restaurant = get_object_or_404(
            Restaurant,
            id=restaurant_id,
            owner=self.request.user
        )
        category_id = self.request.data.get('category')
        category = get_object_or_404(
            Category,
            id=category_id,
            restaurant=restaurant
        )
        serializer.save(restaurant=restaurant, category=category)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer

    def get_queryset(self):
        restaurant_id = self.request.query_params.get('restaurant_id')
        return Category.objects.filter(restaurant_id=restaurant_id, is_active=True)

class MenuItemViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = MenuItemSerializer

    def get_queryset(self):
        restaurant_id = self.request.query_params.get('restaurant_id')
        return MenuItem.objects.filter(restaurant_id=restaurant_id, is_available=True)


