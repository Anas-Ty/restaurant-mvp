from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from restaurants.models import Restaurant, Table
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def create_order(request, qr_code):
    """Create order from customer using QR code"""
    print(f"[Django][orders.views] create_order called with qr_code={qr_code}, REMOTE_ADDR={request.META.get('REMOTE_ADDR')}, payload={request.data}")
    
    try:
        table = Table.objects.select_related('restaurant').get(
            qr_code=qr_code,
            is_active=True,
            restaurant__is_active=True
        )
    except Table.DoesNotExist:
        return Response(
            {'error': 'Invalid QR code'}, 
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = OrderCreateSerializer(
        data=request.data,
        context={'table': table}
    )
    
    if serializer.is_valid():
        order = serializer.save()
        response_serializer = OrderSerializer(order)
        return Response(
            response_serializer.data, 
            status=status.HTTP_201_CREATED
        )
    
    return Response(
        serializer.errors, 
        status=status.HTTP_400_BAD_REQUEST
    )

class RestaurantOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        restaurant_id = self.kwargs['restaurant_id']
        status_filter = self.request.query_params.get('status')
        
        queryset = Order.objects.filter(
            restaurant_id=restaurant_id,
            restaurant__owner=self.request.user
        ).select_related('table').prefetch_related('items__menu_item')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            restaurant__owner=self.request.user
        ).select_related('table').prefetch_related('items__menu_item')

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_order_status(request, order_id):
    """Update order status"""
    try:
        order = Order.objects.get(
            id=order_id,
            restaurant__owner=request.user
        )
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

    new_status = request.data.get('status')
    if new_status not in dict(Order.STATUS_CHOICES):
        return Response(
            {'error': 'Invalid status'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    order.status = new_status
    order.save()

    serializer = OrderSerializer(order)
    return Response(serializer.data)
