// src/pages/Index.tsx
import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";
import MenuCard, { MenuItem } from "@/components/MenuCard";
import FloatingCartButton from "@/components/FloatingCartButton";
import CartSheet, { CartItem } from "@/components/CartSheet";

import pizzaImg from "@/assets/menu/pizza-margherita.jpg";
import sushiImg from "@/assets/menu/sushi-bowl.jpg";
import burgerImg from "@/assets/menu/gourmet-burger.jpg";
import pastaImg from "@/assets/menu/pasta-alfredo.jpg";
import saladImg from "@/assets/menu/mediterranean-salad.jpg";
import pancakesImg from "@/assets/menu/berry-pancakes.jpg";

import { fetchMenuByQr, createOrder } from "@/lib/api";

/** Local lightweight types so TS knows `data` shape */
type MenuApiResponse = {
  menu?: any[]; // your get_menu_by_qr returns { menu: [...] }
  categories?: any[]; // some endpoints may return categories
  restaurant?: any;
};

const LOCAL_IMAGE_MAP: { [k: string]: string } = {
  pizza: pizzaImg,
  margherita: pizzaImg,
  sushi: sushiImg,
  bowl: sushiImg,
  burger: burgerImg,
  pasta: pastaImg,
  alfredo: pastaImg,
  salad: saladImg,
  mediterranean: saladImg,
  pancakes: pancakesImg,
  berry: pancakesImg,
};

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");
const FALLBACK_RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID;

/** Map backend item shape to the MenuItem type used by MenuCard */
const mapBackendItemToMenuItem = (raw: any): MenuItem => {
  const id = String(raw.id ?? raw.pk ?? raw.uuid ?? raw.uuid4 ?? raw._id ?? raw.uuid_str ?? Math.random());
  const name = raw.name ?? raw.title ?? "Unnamed";
  const description = raw.description ?? raw.summary ?? "";
  const price = typeof raw.price === "string" ? parseFloat(raw.price) : raw.price ?? 0;
  const categoryName =
    (raw.category && typeof raw.category === "string" && raw.category) ||
    (raw.category && raw.category.name) ||
    raw.category_name ||
    raw.categoryId ||
    raw.category_id ||
    "Uncategorized";

  let image: any = null;
  if (raw.image_url) {
    image = raw.image_url;
  } else if (raw.image) {
    image = raw.image; // sometimes serializer returns "image" path
  } else {
    const l = name.toLowerCase();
    const foundKey = Object.keys(LOCAL_IMAGE_MAP).find((k) => l.includes(k));
    image = foundKey ? LOCAL_IMAGE_MAP[foundKey] : null;
  }

  return {
    id,
    name,
    description,
    price,
    image,
    category: categoryName,
  } as MenuItem;
};

