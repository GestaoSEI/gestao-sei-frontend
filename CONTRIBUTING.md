# 🤝 Guia de Contribuição — Gestão SEI Frontend

Obrigada pelo interesse em contribuir! Este guia explica como configurar o ambiente, seguir os padrões do projeto e enviar contribuições.

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Configuração do Ambiente Local](#configuração-do-ambiente-local)
- [Padrões de Código](#padrões-de-código)
- [Padrões de Commit](#padrões-de-commit)
- [Como Enviar um Pull Request](#como-enviar-um-pull-request)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

---

## Pré-requisitos

| Ferramenta | Versão mínima |
| ---------- | ------------- |
| Node.js | 20+ |
| npm | 9+ |
| Git | qualquer |

O frontend consome a API do backend — certifique-se de que ele está rodando em `http://localhost:8081` antes de iniciar o frontend. Consulte o [README do backend](https://github.com/GestaoSEI/gestao-sei-backend) para instruções.

---

## Configuração do Ambiente Local

### 1. Faça um fork e clone o repositório

```bash
git clone https://github.com/<seu-usuario>/gestao-sei-frontend.git
cd gestao-sei-frontend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

O Vite está configurado com proxy: todas as requisições para `/api` são redirecionadas automaticamente para `http://localhost:8081`, sem necessidade de configuração adicional de CORS.

---

## Padrões de Código

- **TypeScript** — tipagem explícita. Evite `any`.
- **React 19** com hooks funcionais. Sem componentes de classe.
- **Componentes** em `PascalCase`, funções auxiliares em `camelCase`.
- **Arquivos de página** ficam em `src/pages/`, componentes reutilizáveis em `src/components/`.
- **Chamadas de API** centralizadas em `src/api.ts` — não faça `fetch`/`axios` direto nos componentes.
- **Tipos globais** em `src/types.ts`.
- **CSS** via classes utilitárias definidas em `src/index.css` — siga os tokens de design existentes (variáveis `--primary`, `--line`, etc.).
- Acessibilidade: elementos interativos devem ter `aria-label` ou texto visível descritivo.

---

## Padrões de Commit

Usamos o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
<tipo>: <descrição curta em português>
```

| Tipo | Quando usar |
| ---- | ----------- |
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `refactor` | Refatoração sem mudança de comportamento |
| `style` | Ajustes visuais / CSS sem impacto em lógica |
| `test` | Adição ou correção de testes |
| `docs` | Documentação |
| `chore` | Manutenção (deps, config, build) |

**Exemplos:**

```
feat: adicionar filtro por unidade na página de processos
fix: corrigir reset de filtros ao clicar em Limpar
style: ajustar espaçamento do cabeçalho na versão mobile
chore: atualizar dependências do Vite
```

---

## Como Enviar um Pull Request

1. **Crie uma branch** a partir de `main` com nome descritivo:

   ```bash
   git checkout -b feat/nome-da-funcionalidade
   # ou
   git checkout -b fix/descricao-do-bug
   ```

2. **Implemente** as alterações seguindo os padrões acima.

3. **Verifique erros** de TypeScript e lint:

   ```bash
   npm run build
   ```

4. **Faça commit** seguindo o padrão Conventional Commits.

5. **Abra o PR** para a branch `main` do repositório original com:
   - Título claro descrevendo a mudança
   - Descrição do que foi alterado e por quê
   - Screenshot ou GIF se a mudança for visual
   - Referência à Issue relacionada (se houver): `Closes #123`

---

## Reportando Bugs

Abra uma [Issue](https://github.com/GestaoSEI/gestao-sei-frontend/issues) com:

- **Título**: descrição curta do problema
- **Comportamento esperado** vs. **comportamento atual**
- **Passos para reproduzir**
- **Ambiente**: navegador, versão do Node.js, SO

---

## Sugerindo Melhorias

Abra uma [Issue](https://github.com/GestaoSEI/gestao-sei-frontend/issues) com o label `enhancement` descrevendo:

- O problema que a melhoria resolve
- A solução proposta
- Alternativas consideradas

---

Made with ❤️ by Gilvaneide Medeiros
