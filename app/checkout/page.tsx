"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Clock, Copy, QrCode, ArrowLeft, Loader2 } from "lucide-react"
import Image from "next/image"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dados do cliente
  const [customerData, setCustomerData] = useState({
    name: '',
    document: '',
    email: '',
  })
  
  // Dados do pagamento
  const [paymentData, setPaymentData] = useState<any>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Carrega itens do carrinho
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        } else {
          router.push('/carrinho')
        }
      } catch (error) {
        console.error('Error loading cart:', error)
        router.push('/carrinho')
      }
    }

    loadCart()
  }, [router])

  useEffect(() => {
    // Verifica status do pagamento a cada 5 segundos
    if (step === 'payment' && paymentData?.transaction_id) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payments/status/${paymentData.transaction_id}`)
          const data = await response.json()
          
          if (data.status === 'paid') {
            setStep('success')
            // Limpa AMBOS os carrinhos após confirmação do pagamento
            localStorage.removeItem('cart')
            localStorage.removeItem('ezpods-cart')
            clearInterval(interval)
          }
        } catch (error) {
          console.error('Error checking payment status:', error)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [step, paymentData])

  // Calcula o total do carrinho
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.totalPrice || (item.price || 0) * (item.quantity || 1)
      return sum + price
    }, 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
          customer: customerData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento')
      }

      setPaymentData(data.payment)
      setStep('payment')
    } catch (error: any) {
      console.error('Error creating payment:', error)
      setError(error.message || 'Erro ao processar pagamento')
    } finally {
      setIsLoading(false)
    }
  }

  const copyPixCode = () => {
    if (paymentData?.qr_code) {
      navigator.clipboard.writeText(paymentData.qr_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <Card className="bg-gray-800/50 border-gray-600/30 max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
            <p className="text-gray-400 mb-6">
              Seu pedido foi confirmado e está sendo processado.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400"
            >
              Voltar para a loja
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md py-6 border-b border-gray-600/30 shadow-2xl">
          <div className="container mx-auto px-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setStep('form')}
                className="text-white hover:text-gray-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-white">Pagamento PIX</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-gray-800/50 border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-white text-center">Escaneie o QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="bg-white p-6 rounded-lg mx-auto w-fit">
                {paymentData?.qr_code_base64 ? (
                  <img
                    src={paymentData.qr_code_base64}
                    alt="QR Code PIX"
                    width={250}
                    height={250}
                    className="mx-auto"
                  />
                ) : (
                  <QrCode className="h-64 w-64 text-gray-400" />
                )}
              </div>

              {/* Instruções */}
              <div className="text-center space-y-2">
                <p className="text-white font-bold text-xl">
                  R$ {paymentData?.amount?.toFixed(2)}
                </p>
                <div className="flex items-center justify-center space-x-2 text-yellow-400">
                  <Clock className="h-5 w-5" />
                  <span>Aguardando pagamento...</span>
                </div>
              </div>

              {/* Código PIX Copia e Cola */}
              <div className="space-y-2">
                <Label className="text-gray-300">Ou copie o código PIX:</Label>
                <div className="flex space-x-2">
                  <Input
                    value={paymentData?.qr_code || ''}
                    readOnly
                    className="bg-gray-900 text-white border-gray-600 font-mono text-sm"
                  />
                  <Button
                    onClick={copyPixCode}
                    variant="outline"
                    className="border-gray-600"
                  >
                    {copied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Instruções de pagamento */}
              <div className="bg-gray-900/50 p-4 rounded-lg space-y-2 text-sm text-gray-300">
                <p className="font-semibold text-white">Como pagar:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha pagar via PIX</li>
                  <li>Escaneie o QR Code ou cole o código</li>
                  <li>Confirme o pagamento</li>
                </ol>
              </div>

              {/* Botão de simulação para desenvolvimento */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                  <p className="text-yellow-400 text-sm mb-3">
                    🧪 <strong>Modo Desenvolvimento:</strong> Se você já pagou e o status não atualizou, clique no botão abaixo:
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/payments/simulate-webhook', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ transaction_id: paymentData?.transaction_id })
                        })
                        const data = await response.json()
                        if (data.success) {
                          alert('✅ Pagamento simulado! Aguarde 5 segundos...')
                        }
                      } catch (error) {
                        console.error('Erro ao simular:', error)
                      }
                    }}
                    variant="outline"
                    className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    Simular Confirmação de Pagamento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <header className="bg-gradient-to-r from-black via-gray-900 to-black backdrop-blur-md py-6 border-b border-gray-600/30 shadow-2xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="text-white hover:text-gray-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Finalizar Compra</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {/* Resumo do Pedido */}
          <Card className="bg-gray-800/50 border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-white">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-gray-300">
                  <span>{item.name || item.productName} x{item.quantity || 1}</span>
                  <span>R$ {(item.totalPrice || (item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span>R$ {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Dados */}
          <Card className="bg-gray-800/50 border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-white">Seus Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Nome Completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={customerData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-900 text-white border-gray-600"
                    placeholder="João da Silva"
                  />
                </div>

                <div>
                  <Label htmlFor="document" className="text-gray-300">CPF/CNPJ</Label>
                  <Input
                    id="document"
                    name="document"
                    value={customerData.document}
                    onChange={handleInputChange}
                    required
                    className="bg-gray-900 text-white border-gray-600"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">E-mail (opcional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={customerData.email}
                    onChange={handleInputChange}
                    className="bg-gray-900 text-white border-gray-600"
                    placeholder="seu@email.com"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    'Gerar PIX'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
