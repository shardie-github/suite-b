# Architecture
- `packages/web` — Express app; middleware helmet, CORS, rate-limit, API-key.
- `packages/datalake` — JSON store; optional AES-GCM; retention & simple queries.
- `packages/slack` — /slack/commands endpoint; manifest rewritten to tunnel URL.
- `packages/common` — API key mgmt, audit trail.
- `tools/tunnel` — localhost.run tokenless URL.
- `tools/dev` — tmux runner.
