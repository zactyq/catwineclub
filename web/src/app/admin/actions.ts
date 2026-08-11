"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/access";
import { reviewApplication } from "@/lib/data/applications";

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
