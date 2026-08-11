import "server-only";
import {
  TABLES,
  createRecord,
  createRecords,
  listRecords,
  updateRecord,
  whereEq,
} from "@/lib/nocodb";

export type WineListing = {
  Id: number;
  CreatedAt: string;
  WineName: string;
  Vintage: string | null;
  Description: string | null;
  ImageUrl: string | null;
  OriginalPrice: number | null;
  DiscountedPrice: number | null;
  QuantityAvailable: number;
  PostedByEmail: string | null;
  PostedByRole: "admin" | "member" | null;
  Status: "open" | "closed";
};

export type WineClaim = {
  Id: number;
  CreatedAt: string;
  WineListingId: number;
  MemberEmail: string;
  Quantity: number;
};

export type WineWithAvailability = WineListing & {
  quantityClaimed: number;
  quantityRemaining: number;
};

export type NewWineInput = {
  wineName: string;
  vintage?: string;
  description?: string;
  imageUrl?: string;
  originalPrice?: number;
  discountedPrice?: number;
  quantityAvailable: number;
  postedByEmail: string;
  postedByRole: "admin" | "member";
};

function toFields(input: NewWineInput) {
  return {
    WineName: input.wineName,
    Vintage: input.vintage ?? null,
    Description: input.description ?? null,
    ImageUrl: input.imageUrl ?? null,
    OriginalPrice: input.originalPrice ?? null,
    DiscountedPrice: input.discountedPrice ?? null,
    QuantityAvailable: input.quantityAvailable,
    PostedByEmail: input.postedByEmail,
    PostedByRole: input.postedByRole,
    Status: "open",
  };
}

async function claimsByWineId(): Promise<Map<number, WineClaim[]>> {
  const claims = await listRecords<WineClaim>(TABLES.wineClaims);
  const map = new Map<number, WineClaim[]>();
  for (const claim of claims) {
    const list = map.get(claim.WineListingId) ?? [];
    list.push(claim);
    map.set(claim.WineListingId, list);
  }
  return map;
}

export async function listWines(): Promise<WineWithAvailability[]> {
  const [wines, claimsMap] = await Promise.all([
    listRecords<WineListing>(TABLES.wineListings, { sort: "-CreatedAt" }),
    claimsByWineId(),
  ]);
  return wines.map((wine) => withAvailability(wine, claimsMap.get(wine.Id) ?? []));
}

export async function getWine(id: number): Promise<WineWithAvailability | null> {
  const wines = await listRecords<WineListing>(TABLES.wineListings, {
    where: whereEq("Id", id),
  });
  const wine = wines[0];
  if (!wine) return null;
  const claims = await listRecords<WineClaim>(TABLES.wineClaims, {
    where: whereEq("WineListingId", id),
  });
  return withAvailability(wine, claims);
}

function withAvailability(wine: WineListing, claims: WineClaim[]): WineWithAvailability {
  const quantityClaimed = claims.reduce((sum, c) => sum + c.Quantity, 0);
  return {
    ...wine,
    quantityClaimed,
    quantityRemaining: Math.max(0, wine.QuantityAvailable - quantityClaimed),
  };
}

export async function createWine(input: NewWineInput): Promise<WineListing> {
  return createRecord<WineListing>(TABLES.wineListings, toFields(input));
}

export async function createWinesBulk(inputs: NewWineInput[]): Promise<WineListing[]> {
  return createRecords<WineListing>(TABLES.wineListings, inputs.map(toFields));
}

export async function closeWine(id: number): Promise<void> {
  await updateRecord(TABLES.wineListings, id, { Status: "closed" });
}

export class ClaimError extends Error {}

/**
 * Claims `quantity` bottles for `memberEmail`, re-checking availability first.
 * NocoDB's REST API has no transactions, so back-to-back claims can still
 * race past the cap under concurrent load — acceptable for a small club.
 */
export async function claimWine(
  wineId: number,
  memberEmail: string,
  quantity: number
): Promise<WineClaim> {
  const wine = await getWine(wineId);
  if (!wine) throw new ClaimError("This wine listing no longer exists.");
  if (wine.Status !== "open") throw new ClaimError("This group buy is closed.");
  if (quantity < 1) throw new ClaimError("Quantity must be at least 1.");
  if (quantity > wine.quantityRemaining) {
    throw new ClaimError(
      `Only ${wine.quantityRemaining} bottle(s) left — someone may have just claimed the rest.`
    );
  }
  return createRecord<WineClaim>(TABLES.wineClaims, {
    WineListingId: wineId,
    MemberEmail: memberEmail,
    Quantity: quantity,
  });
}

export async function listClaimsForWine(wineId: number): Promise<WineClaim[]> {
  return listRecords<WineClaim>(TABLES.wineClaims, {
    where: whereEq("WineListingId", wineId),
  });
}
