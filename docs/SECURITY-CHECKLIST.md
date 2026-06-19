# Security Checklist (MVP)

Walkthrough for Blue Pearl ID before production go-live. Not a formal penetration test.

## Authentication & sessions

- [x] Passwords hashed with bcrypt (cost 12 in seed)
- [x] `AUTH_SECRET` required; sessions use JWT (Auth.js)
- [x] Admin routes guarded by middleware (`ADMIN` role only)
- [x] Account routes require login
- [ ] **Action:** Change default admin password (`admin@bluepearlid.com`)
- [ ] **Action:** Use strong `AUTH_SECRET` in Vercel (32+ random bytes)

## Authorization

- [x] Admin server actions call `requireAdmin()`
- [x] Payment webhooks verify Midtrans signature before updating orders
- [ ] PayPal webhook verification not implemented (return URL capture used instead)

## Input validation

- [x] Checkout, auth, and admin forms validated with Zod
- [x] Prisma parameterized queries (no raw SQL)
- [x] Order creation uses idempotency keys

## Secrets & environment

- [x] `.env` gitignored; `.env.example` committed without secrets
- [ ] **Action:** Confirm no secrets in Vercel logs or client bundles
- [x] Only `NEXT_PUBLIC_*` vars exposed to browser (Midtrans client key is intentional)

## Payments

- [x] Server keys (`MIDTRANS_SERVER_KEY`, `PAYPAL_CLIENT_SECRET`) server-only
- [x] Webhook signature verification (Midtrans)
- [x] Payment status updates idempotent (skip if already `CAPTURED`)
- [ ] **Action:** Register production webhook URLs on live domain
- [ ] **Action:** Run sandbox → live key rotation before real transactions

## HTTP & headers

- [x] HTTPS enforced by Vercel
- [ ] **Action:** Add security headers via `next.config.ts` or Vercel config (CSP, HSTS) before hard launch
- [ ] **Action:** Configure Cloudflare WAF when custom domain is on Cloudflare (per deployment strategy)

## Data protection

- [x] Guest checkout stores email on order, not exposed in public APIs
- [x] Order detail pages not publicly enumerable by ID (order number required)
- [ ] **Action:** Enable Neon backups / PITR for production database

## Rate limiting

- [ ] Auth and checkout rate limits documented but not fully implemented (Upstash Redis planned)
- [ ] **Action:** Add rate limiting before high-traffic launch

## Dependencies

- [ ] **Action:** Run `npm audit` periodically
- [ ] **Action:** Enable Dependabot on GitHub repo

## OWASP Top 10 (quick mapping)

| Risk | Status |
|------|--------|
| Broken access control | Admin middleware + `requireAdmin` |
| Cryptographic failures | bcrypt, HTTPS, webhook signatures |
| Injection | Prisma ORM, Zod validation |
| Insecure design | Idempotent payments/orders |
| Security misconfiguration | Review Vercel env + default credentials |
| Vulnerable components | `npm audit` |
| Auth failures | Auth.js, email verification flow |
| Data integrity failures | Payment event log, webhook verify |
| Logging failures | Vercel logs; no PII in client |
| SSRF | No user-controlled fetch URLs |

## Sign-off

| Role | Name | Date |
|------|------|------|
| Engineering | | |
| Product | | |
