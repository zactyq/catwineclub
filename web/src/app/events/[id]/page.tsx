import Link from "next/link";
import { notFound } from "next/navigation";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import ReviewForm from "@/components/ReviewForm";
import { getViewer } from "@/lib/access";
import { getEvent } from "@/lib/data/events";
import { listEventWines, listEventPhotos } from "@/lib/data/eventContent";
import { attachmentUrl } from "@/lib/nocodb";
import { addEventWineAction, addEventPhotoAction } from "./actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function googleMapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventId = Number(id);
  const viewer = await getViewer();
  const viewerEmail = viewer.status === "member" ? viewer.email : null;

  const event = await getEvent(eventId, viewerEmail ?? undefined);
  if (!event) notFound();

  const isPast = new Date(event.EventDate) < new Date();
  const canParticipate = isPast && viewer.status === "member" && viewer.isApproved;

  const [wines, photos] = isPast
    ? await Promise.all([
        listEventWines(eventId, viewerEmail ?? undefined),
        listEventPhotos(eventId),
      ])
    : [[], []];

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-12 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-4">
        <Link href="/events" className="w-fit text-caption text-ember-orange underline underline-offset-2">
          ← All events
        </Link>
        {event.Image?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element -- self-hosted NocoDB
          <img
            src={attachmentUrl(event.Image[0])}
            alt={event.Title}
            className="aspect-[16/9] w-full rounded-illustration object-cover"
          />
        ) : (
          <ImagePlaceholder label={event.Title} className="aspect-[16/9] w-full" />
        )}
        <div>
          <h1 className="font-display text-heading-lg text-heading-charcoal">{event.Title}</h1>
          <p className="text-caption text-muted-gray">
            {formatDate(event.EventDate)}
            {event.Location && (
              <>
                {" · "}
                <a
                  href={googleMapsUrl(event.Location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link-blue underline underline-offset-2"
                >
                  {event.Location}
                </a>
              </>
            )}
          </p>
        </div>
        {event.Description && <p className="text-body text-body-brown">{event.Description}</p>}
      </div>

      {!isPast ? (
        <p className="text-center text-body text-body-brown">
          Wines, ratings, and photos open up here once the event has happened.
        </p>
      ) : (
        <>
          {/* Wines from this tasting */}
          <div className="flex flex-col gap-4">
            <h2 className="text-subheading font-medium text-heading-charcoal">
              Wines From This Tasting
            </h2>

            {wines.length === 0 ? (
              <p className="text-caption text-body-brown">Nobody&apos;s logged a wine yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {wines.map((wine) => (
                  <div
                    key={wine.Id}
                    className="flex flex-col gap-3 rounded-cards bg-white p-6 shadow-subtle"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-body font-medium text-heading-charcoal">
                          {wine.WineName}
                          {wine.Vintage ? ` · ${wine.Vintage}` : ""}
                        </p>
                        <p className="text-micro text-muted-gray">
                          Brought by {wine.BroughtByEmail}
                        </p>
                      </div>
                      {wine.averageRating != null && (
                        <span className="shrink-0 rounded-badges bg-honey/30 px-2 py-1 text-micro text-heading-charcoal">
                          {"★".repeat(Math.round(wine.averageRating))} (
                          {wine.reviews.length})
                        </span>
                      )}
                    </div>

                    {wine.reviews.length > 0 && (
                      <div className="flex flex-col gap-1.5 border-t border-stone-surface pt-3">
                        {wine.reviews.map((r) => (
                          <p key={r.Id} className="text-caption text-body-brown">
                            <span className="text-heading-charcoal">{"★".repeat(r.Rating)}</span>{" "}
                            {r.ReviewerEmail}
                            {r.Comment ? ` — ${r.Comment}` : ""}
                          </p>
                        ))}
                      </div>
                    )}

                    {canParticipate &&
                      !wine.myReview &&
                      wine.BroughtByEmail.toLowerCase() !== viewerEmail?.toLowerCase() && (
                        <ReviewForm eventId={eventId} eventWineId={wine.Id} />
                      )}
                  </div>
                ))}
              </div>
            )}

            {canParticipate && (
              <form
                action={addEventWineAction.bind(null, eventId)}
                className="flex flex-col gap-3 rounded-cards bg-stone-surface p-6 sm:flex-row sm:items-end"
              >
                <label className="flex flex-1 flex-col gap-2">
                  <span className="text-caption font-medium text-heading-charcoal">
                    I brought...
                  </span>
                  <input
                    name="wineName"
                    type="text"
                    required
                    placeholder="Wine name"
                    className="rounded-cards border border-stone-border bg-white px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-caption font-medium text-heading-charcoal">Vintage</span>
                  <input
                    name="vintage"
                    type="text"
                    placeholder="Optional"
                    className="w-28 rounded-cards border border-stone-border bg-white px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
                  />
                </label>
                <button
                  type="submit"
                  className="shrink-0 rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
                >
                  Add Wine
                </button>
              </form>
            )}
          </div>

          {/* Photos */}
          <div className="flex flex-col gap-4">
            <h2 className="text-subheading font-medium text-heading-charcoal">Photos</h2>

            {photos.length === 0 ? (
              <p className="text-caption text-body-brown">No photos yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((photo) =>
                  photo.Photo?.[0] ? (
                    <figure key={photo.Id} className="flex flex-col gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element -- self-hosted NocoDB */}
                      <img
                        src={attachmentUrl(photo.Photo[0])}
                        alt={photo.Caption ?? "Event photo"}
                        className="aspect-square w-full rounded-cards object-cover"
                      />
                      {photo.Caption && (
                        <figcaption className="text-micro text-muted-gray">
                          {photo.Caption}
                        </figcaption>
                      )}
                    </figure>
                  ) : null
                )}
              </div>
            )}

            {canParticipate && (
              <form
                action={addEventPhotoAction.bind(null, eventId)}
                className="flex flex-col gap-3 rounded-cards bg-stone-surface p-6 sm:flex-row sm:items-end"
              >
                <label className="flex flex-col gap-2">
                  <span className="text-caption font-medium text-heading-charcoal">Photo</span>
                  <input
                    name="photo"
                    type="file"
                    accept="image/*"
                    required
                    className="rounded-cards border border-stone-border bg-white px-4 py-2.5 text-caption text-heading-charcoal outline-none file:mr-3 file:rounded-buttons file:border-0 file:bg-ink-black file:px-3 file:py-1.5 file:text-micro file:font-semibold file:text-cream-canvas"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-2">
                  <span className="text-caption font-medium text-heading-charcoal">
                    Caption <span className="text-muted-gray">(optional)</span>
                  </span>
                  <input
                    name="caption"
                    type="text"
                    className="rounded-cards border border-stone-border bg-white px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
                  />
                </label>
                <button
                  type="submit"
                  className="shrink-0 rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
                >
                  Upload
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </section>
  );
}
