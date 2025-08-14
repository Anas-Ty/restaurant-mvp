from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'restaurant', 'table', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'restaurant', 'created_at']
    search_fields = ['customer_name', 'restaurant__name', 'table__table_number']
    inlines = [OrderItemInline]