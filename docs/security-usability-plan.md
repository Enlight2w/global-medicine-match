# Global Medicine Match — security, usability, and workflow scan

**Scan date:** 2026-10-06; final verification continued 2026-10-12  
**Scope:** restored WebDev project, public preview routes, server authorization boundaries, webhook/feed ingestion, input validation, browser security headers, dependency audit, automated tests, and responsive UX.

## Verified baseline and final state

- Existing automated suite before this pass: **23 tests passing** across 12 files.
- Final automated suite: **27 tests passing** across 12 files.
- TypeScript check: **passing**.
- Production build: **passing**. The build still emits a non-blocking bundle-size warning for the main client chunk.
- Live preview: healthy and rendering the public landing page, compliance directory, workspace, AI compliance, inventory feeds, and administrator approval screens.
- Navigation QA: added the stable `/directory` alias for the existing compliance directory, so the expected public route no longer dead-ends.
- Responsive UX smoke: desktop and mobile landing views render correctly; mobile navigation collapses to the menu control and primary CTAs remain visible.
- Dependency audit: after upgrading direct runtime dependencies and applying compatible overrides, the production audit reports **36 low/moderate advisories and zero high/critical advisories**. Remaining advisories should still be reviewed during the next dependency-refresh cycle.

## Prioritized plan

### P0 — implemented in this pass

1. **Protect operational screens at the UI boundary.** Added consistent signed-in/role-aware boundaries for partner and administrator pages, and removed internal operational links from the public navigation.
2. **Close the cookie-authenticated CSRF gap.** Added a same-origin check for state-changing `/api/trpc` requests so a cross-site browser cannot submit authenticated mutations with the user’s cookie.
3. **Harden provider endpoint registration.** Require HTTPS, reject credentials/fragments, localhost/private/link-local/metadata hosts, and keep the validation reusable for the eventual scheduled transport.
4. **Validate and rate-limit webhook events.** Enforce bounded event IDs, bounded record counts, positive quantities, valid dates/country codes, and the required string/boolean shape. Added a per-feed/IP rate limit and generic error responses.
5. **Tighten backend role/data boundaries.** Review status mutations now require a verified partner/admin role. Platform overview and feed registry reads are scoped to administrators or the requesting partner’s owned organizations.
6. **Add browser hardening headers.** Preserved the existing headers and added production HSTS, cross-origin resource policy, DNS-prefetch control, and no-store on API responses.
7. **Reduce dependency exposure.** Updated direct runtime packages and compatible transitive resolutions for Drizzle ORM, tRPC, AWS SDK, Axios, MySQL2, Nanoid, lodash, path-to-regexp, proxy-addr, and fast-xml-parser. The final build and full test suite pass.

### P1 — completed in this continuation

1. Replaced the single `lastEventId` replay guard with a durable `inventoryFeedEvents` table keyed by `(feedId, eventId)`, with claim/release/processed states and a unique constraint.
2. Added `inventoryFeedActivationAudit` persistence and an administrator-only activation control requiring a documented review reason.

### P1 — recommended next

1. Add browser-level accessibility tests for keyboard focus, modal escape/focus return, mobile navigation, and protected-route redirects.
2. Add request-level observability with redacted event/feed identifiers, latency, rejection reason, and correlation IDs; never log webhook secrets or raw patient/health data.
3. Add a data-retention/privacy control for organization documents and patient pathway requests before collecting anything beyond the current minimal fields.
4. Schedule a dependency refresh for the remaining low/moderate advisories and the deprecated Recharts 2 branch. Do not make a major chart migration without visual regression coverage.

### P2 — design and workflow suggestions

1. Keep **“Find a verified route”** as the primary patient CTA and make the distinction between availability, eligibility, and dispensing explicit in every result.
2. Add a visible progress rail for onboarding: organization identity → license evidence → country pathway → reviewer decision → partner role.
3. Replace free-text organization IDs in the feed form with a server-provided organization selector scoped to the signed-in partner.
4. Add a reviewer reason requirement for approve/hold/reject and show the exact policy checks that remain unresolved.
5. Add a “last verified” timestamp and freshness badge to coverage/search results so users do not confuse a snapshot with guaranteed stock.
6. **Implemented:** added a public legal-and-safety page, linked disclaimers, explicit no-medical-advice/no-transfer language, and an emergency-care message on the patient pathway without collecting diagnosis or prescription data.
7. Add a persistent “Report a safety or data concern” route with escalation ownership and response-time expectations.
8. **Implemented:** replaced illustrative country profiles with sourced, conditional screening requirements for the United States, United Kingdom, and Kenya, including regulator links and explicit “not legal clearance” status language.

## Files changed in this pass

- `client/src/components/AccessBoundary.tsx`
- `client/src/components/SiteNav.tsx`
- `client/src/App.tsx`
- `client/src/pages/Workspace.tsx`
- `client/src/pages/ComplianceAssistant.tsx`
- `client/src/pages/InventoryFeeds.tsx`
- `client/src/pages/AdminApprovals.tsx`
- `client/src/pages/LegalNotice.tsx`
- `client/src/index.css`
- `client/index.html`
- `client/src/pages/ComplianceDirectory.tsx`
- `client/src/pages/CoverageMapPage.tsx`
- `client/src/pages/PatientAccess.tsx`
- `client/src/pages/PartnerDashboard.tsx`
- `shared/complianceDirectory.ts`
- `docs/regulatory-sources-2026-10-12.md`
- `server/security.ts`
- `server/security.test.ts`
- `server/inventorySync.ts`
- `server/routers.ts`
- `server/db.ts`
- `server/_core/index.ts`
- `server/platform.test.ts`
- `server/feedIngestionService.test.ts`
- `drizzle/0005_motionless_namorita.sql`
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`

## Residual risk / not claimed

This scan does **not** establish legal eligibility, clinical safety, penetration-test coverage, or production readiness. Country counsel, licensed pharmacists, provider contracts, credential storage/rotation, and an independent security review remain required before operating in any jurisdiction. The directory is a sourced screening aid, not legal clearance.

The dependency audit is improved but not clean: **36 low/moderate advisories remain**. Zero high/critical findings means the current scan found no high/critical production advisory, not that the application is invulnerable.
