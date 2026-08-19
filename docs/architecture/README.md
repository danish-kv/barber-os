# Architecture Documentation

Phase 2 output: audit of Demo V1 and the production blueprint.

**Baseline (frozen):** git tag `demo-v1` = commit `59aa115`, deployed at
barber-os-lemon.vercel.app.

**Baseline verification commands:**

```bash
npm run lint          # 0 problems
npm run typecheck     # clean
npm run build         # 78 static pages
npm test              # data-layer smoke (seed, availability, queue, metrics)
npx tsx scripts/storyline-test.mts   # 23-assertion cross-role storyline (flows A–H)
```

## Documents

| Doc | Contents |
|---|---|
| [PRODUCTION_ARCHITECTURE.md](./PRODUCTION_ARCHITECTURE.md) | audit of the demo, options compared, recommended stack (TS modular monolith), monorepo layout, deployment topology, scale staging |
| [DOMAIN_MODEL.md](./DOMAIN_MODEL.md) | entities derived from demo usage, ER diagrams, ledgers, financial vocabulary, invariants + enforcement points |
| [API_DESIGN.md](./API_DESIGN.md) | conventions, family→demo-action map, critical contracts (availability, booking, queue, checkout, payments, leave, PO, dashboard), server-authoritative list |
| [REALTIME_AND_EVENTS.md](./REALTIME_AND_EVENTS.md) | SSE decision, event catalog, outbox, transactional-vs-async split, sequence diagrams, job inventory |
| [SECURITY_AND_TENANCY.md](./SECURITY_AND_TENANCY.md) | identity/membership model, auth, RBAC matrix, 3-layer tenant isolation, PII per persona, audit, impersonation, app-sec checklist |
| [DEMO_TO_PRODUCTION_MIGRATION.md](./DEMO_TO_PRODUCTION_MIGRATION.md) | data-access seam, client vs server state, cache/optimism rules, phase mechanics, how `/demo` survives |
| [PRODUCTION_ROADMAP.md](./PRODUCTION_ROADMAP.md) | phases 0–13 with exit tests, MVP boundary, dependency graph, risks, marketplace design-now/defer split |
