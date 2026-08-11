import { submitApplication } from "./actions";

export default function ApplyPage() {
  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center gap-8 px-4 py-20 sm:px-6">
      <div className="flex max-w-lg flex-col items-center gap-3 text-center">
        <h1 className="font-display text-heading-lg text-heading-charcoal">
          Apply to Join
        </h1>
        <p className="text-body text-body-brown">
          Tell us a bit about yourself. An admin will review your application
          and let you know once you&apos;re approved.
        </p>
      </div>

      <form
        action={submitApplication}
        className="flex w-full max-w-lg flex-col gap-5 rounded-cards bg-white p-8 shadow-subtle"
      >
        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">
            Name
          </span>
          <input
            name="name"
            type="text"
            required
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">
            Email
          </span>
          <input
            name="email"
            type="email"
            required
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">
            Phone <span className="text-muted-gray">(optional)</span>
          </span>
          <input
            name="phone"
            type="tel"
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">
            How did you hear about us?{" "}
            <span className="text-muted-gray">(optional)</span>
          </span>
          <input
            name="howHeard"
            type="text"
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption font-medium text-heading-charcoal">
            Anything else? <span className="text-muted-gray">(optional)</span>
          </span>
          <textarea
            name="message"
            rows={3}
            className="rounded-cards border border-stone-border bg-cream-canvas px-4 py-2.5 text-body text-heading-charcoal outline-none focus:border-ink-black"
          />
        </label>

        <button
          type="submit"
          className="rounded-buttons bg-ink-black px-3.5 py-2.5 text-caption font-semibold text-cream-canvas transition-opacity hover:opacity-90"
        >
          Submit Application
        </button>
      </form>
    </section>
  );
}
