# Cat Wine Club deployment

The application runs on the Hostinger VPS at `/opt/catwineclub` as Compose
project `catwineclub`.

This repository owns two services:

- `web`, exposed inside Docker as `catwineclub-main-web:3000`;
- `nocodb`, exposed inside Docker as `catwineclub-nocodb:8080`.

Both services share the private `catwineclub-backend` network. They also join
the external `catwineclub-gateway` network only where the shared proxy needs to
reach them. No service here publishes host ports.

TLS, ports 80/443, and all public Caddy routes are owned by the independent
`shared-proxy` project at `/opt/shared/vps-gateway`. The former Caddy certificate
volumes remain external state and must never be deleted.

## Deploy

Prerequisites:

```bash
docker network inspect catwineclub-gateway
```

Then deploy only this application:

```bash
cd /opt/catwineclub
docker compose -f deploy/docker-compose.yml up -d --build --remove-orphans
docker compose -f deploy/docker-compose.yml ps
```

Secrets remain in `deploy/web.env` and `deploy/nocodb.env`. Persistent data is
stored in `deploy/data/auth.db` and the external
`catwineclub_nocodb_data` volume. Do not run `docker compose down -v`.

## Rollback

Check out the preceding release and rerun `docker compose up -d --build`. The
auth database and NocoDB volume remain in place. Shared routing is rolled back
separately from `/opt/shared/vps-gateway`.
