"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/access";
import { uploadFile } from "@/lib/nocodb";
import {
  SignupError,
  createEvent,
  createEventsBulk,
  signUpForEvent,
  type NewEventInput,
} from "@/lib/data/events";

export type SignupState = { error?: string; success?: boolean };

export async function signUpForEventAction(
  eventId: number,
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isApproved) {
    return { error: "You need to be an approved member to sign up." };
  }
  const plusOnes = Number(formData.get("plusOnes") ?? 0);
  try {
    await signUpForEvent(eventId, viewer.email, plusOnes);
  } catch (err) {
    if (err instanceof SignupError) return { error: err.message };
    throw err;
  }
  revalidatePath("/events");
  return { success: true };
}

export async function createEventAction(formData: FormData) {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isAdmin) {
    throw new Error("Only admins can create events.");
  }

  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const capacity = Number(formData.get("capacity") ?? 0);
  if (!title || !eventDate || capacity < 1) {
    throw new Error("Title, date, and a positive capacity are required.");
  }

  const imageFile = formData.get("image");
  const image =
    imageFile instanceof File && imageFile.size > 0
      ? await uploadFile(imageFile)
      : undefined;

  await createEvent({
    title,
    eventDate: new Date(eventDate).toISOString(),
    description: String(formData.get("description") ?? "").trim() || undefined,
    location: String(formData.get("location") ?? "").trim() || undefined,
    address: String(formData.get("address") ?? "").trim() || undefined,
    capacity,
    createdByEmail: viewer.email,
    image,
  });

  revalidatePath("/events");
  redirect("/events");
}

export async function bulkImportEventsAction(formData: FormData) {
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
    throw new Error("Expected a JSON array of event objects.");
  }

  const inputs: NewEventInput[] = parsed.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      title: String(r.title ?? r.eventName ?? ""),
      description: r.description ? String(r.description) : undefined,
      eventDate: new Date(String(r.eventDate ?? r.date)).toISOString(),
      location: r.location ? String(r.location) : undefined,
      address: r.address ? String(r.address) : undefined,
      capacity: Number(r.capacity ?? 0),
      createdByEmail: viewer.email,
    };
  });

  await createEventsBulk(inputs);
  revalidatePath("/events");
  redirect("/events");
}
