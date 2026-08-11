# Catwine Club

Agent project for Catwine Club.

## Structure

- `web/` — deployable Next.js web app (group buys, events, membership, admin)
- `docker-compose.yml` — local NocoDB instance backing the app's data
- `CWC-PRD.md` — product requirements
- `DESIGN.md` — style reference (colors, type, components) used across the app

## Running locally

```bash
docker compose up -d          # start NocoDB (http://localhost:8081)
cd web
npm install
npm run setup:nocodb          # provision base/tables, writes .env.local
npm run setup:auth-db         # create the local auth session db
npm run dev
```

See `web/README.md` for full details (sign-in flow, admin access, project
structure).
