# Catwine Club — web

Next.js app implementing the CWC PRD: group buys, event sign-ups, membership
applications, and an admin dashboard. Data lives in NocoDB; auth is
passwordless (magic link) via Better Auth.

## First-time setup

1. **Start NocoDB** (from the repo root, one level up):

   ```bash
   docker compose up -d
   ```

   This runs NocoDB on `http://localhost:8081` (port 8081, not 8080, to
   avoid clashing with other local NocoDB instances). Change the port in
   `docker-compose.yml` if 8081 is also taken.

2. **Install dependencies and provision the NocoDB schema:**

   ```bash
   npm install
   npm run setup:nocodb
   ```

   This creates the `Cat Wine Club` base, all five tables (WineListings,
   WineClaims, Events, EventSignups, MembershipApplications), and a
   long-lived API token — then writes everything to `.env.local`. Safe to
   re-run; it reuses the base/tables and only rotates the API token.

3. **Set up Better Auth's local session database:**

   ```bash
   npm run setup:auth-db
   ```

   This creates `auth.db` (gitignored), a small SQLite file used only for
   login sessions — the actual club data (wines, events, applications) all
   lives in NocoDB.

4. Copy `.env.example` to `.env.local` if you haven't already (step 2
   mostly does this for you) and fill in:
   - `BETTER_AUTH_SECRET` — any random string
     (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `ADMIN_EMAILS` — comma-separated emails that should get admin access

5. **Run the dev server:**

   ```bash
   npm run dev
   ```

## How sign-in works

There are no passwords. `/login` emails a magic link that signs you in for
a year. Without a `RESEND_API_KEY` set, the link is printed to the dev
server console instead of actually emailed — look for `[dev magic link]` in
the terminal running `npm run dev`.

Membership is separate from login: anyone can sign in, but claiming wines
or signing up for events requires an **approved** membership application
(`/apply` → an admin approves it at `/admin`). Admin access itself is a
fixed allowlist via the `ADMIN_EMAILS` env var, not a role stored per-user.

## Project structure

- `src/lib/nocodb.ts` — thin REST client for NocoDB's records API
- `src/lib/data/*.ts` — typed data-access functions per resource
- `src/lib/auth.ts` / `src/lib/auth-client.ts` — Better Auth server/client config
- `src/lib/access.ts` — resolves a session into `{ email, isAdmin, isApproved }`
- `scripts/setup-nocodb.mjs` — provisions the NocoDB base/tables (idempotent)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com/docs)
- [NocoDB API Documentation](https://docs.nocodb.com/developer-resources/rest-apis/)
