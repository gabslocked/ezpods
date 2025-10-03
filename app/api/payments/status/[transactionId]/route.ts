import { NextRequest, NextResponse } from 'next/server'

// Esta é uma implementação simplificada
// Em produção, você deve consultar o banco de dados onde salvou o status do pedido
// ou fazer uma consulta à API do GreenPag se eles oferecerem esse endpoint

export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    const { transactionId } = params

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID não fornecido' },
        { status: 400 }
      )
    }

    // TODO: Consultar o banco de dados para obter o status do pagamento
    // const order = await getOrderByTransactionId(transactionId)
    
    // Por enquanto, retorna um status de exemplo
    // Em produção, isso deve vir do banco de dados atualizado pelo webhook
    return NextResponse.json({
      transaction_id: transactionId,
      status: 'pending', // pending, processing, paid, failed, expired
      message: 'Aguardando pagamento',
    })
  } catch (error: any) {
    console.error('Error checking payment status:', error)
    
    return NextResponse.json(
      { 
        error: 'Erro ao consultar status do pagamento',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
