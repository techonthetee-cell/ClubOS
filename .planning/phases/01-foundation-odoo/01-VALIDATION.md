# Phase 1: Foundation & Odoo - Validation Architecture

**Extracted from:** 01-RESEARCH.md
**Phase:** 01-foundation-odoo

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.x (recommended -- fastest for monorepo, native TypeScript) |
| Config file | None -- see Wave 0 |
| Quick run command | `pnpm turbo test --filter=@clubos/odoo-client` |
| Full suite command | `pnpm turbo test` |

## Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Odoo Docker starts, PostgreSQL healthy, JSON-RPC responds | integration | `pnpm test --filter=@clubos/odoo-client -- --run tests/integration/connection.test.ts` | No -- Wave 0 |
| FOUND-02 | Monorepo builds all packages and apps without errors | smoke | `pnpm turbo build` | No -- Wave 0 |
| FOUND-03 | Odoo client CRUD operations (search_read, create, write, unlink) | unit + integration | `pnpm test --filter=@clubos/odoo-client -- --run` | No -- Wave 0 |
| FOUND-04 | Auth flow: login with Odoo credentials, JWT session created | integration | `pnpm test --filter=dashboard -- --run tests/integration/auth.test.ts` | No -- Wave 0 |
| FOUND-05 | Subdomain resolves to correct tenant DB, queries correct database | unit + integration | `pnpm test --filter=@clubos/shared -- --run tests/tenants.test.ts` | No -- Wave 0 |
| FOUND-06 | UI components render correctly with emerald theme | unit | `pnpm test --filter=@clubos/ui -- --run` | No -- Wave 0 |

## Sampling Rate

- **Per task commit:** `pnpm turbo test --filter=[changed packages]`
- **Per wave merge:** `pnpm turbo build && pnpm turbo test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

## Wave 0 Gaps

- [ ] `packages/odoo-client/vitest.config.ts` -- test config for odoo-client
- [ ] `packages/odoo-client/tests/unit/client.test.ts` -- unit tests for CRUD methods
- [ ] `packages/odoo-client/tests/integration/connection.test.ts` -- integration test against real Odoo Docker
- [ ] `packages/shared/vitest.config.ts` -- test config for shared
- [ ] `packages/shared/tests/tenants.test.ts` -- tenant resolution tests
- [ ] `packages/ui/vitest.config.ts` -- test config for UI components
- [ ] `apps/dashboard/vitest.config.ts` -- test config for dashboard app
- [ ] Root `vitest.workspace.ts` -- Vitest workspace for monorepo
- [ ] Vitest install: `pnpm add -Dw vitest @testing-library/react @testing-library/jest-dom jsdom`
