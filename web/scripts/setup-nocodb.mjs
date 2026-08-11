// Provisions the NocoDB base + tables the app needs, and writes the
// resulting IDs + a long-lived API token into web/.env.local.
//
// Run against a fresh NocoDB instance (see docker-compose.yml at the repo
// root): `npm run setup:nocodb`. Safe to re-run — it looks up existing
// bases/tables by title before creating anything.

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, "..", ".env.local");

const NOCODB_URL = process.env.NOCODB_URL ?? "http://localhost:8081";
const ADMIN_EMAIL =
  process.env.NOCODB_ADMIN_EMAIL ?? "admin@catwineclub.local";
const ADMIN_PASSWORD = process.env.NOCODB_ADMIN_PASSWORD ?? "changeme123!";
const BASE_TITLE = "Cat Wine Club";
const TOKEN_DESCRIPTION = "catwineclub-app";

const TABLES = [
  {
    title: "WineListings",
    columns: [
      { column_name: "WineName", title: "WineName", uidt: "SingleLineText" },
      { column_name: "Vintage", title: "Vintage", uidt: "SingleLineText" },
      { column_name: "Description", title: "Description", uidt: "LongText" },
      { column_name: "ImageUrl", title: "ImageUrl", uidt: "URL" },
      {
        column_name: "OriginalPrice",
        title: "OriginalPrice",
        uidt: "Decimal",
      },
      {
        column_name: "DiscountedPrice",
        title: "DiscountedPrice",
        uidt: "Decimal",
      },
      {
        column_name: "QuantityAvailable",
        title: "QuantityAvailable",
        uidt: "Number",
      },
      { column_name: "PostedByEmail", title: "PostedByEmail", uidt: "Email" },
      {
        column_name: "PostedByRole",
        title: "PostedByRole",
        uidt: "SingleSelect",
        dtxp: "'admin','member'",
      },
      {
        column_name: "Status",
        title: "Status",
        uidt: "SingleSelect",
        dtxp: "'open','closed'",
      },
    ],
  },
  {
    title: "WineClaims",
    columns: [
      {
        column_name: "WineListingId",
        title: "WineListingId",
        uidt: "Number",
      },
      { column_name: "MemberEmail", title: "MemberEmail", uidt: "Email" },
      { column_name: "Quantity", title: "Quantity", uidt: "Number" },
    ],
  },
  {
    title: "Events",
    columns: [
      { column_name: "Title", title: "Title", uidt: "SingleLineText" },
      { column_name: "Description", title: "Description", uidt: "LongText" },
      { column_name: "EventDate", title: "EventDate", uidt: "DateTime" },
      { column_name: "Location", title: "Location", uidt: "SingleLineText" },
      { column_name: "Capacity", title: "Capacity", uidt: "Number" },
      {
        column_name: "CreatedByEmail",
        title: "CreatedByEmail",
        uidt: "Email",
      },
    ],
  },
  {
    title: "EventSignups",
    columns: [
      { column_name: "EventId", title: "EventId", uidt: "Number" },
      { column_name: "MemberEmail", title: "MemberEmail", uidt: "Email" },
      { column_name: "PlusOnes", title: "PlusOnes", uidt: "Number" },
    ],
  },
  {
    title: "MembershipApplications",
    columns: [
      { column_name: "Name", title: "Name", uidt: "SingleLineText" },
      { column_name: "Email", title: "Email", uidt: "Email" },
      { column_name: "Phone", title: "Phone", uidt: "PhoneNumber" },
      { column_name: "HowHeard", title: "HowHeard", uidt: "SingleLineText" },
      { column_name: "Message", title: "Message", uidt: "LongText" },
      {
        column_name: "Status",
        title: "Status",
        uidt: "SingleSelect",
        dtxp: "'pending','approved','rejected'",
      },
      {
        column_name: "ReviewedByEmail",
        title: "ReviewedByEmail",
        uidt: "Email",
      },
      { column_name: "ReviewedAt", title: "ReviewedAt", uidt: "DateTime" },
    ],
  },
];

