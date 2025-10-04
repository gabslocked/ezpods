# 🔐 CONFIGURAÇÃO DO ADMIN

## ⚠️ IMPORTANTE: FAÇA LOGOUT E LOGIN NOVAMENTE

O campo `isAdmin` foi adicionado recentemente ao banco de dados. Se você já estava logado ANTES dessa atualização, seu token JWT não inclui essa informação.

## 📋 PASSOS PARA ACESSAR O ADMIN:

### 1. Fazer Logout
```
1. Clique no ícone de usuário (canto superior direito)
2. Clique em "Sair" ou "Logout"
3. Ou acesse: /api/auth/logout
```

### 2. Fazer Login Novamente
```
1. Acesse: /login
2. Entre com: gabrielcustodiooliveira@gmail.com
3. Use sua senha
```

### 3. Acessar Admin
```
1. Após login, acesse: /admin
2. Você será redirecionado para: /admin/dashboard
3. Verá o novo sidebar moderno com:
   - Logo no topo
   - Menu de navegação
   - Seu avatar (G) embaixo
   - Botão de logout
```

---

## 🎨 O QUE VOCÊ VERÁ (DESKTOP):

```
┌────────────────────────┐
│  [EZ] EzPods          │  ← Logo com glow
│      Admin Panel       │
├────────────────────────┤
│  🔍 Buscar...         │
├────────────────────────┤
│  📊 Dashboard      ●  │  ← Active
│  🛍️ Pedidos           │
│  📦 Produtos           │
│  📁 Categorias         │
│  👥 Usuários           │
├────────────────────────┤
│  [G] Gabriel      ⚙️  │  ← AQUI!
│      gabriel@...   🟢 │
│  🚪 Sair da Conta     │
└────────────────────────┘
```

---

## 🔧 ADICIONAR OUTROS ADMINS:

```bash
# Usar o script
DATABASE_URL="sua-url" node scripts/set-admin.js email@exemplo.com

# Ou SQL direto
UPDATE users SET is_admin = TRUE WHERE email = 'email@exemplo.com';
```

---

## ❓ TROUBLESHOOTING:

### Problema: "Ainda vejo o header normal"
**Solução:** Você está vendo a página pública. Faça login primeiro.

### Problema: "Sou redirecionado para /"
**Solução:** Seu token não tem isAdmin. Faça logout e login novamente.

### Problema: "Não vejo o avatar (G)"
**Solução:** 
1. Verifique se está em /admin/dashboard (não na home)
2. Faça logout e login novamente
3. Limpe o cache do navegador (Ctrl+Shift+R)

---

## ✅ CHECKLIST:

- [ ] Usuário está como admin no banco (is_admin = TRUE)
- [ ] Fez logout
- [ ] Fez login novamente
- [ ] Acessou /admin ou /admin/dashboard
- [ ] Vê o sidebar moderno (não o header normal)
- [ ] Vê o avatar com inicial embaixo

---

## 🎉 PRONTO!

Depois de fazer logout e login novamente, você terá acesso total ao painel admin com o novo design moderno!
