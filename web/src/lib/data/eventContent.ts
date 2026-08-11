import "server-only";
import {
  TABLES,
  createRecord,
  listRecords,
  whereEq,
  type Attachment,
} from "@/lib/nocodb";
import type { EventRecord } from "@/lib/data/events";

export type EventWine = {
  Id: number;
  CreatedAt: string;
  EventId: number;
  WineName: string;
  Vintage: string | null;
  BroughtByEmail: string;
};

export type WineReview = {
  Id: number;
  CreatedAt: string;
  EventWineId: number;
  ReviewerEmail: string;
  Rating: number;
  Comment: string | null;
};

export type EventPhoto = {
  Id: number;
  CreatedAt: string;
  EventId: number;
  UploadedByEmail: string;
  Photo: Attachment[] | null;
  Caption: string | null;
};

export type EventWineWithReviews = EventWine & {
  reviews: WineReview[];
  averageRating: number | null;
  myReview: WineReview | null;
};

export async function listEventWines(
  eventId: number,
  viewerEmail?: string
): Promise<EventWineWithReviews[]> {
  const [wines, reviews] = await Promise.all([
    listRecords<EventWine>(TABLES.eventWines, {
      where: whereEq("EventId", eventId),
      sort: "-CreatedAt",
    }),
    listRecords<WineReview>(TABLES.wineReviews),
  ]);
  const reviewsByWine = new Map<number, WineReview[]>();
  for (const review of reviews) {
    const list = reviewsByWine.get(review.EventWineId) ?? [];
    list.push(review);
    reviewsByWine.set(review.EventWineId, list);
  }
  return wines.map((wine) => {
    const wineReviews = reviewsByWine.get(wine.Id) ?? [];
    const averageRating =
      wineReviews.length > 0
        ? wineReviews.reduce((sum, r) => sum + r.Rating, 0) / wineReviews.length
        : null;
    const myReview = viewerEmail
      ? wineReviews.find((r) => r.ReviewerEmail.toLowerCase() === viewerEmail.toLowerCase()) ??
        null
      : null;
    return { ...wine, reviews: wineReviews, averageRating, myReview };
  });
}

export async function addEventWine(
  eventId: number,
  wineName: string,
  vintage: string | undefined,
  broughtByEmail: string
): Promise<EventWine> {
  return createRecord<EventWine>(TABLES.eventWines, {
    EventId: eventId,
    WineName: wineName,
    Vintage: vintage ?? null,
    BroughtByEmail: broughtByEmail,
  });
}

export class ReviewError extends Error {}

export async function addReview(
  eventWineId: number,
  reviewerEmail: string,
  rating: number,
  comment: string | undefined
): Promise<WineReview> {
  if (rating < 1 || rating > 5) {
    throw new ReviewError("Rating must be between 1 and 5.");
  }
  const existing = await listRecords<WineReview>(TABLES.wineReviews, {
    where: whereEq("EventWineId", eventWineId),
  });
  if (existing.some((r) => r.ReviewerEmail.toLowerCase() === reviewerEmail.toLowerCase())) {
    throw new ReviewError("You've already reviewed this wine.");
  }
  return createRecord<WineReview>(TABLES.wineReviews, {
    EventWineId: eventWineId,
    ReviewerEmail: reviewerEmail,
    Rating: rating,
    Comment: comment ?? null,
  });
}

export async function listEventPhotos(eventId: number): Promise<EventPhoto[]> {
  return listRecords<EventPhoto>(TABLES.eventPhotos, {
    where: whereEq("EventId", eventId),
    sort: "-CreatedAt",
  });
}

export async function addEventPhoto(
  eventId: number,
  uploadedByEmail: string,
  photo: Attachment,
  caption: string | undefined
): Promise<EventPhoto> {
  return createRecord<EventPhoto>(TABLES.eventPhotos, {
    EventId: eventId,
    UploadedByEmail: uploadedByEmail,
    Photo: [photo],
    Caption: caption ?? null,
  });
}

export type MyReview = WineReview & { wineName: string; eventId: number; eventTitle: string };

export async function listReviewsForMember(reviewerEmail: string): Promise<MyReview[]> {
  const [reviews, wines, events] = await Promise.all([
    listRecords<WineReview>(TABLES.wineReviews, {
      where: whereEq("ReviewerEmail", reviewerEmail),
      sort: "-CreatedAt",
    }),
    listRecords<EventWine>(TABLES.eventWines),
    listRecords<EventRecord>(TABLES.events),
  ]);
  const winesById = new Map(wines.map((w) => [w.Id, w]));
  const eventsById = new Map(events.map((e) => [e.Id, e]));
  return reviews.map((r) => {
    const wine = winesById.get(r.EventWineId);
    const event = wine ? eventsById.get(wine.EventId) : undefined;
    return {
      ...r,
      wineName: wine?.WineName ?? "Unknown wine",
      eventId: wine?.EventId ?? 0,
      eventTitle: event?.Title ?? "Unknown event",
    };
  });
}

export type MyPhoto = EventPhoto & { eventTitle: string };

export async function listPhotosForMember(uploadedByEmail: string): Promise<MyPhoto[]> {
  const [photos, events] = await Promise.all([
    listRecords<EventPhoto>(TABLES.eventPhotos, {
      where: whereEq("UploadedByEmail", uploadedByEmail),
      sort: "-CreatedAt",
    }),
    listRecords<EventRecord>(TABLES.events),
  ]);
  const eventsById = new Map(events.map((e) => [e.Id, e]));
  return photos.map((p) => ({
    ...p,
    eventTitle: eventsById.get(p.EventId)?.Title ?? "Unknown event",
  }));
}
