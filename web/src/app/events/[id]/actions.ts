"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/access";
import { getEvent } from "@/lib/data/events";
import { addEventWine, addEventPhoto, addReview, ReviewError } from "@/lib/data/eventContent";
import { uploadFile } from "@/lib/nocodb";

async function requireApprovedPastEventViewer(eventId: number) {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isApproved) {
    throw new Error("You need to be an approved member to do that.");
  }
  const event = await getEvent(eventId);
  if (!event) throw new Error("This event no longer exists.");
  if (new Date(event.EventDate) > new Date()) {
    throw new Error("This opens up once the event has happened.");
  }
  return viewer;
}

export async function addEventWineAction(eventId: number, formData: FormData) {
  const viewer = await requireApprovedPastEventViewer(eventId);
  const wineName = String(formData.get("wineName") ?? "").trim();
  if (!wineName) throw new Error("Wine name is required.");
  const vintage = String(formData.get("vintage") ?? "").trim() || undefined;

  await addEventWine(eventId, wineName, vintage, viewer.email);
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
    return { error: "You need to be an approved member to review." };
  }
  const rating = Number(formData.get("rating") ?? 0);
  const comment = String(formData.get("comment") ?? "").trim() || undefined;
  try {
    await addReview(eventWineId, viewer.email, rating, comment);
  } catch (err) {
    if (err instanceof ReviewError) return { error: err.message };
    throw err;
  }
  revalidatePath(`/events/${eventId}`);
  return { success: true };
}

export async function addEventPhotoAction(eventId: number, formData: FormData) {
  const viewer = await requireApprovedPastEventViewer(eventId);
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a photo to upload.");
  }
  const caption = String(formData.get("caption") ?? "").trim() || undefined;
  const attachment = await uploadFile(file);
  await addEventPhoto(eventId, viewer.email, attachment, caption);
  revalidatePath(`/events/${eventId}`);
}
