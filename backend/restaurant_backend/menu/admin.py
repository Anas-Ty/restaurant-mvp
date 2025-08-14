from django.contrib import admin
from .models import Category, MenuItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'order_index', 'is_active']
    list_filter = ['restaurant', 'is_active']
    search_fields = ['name', 'restaurant__name']

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'category', 'price', 'is_available']
    list_filter = ['restaurant', 'category', 'is_available', 'is_vegetarian', 'is_vegan']
    search_fields = ['name', 'restaurant__name', 'category__name']