// Armazenamento persistente em arquivo para status de pagamentos
// Em produção, isso deve ser substituído por um banco de dados
import fs from 'fs'
import path from 'path'

interface PaymentStatus {
  transaction_id: string
  status: 'pending' | 'paid' | 'failed' | 'expired'
  amount: number
  paid_at?: string
  external_id?: string
}

// Caminho do arquivo de armazenamento
const STORE_FILE = path.join(process.cwd(), 'payment-store.json')

// Map para armazenar status dos pagamentos
const paymentStore = new Map<string, PaymentStatus>()

// Carrega dados do arquivo ao iniciar
function loadFromFile() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8')
      const payments = JSON.parse(data)
      Object.entries(payments).forEach(([key, value]) => {
        paymentStore.set(key, value as PaymentStatus)
      })
      console.log(`[PaymentStore] Loaded ${paymentStore.size} payments from file`)
    }
  } catch (error) {
    console.error('[PaymentStore] Error loading from file:', error)
  }
}

// Salva dados no arquivo
function saveToFile() {
  try {
    const data = Object.fromEntries(paymentStore.entries())
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('[PaymentStore] Error saving to file:', error)
  }
}

// Carrega dados ao iniciar
loadFromFile()

/**
 * Salva ou atualiza o status de um pagamento
 */
export function savePaymentStatus(payment: PaymentStatus): void {
  paymentStore.set(payment.transaction_id, payment)
  saveToFile() // Persiste no arquivo
  console.log(`[PaymentStore] Saved payment ${payment.transaction_id} with status: ${payment.status}`)
}

/**
 * Busca o status de um pagamento
 */
export function getPaymentStatus(transactionId: string): PaymentStatus | null {
  const payment = paymentStore.get(transactionId)
  if (payment) {
    console.log(`[PaymentStore] Found payment ${transactionId} with status: ${payment.status}`)
  } else {
    console.log(`[PaymentStore] Payment ${transactionId} not found`)
  }
  return payment || null
}

/**
 * Remove um pagamento do armazenamento
 */
export function deletePaymentStatus(transactionId: string): boolean {
  const deleted = paymentStore.delete(transactionId)
  if (deleted) {
    saveToFile() // Persiste no arquivo
    console.log(`[PaymentStore] Deleted payment ${transactionId}`)
  }
  return deleted
}

/**
 * Lista todos os pagamentos
 */
export function listAllPayments(): PaymentStatus[] {
  return Array.from(paymentStore.values())
}
