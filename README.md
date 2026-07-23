# OUTBELLE BRASIL

E-commerce premium da sex shop OUTBELLE BRASIL, construído com Next.js 16, React 19 e Tailwind CSS 4.

## Design

- Fundo preto puro (`#000000`) — as fotos dos produtos devem ter fundo preto para integrar perfeitamente ao site
- Tipografia: Fredoka (logo) + Geist (corpo)
- Acento em rosa/dusty rose para hover e destaques

## Como rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## Estrutura

- `/` — Home com hero e produtos em destaque
- `/loja` — Catálogo completo com busca e filtro por categoria
- `/categorias` — Navegação por categoria
- `/produto/[slug]` — Página de produto
- `/contato` — Formulário de contato

## Adicionar fotos dos produtos

Coloque suas imagens em `public/products/` com fundo preto. Atualize os caminhos em `src/lib/products.ts`.

Formato recomendado: PNG ou JPG, fundo `#000000`, mínimo 800×800px.

## Próximos passos

- Integrar gateway de pagamento (Stripe, Mercado Pago, PagSeguro)
- Painel admin para gerenciar produtos
- CMS (Sanity, Contentful) ou banco de dados
- Autenticação de usuários
