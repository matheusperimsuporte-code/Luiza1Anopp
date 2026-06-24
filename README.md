# 🎀 Festa da Luísa — 1 Aninho

Site de aniversário com lista de presentes via PIX, confirmação de presença e painel administrativo.

## 📁 Estrutura de pastas

```
luisa-festa/
├── index.html              ← Página pública dos convidados
├── css/
│   ├── style.css           ← Estilos principais
│   └── variables.css       ← Tokens de cores
├── js/
│   └── data.js             ← Camada de dados (localStorage)
├── images/
│   ├── banner/
│   │   └── hero.png        ← Foto/imagem principal do hero (coloque aqui)
│   └── gifts/
│       └── (coloque aqui as fotos dos presentes)
└── admin/
    ├── index.html          ← Painel administrativo (login + gestão)
    └── admin.css           ← Estilos do painel
```

## 🚀 Como usar

### 1. Subir no GitHub Pages
1. Faça upload de todos os arquivos no repositório
2. Em **Settings → Pages**, selecione a branch `main` e pasta `/root`
3. Acesse `https://seu-usuario.github.io/luisa-festa/`

### 2. Primeiro acesso ao painel admin
- Acesse: `https://seu-usuario.github.io/luisa-festa/admin/`
- **Usuário padrão:** `admin`
- **Senha padrão:** `luisa2025`
- ⚠️ **Troque a senha** imediatamente em **Configurações → Acesso Admin**

### 3. Configurar o PIX
No painel admin → **Configurações**:
- Selecione o tipo de chave (celular, CPF, e-mail...)
- Cole sua chave PIX
- Informe o nome do recebedor

### 4. Adicionar imagens
- **Foto principal:** coloque `hero.png` em `images/banner/`
- **Fotos dos presentes:** ao editar um presente no painel, faça upload da imagem

## 🛠️ Funcionalidades

### Página pública (`index.html`)
- ✅ Hero personalizado com nome, data, horário e local
- ✅ Lista de presentes com fotos ou emojis
- ✅ Fluxo de escolha de presente → exibe chave PIX → confirma
- ✅ Confirmação de presença com nome, telefone e restrições
- ✅ Lista pública de quem confirmou

### Painel Admin (`admin/`)
- 🔐 Login com usuário e senha
- 📊 Dashboard com estatísticas em tempo real
- 🎁 CRUD completo de presentes (adicionar, editar, excluir, upload de imagem)
- 👥 Lista de convidados confirmados com opção de remover
- ⚙️ Configurações: dados da festa, PIX, credenciais de acesso

## ⚠️ Observações

- Os dados ficam no **localStorage** do navegador de cada visitante.  
  Isso é adequado para uso pessoal/festas pequenas.  
  Para sincronização entre dispositivos, conecte um backend (Firebase, Supabase etc.).
- O painel admin usa **sessionStorage** para manter o login ativo na aba.
- As imagens de presentes são convertidas para Base64 e salvas no localStorage.

## 💜 Créditos

Desenvolvido com carinho para celebrar o 1º aninho da Luísa! 🎂🦋
