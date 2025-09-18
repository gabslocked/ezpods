"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingBag, ArrowLeft, AlertTriangle, Plus, Minus } from "lucide-react"
import type { Product } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { formatPrice } from "@/lib/utils"

export default function CartPage() {
  const { items, removeItem, clearCart, updateQuantity } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-16 text-center relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-gradient-radial from-gray-400/20 via-gray-500/10 to-transparent rounded-full blur-xl"
              animate={{
                x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                scale: [0.8, 1.2, 0.8],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
              }}
            />
          ))}
        </div>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] relative z-10"></div>
      </div>
    )
  }

  const total = items.reduce((acc, item) => acc + Number(item.preco || item.price || 0) * (item.quantity || 1), 0)

  const handleCheckout = () => {
    const message = `Olá! Gostaria de comprar os seguintes produtos:\n\n${items
      .map((item) => {
        const flavorsText =
          item.flavorNames && item.flavorNames.length > 0 ? ` (Sabores: ${item.flavorNames.join(", ")})` : ""
        return `- ${item.nome || item.name || "Produto"}${flavorsText} (${item.quantity || 1}x) - ${formatPrice(Number(item.preco || item.price || 0))}`
      })
      .join("\n")}\n\nTotal: ${formatPrice(total)}`

    window.open(`https://wa.me/5511933580273?text=${encodeURIComponent(message)}`, "_blank")
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 relative">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-gradient-radial from-gray-400/20 via-gray-500/10 to-transparent rounded-full blur-xl"
              animate={{
                x: [
                  Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
                  Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
                ],
                y: [
                  Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
                  Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
                ],
                scale: [0.8, 1.2, 0.8],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
              }}
            />
          ))}
        </div>

        <h1 className="text-2xl font-medium mb-12 text-center text-white relative z-10">
          Seu <span className="text-gray-400">Carrinho</span>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-16 max-w-md mx-auto bg-gradient-to-br from-gray-100/10 via-gray-200/5 to-gray-300/10 backdrop-blur-md rounded-lg border border-gray-400/30 shadow-2xl relative z-10"
        >
          <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-gray-400/70" />
          <h2 className="text-xl font-medium text-white mb-2">Seu carrinho está vazio</h2>
          <p className="text-white/90 mt-2 mb-8 px-6">Adicione produtos ao seu carrinho para continuar.</p>
          <Button
            asChild
            className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-medium border border-gray-400/50 shadow-lg"
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2 text-gray-800" />
              Voltar para a loja
            </Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-40 h-40 bg-gradient-radial from-gray-400/20 via-gray-500/10 to-transparent rounded-full blur-2xl"
            animate={{
              x: [
                Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
                Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
              ],
              y: [
                Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
                Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
              ],
              scale: [0.6, 1.4, 0.6],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
          />
        ))}
      </div>

      <h1 className="text-2xl font-medium mb-12 text-center text-white relative z-10">
        Seu <span className="text-gray-400">Carrinho</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={`${item.id || ""}-${item.sku || ""}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CartItem product={item} onRemove={() => removeItem(item.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-8">
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300 bg-transparent backdrop-blur-sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar carrinho
            </Button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-100/10 via-gray-200/5 to-gray-300/10 backdrop-blur-md p-6 rounded-lg h-fit border border-gray-400/30 shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
          <h2 className="text-xl font-medium mb-6 text-white">Resumo do pedido</h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-white">
              <span>Subtotal</span>
              <span className="text-gray-300">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-white">
              <span>Frete</span>
              <span className="text-gray-400">Calculado no checkout</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-400/30 text-white">
              <span>Total</span>
              <span className="text-gray-300">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="bg-gray-100/5 backdrop-blur-sm border border-gray-400/20 rounded-md p-3 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Produtos para maiores de 18 anos. A entrega será feita mediante apresentação de documento.
            </p>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-medium py-6 border border-gray-400/50 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
            onClick={handleCheckout}
          >
            Finalizar compra via WhatsApp
          </Button>

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 inline mr-1" />
              Continuar comprando
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

interface CartItemProps {
  product: Product
  onRemove: () => void
}

function CartItem({ product, onRemove }: CartItemProps) {
  const { updateQuantity } = useCart()
  const firstImage = product.imagem || (product.images ? product.images.split(",")[0].trim() : "")
  const quantity = product.quantity || 1
  const cartItemId = product.cartItemId || product.id

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-6 border border-gray-400/30 rounded-xl bg-gradient-to-br from-gray-100/10 via-gray-200/5 to-gray-300/10 backdrop-blur-md hover:border-gray-400/50 transition-all duration-300 shadow-2xl hover:shadow-3xl">
      <div className="relative w-24 h-24 sm:w-20 sm:h-20 mx-auto sm:mx-0 flex-shrink-0 bg-gradient-to-br from-gray-50/20 to-gray-100/10 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-400/30">
        <Image
          src={firstImage || "/placeholder.svg?height=80&width=80"}
          alt={product.nome || product.name || "Produto"}
          fill
          className="object-contain"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80"
          }}
        />
      </div>

      <div className="flex-grow text-center sm:text-left">
        <h3 className="font-semibold text-white text-lg">{product.nome || product.name || "Produto sem nome"}</h3>
        {(product.categoria || product.categories) && (
          <p className="text-sm text-gray-300 mt-1">{product.categoria || product.categories}</p>
        )}

        {product.flavorNames && product.flavorNames.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-2">Sabores selecionados:</p>
            <div className="flex flex-wrap gap-2">
              {product.flavorNames.map((flavorName, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-gray-100/20 to-gray-200/10 backdrop-blur-sm text-gray-200 text-xs rounded-full border border-gray-400/30 shadow-sm"
                >
                  {flavorName}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center sm:justify-start mt-4">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg border-gray-400/50 text-gray-300 hover:bg-gray-100/10 hover:border-gray-400/70 bg-gray-100/5 backdrop-blur-sm transition-all"
            onClick={() => updateQuantity(cartItemId, quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4 sm:h-3 sm:w-3" />
          </Button>
          <span className="mx-4 sm:mx-3 text-white font-medium min-w-[24px] text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 sm:h-8 sm:w-8 rounded-lg border-gray-400/50 text-gray-300 hover:bg-gray-100/10 hover:border-gray-400/70 bg-gray-100/5 backdrop-blur-sm transition-all"
            onClick={() => updateQuantity(cartItemId, quantity + 1)}
          >
            <Plus className="h-4 w-4 sm:h-3 sm:w-3" />
          </Button>
        </div>
      </div>

      <div className="flex flex-row sm:flex-col justify-between sm:items-end items-center w-full sm:w-auto mt-3 sm:mt-0">
        <div className="text-right">
          {product.originalPrice && Number(product.originalPrice) > Number(product.preco || product.price || 0) && (
            <p className="text-sm text-gray-400 line-through">{formatPrice(Number(product.originalPrice))}</p>
          )}
          <p className="font-bold text-gray-300 text-lg">{formatPrice(Number(product.preco || product.price || 0))}</p>
        </div>
        <p className="text-sm text-gray-400 mx-2 sm:mx-0 sm:mb-2">
          Total:{" "}
          <span className="text-white font-semibold">
            {formatPrice(Number(product.preco || product.price || 0) * quantity)}
          </span>
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2 rounded-lg transition-all backdrop-blur-sm"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
