// src/lib/api.ts
const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");
const API_PREFIX = `${API_BASE}/api`;

export type MenuItemDTO = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
  ingredients?: string;
  allergens?: string;
  is_available?: boolean;
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  preparation_time?: number;
  order_index?: number;
  category?: string | { id: string; name?: string };
};

export type CategoryDTO = {
  id: string;
  name: string;
  description?: string;
  order_index?: number;
  is_active?: boolean;
  items: MenuItemDTO[];
};

export type TableDTO = {
  id: string;
  table_number: string;
  qr_code: string;
};

export type RestaurantDTO = {
  id: string;
  name: string;
};

export type MenuByQrResponse = {
  table: TableDTO;
  restaurant: RestaurantDTO;
  // your view returns 'menu' key holding categories (serializer.data)
  menu: CategoryDTO[]; 
};


/** Create order request shape (frontend -> backend) */
export type CreateOrderItem = {
  menu_item: string; // menu item uuid
  quantity: number;
  special_instructions?: string;
};

export type CreateOrderRequest = {
  restaurant?: string; // restaurant uuid (optional if resolved via qr)
  table?: string; // table uuid
  customer_name: string;
  special_instructions?: string;
  items: CreateOrderItem[];
};

/** Order response (backend -> frontend) */
export type OrderItemResponse = {
  id: string;
  menu_item: string | { id: string; name?: string };
  quantity: number;
  unit_price: number;
  special_instructions?: string;
  created_at?: string;
};

export type OrderResponse = {
  id: string;
  restaurant: string | RestaurantDTO;
  table: string | TableDTO;
  customer_name: string;
  status: string;
  total_amount: number;
  special_instructions?: string;
  items: OrderItemResponse[];
  created_at?: string;
};

async function checkOk(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const msg = text || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return res;
}

/** GET /api/menu/<qr>/ */
/** GET /api/menu/qr/<qr>/menu/  — matches menu/urls.py */
export async function fetchMenuByQr(qrCode: string): Promise<MenuByQrResponse> {
  if (!qrCode) throw new Error("qrCode is required");
  // NOTE: the backend route you have is /api/menu/qr/<qr>/menu/
  const url = `${API_BASE}/api/menu/qr/${encodeURIComponent(qrCode)}/menu/`;
  // small debug log (remove in production)
  // console.debug("fetchMenuByQr ->", url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      // optional headers — add Authorization if needed
      "Accept": "application/json",
    },
  });
  await checkOk(res);
  // The backend get_menu_by_qr in your menu/views.py returns
  // { restaurant: {...}, table: {...}, menu: [...] }
  return res.json();
}

// keep alias
export const getMenuByQR = fetchMenuByQr;



/**
 * createOrder supports two call styles:
 * 1) createOrder(qrCode, orderData) -> will resolve table via QR if needed and POST
 * 2) createOrder(orderPayload) -> directly POST orderPayload to /api/orders/
 */
export async function createOrder(qrOrPayload: string | CreateOrderRequest, maybePayload?: CreateOrderRequest): Promise<OrderResponse> {
  // style 1: (qrCode, orderData)
  if (typeof qrOrPayload === "string") {
    const qrCode = qrOrPayload;
    const orderData = maybePayload;
    if (!orderData) throw new Error("orderData missing");
    const payload: CreateOrderRequest = { ...orderData };

    // resolve table if not provided
    if (!payload.table) {
      const menuResp = await fetchMenuByQr(qrCode);
      if (!menuResp?.table?.id) throw new Error("Failed to resolve table from QR");
      payload.table = menuResp.table.id;
      if (!payload.restaurant) payload.restaurant = menuResp.restaurant.id;
    }

    // sanity: items
    if (!payload.items || payload.items.length === 0) throw new Error("Order must contain at least one item");

    const res = await fetch(`${API_PREFIX}/orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await checkOk(res);
    return res.json();
  }

  // style 2: (orderPayload)
  const payload = qrOrPayload;
  if (!payload.items || payload.items.length === 0) throw new Error("Order must contain at least one item");
  if (!payload.table) {
    throw new Error("table id missing in payload. Use createOrder(qrCode, orderData) to resolve table from QR.");
  }
  const res = await fetch(`${API_PREFIX}/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  await checkOk(res);
  return res.json();
}

/** fetch orders (optional query) */
export async function fetchOrders(restaurantId?: string, status?: string): Promise<OrderResponse[]> {
  const params = new URLSearchParams();
  if (restaurantId) params.append("restaurant", restaurantId);
  if (status) params.append("status", status);
  const res = await fetch(`${API_PREFIX}/orders/?${params.toString()}`);
  await checkOk(res);
  return res.json();
}

export default {
  fetchMenuByQr,
  getMenuByQR,
  createOrder,
  fetchOrders,
};
