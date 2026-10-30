# ClickEat

ClickEat é um protótipo de front-end para uma plataforma de delivery com interfaces para clientes, restaurantes, entregadores e administração.

## Stack inicial

- Angular standalone + TypeScript
- Tailwind CSS v4 disponível para utilitários; componentes do protótipo usam CSS próprio
- Docker para servir a build estática de produção

## Rodar localmente

```bash
npm install
npm start
```

A interface atual usa dados fictícios e estado local. Login Google, checkout, sincronização de pedidos, avaliações e métricas ainda precisam de um backend e credenciais reais.

## Interfaces incluídas

- Cliente: início, busca e filtros, seis lojas com cardápios demonstrativos, sacola, cupons, pedidos, perfil, login, recuperação de conta e avaliações
- Restaurante: resumo de vendas e pedidos para aceitar/preparar
- Entregador: ganhos, entregas e rota simulada
- Admin: indicadores, gráficos de operação, categorias e lojas

Use o seletor de perfil no topo para alternar entre as quatro experiências de demonstração.

## Plano de evolução sugerido

1. **Fundação e identidade:** fechar linguagem visual, acessibilidade, navegação Angular e componentes compartilhados. O protótipo está nesta etapa.
2. **Experiência do cliente:** catálogo e detalhe do restaurante, carrinho persistente, endereço, checkout demonstrativo, histórico e avaliações.
3. **Áreas de operação:** autenticação por papel, gestão de cardápio e pedidos para lojas, fluxo de entrega para entregadores.
4. **Admin e dados:** definir métricas, filtros, permissões e origem dos dados. Embutir Power BI somente com estratégia de identidade e licenciamento apropriada; no protótipo o painel é uma visão visual fictícia.
5. **Integrações e segurança:** API, OAuth Google, pagamentos, notificações, validação no servidor, tratamento de dados pessoais e testes.
6. **Entrega:** CI/CD, observabilidade e deploy. Avaliar monorepo quando front e backend forem realmente mantidos juntos.

### Angular, Spartan e Tailwind

Angular é uma boa escolha para este projeto pela estrutura de módulos, roteamento e recursos de formulários. Spartan UI é uma opção Angular alinhada ao ecossistema Nx; vale adotá-la quando definirmos o workspace Nx e os primeiros componentes. Tailwind já está preparado no projeto, e os estilos desta primeira tela foram escritos diretamente para permitir uma direção visual própria.

### Docker e Kubernetes

Docker faz sentido desde já para padronizar build e servir os arquivos estáticos. Kubernetes não é necessário no começo: adiciona operação, custo e manutenção antes de haver carga ou infraestrutura que justifique. Podemos reavaliar quando houver backend, deploy contínuo e requisitos claros de escala/disponibilidade.

## Fluxo de Git sugerido

- Trabalhar em branches curtas com prefixo `feature/`, `fix/` ou `chore/`.
- Commits pequenos no formato `feat: ...`, `fix: ...` ou `chore: ...`.
- Abrir PR quando a etapa estiver revisável: escopo fechado, interface navegável e build validada. Para este primeiro incremento, sugestão: `feat: create ClickEat delivery experience prototype`.
- Próxima branch sugerida: `feature/customer-order-flow`, após revisar esta base.

## Organização da interface

- `app.component.ts` compõe o shell, navegação por perfil e fluxo de sacola.
- `features/customer/catalog/` concentra a descoberta de lojas, filtros, dados de demonstração e cardápios.
- `features/customer/customer-account.component.ts` reúne cupons, pedidos, avaliações, autenticação e perfil.
- `features/admin/`, `features/store/` e `features/courier/` isolam os painéis de cada perfil.
- `shared/components/` contém cartões reutilizáveis de loja e produto e o componente de avisos.
- `core/notifications/` concentra o serviço e os tipos dos avisos (`success`, `info`, `warning`, `error`).
- `styles/layout.css` contém o vocabulário visual compartilhado; os componentes mantêm arquivos de estilo próprios quando o comportamento visual é específico.

As interações usam animações curtas de pressionar, foco, favorito e entrada do aviso. O aviso fica no rodapé para confirmar ações sem bloquear a navegação; erro e atenção recebem cores e papéis acessíveis distintos. A preferência `prefers-reduced-motion` reduz as animações.
