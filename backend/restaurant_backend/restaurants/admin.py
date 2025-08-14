from django.contrib import admin
from .models import Restaurant, Table

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'owner__username', 'phone']

@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['restaurant', 'table_number', 'capacity', 'qr_code', 'is_active']
    list_filter = ['restaurant', 'is_active', 'capacity']
    search_fields = ['restaurant__name', 'table_number']
    readonly_fields = ['qr_code']
