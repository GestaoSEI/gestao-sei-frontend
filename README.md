# 🎨 Gestão SEI Frontend

[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

> 💻 Interface moderna e responsiva para o controle de processos administrativos do SEI.

## 📋 Sobre o Projeto

O **Gestão SEI Frontend** oferece uma experiência intuitiva para que servidores públicos gerenciem seus processos. Com um dashboard focado em produtividade, o sistema destaca prazos críticos e facilita a tramitação de documentos.

## 🛠️ Arquitetura Técnica

A aplicação foi construída com foco em performance e tipagem forte. Para entender a estrutura de componentes, fluxo de autenticação e integração com a API, acesse:

👉 **[Documentação de Arquitetura (Frontend)](ARQUITETURA.md)**

### Visão Geral da Interface
```mermaid
graph LR
    A[Login] --> B[Dashboard]
    B --> C[Gestão de Processos]
    B --> D[Gestão de Usuários]
    B --> E[Importação de Dados]
```

## ✨ Funcionalidades Principais

- 🔐 **Autenticação Segura**: Gestão de sessão via JWT com redirecionamento automático.
- 📊 **Dashboard Inteligente**: Cards com métricas de processos abertos, concluídos e expirados.
- 🔍 **Busca em Tempo Real**: Filtros dinâmicos e busca global por palavras-chave.
- 📅 **Gestão de Prazos**: Alertas visuais coloridos baseados na proximidade do vencimento.
- 📥 **Importação de CSV**: Interface amigável para carga de dados em massa com feedback de erros.
- 📄 **Histórico Detalhado**: Visualização em linha do tempo das tramitações de cada processo.

## 🚀 Como Executar

**Pré-requisitos:** Node.js (v18+) e npm/yarn.

1. **Instalar dependências:**
   ```bash
   npm install
   ```
2. **Configurar variáveis de ambiente:**
   Crie um arquivo `.env` baseado no `.env.example` apontando para a URL do seu backend.
3. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🏗️ Estrutura do Projeto
```text
src/
├── 📁 components/  # Botões, Modais, Cards, Layout
├── 📁 pages/       # Login, Dashboard, Usuários, Histórico
├── 📁 api.ts       # Cliente Axios com Interceptores
└── 📁 types.ts     # Interfaces TypeScript
```

---
Made with ❤️ by Gilvaneide Medeiros
