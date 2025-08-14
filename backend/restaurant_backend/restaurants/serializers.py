from rest_framework import serializers
from .models import Restaurant, Table

class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'description', 'address', 'phone', 'email', 'logo', 'is_active']
        read_only_fields = ['id']

class TableSerializer(serializers.ModelSerializer):
    qr_url = serializers.ReadOnlyField()
    
    class Meta:
        model = Table
        fields = ['id', 'table_number', 'capacity', 'qr_code', 'qr_url', 'is_active']
        read_only_fields = ['id', 'qr_code']