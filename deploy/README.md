# Deploy — catwineclub.tanisaac.com

Runs on a Hostinger KVM 2 VPS (`187.53.130.40`, Ubuntu 26.04, Docker) at
`/opt/catwineclub`.

## Layout

- `docker-compose.yml` — `caddy` + `web` + `nocodb`
- `Caddyfile` — TLS + proxy for `catwineclub.tanisaac.com` and `db.catwineclub.tanisaac.com`
- `web.env` / `nocodb.env` — secrets (git-ignored; see `*.example`)
- `data/auth.db` — better-auth SQLite (bind-mounted into `web`)
- `nocodb_data` volume — NocoDB SQLite + uploaded attachments

## First deploy / redeploy

```sh
cd /opt/catwineclub
git pull
docker compose -f deploy/docker-compose.yml up -d --build
docker compose -f deploy/docker-compose.yml ps
```

## Restore NocoDB data into the volume

```sh
docker compose -f deploy/docker-compose.yml stop nocodb
docker run --rm -v catwineclub_nocodb_data:/data -v /opt/catwineclub/deploy:/b \
  alpine sh -c 'rm -rf /data/* && tar xzf /b/nocodb_data.tgz -C /data'
docker compose -f deploy/docker-compose.yml start nocodb
```

## DNS

`catwineclub` and `db.catwineclub` A records under `tanisaac.com` point at the
VPS (managed via the Hostinger API).

## Notes

- Magic-link email still sends from `mail.catwine.club` (the Resend-verified
  domain). Verify `tanisaac.com` in Resend and update `EMAIL_FROM` to change it.
- The old self-hosted stack on the Mac (Cloudflare tunnel → `catwine.club`) is
  independent and untouched.
