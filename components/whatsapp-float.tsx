"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/hooks/use-cart-v2"
import Image from "next/image"

export default function WhatsAppFloat() {
  const { isCartOpen } = useCart()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show the button after a short delay for better UX
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Olá vim através do site! quero comprar um pod!")
    const whatsappUrl = `https://wa.me/5511933580273?text=${message}`
    window.open(whatsappUrl, "_blank")
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleWhatsAppClick}
      className={`fixed bottom-6 z-50 transition-all duration-300 ease-in-out ${
        isCartOpen ? "right-80" : "right-6"
      } group hover:scale-110 active:scale-95`}
      aria-label="Contato via WhatsApp"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />

        <div className="relative bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-100 hover:to-gray-200 rounded-full p-4 shadow-lg transition-all duration-300 border border-gray-400/50">
          <Image
            src="/zap.png"
            alt="Zap"
            width={32}
            height={32}
            className="w-8 h-8 filter brightness-0"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full animate-ping opacity-20" />
      </div>
    </button>
  )
}
