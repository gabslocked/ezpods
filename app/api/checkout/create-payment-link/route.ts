import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'
import { createPaymentLink, generateWhatsAppMessage, generateWhatsAppURL } from '@/lib/tuna'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface PaymentLinkRequest {
  items: CartItem[]
  customerName: string
  customerPhone: string
  customerEmail?: string
}

export async function POST(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    console.log('=== CREATE PAYMENT LINK API START ===')
    
    const body: PaymentLinkRequest = await request.json()
    console.log('Request body:', { ...body, items: body.items.length })
    
    // Validações
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Carrinho vazio' },
        { status: 400 }
      )
    }
    
    if (!body.customerName || !body.customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }
    
    // 1. Calcular total do pedido
    const totalAmount = body.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    )
    
    console.log('Total amount:', totalAmount)
    
    // 2. Criar descrição do pedido
    const description = body.items
      .map(item => `${item.quantity}x ${item.name}`)
      .join(', ')
    
    // 3. Gerar ID único do pedido
    const orderId = `EZPODS-${Date.now()}`
    console.log('Order ID:', orderId)
    
    // 4. Criar Payment Link na Tuna
    console.log('Creating Tuna payment link...')
    const tunaResponse = await createPaymentLink({
      title: `Pedido EzPods - ${orderId}`,
      description: description.substring(0, 200), // Limitar tamanho
      amount: totalAmount,
      orderId: orderId,
      expirationPeriod: 24, // 24 horas
      paymentMethods: ['PIX', 'CreditCard', 'Boleto'],
      maxInstallments: 3, // Máximo 3x no cartão
      customer: {
        name: body.customerName,
        phone: body.customerPhone,
        email: body.customerEmail,
      },
      metadata: {
        source: 'ezpods-website',
        itemCount: body.items.length,
      }
    })
    
    console.log('Tuna response:', { id: tunaResponse.id, url: tunaResponse.url })
    
    // 5. Salvar pedido no banco de dados
    console.log('Saving order to database...')
    await client.query(
      `INSERT INTO orders (
        order_id, customer_id, customer_name, customer_phone, customer_email,
        items, total_amount, payment_link_id, payment_link_url, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
      [
        orderId,
        body.customerPhone, // Usando telefone como customer_id
        body.customerName,
        body.customerPhone,
        body.customerEmail || null,
        JSON.stringify(body.items),
        totalAmount,
        tunaResponse.id,
        tunaResponse.url,
        'pending'
      ]
    )
    
    console.log('Order saved successfully')
    
    // 6. Gerar mensagem do WhatsApp
    const whatsappMessage = generateWhatsAppMessage(
      body.customerName,
      orderId,
      totalAmount,
      tunaResponse.url
    )
    
    const whatsappNumber = process.env.WHATSAPP_BUSINESS_NUMBER || '5511999999999'
    const whatsappURL = generateWhatsAppURL(whatsappNumber, whatsappMessage)
    
    console.log('=== CREATE PAYMENT LINK API SUCCESS ===')
    
    // 7. Retornar resposta
    return NextResponse.json({
      success: true,
      orderId,
      paymentLink: tunaResponse.url,
      whatsappURL,
      expiresAt: tunaResponse.expiresAt,
    })
    
  } catch (error) {
    console.error('=== CREATE PAYMENT LINK API ERROR ===')
    console.error('Error details:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao processar pagamento'
      },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

// GET - Consultar status de um pedido
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID required' },
        { status: 400 }
      )
    }
    
    const client = await pool.connect()
    
    try {
      const result = await client.query(
        'SELECT * FROM orders WHERE order_id = $1',
        [orderId]
      )
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        order: result.rows[0]
      })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
