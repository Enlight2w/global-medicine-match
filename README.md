# KindRoute (Global Medicine Match)

KindRoute is a prototype for compliant, recipient-mediated medicine donation and access. It supports organization onboarding, eligible inventory and requests, partner discovery, matching, compliance guidance, and reviewer workflows.

## Safety and integration limits

KindRoute is not a medical provider and does not give clinical advice. Eligibility, organization verification, country requirements, and fulfillment need qualified human review. Medicine is not transferred directly to patients through this prototype. A specific pharmacy transport is not active until its provider contract and credentials are configured and reviewed.

## Development

Use Node.js and the pnpm version declared in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm check
pnpm build
```

To start the development server on macOS or Linux, run `pnpm dev`. In Windows PowerShell, set the environment variable explicitly:

```powershell
$env:NODE_ENV = "development"
pnpm exec tsx watch server/_core/index.ts
```

Configure required server variables locally before connecting the database, authentication, or partner integrations. Never commit credentials or patient data.
