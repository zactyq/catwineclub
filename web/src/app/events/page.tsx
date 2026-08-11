import Link from "next/link";
import SignUpForm from "@/components/SignUpForm";
import { getViewer } from "@/lib/access";
import { listEvents } from "@/lib/data/events";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function EventsPage() {
  const [events, viewer] = await Promise.all([listEvents(), getViewer()]);
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
              <div>
                <h3 className="text-heading font-medium text-heading-charcoal">
                  {event.Title}
                </h3>
                <p className="text-caption text-muted-gray">
                  {formatDate(event.EventDate)}
                  {event.Location ? ` · ${event.Location}` : ""}
                </p>
              </div>
              {event.Description && (
                <p className="text-caption text-body-brown">{event.Description}</p>
              )}
              <p className="text-micro text-muted-gray">
                {event.spotsRemaining} of {event.Capacity} spots left
              </p>

              {event.spotsRemaining > 0 ? (
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
