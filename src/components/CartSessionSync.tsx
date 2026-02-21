"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

const CART_OWNER_KEY = "shopping-cart-owner";

export default function CartSessionSync() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const syncOwner = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        const data = await res.json();
        const currentOwner = data?.userId ? `user:${data.userId}` : "guest";
        const previousOwner = localStorage.getItem(CART_OWNER_KEY);

        if (previousOwner && previousOwner !== currentOwner) {
          clearCart();
        }

        localStorage.setItem(CART_OWNER_KEY, currentOwner);
      } catch {
        // no-op
      }
    };

    syncOwner();
  }, [clearCart]);

  return null;
}
