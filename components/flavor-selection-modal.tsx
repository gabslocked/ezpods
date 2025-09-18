"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingCart, Plus, Minus } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/lib/types"

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
    product.modifierCategories?.find(
      (cat) => cat.name.toLowerCase().includes("sabor") || cat.name.toLowerCase().includes("flavor"),
    ) || product.modifierCategories?.[0]

  const isOutOfStock = product.stock !== undefined && product.stock <= 0

  const handleFlavorToggle = (flavorId: string) => {
    setSelectedFlavors((prev) => {
      if (prev.includes(flavorId)) {
        return prev.filter((id) => id !== flavorId)
      } else {
        // Check if we can add more flavors based on maxModifiers
        if (flavorCategory && prev.length >= flavorCategory.maxModifiers) {
          // If single selection, replace the current selection
          if (flavorCategory.maxModifiers === 1) {
            return [flavorId]
          }
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
    !isOutOfStock && (!flavorCategory?.required || selectedFlavors.length >= (flavorCategory?.minModifiers || 1))

  // Calculate total price (base price + flavor costs)
  const flavorCosts = selectedFlavors.reduce((total, flavorId) => {
    const flavor = flavorCategory?.modifiers.find((m) => m.id === flavorId)
    return total + (flavor?.price || 0)
  }, 0)

  const basePrice = Number(product.preco || product.price || 0)
  const originalPrice = product.originalPrice || basePrice
  const totalPrice = (basePrice + flavorCosts) * quantity
  const totalOriginalPrice = (originalPrice + flavorCosts) * quantity

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-gray-900 to-black border border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">{product.nome || product.name}</DialogTitle>
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
                  {flavorCategory.maxModifiers === 1 ? "Escolha 1" : `Máx. ${flavorCategory.maxModifiers}`}
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
                    onClick={() => handleFlavorToggle(flavor.id)}
                  >
                    <Checkbox
                      checked={selectedFlavors.includes(flavor.id)}
                      onChange={() => handleFlavorToggle(flavor.id)}
                      className="border-gray-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">{flavor.name}</p>
                      {flavor.price > 0 && <p className="text-sm text-gray-400">+{formatPrice(flavor.price)}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {flavorCategory.required && selectedFlavors.length === 0 && (
                <p className="text-sm text-red-400">* Selecione pelo menos {flavorCategory.minModifiers} sabor(es)</p>
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
