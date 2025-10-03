# 📋 TODO - Melhorias EzPods

## 🎯 Prioridade ALTA - Implementação Imediata

### 1. ✅ Remover Botões de Teste
- [ ] Remover botão "Simular Confirmação de Pagamento" do checkout
- [ ] Remover botão "Simular Confirmação de Pagamento" do checkout_test
- [ ] Remover página `/checkout_test` completamente
- [ ] Remover endpoint `/api/payments/simulate-webhook`
- [ ] Garantir que apenas webhooks reais do GreenPag funcionem

### 2. 🗄️ Migrar Produtos para Banco de Dados PostgreSQL
**Status Atual:** Produtos vêm do OlaClick API  
**Meta:** Usar banco PostgreSQL próprio

#### Tarefas:
- [ ] Criar tabela `product_variants` para variações (cores/sabores)
  ```sql
  CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Ex: "Azul", "Morango", "500 Puffs"
    sku VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    weight_kg DECIMAL(10,3), -- Para cálculo de frete
    color_hex VARCHAR(7), -- Ex: "#FF0000" para cores
    flavor VARCHAR(100), -- Para sabores
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] Criar tabela `product_variant_images` para imagens de variações
  ```sql
  CREATE TABLE product_variant_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
  );
  ```

- [ ] Atualizar API `/api/products` para buscar do PostgreSQL
- [ ] Criar migração de dados do OlaClick para PostgreSQL
- [ ] Atualizar componentes para usar variações (FlavorSelectionModal)

### 3. 📦 Sistema de Estoque por Variação
- [ ] Adicionar controle de estoque na tabela `product_variants`
- [ ] Criar API para atualizar estoque: `PUT /api/admin/products/[id]/variants/[variantId]/stock`
- [ ] Adicionar validação de estoque no checkout
- [ ] Mostrar "Fora de Estoque" quando stock = 0
- [ ] Atualizar estoque automaticamente após pagamento confirmado
- [ ] Adicionar alertas de estoque baixo no admin (< 10 unidades)

### 4. 🚚 Sistema de Cálculo de Frete

#### Configurações:
- **Endereço do Estoque:** Avenida Fagundes de Oliveira 519, Piraporinha, São Paulo
- **Preço por KM:** R$ 1,70
- **Frete Grátis:** Pedidos acima de R$ 300,00
- **API:** OpenStreetMap (OSRM - Open Source Routing Machine)

#### Tarefas:
- [ ] Criar serviço de cálculo de frete: `lib/shipping.ts`
  - [ ] Integração com OSRM API (https://router.project-osrm.org)
  - [ ] Geocodificação de CEP usando Nominatim API
  - [ ] Cálculo de distância e tempo estimado
  - [ ] Aplicar regra de R$ 1,70/km
  - [ ] Aplicar frete grátis acima de R$ 300

- [ ] Criar API: `POST /api/shipping/calculate`
  ```typescript
  // Request
  {
    "cep": "09900-000",
    "cart_total": 250.00
  }
  
  // Response
  {
    "distance_km": 15.5,
    "shipping_cost": 26.35,
    "estimated_time_minutes": 35,
    "free_shipping": false,
    "free_shipping_remaining": 50.00
  }
  ```

- [ ] Adicionar campo CEP no checkout
- [ ] Mostrar cálculo de frete em tempo real
- [ ] Atualizar resumo do pedido com frete
- [ ] Salvar informações de entrega no pedido

### 5. 💳 Integração Real com GreenPag
- [ ] Remover todos os códigos de simulação
- [ ] Garantir que webhook está configurado corretamente
- [ ] Adicionar logs detalhados de webhooks recebidos
- [ ] Criar tabela `orders` para salvar pedidos
  ```sql
  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_document VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    customer_cep VARCHAR(10),
    customer_address TEXT,
    shipping_distance_km DECIMAL(10,2),
    shipping_cost DECIMAL(10,2),
    shipping_time_minutes INTEGER,
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] Criar tabela `order_items` para itens do pedido
  ```sql
  CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
  );
  ```

- [ ] Salvar pedido ao criar pagamento
- [ ] Atualizar pedido quando webhook confirmar pagamento
- [ ] Enviar email de confirmação após pagamento

---

## 🎨 Prioridade MÉDIA - Melhorias de UX

### 6. 🎨 Melhorias no Admin
- [ ] Criar interface para gerenciar variações de produtos
- [ ] Adicionar upload de imagens para variações
- [ ] Criar dashboard com estatísticas de vendas
- [ ] Adicionar filtros e busca avançada de produtos
- [ ] Criar relatório de estoque
- [ ] Adicionar gestão de pedidos (visualizar, atualizar status)

