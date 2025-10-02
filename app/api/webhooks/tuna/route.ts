import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { validateWebhookSignature } from '@/lib/tuna'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    console.log('=== TUNA WEBHOOK RECEIVED ===')
    
    const body = await request.json()
    console.log('Webhook payload:', body)
    
    // 1. Validar assinatura do webhook (segurança)
    const signature = request.headers.get('x-tuna-signature')
    
    // Em produção, sempre validar. Em desenvolvimento, pode ser opcional
    if (process.env.NODE_ENV === 'production') {
      if (!validateWebhookSignature(body, signature)) {
        console.error('Invalid webhook signature')
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }
    
    // 2. Extrair dados do pagamento
    const {
      paymentId,
      orderId,
      status,
      amount,
      paymentMethod,
      customerId,
      paidAt,
    } = body
    
    console.log('Payment details:', {
      paymentId,
      orderId,
      status,
      paymentMethod,
    })
    
    // 3. Verificar se o pedido existe
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE order_id = $1',
      [orderId]
    )
    
    if (orderResult.rows.length === 0) {
      console.error('Order not found:', orderId)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
    
    const order = orderResult.rows[0]
    console.log('Order found:', order.id)
    
    // 4. Atualizar status do pedido no banco
    await client.query(
      `UPDATE orders 
       SET status = $1, 
           payment_id = $2, 
           payment_method = $3,
           updated_at = NOW(),
           paid_at = $4
       WHERE order_id = $5`,
      [
        mapTunaStatusToOrderStatus(status),
        paymentId,
        paymentMethod,
        paidAt ? new Date(paidAt) : null,
        orderId
      ]
    )
    
    console.log('Order status updated to:', status)
    
    // 5. Processar baseado no status
    switch (status.toLowerCase()) {
      case 'approved':
      case 'paid':
      case 'confirmed':
        await handlePaymentApproved(client, orderId, order)
        break
        
      case 'pending':
      case 'processing':
        await handlePaymentPending(client, orderId, order)
        break
        
      case 'cancelled':
      case 'failed':
      case 'rejected':
        await handlePaymentFailed(client, orderId, order)
        break
        
      case 'expired':
        await handlePaymentExpired(client, orderId, order)
        break
    }
    
    console.log('=== TUNA WEBHOOK PROCESSED SUCCESSFULLY ===')
    
    // 6. Retornar sucesso para Tuna
    return NextResponse.json({ 
      received: true,
      orderId,
      status: 'processed'
    })
    
  } catch (error) {
    console.error('=== TUNA WEBHOOK ERROR ===')
    console.error('Error details:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

/**
 * Mapeia status da Tuna para status do pedido
 */
function mapTunaStatusToOrderStatus(tunaStatus: string): string {
  const statusMap: Record<string, string> = {
    'approved': 'paid',
    'paid': 'paid',
    'confirmed': 'paid',
    'pending': 'pending',
    'processing': 'pending',
    'cancelled': 'cancelled',
    'failed': 'failed',
    'rejected': 'failed',
    'expired': 'expired',
  }
  
  return statusMap[tunaStatus.toLowerCase()] || 'pending'
}

/**
 * Pagamento aprovado - processar pedido
 */
async function handlePaymentApproved(
  client: any,
  orderId: string,
  order: any
) {
  console.log(`[${orderId}] Payment approved - processing order`)
  
  try {
    // 1. Atualizar estoque dos produtos (se necessário)
    const items = JSON.parse(order.items)
    
    for (const item of items) {
      // Decrementar estoque
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
        [item.quantity, item.id]
      )
    }
    
    console.log(`[${orderId}] Stock updated`)
    
    // 2. Aqui você pode adicionar:
    // - Enviar email de confirmação
    // - Enviar notificação WhatsApp
    // - Criar nota fiscal
    // - Notificar sistema de logística
    
    console.log(`[${orderId}] Order processed successfully`)
  } catch (error) {
    console.error(`[${orderId}] Error processing approved payment:`, error)
  }
}

/**
 * Pagamento pendente
 */
async function handlePaymentPending(
  client: any,
  orderId: string,
  order: any
) {
  console.log(`[${orderId}] Payment pending - waiting for confirmation`)
  
  // Aqui você pode:
  // - Enviar notificação ao cliente
  // - Registrar log
}

/**
 * Pagamento falhou
 */
async function handlePaymentFailed(
  client: any,
  orderId: string,
  order: any
) {
  console.log(`[${orderId}] Payment failed`)
  
  // Aqui você pode:
  // - Notificar cliente sobre falha
  // - Oferecer novo link de pagamento
  // - Registrar motivo da falha
}

/**
 * Pagamento expirado
 */
async function handlePaymentExpired(
  client: any,
  orderId: string,
  order: any
) {
  console.log(`[${orderId}] Payment link expired`)
  
  // Aqui você pode:
  // - Notificar cliente
  // - Oferecer novo link
}
