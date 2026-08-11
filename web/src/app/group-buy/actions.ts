"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/access";
import {
  ClaimError,
  claimWine,
  createWine,
  createWinesBulk,
  requestClaimRemoval,
  type NewWineInput,
} from "@/lib/data/wines";

export type ClaimState = { error?: string; success?: boolean };

export async function claimWineAction(
  wineId: number,
  _prevState: ClaimState,
  formData: FormData
): Promise<ClaimState> {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isApproved) {
    return { error: "You need to be an approved member to claim a bottle." };
  }
  const quantity = Number(formData.get("quantity") ?? 1);
  try {
    await claimWine(wineId, viewer.email, quantity);
  } catch (err) {
    if (err instanceof ClaimError) return { error: err.message };
    throw err;
  }
  revalidatePath("/group-buy");
  return { success: true };
}

export async function requestClaimRemovalAction(wineId: number) {
  const viewer = await getViewer();
  if (viewer.status !== "member") {
    throw new Error("You need to be signed in to do that.");
  }
  await requestClaimRemoval(wineId, viewer.email);
  revalidatePath("/group-buy");
}

export async function createWineAction(formData: FormData) {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isApproved) {
    throw new Error("You need to be an approved member to post a wine.");
  }

  const wineName = String(formData.get("wineName") ?? "").trim();
  const quantityAvailable = Number(formData.get("quantityAvailable") ?? 0);
  if (!wineName || quantityAvailable < 1) {
    throw new Error("Wine name and a positive quantity are required.");
  }

  await createWine({
    wineName,
    vintage: String(formData.get("vintage") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim() || undefined,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || undefined,
    originalPrice: numberOrUndefined(formData.get("originalPrice")),
    discountedPrice: numberOrUndefined(formData.get("discountedPrice")),
    quantityAvailable,
    postedByEmail: viewer.email,
    postedByRole: viewer.isAdmin ? "admin" : "member",
  });

  revalidatePath("/group-buy");
  redirect("/group-buy");
}

export async function bulkImportWinesAction(formData: FormData) {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isAdmin) {
    throw new Error("Only admins can bulk import.");
  }

  const raw = String(formData.get("json") ?? "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("That's not valid JSON.");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Expected a JSON array of wine objects.");
  }

  const inputs: NewWineInput[] = parsed.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      wineName: String(r.wineName ?? r.name ?? ""),
      vintage: r.vintage ? String(r.vintage) : undefined,
      description: r.description ? String(r.description) : undefined,
      imageUrl: r.imageUrl ? String(r.imageUrl) : undefined,
      originalPrice: r.originalPrice != null ? Number(r.originalPrice) : undefined,
      discountedPrice:
        r.discountedPrice != null ? Number(r.discountedPrice) : undefined,
      quantityAvailable: Number(r.quantityAvailable ?? r.quantity ?? 0),
      postedByEmail: viewer.email,
      postedByRole: "admin",
    };
  });

  await createWinesBulk(inputs);
  revalidatePath("/group-buy");
  redirect("/group-buy");
}

function numberOrUndefined(value: FormDataEntryValue | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}
