"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Based on the API structure from the curl response
interface ProductVariant {
  id: string
  price: number
  original_price: number
  stock: number
}

interface Modifier {
  id: string
  name: string
  price: number
  position: number
}

interface ModifierCategory {
  id: string
  name: string
  min_modifiers: number
  max_modifiers: number
  required: boolean
  modifiers: Modifier[]
}

interface Product {
  id: string
  name: string
  description?: string
  images: Array<{ image_url: string }>
  product_variants: ProductVariant[]
  modifier_categories: ModifierCategory[]
}

interface CartItem {
  id: string // Unique cart item ID
  productId: string
  productName: string
  productImage: string
  basePrice: number
  quantity: number
  selectedModifiers: Array<{
    categoryId: string
    categoryName: string
    modifierId: string
    modifierName: string
    modifierPrice: number
  }>
  totalPrice: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, selectedModifiers: Array<{categoryId: string, modifierId: string}>, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  isCartOpen: boolean
  toggleCart: (open?: boolean) => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isCartOpen: false,
  toggleCart: () => {},
  totalItems: 0,
  totalPrice: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("ezpods-cart")
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        // Validate cart data
        const validatedCart = parsedCart.filter((item: any) => 
          item && 
          typeof item.quantity === 'number' && 
          item.quantity > 0 &&
          item.id &&
          item.productId
        )
        setItems(validatedCart)
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
      localStorage.removeItem("ezpods-cart")
    }
  }, [])

  // Save cart to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("ezpods-cart", JSON.stringify(items))
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
    }
  }, [items])

  const addItem = (
    product: Product, 
    selectedModifiers: Array<{categoryId: string, modifierId: string}> = [], 
    quantity = 1
  ) => {
    // Ensure selectedModifiers is always an array
    const safeSelectedModifiers = Array.isArray(selectedModifiers) ? selectedModifiers : []
    
    // Get base price from first variant or fallback to legacy price
    const basePrice = product.product_variants?.[0]?.price || 
                     (typeof (product as any).preco === 'number' ? (product as any).preco : 
                      typeof (product as any).price === 'number' ? (product as any).price : 
                      parseFloat(String((product as any).price || (product as any).preco || 0)))
    
    // Calculate modifier details and total price
    let modifierPrice = 0
    const modifierDetails = safeSelectedModifiers.map(({ categoryId, modifierId }) => {
      const category = product.modifier_categories?.find(cat => cat.id === categoryId)
      const modifier = category?.modifiers?.find(mod => mod.id === modifierId)
      
      if (modifier) {
        modifierPrice += modifier.price
        return {
          categoryId,
          categoryName: category!.name,
          modifierId,
          modifierName: modifier.name,
          modifierPrice: modifier.price
        }
      }
      return null
    }).filter(Boolean) as CartItem['selectedModifiers']

    // Create unique ID based on product + selected modifiers
    const modifierKey = safeSelectedModifiers
      .map(m => `${m.categoryId}:${m.modifierId}`)
      .sort()
      .join('|')
    const cartItemId = `${product.id}-${modifierKey}`

    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === cartItemId)
      
      if (existingIndex >= 0) {
        // Update existing item quantity
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          totalPrice: (basePrice + modifierPrice) * (updated[existingIndex].quantity + quantity)
        }
        return updated
      } else {
        // Add new item
        const newItem: CartItem = {
          id: cartItemId,
          productId: product.id,
          productName: product.name || (product as any).nome || 'Produto sem nome',
          productImage: product.images?.[0]?.image_url || (product as any).imagem || '',
          basePrice,
          quantity,
          selectedModifiers: modifierDetails,
          totalPrice: (basePrice + modifierPrice) * quantity
        }
        return [...prev, newItem]
      }
    })
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (!itemId || newQuantity < 1) return

    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const modifierPrice = item.selectedModifiers.reduce((sum, mod) => sum + mod.modifierPrice, 0)
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: (item.basePrice + modifierPrice) * newQuantity
        }
      }
      return item
    }))
  }

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId))
  }

  const clearCart = () => {
    setItems([])
  }

  const toggleCart = (open?: boolean) => {
    setIsCartOpen(open !== undefined ? open : !isCartOpen)
  }

  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0)
  const totalPrice = items.reduce((sum, item) => {
    const itemTotal = item.totalPrice || 0
    return sum + (typeof itemTotal === 'number' && !isNaN(itemTotal) ? itemTotal : 0)
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
