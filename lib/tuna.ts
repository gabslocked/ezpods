/**
 * Tuna Payment Gateway Integration
 * Documentação: https://dev.tuna.uy/api/
 */

export interface TunaPaymentLinkRequest {
  title: string
  description: string
  amount: number
  orderId: string
  expirationPeriod: number // em horas
  paymentMethods: string[] // ['PIX', 'CreditCard', 'Boleto', 'Bitcoin']
  maxInstallments?: number
  customer: {
    name: string
    phone: string
    email?: string
  }
  metadata?: Record<string, any>
}

export interface TunaPaymentLinkResponse {
  id: string
  url: string
  status: string
  createdAt: string
  expiresAt: string
}

export interface TunaWebhookPayload {
  paymentId: string
  orderId: string
  status: string
  amount: number
  paymentMethod: string
  customerId: string
  paidAt?: string
  metadata?: Record<string, any>
}

const TUNA_API_URL = process.env.TUNA_API_URL || 'https://sandbox.tuna.uy/api'
const TUNA_API_KEY = process.env.TUNA_API_KEY
const TUNA_APP_TOKEN = process.env.TUNA_APP_TOKEN

/**
 * Cria um Payment Link na Tuna
 */
export async function createPaymentLink(
  data: TunaPaymentLinkRequest
): Promise<TunaPaymentLinkResponse> {
  if (!TUNA_API_KEY || !TUNA_APP_TOKEN) {
    throw new Error('Tuna API credentials not configured')
  }

  try {
    const response = await fetch(`${TUNA_API_URL}/Payment/Link/Create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TUNA_API_KEY,
        'x-app-token': TUNA_APP_TOKEN,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Tuna API Error:', errorData)
      throw new Error(`Tuna API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error creating Tuna payment link:', error)
    throw error
  }
}

/**
 * Consulta status de um pagamento na Tuna
 */
export async function getPaymentStatus(paymentId: string): Promise<any> {
  if (!TUNA_API_KEY || !TUNA_APP_TOKEN) {
    throw new Error('Tuna API credentials not configured')
  }

  try {
    const response = await fetch(`${TUNA_API_URL}/Payment/${paymentId}`, {
      method: 'GET',
      headers: {
        'x-api-key': TUNA_API_KEY,
        'x-app-token': TUNA_APP_TOKEN,
      },
    })

    if (!response.ok) {
      throw new Error(`Tuna API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting payment status:', error)
    throw error
  }
}

/**
 * Valida assinatura do webhook da Tuna
 */
export function validateWebhookSignature(
  payload: any,
  signature: string | null
): boolean {
  if (!signature) return false
  
  const crypto = require('crypto')
  const secret = process.env.TUNA_WEBHOOK_SECRET || process.env.JWT_SECRET || 'fallback-secret'
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  return hash === signature
}

/**
 * Gera mensagem formatada para WhatsApp
 */
export function generateWhatsAppMessage(
  customerName: string,
  orderId: string,
  amount: number,
  paymentLink: string
): string {
  const message = 
    `Olá ${customerName}! 🎉\n\n` +
    `Seu pedido *${orderId}* foi criado com sucesso!\n` +
    `Valor total: *R$ ${amount.toFixed(2)}*\n\n` +
    `Para finalizar, clique no link abaixo e escolha sua forma de pagamento:\n` +
    `${paymentLink}\n\n` +
    `✅ PIX (instantâneo)\n` +
    `💳 Cartão de Crédito (até 3x)\n` +
    `📄 Boleto\n\n` +
    `Qualquer dúvida, estamos à disposição!\n` +
    `EzPods - Os melhores pods de SP 🚀`
  
  return encodeURIComponent(message)
}

/**
 * Gera URL do WhatsApp com mensagem pré-formatada
 */
export function generateWhatsAppURL(
  phoneNumber: string,
  message: string
): string {
  // Remove caracteres não numéricos do telefone
  const cleanPhone = phoneNumber.replace(/\D/g, '')
  
  // Adiciona código do país se não tiver
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
  
  return `https://wa.me/${fullPhone}?text=${message}`
}
