from rest_framework import serializers
from .models import Category, MenuItem

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'description', 'price', 'image', 'ingredients',
            'allergens', 'is_available', 'is_vegetarian', 'is_vegan',
            'preparation_time', 'order_index'
        ]
        read_only_fields = ['id']

class CategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'order_index', 'is_active', 'items']
        read_only_fields = ['id']

class MenuSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Category
        fields = ['categories']