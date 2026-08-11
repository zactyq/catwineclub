"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/access";
import { reviewApplication } from "@/lib/data/applications";
import { addAdmin, removeAdmin } from "@/lib/data/admins";
import { dismissRemovalRequest, removeClaim } from "@/lib/data/wines";

async function requireAdmin() {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isAdmin) {
    throw new Error("Admins only.");
  }
  return viewer;
}

export async function approveApplicationAction(id: number) {
  const viewer = await requireAdmin();
  await reviewApplication(id, "approved", viewer.email);
  revalidatePath("/admin");
}

export async function rejectApplicationAction(id: number) {
  const viewer = await requireAdmin();
  await reviewApplication(id, "rejected", viewer.email);
  revalidatePath("/admin");
}

export async function addAdminAction(formData: FormData) {
  const viewer = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) throw new Error("Email is required.");
  await addAdmin(email, viewer.email);
  revalidatePath("/admin");
}

export async function removeAdminAction(id: number) {
  await requireAdmin();
  await removeAdmin(id);
  revalidatePath("/admin");
}

export async function approveRemovalAction(claimId: number) {
  await requireAdmin();
  await removeClaim(claimId);
  revalidatePath("/admin");
  revalidatePath("/group-buy");
}

export async function dismissRemovalAction(claimId: number) {
  await requireAdmin();
  await dismissRemovalRequest(claimId);
  revalidatePath("/admin");
  revalidatePath("/group-buy");
}