const Index: React.FC = () => {
  const { qr } = useParams<{ qr?: string }>();
  const [active, setActive] = useState<string>("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const restaurantId = FALLBACK_RESTAURANT_ID || undefined;

  // debug logs
  console.debug("[UI] route qr param:", qr);
  console.debug("[UI] VITE_API_BASE:", API_BASE);

  // single useQuery declaration (no duplicates)
  const { data: menuResp, isLoading, error } = useQuery<MenuApiResponse, Error>({
    queryKey: ["menu", qr ?? restaurantId ?? "default"],
    queryFn: async (): Promise<MenuApiResponse> => {
      console.debug("[UI] queryFn running for qr:", qr, "restaurantId:", restaurantId);
      if (qr) {
        // call wrapper in src/lib/api (which logs full URL)
        return fetchMenuByQr(qr);
      }
      if (restaurantId) {
        const url = `${API_BASE}/api/menu/restaurants/${restaurantId}/categories/`;
        console.debug("[UI] fetching restaurant categories:", url);
        const res = await fetch(url);
        console.debug("[UI] categories response status:", res.status);
        if (!res.ok) throw new Error(await res.text());
        const cats = await res.json();
        console.debug("[UI] categories json:", cats);
        return { categories: cats, restaurant: { id: restaurantId } };
      }
      const url = `${API_BASE}/api/menu/categories/`;
      console.debug("[UI] fallback fetching categories:", url);
      const res = await fetch(url);
      console.debug("[UI] fallback categories status:", res.status);
      if (!res.ok) throw new Error(await res.text());
      return { categories: await res.json() };
    },
    enabled: !!qr || !!restaurantId,
    staleTime: 1000 * 60 * 5,
  });

  // manual test button function (useful while debugging)
  const testFetch = async () => {
    try {
      const testQr = qr ?? "PUT_A_QR_HERE";
      const testUrl = `${API_BASE}/api/menu/qr/63e967e0-f42c-47ee-a6d7-f25928a2a5ac/menu/`;
      console.debug("[UI] manual testFetch ->", testUrl);
      const res = await fetch(testUrl);
      console.debug("[UI] manual testFetch status:", res.status);
      const json = await res.json().catch(() => null);
      console.debug("[UI] manual testFetch json:", json);
      alert("manual testFetch done — check console and network tab");
    } catch (err) {
      console.error("manual testFetch error:", err);
      alert("manual testFetch error — see console");
    }
  };

  // Normalize categories & items into the format the UI expects.
  const categoriesData = useMemo(() => {
    if (!menuResp) return [];

    const rawCats = menuResp.menu ?? menuResp.categories ?? [];

    if (!Array.isArray(rawCats)) return [];

    const looksLikeItemsOnly = rawCats.length > 0 && !Object.prototype.hasOwnProperty.call(rawCats[0], "items");

    if (looksLikeItemsOnly) {
      return [
        {
          id: "all",
          name: "All",
          items: rawCats,
        },
      ];
    }

    return rawCats.map((c: any) => ({
      id: c.id ?? c.pk ?? c.name,
      name: c.name ?? c.title ?? "Category",
      items: Array.isArray(c.items) ? c.items : [],
    }));
  }, [menuResp]);

  const allItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [];
    categoriesData.forEach((cat: any) => {
      (cat.items || []).forEach((raw: any) => {
        const mapped = mapBackendItemToMenuItem({ ...raw, category: cat.name });
        items.push(mapped);
      });
    });
    return items;
  }, [categoriesData]);

  const categories = useMemo(() => {
    const names = Array.from(new Set(categoriesData.map((c: any) => c.name).filter(Boolean)));
    return ["All", ...names];
  }, [categoriesData]);

  const filtered = useMemo(() => (active === "All" ? allItems : allItems.filter((i) => i.category === active)), [active, allItems]);

  const itemsInCart: CartItem[] = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([id, quantity]) => {
          const it = allItems.find((x) => x.id === id)!;
          return { id, name: it.name, price: it.price, image: it.image, quantity };
        }),
    [cart, allItems]
  );

  const itemCount = useMemo(() => itemsInCart.reduce((acc, i) => acc + i.quantity, 0), [itemsInCart]);
  const subtotal = useMemo(() => itemsInCart.reduce((acc, i) => acc + i.price * i.quantity, 0), [itemsInCart]);

  const inc = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const dec = (id: string) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) - 1) }));
  const remove = (id: string) =>
    setCart((c) => {
      const { [id]: _, ...rest } = c;
      return rest;
    });

  const checkout = async () => {
    if (!qr && !restaurantId) {
      alert(`Checking out ${itemCount} item(s) — $${subtotal.toFixed(2)}`);
      return;
    }

    if (itemCount === 0) {
      alert("Cart is empty");
      return;
    }

    const itemsPayload = itemsInCart.map((it) => ({
      menu_item: it.id,
      quantity: it.quantity,
      special_instructions: "",
    }));

    const payload = {
      customer_name: "Guest",
      special_instructions: notes || "",
      items: itemsPayload,
    };

    try {
      const result = await createOrder(qr ?? "", payload as any);
      alert(`Order sent! id: ${result.id} — Total: ${result.total_amount}`);
      setCart({});
      setNotes("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to send order: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="container py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Explore Our Restaurant Menu</h1>
            <p className="hidden md:block text-sm text-muted-foreground animate-fade-in">Warm, appetizing, and easy to order.</p>
          </div>
        </section>

        {/* Debug/Test row */}
        <section className="container py-2">
          <div className="flex gap-2 items-center">
            <button onClick={testFetch} className="px-3 py-2 bg-orange-600 text-white rounded">
              Test API (manual)
            </button>
            <div className="text-sm text-muted-foreground">qr: {qr ?? "none"}</div>
            <div className="text-sm text-muted-foreground">VITE_API_BASE: {API_BASE}</div>
          </div>
        </section>

        <CategoryBar categories={categories} active={active} onChange={setActive} />

        <section className="container py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-gray-50 rounded-lg animate-pulse" />)
            ) : (
              filtered.map((item) => (
                <MenuCard key={item.id} item={item} quantity={cart[item.id] || 0} onIncrement={inc} onDecrement={dec} />
              ))
            )}
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600">
              Failed to load menu: {error.message}. Check console/network and ensure backend is reachable from the frontend.
            </p>
          )}
        </section>
      </main>

      <FloatingCartButton count={itemCount} onClick={() => setOpen(true)} />

      <CartSheet open={open} onOpenChange={setOpen} items={itemsInCart} onInc={inc} onDec={dec} onRemove={remove} subtotal={subtotal} notes={notes} onNotesChange={setNotes} onCheckout={checkout} />
    </div>
  );
};

export default Index;
