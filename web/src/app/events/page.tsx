import Link from "next/link";
import SignUpForm from "@/components/SignUpForm";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { getViewer } from "@/lib/access";
import { listEvents } from "@/lib/data/events";
import { attachmentUrl } from "@/lib/nocodb";

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

export default async function EventsPage() {
  const viewer = await getViewer();
  const events = await listEvents(viewer.status === "member" ? viewer.email : undefined);
  const canSignUp = viewer.status === "member" && viewer.isApproved;

  return (
    <section className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-16 sm:px-6">
      <div className="mb-10 flex flex-col items-center gap-3 text-center">
        <h1 className="font-display text-heading-lg text-heading-charcoal">
          Events
        </h1>
        <p className="max-w-md text-body text-body-brown">
          Sign up for yourself and your plus-ones — spots are first come,
          first served.
        </p>
        {viewer.status === "member" && viewer.isAdmin && (
          <Link
            href="/events/new"
            className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
          >
            Create an Event
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-center text-body text-body-brown">
          Nothing on the calendar yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.Id}
              className="flex flex-col gap-3 rounded-cards bg-white p-6 shadow-subtle"
            >
              {event.Image?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element -- self-hosted NocoDB, not on Next's image optimizer allowlist
                <img
                  src={attachmentUrl(event.Image[0])}
                  alt={event.Title}
                  className="aspect-[4/3] w-full rounded-illustration object-cover"
                />
              ) : (
                <ImagePlaceholder label={event.Title} className="aspect-[4/3] w-full" />
              )}
              <div>
                <Link
                  href={`/events/${event.Id}`}
                  className="text-heading font-medium text-heading-charcoal hover:text-ember-orange"
                >
                  {event.Title}
                </Link>
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
              {event.Description && (
                <p className="text-caption text-body-brown">{event.Description}</p>
              )}
              <p className="text-micro text-muted-gray">
                {event.spotsRemaining} of {event.Capacity} spots left
              </p>

              {event.mySignup ? (
                <p className="text-caption font-medium text-grass-green">
                  You&apos;re signed up
                  {event.mySignup.plusOnes > 0
                    ? ` (+${event.mySignup.plusOnes} plus-one${event.mySignup.plusOnes === 1 ? "" : "s"})`
                    : ""}{" "}
                  🎉
                </p>
              ) : event.spotsRemaining > 0 ? (
                canSignUp ? (
                  <SignUpForm eventId={event.Id} spotsRemaining={event.spotsRemaining} />
                ) : viewer.status === "member" ? (
                  <p className="text-micro text-muted-gray">
                    Pending admin approval before you can sign up.
                  </p>
                ) : (
                  <Link
                    href="/login"
                    className="w-fit text-caption text-ember-orange underline underline-offset-2"
                  >
                    Sign in to sign up
                  </Link>
                )
              ) : (
                <p className="text-micro text-muted-gray">Full</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
