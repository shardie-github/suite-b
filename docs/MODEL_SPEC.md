# Suite B — MODEL_SPEC v1.3

## Mission
Backend APIs/services powering TokPulse intel + finance reporting.

## Inputs
- Auth: JWT_SECRET, ENCRYPTION_KEY_32B
- DB (optional): DATABASE_URL, REDIS_URL
- Ads/Platforms: same keys as TokPulse when endpoints exposed

## Outputs
- /reports/* (finance, intel) when run in Actions

## Workflows
- finance-daily.yml, release-verify.yml, secrets-watch.yml, ops-monitor.yml

## Guardrails
- OpenAPI contract checked in; rate-limit + Helmet; /healthz and /readyz endpoints.
