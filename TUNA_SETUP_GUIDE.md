# 🔧 Guia de Configuração Tuna - EzPods

## 📋 Suas Credenciais

```bash
Account ID: 43da3645-d217-4757-9dd4-4633fe4ae976
Account Name: olaclick-technologias-ltda
Console URL: console.tuna.uy/olaclick-technologias-ltda/olaclick-technologias-ltda/43da3645-d217-4757-9dd4-4633fe4ae976
Email: Ezpods1@gmail.com
Senha: Jv020506!
```

## 🔑 Passo 1: Obter App Token

Você precisa obter o **App Token** no console da Tuna:

1. Acesse: https://console.tuna.uy
2. Faça login com:
   - Email: `Ezpods1@gmail.com`
   - Senha: `Jv020506!`
3. Vá em **Settings** > **API Keys** ou **Developers**
4. Copie o **App Token** (formato UUID: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## 📝 Passo 2: Configurar .env

Adicione estas variáveis ao seu arquivo `.env`:

```bash
# ==============================================
# TUNA PAYMENT GATEWAY - CONFIGURAÇÃO EZPODS
# ==============================================

# Database PostgreSQL (já deve existir)
DATABASE_URL=postgresql://user:password@host:5432/database

# Tuna Payment Gateway
TUNA_ACCOUNT=olaclick-technologias-ltda
TUNA_APP_TOKEN=SEU_APP_TOKEN_AQUI  # Obter no console da Tuna
TUNA_API_URL=https://api.tuna.uy/api  # Produção
# TUNA_API_URL=https://sandbox.tuna.uy/api  # Sandbox para testes

# Webhook Secret (gerar no console da Tuna)
TUNA_WEBHOOK_SECRET=seu_webhook_secret_aqui

# WhatsApp Business
WHATSAPP_BUSINESS_NUMBER=5511999999999  # Seu número do WhatsApp

# JWT Secret (já deve existir)
JWT_SECRET=your_jwt_secret_key

# Site URL
NEXT_PUBLIC_SITE_URL=https://ezpods.vercel.app
```

## 🧪 Passo 3: Testar API com cURL

### 3.1 Criar Nova Sessão

```bash
curl -X POST https://api.tuna.uy/api/Token/NewSession \
  -H "Content-Type: application/json" \
  -H "x-tuna-account: olaclick-technologias-ltda" \
  -H "x-tuna-apptoken: SEU_APP_TOKEN_AQUI" \
  -d '{
    "customer": {
      "iD": "cliente-teste-123",
      "email": "cliente@teste.com"
    }
  }'
```

**Resposta esperada:**
```json
{
  "sessionId": "uuid-da-sessao",
  "code": "Success",
  "message": "Session created successfully"
}
```

### 3.2 Gerar Token de Cartão (Teste)

```bash
# Substitua SESSION_ID pelo sessionId retornado acima
curl -X POST https://api.tuna.uy/api/Token/Generate \
  -H "Content-Type: application/json" \
  -H "x-tuna-account: olaclick-technologias-ltda" \
  -H "x-tuna-apptoken: SEU_APP_TOKEN_AQUI" \
  -d '{
    "card": {
      "cardNumber": "4111111111111111",
      "cardHolderName": "TESTE SILVA",
      "expirationMonth": 12,
      "expirationYear": 2025,
      "singleUse": false,
      "cVV": "123"
    },
    "sessionId": "SESSION_ID_AQUI"
  }'
```

**Resposta esperada:**
```json
{
  "token": "token-gerado-aqui",
  "brand": "Visa",
  "validFor": 3600,
  "code": "Success",
  "message": "Token generated successfully"
}
```

### 3.3 Criar Payment Link (Principal)

```bash
curl -X POST https://api.tuna.uy/api/Payment/Link/Create \
  -H "Content-Type: application/json" \
  -H "x-tuna-account: olaclick-technologias-ltda" \
  -H "x-tuna-apptoken: SEU_APP_TOKEN_AQUI" \
  -d '{
    "title": "Pedido EzPods - TESTE-001",
    "description": "Teste de pagamento via Tuna",
    "amount": 100.00,
    "orderId": "EZPODS-TEST-001",
    "expirationPeriod": 24,
    "paymentMethods": ["PIX", "CreditCard", "Boleto"],
    "maxInstallments": 3,
    "customer": {
      "name": "Cliente Teste",
      "phone": "11999999999",
      "email": "cliente@teste.com"
    }
  }'
```

**Resposta esperada:**
```json
{
  "id": "payment-link-id",
  "url": "https://pay.tuna.uy/link/xxxxx",
  "status": "active",
  "createdAt": "2025-10-02T15:00:00Z",
  "expiresAt": "2025-10-03T15:00:00Z"
}
```

## 🔄 Passo 4: Atualizar Código (lib/tuna.ts)

O código já está configurado para usar as variáveis de ambiente corretas. Apenas certifique-se de que está usando:

```typescript
// lib/tuna.ts (já implementado)
const TUNA_API_URL = process.env.TUNA_API_URL || 'https://api.tuna.uy/api'
const TUNA_ACCOUNT = process.env.TUNA_ACCOUNT  // 'olaclick-technologias-ltda'
const TUNA_APP_TOKEN = process.env.TUNA_APP_TOKEN

// Headers corretos
headers: {
  'Content-Type': 'application/json',
  'x-tuna-account': TUNA_ACCOUNT,
  'x-tuna-apptoken': TUNA_APP_TOKEN,
}
```

## 🔧 Passo 5: Atualizar lib/tuna.ts

Preciso ajustar o código para usar os headers corretos da Tuna:

```typescript
// Trocar de:
'x-api-key': TUNA_API_KEY,
'x-app-token': TUNA_APP_TOKEN,

// Para:
'x-tuna-account': TUNA_ACCOUNT,
'x-tuna-apptoken': TUNA_APP_TOKEN,
```

## 🎯 Passo 6: Configurar Webhook

1. No console da Tuna, vá em **Settings** > **Webhooks**
2. Configure a URL:
   ```
   https://ezpods.vercel.app/api/webhooks/tuna
   ```
3. Copie o **Webhook Secret** e adicione ao `.env`

## 🗄️ Passo 7: Criar Tabela no Banco

```bash
# Execute o script SQL
psql $DATABASE_URL < scripts/create-orders-table.sql
```

Ou execute manualmente:

```sql
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

CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

## ✅ Checklist de Configuração

- [ ] Fazer login no console da Tuna
- [ ] Obter App Token
- [ ] Adicionar variáveis ao .env
- [ ] Testar API com cURL (NewSession)
- [ ] Testar criação de Payment Link
- [ ] Configurar Webhook URL
- [ ] Criar tabela orders no banco
- [ ] Atualizar lib/tuna.ts com headers corretos
- [ ] Testar fluxo completo no site

## 🚨 IMPORTANTE: Diferença de Headers

A documentação da Tuna usa:
```
x-tuna-account: nome-da-conta
x-tuna-apptoken: uuid-do-token
```

**NÃO** usa `x-api-key`! Preciso atualizar o código.

## 📞 Suporte

Se tiver problemas:
- **Tuna Support**: golive@tuna.uy
- **Console**: https://console.tuna.uy
- **Docs**: https://dev.tuna.uy

---

**Próximo passo**: Vou atualizar o código para usar os headers corretos! 🚀
