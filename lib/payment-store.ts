// Armazenamento temporário em memória para status de pagamentos
// Em produção, isso deve ser substituído por um banco de dados

interface PaymentStatus {
  transaction_id: string
  status: 'pending' | 'paid' | 'failed' | 'expired'
  amount: number
  paid_at?: string
  external_id?: string
}

// Map para armazenar status dos pagamentos
const paymentStore = new Map<string, PaymentStatus>()

/**
 * Salva ou atualiza o status de um pagamento
 */
export function savePaymentStatus(payment: PaymentStatus): void {
  paymentStore.set(payment.transaction_id, payment)
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