### 7. 📱 Melhorias no Catálogo
- [ ] Mostrar variações disponíveis nos cards de produtos
- [ ] Adicionar filtro por disponibilidade (em estoque)
- [ ] Melhorar modal de seleção de variações
- [ ] Adicionar imagens específicas para cada variação
- [ ] Mostrar badge de "Frete Grátis" em produtos elegíveis

### 8. 🛒 Melhorias no Carrinho
- [ ] Mostrar imagem da variação selecionada
- [ ] Adicionar validação de estoque ao adicionar item
- [ ] Mostrar aviso se item ficou sem estoque
- [ ] Calcular frete automaticamente quando CEP for preenchido
- [ ] Mostrar progresso para frete grátis

### 9. 💰 Melhorias no Checkout
- [ ] Adicionar campo de endereço completo
- [ ] Validar CEP em tempo real
- [ ] Mostrar mapa com localização e rota (opcional)
- [ ] Adicionar campo de observações
- [ ] Melhorar feedback visual durante criação do pagamento
- [ ] Adicionar timer de expiração do QR Code

---

## 🔧 Prioridade BAIXA - Otimizações

### 10. ⚡ Performance
- [ ] Implementar cache de produtos (Redis ou similar)
- [ ] Otimizar queries do PostgreSQL (índices)
- [ ] Implementar paginação infinita no catálogo
- [ ] Comprimir imagens automaticamente
- [ ] Implementar lazy loading de imagens

### 11. 🔒 Segurança
- [ ] Adicionar rate limiting nas APIs
- [ ] Implementar CSRF protection
- [ ] Adicionar validação de dados mais rigorosa
- [ ] Implementar logs de auditoria
- [ ] Adicionar 2FA para admin

### 12. 📊 Analytics
- [ ] Integrar Google Analytics
- [ ] Adicionar tracking de conversão
- [ ] Criar relatório de produtos mais vendidos
- [ ] Adicionar tracking de abandono de carrinho
- [ ] Criar relatório de frete por região

### 13. 📧 Notificações
- [ ] Configurar envio de emails transacionais
- [ ] Email de confirmação de pedido
- [ ] Email de atualização de status
- [ ] Email de produto entregue
- [ ] Notificações push (opcional)

### 14. 🎁 Funcionalidades Extras
- [ ] Sistema de cupons de desconto
- [ ] Programa de fidelidade
- [ ] Avaliações de produtos
- [ ] Wishlist / Favoritos
- [ ] Histórico de pedidos do cliente
- [ ] Rastreamento de entrega

---

## 📝 Notas Técnicas

### APIs Externas Necessárias:
1. **OSRM (Routing):** https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}
2. **Nominatim (Geocoding):** https://nominatim.openstreetmap.org/search?postalcode={cep}&country=BR&format=json
3. **ViaCEP (Validação):** https://viacep.com.br/ws/{cep}/json/

### Estrutura de Pastas Sugerida:
```
lib/
  ├── shipping/
  │   ├── osrm.ts          # Integração OSRM
  │   ├── geocoding.ts     # Geocodificação
  │   ├── calculator.ts    # Cálculo de frete
  │   └── types.ts         # Tipos TypeScript
  ├── orders/
  │   ├── create.ts        # Criar pedido
  │   ├── update.ts        # Atualizar pedido
  │   └── queries.ts       # Queries de pedidos
  └── products/
      ├── variants.ts      # Gestão de variações
      └── stock.ts         # Gestão de estoque
```

### Priorização Recomendada:
1. **Semana 1:** Remover testes + Migrar produtos para PostgreSQL
2. **Semana 2:** Implementar variações + Sistema de estoque
3. **Semana 3:** Sistema de cálculo de frete
4. **Semana 4:** Integração completa com GreenPag + Pedidos
5. **Semana 5+:** Melhorias de UX e funcionalidades extras

---

## 🚀 Comandos Úteis

### Criar Migração de Banco:
```bash
# Conectar ao PostgreSQL
psql $DATABASE_URL

# Executar migrations
\i migrations/001_create_variants.sql
```

### Testar APIs:
```bash
# Calcular frete
curl -X POST http://localhost:3000/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{"cep":"09900-000","cart_total":250}'

# Buscar produtos com variações
curl http://localhost:3000/api/products?include_variants=true
```

---

**Última Atualização:** 2025-10-03  
**Versão:** 1.0  
**Status:** Em Planejamento