async function api(pathname, { method = "GET", token, body } = {}) {
  const res = await fetch(`${NOCODB_URL}${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "xc-auth": token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(
      `${method} ${pathname} -> ${res.status}: ${JSON.stringify(data)}`
    );
  }
  return data;
}

async function signIn() {
  const data = await api("/api/v1/auth/user/signin", {
    method: "POST",
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  return data.token;
}

async function findOrCreateBase(token) {
  const { list } = await api("/api/v1/db/meta/projects", { token });
  const existing = list.find((b) => b.title === BASE_TITLE);
  if (existing) {
    console.log(`Base "${BASE_TITLE}" already exists (${existing.id})`);
    return existing.id;
  }
  const base = await api("/api/v1/db/meta/projects", {
    method: "POST",
    token,
    body: { title: BASE_TITLE },
  });
  console.log(`Created base "${BASE_TITLE}" (${base.id})`);
  return base.id;
}

async function findOrCreateApiToken(token, baseId) {
  // NocoDB never returns a token's secret value after creation, so a
  // pre-existing token with our description is useless to us — delete and
  // recreate it rather than trying to reuse it.
  const { list } = await api(
    `/api/v1/db/meta/projects/${baseId}/api-tokens`,
    { token }
  );
  const existing = list.find((t) => t.description === TOKEN_DESCRIPTION);
  if (existing) {
    await api(
      `/api/v1/db/meta/projects/${baseId}/api-tokens/${existing.id}`,
      { method: "DELETE", token }
    );
    console.log("Removed stale API token, issuing a fresh one");
  }
  const created = await api(
    `/api/v1/db/meta/projects/${baseId}/api-tokens`,
    {
      method: "POST",
      token,
      body: { description: TOKEN_DESCRIPTION },
    }
  );
  console.log("Created API token");
  return created.token;
}

async function findOrCreateTable(token, baseId, def) {
  const { list } = await api(`/api/v1/db/meta/projects/${baseId}/tables`, {
    token,
  });
  const existing = list.find((t) => t.title === def.title);
  if (existing) {
    console.log(`Table "${def.title}" already exists (${existing.id})`);
    return existing.id;
  }
  const table = await api(`/api/v1/db/meta/projects/${baseId}/tables`, {
    method: "POST",
    token,
    body: {
      table_name: def.title,
      title: def.title,
      columns: def.columns,
    },
  });
  console.log(`Created table "${def.title}" (${table.id})`);
  return table.id;
}

function writeEnvLocal(entries) {
  const existingLines = existsSync(ENV_PATH)
    ? readFileSync(ENV_PATH, "utf8").split("\n")
    : [];
  const keys = new Set(Object.keys(entries));
  const kept = existingLines.filter((line) => {
    const key = line.split("=")[0];
    return !keys.has(key);
  });
  const newLines = Object.entries(entries).map(([k, v]) => `${k}=${v}`);
  const content = [...kept, ...newLines].filter(Boolean).join("\n") + "\n";
  writeFileSync(ENV_PATH, content);
  console.log(`\nWrote NocoDB config to ${ENV_PATH}`);
}

async function main() {
  console.log(`Provisioning NocoDB at ${NOCODB_URL} ...`);
  const jwt = await signIn();
  const baseId = await findOrCreateBase(jwt);
  const apiToken = await findOrCreateApiToken(jwt, baseId);

  const tableIds = {};
  for (const def of TABLES) {
    tableIds[def.title] = await findOrCreateTable(jwt, baseId, def);
  }

  writeEnvLocal({
    NOCODB_URL,
    NOCODB_API_TOKEN: apiToken,
    NOCODB_BASE_ID: baseId,
    NOCODB_TABLE_WINE_LISTINGS: tableIds.WineListings,
    NOCODB_TABLE_WINE_CLAIMS: tableIds.WineClaims,
    NOCODB_TABLE_EVENTS: tableIds.Events,
    NOCODB_TABLE_EVENT_SIGNUPS: tableIds.EventSignups,
    NOCODB_TABLE_MEMBERSHIP_APPLICATIONS: tableIds.MembershipApplications,
  });

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
