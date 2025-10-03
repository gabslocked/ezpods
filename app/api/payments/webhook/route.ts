import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookSignature, parseWebhook } from '@/lib/greenpag'

export async function POST(request: NextRequest) {
  try {
    // Lê o corpo da requisição como texto
    const payload = await request.text()
    
    // Pega a assinatura do header
    const signature = request.headers.get('X-Signature') || request.headers.get('x-signature')

    if (!signature) {
      console.error('Webhook sem assinatura')
      return NextResponse.json(
        { error: 'Assinatura não fornecida' },
        { status: 401 }
      )
    }

    // Valida a assinatura do webhook
    const isValid = validateWebhookSignature(payload, signature)

    if (!isValid) {
      console.error('Assinatura inválida do webhook')
      return NextResponse.json(
        { error: 'Assinatura inválida' },
        { status: 401 }
      )
    }

    // Parse do payload
    const webhookData = parseWebhook(payload)

    console.log('Webhook recebido:', {
      event: webhookData.event,
      transaction_id: webhookData.transaction_id,
      status: webhookData.status,
      amount: webhookData.amount,
    })

    // Processa o evento
    switch (webhookData.event) {
      case 'payment.received':
        console.log(`Pagamento recebido: ${webhookData.transaction_id}`)
        // TODO: Atualizar status do pedido no banco de dados para "processando"
        // await updateOrderStatus(webhookData.external_id, 'processing')
        break

      case 'payment.confirmed':
        console.log(`Pagamento confirmado: ${webhookData.transaction_id}`)
        // TODO: Atualizar status do pedido no banco de dados para "pago"
        // await updateOrderStatus(webhookData.external_id, 'paid')
        // TODO: Enviar email de confirmação
        // await sendConfirmationEmail(webhookData.external_id)
        // TODO: Processar pedido (separar produtos, etc)
        break

      case 'payment.failed':
        console.log(`Pagamento falhou: ${webhookData.transaction_id}`)
        // TODO: Atualizar status do pedido no banco de dados para "falhou"
        // await updateOrderStatus(webhookData.external_id, 'failed')
        break

      case 'payment.expired':
        console.log(`Pagamento expirou: ${webhookData.transaction_id}`)
        // TODO: Atualizar status do pedido no banco de dados para "expirado"
        // await updateOrderStatus(webhookData.external_id, 'expired')
        break

      default:
        console.log(`Evento desconhecido: ${webhookData.event}`)
    }

    // Retorna 200 OK para confirmar recebimento
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('Erro ao processar webhook:', error)
    
    // Retorna 500 para que o GreenPag tente reenviar
    return NextResponse.json(
      { 
        error: 'Erro ao processar webhook',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Desabilita o body parser do Next.js para ler o raw body
export const config = {
  api: {
    bodyParser: false,
  },
}
