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
