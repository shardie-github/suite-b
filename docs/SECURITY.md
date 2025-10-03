# Security
- **API keys** header `x-api-key`. Generate via `/admin` (requires `x-admin-secret`).
- **Admin Secret**: header `x-admin-secret` must match `ADMIN_SECRET` (default `devadmin`, change it).
- **Tenants** via header `x-tenant-id` or `?tenant=`; data stored under `.data/tenants/<id>/rows.json`.
- **Encryption at rest**: set `DATA_ENC_KEY` to 64-hex bytes (AES-256-GCM). Without this, files are plaintext.
- Rate limit keyed by API key; CSP/helmet on web.
