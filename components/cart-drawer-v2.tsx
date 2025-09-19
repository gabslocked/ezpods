"use client"

import { useEffect, useState } from "react"
import { useCart } from "@/hooks/use-cart-v2"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight, Edit3, Check } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { formatPrice } from "@/lib/utils"

export default function CartDrawerV2() {
  const { items, removeItem, updateQuantity, clearCart, isCartOpen, toggleCart, totalItems, totalPrice } = useCart()
  const isMobile = useMobile()
  const [mounted, setMounted] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const drawerVariants = {
    hidden: isMobile ? { y: "100%" } : { x: "100%" },
    visible: isMobile ? { y: 0 } : { x: 0 },
    exit: isMobile ? { y: "100%" } : { x: "100%" },
  }

  const handleCheckout = () => {
    const message = `Olá! Gostaria de comprar os seguintes produtos:\n\n${items
      .map((item) => {
        const modifiersText = item.selectedModifiers.length > 0 
          ? ` (${item.selectedModifiers.map(m => m.modifierName).join(", ")})` 
          : ""
        return `- ${item.productName}${modifiersText} (${item.quantity}x) - ${formatPrice(item.totalPrice)}`
      })
      .join("\n")}\n\nTotal: ${formatPrice(totalPrice)}`

    window.open(`https://wa.me/5511933580273?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => toggleCart(false)}
            />

            <motion.div
              className={`fixed ${isMobile ? "bottom-0 left-0 right-0 max-h-[85vh]" : "top-0 right-0 bottom-0 w-full max-w-md"} 
                bg-gradient-to-br from-slate-900/95 via-gray-900/90 to-slate-800/95 
                backdrop-blur-xl border-l border-t border-gray-300/20 
                shadow-2xl shadow-black/50 z-50 flex flex-col`}
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-300/20 flex justify-between items-center 
                bg-gradient-to-r from-gray-100/10 via-gray-200/5 to-gray-100/10 backdrop-blur-md">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-gray-300" />
                  Carrinho
                  {totalItems > 0 && (
                    <span className="ml-2 bg-gradient-to-r from-gray-200/30 to-gray-300/20 
                      backdrop-blur-sm text-white text-xs font-bold rounded-full h-5 w-5 
                      flex items-center justify-center border border-gray-300/30 shadow-lg">
                      {totalItems}
                    </span>
                  )}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleCart(false)}
                  className="text-gray-300 hover:bg-gray-100/10 hover:text-white transition-all backdrop-blur-sm rounded-lg"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-grow overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <ShoppingBag className="h-16 w-16 text-gray-400/50 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Seu carrinho está vazio</h3>
                    <p className="text-gray-300 mb-6">Adicione produtos ao seu carrinho para continuar.</p>
                    <Button
                      onClick={() => toggleCart(false)}
                      className="bg-gradient-to-r from-gray-200/90 to-gray-300/80 
                        hover:from-gray-100 hover:to-gray-200 text-gray-900 font-medium 
                        transition-all border border-gray-300/50 shadow-lg hover:shadow-xl 
                        backdrop-blur-sm rounded-lg"
                    >
                      Continuar comprando
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-4 border border-gray-300/20 rounded-xl 
                          bg-gradient-to-br from-gray-100/10 via-gray-200/5 to-gray-300/10 
                          backdrop-blur-md hover:border-gray-300/30 transition-all duration-300 
                          shadow-lg hover:shadow-xl hover:shadow-gray-500/10"
                      >
                        {/* Product Image */}
                        <div className="relative w-16 h-16 flex-shrink-0 
                          bg-gradient-to-br from-gray-50/20 to-gray-100/10 
                          backdrop-blur-sm rounded-lg overflow-hidden 
                          border border-gray-300/30 shadow-inner">
                          <Image
                            src={item.productImage || "/placeholder.svg?height=64&width=64"}
                            alt={item.productName}
                            fill
                            className="object-contain p-1"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg?height=64&width=64"
                            }}
                          />
                        </div>

                        <div className="flex-grow min-w-0">
                          {/* Product Info */}
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-grow min-w-0 pr-2">
                              <h3 className="font-semibold text-white text-sm leading-tight truncate">
                                {item.productName}
                              </h3>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {item.quantity}x • Base: {formatPrice(item.basePrice)}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-white text-sm">
                                {formatPrice(item.totalPrice / item.quantity)}
                              </p>
                            </div>
                          </div>

                          {/* Selected Modifiers */}
                          {item.selectedModifiers.length > 0 && (
                            <div className="mb-3">
                              <div className="mb-2">
                                <span className="text-xs text-gray-400 font-medium">Opções selecionadas:</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1">
                                {item.selectedModifiers.map((modifier, index) => (
                                  <div
                                    key={`${modifier.modifierId}-${index}`}
                                    className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/15 
                                      backdrop-blur-sm text-gray-100 text-xs rounded-md 
                                      border border-blue-400/30 shadow-sm flex items-center gap-1"
                                  >
                                    <span className="truncate max-w-[120px] font-medium" title={modifier.modifierName}>
                                      {modifier.modifierName}
                                    </span>
                                    {modifier.modifierPrice > 0 && (
                                      <span className="text-blue-300 font-semibold">+{formatPrice(modifier.modifierPrice)}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-md border-gray-300/50 text-gray-300 
                                  hover:bg-gray-100/10 hover:border-gray-300/70 
                                  bg-gray-100/5 backdrop-blur-sm transition-all"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="mx-2 text-white font-medium min-w-[20px] text-center text-sm">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-md border-gray-300/50 text-gray-300 
                                  hover:bg-gray-100/10 hover:border-gray-300/70 
                                  bg-gray-100/5 backdrop-blur-sm transition-all"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-xs text-gray-400">
                                  Total: <span className="text-white font-semibold">{formatPrice(item.totalPrice)}</span>
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-400 hover:text-red-300 
                                  hover:bg-red-500/10 transition-all backdrop-blur-sm rounded-md"
                                onClick={() => removeItem(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="p-4 border-t border-gray-300/20 
                  bg-gradient-to-r from-gray-100/10 via-gray-200/5 to-gray-100/10 backdrop-blur-md">
                  <div className="flex justify-between text-gray-300 mb-2">
                    <span>Subtotal</span>
                    <span className="font-semibold text-white">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 mb-4">
                    <span>Frete</span>
                    <span>Calculado no checkout</span>
                  </div>

                  <div className="flex gap-2 mb-2">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="flex-1 border-gray-300/50 text-gray-300 
                        hover:bg-gray-100/10 hover:border-gray-300/70 
                        bg-gray-100/5 backdrop-blur-sm transition-all rounded-lg"
                    >
                      Limpar
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-gray-200/90 to-gray-300/80 
                        hover:from-gray-100 hover:to-gray-200 text-gray-900 font-medium 
                        transition-all border border-gray-300/50 shadow-lg hover:shadow-xl 
                        backdrop-blur-sm rounded-lg"
                      onClick={handleCheckout}
                    >
                      Finalizar <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full text-gray-300 hover:text-white 
                      hover:bg-gray-100/10 transition-all backdrop-blur-sm rounded-lg"
                    onClick={() => toggleCart(false)}
                  >
                    Continuar comprando
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
