import "server-only";

const NOCODB_URL = process.env.NOCODB_URL ?? "http://localhost:8081";
const NOCODB_API_TOKEN = process.env.NOCODB_API_TOKEN ?? "";

export const TABLES = {
  wineListings: process.env.NOCODB_TABLE_WINE_LISTINGS ?? "",
  wineClaims: process.env.NOCODB_TABLE_WINE_CLAIMS ?? "",
  events: process.env.NOCODB_TABLE_EVENTS ?? "",
  eventSignups: process.env.NOCODB_TABLE_EVENT_SIGNUPS ?? "",
  membershipApplications:
    process.env.NOCODB_TABLE_MEMBERSHIP_APPLICATIONS ?? "",
} as const;

type Query = Record<string, string | number | undefined>;

async function request<T>(
  pathname: string,
  init: RequestInit & { query?: Query } = {}
): Promise<T> {
  const { query, ...rest } = init;
  const url = new URL(`${NOCODB_URL}${pathname}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const res = await fetch(url, {
    ...rest,
    headers: {
      "xc-token": NOCODB_API_TOKEN,
      "Content-Type": "application/json",
      ...rest.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`NocoDB ${rest.method ?? "GET"} ${pathname} -> ${res.status}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function listRecords<T>(
  tableId: string,
  opts: { where?: string; sort?: string; limit?: number } = {}
): Promise<T[]> {
  const data = await request<{ list: T[] }>(`/api/v2/tables/${tableId}/records`, {
    query: { where: opts.where, sort: opts.sort, limit: opts.limit ?? 200 },
  });
  return data.list;
}

export async function getRecord<T>(tableId: string, id: number | string): Promise<T> {
  return request<T>(`/api/v2/tables/${tableId}/records/${id}`);
}

export async function createRecord<T extends { Id: number }>(
  tableId: string,
  fields: Record<string, unknown>
): Promise<T> {
  return request<T>(`/api/v2/tables/${tableId}/records`, {
    method: "POST",
    body: JSON.stringify(fields),
  });
}

export async function createRecords<T extends { Id: number }>(
  tableId: string,
  rows: Record<string, unknown>[]
): Promise<T[]> {
  return request<T[]>(`/api/v2/tables/${tableId}/records`, {
    method: "POST",
    body: JSON.stringify(rows),
  });
}

export async function updateRecord<T>(
  tableId: string,
  id: number,
  fields: Record<string, unknown>
): Promise<T> {
  return request<T>(`/api/v2/tables/${tableId}/records`, {
    method: "PATCH",
    body: JSON.stringify({ Id: id, ...fields }),
  });
}

export async function deleteRecord(tableId: string, id: number): Promise<void> {
  await request(`/api/v2/tables/${tableId}/records`, {
    method: "DELETE",
    body: JSON.stringify({ Id: id }),
  });
}

/** Escapes a value for use inside a NocoDB `where` filter expression. */
export function whereEq(field: string, value: string | number): string {
  return `(${field},eq,${value})`;
}
