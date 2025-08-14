from django.urls import path
from . import views

urlpatterns = [
    path('restaurants/<uuid:restaurant_id>/categories/', views.CategoryListCreateView.as_view(), name='category-list'),
    path('restaurants/<uuid:restaurant_id>/menu-items/', views.MenuItemListCreateView.as_view(), name='menuitem-list'),
    path('qr/<uuid:qr_code>/menu/', views.get_menu_by_qr, name='menu-by-qr'),
]