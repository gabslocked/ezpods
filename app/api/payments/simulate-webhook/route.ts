import { NextRequest, NextResponse } from 'next/server'
import { savePaymentStatus } from '@/lib/payment-store'

// Endpoint para simular webhook em desenvolvimento
// NÃO USAR EM PRODUÇÃO!
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transaction_id } = body

    if (!transaction_id) {
      return NextResponse.json(
        { error: 'Transaction ID é obrigatório' },
        { status: 400 }
      )
    }

    console.log('🧪 [SIMULAÇÃO] Marcando pagamento como pago:', transaction_id)

    // Simula o webhook marcando o pagamento como pago
    savePaymentStatus({
      transaction_id,
      status: 'paid',
      amount: 1.00,
      paid_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Pagamento marcado como pago (simulação)',
      transaction_id,
    })
  } catch (error: any) {
    console.error('Erro ao simular webhook:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao simular webhook',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
