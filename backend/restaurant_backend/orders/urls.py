from django.urls import path
from . import views

urlpatterns = [
    path('restaurants/<uuid:restaurant_id>/orders/', views.RestaurantOrdersView.as_view(), name='restaurant-orders'),
    path('orders/<uuid:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/<uuid:order_id>/status/', views.update_order_status, name='update-order-status'),
    path('qr/<uuid:qr_code>/order/', views.create_order, name='create-order'),
]