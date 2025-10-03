# 📱 Configuração do Webhook n8n para WhatsApp

## 🎯 Visão Geral
Sistema de notificações automáticas via WhatsApp usando webhooks para n8n.

## ⚙️ Configuração

### Variáveis de Ambiente (.env)
```bash
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/ezpods-whatsapp
N8N_WEBHOOK_SECRET=sua-chave-secreta-aqui
```

## 📨 Eventos

### 1. order.created - Pedido Criado
### 2. order.paid - Pagamento Confirmado  
### 3. order.shipped - Pedido Enviado

## 🔒 Segurança
Todas as requisições incluem header X-Webhook-Signature com HMAC-SHA256.

## 🧪 Teste
Use ngrok para expor localhost do n8n durante desenvolvimento.

Veja documentação completa no arquivo.
