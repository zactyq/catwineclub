"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SignUpForm from "@/components/SignUpForm";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export type CalendarEvent = {
  Id: number;
  Title: string;
  Description: string | null;
  EventDate: string;
  Location: string | null;
  Address: string | null;
  Capacity: number;
  spotsRemaining: number;
  mySignup: { plusOnes: number } | null;
  imageUrl: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function googleMapsUrl(location: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function EventsCalendarAndList({
  events,
  canSignUp,
  isMember,
}: {
  events: CalendarEvent[];
  canSignUp: boolean;
  isMember: boolean;
}) {
  const today = useMemo(() => new Date(), []);
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const selectedKey = selectedDate ? dateKey(selectedDate) : null;

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = dateKey(new Date(event.EventDate));
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const visibleEvents = selectedKey
    ? events.filter((e) => dateKey(new Date(e.EventDate)) === selectedKey)
    : events;

  const cells = useMemo(() => {
    const firstWeekday = viewMonth.getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const result: (Date | null)[] = Array(firstWeekday).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      result.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
    }
    return result;
  }, [viewMonth]);

  return (
    <div className="flex flex-col gap-10">
      {/* Calendar */}
      <div className="mx-auto w-full max-w-md rounded-cards bg-white p-6 shadow-subtle">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="rounded-buttons px-2 py-1 text-caption text-heading-charcoal transition-opacity hover:opacity-60"
          >
            ‹
          </button>
          <span className="text-caption font-medium text-heading-charcoal">
            {viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
            aria-label="Next month"
            className="rounded-buttons px-2 py-1 text-caption text-heading-charcoal transition-opacity hover:opacity-60"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label, i) => (
            <div key={i} className="text-center text-micro text-muted-gray">
              {label}
            </div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const key = dateKey(date);
            const dayEvents = eventsByDay.get(key) ?? [];
            const hasEvents = dayEvents.length > 0;
            const isToday = key === dateKey(today);
            const isSelected = key === selectedKey;
            return (
              <button
                key={i}
                type="button"
                disabled={!hasEvents}
                onClick={() => setSelectedDate(isSelected ? null : date)}
                className={`flex flex-col items-center gap-0.5 rounded-cards py-1.5 text-caption transition-opacity ${
                  isSelected
                    ? "bg-ink-black text-cream-canvas"
                    : hasEvents
                      ? "bg-honey/30 text-heading-charcoal hover:opacity-70"
                      : "text-muted-gray"
                } ${isToday && !isSelected ? "ring-1 ring-inset ring-ember-orange" : ""}`}
              >
                {date.getDate()}
                {hasEvents && (
                  <span
                    className={`h-1 w-1 rounded-full ${isSelected ? "bg-cream-canvas" : "bg-ember-orange"}`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <button
            type="button"
            onClick={() => setSelectedDate(null)}
            className="mt-4 w-full text-center text-caption text-ember-orange underline underline-offset-2"
          >
            Showing {formatDayLabel(selectedDate)} — clear
          </button>
        )}
      </div>

      {/* List */}
      {visibleEvents.length === 0 ? (
        <p className="text-center text-body text-body-brown">
          {selectedKey ? "Nothing on this day." : "Nothing on the calendar yet — check back soon."}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event) => (
            <div
              key={event.Id}
              className="flex flex-col gap-3 rounded-cards bg-white p-6 shadow-subtle"
            >
              {event.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- self-hosted NocoDB, not on Next's image optimizer allowlist
                <img
                  src={event.imageUrl}
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
                        href={googleMapsUrl(event.Address || event.Location)}
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
                ) : isMember ? (
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
    </div>
  );
}
