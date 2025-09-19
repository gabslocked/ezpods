"use client"

import type React from "react"

import { CartProvider } from "@/hooks/use-cart-v2"
import { FavoritesProvider } from "@/hooks/use-favorites"
import CartDrawerV2 from "@/components/cart-drawer-v2"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <FavoritesProvider>
        {children}
        <CartDrawerV2 />
      </FavoritesProvider>
    </CartProvider>
  )
}
