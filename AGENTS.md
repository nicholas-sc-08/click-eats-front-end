# ClickEat Front-end — Project Guide

## Product and collaboration context

ClickEat is a Brazilian food delivery marketplace prototype. It borrows familiar marketplace patterns from apps such as iFood, but it must retain its own brand, name, visual language, copy, and assets. Do not reproduce iFood's logo, exact palette, or proprietary assets. This repository is the **front-end only**. Backend integration and a future monorepo are later phases; treat all seeded accounts, metrics, purchases, tracking, reviews, payments, and operational actions as demo data unless a real API is explicitly added.

The owner wants a polished, clean, professional UI and maintainable code. Keep the user informed in Portuguese, explain meaningful implementation decisions, and continue from this file when starting a new conversation. Do not commit changes automatically. When a coherent milestone is ready, recommend a commit and provide a concise message. Recommend a new feature branch when work is a distinct feature or the current branch has already been merged; ask before changing branches. Recommend a PR when a feature is reviewable and build-checked. The current working branch at the time this guide was written is `feature/clickeat-first-experience`; always confirm the actual branch and Git status before further work.

## Stack and commands

- Angular 22, standalone components, TypeScript 6, RxJS.
- Tailwind CSS 4 is configured, alongside the app's existing custom CSS. Prefer the established custom component styles for this project; do not add a UI library or assume Spartan UI is installed without checking dependencies first.
- The app is a single front-end workspace; `app.component.ts` currently coordinates role, view, cart, coupon and theme state.
- Start locally with `npm start`; production compile with `npm run build`.
- The repository includes `Dockerfile` and `docker-compose.yml`; check their current contents before changing container workflows.
- No backend is connected. Services that persist demo interactions use browser `localStorage` and should be replaced/adapted when APIs are introduced.

## Existing structure and features

- `src/app/app.component.ts`: application shell, role switching (customer/store/courier/admin), customer navigation, cart and coupon totals, saved light/dark theme, and global notifications.
- `src/app/features/customer/`: restaurant discovery/catalog, product detail, checkout/payment demo, profile/orders/coupons, and order tracking.
- `src/app/features/store/`: restaurant dashboard, product promotions and stock-limit controls, editable restaurant profile with local image previews, delivery fee settings, seeded customer reviews and replies.
- `src/app/features/admin/`: platform dashboard; `src/app/features/analytics/` includes chart panels and CRUD demo for users, restaurants and couriers, CSV export.
- `src/app/features/courier/`: courier workspace and delivery workflow demo.
- `src/app/features/reports/` and `src/app/features/delivery/`: report filters/exports and configurable delivery-fee rules.
- `src/app/shared/components/`: restaurant/product cards, notification feedback, and role-specific workspace sidebar.
- `src/app/core/`: catalog seed data, promotions, inventory limits, delivery pricing, account management, notifications, and report export services.
- `src/app/models/`: shared catalog and workspace types.
- Global CSS entry point is `src/styles.css`, importing Tailwind, `src/styles/layout.css`, then `src/styles/theme.css`.

Important current UX details:

- Customer home shows a seeded in-delivery order banner. Delivery/tracking is simulated; no live GPS or courier API exists.
- Account CRUD is available from the admin's **Lojas** workspace section. Data edits are local demo state, persisted to this browser.
- Restaurant profile data/images, inventory limits, admin account edits, and review replies are local demo state. Image uploads use local previews and storage only; there is no upload endpoint.
- Store review page has seeded sample reviews and a working local reply/filter interaction.
- Store product inventory may be unlimited or assigned a remaining quantity; exhausted limited products become unavailable in the customer catalog.
- Analytics period selectors and admin entity selectors change the demo chart presentation. These are not connected to Power BI or a live analytics source.
- Google sign-in, real payment/Pix creation, authorization, account recovery, and transactional order operations require backend/provider integration; never describe the current front-end demo as processing real purchases.

## Visual identity and UI/UX rules

### Brand

