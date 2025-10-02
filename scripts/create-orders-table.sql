-- Tabela de pedidos para integração com Tuna Payment Gateway
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_link_id VARCHAR(100),
  payment_link_url TEXT,
  payment_id VARCHAR(100),
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  
  CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'paid', 'cancelled', 'failed', 'expired'))
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);

-- Comentários
COMMENT ON TABLE orders IS 'Pedidos do sistema EzPods com integração Tuna Payment Gateway';
COMMENT ON COLUMN orders.order_id IS 'ID único do pedido (formato: EZPODS-timestamp)';
COMMENT ON COLUMN orders.items IS 'Array JSON com produtos do pedido';
COMMENT ON COLUMN orders.payment_link_id IS 'ID do payment link gerado pela Tuna';
COMMENT ON COLUMN orders.payment_link_url IS 'URL do payment link para o cliente';
COMMENT ON COLUMN orders.status IS 'Status do pedido: pending, paid, cancelled, failed, expired';
