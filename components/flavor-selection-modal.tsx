"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart-v2"

// Based on API structure
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
  product_variants: Array<{
    id: string
    price: number
    original_price: number
    stock: number
  }>
  modifier_categories: ModifierCategory[]
}

interface FlavorSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  onAddToCart: (product: Product, selectedFlavors: string[], quantity: number) => void
}

export default function FlavorSelectionModal({ isOpen, onClose, product, onAddToCart }: FlavorSelectionModalProps) {
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)

  // Get flavor modifier category (assuming it's the first one or find by name)
  const flavorCategory =
    product.modifier_categories?.find(
      (cat) => cat.name.toLowerCase().includes("sabor") || cat.name.toLowerCase().includes("flavor"),
    ) || product.modifier_categories?.[0]

  const isOutOfStock = (product as any).stock !== undefined && (product as any).stock <= 0

  const handleFlavorToggle = (flavorId: string, event?: React.MouseEvent) => {
    // Prevent event bubbling if called from div click
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    setSelectedFlavors((prev) => {
      if (prev.includes(flavorId)) {
        return prev.filter((id) => id !== flavorId)
      } else {
        // Always allow multiple selections up to the max limit
        if (flavorCategory && prev.length >= flavorCategory.max_modifiers) {
          return prev // Don't add if at max limit
        }
        return [...prev, flavorId]
      }
    })
  }

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return
    }

    if (flavorCategory?.required && selectedFlavors.length === 0) {
      return // Don't add if required flavors not selected
    }

    onAddToCart(product, selectedFlavors, quantity)

    // Reset state and close modal
    setSelectedFlavors([])
    setQuantity(1)
    onClose()
  }

  const canAddToCart =
    !isOutOfStock && (!flavorCategory?.required || selectedFlavors.length >= (flavorCategory?.min_modifiers || 1))

  // Calculate total price (base price + flavor costs)
  const flavorCosts = selectedFlavors.reduce((total, flavorId) => {
    const flavor = flavorCategory?.modifiers.find((m) => m.id === flavorId)
    return total + (flavor?.price || 0)
  }, 0)

  const basePrice = Number((product as any).preco || (product as any).price || product.product_variants?.[0]?.price || 0)
  const originalPrice = (product as any).originalPrice || basePrice
  const totalPrice = (basePrice + flavorCosts) * quantity
  const totalOriginalPrice = (originalPrice + flavorCosts) * quantity

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-gray-900 to-black border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">{(product as any).nome || product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Price Display */}
          <div className="text-center space-y-2">
            {originalPrice > basePrice && (
              <p className="text-gray-400 line-through text-lg">{formatPrice(totalOriginalPrice)}</p>
            )}
            <p className="text-2xl font-bold text-white">{formatPrice(totalPrice)}</p>
            {originalPrice > basePrice && (
              <Badge className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                Economize {formatPrice(totalOriginalPrice - totalPrice)}
              </Badge>
            )}
          </div>

          {/* Flavor Selection */}
          {flavorCategory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{flavorCategory.name}</h3>
                <Badge variant="outline" className="text-gray-300 border-gray-600">
                  {flavorCategory.max_modifiers === 1 ? "Escolha 1" : `Escolha até ${flavorCategory.max_modifiers}`}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {flavorCategory.modifiers.map((flavor) => (
                  <div
                    key={flavor.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedFlavors.includes(flavor.id)
                        ? "bg-gradient-to-r from-gray-700 to-gray-800 border-gray-500"
                        : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
                    }`}
                    onClick={(e) => handleFlavorToggle(flavor.id, e)}
                  >
                    <Checkbox
                      checked={selectedFlavors.includes(flavor.id)}
                      onCheckedChange={(checked) => {
                        // Only toggle if the checked state actually differs from current state
                        const isCurrentlySelected = selectedFlavors.includes(flavor.id)
                        if (checked !== isCurrentlySelected) {
                          handleFlavorToggle(flavor.id)
                        }
                      }}
                      className="border-gray-500 pointer-events-none"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">{flavor.name}</p>
                      {flavor.price > 0 && <p className="text-sm text-gray-400">+{formatPrice(flavor.price)}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {flavorCategory.required && selectedFlavors.length === 0 && (
                <p className="text-sm text-red-400">* Selecione pelo menos {flavorCategory.min_modifiers} sabor(es)</p>
              )}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-white">Quantidade:</span>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="h-8 w-8 bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-bold text-lg min-w-[2rem] text-center text-white">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="h-8 w-8 bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-gray-800 border-gray-600 hover:bg-gray-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`flex-1 font-medium disabled:opacity-50 ${
                isOutOfStock
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white"
              }`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isOutOfStock ? "Esgotado" : `Adicionar (${quantity})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
