import crypto from 'crypto'

const GREENPAG_API_URL = 'https://greenpag.com/api/v1'
const PUBLIC_KEY = process.env.GREENPAG_PUBLIC_KEY || 'pk_9f2fbb4446976d80f551208a8fa77becdbcc85febd60bd60'
const SECRET_KEY = process.env.GREENPAG_SECRET_KEY || 'sk_a05efa4eda0ab48f4512c775dc37b7509bf18fa67b1196d124a196c38aa9a5ec'

export interface GreenPagCustomer {
  name: string
  document: string
  email?: string
}

export interface GreenPagPaymentRequest {
  amount: number
  description: string
  customer: GreenPagCustomer
  external_id?: string
  callback_url?: string
  split_email?: string
  split_percentage?: string
  utm?: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_term?: string
    utm_content?: string
    src?: string
    sck?: string
  }
}

export interface GreenPagPaymentResponse {
  success: boolean
  transaction_id: string
  qr_code: string
  qr_code_base64: string
  pix_key: string
  amount: number
  expires_at: string
  status: string
}

export interface GreenPagWebhookPayload {
  event: string
  transaction_id: string
  external_id?: string
  status: string
  amount: number
  paid_at?: string
  pix_data?: {
    end2end_id: string
    receipt_url: string
  }
}

/**
 * Cria um pagamento PIX via GreenPag
 */
export async function createPayment(data: GreenPagPaymentRequest): Promise<GreenPagPaymentResponse> {
  try {
    const response = await fetch(`${GREENPAG_API_URL}/payments`, {
      method: 'POST',
      headers: {
        'X-Public-Key': PUBLIC_KEY,
        'X-Secret-Key': SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`GreenPag API Error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error creating GreenPag payment:', error)
    throw error
  }
}

/**
 * Valida a assinatura de um webhook do GreenPag usando HMAC-SHA256
 */
export function validateWebhookSignature(payload: string, signature: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(payload)
      .digest('hex')

    // Usa comparação segura contra timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )
  } catch (error) {
    console.error('Error validating webhook signature:', error)
    return false
  }
}

/**
 * Processa um webhook do GreenPag
 */
export function parseWebhook(payload: string): GreenPagWebhookPayload {
  try {
    return JSON.parse(payload)
  } catch (error) {
    console.error('Error parsing webhook payload:', error)
    throw new Error('Invalid webhook payload')
  }
}

/**
 * Formata CPF/CNPJ para envio à API
 */
export function formatDocument(document: string): string {
  return document.replace(/[^\d]/g, '')
}

/**
 * Valida se um CPF é válido
 */
export function isValidCPF(cpf: string): boolean {
  cpf = formatDocument(cpf)
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  let sum = 0
  let remainder

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.substring(10, 11))) return false

  return true
}

/**
 * Valida se um CNPJ é válido
 */
export function isValidCNPJ(cnpj: string): boolean {
  cnpj = formatDocument(cnpj)

  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false
  }

  let length = cnpj.length - 2
  let numbers = cnpj.substring(0, length)
  const digits = cnpj.substring(length)
  let sum = 0
  let pos = length - 7

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) return false

  length = length + 1
  numbers = cnpj.substring(0, length)
  sum = 0
  pos = length - 7

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) return false

  return true
}

/**
 * Valida documento (CPF ou CNPJ)
 */
export function isValidDocument(document: string): boolean {
  const cleaned = formatDocument(document)
  
  if (cleaned.length === 11) {
    return isValidCPF(cleaned)
  } else if (cleaned.length === 14) {
    return isValidCNPJ(cleaned)
  }
  
  return false
}
