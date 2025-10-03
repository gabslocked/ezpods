# Configuração GreenPag - Gateway de Pagamento PIX

## Credenciais da API

As credenciais abaixo devem ser configuradas como variáveis de ambiente no seu servidor de produção (Railway, Vercel, etc).

### Variáveis de Ambiente Obrigatórias

```bash
# GreenPag API Keys
GREENPAG_PUBLIC_KEY=pk_9f2fbb4446976d80f551208a8fa77becdbcc85febd60bd60
GREENPAG_SECRET_KEY=sk_a05efa4eda0ab48f4512c775dc37b7509bf18fa67b1196d124a196c38aa9a5ec

# URL do Site (para webhooks)
NEXT_PUBLIC_SITE_URL=https://ezpods.vercel.app
```

## Como Configurar

### Railway
1. Acesse o projeto no Railway
2. Vá em **Variables**
3. Adicione cada variável acima
4. Faça redeploy do projeto

### Vercel
1. Acesse o projeto no Vercel
2. Vá em **Settings > Environment Variables**
3. Adicione cada variável acima
4. Faça redeploy do projeto

## Documentação da API GreenPag

- **URL Base:** `https://greenpag.com/api/v1`
- **Documentação:** Fornecida pelo GreenPag
- **Rate Limit:** 25.000 requisições/hora
- **Payload Máximo:** 1MB

## Endpoints Implementados

### 1. Criar Pagamento PIX
- **Endpoint:** `POST /api/payments/create`
- **Descrição:** Gera um QR Code PIX para pagamento
- **Resposta:** QR Code, código PIX copia e cola, valor, etc.

### 2. Webhook de Notificações
- **Endpoint:** `POST /api/payments/webhook`
- **Descrição:** Recebe notificações do GreenPag quando o pagamento é confirmado
- **Segurança:** Validação HMAC-SHA256 com Secret Key

### 3. Consultar Status
- **Endpoint:** `GET /api/payments/status/[transactionId]`
- **Descrição:** Consulta o status de um pagamento
- **Uso:** Polling a cada 5 segundos na página de checkout

## Fluxo de Pagamento

1. **Cliente adiciona produtos ao carrinho**
2. **Cliente clica em "Finalizar Compra"**
3. **Cliente preenche dados (Nome, CPF/CNPJ, Email)**
4. **Sistema gera QR Code PIX via GreenPag**
5. **Cliente paga via PIX**
6. **GreenPag envia webhook para `/api/payments/webhook`**
7. **Sistema confirma pagamento e atualiza status**
8. **Cliente vê confirmação na tela**

## Eventos do Webhook

- `payment.received` - Pagamento recebido e em processamento
- `payment.confirmed` - Pagamento confirmado e concluído
- `payment.failed` - Pagamento falhou
- `payment.expired` - Pagamento expirou

## Segurança

### Validação de Webhooks
Todos os webhooks são validados usando HMAC-SHA256:

```typescript
const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(payload)
  .digest('hex')
```

### Validação de CPF/CNPJ
O sistema valida automaticamente CPF e CNPJ antes de criar o pagamento.

## Próximos Passos (TODO)

- [ ] Implementar salvamento de pedidos no banco de dados PostgreSQL
- [ ] Implementar envio de email de confirmação
- [ ] Implementar painel de pedidos para o admin
- [ ] Implementar tracking de status do pedido para o cliente
- [ ] Adicionar suporte a UTM parameters para tracking de campanhas
- [ ] Implementar sistema de split de pagamento (se necessário)

## Suporte

Para questões sobre a API GreenPag, entre em contato com o suporte deles.
