"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Loader2 } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export default function CarrinhoPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Load cart from localStorage
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        }
      } catch (error) {
        console.error('Error loading cart:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }

    const updatedCart = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    try {
      setError("")
      setIsProcessing(true)
      
      // Validações
      if (!customerName.trim()) {
        setError("Por favor, informe seu nome")
        return
      }
      
      if (!customerPhone.trim()) {
        setError("Por favor, informe seu telefone")
        return
      }
      
      // Validar formato do telefone (básico)
      const phoneDigits = customerPhone.replace(/\D/g, '')
      if (phoneDigits.length < 10) {
        setError("Telefone inválido. Use o formato (11) 99999-9999")
        return
      }
      
      console.log('Creating payment link...')
      
      // Criar payment link
      const response = await fetch('/api/checkout/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems,
          customerName,
          customerPhone,
          customerEmail: customerEmail || undefined,
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pedido')
      }
      
      if (data.success) {
        console.log('Payment link created:', data.orderId)
        
        // Limpar carrinho
        localStorage.removeItem('cart')
        setCartItems([])
        
        // Abrir WhatsApp em nova aba
        window.open(data.whatsappURL, '_blank')
        
        // Mostrar mensagem de sucesso
        alert(`✅ Pedido ${data.orderId} criado com sucesso!\n\nAbrimos o WhatsApp com o link de pagamento.\n\nSe não abriu automaticamente, copie este link:\n${data.paymentLink}`)
        
        // Redirecionar para home após 2 segundos
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (error) {
      console.error('Erro no checkout:', error)
      setError(error instanceof Error ? error.message : 'Erro ao processar pedido. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando carrinho...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md py-6 border-b border-gray-600/30 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/')}
                className="text-white hover:text-gray-300 transition-all duration-300 hover:bg-gray-800/50 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-2 rounded-full">
                  <ShoppingCart className="h-6 w-6 text-green-400" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Meu Carrinho
                </h1>
              </div>
            </div>
            <div className="text-white">
              <span className="text-sm text-gray-400">Total de itens: </span>
              <span className="font-bold">{cartItems.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-12 max-w-md mx-auto">
              <ShoppingCart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Carrinho Vazio</h2>
              <p className="text-gray-400 mb-6">
                Você ainda não adicionou nenhum produto ao carrinho
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-gray-800/50 border-gray-600/30">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        <p className="text-green-400 font-bold">
                          R$ {item.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 border-gray-600"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-white font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 border-gray-600"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="text-white font-bold">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary & Customer Info */}
            <div className="lg:col-span-1 space-y-4">
              {/* Dados do Cliente */}
              <Card className="bg-gray-800/50 border-gray-600/30">
                <CardHeader>
                  <CardTitle className="text-white">Seus Dados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">
                      Nome Completo *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="João Silva"
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">
                      Telefone (WhatsApp) *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      Email (opcional)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="joao@email.com"
                      className="mt-1 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-3 py-2 rounded text-sm">
                      {error}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Resumo do Pedido */}
              <Card className="bg-gray-800/50 border-gray-600/30 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>R$ {calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Frete</span>
                      <span className="text-green-400">Grátis</span>
                    </div>
                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total</span>
                        <span>R$ {calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Pagar via WhatsApp'
                    )}
                  </Button>
                  
                  <p className="text-xs text-gray-400 text-center">
                    Você será redirecionado para o WhatsApp com o link de pagamento
                  </p>

                  <Button
                    variant="outline"
                    onClick={() => router.push('/')}
                    disabled={isProcessing}
                    className="w-full border-gray-600 text-white hover:bg-gray-700"
                  >
                    Continuar Comprando
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
