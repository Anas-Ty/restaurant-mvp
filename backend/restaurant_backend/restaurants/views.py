from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Restaurant, Table
from .serializers import RestaurantSerializer, TableSerializer

class RestaurantListCreateView(generics.ListCreateAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Restaurant.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class RestaurantDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Restaurant.objects.filter(owner=self.request.user)

class TableListCreateView(generics.ListCreateAPIView):
    serializer_class = TableSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        return Table.objects.filter(
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

@api_view(['GET'])
@permission_classes([AllowAny])
def get_table_by_qr(request, qr_code):
    """Get table information by QR code for customers"""
    try:
        table = Table.objects.select_related('restaurant').get(
            qr_code=qr_code,
            is_active=True,
            restaurant__is_active=True
        )
        serializer = TableSerializer(table)
        return Response({
            'table': serializer.data,
            'restaurant': RestaurantSerializer(table.restaurant).data
        })
    except Table.DoesNotExist:
        return Response(
            {'error': 'Invalid QR code'}, 
            status=status.HTTP_404_NOT_FOUND
        )