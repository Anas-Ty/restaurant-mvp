# restaurants/management/commands/seed_restaurant.py
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from restaurants.models import Restaurant, Table
from menu.models import Category, MenuItem
from decimal import Decimal
import json
from pathlib import Path

# Default items (based on your static front-end)
DEFAULT_ITEMS = [
    {"name": "Margherita Pizza", "description": "San Marzano tomatoes, mozzarella, fresh basil.", "price": "12.50", "category": "Pizza", "preparation_time": 15},
    {"name": "Sushi Bowl", "description": "Salmon, avocado, cucumber, sushi rice, sesame.", "price": "14.00", "category": "Bowls", "preparation_time": 12},
    {"name": "Gourmet Burger", "description": "Grass-fed beef, cheddar, pickles, brioche bun.", "price": "11.75", "category": "Burgers", "preparation_time": 14},
    {"name": "Pasta Alfredo", "description": "Creamy parmesan sauce, parsley, black pepper.", "price": "13.00", "category": "Pasta", "preparation_time": 12},
    {"name": "Mediterranean Salad", "description": "Tomatoes, cucumber, olives, feta, olive oil.", "price": "9.50", "category": "Salads", "preparation_time": 5},
    {"name": "Berry Pancakes", "description": "Fluffy stack, berries, maple syrup, powdered sugar.", "price": "8.75", "category": "Desserts", "preparation_time": 10},
]

class Command(BaseCommand):
    help = "Seed a restaurant, tables, categories and menu items. Optionally read items JSON."

    def add_arguments(self, parser):
        parser.add_argument('--restaurant', type=str, default='Demo Restaurant', help='Restaurant name')
        parser.add_argument('--owner', type=str, default=None, help='Owner username (must exist)')
        parser.add_argument('--tables', type=int, default=10, help='Number of tables to create')
        parser.add_argument('--items-file', type=str, default=None, help='Optional path to JSON file with items')

    def handle(self, *args, **options):
        User = get_user_model()
        owner_username = options.get('owner')
        restaurant_name = options.get('restaurant')
        tables_count = options.get('tables')
        items_file = options.get('items_file')

        # find owner
        owner = None
        if owner_username:
            try:
                owner = User.objects.get(username=owner_username)
            except User.DoesNotExist:
                raise CommandError(f"Owner user '{owner_username}' does not exist. Create a superuser first.")
        else:
            # fallback: pick first superuser or first user
            owner = User.objects.filter(is_superuser=True).first() or User.objects.first()
            if not owner:
                raise CommandError("No user found. Create a superuser first.")

        self.stdout.write(self.style.NOTICE(f"Using owner: {owner.username}"))

        # create restaurant (or get existing)
        restaurant, created = Restaurant.objects.get_or_create(name=restaurant_name, defaults={"owner": owner, "address": "Unknown", "phone": "000", "email": "demo@example.com"})
        if created:
            self.stdout.write(self.style.SUCCESS(f"Created restaurant '{restaurant.name}'"))
        else:
            self.stdout.write(self.style.WARNING(f"Restaurant '{restaurant.name}' already exists (id={restaurant.id})"))

        # create tables
        existing_tables = restaurant.tables.count()
        if existing_tables >= tables_count:
            self.stdout.write(self.style.WARNING(f"Restaurant already has {existing_tables} tables, skipping table creation."))
        else:
            for i in range(existing_tables + 1, tables_count + 1):
                t = Table.objects.create(restaurant=restaurant, table_number=str(i), capacity=4)
                self.stdout.write(self.style.SUCCESS(f"Created table {t.table_number} (qr={t.qr_code})"))

        # read items source
        items = DEFAULT_ITEMS
        if items_file:
            p = Path(items_file)
            if not p.exists():
                raise CommandError(f"Items file not found: {items_file}")
            with open(p, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    items = data
                else:
                    raise CommandError("Items file must contain a JSON array of item objects.")

        # group items by category
        cats = {}
        for it in items:
            cat_name = it.get('category', 'Uncategorized')
            cats.setdefault(cat_name, []).append(it)

        # create categories and menu items
        for cat_name, items_list in cats.items():
            cat_obj, _ = Category.objects.get_or_create(restaurant=restaurant, name=cat_name, defaults={"description": ""})
            self.stdout.write(self.style.SUCCESS(f"Category: {cat_obj.name}"))
            for idx, it in enumerate(items_list, start=1):
                name = it.get('name')
                description = it.get('description', '')
                price = Decimal(it.get('price', "0.00"))
                prep = int(it.get('preparation_time', 10))
                menu_item, created = MenuItem.objects.get_or_create(
                    restaurant=restaurant,
                    category=cat_obj,
                    name=name,
                    defaults={
                        "description": description,
                        "price": price,
                        "preparation_time": prep,
                        "order_index": idx,
                        "is_available": True
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"  Created MenuItem: {menu_item.name} (€{menu_item.price})"))
                else:
                    self.stdout.write(self.style.WARNING(f"  MenuItem already exists: {menu_item.name}"))

        self.stdout.write(self.style.SUCCESS("Seeding complete."))
