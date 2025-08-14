from django.urls import path
from . import views

urlpatterns = [
    path('restaurants/', views.RestaurantListCreateView.as_view(), name='restaurant-list'),
    path('restaurants/<uuid:pk>/', views.RestaurantDetailView.as_view(), name='restaurant-detail'),
    path('restaurants/<uuid:restaurant_id>/tables/', views.TableListCreateView.as_view(), name='table-list'),
    path('qr/<uuid:qr_code>/table/', views.get_table_by_qr, name='table-by-qr'),
]