import React, { useEffect, useState } from "react";
import { fetchOrders } from "@/lib/api";

export default function RestaurantDashboard({ restaurantId }: { restaurantId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    if (!restaurantId) return;
    const load = async () => {
      try {
        const data = await fetchOrders(restaurantId);
        setOrders(data);
      } catch (e) {
        console.error("Failed to load orders", e);
      }
    };
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, [restaurantId]);

  // map orders into the UI format your dashboard expects
  return (
    <div>
      {/* Put existing dashboard UI here, reading from `orders` */}
    </div>
  );
}
