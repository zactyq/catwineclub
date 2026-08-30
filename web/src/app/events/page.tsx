import Link from "next/link";
import EventsCalendarAndList from "@/components/EventsCalendarAndList";
import { getViewer } from "@/lib/access";
import { listEvents } from "@/lib/data/events";
import { attachmentUrl } from "@/lib/nocodb";

export default async function EventsPage() {
  const viewer = await getViewer();
  const events = await listEvents(viewer.status === "member" ? viewer.email : undefined);
  const canSignUp = viewer.status === "member" && viewer.isApproved;

  const eventsForCalendar = events.map((event) => ({
    Id: event.Id,
    Title: event.Title,
    Description: event.Description,
    EventDate: event.EventDate,
    Location: event.Location,
    Address: event.Address,
    Capacity: event.Capacity,
    spotsRemaining: event.spotsRemaining,
    mySignup: event.mySignup,
    imageUrl: event.Image?.[0] ? attachmentUrl(event.Image[0]) : null,
  }));

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

      <EventsCalendarAndList
        events={eventsForCalendar}
        canSignUp={canSignUp}
        isMember={viewer.status === "member"}
      />
    </section>
  );
}
