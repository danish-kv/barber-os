# Barbershop OS — repo-level agent notes

pnpm + Turborepo monorepo. Read `README.md` for structure/commands and
`docs/architecture/` for the production blueprint (start at its README).

- `apps/web` — Demo V1 (Next.js). Its own `AGENTS.md` has web-specific notes.
  Demo behavior is protected by `apps/web/scripts/{flow,storyline}-test.mts`;
  never weaken those assertions.
- `apps/api` — NestJS/Fastify modular monolith. Phase 0A skeleton (health
  only). Add domain modules only in the roadmap phase that implements them.
- `packages/domain` — pure TS business rules (availability, checkout math,
  queue estimation). No framework/browser/DB imports, ever. Shared by web
  (previews) and api (authoritative). Demo money is rupees; production money
  is integer paise (`amountPaise`) — see `src/money.ts`.
- `packages/contracts` — zod API contracts; server validates with them, the
  web client is generated from them.
- Branding: no product domain/brand may be hard-coded; hosts and product name
  come from env (`API_PUBLIC_URL`, `WEB_PUBLIC_URL`, `PRODUCT_NAME`).
- Quality gates before any commit: `pnpm lint && pnpm typecheck && pnpm test
  && pnpm build`.
- Frozen baseline: tag `demo-v1` — never rewrite it.
