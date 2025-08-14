from rest_framework import serializers
from .models import Order, OrderItem
from menu.serializers import MenuItemSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.UUIDField(write_only=True)
    subtotal = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'menu_item', 'menu_item_id', 'quantity', 
            'unit_price', 'subtotal', 'special_instructions'
        ]
        read_only_fields = ['id', 'unit_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer_name', 'status', 'total_amount', 'special_instructions',
            'table_number', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_amount', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            menu_item_id = item_data.pop('menu_item_id')
            OrderItem.objects.create(
                order=order,
                menu_item_id=menu_item_id,
                **item_data
            )
        
        order.calculate_total()
        return order

class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = ['customer_name', 'special_instructions', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        table = self.context['table']
        restaurant = table.restaurant
        
        order = Order.objects.create(
            restaurant=restaurant,
            table=table,
            **validated_data
        )
        
        for item_data in items_data:
            menu_item_id = item_data.pop('menu_item_id')
            OrderItem.objects.create(
                order=order,
                menu_item_id=menu_item_id,
                **item_data
            )
        
        order.calculate_total()
        return order