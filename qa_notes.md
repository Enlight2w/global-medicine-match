# Browser QA Notes

| Flow | Evidence | Result |
|---|---|---|
| Public landing and route navigation | Desktop and mobile previews were captured for the landing page, country directory, patient pathway, and partner workspace. | Pass: layouts remain legible and navigable at the tested viewport sizes. |
| Eligible medicine intake | A browser session opened the listing dialog, entered **Metformin 500 mg** with a traceability reference and a future expiry date, then ran the eligibility screen. | Pass: the item entered the reviewer queue as **Ready**, the listing count increased, and an automated status update appeared. |
| Transfer guard | The workspace presents a disabled **Prepare transfer** control until the linked match is approved by a reviewer. | Pass: transfer stays visibly gated before reviewer approval. |
| Patient protections | The patient access page describes a verified-partner route and does not expose medicine listings or direct claims. | Pass: the public page preserves the mediated access constraint. |
| Keyboard navigation | Pressing Tab moved focus into the interactive workspace controls and brought the relevant reviewer area into view. | Pass: controls are reachable with keyboard navigation at the tested point. |
| Reviewer decision and notification | The browser approved the newly screened listing. | Pass: the listing changed from **Ready** to **Approved**, the approved-count metric updated, and a new automated status-update toast and timeline entry appeared. |

The workspace uses a transparent prototype dataset for demonstration. Production use still requires authenticated roles, persisted review records, verified integration sources, and jurisdiction-specific legal validation.

## Extension QA Notes

| Flow | Evidence | Result |
|---|---|---|
| Coverage map | The coverage screen rendered four interactive country nodes, partner locations, aggregate units, and active pathway totals. | Pass: partner coverage remains visible through the built-in route-map visualization. |
| Patient search | The finder initially returned five mediated-pathway results; searching for **Salbutamol** reduced the result set to the London respiratory pathway only. | Pass: medicine text filtering works while the interface continues to direct patients to a verified partner pathway rather than a direct claim. |
| Backend safeguards | Type checking and the Vitest suite completed after adding request validation, search sanitization, rate limiting, security headers, and payload bounds. | Pass: seven tests cover existing eligibility/review flows and the new security helpers. |
| Partner access boundary | Procedure tests confirmed the coverage map remains public while the partner dashboard rejects unauthenticated callers and accepts an authenticated partner caller. | Pass: organization-sensitive dashboard data is no longer exposed through a public procedure. |
| HTTP safeguards | A local response check confirmed content-type, frame, referrer, permissions, and cross-origin opener protections are applied. | Pass: baseline browser-security headers are present before proxy handling. |
| Partner dashboard mobile | A mobile preview was captured for the dashboard layout. | Pass: metric cards, chart, inventory cards, and donation history remain usable at the tested breakpoint. |
| Verified partner authorization | Procedure tests now distinguish unauthenticated, standard authenticated, and verified partner callers. | Pass: only a `partner` or `admin` role can retrieve organization dashboard data; regular authenticated users are denied. |

## AI, Feed, and Approval QA Notes

| Flow | Evidence | Result |
|---|---|---|
| AI compliance entry point | The AI compliance screen rendered the donation input, country-profile selection, baseline conditions, and a decision-support disclaimer. Attempting to run the protected action redirected the unauthenticated browser session to secure sign-in. | Pass: the recommendation path is gated by authentication and does not expose the AI call publicly. |
| Inventory feed workspace | Desktop rendering confirmed both event-push and scheduled-pull connection modes, credential-reference-only input, and a pending activation state. | Pass: the UI does not collect or display raw pharmacy credentials. |
| Administrator approvals | Desktop rendering confirmed the admin-only review queue, approval criteria, empty state, and audit-oriented role-boundary messaging. | Pass: onboarding decisions are surfaced as an explicit privileged workflow. |
| Scheduled feed callback | An unauthenticated POST to the inventory-sync callback returned `403`, and the server callback is configured to skip inactive or unreviewed feeds idempotently. | Pass: background-sync entry point is protected until a provider-specific transport and credentials are activated. |
| Responsive workflows | Mobile previews were captured for the AI assistant, inventory feed registry, and administrator approval queue. | Pass: the core panels stack cleanly and retain their control hierarchy at the tested breakpoint. |
| Signed inventory event endpoint | A malformed event request without the required feed secret returned `400`; secret-verification tests also reject altered or absent values. | Pass: unauthenticated or malformed payloads do not reach inventory ingestion. |
| Approval and feed authorization | Procedure tests reject standard users from inventory registration and administrator organization decisions; approval policy tests reserve the `partner` role for an explicit approval. | Pass: privileged workflow boundaries are enforced before database actions occur. |
| Event and approval policies | The final suite covers a valid active feed, inactive feed, invalid secret, duplicate event, approval role assignment, and hold/reject audit outcomes. | Pass: 19 tests complete successfully across safety, role, feed, and compliance policy paths. |
| Workflow services | In-memory end-to-end service tests now verify feed record upsert/event persistence and organization review-status, partner-role, and audit persistence behavior. | Pass: 23 tests complete successfully across the full workflow suite. |
