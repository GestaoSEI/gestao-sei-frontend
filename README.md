# 🖥️ Gestão SEI Frontend

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)

> Interface web do sistema Gestão SEI para controle de prazos e tramitação de processos.

## 📋 Sobre o Projeto

O **Gestão SEI Frontend** é uma SPA (Single Page Application) construída com React 19 e TypeScript que consome a API REST do backend. Oferece uma interface completa para gerenciamento de processos administrativos do SEI, com autenticação JWT, controle de perfis e geração de relatórios em PDF.

> 💡 **Este repositório é um template.** A organização [GestaoSEI](https://github.com/GestaoSEI) foi criada para que outros servidores públicos possam utilizar este sistema como ponto de partida, adaptando-o à realidade de sua própria unidade. Sinta-se à vontade para fazer um fork e personalizar.

## ✨ Funcionalidades

### 🔐 **Autenticação**

- Login com JWT (token persistido em `localStorage`).
- Cadastro de novo usuário e reset de senha via tela de login.
- Proteção de rotas — usuário não autenticado é redirecionado para `/login`.

### 📋 **Gestão de Processos**

- Listagem completa de processos com indicadores visuais de urgência e status.
- **Busca em tempo real** por número, tipo, origem, unidade ou observação (debounce 400 ms).
- **Filtros** por status e prazo vencido.
- Cadastro e edição de processos com validação de campos (incluindo padrão `9999.9999/9999999-9`).
- Exclusão com confirmação.
- Visualização do histórico de tramitação com diff visual (antes → depois).
- **Download de relatório PDF** com os filtros ativos.

### 👥 **Gestão de Usuários** (ADMIN)

- Listagem, criação e edição de usuários.
- Exclusão de usuário (bloqueada pelo backend se houver histórico de processos).
- Redefinição de senha de qualquer usuário (sem necessidade de senha atual).

### 🔑 **Troca de Senha**

- Disponível para todos os perfis via botão no menu lateral.
- USER deve informar a senha atual; ADMIN pode trocar diretamente.

## 🏗️ Estrutura Principal

```text
src/
├── App.tsx              # AuthContext, AuthProvider, useAuth, BrowserRouter + rotas
├── api.ts               # Cliente Axios com interceptor JWT e todas as funções de API
├── types.ts             # Interfaces TypeScript (Processo, HistoricoItem, Usuario, Role)
├── index.css            # Design system: tokens, sidebar, tabelas, badges, modais
├── components/
│   ├── Layout.tsx       # Shell da aplicação: sidebar, navegação, modal de senha
│   └── ProtectedRoute.tsx # Guarda de rota por autenticação
└── pages/
    ├── LoginPage.tsx        # Login, criar conta, reset de senha
    ├── DashboardPage.tsx    # Listagem de processos, busca, filtros, PDF
    ├── ProcessoFormPage.tsx # Criar / editar processo
    ├── HistoricoPage.tsx    # Histórico de tramitação
    └── UsuariosPage.tsx     # Gestão de usuários (ADMIN)
```

## 🚀 Como Executar

**Pré-requisito:** Backend rodando em `http://localhost:8081` (ver [gestao-sei-backend](https://github.com/GestaoSEI/gestao-sei-backend)).

```bash
npm install
npm run dev
```

A aplicação sobe em [http://localhost:5173](http://localhost:5173).  
Chamadas a `/api/*` são redirecionadas ao backend pelo proxy do Vite (configurado em [vite.config.ts](vite.config.ts)).

## 📜 Scripts Disponíveis

| Script | Descrição |
| ------ | --------- |
| `npm run dev` | Servidor de desenvolvimento com hot-reload |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Serve localmente o build gerado |
| `npm run lint` | Análise estática com ESLint |

## ⚙️ Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Backend disponível em `http://localhost:8081`

## 🤝 Contribuindo

Este é um projeto **Open Source**. Leia o [Guia de Contribuição](CONTRIBUTING.md) para saber como configurar o ambiente, seguir os padrões do projeto e enviar um Pull Request.

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

---
Made with ❤️ by Gilvaneide Medeiros
