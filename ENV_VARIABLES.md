# Variáveis de Ambiente Necessárias

Adicione estas variáveis ao seu arquivo `.env`:

```bash
# Database PostgreSQL
DATABASE_URL=postgresql://user:password@host:5432/database

# Tuna Payment Gateway
TUNA_ACCOUNT=olaclick-technologias-ltda  # Nome da sua conta na Tuna
TUNA_APP_TOKEN=your_tuna_app_token_here  # UUID obtido no console da Tuna
TUNA_API_URL=https://api.tuna.uy/api  # Use https://sandbox.tuna.uy/api para testes
TUNA_WEBHOOK_SECRET=your_webhook_secret_key

# WhatsApp Business
WHATSAPP_BUSINESS_NUMBER=5511999999999  # Número do seu WhatsApp Business

# JWT Secret (já deve existir)
JWT_SECRET=your_jwt_secret_key

# Site URL
NEXT_PUBLIC_SITE_URL=https://ezpods.vercel.app  # Ou seu domínio
```

## Como Obter as Credenciais da Tuna

1. **Criar conta na Tuna**:
   - Acesse: https://console.tuna.uy
   - Crie uma conta

2. **Obter App Token**:
   - No console da Tuna, vá em "Settings" > "API Keys" ou "Developers"
   - Copie o `App Token` (formato UUID)
   - O `Account Name` é: `olaclick-technologias-ltda`

3. **Configurar Webhook**:
   - No console, vá em "Settings" > "Webhooks"
   - Configure a URL: `https://seu-dominio.com/api/webhooks/tuna`
   - Copie o `Webhook Secret`

4. **Ambiente Sandbox (Testes)**:
   - Use `https://sandbox.tuna.uy/api` para testes
   - Use `https://sandbox-console.tuna.uy` para acessar o console de testes
   - Credenciais de teste são diferentes das de produção

## Configurar WhatsApp Business

### Opção 1: WhatsApp Business API (Oficial)
- Requer conta verificada
- Documentação: https://developers.facebook.com/docs/whatsapp

### Opção 2: Link Direto (Mais Simples)
- Não requer API
- Usa `wa.me` para abrir WhatsApp
- Já implementado no código

## Criar Tabela no Banco de Dados

Execute o script SQL:

```bash
psql $DATABASE_URL < scripts/create-orders-table.sql
```

Ou execute manualmente o conteúdo do arquivo `scripts/create-orders-table.sql`