- Brand: **ClickEat**, slogan in the shell: “comida boa, sem complicação”.
- Original marketplace identity with a polished, approachable, food-forward feel. Use iFood-like interaction conventions only as general UX inspiration; preserve ClickEat's distinct look.
- Primary brand accent is deep teal/evergreen (currently around `#197768` / `#197768` family), paired with mint/soft green surfaces, warm off-white backgrounds, restrained peach/orange highlights, and charcoal ink.
- Light theme is the default. Dark theme is an opt-in preference saved under `clickeat.theme` in local storage. Its intended direction is a neutral charcoal dark mode: near-black/graphite canvas, layered charcoal surfaces, quiet gray borders, and ClickEat green reserved for brand actions and small highlights. Avoid an overall green-tinted dark palette. Keep all components legible in both themes.
- Global palette tokens currently begin in `src/styles/layout.css` (`--ink`, `--muted`, `--line`, `--paper`, `--coral`, `--soft`); dark overrides live in `src/styles/theme.css`. Note that some existing component styles use fixed colors, so inspect/refine both component CSS and global overrides when adding themed UI.

### Composition and interaction

- Customer experience uses a three-column desktop shell: left navigation, central content, right shopping cart; collapse/reflow responsively on smaller screens.
- Admin, restaurant and courier each have their own role-specific left navigation and workspaces.
- Use strong but restrained hierarchy, generous whitespace, rounded cards, subtle borders/shadows, concise Portuguese labels, and clear primary actions. Maintain visual consistency with the existing catalog and dashboard cards.
- Use inline SVG or the established icon pattern for new UI icons. Avoid adding emoji as the primary functional icon for new controls; existing seeded food/category emoji are part of the demo aesthetic.
- Provide hover, pressed, focus-visible, disabled, loading/success/error, and reduced-motion states where appropriate. Respect `prefers-reduced-motion`.
- Notifications should use the existing animated, semantic notification component/service, not browser alerts or black debug toasts.
- Forms need labels, keyboard access, sensible validation, and accessible modal/dialog semantics. Confirm destructive actions in a clear dialog.
- Prefer local, reliable assets with an explicit fallback. Do not introduce broken image URLs.

## Code quality and architecture

- Keep components focused on one screen, panel, or reusable visual unit. Add a component/service when a feature has its own cohesive state or presentation; avoid growing `AppComponent` or role dashboards into catch-all files.
- Follow the existing Angular standalone-component style and use signals/computed state for local reactive state where suitable.
- Put shared domain types in `src/app/models/`, reusable demo/business state in `src/app/core/`, page-level UI in `src/app/features/`, and reusable UI in `src/app/shared/`.
- Keep templates readable. Some legacy screens use long inline templates; avoid extending that pattern for substantial new features. Extract repeated or complicated markup into focused components and use separate CSS files when styles grow.
- Keep demo data explicit and easy to replace with API-backed data later. Avoid coupling components directly to `localStorage`; use a service and handle unavailable/quota-failed storage gracefully.
- Do not add dependencies without a clear need. Check `package.json` and existing implementation first.
- Avoid touching unrelated changes. Before edits, inspect `git status`, current branch, and relevant component/service styles; preserve existing uncommitted user work.

## Verification and Git workflow

- The project owner has asked for testing/verification. For implementation changes, run `npm run build` and inspect the affected UI in the local browser when the app is available. Exercise relevant interactions (theme toggle, navigation, forms, filters, cart/stock) rather than relying only on compilation.
- `git diff --check` is useful for whitespace checks. Do not commit on the owner's behalf.
- When ready, tell the owner explicitly that a commit is worthwhile and propose a specific conventional commit message, for example `feat: improve restaurant and admin dashboards`.
- Recommend a PR after the feature is coherent, build-checked, and on the intended feature branch. The owner decides and performs the commit/PR unless they explicitly ask otherwise.
- Kubernetes is not part of the current front-end task. Revisit it only when backend/deployment architecture is in scope; avoid introducing orchestration just for this UI-only project.

