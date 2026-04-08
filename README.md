# Gestao SEI Frontend

Frontend da aplicação Gestao SEI, construído com React, TypeScript e Vite.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Backend da aplicação disponível em <http://localhost:8081>

## Executando localmente

```bash
npm install
npm run dev
```

O servidor de desenvolvimento sobe em <http://localhost:5173> e encaminha chamadas iniciadas por /api para o backend local configurado em [vite.config.ts](vite.config.ts).

## Scripts disponíveis

- npm run dev: inicia o servidor de desenvolvimento
- npm run build: gera o build de produção
- npm run lint: executa a análise estática com ESLint
- npm run preview: serve localmente o build gerado

## Estrutura principal

- [src/App.tsx](src/App.tsx): tela de login e criação de usuários
- [src/main.tsx](src/main.tsx): bootstrap da aplicação React
- [src/index.css](src/index.css): estilos globais da interface
- [vite.config.ts](vite.config.ts): configuração do Vite e proxy para o backend

## Integração com backend

As requisições HTTP usam o prefixo /api no frontend. Durante o desenvolvimento, esse prefixo é redirecionado para <http://localhost:8081>.

Se o backend estiver em outro endereço, ajuste o proxy em [vite.config.ts](vite.config.ts).
