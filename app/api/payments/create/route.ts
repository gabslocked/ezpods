import { NextRequest, NextResponse } from 'next/server'
import { createPayment, isValidDocument, formatDocument } from '@/lib/greenpag'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, customer, utm } = body

    // Validação dos dados
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Carrinho vazio ou inválido' },
        { status: 400 }
      )
    }

    if (!customer || !customer.name || !customer.document) {
      return NextResponse.json(
        { error: 'Dados do cliente incompletos' },
        { status: 400 }
      )
    }

    // Valida CPF/CNPJ
    if (!isValidDocument(customer.document)) {
      return NextResponse.json(
        { error: 'CPF/CNPJ inválido' },
        { status: 400 }
      )
    }

    // Calcula o total do carrinho
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.totalPrice || item.price * item.quantity)
    }, 0)

    if (totalAmount <= 0) {
      return NextResponse.json(
        { error: 'Valor total inválido' },
        { status: 400 }
      )
    }

    // Gera descrição do pedido
    const description = `Pedido EzPods - ${items.length} ${items.length === 1 ? 'item' : 'itens'}`

    // Gera ID externo único
    const externalId = `ezpods_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // URL do webhook (ajuste conforme seu domínio)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ezpods.vercel.app'
    const callbackUrl = `${siteUrl}/api/payments/webhook`

    console.log('=== CRIANDO PAGAMENTO GREENPAG ===')
    console.log('Total:', totalAmount)
    console.log('Cliente:', customer.name)
    console.log('Documento:', formatDocument(customer.document))
    console.log('Callback URL:', callbackUrl)

    // Cria o pagamento no GreenPag
    const payment = await createPayment({
      amount: totalAmount,
      description,
      customer: {
        name: customer.name,
        document: formatDocument(customer.document),
        email: customer.email,
      },
      external_id: externalId,
      callback_url: callbackUrl,
      utm: utm || undefined,
    })

    console.log('=== RESPOSTA GREENPAG ===')
    console.log('Payment response:', JSON.stringify(payment, null, 2))

    // Salva o pedido no banco de dados (opcional - você pode implementar depois)
    // await saveOrder({ externalId, items, customer, totalAmount, transactionId: payment.transaction_id })

    return NextResponse.json({
      success: true,
      payment: {
        transaction_id: payment.transaction_id,
        qr_code: payment.qr_code,
        qr_code_base64: payment.qr_code_base64,
        amount: payment.amount,
        expires_at: payment.expires_at,
        external_id: externalId,
      },
    })
  } catch (error: any) {
    console.error('Error creating payment:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao criar pagamento',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
