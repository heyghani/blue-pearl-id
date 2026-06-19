# Blue Pearl ID — Architecture Documentation

Complete MVP architecture for a conversion-focused international e-commerce platform.

## Documents

| # | Document | File |
|---|----------|------|
| 1 | Product Requirements Document | [01-PRD.md](./01-PRD.md) |
| 2 | System Architecture | [02-SYSTEM-ARCHITECTURE.md](./02-SYSTEM-ARCHITECTURE.md) |
| 3 | Database Schema (Prisma) | [03-DATABASE-SCHEMA.md](./03-DATABASE-SCHEMA.md) |
| 4 | Folder Structure | [04-FOLDER-STRUCTURE.md](./04-FOLDER-STRUCTURE.md) |
| 5 | API Specification | [05-API-SPECIFICATION.md](./05-API-SPECIFICATION.md) |
| 6 | UI/UX Sitemap & Design System | [06-UI-UX-SITEMAP.md](./06-UI-UX-SITEMAP.md) |
| 7 | Payment Flow Architecture | [07-PAYMENT-FLOW-ARCHITECTURE.md](./07-PAYMENT-FLOW-ARCHITECTURE.md) |
| — | **Payment setup (Midtrans / PayPal)** | [PAYMENT-SETUP.md](./PAYMENT-SETUP.md) |
| — | **Testing guide** | [TESTING.md](./TESTING.md) |
| — | **Security checklist** | [SECURITY-CHECKLIST.md](./SECURITY-CHECKLIST.md) |
| — | **Client demo script** | [DEMO-GUIDE.md](./DEMO-GUIDE.md) |
| 8 | Development Roadmap | [08-DEVELOPMENT-ROADMAP.md](./08-DEVELOPMENT-ROADMAP.md) |
| 9 | Deployment Strategy | [09-DEPLOYMENT-STRATEGY.md](./09-DEPLOYMENT-STRATEGY.md) |
| 10 | Future Scaling Plan | [10-FUTURE-SCALING-PLAN.md](./10-FUTURE-SCALING-PLAN.md) |

## Quick Reference

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Prisma · PostgreSQL (Neon) · Auth.js · Midtrans + PayPal · Resend · Vercel + Cloudflare R2

**Critical path:** Checkout → Payments → Production (Phases 6–7)

**North-star:** Payment success rate ≥ 92%, checkout completion ≥ 65%

**Business rules (confirmed):** USD-only pricing & checkout · Standard + Express worldwide shipping · No auto VAT (duties notice) · Resend on `bluepearlid.com`

## Project Status

Current repo: Next.js 16 starter with Tailwind 4. Implementation begins at **Phase 1** of the roadmap.
