import { redirect } from "next/navigation";
import { getViewer } from "@/lib/access";
import CompressedImageInput from "@/components/CompressedImageInput";
import { bulkImportEventsAction, createEventAction } from "../actions";

export default async function NewEventPage() {
  const viewer = await getViewer();
  if (viewer.status !== "member" || !viewer.isAdmin) {
    redirect("/events");
  }

  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center gap-12 px-4 py-16 sm:px-6">
      <div className="flex max-w-lg flex-col items-center gap-3 text-center">
        <h1 className="font-display text-heading-lg text-heading-charcoal">
          Create an Event
        </h1>
        <p className="text-body text-body-brown">
          Members will be able to sign up on a first-come, first-served basis.
        </p>
      </div>

      <form
        action={createEventAction}
        className="flex w-full max-w-lg flex-col gap-5 rounded-cards bg-white p-8 shadow-subtle"
      >
        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">Title</span>
          <input
            name="title"
            type="text"
            required
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">Description</span>
          <textarea
            name="description"
            rows={3}
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">Date &amp; Time</span>
          <input
            name="eventDate"
            type="datetime-local"
            required
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">
            Location <span className="text-muted-gray">(display name)</span>
          </span>
          <input
            name="location"
            type="text"
            placeholder="e.g. Isaac's Place"
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">
            Address <span className="text-muted-gray">(for the map link — optional)</span>
          </span>
          <input
            name="address"
            type="text"
            placeholder="e.g. 123 Main St, Singapore"
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">
            Image <span className="text-muted-gray">(optional)</span>
          </span>
          <CompressedImageInput name="image" />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">
            Capacity (total headcount, including plus-ones)
          </span>
          <input
            name="capacity"
            type="number"
            min={1}
            required
            defaultValue={10}
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <button
          type="submit"
          className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
        >
          Create Event
        </button>
      </form>

      <div className="flex w-full max-w-lg flex-col gap-4 rounded-cards bg-stone-surface p-8">
        <div>
          <h2 className="text-subheading font-medium text-heading-charcoal">
            Bulk Import
          </h2>
          <p className="text-caption text-body-brown">
            Paste a JSON array of events — ask your favourite AI to format it
            for you. Fields: title, description, eventDate (ISO), location,
            address, capacity.
          </p>
        </div>
        <form action={bulkImportEventsAction} className="flex flex-col gap-3">
          <textarea
            name="json"
            rows={8}
            placeholder='[{"title":"Spring Tasting","eventDate":"2026-09-01T19:00:00","location":"The Cellar","address":"123 Main St, Singapore","capacity":20}]'
            className="rounded-cards border border-stone-border bg-white px-4 py-2.5 font-mono text-micro text-heading-charcoal outline-none focus:border-ink-black"
          />
          <button
            type="submit"
            className="w-fit rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
          >
            Import
          </button>
        </form>
      </div>
    </section>
  );
}
