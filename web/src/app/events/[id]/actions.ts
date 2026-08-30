"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/access";
import { addEventWine, addEventPhoto, addReview, ReviewError } from "@/lib/data/eventContent";
import { uploadFile } from "@/lib/nocodb";

async function requireApprovedMember() {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isApproved) {
    throw new Error("You need to be an approved member to do that.");
  }
  return viewer;
}

export async function addEventWineAction(eventId: number, formData: FormData) {
  const viewer = await requireApprovedMember();
  const wineName = String(formData.get("wineName") ?? "").trim();
  if (!wineName) throw new Error("Wine name is required.");
  const vintage = String(formData.get("vintage") ?? "").trim() || undefined;
  const description = String(formData.get("description") ?? "").trim() || undefined;

  await addEventWine(eventId, wineName, vintage, description, viewer.email);
  revalidatePath(`/events/${eventId}`);
}

export type ReviewState = { error?: string; success?: boolean };

export async function addReviewAction(
  eventId: number,
  eventWineId: number,
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isApproved) {
    return { error: "You need to be an approved member to score a wine." };
  }
  const score = Number(formData.get("score") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim() || undefined;
  try {
    await addReview(eventWineId, viewer.email, score, comment);
  } catch (err) {
    if (err instanceof ReviewError) return { error: err.message };
    throw err;
  }
  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function addEventPhotoAction(eventId: number, formData: FormData) {
  const viewer = await requireApprovedMember();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a photo to upload.");
  }
  const caption = String(formData.get("caption") ?? "").trim() || undefined;
  const attachment = await uploadFile(file);
  await addEventPhoto(eventId, viewer.email, attachment, caption);
  revalidatePath(`/events/${eventId}`);
}
